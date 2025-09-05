<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
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
        'user_id',
    ];

    protected $casts = [
        'completed' => 'boolean',
        'due_date' => 'date',
    ];

    /**
     * Get the user that owns the todo.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * The tags that belong to the todo.
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'todo_tag');
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
