import { normalizeProfileUrl, peopleTabUrl } from './urls.js';
import { pause } from './browser.js';

// Each "Show more results" adds roughly a dozen cards, so the scroll budget
// scales with how many people we want. LinkedIn stops serving the People tab
// at around 1,000 members however far you scroll, hence the ceiling.
const scrollRoundsFor = (max) => Math.min(120, Math.ceil(max / 10) + 5);

// Reads every visible employee card. Cards are found via their /in/ link rather
// than a card class, since LinkedIn renames those classes regularly; the name
// and headline then come from the lockup title/subtitle when present, falling
// back to the card's text lines.
function readCards() {
    const cards = [];
    for (const li of document.querySelectorAll('main li')) {
        const link = li.querySelector('a[href*="/in/"]');
        if (!link) continue;
        const pick = (sel) => li.querySelector(sel)?.innerText?.trim() || null;
        const lines = li.innerText
            .split('\n')
            .map((s) => s.trim())
            .filter((s) => s && !/^(connect|follow|message|pending|·|\d+(st|nd|rd|th)?\+?|.*degree connection.*)$/i.test(s));
        cards.push({
            href: link.href,
            name: pick('.artdeco-entity-lockup__title') || lines[0] || null,
            headline: pick('.artdeco-entity-lockup__subtitle') || lines[1] || null,
        });
    }
    return cards;
}

async function loadMore(page) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await pause();
    const button = page.getByRole('button', { name: /show more results/i }).first();
    if (await button.isVisible().catch(() => false)) {
        await button.click().catch(() => {});
        await pause(1500, 3000);
    }
}

/**
 * Collects employees from a company's People tab, running one People-tab search
 * per term and stopping once `max` unique matching profiles are in hand. An
 * empty term ('') loads the unfiltered list of everyone; pass `isHr: () => true`
 * alongside it to keep them all. Returns `[{ name, headline, profileUrl }]`.
 */
export async function collectPeople(page, visit, company, { terms, max, isHr, log }) {
    const found = new Map(); // normalized profile URL -> card
    const maxRounds = scrollRoundsFor(max);

    for (const term of terms) {
        if (found.size >= max) break;
        const label = term ? `"${term}"` : 'All employees';
        await visit(page, peopleTabUrl(company.url, term));

        // "Stagnant" means the page stopped loading new cards - not that no new
        // matches turned up, which is normal while scrolling past other roles.
        let stagnantRounds = 0;
        let lastCardCount = 0;
        for (let round = 0; round < maxRounds && found.size < max; round += 1) {
            const cards = await page.evaluate(readCards);
            let seenAny = false;
            for (const card of cards) {
                const profileUrl = normalizeProfileUrl(card.href);
                // Out-of-network members render as "LinkedIn Member" with no
                // profile link, so they never survive normalization.
                if (!profileUrl) continue;
                seenAny = true;
                if (found.has(profileUrl) || !isHr(card.headline)) continue;
                found.set(profileUrl, { name: card.name, headline: card.headline, profileUrl });
                if (found.size >= max) break;
            }
            if (!seenAny && round === 0) {
                log.info(`  ${label}: no employee cards on the People tab.`);
                break;
            }
            stagnantRounds = cards.length <= lastCardCount ? stagnantRounds + 1 : 0;
            lastCardCount = cards.length;
            if (stagnantRounds >= 3) break;
            await loadMore(page);
            if (round % 10 === 9) log.info(`  ${label}: ${found.size} profile(s) loaded, still scrolling...`);
        }
        log.info(`  ${label}: ${found.size} profile(s) so far.`);
    }

    return [...found.values()].slice(0, max);
}
