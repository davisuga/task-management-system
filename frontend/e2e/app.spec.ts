import { test, expect, Page } from "@playwright/test";

import { assignTask, createTask, createUser } from "../src/services/api";
const randomString = () => Math.random().toString(36).substring(2, 15);

test.describe("Task Management System", () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto("/");
  });

  test.describe("User Management", () => {
    test("should add a new user", async () => {
      const name = randomString();
      await page.fill('[data-testid="new-user-input"]', name);

      await page.click('[data-testid="add-user-button"]');
      await expect(page.locator(`[data-testid="user-list"]`)).toContainText(
        name
      );
    });
    test("should show error message when removing a user fails", async () => {
      await page.route("**/users/*", (route) => {
        route.fulfill({
          status: 400,
          body: JSON.stringify({
            detail: "Cannot remove user with assigned tasks",
          }),
        });
      });

      const removeButton = page
        .locator('[data-testid^="remove-user-"]:visible')
        .first();
      await removeButton.click();

      await expect(page.locator(".MuiSnackbar-root")).toContainText(
        "Cannot remove user with assigned tasks"
      );
    });

    test("should remove a user", async () => {
      const name = randomString();
      const { id } = await createUser(name);
      page.goto("/");
      const removeButton = page
        .locator(`[data-testid="remove-user-${id}"]:visible`)
        .first();
      await removeButton.click();
      await expect(
        page.locator(`[data-testid="user-item-${id}"]:visible`)
      ).not.toBeVisible();
    });
  });

  test.describe("Task Management", () => {
    test("should add a new task", async () => {
      const randomString = Math.random().toString(36).substring(2, 15);
      await page.fill('[data-testid="new-task-input"]', randomString);
      await page.click('[data-testid="add-task-button"]');
      await expect(page.locator(`[data-testid="task-list"]`)).toContainText(
        randomString
      );
    });

    test("should delete a task", async () => {
      const title = randomString();
      const { id: uid } = await createTask(title);
      page.goto("/");
      const deleteButton = page
        .locator(`[data-testid="delete-task-${uid}"]`)
        .first();
      await deleteButton.click();
      await expect(
        page.locator(`[data-testid="task-item-${uid}"]`)
      ).not.toBeVisible();
    });

    test("should assign a task to a user", async () => {
      const title = randomString();
      const name = randomString();
      const { id: uid } = await createTask(title);
      await createUser(name);
      page.goto("/");

      page.getByTestId(`assign-task-${uid}`).getByText("Assign to").click();
      await page.getByRole("option", { name }).first().click();

      await expect(page.locator('[data-testid="task-list"]')).toContainText(
        `Assigned to: ${name}`
      );
    });

    test("should unassign a task", async () => {
      const title = randomString();
      const name = randomString();
      const [{ id: uid }, { id: userId }] = await Promise.all([
        createTask(title),
        createUser(name),
      ]);

      await assignTask(uid, userId);

      page.goto("/");

      const unassignButton = page.locator(
        `[data-testid="unassign-task-${uid}"]`
      );
      await unassignButton.click();
      await expect(page.locator('[data-testid="task-list"]')).toContainText(
        "Unassigned"
      );
    });

    test("should show error message when deleting a task fails", async () => {
      await page.route("**/tasks/*", (route) => {
        route.fulfill({
          status: 400,
          body: JSON.stringify({
            detail: "Cannot remove user with assigned tasks",
          }),
        });
      });

      const deleteButton = page
        .locator('[data-testid^="delete-task-"]:visible')
        .first();
      await deleteButton.click();

      await expect(page.locator(".MuiSnackbar-root")).toContainText(
        "Cannot delete an assigned task"
      );
    });
  });

  test("should render both User Management and Task Management components", async () => {
    await expect(page.locator('[data-testid="user-management"]')).toBeVisible();
    await expect(page.locator('[data-testid="task-management"]')).toBeVisible();
  });
});
