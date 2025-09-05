# Testing Guide for Kaiba Todo App

## Table of Contents
- [Why Testing Matters](#why-testing-matters)
- [Laravel Backend Testing](#laravel-backend-testing)
- [Frontend Testing (Future)](#frontend-testing-future)
- [When to Write Tests](#when-to-write-tests)
- [Running Tests](#running-tests)
- [Test Examples](#test-examples)

## Why Testing Matters

### During Development (Immediate Benefits)
- **Catch bugs early** - Find issues before manual testing
- **Faster development** - No need to manually test every feature after changes
- **Confidence in changes** - Refactor without fear of breaking things
- **Better code design** - Tests force you to write cleaner, more modular code
- **Living documentation** - Tests show how your code is supposed to work

### Real-World Example
When we refactored the file structure, the tests immediately caught that the Pages directory path changed. Without tests, you might have deployed broken code!

### As You Scale
- **Regression prevention** - Ensure old features don't break when adding new ones
- **Team collaboration** - Others can understand your code through tests
- **Production confidence** - Deploy knowing your core features work

## Laravel Backend Testing

Laravel comes with PHPUnit pre-configured and ready to use. It uses an in-memory SQLite database for tests, so they run fast and don't affect your real data.

### Test Types

#### 1. Feature Tests (`tests/Feature/`)
Test your application's behavior from a user's perspective - API endpoints, full workflows.

```php
// Example: Testing todo creation
public function test_user_can_create_todo()
{
    $user = User::factory()->create();
    
    $response = $this->actingAs($user)->post('/todos', [
        'title' => 'Buy groceries',
        'description' => 'Milk, bread, eggs',
        'priority' => 'high'
    ]);
    
    $response->assertStatus(201);
    $response->assertJson(['title' => 'Buy groceries']);
    $this->assertDatabaseHas('todos', ['title' => 'Buy groceries']);
}
```

#### 2. Unit Tests (`tests/Unit/`)
Test individual classes, methods, and logic in isolation.

```php
// Example: Testing model relationships
public function test_todo_belongs_to_user()
{
    $todo = Todo::factory()->create();
    $this->assertInstanceOf(User::class, $todo->user);
}

public function test_todo_can_have_multiple_tags()
{
    $todo = Todo::factory()->create();
    $tag1 = Tag::factory()->create();
    $tag2 = Tag::factory()->create();
    
    $todo->tags()->attach([$tag1->id, $tag2->id]);
    
    $this->assertEquals(2, $todo->tags()->count());
}
```

### Key Testing Concepts

#### Factories
Laravel uses factories to create test data easily:
```php
// Creates a user with random data
$user = User::factory()->create();

// Creates a todo with specific data
$todo = Todo::factory()->create([
    'title' => 'Specific Title',
    'user_id' => $user->id
]);
```

#### Assertions
Common assertions you'll use:
```php
// HTTP Response assertions
$response->assertStatus(200);           // Check status code
$response->assertJson(['key' => 'value']); // Check JSON response
$response->assertSee('Some Text');      // Check if text appears

// Database assertions
$this->assertDatabaseHas('todos', ['title' => 'Test']);  // Check record exists
$this->assertDatabaseCount('todos', 5); // Check record count

// General assertions
$this->assertTrue($condition);
$this->assertEquals($expected, $actual);
$this->assertInstanceOf(User::class, $user);
```

#### Authentication in Tests
```php
// Create and authenticate a user for the test
$user = User::factory()->create();
$response = $this->actingAs($user)->get('/todos');
```

## Frontend Testing (Future Setup)

When you're ready to add frontend testing, here's what you'll use:

### Recommended Stack
- **Vitest** - Fast test runner (better than Jest for Vite projects)
- **React Testing Library** - Test React components the way users interact with them
- **@testing-library/jest-dom** - Additional matchers for DOM testing

### Setup Commands (Future)
```bash
npm install --save-dev vitest @vitejs/plugin-react
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev jsdom
```

### Frontend Test Examples (Future)
```javascript
// Component test example
import { render, screen } from '@testing-library/react'
import TodoCard from '@/features/todos/TodoCard'

test('TodoCard displays todo title and description', () => {
  const todo = {
    id: 1,
    title: 'Buy groceries',
    description: 'Milk, bread, eggs',
    completed: false
  }
  
  render(<TodoCard todo={todo} />)
  
  expect(screen.getByText('Buy groceries')).toBeInTheDocument()
  expect(screen.getByText('Milk, bread, eggs')).toBeInTheDocument()
})

// Hook test example
import { renderHook, act } from '@testing-library/react'
import { useTodos } from '@/features/todos/TodosContext'

test('useTodos handles search correctly', async () => {
  const { result } = renderHook(() => useTodos())
  
  act(() => {
    result.current.handleSearch('groceries')
  })
  
  // Assert search results
})
```

## When to Write Tests

### Always Write Tests For:
1. **New features** - Write tests as you build
2. **Bug fixes** - Write a test that reproduces the bug, then fix it
3. **Critical business logic** - Todo creation, user authentication, etc.
4. **Complex algorithms** - Search functionality, filtering, sorting

### Consider Writing Tests For:
1. **Edge cases** - Empty states, validation errors
2. **Integration points** - API endpoints, database operations
3. **User workflows** - Complete todo creation flow

### Don't Stress About:
1. **Simple getters/setters** - Unless they have logic
2. **Third-party library code** - It's already tested
3. **Configuration files** - Usually not worth testing

## Running Tests

### Basic Commands
```bash
# Run all tests
php artisan test

# Run specific test file
php artisan test tests/Feature/TodoTest.php

# Run specific test method
php artisan test --filter test_user_can_create_todo

# Run tests with coverage (if configured)
php artisan test --coverage

# Run tests and watch for changes (Laravel 10+)
php artisan test --watch
```

### Test Output
```bash
PASS  Tests\Feature\TodoTest
✓ user can create todo
✓ user can view their todos
✓ user cannot view other users todos
✓ user can update their todo
✓ user can delete their todo
✓ user can search todos

Tests:  6 passed
Duration: 0.15s
```

## Test Examples

### 1. Todo CRUD Operations
```php
<?php
// tests/Feature/TodoTest.php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Todo;
use App\Models\Tag;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TodoTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_create_todo()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)->post('/todos', [
            'title' => 'Buy groceries',
            'description' => 'Milk, bread, eggs',
            'priority' => 'high',
            'status' => 'todo'
        ]);
        
        $response->assertStatus(201);
        $response->assertJson([
            'title' => 'Buy groceries',
            'priority' => 'high'
        ]);
        
        $this->assertDatabaseHas('todos', [
            'title' => 'Buy groceries',
            'user_id' => $user->id
        ]);
    }

    public function test_user_can_view_their_todos()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        
        // Create todos for both users
        Todo::factory()->create(['user_id' => $user->id, 'title' => 'My Todo']);
        Todo::factory()->create(['user_id' => $otherUser->id, 'title' => 'Other Todo']);
        
        $response = $this->actingAs($user)->get('/todos');
        
        $response->assertStatus(200);
        $response->assertJsonCount(1); // Should only see own todos
        $response->assertJsonFragment(['title' => 'My Todo']);
        $response->assertJsonMissing(['title' => 'Other Todo']);
    }

    public function test_user_cannot_view_other_users_todos()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $otherTodo = Todo::factory()->create(['user_id' => $otherUser->id]);
        
        $response = $this->actingAs($user)->get("/todos/{$otherTodo->id}");
        
        $response->assertStatus(403); // Forbidden
    }

    public function test_todo_title_is_required()
    {
        $user = User::factory()->create();
        
        $response = $this->actingAs($user)->post('/todos', [
            'description' => 'Some description'
            // Missing title
        ]);
        
        $response->assertStatus(422); // Validation error
        $response->assertJsonValidationErrors(['title']);
    }
}
```

### 2. Todo Search Functionality
```php
<?php
// tests/Feature/TodoSearchTest.php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Todo;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TodoSearchTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_search_todos_by_title()
    {
        $user = User::factory()->create();
        
        // Create todos with different titles
        Todo::factory()->create([
            'user_id' => $user->id,
            'title' => 'Buy groceries',
            'description' => 'Milk and bread'
        ]);
        
        Todo::factory()->create([
            'user_id' => $user->id,
            'title' => 'Walk the dog',
            'description' => 'Evening walk'
        ]);
        
        Todo::factory()->create([
            'user_id' => $user->id,
            'title' => 'Buy birthday gift',
            'description' => 'For mom'
        ]);
        
        // Import todos to search index
        \Artisan::call('scout:import', ['model' => 'App\\Models\\Todo']);
        
        // Search for "buy"
        $response = $this->actingAs($user)->get('/todos-search?q=buy');
        
        $response->assertStatus(200);
        $response->assertJsonCount(2); // Should find 2 todos with "buy"
    }

    public function test_search_returns_all_todos_when_query_is_empty()
    {
        $user = User::factory()->create();
        Todo::factory()->count(3)->create(['user_id' => $user->id]);
        
        $response = $this->actingAs($user)->get('/todos-search?q=');
        
        $response->assertStatus(200);
        $response->assertJsonCount(3);
    }

    public function test_search_only_returns_user_todos()
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        
        Todo::factory()->create([
            'user_id' => $user->id,
            'title' => 'My grocery list'
        ]);
        
        Todo::factory()->create([
            'user_id' => $otherUser->id,
            'title' => 'Their grocery list'
        ]);
        
        \Artisan::call('scout:import', ['model' => 'App\\Models\\Todo']);
        
        $response = $this->actingAs($user)->get('/todos-search?q=grocery');
        
        $response->assertStatus(200);
        $response->assertJsonCount(1); // Should only find user's todo
    }
}
```

### 3. Unit Test for Models
```php
<?php
// tests/Unit/TodoTest.php

namespace Tests\Unit;

use App\Models\Todo;
use App\Models\User;
use App\Models\Tag;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TodoTest extends TestCase
{
    use RefreshDatabase;

    public function test_todo_belongs_to_user()
    {
        $todo = Todo::factory()->create();
        
        $this->assertInstanceOf(User::class, $todo->user);
    }

    public function test_todo_can_have_multiple_tags()
    {
        $todo = Todo::factory()->create();
        $tags = Tag::factory()->count(3)->create();
        
        $todo->tags()->attach($tags->pluck('id'));
        
        $this->assertEquals(3, $todo->tags()->count());
    }

    public function test_todo_search_array_contains_searchable_fields()
    {
        $todo = Todo::factory()->create([
            'title' => 'Test Title',
            'description' => 'Test Description',
            'priority' => 'high',
            'status' => 'todo'
        ]);
        
        $searchArray = $todo->toSearchableArray();
        
        $this->assertArrayHasKey('title', $searchArray);
        $this->assertArrayHasKey('description', $searchArray);
        $this->assertArrayHasKey('priority', $searchArray);
        $this->assertArrayHasKey('status', $searchArray);
        
        $this->assertEquals('Test Title', $searchArray['title']);
        $this->assertEquals('high', $searchArray['priority']);
    }
}
```

## Development Workflow with Tests

### 1. Test-Driven Development (TDD) - Recommended for Learning
```bash
# 1. Write a failing test first
php artisan make:test TodoTagTest --feature

# 2. Run test (should fail)
php artisan test tests/Feature/TodoTagTest.php

# 3. Write minimal code to make it pass
# 4. Refactor if needed
# 5. Repeat
```

### 2. Test-After Development - More Common
```bash
# 1. Build your feature
# 2. Write tests to cover it
php artisan make:test TodoExportTest --feature

# 3. Run tests to verify
php artisan test
```

### 3. Daily Testing Workflow
```bash
# Before making changes
php artisan test

# After making changes
php artisan test

# Before committing
php artisan test
```

## Quick Reference

### Creating Test Files
```bash
# Feature test (for endpoints/workflows)
php artisan make:test TodoTest --feature

# Unit test (for models/classes)
php artisan make:test TodoTest --unit

# Specific directory
php artisan make:test Auth/LoginTest --feature
```

### Common Patterns

#### Testing API Endpoints
```php
$response = $this->actingAs($user)
    ->postJson('/api/todos', $data)
    ->assertStatus(201)
    ->assertJson(['title' => 'Expected Title']);
```

#### Testing Validation
```php
$response = $this->post('/todos', [])
    ->assertStatus(422)
    ->assertJsonValidationErrors(['title']);
```

#### Testing Database Changes
```php
$this->assertDatabaseHas('todos', ['title' => 'New Todo']);
$this->assertDatabaseMissing('todos', ['id' => $deletedId]);
$this->assertDatabaseCount('todos', 5);
```

## Your Testing Setup - Ready to Use!

### What's Already Set Up ✅

1. **Laravel Backend Testing Foundation**
   - PHPUnit configured with SQLite in-memory database
   - Test environment isolated from your real data
   - Factories for User, Todo, and Tag models

2. **Comprehensive Test Suite**
   - **Feature Tests**: 19 tests covering todo CRUD, search, and tags
   - **Unit Tests**: 11 tests for model behavior and relationships
   - **All tests passing**: 30 passed tests with 102 assertions

3. **Test Files Created**:
   - `tests/Feature/TodoTest.php` - Todo CRUD operations
   - `tests/Feature/TodoSearchTest.php` - Search functionality 
   - `tests/Feature/TagTest.php` - Tag management
   - `tests/Unit/TodoModelTest.php` - Model behavior

### How to Use Tests in Your Daily Development

#### **Scenario 1: Adding a New Feature**
```bash
# 1. Write a test first (optional but recommended for learning)
php artisan make:test Feature/TodoExportTest

# 2. Run tests to see it fail
php artisan test tests/Feature/TodoExportTest.php

# 3. Build your feature
# 4. Run tests to see it pass
php artisan test tests/Feature/TodoExportTest.php

# 5. Run all tests to ensure nothing broke
php artisan test
```

#### **Scenario 2: Fixing a Bug**
```bash
# 1. Write a test that reproduces the bug
php artisan test tests/Feature/TodoTest.php --filter test_bug_reproduction

# 2. Fix the bug
# 3. Run the test to verify the fix
php artisan test tests/Feature/TodoTest.php --filter test_bug_reproduction

# 4. Run all tests to ensure no regressions
php artisan test
```

#### **Scenario 3: Refactoring Code**
```bash
# 1. Run tests before refactoring
php artisan test

# 2. Refactor your code
# 3. Run tests after refactoring
php artisan test

# If tests pass, your refactoring is safe!
```

#### **Scenario 4: Before Committing Changes**
```bash
# Always run tests before committing
php artisan test

# If tests pass, you're good to commit
git add .
git commit -m "Add new feature with tests"
```

### Practical Examples from Your Codebase

#### **Testing a New Todo Priority Feature**
```php
// Test for a new "urgent" priority
public function test_user_can_create_urgent_priority_todo()
{
    $user = User::factory()->create();
    
    $response = $this->actingAs($user)->postJson('/todos', [
        'title' => 'Fix critical bug',
        'priority' => 'urgent'  // New priority level
    ]);
    
    $response->assertStatus(201);
    $response->assertJson(['priority' => 'urgent']);
}
```

#### **Testing Todo Filtering**
```php
public function test_user_can_filter_todos_by_status()
{
    $user = User::factory()->create();
    
    Todo::factory()->create(['user_id' => $user->id, 'status' => 'completed']);
    Todo::factory()->create(['user_id' => $user->id, 'status' => 'todo']);
    
    $response = $this->actingAs($user)->getJson('/todos?status=completed');
    
    $response->assertJsonCount(1);
    $response->assertJsonFragment(['status' => 'completed']);
}
```

### When Tests Fail - Debugging Tips

1. **Read the error message carefully**
2. **Check the line number** - it shows exactly where the failure occurred
3. **Use `dd()` for debugging** in tests:
   ```php
   $response = $this->getJson('/todos');
   dd($response->json()); // Dumps response content
   ```

4. **Common issues**:
   - Missing authentication: Use `$this->actingAs($user)`
   - Wrong HTTP method: Check if you're using `getJson()` vs `postJson()`
   - Database state: Each test starts with a fresh database

### Measuring Your Test Coverage

```bash
# Generate test coverage report (if phpunit/xdebug is configured)
php artisan test --coverage

# Or run specific test suites
php artisan test tests/Feature/ --coverage
php artisan test tests/Unit/ --coverage
```

## Next Steps

1. **Start Using Tests Daily** - Run `php artisan test` before every commit
2. **Add Tests for New Features** - Write tests as you build new functionality
3. **Learn from Existing Tests** - Study the provided tests to understand patterns
4. **Consider Frontend Testing** - When your JavaScript gets complex, add Vitest setup

### Frontend Testing Setup (Future)

When ready, here's the setup for React/JavaScript testing:

```bash
# Install testing dependencies
npm install --save-dev vitest @vitejs/plugin-react
npm install --save-dev @testing-library/react @testing-library/jest-dom
npm install --save-dev jsdom happy-dom

# Add to package.json scripts:
# "test": "vitest"
# "test:ui": "vitest --ui"
```

**Vitest Config Example** (`vite.config.js`):
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',
  },
})
```

Remember: **Perfect is the enemy of good**. You now have a solid testing foundation - use it, improve it gradually, and let it give you confidence as you build!