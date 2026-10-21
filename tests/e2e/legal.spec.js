import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const agreement = (page) => page.getByRole('checkbox', { name: /קראתי והבנתי/ });
const enter = (page) => page.getByRole('button', { name: 'אני מסכים/ה — כניסה לסימולטור', exact: true });
const accept = async (page) => { await agreement(page).check(); await enter(page).click(); };
const gate = (page) => page.getByRole('dialog', { name: 'סימולציה בלבד. לא ייעוץ פיננסי.' });
const noStorage = async (page) => expect(await page.evaluate(async () => ({
  local: localStorage.length,
  session: sessionStorage.length,
  cookies: document.cookie,
  databases: (await indexedDB.databases()).length,
}))).toEqual({ local: 0, session: 0, cookies: '', databases: 0 });

test('entry requires affirmative agreement and cannot be dismissed by Escape or backdrop', async ({ page }) => {
  await page.goto('/');
  await expect(gate(page)).toBeVisible();
  await expect(enter(page)).toBeDisabled();
  await expect(page.locator('#main')).toHaveAttribute('inert', '');
  await expect(page.locator('#main .calculate-button').click({ trial: true, timeout: 750 })).rejects.toThrow();
  await expect(gate(page)).toContainText('השוק, האינפלציה, הריבית וחוקי המס והפנסיה');
  const backdrop = await gate(page).evaluate((element) => getComputedStyle(element, '::backdrop').backdropFilter);
  expect(backdrop).toMatch(/blur\(/);
  await page.keyboard.press('Escape');
  await page.mouse.click(2, 2);
  await expect(gate(page)).toBeVisible();
  await agreement(page).check();
  await expect(enter(page)).toBeEnabled();
  await agreement(page).uncheck();
  await expect(enter(page)).toBeDisabled();
  await accept(page);
  await expect(gate(page)).toHaveCount(0);
  await expect(page.locator('#main')).not.toHaveAttribute('inert');
  await expect(page.getByRole('button', { name: 'חשב סימולציה', exact: true })).toBeEnabled();
  await noStorage(page);
});

test('gate contains keyboard focus and meets accessibility checks on both viewports', async ({ page }) => {
  await page.goto('/');
  for (let i = 0; i < 9; i++) {
    await page.keyboard.press('Tab');
    expect(await gate(page).evaluate((element) => element.contains(document.activeElement))).toBe(true);
  }
  for (let i = 0; i < 9; i++) {
    await page.keyboard.press('Shift+Tab');
    expect(await gate(page).evaluate((element) => element.contains(document.activeElement))).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(results.violations).toEqual([]);
});

test('legal information is readable before agreement and returning does not bypass the gate', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'למידע נוסף ולהודעת ההבהרה המלאה' }).click();
  await expect(page).toHaveURL(/#disclaimer$/);
  await expect(gate(page)).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('הודעת הבהרה ותנאי שימוש');
  await expect(page.getByText(/מחבר האתר אינו יועץ פיננסי ואינו מספק/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'השוק, האינפלציה, הריבית והחוקים משתנים' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'אחריות המשתמש והגבלת אחריות' })).toBeVisible();
  await page.getByRole('link', { name: 'חזרה לסימולטור', exact: true }).first().click();
  await expect(gate(page)).toBeVisible();
  await expect(agreement(page)).not.toBeChecked();
  await expect(enter(page)).toBeDisabled();
});

test('declining leaves the user on an informational page without accepting', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'לא מסכים/ה — להישאר בעמוד המידע' }).click();
  await expect(page).toHaveURL(/#disclaimer$/);
  await expect(page.getByRole('button', { name: 'חשב סימולציה', exact: true })).toHaveCount(0);
  await page.goBack();
  await expect(gate(page)).toBeVisible();
  await noStorage(page);
});

test('privacy is accessible before agreement and explains hosting and external-link limits', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'איך נשמרת הפרטיות?' }).click();
  await expect(page).toHaveURL(/#privacy$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('המידע שלך נשאר אצלך');
  await expect(page.getByRole('heading', { name: 'בלי מעקב ובלי פרופיל משתמש' })).toBeVisible();
  await expect(page.getByText(/ספק האחסון, תשתית ההפצה או ספק הרשת/)).toBeVisible();
  await expect(page.getByText(/שירות חיצוני בעל מדיניות פרטיות משלו/)).toBeVisible();
  await page.getByRole('link', { name: 'חזרה לסימולטור', exact: true }).first().click();
  await expect(gate(page)).toBeVisible();
});

test('privacy badge navigation preserves draft, committed results and in-memory acceptance', async ({ page }) => {
  await page.goto('/');
  await accept(page);
  const oldNet = await page.getByTestId('bridge-net').textContent();
  await page.getByRole('textbox', { name: 'חיסכון נזיל / תיק השקעות', exact: true }).fill('2,400,000');
  await page.getByRole('link', { name: 'למידע נוסף על הפרטיות' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('המידע שלך נשאר אצלך');
  await page.goBack();
  await expect(gate(page)).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'חיסכון נזיל / תיק השקעות', exact: true })).toHaveValue('2,400,000');
  await expect(page.getByTestId('bridge-net')).toHaveText(oldNet);
  await expect(page.getByText('מצב טיוטה - לחץ על חישוב לעדכון')).toBeVisible();
  await page.reload();
  await expect(gate(page)).toBeVisible();
  await accept(page);
  await expect(page.getByRole('textbox', { name: 'חיסכון נזיל / תיק השקעות', exact: true })).toHaveValue('1,800,000');
  await noStorage(page);
});

for (const route of ['privacy', 'disclaimer']) {
  test(`${route} page supports direct links, reload and accessible navigation`, async ({ page }) => {
    await page.goto(`/#${route}`);
    await expect(gate(page)).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused();
    await page.reload();
    await expect(page).toHaveURL(new RegExp(`#${route}$`));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    expect(result.violations).toEqual([]);
    await page.getByRole('link', { name: 'חזרה לסימולטור', exact: true }).first().click();
    await expect(gate(page)).toBeVisible();
  });
}

test('contribution link targets the repository without sending referrer data', async ({ page }) => {
  await page.goto('/#privacy');
  const link = page.getByRole('link', { name: 'תרומה לקוד ב־GitHub — נפתח בלשונית חדשה' });
  await expect(link).toHaveAttribute('href', 'https://github.com/pretyk/retirator');
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
});

test('agreement and legal-page visits do not make data requests or write storage', async ({ page }) => {
  await page.goto('/');
  const requests = [], errors = [];
  page.on('request', (request) => requests.push(request.url()));
  page.on('pageerror', (error) => errors.push(error.message));
  await page.getByRole('link', { name: 'למידע נוסף ולהודעת ההבהרה המלאה' }).click();
  await page.getByRole('link', { name: 'פרטיות ואי־מעקב', exact: true }).click();
  await page.getByRole('link', { name: 'חזרה לסימולטור', exact: true }).first().click();
  await accept(page);
  await page.getByRole('button', { name: 'חשב סימולציה', exact: true }).click();
  expect(requests).toEqual([]);
  expect(errors).toEqual([]);
  await noStorage(page);
});
