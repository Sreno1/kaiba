<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Tag extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'color',
        'description',
    ];

    /**
     * The todos that belong to the tag.
     */
    public function todos(): BelongsToMany
    {
        return $this->belongsToMany(Todo::class, 'todo_tag');
    }

    /**
     * Get the scratchpad for this tag.
     */
    public function scratchpad(): HasOne
    {
        return $this->hasOne(Scratchpad::class);
    }
}
