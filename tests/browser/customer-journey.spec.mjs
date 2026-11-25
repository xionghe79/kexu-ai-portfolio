import { test, expect } from '@playwright/test';

test('message becomes a task and survives refresh', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '咨询工作台', exact: true }).click();

  const message = '下周请安排一次产品演示';
  await page.getByLabel('输入演示消息').fill(message);
  await page.getByRole('button', { name: '发送 ↗' }).click();
  await expect(page.getByText(message, { exact: true })).toBeVisible();

  await page.getByRole('button', { name: '生成任务草稿' }).click();
  await expect(page.getByText('2 项待办')).toBeVisible();
  await expect(page.getByLabel('任务内容')).toHaveValue(`跟进咨询：${message}`);
  await page.getByRole('button', { name: '创建任务 ↗' }).click();
  await expect(page.getByRole('button', { name: `完成任务：跟进咨询：${message}` })).toBeVisible();

  await page.reload();
  await page.getByRole('button', { name: '跟进任务' }).click();
  await expect(page.getByRole('button', { name: `完成任务：跟进咨询：${message}` })).toBeVisible();
  await expect(page.getByText('3 项待办')).toBeVisible();
});
