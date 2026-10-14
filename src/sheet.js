import { writeFile } from 'node:fs/promises';
import ExcelJS from 'exceljs';

export const COLUMNS = [
    { key: 'companyInput', header: 'Company Input', width: 22 },
    { key: 'companyName', header: 'Company Name', width: 26 },
    { key: 'companyUrl', header: 'Company URL', width: 40 },
    { key: 'name', header: 'Name', width: 24 },
    { key: 'headline', header: 'Headline', width: 45 },
    { key: 'currentTitle', header: 'Current Title', width: 30 },
    { key: 'currentCompany', header: 'Current Company', width: 26 },
    { key: 'location', header: 'Location', width: 26 },
    { key: 'profileUrl', header: 'Profile URL', width: 45 },
    { key: 'connections', header: 'Connections', width: 18 },
    { key: 'about', header: 'About', width: 60 },
    { key: 'experience', header: 'Experience', width: 60 },
    { key: 'education', header: 'Education', width: 45 },
    { key: 'scrapedAt', header: 'Scraped At', width: 24 },
];

// "A — B (dates)", dropping whichever parts are missing.
const line = (a, b, dates) => {
    const head = [a, b].filter(Boolean).join(' — ');
    return dates ? `${head} (${dates})` : head;
};

export function profileToRow(company, profile) {
    const experience = profile.experience ?? [];
    const education = profile.education ?? [];
    const current = experience[0] ?? {};
    return {
        companyInput: company.input ?? '',
        companyName: company.name ?? '',
        companyUrl: company.url ?? '',
        name: profile.name ?? '',
        headline: profile.headline ?? '',
        currentTitle: current.title ?? '',
        currentCompany: current.company ?? '',
        location: profile.location ?? '',
        profileUrl: profile.profileUrl ?? '',
        connections: profile.connections ?? '',
        about: profile.about ?? '',
        experience: experience.map((e) => line(e.title, e.company, e.dates)).filter(Boolean).join('\n'),
        education: education.map((e) => line(e.school, e.degree, e.dates)).filter(Boolean).join('\n'),
        scrapedAt: profile.scrapedAt ?? '',
    };
}

// Rewrites the whole file each time: it's called after every company so a crash
// or auth wall mid-run still leaves every row collected so far on disk.
export async function writeSheet(rows, filePath) {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('HR Profiles');
    sheet.columns = COLUMNS;
    sheet.getRow(1).font = { bold: true };
    sheet.views = [{ state: 'frozen', ySplit: 1 }];
    for (const row of rows) sheet.addRow(row);
    sheet.eachRow((r, i) => {
        if (i > 1) r.alignment = { vertical: 'top', wrapText: true };
    });
    sheet.autoFilter = { from: 'A1', to: { row: 1, column: COLUMNS.length } };
    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    await writeFile(filePath, buffer);
    return buffer;
}
