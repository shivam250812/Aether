// Headline terms that mark someone as working in HR / recruiting. Matched as
// whole words, case-insensitively, so "HR" hits "HR Manager" and "HRBP" (listed
// separately) but not "Chrome" or "Threat".
export const DEFAULT_HR_KEYWORDS = [
    'HR',
    'HRBP',
    'HRM',
    'CHRO',
    'Human Resources',
    'Human Resource',
    'Talent Acquisition',
    'Talent Partner',
    'Talent Management',
    'Recruiter',
    'Recruiting',
    'Recruitment',
    'Hiring',
    'Staffing',
    'People Operations',
    'People Ops',
    'People Partner',
    'People & Culture',
    'People and Culture',
    'Head of People',
    'Chief People Officer',
];

// Terms typed into the company People tab's search box. Each one costs a page
// load (plus scrolling), so this is deliberately shorter than the headline
// matcher: the matcher is what decides who is kept.
export const DEFAULT_PEOPLE_SEARCH_TERMS = ['HR', 'Talent Acquisition', 'Recruiter', 'Human Resources'];

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Returns `(headline) => boolean`. `\b` is useless around keywords that start or
 * end in punctuation ("C++", "People & Culture"), so word edges are expressed as
 * "not preceded/followed by a letter or digit" instead.
 */
export function buildHrMatcher(keywords = DEFAULT_HR_KEYWORDS) {
    const alternation = keywords
        .map((k) => String(k).trim())
        .filter(Boolean)
        .map(escapeRegex)
        .join('|');
    if (!alternation) return () => false;
    const re = new RegExp(`(?<![\\p{L}\\p{N}])(?:${alternation})(?![\\p{L}\\p{N}])`, 'iu');
    return (headline) => (headline ? re.test(headline) : false);
}
