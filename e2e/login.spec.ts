import { test, expect } from '@playwright/test';

test.describe('登录流程', () => {
  test('使用正确凭据登录成功，跳转首页（仪表盘）', async ({ page }) => {
    await page.goto('/login');

    // Ant Design Form 渲染后，Input 通过 placeholder 定位
    await expect(page.getByPlaceholder('用户名')).toBeVisible();
    await expect(page.getByPlaceholder('密码')).toBeVisible();

    await page.getByPlaceholder('用户名').fill('admin');
    await page.getByPlaceholder('密码').fill('admin123');
    await page.getByRole('button', { name: '登 录' }).click();

    // 路由中 / 对应 DashboardPage
    await expect(page).toHaveURL('/');
    await expect(page.locator('.ant-layout-header')).toBeVisible();
  });

  test('错误凭据登录失败，显示错误提示', async ({ page }) => {
    await page.goto('/login');
    await page.getByPlaceholder('用户名').fill('admin');
    await page.getByPlaceholder('密码').fill('wrongpassword');
    await page.getByRole('button', { name: '登 录' }).click();

    await expect(page).toHaveURL('/login');
    await expect(page.locator('.ant-message-notice')).toBeVisible();
  });

  test('未登录访问受保护页面，重定向到登录页', async ({ page }) => {
    await page.goto('/users');
    await expect(page).toHaveURL(/\/login/);
  });
});