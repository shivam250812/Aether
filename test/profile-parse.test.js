import { test } from 'node:test';
import assert from 'node:assert/strict';

import { parseExperienceItem, parseEducationItem, parseConnections } from '../src/profile.js';

test('single-role experience item', () => {
    assert.deepEqual(
        parseExperienceItem({
            texts: ['HR Business Partner', 'Infosys · Full-time', 'Mar 2021 - Present · 3 yrs 7 mos', 'Bengaluru, Karnataka, India'],
            subs: [],
        }),
        [{ title: 'HR Business Partner', company: 'Infosys', dates: 'Mar 2021 - Present' }],
    );
});

test('grouped item: several roles under one company', () => {
    assert.deepEqual(
        parseExperienceItem({
            texts: ['Zoho', 'Full-time · 5 yrs', 'Chennai'],
            subs: [
                ['Senior HR Manager', 'Jan 2023 - Present · 1 yr 9 mos'],
                ['HR Executive', 'Full-time', 'Jun 2019 - Dec 2022 · 3 yrs 7 mos'],
                ['Skills: Recruiting · Onboarding'], // skills row, not a role
            ],
        }),
        [
            { title: 'Senior HR Manager', company: 'Zoho', dates: 'Jan 2023 - Present' },
            { title: 'HR Executive', company: 'Zoho', dates: 'Jun 2019 - Dec 2022' },
        ],
    );
});

test('experience item with no company line or dates', () => {
    assert.deepEqual(parseExperienceItem({ texts: ['Freelance Recruiter'], subs: [] }), [
        { title: 'Freelance Recruiter', company: '', dates: '' },
    ]);
    assert.deepEqual(parseExperienceItem({ texts: [], subs: [] }), []);
});

test('experience item whose second line is the date, not the company', () => {
    assert.deepEqual(parseExperienceItem({ texts: ['Recruiter', '2018 - 2020 · 2 yrs'], subs: [] }), [
        { title: 'Recruiter', company: '', dates: '2018 - 2020' },
    ]);
});

test('education item', () => {
    assert.deepEqual(parseEducationItem(['Anna University', 'MBA, Human Resources', '2015 - 2017']), {
        school: 'Anna University',
        degree: 'MBA, Human Resources',
        dates: '2015 - 2017',
    });
    assert.deepEqual(parseEducationItem(['IIM Bangalore', '2019 - 2021']), { school: 'IIM Bangalore', degree: '', dates: '2019 - 2021' });
});

test('parseConnections pulls the count phrase from top-card text', () => {
    assert.equal(parseConnections('Chennai · Contact info\n500+ connections\nOpen to'), '500+ connections');
    assert.equal(parseConnections('12,345 followers · 500+ connections'), '12,345 followers');
    assert.equal(parseConnections('nothing here'), '');
});
