import { expect, test } from '@playwright/test';

test('empty step 1 keeps Next disabled and lists the missing fields', async ({ page }) => {
  await page.goto('/');

  const next = page.getByRole('button', { name: 'Next', exact: true });
  await expect(next).toBeDisabled();

  const missing = page.getByTestId('missing-fields');
  await expect(missing.getByRole('listitem')).toHaveText([
    'Company name',
    'Country',
    'Company type',
  ]);

  await page.getByLabel('Company name').fill('Example Plastics Ltd');
  await page.getByLabel('Country').selectOption('Austria');
  await expect(missing.getByRole('listitem')).toHaveText(['Company type']);

  await page.getByText('We make or use plastic particles at our factory').click();
  await expect(missing.getByRole('listitem')).toHaveText(['At least one factory site']);
  await expect(next).toBeDisabled();
});
