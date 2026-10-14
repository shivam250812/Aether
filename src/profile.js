import { pause } from './browser.js';

// A date range line like "Mar 2021 - Present · 3 yrs 7 mos" or "2015 - 2017".
const DATE_RE = /\b(19|20)\d{2}\b|\bPresent\b/;
const firstDate = (texts) => {
    const hit = texts.find((t) => DATE_RE.test(t));
    return hit ? hit.split(' · ')[0].trim() : '';
};

/**
 * One top-level Experience list item -> one or more roles. `texts` are the item's
 * own visible lines; `subs` the lines of each nested list item. LinkedIn nests
 * roles when someone held several at one company: the item's first line is then
 * the company, and each nested item with a date range is a role. Nested items
 * without dates are skills/description rows.
 */
export function parseExperienceItem({ texts, subs }) {
    const roles = subs.filter((s) => s.some((t) => DATE_RE.test(t)));
    if (roles.length > 0) {
        const company = texts[0] ?? '';
        return roles.map((s) => ({ title: s[0] ?? '', company, dates: firstDate(s) }));
    }
    if (texts.length === 0) return [];
    const second = texts[1] ?? '';
    return [
        {
            title: texts[0],
            company: DATE_RE.test(second) ? '' : second.split(' · ')[0].trim(),
            dates: firstDate(texts),
        },
    ];
}

export function parseEducationItem(texts) {
    const second = texts[1] ?? '';
    return {
        school: texts[0] ?? '',
        degree: DATE_RE.test(second) ? '' : second,
        dates: firstDate(texts),
    };
}

export function parseConnections(text) {
    return text?.match(/[\d,]+\+?\s+(connections|followers)/i)?.[0] ?? '';
}

// Runs in the page. Sections are located by their anchor ids (#about,
// #experience, #education), which have been stable far longer than the class
// names around them. Visible text lives in span[aria-hidden="true"]; the
// sibling visually-hidden spans duplicate it for screen readers.
function readProfileDom() {
    const clean = (s) => s?.replace(/\s+/g, ' ').trim() || '';
    const sectionFor = (id) => document.getElementById(id)?.closest('section') ?? null;
    const ownTexts = (li) =>
        [...li.querySelectorAll('span[aria-hidden="true"]')]
            .filter((s) => s.closest('li') === li)
            .map((s) => clean(s.textContent))
            .filter(Boolean);
    const topItems = (section) => {
        const list = section?.querySelector('ul');
        return list ? [...list.children].filter((el) => el.tagName === 'LI') : [];
    };

    const h1 = document.querySelector('main h1');
    const topCard = h1?.closest('section') ?? null;

    const about = sectionFor('about');
    const aboutText = about
        ? [...about.querySelectorAll('span[aria-hidden="true"]')]
              .map((s) => s.textContent.trim())
              .filter((t) => t && t !== 'About')
              .sort((a, b) => b.length - a.length)[0] ?? ''
        : '';

    return {
        name: clean(h1?.textContent),
        headline: clean(topCard?.querySelector('.text-body-medium')?.textContent),
        location: clean(topCard?.querySelector('.text-body-small.inline.t-black--light, span.text-body-small.inline')?.textContent),
        topCardText: topCard?.innerText ?? '',
        about: aboutText,
        experience: topItems(sectionFor('experience')).map((li) => ({
            texts: ownTexts(li),
            subs: [...li.querySelectorAll('li')].map(ownTexts).filter((t) => t.length > 0),
        })),
        education: topItems(sectionFor('education')).map(ownTexts),
    };
}

/**
 * Opens a profile and returns its details. Only the profile's own top sections
 * are read (LinkedIn shows the most recent ~5 roles there); opening the
 * "Show all experiences" sub-page would double the page views per person.
 */
export async function scrapeProfile(page, visit, profileUrl) {
    await visit(page, profileUrl);
    const ready = await page
        .waitForSelector('main h1', { timeout: 15_000 })
        .then(() => true)
        .catch(() => false);
    if (!ready) throw new Error(`No profile header on ${profileUrl}`);

    // Experience/Education are lazy-rendered below the fold.
    for (let i = 0; i < 3; i += 1) {
        await page.mouse.wheel(0, 1500);
        await pause(600, 1200);
    }

    const raw = await page.evaluate(readProfileDom);
    return {
        name: raw.name,
        headline: raw.headline,
        location: raw.location,
        profileUrl,
        connections: parseConnections(raw.topCardText),
        about: raw.about,
        experience: raw.experience.flatMap(parseExperienceItem),
        education: raw.education.filter((t) => t.length > 0).map(parseEducationItem),
        scrapedAt: new Date().toISOString(),
    };
}
