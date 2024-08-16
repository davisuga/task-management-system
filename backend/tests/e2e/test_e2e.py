from playwright.sync_api import Page, expect

def test_task_management_system(page: Page):
    page.goto("http://localhost:3000")

    # Add a user
    page.fill("input[placeholder='New user name']", "John Doe")
    page.click("text=Add User")
    expect(page.locator("text=John Doe")).to_be_visible()

    # Add a task
    page.fill("input[placeholder='New task title']", "Complete project")
    page.click("text=Add Task")
    expect(page.locator("text=Complete project")).to_be_visible()

    # Assign the task to the user
    page.select_option("select", label="John Doe")
    expect(page.locator("text=Assigned to: John Doe")).to_be_visible()

    # Unassign the task
    page.click("text=Unassign")
    expect(page.locator("text=Assign to")).to_be_visible()

    # Remove the user
    page.click("text=Remove")
    expect(page.locator("text=John Doe")).not_to_be_visible()
