// One-time sign-in: opens the actor's Chrome profile on the LinkedIn login page
// and waits for you to log in by hand (OTP / 2FA included). The session is then
// saved in the profile directory, and `npm start` reuses it.
import { openBrowser, DEFAULT_SESSION_DIR } from './browser.js';

const userDataDir = process.argv[2] || DEFAULT_SESSION_DIR;
const TIMEOUT_MS = 10 * 60_000;

const { page, close } = await openBrowser({ userDataDir, headless: false });
await page.goto('https://www.linkedin.com/login', { waitUntil: 'domcontentloaded' });
console.log('Log in to LinkedIn in the Chrome window that just opened (you have 10 minutes)...');

try {
    // An already-signed-in profile is bounced straight from /login to the feed.
    await page.waitForURL(/linkedin\.com\/feed/, { timeout: TIMEOUT_MS });
    // Let LinkedIn finish setting its session cookies before the profile closes.
    await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {});
    console.log(`Logged in. Session saved to ${userDataDir}/ - now run: npm start`);
} catch {
    console.error('Did not reach the LinkedIn feed within 10 minutes - login not saved. Run "npm run login" again.');
    process.exitCode = 1;
} finally {
    await close();
}
