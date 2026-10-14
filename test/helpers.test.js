import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildHrMatcher, DEFAULT_HR_KEYWORDS } from '../src/hr.js';
import { parseCompanyInput } from '../src/companies.js';
import { normalizeProfileUrl, peopleTabUrl } from '../src/urls.js';
import { profileToRow, COLUMNS } from '../src/sheet.js';

test('HR matcher accepts HR-flavoured headlines', () => {
    const isHr = buildHrMatcher(DEFAULT_HR_KEYWORDS);
    for (const headline of [
        'HR Business Partner at Infosys',
        'Senior Talent Acquisition Specialist',
        'Technical Recruiter | Hiring for Cloud roles',
        'CHRO - Zoho Corporation',
        'HRBP | People & Culture',
        'Human Resource Manager',
        'Head of People',
    ]) {
        assert.equal(isHr(headline), true, headline);
    }
});

test('HR matcher rejects non-HR headlines and empty input', () => {
    const isHr = buildHrMatcher(DEFAULT_HR_KEYWORDS);
    for (const headline of ['Senior Software Engineer', 'Chrome Extension Developer', 'Threat Researcher', '', null]) {
        assert.equal(isHr(headline), false, String(headline));
    }
});

test('HR matcher honours custom keywords and escapes regex characters', () => {
    const isHr = buildHrMatcher(['C++ Hiring']);
    assert.equal(isHr('Lead, C++ Hiring'), true);
    assert.equal(isHr('HR Manager'), false);
});

test('parseCompanyInput reads slugs out of any LinkedIn company URL shape', () => {
    assert.deepEqual(parseCompanyInput('https://www.linkedin.com/company/infosys/'), {
        kind: 'url',
        slug: 'infosys',
        url: 'https://www.linkedin.com/company/infosys/',
    });
    assert.equal(parseCompanyInput('in.linkedin.com/company/tata-consultancy-services/about/?x=1').slug, 'tata-consultancy-services');
    assert.equal(parseCompanyInput('  linkedin.com/company/zoho  ').slug, 'zoho');
});

test('parseCompanyInput treats anything else as a name, and blanks as null', () => {
    assert.deepEqual(parseCompanyInput(' Freshworks '), { kind: 'name', name: 'Freshworks' });
    assert.equal(parseCompanyInput('   '), null);
    assert.equal(parseCompanyInput(undefined), null);
});

test('normalizeProfileUrl canonicalises /in/ links and rejects the rest', () => {
    assert.equal(
        normalizeProfileUrl('https://www.linkedin.com/in/jane-doe-12ab?miniProfileUrn=urn%3Ali%3Afs'),
        'https://www.linkedin.com/in/jane-doe-12ab/',
    );
    assert.equal(normalizeProfileUrl('https://in.linkedin.com/in/Jane-Doe/details/'), 'https://www.linkedin.com/in/Jane-Doe/');
    assert.equal(normalizeProfileUrl('https://www.linkedin.com/search/results/people/'), null);
    assert.equal(normalizeProfileUrl(null), null);
});

test('peopleTabUrl lists everyone for an empty term, searches otherwise', () => {
    const base = 'https://www.linkedin.com/company/zoho/';
    assert.equal(peopleTabUrl(base, ''), 'https://www.linkedin.com/company/zoho/people/');
    assert.equal(peopleTabUrl(base, null), 'https://www.linkedin.com/company/zoho/people/');
    assert.equal(peopleTabUrl(base, 'Talent & HR'), 'https://www.linkedin.com/company/zoho/people/?keywords=Talent%20%26%20HR');
});

test('profileToRow flattens lists into multi-line cells', () => {
    const row = profileToRow(
        { input: 'Zoho', name: 'Zoho Corporation', url: 'https://www.linkedin.com/company/zoho/' },
        {
            name: 'Jane Doe',
            headline: 'HR Manager',
            location: 'Chennai',
            profileUrl: 'https://www.linkedin.com/in/jane/',
            connections: '500+ connections',
            about: 'I hire people.',
            experience: [
                { title: 'HR Manager', company: 'Zoho', dates: 'Jan 2022 - Present' },
                { title: 'Recruiter', company: 'TCS', dates: '' },
            ],
            education: [{ school: 'Anna University', degree: 'MBA, HR', dates: '2015 - 2017' }],
            scrapedAt: '2026-09-24T00:00:00.000Z',
        },
    );
    assert.equal(row.companyInput, 'Zoho');
    assert.equal(row.currentTitle, 'HR Manager');
    assert.equal(row.currentCompany, 'Zoho');
    assert.equal(row.experience, 'HR Manager — Zoho (Jan 2022 - Present)\nRecruiter — TCS');
    assert.equal(row.education, 'Anna University — MBA, HR (2015 - 2017)');
    assert.deepEqual(Object.keys(row).sort(), COLUMNS.map((c) => c.key).sort());
});

test('profileToRow tolerates a sparse profile', () => {
    const row = profileToRow({ input: 'X', name: null, url: null }, { name: 'A', profileUrl: 'u', experience: [], education: [] });
    assert.equal(row.currentTitle, '');
    assert.equal(row.experience, '');
    assert.equal(row.about, '');
});
