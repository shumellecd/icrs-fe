import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const BFF_PORT = 1004;
const URL = `http://localhost:${BFF_PORT}`;

let bff;
let browser;

before(async () => {
  bff = spawn('node', ['bff/server.js'], { env: { ...process.env, PORT: String(BFF_PORT) }, stdio: 'ignore' });
  await waitForServer(URL, 10000);
  browser = await chromium.launch();
});

after(async () => {
  await browser?.close();
  bff?.kill();
});

test('home page loads and links to every sample page', async () => {
  const page = await browser.newPage();
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.Alpine !== undefined);

  for (const href of [
    './pages/dashboard/index.html',
  ]) {
    await assert.doesNotReject(page.locator(`a[href="${href}"]`).first().waitFor({ state: 'visible' }));
  }

  await page.close();
});

test('dashboard page: Alpine initializes and the counter component works', async () => {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));

  await page.goto(`${URL}/pages/dashboard/index.html`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.Alpine !== undefined);

  const initialText = await page.textContent('.display-4');
  assert.equal(initialText, '0');

  await page.click('.btn-primary:has-text("+")');
  const afterClick = await page.textContent('.display-4');
  assert.equal(afterClick, '1');

  assert.deepEqual(errors, []);
  await page.close();
});

test('auth portal: loads correctly and switches between Sign In and Register', async () => {
  const page = await browser.newPage();
  await page.goto(`${URL}/pages/auth/index.html`, { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.Alpine !== undefined);

  assert.ok(await page.isVisible('h3:has-text("Sign In to ICRS")'));

  await page.click('button[title="Register here"]');
  await page.waitForTimeout(100);
  assert.ok(await page.isVisible('h3:has-text("User Registration")'));

  await page.click('button[title="Sign in here"]');
  await page.waitForTimeout(100);
  assert.ok(await page.isVisible('h3:has-text("Sign In to ICRS")'));

  await page.close();
});

test('auth portal: sign in form surfaces validation error on empty email and shows success on valid email', async () => {
  const page = await browser.newPage();
  await page.goto(`${URL}/pages/auth/index.html`, { waitUntil: 'networkidle' });

  await page.click('button[type="submit"]:has-text("SEND LOGIN LINK")');
  await page.waitForSelector('.invalid-feedback:visible');
  const errorMsg = await page.textContent('.invalid-feedback');
  assert.match(errorMsg, /Official email address is required/i);

  await page.fill('#officialEmail', 'officer@gocc.gov.ph');
  await page.click('button[type="submit"]:has-text("SEND LOGIN LINK")');

  await page.waitForSelector('h3:has-text("Login Link Sent!")', { timeout: 5000 });
  const sentEmail = await page.textContent('.fw-bold.text-primary');
  assert.equal(sentEmail.trim(), 'officer@gocc.gov.ph');

  await page.close();
});

test('auth portal: registration requires Data Privacy Consent and mandatory fields', async () => {
  const page = await browser.newPage();
  await page.goto(`${URL}/pages/auth/index.html`, { waitUntil: 'networkidle' });

  await page.click('button[title="Register here"]');
  await page.waitForSelector('h3:has-text("User Registration")');

  await page.click('button[type="submit"]:has-text("SUBMIT REGISTRATION")');

  await page.waitForSelector('#privacyConsent.is-invalid', { timeout: 5000 });
  const privacyErrorText = await page.textContent('.invalid-feedback:has-text("Data Privacy")');
  assert.match(privacyErrorText, /Data Privacy Consent/i);

  await page.close();
});

async function waitForServer(url, timeoutMs) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`Server at ${url} did not start in time`);
}
