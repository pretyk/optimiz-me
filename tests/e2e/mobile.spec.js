import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const SMALL_PHONE = { viewport: { width: 360, height: 640 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true };

const acceptDisclaimer = async (page) => {
  await page.getByRole('checkbox', { name: /קראתי והבנתי/ }).check();
  await page.getByRole('button', { name: 'אני מסכים/ה — כניסה לסימולטור', exact: true }).click();
};
const dock = (page) => page.locator('.calculate-dock');
const commit = (page) => page.getByRole('button', { name: 'חשב סימולציה', exact: true });
const increase = (page, label) => page.getByRole('button', { name: `הגדל ${label}`, exact: true });

const horizontalOverflow = (page) => page.evaluate(() => {
  const width = document.documentElement.clientWidth;
  const offenders = [...document.querySelectorAll('body *')].filter((element) => {
    const box = element.getBoundingClientRect();
    return box.width > 0 && getComputedStyle(element).visibility !== 'hidden' && (box.right > width + 1 || box.left < -1);
  }).map((element) => `${element.tagName}.${element.getAttribute('class') ?? ''}`);
  return { scrollWidth: document.documentElement.scrollWidth, width, offenders: offenders.slice(0, 5) };
});

const expectNoOverflow = async (page) => {
  const result = await horizontalOverflow(page);
  expect(result.offenders).toEqual([]);
  expect(result.scrollWidth).toBeLessThanOrEqual(result.width);
};

test.beforeEach(({ isMobile }) => test.skip(!isMobile, 'Mobile-only checks'));

for (const [name, device] of [['default phone', {}], ['small 360px phone', SMALL_PHONE]]) {
  test.describe(name, () => {
    test.use(device);

    test('entry dialog fits the screen and is usable by touch', async ({ page }) => {
      await page.goto('/');
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      const box = await dialog.boundingBox();
      const viewport = page.viewportSize();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
      await page.getByRole('checkbox', { name: /קראתי והבנתי/ }).tap();
      await page.getByRole('button', { name: 'אני מסכים/ה — כניסה לסימולטור', exact: true }).tap();
      await expect(dialog).toBeHidden();
    });

    test('has no horizontal overflow on any page', async ({ page }) => {
      await page.goto('/');
      await acceptDisclaimer(page);
      await expectNoOverflow(page);
      for (const hash of ['#privacy', '#disclaimer']) {
        await page.goto(`/${hash}`);
        await expect(page.locator('#information')).toBeVisible();
        await expectNoOverflow(page);
      }
    });

    test('all controls meet touch-target and readable-size minimums', async ({ page }) => {
      await page.goto('/');
      await acceptDisclaimer(page);
      const report = await page.evaluate(() => {
        const visible = (element) => {
          const box = element.getBoundingClientRect();
          return box.width > 0 && box.height > 0 && getComputedStyle(element).visibility !== 'hidden';
        };
        const label = (element) => (element.getAttribute('aria-label') || element.textContent || element.type).trim().slice(0, 40);
        const small = [...document.querySelectorAll('main button, main input:not([type=checkbox]), footer a, header a')]
          .filter(visible)
          .filter((element) => { const box = element.getBoundingClientRect(); return box.width < 44 || box.height < 44; })
          .map((element) => `${label(element)} ${Math.round(element.getBoundingClientRect().width)}x${Math.round(element.getBoundingClientRect().height)}`);
        const smallInputs = [...document.querySelectorAll('main input[type=text]')].filter(visible)
          .filter((element) => parseFloat(getComputedStyle(element).fontSize) < 16).map(label);
        const tinyText = [...document.querySelectorAll('main *, footer *')]
          .filter((element) => !element.closest('svg') && visible(element) && [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim()))
          .filter((element) => parseFloat(getComputedStyle(element).fontSize) < 11)
          .map((element) => `${element.textContent.trim().slice(0, 30)} ${getComputedStyle(element).fontSize}`);
        return { small, smallInputs, tinyText };
      });
      expect(report.small, 'touch targets smaller than 44x44').toEqual([]);
      expect(report.smallInputs, 'inputs under 16px zoom on iOS').toEqual([]);
      expect(report.tinyText, 'text smaller than 11px').toEqual([]);
    });

    test('sticky dock previews the draft and calculating scrolls to the results', async ({ page }) => {
      await page.goto('/');
      await acceptDisclaimer(page);
      await page.getByRole('heading', { name: 'חיסכון פנסיוני' }).scrollIntoViewIfNeeded();
      await expect(dock(page)).toBeInViewport();
      await expect(page.getByTestId('dock-preview')).toHaveCount(0);

      await increase(page, 'חיסכון נזיל / תיק השקעות').tap();
      const preview = page.getByTestId('dock-preview');
      await expect(preview).toBeInViewport();
      await expect(preview).toContainText('+');
      await expect(preview).not.toContainText(/NaN|Infinity/);

      await commit(page).tap();
      await expect(page.getByTestId('bridge-card')).toBeInViewport();
      await expect(page.getByTestId('dock-preview')).toHaveCount(0);
      await expect(page.getByText('התרחיש שלך מעודכן')).toBeVisible();
    });

    test('dock previews a new bridge after a scenario with no bridge period', async ({ page }) => {
      await page.goto('/');
      await acceptDisclaimer(page);
      const stopAge = page.getByRole('textbox', { name: 'גיל הפסקת עבודה - תחילת גישור', exact: true });
      await stopAge.fill('67');
      await commit(page).tap();
      await stopAge.fill('60');
      const preview = page.getByTestId('dock-preview');
      await expect(preview).toBeVisible();
      await expect(preview).toContainText('₪');
      await expect(preview.locator('.delta')).toHaveCount(0);
      await expect(preview).not.toContainText(/NaN|Infinity/);
    });

    test('field tooltips open on tap and stay inside the screen', async ({ page }) => {
      await page.goto('/');
      await acceptDisclaimer(page);
      const buttons = page.getByRole('button', { name: 'מידע נוסף', exact: true });
      const count = await buttons.count();
      expect(count).toBeGreaterThan(5);
      const viewport = page.viewportSize();
      const dock = page.locator('.calculate-dock');
      const expectInside = async (tooltip) => {
        const box = await tooltip.boundingBox();
        const dockBox = await dock.boundingBox();
        const dockTop = dockBox.y + dockBox.height >= viewport.height - 1 ? dockBox.y : viewport.height;
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
        expect(box.y).toBeGreaterThanOrEqual(0);
        expect(box.y + box.height).toBeLessThanOrEqual(Math.min(viewport.height, dockTop) + 1);
      };
      for (let index = 0; index < count; index += 1) {
        const button = buttons.nth(index);
        await button.scrollIntoViewIfNeeded();
        await button.tap();
        const tooltip = page.locator(`#${await button.getAttribute('aria-describedby')}`);
        await expect(tooltip).toBeVisible();
        await expectInside(tooltip);
      }

      for (const index of [Math.floor(count / 2)]) {
        const button = buttons.nth(index);
        await page.locator('h1').tap();
        await button.scrollIntoViewIfNeeded();
        const dockBox = await dock.boundingBox();
        const dockTop = dockBox.y + dockBox.height >= viewport.height - 1 ? dockBox.y : viewport.height;
        const buttonTop = (await button.boundingBox()).y;
        await page.evaluate((delta) => window.scrollBy(0, delta), buttonTop - (dockTop - 60));
        await button.tap();
        const tooltip = page.locator(`#${await button.getAttribute('aria-describedby')}`);
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toHaveClass(/tooltip-above/);
        await expectInside(tooltip);
      }

      const padding = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).scrollPaddingBottom));
      expect(padding).toBeGreaterThan((await dock.boundingBox()).height);
    });

    test('number fields and steppers work by touch', async ({ page }) => {
      await page.goto('/');
      await acceptDisclaimer(page);
      const age = page.getByRole('textbox', { name: 'גיל נוכחי', exact: true });
      await increase(page, 'גיל נוכחי').tap();
      await expect(age).toHaveValue('51');
      await expect(age).toHaveAttribute('inputmode', 'numeric');
      await expect(page.getByRole('textbox', { name: 'תשואה שנתית ריאלית צפויה', exact: true })).toHaveAttribute('inputmode', 'decimal');
      await page.getByRole('button', { name: 'אישה', exact: true }).tap();
      await expect(page.getByRole('button', { name: 'אישה', exact: true })).toHaveAttribute('aria-pressed', 'true');
    });

    test('chart is readable and responds to a tap', async ({ page }) => {
      await page.goto('/');
      await acceptDisclaimer(page);
      const chart = page.getByTestId('capital-chart');
      await chart.scrollIntoViewIfNeeded();
      const labelSize = await chart.evaluate((svg) => {
        const label = svg.querySelector('.svg-label');
        return label.getBoundingClientRect().height;
      });
      expect(labelSize).toBeGreaterThanOrEqual(10);
      const readout = page.getByTestId('chart-readout');
      const before = await readout.textContent();
      const box = await chart.boundingBox();
      await page.touchscreen.tap(box.x + box.width * 0.3, box.y + box.height / 2);
      await expect(readout).not.toHaveText(before);
    });

    test('formula modal fits the screen and closes by touch', async ({ page }) => {
      await page.goto('/');
      await acceptDisclaimer(page);
      await page.getByRole('button', { name: 'הצג נוסחת חישוב' }).tap();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      const box = await dialog.boundingBox();
      const viewport = page.viewportSize();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
      expect(box.height).toBeLessThanOrEqual(viewport.height);
      await page.getByRole('button', { name: 'סגור הסבר' }).tap();
      await expect(dialog).toBeHidden();
    });

    test('has no detectable accessibility violations on a phone', async ({ page }) => {
      await page.goto('/');
      await acceptDisclaimer(page);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  });
}
