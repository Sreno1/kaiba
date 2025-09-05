<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Illuminate\Database\Eloquent\Collection;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        
        // Register collection macros for Todo filtering
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

        Collection::macro('active', function () {
            return $this->filter(function ($todo) {
                return $todo->status !== 'completed';
            });
        });

        Collection::macro('completed', function () {
            return $this->filter(function ($todo) {
                return $todo->status === 'completed';
            });
        });

        Collection::macro('groupByPriority', function () {
            return $this->groupBy('priority');
        });

        Collection::macro('groupByStatus', function () {
            return $this->groupBy('status');
        });

        Collection::macro('withTag', function ($tagId) {
            return $this->filter(function ($todo) use ($tagId) {
                return $todo->tags && $todo->tags->contains('id', $tagId);
            });
        });

        Collection::macro('dueWithin', function ($days) {
            return $this->filter(function ($todo) use ($days) {
                return $todo->due_date && 
                       $todo->due_date->between(now(), now()->addDays($days)) &&
                       $todo->status !== 'completed';
            });
        });
    }
}
