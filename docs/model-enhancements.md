  Model Enhancements - Deep Dive

  1. Query Scopes for Common Patterns

  Query scopes make your controllers cleaner and create reusable query
  patterns:

  // app/Models/Todo.php - Add these methods

  /**
   * Scope to get only active (non-completed) todos
   */
  public function scopeActive($query)
  {
      return $query->where('status', '!=', 'completed');
      // Alternative: where('completed', false) if using boolean field
  }

  /**
   * Scope to filter by priority
   */
  public function scopeByPriority($query, $priority)
  {
      return $query->where('priority', $priority);
  }

  /**
   * Scope to get overdue todos
   */
  public function scopeOverdue($query)
  {
      return $query->where('due_date', '<', now())
                   ->where('status', '!=', 'completed');
  }

  /**
   * Scope to get todos due within X days
   */
  public function scopeDueWithin($query, $days = 7)
  {
      return $query->whereBetween('due_date', [
          now(),
          now()->addDays($days)
      ])->where('status', '!=', 'completed');
  }

  /**
   * Scope to filter by status
   */
  public function scopeWithStatus($query, $status)
  {
      return $query->where('status', $status);
  }

  /**
   * Scope for recent todos (created within X days)
   */
  public function scopeRecent($query, $days = 30)
  {
      return $query->where('created_at', '>=', now()->subDays($days));
  }

  Usage Examples:
  // In your controllers or API endpoints
  Todo::active()->get(); // Get all non-completed todos
  Todo::byPriority('high')->active()->get(); // High priority active todos
  Todo::overdue()->get(); // All overdue todos
  Todo::dueWithin(3)->get(); // Due in next 3 days
  Todo::withStatus('working')->byPriority('high')->get(); // Chaining scopes

  2. Advanced Relationship Methods

  // app/Models/User.php - Enhance user relationships

  /**
   * Get user's active todos
   */
  public function activeTodos()
  {
      return $this->hasMany(Todo::class)->active();
  }

  /**
   * Get user's high priority todos
   */
  public function highPriorityTodos()
  {
      return $this->hasMany(Todo::class)->byPriority('high');
  }

  /**
   * Get user's overdue todos
   */
  public function overdueTodos()
  {
      return $this->hasMany(Todo::class)->overdue();
  }

  3. Model Accessors & Mutators (Laravel 9+ style)

  // app/Models/Todo.php - Add these for enhanced data handling

  use Illuminate\Database\Eloquent\Casts\Attribute;

  /**
   * Get the todo's formatted due date
   */
  protected function formattedDueDate(): Attribute
  {
      return Attribute::make(
          get: fn () => $this->due_date ? $this->due_date->format('M j, Y') :
   null,
      );
  }

  /**
   * Get the todo's priority color for UI
   */
  protected function priorityColor(): Attribute
  {
      return Attribute::make(
          get: fn () => match($this->priority) {
              'high' => '#ef4444', // red-500
              'medium' => '#f59e0b', // yellow-500
              'low' => '#10b981', // green-500
              default => '#6b7280', // gray-500
          },
      );
  }

  /**
   * Get the todo's status color for UI
   */
  protected function statusColor(): Attribute
  {
      return Attribute::make(
          get: fn () => match($this->status) {
              'completed' => '#10b981', // green-500
              'working' => '#f59e0b', // yellow-500
              'qa' => '#8b5cf6', // purple-500
              'in_review' => '#f59e0b', // yellow-500
              'backlog' => '#6b7280', // gray-500
              default => '#3b82f6', // blue-500
          },
      );
  }

  /**
   * Check if todo is overdue
   */
  protected function isOverdue(): Attribute
  {
      return Attribute::make(
          get: fn () => $this->due_date &&
                       $this->due_date->isPast() &&
                       $this->status !== 'completed',
      );
  }

  /**
   * Get days until due (negative if overdue)
   */
  protected function daysUntilDue(): Attribute
  {
      return Attribute::make(
          get: fn () => $this->due_date ?
                       now()->diffInDays($this->due_date, false) : null,
      );
  }

  4. Collection Macros for Advanced Filtering

  // app/Providers/AppServiceProvider.php - Add to boot() method

  use Illuminate\Database\Eloquent\Collection;

  public function boot()
  {
      Collection::macro('byPriority', function ($priority) {
          return $this->filter(function ($todo) use ($priority) {
              return $todo->priority === $priority;
          });
      });

      Collection::macro('byStatus', function ($status) {
          return $this->filter(function ($todo) use ($status) {
              return $todo->status === $status;
          });
      });

      Collection::macro('overdue', function () {
          return $this->filter(function ($todo) {
              return $todo->is_overdue;
          });
      });

      Collection::macro('groupByPriority', function () {
          return $this->groupBy('priority');
      });

      Collection::macro('groupByStatus', function () {
          return $this->groupBy('status');
      });
  }

  Usage:
  $todos = Auth::user()->todos;
  $highPriority = $todos->byPriority('high');
  $overdue = $todos->overdue();
  $grouped = $todos->groupByStatus();

  5. Advanced Search Capabilities

  // app/Models/Todo.php - Enhance search functionality

  /**
   * Enhanced search scope
   */
  public function scopeSearch($query, $term)
  {
      return $query->where(function ($q) use ($term) {
          $q->where('title', 'LIKE', "%{$term}%")
            ->orWhere('description', 'LIKE', "%{$term}%")
            ->orWhereHas('tags', function ($tagQuery) use ($term) {
                $tagQuery->where('name', 'LIKE', "%{$term}%");
            });
      });
  }

  /**
   * Scope for complex filtering
   */
  public function scopeFilter($query, array $filters)
  {
      return $query->when($filters['status'] ?? null, function ($q, $status) 
  {
          $q->where('status', $status);
      })->when($filters['priority'] ?? null, function ($q, $priority) {
          $q->where('priority', $priority);
      })->when($filters['tag'] ?? null, function ($q, $tagId) {
          $q->whereHas('tags', function ($tagQuery) use ($tagId) {
              $tagQuery->where('tags.id', $tagId);
          });
      })->when($filters['overdue'] ?? null, function ($q) {
          $q->overdue();
      })->when($filters['search'] ?? null, function ($q, $term) {
          $q->search($term);
      });
  }

  6. Performance-Optimized Loading

  // app/Models/Todo.php - Add performance helpers

  /**
   * Load todos with all necessary relationships
   */
  public static function withRelations()
  {
      return static::with(['tags', 'user']);
  }

  /**
   * Load minimal data for listings
   */
  public static function minimal()
  {
      return static::select([
          'id', 'title', 'status', 'priority',
          'due_date', 'completed', 'user_id', 'created_at'
      ]);
  }

  /**
   * Scope for dashboard data (recent + important)
   */
  public function scopeDashboard($query)
  {
      return $query->where(function ($q) {
          $q->where('status', '!=', 'completed')
            ->orWhere('updated_at', '>=', now()->subDays(7));
      })->orderByRaw("
          CASE 
              WHEN status = 'working' THEN 1
              WHEN priority = 'high' THEN 2
              WHEN due_date IS NOT NULL AND due_date <= ? THEN 3
              ELSE 4
          END, created_at DESC
      ", [now()->addDays(3)]);
  }

  7. Usage Examples in Controllers

  // How to use these enhancements in your controllers

  class TodoController extends Controller
  {
      public function index(Request $request)
      {
          $todos = Auth::user()->todos()
              ->filter($request->only(['status', 'priority', 'tag',
  'overdue', 'search']))
              ->withRelations()
              ->latest()
              ->paginate(20);

          return response()->json($todos);
      }

      public function dashboard()
      {
          $user = Auth::user();

          return response()->json([
              'stats' => [
                  'total' => $user->todos()->count(),
                  'active' => $user->activeTodos()->count(),
                  'overdue' => $user->overdueTodos()->count(),
                  'high_priority' =>
  $user->highPriorityTodos()->active()->count(),
              ],
              'recent_todos' =>
  $user->todos()->dashboard()->limit(10)->get(),
              'overdue_todos' => $user->overdueTodos()->get(),
          ]);
      }
  }

  Benefits of These Enhancements:

  1. Cleaner Controllers - Business logic moves to models
  2. Reusable Code - Scopes can be chained and reused
  3. Better Performance - Optimized queries and eager loading
  4. Enhanced UX - Computed properties for frontend (colors, status)
  5. Maintainable - Changes to business rules happen in one place
  6. Testable - Each scope/method can be unit tested independently

  These enhancements make your models more powerful while keeping your
  controllers thin and your code DRY. They're particularly useful as your
  application grows and you need more sophisticated filtering and data
  presentation capabilities.
