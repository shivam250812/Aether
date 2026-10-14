import path from 'node:path';
import { Actor, log } from 'apify';

import { openBrowser, createVisitor, AuthWallError, DEFAULT_SESSION_DIR } from './browser.js';
import { resolveCompany } from './companies.js';
import { collectPeople } from './people.js';
import { scrapeProfile } from './profile.js';
import { buildHrMatcher, DEFAULT_HR_KEYWORDS, DEFAULT_PEOPLE_SEARCH_TERMS } from './hr.js';
import { profileToRow, writeSheet } from './sheet.js';

await Actor.init();

const input = (await Actor.getInput()) ?? {};
// An empty list from the console form means "use the defaults", not "match
// nothing" - destructuring defaults only cover a missing field.
const orDefault = (list, fallback) => (Array.isArray(list) && list.length > 0 ? list : fallback);
const {
    companies = [],
    // The normal way in is the saved Chrome profile from `npm run login`. A
    // pasted li_at is only a fallback: LinkedIn revokes those quickly when they
    // turn up in a browser they weren't issued to (see browser.js).
    userDataDir = DEFAULT_SESSION_DIR,
    liAtCookie = process.env.LINKEDIN_LI_AT || null,
    hrKeywords: hrKeywordsInput,
    peopleSearchTerms: peopleSearchTermsInput,
    // true: take everyone on the People tab, ignoring the role keywords.
    allEmployees = false,
    // false: rows come straight from the People-tab cards (name, headline,
    // profile URL) without opening each profile - one page per ~dozen people
    // instead of one page per person.
    profileDetails = true,
    maxProfilesPerCompany = 25,
    // LinkedIn watches daily profile-view volume per account; this caps how
    // many profile pages the whole run opens, so a long company list can't
    // blow through it in one go. People-tab cards don't count against it.
    maxProfilesTotal = 150,
    minDelayMs = 4000,
    maxDelayMs = 10000,
    // A visible window is the least bot-like way to drive a logged-in session.
    headless = false,
    outputFile = 'hr-profiles.xlsx',
} = input;
// In all-employees mode a single unfiltered People-tab load replaces the
// keyword searches, and every card is kept.
const peopleSearchTerms = allEmployees ? [''] : orDefault(peopleSearchTermsInput, DEFAULT_PEOPLE_SEARCH_TERMS);
const isHr = allEmployees ? () => true : buildHrMatcher(orDefault(hrKeywordsInput, DEFAULT_HR_KEYWORDS));

if (!Array.isArray(companies) || companies.length === 0) {
    await Actor.fail('Input "companies" must be a non-empty array of LinkedIn company URLs or names.');
}

const outputPath = path.resolve(process.cwd(), outputFile);
const visit = createVisitor({ minDelayMs, maxDelayMs });
const { page, close } = await openBrowser({ userDataDir, headless, liAt: liAtCookie });

const rows = [];
const summary = [];
let profileViews = 0; // profile pages opened; what maxProfilesTotal limits
let fatal = null;

const viewBudgetLeft = () => maxProfilesTotal - profileViews;

async function saveSheet() {
    const buffer = await writeSheet(rows, outputPath);
    await Actor.setValue('OUTPUT_XLSX', buffer, {
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
}

async function addRow(company, profile, lists = {}) {
    const row = profileToRow(company, profile);
    rows.push(row);
    await Actor.pushData({ ...row, ...lists });
    return row;
}

/** Scrapes one company's people into `rows`; returns its summary entry. */
async function processCompany(raw) {
    const company = await resolveCompany(page, visit, raw);
    if (!company) {
        log.warning(`  Could not find a LinkedIn company page for "${raw}" - skipped.`);
        return { status: 'not found', profiles: 0 };
    }
    log.info(`  Resolved to ${company.name ?? company.slug} (${company.url})`);

    const budget = profileDetails ? Math.min(maxProfilesPerCompany, viewBudgetLeft()) : maxProfilesPerCompany;
    const people = await collectPeople(page, visit, company, { terms: peopleSearchTerms, max: budget, isHr, log });

    if (!profileDetails) {
        const scrapedAt = new Date().toISOString();
        for (const person of people) await addRow(company, { ...person, scrapedAt });
        log.info(`  ${people.length} profile(s) saved from the People tab.`);
        return { status: 'ok', profiles: people.length };
    }
    log.info(`  ${people.length} profile(s) to open.`);

    let scraped = 0;
    for (const person of people) {
        let profile = null;
        profileViews += 1;
        for (let attempt = 1; attempt <= 2 && !profile; attempt += 1) {
            try {
                profile = await scrapeProfile(page, visit, person.profileUrl);
            } catch (err) {
                if (err instanceof AuthWallError) throw err;
                log.warning(`  Attempt ${attempt} failed for ${person.profileUrl}: ${err.message.split('\n')[0]}`);
            }
        }
        if (!profile) continue;

        // The People-tab card is the fallback for anything the profile page
        // didn't yield.
        profile.name ||= person.name;
        profile.headline ||= person.headline;
        const row = await addRow(company, profile, { experienceList: profile.experience, educationList: profile.education });
        scraped += 1;
        log.info(`  ${scraped}/${people.length} ${row.name} - ${row.headline}`);
    }
    return { status: 'ok', profiles: scraped };
}

try {
    // Fail fast when not signed in, before touching any company page.
    await visit(page, 'https://www.linkedin.com/feed/');
    if (!/linkedin\.com\/feed/.test(page.url())) throw new AuthWallError(page.url());

    for (const [index, raw] of companies.entries()) {
        if (profileDetails && viewBudgetLeft() <= 0) {
            log.warning(`Reached maxProfilesTotal=${maxProfilesTotal}; skipping the remaining ${companies.length - index} company(ies).`);
            break;
        }
        log.info(`[${index + 1}/${companies.length}] ${raw}`);

        try {
            summary.push({ company: raw, ...(await processCompany(raw)) });
        } catch (err) {
            // Only a dead session ends the run; anything else costs just this company.
            if (err instanceof AuthWallError) throw err;
            log.warning(`  Failed on "${raw}": ${err.message.split('\n')[0]} - skipped.`);
            summary.push({ company: raw, status: 'error', profiles: 0 });
        }
        await saveSheet();
    }
} catch (err) {
    fatal = err;
} finally {
    await close().catch(() => {});
}

await saveSheet();
log.info(`Wrote ${rows.length} profile(s) to ${outputPath}`);
for (const s of summary) log.info(`  ${s.company}: ${s.status}, ${s.profiles} profile(s)`);

if (fatal) {
    await Actor.fail(`Stopped early: ${fatal.message} Partial results were saved to ${outputPath}.`);
} else {
    await Actor.exit();
}
