import path from 'node:path';
import { chromium } from 'playwright';

// Where LinkedIn sends a session it no longer trusts. Hitting any of these means
// the session is dead or the account is being challenged - carrying on would
// only make that worse, so it is fatal for the run.
const AUTH_WALL_RE = /linkedin\.com\/(login|checkpoint|authwall|uas\/login|signup)/i;

export const DEFAULT_SESSION_DIR = '.linkedin-session';

export class AuthWallError extends Error {
    constructor(url) {
        super(
            `LinkedIn redirected to ${url} - the session is logged out or the account is being challenged. ` +
                'Run "npm run login" to sign in again.',
        );
        this.name = 'AuthWallError';
    }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const randomBetween = (min, max) => min + Math.floor(Math.random() * (max - min + 1));

/**
 * Opens the installed Google Chrome on a persistent profile directory.
 *
 * Verified 2026-09-24 why the earlier approach (a fresh Playwright browser with
 * only a pasted `li_at` injected, and a hard-coded Chrome/128 user agent on a
 * Chromium 149 engine) failed: LinkedIn revoked each pasted session within a few
 * page loads - its responses carried `Set-Cookie: li_at=delete me`. A session
 * token showing up on a "device" that has none of the bcookie/JSESSIONID it was
 * issued with, whose user agent contradicts its client hints, reads as a stolen
 * session. Logging in once inside this profile (see login.js) lets LinkedIn
 * issue every cookie to this browser itself, and nothing about its identity is
 * spoofed, so later runs look like one ordinary Chrome on one device.
 *
 * `liAt` is only a fallback for environments without the profile (e.g. Apify
 * cloud); it is injected on the parent domain LinkedIn itself uses.
 */
export async function openBrowser({ userDataDir = DEFAULT_SESSION_DIR, headless = false, liAt = null } = {}) {
    const context = await chromium.launchPersistentContext(path.resolve(userDataDir), {
        channel: process.env.APIFY_IS_AT_HOME ? undefined : 'chrome',
        headless,
        viewport: { width: 1366, height: 900 },
        args: ['--disable-blink-features=AutomationControlled'],
    });
    if (liAt) {
        await context.addCookies([
            { name: 'li_at', value: liAt, domain: '.www.linkedin.com', path: '/', httpOnly: true, secure: true, sameSite: 'None' },
        ]);
    }
    // Nothing we extract is an image, video or font; skipping them makes each
    // page lighter without touching the scripts that render the content.
    await context.route('**/*', (route) =>
        ['image', 'media', 'font'].includes(route.request().resourceType()) ? route.abort() : route.continue(),
    );
    const page = context.pages()[0] ?? (await context.newPage());
    return { page, close: () => context.close() };
}

/**
 * Returns the throttled navigator every scraper uses. The random pause runs
 * before each navigation except the first, so traffic looks like one person
 * clicking around rather than a burst.
 */
export function createVisitor({ minDelayMs = 4000, maxDelayMs = 10000 } = {}) {
    let first = true;
    return async function visit(page, url) {
        if (!first) await sleep(randomBetween(minDelayMs, maxDelayMs));
        first = false;
        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45_000 });
        } catch (err) {
            // A revoked session doesn't land on /login: LinkedIn answers with a
            // 302 to the same URL plus `li_at=delete me`, which loops.
            if (/ERR_TOO_MANY_REDIRECTS/.test(err.message)) throw new AuthWallError(`${url} (redirect loop)`);
            throw err;
        }
        assertNotWalled(page);
        // LinkedIn's content is rendered client-side after domcontentloaded.
        await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {});
        assertNotWalled(page);
    };
}

export function assertNotWalled(page) {
    const url = page.url();
    if (AUTH_WALL_RE.test(url)) throw new AuthWallError(url);
}

/** A short, human-ish pause for in-page actions like scrolling. */
export const pause = (min = 800, max = 2000) => sleep(randomBetween(min, max));
