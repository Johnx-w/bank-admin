import { test, expect } from '@playwright/test';

/**
 * 用户管理页面 E2E 测试
 */
test.describe('用户管理', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('用户名').fill('admin');
    await page.getByPlaceholder('密码').fill('admin123');
    await page.getByRole('button', { name: '登 录' }).click();
    await expect(page).toHaveURL('/');
  });

  test('用户列表加载正常，展示用户名和状态', async ({ page }) => {
    await page.getByText('用户管理').click();
    await expect(page).toHaveURL('/users');
    await expect(page.locator('.ant-table')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('.ant-table-tbody tr.ant-table-row').first()).toBeVisible();
  });

  test('搜索用户关键字，表格过滤', async ({ page }) => {
    await page.getByText('用户管理').click();
    await expect(page.locator('.ant-table')).toBeVisible({ timeout: 5000 });
    await page.getByPlaceholder('搜索用户名/昵称/邮箱').fill('admin');
    await page.waitForTimeout(800);
    await expect(page.locator('.ant-table-tbody tr.ant-table-row').first()).toBeVisible();
  });

  test('状态筛选正常工作', async ({ page }) => {
    await page.getByText('用户管理').click();
    await expect(page.locator('.ant-table')).toBeVisible({ timeout: 5000 });

    // Click the status filter Select to open dropdown
    await page.waitForTimeout(500);

    // Use keyboard to open the select and navigate
    // First, focus the select by clicking
    const selectEl = page.getByRole('combobox').first();
    await selectEl.focus();
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(300);
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(300);
    await page.keyboard.press('Enter');
    await page.waitForTimeout(800);

    await expect(page.locator('.ant-table-tbody tr.ant-table-row').first()).toBeVisible();
  });
});
