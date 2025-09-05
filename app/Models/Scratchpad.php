<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Scratchpad extends Model
{
    use HasFactory;
    protected $fillable = [
        'tag_id',
        'data',
    ];

    protected $casts = [
        'data' => 'array',
    ];

    public function tag(): BelongsTo
    {
        return $this->belongsTo(Tag::class);
    }
}
