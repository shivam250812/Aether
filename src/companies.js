import { companyUrl } from './urls.js';

const COMPANY_URL_RE = /linkedin\.com\/company\/([^/?#\s]+)/i;

/**
 * Classifies one entry of the `companies` input. A LinkedIn company URL (any
 * subdomain, any sub-page) yields its slug directly; anything else is a name
 * that has to be looked up.
 */
export function parseCompanyInput(raw) {
    const value = typeof raw === 'string' ? raw.trim() : '';
    if (!value) return null;
    const match = value.match(COMPANY_URL_RE);
    if (match) {
        const slug = decodeURIComponent(match[1]);
        return { kind: 'url', slug, url: companyUrl(slug) };
    }
    return { kind: 'name', name: value };
}

/**
 * Resolves an input string to `{ input, slug, url, name }`, or null when a name
 * search finds no company. `visit` is the throttled navigator from browser.js.
 */
export async function resolveCompany(page, visit, raw) {
    const parsed = parseCompanyInput(raw);
    if (!parsed) return null;

    let slug = parsed.slug;
    if (parsed.kind === 'name') {
        const searchUrl = `https://www.linkedin.com/search/results/companies/?keywords=${encodeURIComponent(parsed.name)}`;
        await visit(page, searchUrl);
        // Results render client-side; wait for the first company link rather
        // than a class name, which LinkedIn rotates often.
        await page.waitForSelector('main a[href*="/company/"]', { timeout: 15_000 }).catch(() => {});
        slug = await page.evaluate(() => {
            for (const a of document.querySelectorAll('main a[href*="/company/"]')) {
                const m = a.href.match(/\/company\/([^/?#]+)/);
                if (m && m[1] !== 'setup') return decodeURIComponent(m[1]);
            }
            return null;
        });
        if (!slug) return null;
    }

    const url = companyUrl(slug);
    await visit(page, url);
    const name = await page
        .evaluate(() => document.querySelector('main h1')?.textContent?.trim() || null)
        .catch(() => null);
    return { input: String(raw).trim(), slug, url, name };
}
