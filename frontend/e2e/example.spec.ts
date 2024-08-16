import { test, expect, Page } from "@playwright/test";
const lastAddedUserID = async (page: Page) => {
  const testID = await page
    .locator("[data-testid^=user-item]")
    .last()
    .getAttribute("data-testid");
  const uid = testID?.split("-")[2];
  return uid;
};
const lastAddedTaskID = async (page: Page) => {
  const testID = await page
    .locator("[data-testid^=task-item]")
    .last()
    .getAttribute("data-testid");
  const uid = testID?.split("-")[2];
  return uid;
};

test.describe("Task Management System", () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto("/"); // Adjust the URL as needed
  });
  test.describe("User Management", () => {
    test("should add a new user", async () => {
      await page.fill('[data-testid="new-user-input"]', "John Doe");
      await page.click('[data-testid="add-user-button"]');
      await expect(
        page.locator(`[data-testid="user-item-${await lastAddedUserID(page)}"]`)
      ).toContainText("John Doe");
    });
    test("should show error message when removing a user fails", async () => {
      // Mock the API to return an error
      await page.route("**/users/*", (route) => {
        route.fulfill({
          status: 400,
          body: JSON.stringify({
            detail: "Cannot remove user with assigned tasks",
          }),
        });
      });

      // Attempt to remove a user
      const removeButton = page
        .locator('[data-testid^="remove-user-"]:visible')
        .first();
      await removeButton.click();

      // Check for error message
      await expect(page.locator(".MuiSnackbar-root")).toContainText(
        "Cannot remove user with assigned tasks"
      );
    });
    test("should remove a user", async () => {
      // First, add a user
      await page.fill('[data-testid="new-user-input"]', "Jane Smith");
      await page.click('[data-testid="add-user-button"]');
      const uid = await lastAddedUserID(page);

      const removeButton = page
        .locator(`[data-testid="remove-user-${uid}"]:visible`)
        .first();
      await removeButton.click();
      await expect(
        page.locator(`[data-testid="user-item-${uid}"]:visible`)
      ).not.toBeVisible();
    });
  });

  test.describe("Task Management", () => {
    test("should add a new task", async () => {
      const randomString = Math.random().toString(36).substring(2, 15);
      await page.fill('[data-testid="new-task-input"]', randomString);
      await page.click('[data-testid="add-task-button"]');
      await expect(page.locator(
        `[data-testid="task-list"]`
      )).toContainText(
        randomString
      );
    });

    test("should delete a task", async () => {
      // First, add a task
      await page.fill('[data-testid="new-task-input"]', "Delete me");
      await page.click('[data-testid="add-task-button"]');
      const uid = await lastAddedTaskID(page)
      // Then, delete the task
      const deleteButton = page
        .locator(`[data-testid="delete-task-${uid}"]`)
        .first();
      await deleteButton.click();
      await expect(page.locator(
        `[data-testid="task-item-${uid}"]`
      )).not.toBeVisible();
    });

    test("should assign a task to a user", async () => {
      // First, add a user and a task
      await page.fill('[data-testid="new-user-input"]', "Alice");
      await page.click('[data-testid="add-user-button"]');
      await page.fill('[data-testid="new-task-input"]', "Assigned task");
      await page.click('[data-testid="add-task-button"]');
      const uid = await lastAddedTaskID(page)
      page.getByTestId(`assign-task-${uid}`).getByText("Assign to").click();
      await page.getByRole('option', { name: 'Alice' }).first().click();
      // Then, assign the task

      await expect(page.locator('[data-testid="task-list"]')).toContainText(
        "Assigned to: Alice"
      );
    });

    test("should unassign a task", async () => {
      // First, add a user and an assigned task
      await page.fill('[data-testid="new-user-input"]', "Bob");
      await page.click('[data-testid="add-user-button"]');
      await page.fill('[data-testid="new-task-input"]', "Unassign me");
      await page.click('[data-testid="add-task-button"]');
      const assignSelect = page
        .locator('[data-testid^="assign-task-"]:visible')
        .first();
      await assignSelect.selectOption({ label: "Bob" });

      // Then, unassign the task
      const unassignButton = page
        .locator('[data-testid^="unassign-task-"]:visible')
        .first();
      await unassignButton.click();
      await expect(page.locator('[data-testid="task-list"]')).toContainText(
        "Unassigned"
      );
    });

    test("should show error message when deleting a task fails", async () => {
      // Mock the API to return an error
      await page.route("**/api/tasks/*", (route) => {
        route.fulfill({
          status: 400,
          body: JSON.stringify({ detail: "Cannot delete an assigned task" }),
        });
      });

      // Attempt to delete a task
      const deleteButton = page
        .locator('[data-testid^="delete-task-"]:visible')
        .first();
      await deleteButton.click();

      // Check for error message
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
