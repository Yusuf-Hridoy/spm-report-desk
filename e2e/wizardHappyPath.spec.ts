import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test('example company goes through all 5 steps and downloads the CSV', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Prototype only.')).toBeVisible();

  await page.getByRole('button', { name: 'Load example' }).click();
  await expect(page.getByLabel('Company name')).toHaveValue('Nordlicht Beschichtungen GmbH');

  // Scope to the wizard: the print-only record is also in the page, hidden on screen.
  const wizard = page.getByRole('main');
  const next = wizard.getByRole('button', { name: 'Next', exact: true });

  await next.click();
  await expect(
    page.getByRole('heading', { level: 2, name: 'How you use plastic particles' }),
  ).toBeVisible();
  await expect(page.getByLabel('Use name')).toHaveValue(
    'Formulation of water-based industrial wood coatings',
  );

  await next.click();
  await expect(
    page.getByRole('heading', { level: 2, name: 'Which plastics are in your particles' }),
  ).toBeVisible();
  await expect(page.getByRole('checkbox', { name: '3906 Acrylic polymers' })).toBeChecked();

  await next.click();
  await expect(
    page.getByRole('heading', { level: 2, name: 'How much plastic escapes each year' }),
  ).toBeVisible();
  await expect(page.getByTestId('emission-result')).toHaveText('2.4354 t');
  await expect(wizard.getByText(/These are ECHA worst-case default factors\./)).toBeVisible();
  await expect(wizard.getByText('Not yet verified', { exact: true })).toHaveCount(0);

  await next.click();
  await expect(page.getByRole('heading', { level: 2, name: 'Check your report' })).toBeVisible();
  await expect(page.getByTestId('review-emission')).toHaveText('2.4354 t');
  await expect(page.getByText('Prototype only.')).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download CSV' }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe('spm-report-nordlicht-beschichtungen-gmbh-2026.csv');

  const csv = await readFile(await download.path(), 'utf8');
  expect(csv.charCodeAt(0)).toBe(0xfeff);
  expect(csv).toContain('Other manufacture or use at industrial sites');
  expect(csv).toContain(',2.4354,t,Option B');
});
