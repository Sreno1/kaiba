# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

Kaiba is a Laravel-React productivity application combining todo management with a sophisticated scheduling system. It features a dual-sidebar interface where users manage todos in the main area, access quick notes via a right sidebar, and utilize a comprehensive daily scheduling system via a left sidebar.

**Tech Stack:**
- Backend: Laravel 12 (PHP 8.2+) with Inertia.js
- Frontend: React 18 with Vite
- Styling: Tailwind CSS with Kibo UI components (shadcn/ui based)
- Database: SQLite (default) or MySQL/PostgreSQL
- Authentication: Laravel Sanctum

## Common Development Commands

### Development Environment
```bash
# Start all development services (server, queue, logs, vite)
composer run dev

# Alternative: Start services individually
php artisan serve          # Laravel development server
npm run dev                # Vite dev server with HMR
php artisan queue:listen    # Queue worker
php artisan pail           # Real-time logs
```

### Database Operations
```bash
# Run migrations
php artisan migrate

# Seed initial data
php artisan db:seed --class=TagSeeder

# Fresh migration with seeding
php artisan migrate:fresh --seed
```

### Testing (REQUIRED WORKFLOW)
```bash
# ALWAYS run before making ANY changes
php artisan test

# Run all tests
php artisan test
# Or via composer
composer run test

# Run specific test types
php artisan test --testsuite=Feature
php artisan test --testsuite=Unit

# Run specific test files
php artisan test tests/Feature/TodoTest.php
php artisan test tests/Feature/TodoSearchTest.php
php artisan test tests/Unit/TodoModelTest.php

# Run tests with coverage (optional)
php artisan test --coverage
```

### Build and Assets
```bash
# Development build with HMR
npm run dev

# Production build
npm run build

# Install dependencies
composer install
npm install
```

### Code Quality
```bash
# Laravel Pint (code formatting)
vendor/bin/pint

# Clear various caches
php artisan config:clear
php artisan route:clear
php artisan view:clear
```

## Architecture Overview

### Data Flow Architecture
```
Frontend (React) ↔ Inertia.js ↔ Laravel Routes ↔ Controllers ↔ Models ↔ Database
                     ↓
                Browser localStorage (Schedule data + Quick Notes)
```

### Backend Structure
- **Models**: `User`, `Todo`, `Tag` with Eloquent relationships
- **Controllers**: API controllers in `app/Http/Controllers/Api/` for RESTful operations
- **Authorization**: Policy-based (TodoPolicy) for user-scoped data access
- **Authentication**: Laravel Sanctum with session-based auth

### Frontend Structure
- **Layout**: `AuthenticatedLayout.jsx` with responsive navigation
- **Pages**: Main `Todos.jsx` page with modal-based CRUD operations
- **Components**: 
  - Schedule system (`Components/Schedule/`) with localStorage persistence
  - UI components in `Components/ui/` (shadcn/ui based)
  - Todo-specific components in `Components/Todos/`

### Key Architectural Patterns
1. **Hybrid Storage**: Database for todos/tags, localStorage for schedule/notes
2. **Policy-Based Authorization**: User-scoped data access via TodoPolicy
3. **Component Composition**: Reusable UI components with shadcn/ui patterns
4. **Auto-save with Debouncing**: 2-second debounced saves for schedule data
5. **Midnight Reset System**: Daily schedule resets with 90-day data retention

## Key Components & Features

### Todo Management System
- **Models**: `Todo` (belongs to User, has many Tags), `Tag` (belongs to many Todos)
- **API Endpoints**: `/api/todos` and `/api/tags` with full CRUD operations
- **Features**: Priority levels (low/medium/high), due dates, tag organization, completion tracking
- **Authorization**: User-scoped access via TodoPolicy

### Schedule System (Client-side)
- **Storage**: localStorage with automatic archival (90-day retention)
- **Components**: `ScheduleTable.jsx`, `ScheduleHistory.jsx`, `Schedule.jsx`
- **Features**: 4-column daily planning (Item, Time, Points, Done), template system, historical views
- **Reset Logic**: Automatic midnight reset using recursive setTimeout

### UI Component System
- **Base**: Kibo UI components (shadcn/ui based) in `resources/js/Components/ui/`
- **Configuration**: `components.json` with "new-york" style, stone base color
- **Available Kibo Components**: 40+ components including kanban, calendar, gantt, rating, etc.
- **Theme System**: Multiple themes (light, dark, solarized) with CSS custom properties

### Authentication & Security
- **System**: Laravel Breeze with React frontend
- **API Auth**: Laravel Sanctum tokens
- **Authorization**: Policy-based row-level security
- **Data Isolation**: User-scoped todos, global tags

## Testing Development Rules (MANDATORY)

**⚠️ CRITICAL: These rules must be followed for ALL development work**

### Before Making ANY Changes
```bash
# 1. ALWAYS run tests first to ensure clean baseline
php artisan test
```

### When Adding New Features
```bash
# 1. Write tests FIRST (Test-Driven Development recommended)
php artisan make:test Feature/NewFeatureTest

# 2. Run the failing test
php artisan test tests/Feature/NewFeatureTest.php

# 3. Implement the feature
# 4. Run tests to see them pass
php artisan test tests/Feature/NewFeatureTest.php

# 5. Run ALL tests to ensure no regressions
php artisan test
```

### When Modifying Existing Features
```bash
# 1. Run existing tests first
php artisan test tests/Feature/TodoTest.php

# 2. Make your changes
# 3. Run specific tests again
php artisan test tests/Feature/TodoTest.php

# 4. Run all tests
php artisan test
```

### Before Committing Changes
```bash
# MANDATORY: All tests must pass before committing
php artisan test

# Only commit if output shows: "Tests: X passed"
git add .
git commit -m "Add feature with tests"
```

### Test Requirements for New Features
- **Feature Tests**: Test all API endpoints and user workflows
- **Unit Tests**: Test complex model methods and business logic  
- **Security Tests**: Test authorization and data isolation
- **Edge Cases**: Test validation, error handling, empty states

### Existing Test Files (Use as Examples)
- `tests/Feature/TodoTest.php` - Todo CRUD operations
- `tests/Feature/TodoSearchTest.php` - Search functionality  
- `tests/Feature/TagTest.php` - Tag management
- `tests/Unit/TodoModelTest.php` - Model behavior

### Test Commands Reference
```bash
# All tests (run before every commit)
php artisan test

# Specific test files  
php artisan test tests/Feature/TodoTest.php
php artisan test tests/Unit/TodoModelTest.php

# Test specific method
php artisan test --filter test_user_can_create_todo

# Test with coverage
php artisan test --coverage
```

## Development Guidelines

### File Organization
- **Backend**: Follow Laravel conventions (`app/Models/`, `app/Http/Controllers/`, etc.)
- **Frontend**: Components in `resources/js/Components/` with feature-based grouping
- **UI Components**: shadcn/ui components in `resources/js/Components/ui/`
- **Styles**: Tailwind classes with CSS custom properties in `resources/css/`

### API Development
- Use API Resource controllers with policy authorization
- Implement proper validation in controller methods
- Eager load relationships to prevent N+1 queries
- Return consistent JSON responses with appropriate HTTP status codes

### Frontend Development
- Use functional components with React hooks
- Implement debounced auto-save for performance
- Use Inertia.js for SPA-like navigation without full page reloads
- Follow shadcn/ui patterns for new UI components

### Testing Strategy (CRITICAL - ALWAYS FOLLOW)
- **Backend**: Feature tests for API endpoints, Unit tests for business logic
- **Configuration**: PHPUnit with in-memory SQLite for testing
- **Test Environment**: Isolated test database with array drivers for speed
- **Current Test Coverage**: 38 tests, 124 assertions - ALL PASSING ✅
  - Feature Tests: 27 tests (Todo CRUD, Search, Tags)
  - Unit Tests: 11 tests (Model behavior, relationships)
- **Factories**: Todo and Tag factories with realistic test data
- **Note**: Some legacy Laravel Breeze tests fail due to refactoring (Pages->pages). Use filtered tests: `php artisan test --filter="Todo|Tag"`
- **MANDATORY WORKFLOW**: See "Testing Development Rules" below

### State Management Patterns
- **Server State**: API calls with manual cache invalidation
- **Local State**: React useState for component state
- **Persistent Storage**: localStorage for schedule data (client-side only)
- **Cross-component**: State lifting and React Context for todos

## Kibo UI Component Integration

This project uses Kibo UI components, which are shadcn/ui based components with additional advanced components. Available components include:

**Basic Components**: button, card, dialog, input, checkbox, select, badge, textarea
**Advanced Components**: kanban, calendar, gantt, rating, table, tree, video-player, editor

To add new Kibo UI components, ensure they follow the existing patterns in `resources/js/Components/ui/` and integrate with the Tailwind CSS design system.

## Environment Setup Notes

- **Local Development**: Uses Laravel Valet for local domains
- **Asset Building**: Vite with React plugin for fast development and optimized builds
- **Concurrent Development**: `composer run dev` starts all necessary services simultaneously
- **Database**: SQLite by default (lightweight for development), easily switched to MySQL/PostgreSQL
- **Hot Module Replacement**: Vite provides instant updates during development

## Key Files to Understand

- `docs/technical-overview.md` - Comprehensive technical documentation
- `routes/api.php` - API endpoint definitions
- `app/Policies/TodoPolicy.php` - Authorization logic
- `resources/js/Pages/Todos.jsx` - Main application interface
- `resources/js/Components/Schedule/` - Schedule system implementation
- `components.json` - UI component configuration
- `tailwind.config.js` - Tailwind CSS configuration with design tokens
