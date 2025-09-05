<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the todos for the user.
     */
    public function todos(): HasMany
    {
        return $this->hasMany(Todo::class);
    }

    /**
     * Get user's active todos
     */
    public function activeTodos(): HasMany
    {
        return $this->hasMany(Todo::class)->active();
    }

    /**
     * Get user's high priority todos
     */
    public function highPriorityTodos(): HasMany
    {
        return $this->hasMany(Todo::class)->byPriority('high');
    }

    /**
     * Get user's overdue todos
     */
    public function overdueTodos(): HasMany
    {
        return $this->hasMany(Todo::class)->overdue();
    }

    /**
     * Get user's todos due within X days
     */
    public function todosDueWithin($days = 7): HasMany
    {
        return $this->hasMany(Todo::class)->dueWithin($days);
    }

    /**
     * Get user's recent todos
     */
    public function recentTodos($days = 30): HasMany
    {
        return $this->hasMany(Todo::class)->recent($days);
    }
}
