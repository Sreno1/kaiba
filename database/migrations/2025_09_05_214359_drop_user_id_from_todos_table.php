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
            // First drop indexes that reference user_id
            $table->dropIndex('idx_todos_user_status');
            $table->dropIndex('idx_todos_user_priority');
            $table->dropIndex('idx_todos_user_due_date');
            
            // Then drop the foreign key constraint and column
            $table->dropConstrainedForeignId('user_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('todos', function (Blueprint $table) {
            // Re-add the user_id foreign key constraint
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            
            // Re-add the indexes
            $table->index(['user_id', 'status'], 'idx_todos_user_status');
            $table->index(['user_id', 'priority'], 'idx_todos_user_priority');
            $table->index(['user_id', 'due_date'], 'idx_todos_user_due_date');
        });
    }
};
