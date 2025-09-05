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
            // Composite index for common queries (user_id + status)
            $table->index(['user_id', 'status'], 'idx_todos_user_status');
            
            // Index for due date queries and sorting
            $table->index('due_date', 'idx_todos_due_date');
            
            // Index for created_at since we order by it frequently
            $table->index('created_at', 'idx_todos_created_at');
        });
        
        Schema::table('todo_tag', function (Blueprint $table) {
            // Index for the pivot table - improves tag-based queries
            $table->index('todo_id', 'idx_todo_tag_todo_id');
            $table->index('tag_id', 'idx_todo_tag_tag_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('todos', function (Blueprint $table) {
            $table->dropIndex('idx_todos_user_status');
            $table->dropIndex('idx_todos_due_date');
            $table->dropIndex('idx_todos_created_at');
        });
        
        Schema::table('todo_tag', function (Blueprint $table) {
            $table->dropIndex('idx_todo_tag_todo_id');
            $table->dropIndex('idx_todo_tag_tag_id');
        });
    }
};
