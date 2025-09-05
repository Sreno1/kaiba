# Kaiba Database System Documentation

## Current Database Architecture

### Overview
Kaiba uses a well-designed SQLite database optimized for personal productivity and small team usage. The system employs Laravel's Eloquent ORM with proper relationships, indexing, and security policies.

### Database Engine: SQLite
- **Location**: `database/database.sqlite`
- **Size**: ~172KB (as of current deployment)
- **Performance**: Optimized with composite indexes and proper query patterns
- **Deployment**: Single file, no server dependencies

### Data Models & Relationships

```
Users (1) ──→ (Many) Todos (Many) ──→ (Many) Tags
                                   [todo_tag pivot table]
```

#### Core Tables

**users**
- Standard Laravel authentication table
- Fields: id, name, email, email_verified_at, password, remember_token, timestamps
- Security: Bcrypt password hashing, email verification support

**todos**
- Main task management table
- Fields: id, title, description, completed, priority, due_date, status, user_id, timestamps
- Priority: enum('low', 'medium', 'high') - default 'medium'
- Status: enum('backlog', 'todo', 'working', 'qa', 'in_review', 'completed')
- Search: Laravel Scout integration for full-text search
- Security: Row-level access via TodoPolicy

**tags**
- Simple tagging system (shared across all users)
- Fields: id, name, color, description, timestamps
- Colors: Hex color codes for UI display
- Global scope: All users can see and use all tags

**todo_tag**
- Many-to-many pivot table
- Fields: id, todo_id, tag_id, timestamps
- Constraints: Unique(todo_id, tag_id) to prevent duplicates
- Cascading deletes: Remove associations when todos/tags deleted

### Performance Optimizations

#### Database Indexes
```sql
-- Composite index for user-scoped status queries
idx_todos_user_status (user_id, status)

-- Individual indexes for common queries
idx_todos_due_date (due_date)
idx_todos_created_at (created_at)

-- Pivot table indexes for tag filtering
idx_todo_tag_todo_id (todo_id)
idx_todo_tag_tag_id (tag_id)
```

#### Query Optimization
- Eager loading with relationships: `Todo::with('tags')->get()`
- User-scoped queries prevent unauthorized access
- Composite indexes optimize common query patterns
- Laravel Scout provides efficient search functionality

### Security Model

#### Row-Level Security (TodoPolicy)
```php
// Users can only access their own todos
$user->id === $todo->user_id

// Enforced at policy level for all CRUD operations:
// - view, create, update, delete
```

#### Data Isolation
- **Todos**: Strictly user-scoped via TodoPolicy
- **Tags**: Global (shared across users) - consider making user-scoped for production
- **Authentication**: Laravel Sanctum with session-based auth

---

## Production Deployment Best Practices (SQLite)

### When to Use SQLite in Production

#### ✅ Recommended For:
- **Personal/Small Team Usage** (1-10 concurrent users)
- **Self-hosted Deployments** where simplicity is key
- **Budget-conscious Deployments** (no database server costs)
- **Simple Hosting Environments** (shared hosting, VPS without DB management)
- **Read-heavy Applications** with occasional writes

#### ❌ Not Recommended For:
- **High Concurrency** (>10 simultaneous writers)
- **Large Teams** (>50 users)
- **Complex Analytics** requiring advanced SQL features
- **Real-time Collaboration** with frequent updates

### SQLite Production Configuration

#### 1. Environment Configuration
```bash
# .env for production SQLite
DB_CONNECTION=sqlite
DB_DATABASE=/path/to/production/database.sqlite
DB_FOREIGN_KEYS=true

# Optimize for production
DB_PRAGMA_JOURNAL_MODE=WAL
DB_PRAGMA_SYNCHRONOUS=NORMAL
DB_PRAGMA_CACHE_SIZE=10000
DB_PRAGMA_TEMP_STORE=MEMORY
```

#### 2. Laravel Configuration Optimizations
```php
// config/database.php - SQLite production settings
'sqlite' => [
    'driver' => 'sqlite',
    'database' => env('DB_DATABASE', database_path('database.sqlite')),
    'prefix' => '',
    'foreign_key_constraints' => env('DB_FOREIGN_KEYS', true),
    'busy_timeout' => 30000, // 30 seconds for busy database
    'journal_mode' => env('DB_PRAGMA_JOURNAL_MODE', 'WAL'),
    'synchronous' => env('DB_PRAGMA_SYNCHRONOUS', 'NORMAL'),
    'cache_size' => env('DB_PRAGMA_CACHE_SIZE', 10000),
    'temp_store' => env('DB_PRAGMA_TEMP_STORE', 'MEMORY'),
],
```

#### 3. File System Considerations
```bash
# Ensure proper permissions
chmod 664 database/database.sqlite
chmod 775 database/

# Backup location (writable by web server)
mkdir -p storage/backups
chmod 775 storage/backups

# Use WAL mode for better concurrent read performance
sqlite3 database.sqlite "PRAGMA journal_mode=WAL;"
```

### Backup Strategy for Production SQLite

#### Daily Automated Backups
```bash
#!/bin/bash
# Script: backup-sqlite.sh

DATE=$(date +%Y%m%d_%H%M%S)
DB_PATH="/path/to/kaiba/database/database.sqlite"
BACKUP_DIR="/path/to/kaiba/storage/backups"
BACKUP_NAME="kaiba_backup_$DATE.sqlite"

# Create backup with VACUUM to optimize
sqlite3 "$DB_PATH" ".backup '$BACKUP_DIR/$BACKUP_NAME'"

# Keep only last 30 days of backups
find "$BACKUP_DIR" -name "kaiba_backup_*.sqlite" -mtime +30 -delete

# Optional: Compress older backups
find "$BACKUP_DIR" -name "kaiba_backup_*.sqlite" -mtime +7 -exec gzip {} \;
```

#### Laravel Backup Integration
```php
// Add to app/Console/Commands/BackupDatabase.php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class BackupDatabase extends Command
{
    protected $signature = 'db:backup';
    protected $description = 'Backup SQLite database';

    public function handle()
    {
        $dbPath = database_path('database.sqlite');
        $backupPath = storage_path('backups/database_' . date('Y-m-d_H-i-s') . '.sqlite');
        
        if (!file_exists(dirname($backupPath))) {
            mkdir(dirname($backupPath), 0755, true);
        }
        
        copy($dbPath, $backupPath);
        $this->info("Database backed up to: $backupPath");
    }
}
```

### Monitoring & Maintenance

#### Health Checks
```php
// Add to routes/web.php or create dedicated health check
Route::get('/health/database', function () {
    try {
        \DB::select('SELECT 1');
        $size = filesize(database_path('database.sqlite'));
        return response()->json([
            'status' => 'healthy',
            'size_mb' => round($size / 1024 / 1024, 2),
            'connection' => 'sqlite'
        ]);
    } catch (\Exception $e) {
        return response()->json(['status' => 'unhealthy', 'error' => $e->getMessage()], 500);
    }
});
```

#### Performance Monitoring
```bash
# Monitor database size
ls -lh database/database.sqlite

# Check WAL file size (should be reset periodically)
ls -lh database/database.sqlite-wal

# SQLite integrity check
sqlite3 database.sqlite "PRAGMA integrity_check;"

# Analyze query performance
sqlite3 database.sqlite "EXPLAIN QUERY PLAN SELECT * FROM todos WHERE user_id = 1;"
```

---

## Migration to PostgreSQL (When Needed)

### When to Migrate

#### Migration Triggers:
- **User Base** exceeds 50 active users
- **Concurrent Writers** causing SQLite locking issues
- **Advanced Features** needed (JSON queries, full-text search, etc.)
- **Reporting Requirements** needing complex analytics
- **Team Collaboration** features requiring real-time updates

### Step-by-Step Migration Guide

#### 1. Install PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (Homebrew)
brew install postgresql
brew services start postgresql

# Create database and user
sudo -u postgres createuser --interactive kaiba_user
sudo -u postgres createdb kaiba_production -O kaiba_user
```

#### 2. Laravel Configuration
```bash
# Install PHP PostgreSQL extension
sudo apt install php-pgsql  # Ubuntu
# or
brew install php@8.2-pgsql  # macOS

# Update .env
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=kaiba_production
DB_USERNAME=kaiba_user
DB_PASSWORD=secure_password
```

#### 3. Update Database Configuration
```php
// config/database.php - Ensure PostgreSQL config exists
'pgsql' => [
    'driver' => 'pgsql',
    'url' => env('DB_URL'),
    'host' => env('DB_HOST', '127.0.0.1'),
    'port' => env('DB_PORT', '5432'),
    'database' => env('DB_DATABASE', 'laravel'),
    'username' => env('DB_USERNAME', 'laravel'),
    'password' => env('DB_PASSWORD', ''),
    'charset' => env('DB_CHARSET', 'utf8'),
    'prefix' => '',
    'prefix_indexes' => true,
    'schema' => env('DB_SCHEMA', 'public'),
    'sslmode' => 'prefer',
],
```

#### 4. Handle Migration Differences

**PostgreSQL-Specific Adjustments:**
```php
// In migrations - Handle enum differences
// SQLite enum becomes PostgreSQL varchar with check constraint

// Before (SQLite):
$table->enum('priority', ['low', 'medium', 'high'])->default('medium');

// After (PostgreSQL):
$table->string('priority')->default('medium');
// Add check constraint in separate migration if needed
```

#### 5. Data Migration Script
```php
// Create: app/Console/Commands/MigrateToPostgres.php
<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MigrateToPostgres extends Command
{
    protected $signature = 'migrate:to-postgres';
    protected $description = 'Migrate data from SQLite to PostgreSQL';

    public function handle()
    {
        // Backup SQLite first
        $this->call('db:backup');
        
        // Connect to SQLite
        $sqliteData = $this->exportFromSqlite();
        
        // Switch to PostgreSQL
        config(['database.default' => 'pgsql']);
        
        // Run migrations on PostgreSQL
        $this->call('migrate:fresh');
        
        // Import data
        $this->importToPostgres($sqliteData);
        
        $this->info('Migration to PostgreSQL completed!');
    }

    private function exportFromSqlite()
    {
        config(['database.default' => 'sqlite']);
        
        return [
            'users' => DB::table('users')->get(),
            'tags' => DB::table('tags')->get(),
            'todos' => DB::table('todos')->get(),
            'todo_tag' => DB::table('todo_tag')->get(),
        ];
    }

    private function importToPostgres($data)
    {
        DB::table('users')->insert($data['users']->toArray());
        DB::table('tags')->insert($data['tags']->toArray());
        DB::table('todos')->insert($data['todos']->toArray());
        DB::table('todo_tag')->insert($data['todo_tag']->toArray());
    }
}
```

#### 6. Update Search Configuration
```php
// config/scout.php - Consider upgrading from database to proper search
'driver' => env('SCOUT_DRIVER', 'database'),

// For production PostgreSQL, consider:
// - Laravel Scout with MeiliSearch
// - PostgreSQL full-text search
// - Elasticsearch integration
```

#### 7. PostgreSQL Production Optimizations
```sql
-- Add PostgreSQL-specific indexes
CREATE INDEX CONCURRENTLY idx_todos_user_status ON todos(user_id, status);
CREATE INDEX CONCURRENTLY idx_todos_search ON todos USING GIN(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Configure PostgreSQL for optimal performance
-- postgresql.conf
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
```

### Post-Migration Verification

#### Testing Checklist:
- [ ] All todos display correctly
- [ ] User authentication works
- [ ] Tag filtering functions
- [ ] Search functionality operational
- [ ] CRUD operations successful
- [ ] Performance acceptable
- [ ] Backup procedures tested

---

## Maintenance Tasks

### Regular Maintenance (SQLite)
```bash
# Weekly tasks
sqlite3 database.sqlite "VACUUM;"  # Reclaim space
sqlite3 database.sqlite "ANALYZE;" # Update statistics

# Monthly tasks
sqlite3 database.sqlite "PRAGMA integrity_check;" # Verify integrity
sqlite3 database.sqlite "REINDEX;"                # Rebuild indexes
```

### Monitoring Queries
```sql
-- Check database size
SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size();

-- Monitor table sizes
SELECT name, SUM("pgsize") as size FROM "dbstat" GROUP BY name ORDER BY size DESC;

-- Check for unused space
PRAGMA freelist_count;
```

---

## Troubleshooting

### Common SQLite Issues

#### Database Locked
```bash
# Check for stale connections
lsof database/database.sqlite

# Force unlock (use carefully)
sqlite3 database.sqlite "BEGIN IMMEDIATE; ROLLBACK;"
```

#### Performance Issues
```sql
-- Analyze slow queries
EXPLAIN QUERY PLAN SELECT * FROM todos WHERE user_id = ?;

-- Check for missing indexes
SELECT * FROM sqlite_master WHERE type = 'index';
```

#### Corruption Recovery
```bash
# Create backup and repair
sqlite3 database.sqlite ".backup backup.sqlite"
sqlite3 database.sqlite "PRAGMA integrity_check;"
```

### Migration Issues

#### Character Encoding
```php
// Ensure UTF-8 compatibility during migration
DB::statement("SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci");
```

#### Data Type Mismatches
```php
// Handle boolean conversion
// SQLite: 0/1 integers
// PostgreSQL: true/false booleans
$todo->completed = (bool) $todo->completed;
```

---

## Summary

Kaiba's current SQLite setup is production-ready for self-hosted deployments and small teams. The architecture is well-designed with proper indexing, security, and performance optimizations. Migration to PostgreSQL should only be considered when hitting clear scalability limits or requiring advanced database features.

For most self-hosted use cases, SQLite will provide excellent performance, minimal maintenance overhead, and deployment simplicity that makes Kaiba accessible to users without database administration experience.