# Cypress Testing Suite - Excellence Level

## Overview

Comprehensive Cypress testing suite organized by testing type and domain, following the same excellence patterns as the main `tests/` folder.

## Testing Structure

```
cypress/
├── README.md                    # This file
├── component/                   # Component testing (CT)
│   ├── router/                  # Router component tests
│   ├── forms/                   # Form component tests
│   ├── navigation/              # Navigation component tests
│   └── theme/                   # Theme component tests
├── e2e/                         # End-to-end testing
│   ├── router/                  # Router E2E tests
│   ├── navigation/              # Navigation E2E tests
│   ├── theme/                   # Theme E2E tests
│   └── user-flows/              # Complete user journey tests
├── integration/                 # Integration testing
│   ├── router-navigation/       # Router + navigation integration
│   ├── theme-persistence/       # Theme + storage integration
│   └── api-integration/         # API integration tests
├── fixtures/                    # Test data and fixtures
│   ├── router/                  # Router test data
│   ├── api-responses/           # Mock API responses
│   └── user-data/               # Test user data
├── support/                     # Cypress support files
│   ├── commands.ts              # Custom Cypress commands
│   ├── e2e.ts                   # E2E testing support
│   ├── component.ts             # Component testing support
│   └── component-index.html     # Component testing HTML template
├── downloads/                   # Test downloads
├── screenshots/                 # Test screenshots
└── videos/                      # Test videos
```

## Testing Types

### 1. **Component Testing (CT)**

- **Purpose**: Test Vue components in isolation
- **Location**: `cypress/component/`
- **Focus**: Component behavior, props, events, slots
- **Router Components**: Navigation, route guards, breadcrumbs

### 2. **End-to-End Testing (E2E)**

- **Purpose**: Test complete user workflows in real browser
- **Location**: `cypress/e2e/`
- **Focus**: User journeys, cross-page navigation, full application flows
- **Router E2E**: Complete navigation flows, URL changes, browser history

### 3. **Integration Testing**

- **Purpose**: Test component interactions and system integration
- **Location**: `cypress/integration/`
- **Focus**: Multiple components working together
- **Router Integration**: Router + navigation + state management

## Router Testing Coverage

### Component Tests

- **Navigation Components**: Tab menus, breadcrumbs, route links
- **Router Guards**: Access control, validation, error handling
- **Route Metadata**: Title updates, meta tags, SEO

### E2E Tests

- **Navigation Flows**: Complete user navigation journeys
- **URL Management**: Direct URL access, browser back/forward
- **Route Transitions**: Page transitions, loading states

### Integration Tests

- **Router + Store**: Navigation state synchronization
- **Router + Theme**: Theme persistence across routes
- **Router + API**: Route-based data loading

## Running Tests

### All Tests

```bash
# Run all Cypress tests
yarn test:e2e

# Open Cypress Test Runner
yarn test:e2e:open
```

### Specific Test Types

```bash
# Component tests only
npx cypress run --component

# E2E tests only
npx cypress run --e2e

# Specific test file
npx cypress run --spec "cypress/e2e/router/navigation.cy.ts"
```

### Component Testing

```bash
# Open component test runner
npx cypress open --component

# Run component tests headless
npx cypress run --component
```

## Writing Tests

### Component Test Example

```typescript
import NavigationComponent from '../../src/components/NavigationComponent.vue';

describe('Navigation Component', () => {
  it('should render navigation links', () => {
    cy.mountWithRouter(NavigationComponent, {
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/about', component: { template: '<div>About</div>' } },
      ],
    });

    cy.get('[data-cy="nav-link"]').should('have.length', 2);
  });
});
```

### E2E Test Example

```typescript
describe('Router Navigation E2E', () => {
  it('should navigate between pages', () => {
    cy.visit('/');
    cy.get('[data-cy="nav-about"]').click();
    cy.url().should('include', '/about');
    cy.get('h1').should('contain', 'About');
  });
});
```

## Test Data

### Fixtures

- **Router Fixtures**: Route configurations, navigation states
- **API Fixtures**: Mock responses for route-based data
- **User Fixtures**: Test user data and preferences

### Custom Commands

- **Router Commands**: Navigate, check URL, verify route metadata
- **Component Commands**: Mount with router, verify props
- **API Commands**: Mock responses, intercept requests

## Best Practices

### 1. **Test Organization**

- Group tests by feature/domain
- Use descriptive test names
- Follow AAA pattern (Arrange, Act, Assert)

### 2. **Selectors**

- Use `data-cy` attributes for test selectors
- Avoid CSS class selectors
- Use semantic selectors when possible

### 3. **Router Testing**

- Test navigation flows, not just individual routes
- Verify URL changes and browser history
- Test error scenarios and fallbacks

### 4. **Component Testing**

- Test component behavior, not implementation
- Use realistic props and data
- Test user interactions and events

### 5. **Performance**

- Use appropriate wait strategies
- Mock external dependencies
- Clean up test data

## Continuous Integration

### Test Execution

- All tests run on pull requests
- Component tests run on component changes
- E2E tests run on critical path changes

### Test Reporting

- Screenshots on failure
- Video recording for E2E tests
- Coverage reports for component tests

## Debugging

### Test Failures

- Check screenshots in `cypress/screenshots/`
- Review videos in `cypress/videos/`
- Use Cypress Test Runner for interactive debugging

### Component Debugging

- Use browser dev tools in component tests
- Add `cy.debug()` commands for breakpoints
- Verify component mounting and props

This comprehensive testing structure ensures excellent coverage of the router system and all application functionality while maintaining the same excellence standards as the main test suite.
