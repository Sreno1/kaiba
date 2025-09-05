<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Laravel\Scout\Searchable;

class Todo extends Model
{
    use HasFactory, Searchable;
    
    protected $fillable = [
        'title',
        'description',
        'completed',
        'priority',
        'due_date',
        'status',
    ];

    protected $casts = [
        'completed' => 'boolean',
        'due_date' => 'date',
    ];


    /**
     * The tags that belong to the todo.
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'todo_tag');
    }

    // Query Scopes for Common Patterns

    /**
     * Scope to get only active (non-completed) todos
     */
    public function scopeActive($query)
    {
        return $query->where('status', '!=', 'completed');
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
        return $query->when($filters['status'] ?? null, function ($q, $status) {
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
        })->when($filters['due_within'] ?? null, function ($q, $days) {
            $q->dueWithin($days);
        });
    }

    /**
     * Load todos with all necessary relationships
     */
    public static function withRelations()
    {
        return static::with(['tags']);
    }

    /**
     * Load minimal data for listings
     */
    public static function minimal()
    {
        return static::select([
            'id', 'title', 'status', 'priority', 
            'due_date', 'completed', 'created_at'
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

    // Accessors & Mutators (Laravel 9+ style)

    /**
     * Get the todo's formatted due date
     */
    protected function formattedDueDate(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->due_date ? $this->due_date->format('M j, Y') : null,
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
                default => '#3b82f6', // blue-500 (todo)
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
    
    /**
     * Get the indexable data array for the model.
     */
    public function toSearchableArray(): array
    {
        return [
            'title' => $this->title,
            'description' => $this->description,
            'priority' => $this->priority,
            'status' => $this->status,
        ];
    }
    
    /**
     * Modify the query used to retrieve models when making all searchable.
     */
    protected function makeAllSearchableUsing($query)
    {
        return $query->with('tags');
    }
}
