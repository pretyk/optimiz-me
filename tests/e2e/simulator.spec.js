import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const field = (page, label) => page.getByRole('textbox', { name: label, exact: true });
const commit = (page) => page.getByRole('button', { name: 'חשב סימולציה', exact: true });
const setSlider = async (page, label, value) => {
  const slider = page.getByRole('slider', { name: `${label} - מחוון`, exact: true });
  await slider.evaluate((element, next) => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(element, String(next));
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
};

const acceptDisclaimer = async (page) => {
  await page.getByRole('checkbox', { name: /קראתי והבנתי/ }).check();
  await page.getByRole('button', { name: 'אני מסכים/ה — כניסה לסימולטור', exact: true }).click();
};
test.beforeEach(async ({ page }) => { await page.goto('/'); await acceptDisclaimer(page); });

test('loads Hebrew RTL, privacy badge and complete numeric controls', async ({ page }) => {
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('lang', 'he');
  await expect(page.getByText('הנתונים מחושבים בדפדפן שלך בלבד — לא נשלחים לשרת')).toBeVisible();
  await expect(page.getByText('100% אנונימי', { exact: false })).toHaveCount(0);
  await expect(page.getByRole('slider')).toHaveCount(8);
  await expect(page.getByRole('textbox')).toHaveCount(8);
  await expect(field(page, 'חיסכון נזיל / תיק השקעות')).toHaveValue('1,800,000');
  await expect(page.getByTestId('bridge-net')).not.toHaveText(/NaN|Infinity|—/);
});

test('keeps results and chart locked, then commits draft delta', async ({ page }) => {
  const before = await page.getByTestId('bridge-net').textContent();
  const chart = await page.getByTestId('capital-chart').innerHTML();
  await field(page, 'חיסכון נזיל / תיק השקעות').fill('2,800,000');
  await expect(page.getByText('מצב טיוטה - לחץ על חישוב לעדכון')).toBeVisible();
  await expect(page.getByTestId('bridge-net')).toHaveText(before);
  expect(await page.getByTestId('capital-chart').innerHTML()).toBe(chart);
  await expect(page.getByTestId('delta').first()).toContainText('+');
  await commit(page).click();
  await expect(page.getByTestId('bridge-net')).not.toHaveText(before);
  await expect(page.getByText('מצב טיוטה - לחץ על חישוב לעדכון')).toHaveCount(0);
  await expect(page.getByTestId('confetti')).toBeAttached();
});

test('updates pension tax alert immediately from slider in all tax bands', async ({ page }) => {
  const pension = await page.getByTestId('pension-net').textContent();
  await setSlider(page, 'גיל משיכת פנסיה', 59);
  await expect(page.getByTestId('tax-alert')).toHaveClass(/danger/);
  await expect(page.getByTestId('tax-alert')).toContainText('35%');
  await expect(page.getByTestId('tax-alert')).toContainText('תרחיש אזהרה — מתחת לגיל 60');
  await expect(page.getByTestId('tax-alert')).toContainText('לא קצבה זמינה ולא חישוב מס לפי הדין');
  await setSlider(page, 'גיל משיכת פנסיה', 60);
  await expect(page.getByTestId('tax-alert')).toHaveClass(/warning/);
  await expect(page.getByTestId('tax-alert')).toContainText('הפחתה להמחשה: 20%');
  await setSlider(page, 'גיל משיכת פנסיה', 67);
  await expect(page.getByTestId('tax-alert')).toHaveClass(/success/);
  await expect(page.getByTestId('tax-alert')).toContainText('תרחיש בגיל פרישה — מס משוער');
  await expect(page.getByTestId('tax-alert')).toContainText('המס מוצג לפי הנחות המודל; הזכאות לפטור תלויה בנתונים אישיים ובדין.');
  await expect(page.getByTestId('tax-alert')).toContainText('הפחתה להמחשה: 5%');
  await expect(page.getByTestId('tax-alert')).toContainText('לא שיעור מס בפועל ולא קביעת זכאות לקצבה');
  await expect(page.getByTestId('pension-net')).toHaveText(pension);
});

test('keeps illustrative pension wording committed and excludes superseded claims', async ({ page }) => {
  const card = page.locator('.pension-card');
  for (const age of [59, 60, 67]) {
    await setSlider(page, 'גיל משיכת פנסיה', age);
    await commit(page).click();
    await expect(card).toContainText(`הפחתה להמחשה: ${age < 60 ? 35 : age < 67 ? 20 : 5}%`);
    await expect(card).toContainText('לא שיעור מס בפועל');
    await expect(page.locator('body')).not.toContainText('משיכה אופטימלית בגיל פרישה חוקי');
    await expect(page.locator('body')).not.toContainText('פטור ממס (קיבוע זכויות)');
    await expect(page.locator('body')).not.toContainText('קנס מינימום');
    if (age < 60) {
      await expect(card).toContainText('סכום חודשי להמחשה — לא קצבה זמינה');
      await expect(card).not.toContainText('קצבה חודשית נטו משוערת');
    } else {
      await expect(card).toContainText('קיבוע זכויות הוא הליך לקביעת פטור אישי');
      await expect(card).toContainText('אינו מבטיח פטור אוטומטי או מלא');
    }
  }
  await setSlider(page, 'גיל משיכת פנסיה', 59);
  await expect(card).toContainText('הפחתה להמחשה: 5%');
  await expect(card).toContainText('קצבה חודשית נטו משוערת');
});

test('uses female threshold live without changing locked results', async ({ page }) => {
  await setSlider(page, 'גיל משיכת פנסיה', 65);
  await expect(page.getByTestId('tax-alert')).toHaveClass(/warning/);
  await page.getByRole('button', { name: 'אישה', exact: true }).click();
  await expect(page.getByTestId('tax-alert')).toHaveClass(/success/);
  await expect(page.getByTestId('annuity-factor')).toHaveText('200');
});

test('shows the headline without the intro tagline or profile selectors', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1 })).not.toBeEmpty();
  await expect(page.getByRole('button', { name: 'רוצים סיבה טובה יותר?', exact: true })).toBeVisible();
  await expect(page.getByText('העתיד שלך, בתנאים שלך', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /ארכיטקט תוכנה|הייטקיסט צעיר|מעבר להוראה/ })).toHaveCount(0);
  await expect(page.locator('.profiles-bar')).toHaveCount(0);
});

test('rotates every punchline by keyboard without repeating or changing the scenario', async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0; });
  await page.reload();
  await acceptDisclaimer(page);
  const heading = page.getByRole('heading', { level: 1 });
  const button = page.getByRole('button', { name: 'רוצים סיבה טובה יותר?', exact: true });
  const phrases = [
    'ה־AI רוצה להחליף אותי. אפשר להתחיל ביום ראשון?',
    'מספיק עבודה. מתי הולכים לגלוש?',
    'אפשר לישון עד 12, בלי לקרוא לזה חופש?',
    'היומן מלא בפגישות. אפשר למלא אותו בכלום?',
    'עוד ישיבה על הישיבה? עדיף ישיבה מול הים.',
    'הקוד עובד. למה גם אני צריך?',
    'יש לי תוכנית לחומש. חמש שנים בלי שעון מעורר.',
    'הגיע הזמן לעדכון גרסה. פחות משרד, יותר מרפסת.',
    'אפשר לצאת לפנסיה, לפני שהסיסמה שוב פגה?',
    'החלום: יום ראשון שמרגיש כמו שבת.',
  ];
  const before = await page.getByTestId('bridge-net').textContent();
  await field(page, 'חיסכון נזיל / תיק השקעות').fill('2,800,000');
  await expect(heading).toHaveText(phrases[0]);
  await expect(heading).toHaveAttribute('aria-live', 'polite');
  await expect(heading).toHaveAttribute('aria-atomic', 'true');
  await button.focus();
  for (let index = 1; index <= phrases.length; index++) {
    await page.keyboard.press(index % 2 ? 'Enter' : 'Space');
    await expect(heading).toHaveText(phrases[index % phrases.length]);
    await expect(button).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await expect(field(page, 'חיסכון נזיל / תיק השקעות')).toHaveValue('2,800,000');
  await expect(page.getByTestId('bridge-net')).toHaveText(before);
  await expect(page.getByText('מצב טיוטה - לחץ על חישוב לעדכון')).toBeVisible();
});

test('randomizes the initial punchline and avoids repeats at the upper random boundary', async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0.999999; });
  await page.reload();
  await acceptDisclaimer(page);
  const heading = page.getByRole('heading', { level: 1 });
  await expect(heading).toHaveText('החלום: יום ראשון שמרגיש כמו שבת.');
  await page.getByRole('button', { name: 'רוצים סיבה טובה יותר?', exact: true }).click();
  await expect(heading).toHaveText('אפשר לצאת לפנסיה, לפני שהסיסמה שוב פגה?');
});

test('steppers and range update both paired controls with formatted amounts', async ({ page }) => {
  await page.getByRole('button', { name: 'הגדל חיסכון נזיל / תיק השקעות', exact: true }).click();
  await expect(field(page, 'חיסכון נזיל / תיק השקעות')).toHaveValue('1,810,000');
  await page.getByRole('button', { name: 'הקטן חיסכון נזיל / תיק השקעות', exact: true }).click();
  await expect(field(page, 'חיסכון נזיל / תיק השקעות')).toHaveValue('1,800,000');
  await setSlider(page, 'תשואה שנתית ריאלית צפויה', 0);
  await expect(field(page, 'תשואה שנתית ריאלית צפויה')).toHaveValue('0');
  await commit(page).click();
  await expect(page.getByTestId('bridge-gross')).toHaveText('₪13,889');
});

test('blocks malformed amounts and invalid timelines with explicit Hebrew errors', async ({ page }) => {
  await field(page, 'חיסכון נזיל / תיק השקעות').fill('1,2,3');
  await expect(commit(page)).toBeDisabled();
  await expect(field(page, 'חיסכון נזיל / תיק השקעות')).toHaveAttribute('aria-invalid', 'true');
  await field(page, 'חיסכון נזיל / תיק השקעות').fill('1,800,000');
  await field(page, 'גיל משיכת פנסיה').fill('50');
  await expect(page.getByTestId('tax-alert')).toHaveClass(/danger/);
  await expect(commit(page)).toBeDisabled();
  await expect(page.getByText('גיל משיכת הפנסיה חייב להיות שווה לגיל הפסקת העבודה או מאוחר ממנו.')).toBeVisible();
  await field(page, 'גיל משיכת פנסיה').fill('67');
  await expect(commit(page)).toBeEnabled();
});

for (const label of ['חיסכון נזיל / תיק השקעות', 'קרן השתלמות']) {
  test(`caps ${label} at 10 million across text, stepper and slider controls`, async ({ page }) => {
    const input = field(page, label);
    const slider = page.getByRole('slider', { name: `${label} - מחוון`, exact: true });
    const increase = page.getByRole('button', { name: `הגדל ${label}`, exact: true });
    const before = await page.getByTestId('bridge-net').textContent();
    await expect(slider).toHaveAttribute('max', '10000000');
    for (const value of ['10,000,000.01', '10000001']) {
      await input.fill(value);
      await expect(input).toHaveAttribute('aria-invalid', 'true');
      await expect(page.getByRole('alert').filter({ hasText: 'יש להזין מספר בין 0 ל־10,000,000' })).toBeVisible();
      await expect(commit(page)).toBeDisabled();
      await expect(page.getByTestId('bridge-net')).toHaveText(before);
    }
    await input.fill('10,000,000');
    await expect(input).toHaveAttribute('aria-invalid', 'false');
    await expect(commit(page)).toBeEnabled();
    await expect(increase).toBeDisabled();
    await expect(slider).toHaveValue('10000000');
    await input.fill('9,999,999.99');
    await increase.click();
    await expect(input).toHaveValue('10,000,000');
    await expect(increase).toBeDisabled();
    await page.getByRole('button', { name: `הקטן ${label}`, exact: true }).click();
    await expect(input).toHaveValue('9,990,000');
    await slider.focus();
    await page.keyboard.press('End');
    await expect(input).toHaveValue('10,000,000');
    await expect(increase).toBeDisabled();
    await commit(page).click();
    await expect(page.getByTestId('bridge-net')).not.toHaveText(before);
  });
}

test('retains 100 million limits for target capital and pension balance', async ({ page }) => {
  for (const label of ['יעד הון להשאיר בגיל פנסיה', 'צבירה נוכחית בקרן הפנסיה']) {
    await expect(page.getByRole('slider', { name: `${label} - מחוון`, exact: true })).toHaveAttribute('max', '100000000');
    await field(page, label).fill('100,000,000');
    await expect(field(page, label)).toHaveAttribute('aria-invalid', 'false');
    await expect(page.getByRole('button', { name: `הגדל ${label}`, exact: true })).toBeDisabled();
  }
  await expect(commit(page)).toBeEnabled();
});

test('same-age retirement has no bridge and stays finite', async ({ page }) => {
  await field(page, 'גיל הפסקת עבודה - תחילת גישור').fill('67');
  await commit(page).click();
  await expect(page.getByTestId('bridge-net')).toHaveText('—');
  await expect(page.getByText(/אין תקופת גישור: הפסקת העבודה/)).toBeVisible();
  await expect(page.getByTestId('capital-chart')).not.toHaveAttribute('d', /NaN/);
  expect(await page.getByTestId('capital-chart').innerHTML()).not.toMatch(/NaN|Infinity/);
});

test('impossible target is flagged, shaking, and never celebrated', async ({ page }) => {
  await field(page, 'יעד הון להשאיר בגיל פנסיה').fill('100,000,000');
  await commit(page).click();
  await expect(page.getByTestId('bridge-card')).toHaveClass(/shake/);
  await expect(page.getByText(/יעד ההון אינו בר־השגה\. נדרשת הפקדה/)).toBeVisible();
  await expect(page.getByTestId('confetti')).toHaveCount(0);
});

test('early pension risk overrides celebration even with high bridge income', async ({ page }) => {
  await field(page, 'גיל משיכת פנסיה').fill('59');
  await commit(page).click();
  await expect(page.getByTestId('bridge-card')).toHaveClass(/shake/);
  await expect(page.getByTestId('confetti')).toHaveCount(0);
});

test('formula modal uses committed variables, traps focus and closes with Escape', async ({ page }) => {
  await field(page, 'גיל משיכת פנסיה').fill('68');
  await page.getByRole('button', { name: 'הצג נוסחת חישוב' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('180');
  await expect(dialog).toContainText('₪3,244,800');
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.querySelector('dialog').contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Shift+Tab');
  expect(await page.evaluate(() => document.querySelector('dialog').contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'הצג נוסחת חישוב' })).toBeFocused();
});

test('has no horizontal overflow and meets automated accessibility checks', async ({ page }) => {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(accessibility.violations).toEqual([]);
  await page.getByRole('button', { name: 'הצג נוסחת חישוב' }).click();
  const modalAccessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(modalAccessibility.violations).toEqual([]);
});

test('does not send data, persist inputs, or produce runtime errors', async ({ page, baseURL }) => {
  const external = [], failures = [];
  page.on('request', (request) => { if (!request.url().startsWith(baseURL)) external.push(request.url()); });
  page.on('pageerror', (error) => failures.push(error.message));
  await page.reload();
  await acceptDisclaimer(page);
  await field(page, 'חיסכון נזיל / תיק השקעות').fill('2,222,222');
  await commit(page).click();
  await expect(page.getByTestId('bridge-net')).toBeVisible();
  expect(external).toEqual([]);
  expect(failures).toEqual([]);
  expect(await page.evaluate(() => ({ local: localStorage.length, session: sessionStorage.length, cookies: document.cookie }))).toEqual({ local: 0, session: 0, cookies: '' });
  await page.reload();
  await acceptDisclaimer(page);
  await expect(field(page, 'חיסכון נזיל / תיק השקעות')).toHaveValue('1,800,000');
});

test('honors reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await commit(page).click();
  await expect(page.getByTestId('confetti')).toHaveCSS('display', 'none');
});

test('keyboard controls respect RTL and returning to the committed values clears dirty mode', async ({ page }) => {
  const slider = page.getByRole('slider', { name: 'גיל משיכת פנסיה - מחוון', exact: true });
  await slider.focus();
  await page.keyboard.press('ArrowLeft');
  await expect(field(page, 'גיל משיכת פנסיה')).toHaveValue('68');
  await expect(page.getByText('מצב טיוטה - לחץ על חישוב לעדכון')).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(field(page, 'גיל משיכת פנסיה')).toHaveValue('67');
  await expect(page.getByText('מצב טיוטה - לחץ על חישוב לעדכון')).toHaveCount(0);
});

test('handles maximum current age and a collapsed bridge-start slider range', async ({ page }) => {
  await field(page, 'גיל נוכחי').fill('70');
  await expect(field(page, 'גיל הפסקת עבודה - תחילת גישור')).toHaveValue('70');
  await expect(commit(page)).toBeDisabled();
  const slider = page.getByRole('slider', { name: 'גיל הפסקת עבודה - תחילת גישור - מחוון', exact: true });
  await expect(slider).toHaveAttribute('min', '70');
  await expect(slider).toHaveAttribute('max', '70');
  expect(await slider.getAttribute('style')).not.toContain('NaN');
  await field(page, 'גיל משיכת פנסיה').fill('75');
  await commit(page).click();
  await expect(page.getByTestId('annuity-factor')).toHaveText('176');
  await expect(page.getByTestId('bridge-net')).not.toHaveText(/NaN|Infinity/);
});

test('preserves custom input precision and rejects hidden fractional digits', async ({ page }) => {
  await field(page, 'חיסכון נזיל / תיק השקעות').fill('1,800,000.25');
  await field(page, 'תשואה שנתית ריאלית צפויה').fill('4.25');
  await field(page, 'תשואה שנתית ריאלית צפויה').blur();
  await expect(field(page, 'חיסכון נזיל / תיק השקעות')).toHaveValue('1,800,000.25');
  await expect(field(page, 'תשואה שנתית ריאלית צפויה')).toHaveValue('4.25');
  await expect(commit(page)).toBeEnabled();
  await field(page, 'תשואה שנתית ריאלית צפויה').fill('4.251');
  await expect(commit(page)).toBeDisabled();
});
