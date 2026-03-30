# Testing Patterns

**Analysis Date:** 2026-03-30

## Backend Testing

### Test Framework

**Runner:**
- **xUnit** 2.9.x - Primary test framework
- Config: `.csproj` files in `tests/` directory

**Assertion Library:**
- **FluentAssertions** 7.0.0/8.8.0 - Fluent assertion syntax
- Examples: `result.Should().NotBeNull()`, `result.Should().Be(42)`

**Mocking Framework:**
- **Moq** 4.20.72 - Mocking dependencies
- Mock setup: `_mockRepo.Setup(r => r.MethodAsync()).ReturnsAsync(value)`

**Coverage:**
- **coverlet.collector** 6.0.x - Code coverage collection
- Integration with Visual Studio test explorer

**Run Commands:**
```bash
# Run all backend tests
dotnet test lefarma.backend

# Run specific test project
dotnet test lefarma.backend/tests/Lefarma.Tests
dotnet test lefarma.backend/tests/Lefarma.UnitTests
dotnet test lefarma.backend/tests/Lefarma.IntegrationTests

# Run single test by name
dotnet test lefarma.backend --filter "FullyQualifiedName~NotificationServiceTests.SendAsync_ValidRequest"

# Run single test by trait
dotnet test lefarma.backend --filter "Category=Unit"

# Coverage
dotnet test lefarma.backend --collect:"XPlat Code Coverage"
```

### Test File Organization

**Location:**
- Tests in `lefarma.backend/tests/` directory
- Three test projects: `Lefarma.Tests`, `Lefarma.UnitTests`, `Lefarma.IntegrationTests`

**Naming:**
- Test classes: `{Feature}Tests` or `{Component}Tests`
- Examples: `NotificationServiceTests`, `NotificationsApiTests`
- Test methods: `MethodName_Scenario_ExpectedResult`

**Structure:**
```
tests/
├── Lefarma.Tests/              # General feature tests
│   └── Notifications/
│       ├── NotificationServiceTests.cs
│       ├── NotificationsApiTests.cs
│       └── SimpleNotificationTests.cs
├── Lefarma.UnitTests/          # Unit tests (minimal)
│   └── UnitTest1.cs
└── Lefarma.IntegrationTests/    # Integration tests (minimal)
    └── UnitTest1.cs
```

### Test Structure

**Test Pattern (Arrange-Act-Assert):**
```csharp
[Fact]
public async Task SendAsync_ValidRequest_ReturnsSuccessResponse()
{
    // Arrange
    var request = new SendNotificationRequest { ... };
    var notification = new Notification { ... };
    _mockRepository
        .Setup(r => r.CreateAsync(It.IsAny<Notification>(), It.IsAny<CancellationToken>()))
        .ReturnsAsync(notification);

    // Act
    var result = await _service.SendAsync(request);

    // Assert
    Assert.NotNull(result);
    Assert.Equal(1, result.NotificationId);
    Assert.True(result.ChannelResults.ContainsKey("in-app"));
}
```

**Service Tests:**
- Mock all dependencies (`INotificationRepository`, `ILogger`, etc.)
- Setup mock returns in Arrange phase
- Test business logic in isolation
- Use `It.IsAny<T>()` for non-critical parameters

**Integration Tests:**
- Use `WebApplicationFactory<Program>` for full HTTP stack
- Test endpoints via `HttpClient`
- Include auth headers: `client.DefaultRequestHeaders.Add("Authorization", $"Bearer {token}")`
- Test serialization/deserialization
- Example: `public class NotificationsApiTests : IClassFixture<WebApplicationFactory<Program>>`

### Mocking

**Framework:** Moq 4.20.72

**Setup Patterns:**
```csharp
// Setup return value
_mockRepository
    .Setup(r => r.CreateAsync(It.IsAny<Notification>(), It.IsAny<CancellationToken>()))
    .ReturnsAsync(notification);

// Setup for void methods
_mockRepository
    .Setup(r => r.MarkAsReadAsync(notificationId, userId, It.IsAny<CancellationToken>()))
    .Returns(Task.CompletedTask);

// Verify method was called
_mockRepository.Verify(
    r => r.MarkAsReadAsync(notificationId, userId, It.IsAny<CancellationToken>()),
    Times.Once);
```

**What to Mock:**
- Repository interfaces (`I{Entity}Repository`)
- Service interfaces (`I{Feature}Service`)
- Logger interfaces (`ILogger<T>`)
- External services (`IActiveDirectoryService`, `ITemplateService`)

**What NOT to Mock:**
- Domain entities
- DTOs
- Extension methods
- Static methods

**Mock Best Practices:**
- Use `It.IsAny<T>()` for parameters that don't affect test outcome
- Use `It.Is<T>(x => x.Property == value)` for specific matches
- Always verify interactions when behavior matters
- Use `Times.Once()`, `Times.Never()` for precise verification

### Test Data

**DTO Creation:**
```csharp
var request = new SendNotificationRequest
{
    Title = "Test Notification",
    Message = "Test message",
    Type = "info",
    Priority = "normal",
    Category = "system",
    Channels = new List<NotificationChannelRequest>
    {
        new() { ChannelType = "in-app", Recipients = "21" }
    }
};
```

**Entity Creation:**
```csharp
var notification = new Notification
{
    Id = 1,
    Title = request.Title,
    Message = request.Message,
    Type = request.Type,
    Priority = request.Priority,
    Category = request.Category
};
```

**Collections:**
```csharp
var notifications = new List<UserNotification>
{
    new()
    {
        Id = 1,
        UserId = userId,
        IsRead = false,
        Notification = new Notification { ... }
    }
};
```

### Test Types

**Unit Tests:**
- Scope: Individual service methods in isolation
- Location: `Lefarma.Tests/{Feature}/` or `Lefarma.UnitTests/`
- Approach: Mock all dependencies, test business logic
- Example: `NotificationServiceTests.cs`

**Integration Tests:**
- Scope: Full HTTP endpoint testing with request/response
- Location: `Lefarma.Tests/{Feature}/`
- Approach: `WebApplicationFactory`, `HttpClient`, no DB
- Example: `NotificationsApiTests.cs`

### Common Patterns

**Async Testing:**
```csharp
[Fact]
public async Task MethodName_Async_Scenario_ExpectedResult()
{
    // Arrange
    // ...

    // Act
    var result = await _service.MethodAsync();

    // Assert
    result.Should().NotBeNull();
}
```

**Error Testing:**
```csharp
[Fact]
public async Task SendAsync_EmptyTitle_ThrowsArgumentException()
{
    // Arrange
    var request = new SendNotificationRequest { Title = "", ... };

    // Act & Assert
    await Assert.ThrowsAsync<ArgumentException>(() => _service.SendAsync(request));
}
```

**Collection Testing:**
```csharp
[Fact]
public async Task GetUserNotificationsAsync_UnreadOnly_ReturnsOnlyUnread()
{
    // Arrange
    var notifications = new List<UserNotification>
    {
        new() { Id = 1, UserId = userId, IsRead = false },
        new() { Id = 2, UserId = userId, IsRead = true }
    };

    // Act
    var result = await _service.GetUserNotificationsAsync(userId, true);

    // Assert
    Assert.NotNull(result);
    Assert.Single(result);
    Assert.All(result, n => Assert.False(n.IsRead));
}
```

**XML Documentation:**
```csharp
/// <summary>
/// Unit tests for NotificationService
/// Tests core notification logic without external dependencies
/// </summary>
public class NotificationServiceTests
{
    // ...
}
```

## Frontend Testing

### Test Framework

**Runner:**
- **Playwright** 1.58.2 - E2E browser automation
- Config: `playwright.config.ts` in frontend root

**Assertion Library:**
- Playwright built-in assertions (`expect`)
- Example: `await expect(page.locator('input')).toBeVisible()`

**Run Commands:**
```bash
# From lefarma.frontend directory
npx playwright test                    # Run all tests
npx playwright test --grep "test name" # Run specific test
npx playwright test --headed            # Run with visible browser
npx playwright test --debug             # Debug mode with inspector
npx playwright show-report              # View HTML report
```

### Test Configuration

**playwright.config.ts:**
```typescript
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
```

### Test File Organization

**Location:**
- Tests in `lefarma.frontend/tests/` directory
- Co-located with source (separate directory)

**Naming:**
- Test files: `{feature}.spec.ts`
- Examples: `login.spec.ts`

**Structure:**
```
tests/
└── login.spec.ts    # Login flow E2E tests
```

### Test Structure

**Test Pattern:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('debería hacer login con usuario válido', async ({ page }) => {
    // Setup
    const logs: string[] = [];
    page.on('console', (msg) => {
      logs.push(`[${msg.type()}] ${msg.text()}`);
    });

    // Act
    await page.goto('http://localhost:5173/');
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await page.fill('input[type="text"]', '54');
    await page.click('button[type="submit"]');

    await expect(page.locator('input[type="password"]')).toBeVisible({ timeout: 5000 });
    await page.fill('input[type="password"]', 'tt01tt');
    await page.click('button[type="submit"]');

    // Assert
    const currentUrl = page.url();
    expect(currentUrl).toContain('/dashboard');
  });
});
```

**Suite Organization:**
- Use `test.describe()` for logical grouping
- Use `test()` for individual test cases
- Spanish test descriptions: "debería hacer X"

**Console Logging:**
```typescript
// Collect all console logs
const logs: string[] = [];
page.on('console', (msg) => {
  logs.push(`[${msg.type()}] ${msg.text()}`);
});

// Filter and analyze logs
const errorLogs = logs.filter(log =>
  log.toLowerCase().includes('error') &&
  !log.includes('DevTools')
);
```

### Page Object Pattern

**Selectors:**
- Use data attributes when possible: `data-testid="login-button"`
- Use accessible selectors: `input[type="text"]`, `button[type="submit"]`
- Avoid fragile selectors: complex CSS chains

**Wait Strategies:**
```typescript
// Wait for element to be visible
await expect(page.locator('input[type="text"]')).toBeVisible();

// Wait for specific timeout
await page.waitForTimeout(3000);

// Wait for network idle
await page.goto('/', { waitUntil: 'networkidle' });
```

### Test Data

**Form Filling:**
```typescript
await page.fill('input[type="text"]', '54');
await page.fill('input[type="password"]', 'tt01tt');
```

**Button Clicking:**
```typescript
await page.click('button[type="submit"]');
```

### Test Types

**E2E Tests:**
- Scope: Complete user flows from UI to API
- Location: `tests/` directory
- Approach: Playwright browser automation
- Examples: Login flow, form submissions, navigation

### Common Patterns

**Login Flow:**
```typescript
test('debería hacer login con usuario válido', async ({ page }) => {
  // Step 1: Enter username
  await page.goto('http://localhost:5173/');
  await page.fill('input[type="text"]', '54');
  await page.click('button[type="submit"]');

  // Step 2: Enter password
  await expect(page.locator('input[type="password"]')).toBeVisible();
  await page.fill('input[type="password"]', 'tt01tt');
  await page.click('button[type="submit"]');

  // Verify success
  const currentUrl = page.url();
  expect(currentUrl).toContain('/dashboard');
});
```

**Console Log Capture:**
```typescript
test('debería capturar logs de consola', async ({ page }) => {
  const logs: string[] = [];
  page.on('console', (msg) => {
    logs.push(`[${msg.type()}] ${msg.text()}`);
  });

  await page.goto('/');
  await page.waitForTimeout(3000);

  // Analyze logs
  const errorLogs = logs.filter(log => log.toLowerCase().includes('error'));
  expect(errorLogs.length).toBe(0);
});
```

**Error Detection:**
```typescript
// Filter errors (excluding DevTools)
const errorLogs = logs.filter(log =>
  log.toLowerCase().includes('error') &&
  !log.includes('DevTools') &&
  !log.includes('Download React DevTools')
);

// Assert no errors
expect(errorLogs.length).toBe(0);
```

**Network Analysis:**
```typescript
// Detect SSE connection loops
const sseConnectLogs = logs.filter(log => log.includes('SSE') && log.includes('Conectando'));
const sseDisconnectLogs = logs.filter(log => log.includes('SSE') && log.includes('Desconectando'));

console.log(`Conexiones: ${sseConnectLogs.length}`);
console.log(`Desconexiones: ${sseDisconnectLogs.length}`);

// Assert no infinite loop
expect(sseConnectLogs.length).toBeLessThan(4);
```

## Coverage

**Backend:**
- Tools: coverlet.collector
- Target: No enforced minimum
- View: VS Code test explorer or command line

**Frontend:**
- Tools: Not currently configured
- Target: Not enforced
- E2E coverage: Manual via Playwright reports

---

*Testing analysis: 2026-03-30*
