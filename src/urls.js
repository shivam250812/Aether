/**
 * Canonical form of a member profile link: `https://www.linkedin.com/in/<id>/`.
 * People-tab cards carry tracking query strings and country subdomains, so the
 * same person shows up under several spellings across search terms; this is the
 * dedup key. Anything that isn't an `/in/` link returns null.
 */
export function normalizeProfileUrl(href) {
    if (!href) return null;
    let url;
    try {
        url = new URL(href, 'https://www.linkedin.com');
    } catch {
        return null;
    }
    if (!url.hostname.endsWith('linkedin.com')) return null;
    const match = url.pathname.match(/^\/in\/([^/]+)/);
    return match ? `https://www.linkedin.com/in/${match[1]}/` : null;
}

export const companyUrl = (slug) => `https://www.linkedin.com/company/${slug}/`;

/** People tab of a company; no term means the unfiltered list of all employees. */
export const peopleTabUrl = (companyPageUrl, term) =>
    term ? `${companyPageUrl}people/?keywords=${encodeURIComponent(term)}` : `${companyPageUrl}people/`;
