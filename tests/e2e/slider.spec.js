import { test, expect } from '@playwright/test';

for (const [name, viewport, isMobile] of [
  ['small phone', { width: 360, height: 640 }, true],
  ['phone', { width: 412, height: 915 }, true],
  ['portrait tablet', { width: 820, height: 1180 }, true],
  ['landscape tablet', { width: 1180, height: 820 }, true],
  ['touch laptop', { width: 1440, height: 1100 }, false],
]) {
  test.describe(name, () => {
    test.use({ viewport, isMobile, hasTouch: true });

    test('slider hit areas stay separated from working steppers', async ({ page }) => {
      await page.goto('/');
      await page.getByRole('checkbox', { name: /קראתי והבנתי/ }).check();
      await page.getByRole('button', { name: 'אני מסכים/ה — כניסה לסימולטור', exact: true }).click();
      expect(await page.evaluate(() => matchMedia('(any-pointer: coarse)').matches)).toBe(true);

      const fields = page.locator('.numeric-field');
      await expect(fields).toHaveCount(8);
      for (const field of await fields.all()) {
        const slider = field.getByRole('slider');
        await slider.evaluate((element) => element.scrollIntoView({ block: 'center' }));
        const rangeBox = await slider.boundingBox();
        const rowBox = await field.locator('.number-control').boundingBox();
        expect(rangeBox.height).toBeGreaterThanOrEqual(44);
        expect(rangeBox.y - rowBox.y - rowBox.height).toBeGreaterThanOrEqual(16);
        const before = await slider.inputValue();
        const input = field.getByRole('textbox');
        const inputBefore = await input.inputValue();
        await field.evaluate((element) => {
          element.dataset.stepperClicks = '0';
          element.querySelectorAll('.number-control button').forEach((button) => {
            button.addEventListener('click', () => {
              element.dataset.stepperClicks = String(Number(element.dataset.stepperClicks) + 1);
            });
          });
        });

        for (const button of await field.locator('.number-control button').all()) {
          const box = await button.boundingBox();
          expect(box.width).toBeGreaterThanOrEqual(44);
          expect(box.height).toBeGreaterThanOrEqual(44);
          expect(rangeBox.y - box.y - box.height).toBeGreaterThanOrEqual(16);
          const x = box.x + box.width / 2;
          for (const y of [rowBox.y + rowBox.height + 1, rangeBox.y - 1]) {
            const target = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest('button, input')?.tagName ?? null, { x, y });
            expect(target).toBeNull();
            await page.mouse.click(x, y);
            await expect(slider).toHaveValue(before);
            await expect(input).toHaveValue(inputBefore);
          }
        }
        for (const button of await field.locator('.number-control button').all()) {
          const box = await button.boundingBox();
          await page.touchscreen.tap(box.x + box.width / 2, rangeBox.y + 1);
          await expect(field).toHaveAttribute('data-stepper-clicks', '0');
        }
      }

      const age = fields.first();
      const slider = age.getByRole('slider');
      const input = age.getByRole('textbox');
      const buttons = age.locator('.number-control button');
      const initial = Number(await slider.inputValue());
      const step = Number(await slider.getAttribute('step'));
      await buttons.first().tap();
      await expect(slider).toHaveValue(String(initial + step));
      await buttons.last().tap();
      await expect(slider).toHaveValue(String(initial));
      await slider.focus();
      await slider.press('ArrowLeft');
      await expect(slider).toHaveValue(String(initial + step));
      await expect(input).toHaveValue(String(initial + step));

      for (const [key, attribute, edge] of [['Home', 'min', 'right'], ['End', 'max', 'left']]) {
        await slider.press(key);
        const value = await slider.getAttribute(attribute);
        await expect(slider).toHaveValue(value);
        await slider.evaluate((element) => element.scrollIntoView({ block: 'center' }));
        const box = await slider.boundingBox();
        await page.touchscreen.tap(edge === 'right' ? box.x + box.width - 2 : box.x + 2, box.y + box.height / 2);
        await expect(slider).toHaveValue(value);
        await expect(input).toHaveValue(value);
      }
    });
  });
}
