<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('todos', function (Blueprint $table) {
            // Index for priority-based queries
            $table->index('priority', 'idx_todos_priority');
            
            // Composite index for user + priority queries
            $table->index(['user_id', 'priority'], 'idx_todos_user_priority');
            
            // Composite index for user + due_date (for dashboard views)
            $table->index(['user_id', 'due_date'], 'idx_todos_user_due_date');
        });
        
        Schema::table('tags', function (Blueprint $table) {
            // Index for tag name searches/lookups
            $table->index('name', 'idx_tags_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('todos', function (Blueprint $table) {
            $table->dropIndex('idx_todos_priority');
            $table->dropIndex('idx_todos_user_priority');
            $table->dropIndex('idx_todos_user_due_date');
        });
        
        Schema::table('tags', function (Blueprint $table) {
            $table->dropIndex('idx_tags_name');
        });
    }
};
