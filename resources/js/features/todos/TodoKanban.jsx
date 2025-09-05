import React, { useState, useEffect } from 'react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { KanbanProvider, KanbanBoard, KanbanHeader, KanbanCards, KanbanCard } from '@/Components/ui/kanban';
import { Award, Activity, Eye, EyeOff, Plus } from 'lucide-react';
import TodoCard from './TodoCard';

export default function TodoKanban({
    todos,
    onToggleComplete,
    onEditTodo,
    onDeleteTodo,
    onDragEnd,
    onColumnsVisibilityChange,
    onAddTodo
}) {
    // Default to 'status' view
    const [groupByMode, setGroupByMode] = useState('status'); // 'priority' or 'status'
    // Filter toggles
    const [showBackburner, setShowBackburner] = useState(true);
    const [showCompleted, setShowCompleted] = useState(true);

    // Notify parent component about visibility changes
    useEffect(() => {
        onColumnsVisibilityChange?.({
            showBackburner,
            showCompleted,
            groupByMode,
            setShowBackburner,
            setShowCompleted,
            setGroupByMode
        });
    }, [showBackburner, showCompleted, groupByMode, onColumnsVisibilityChange]);

    // Define the priority columns
    const priorityColumns = [
        { id: 'low', name: 'Low Priority', color: 'bg-green-100 border-green-200' },
        { id: 'medium', name: 'Medium Priority', color: 'bg-yellow-100 border-yellow-200' },
        { id: 'high', name: 'High Priority', color: 'bg-red-100 border-red-200' },
    ];

    // Define the status columns
    let statusColumns = [
        { id: 'backlog', name: 'Backburner', color: 'bg-muted border-border' },
        { id: 'todo', name: 'To Do', color: 'bg-blue-100 border-blue-200' },
        { id: 'working', name: 'Working', color: 'bg-orange-100 border-orange-200' },
        { id: 'qa', name: 'QA', color: 'bg-purple-100 border-purple-200' },
        { id: 'in_review', name: 'In Review', color: 'bg-yellow-100 border-yellow-200' },
        { id: 'completed', name: 'Completed', color: 'bg-green-100 border-green-200' },
    ];

    // Filter columns based on toggles
    if (!showBackburner) {
        statusColumns = statusColumns.filter(col => col.id !== 'backlog');
    }
    if (!showCompleted) {
        statusColumns = statusColumns.filter(col => col.id !== 'completed');
    }

    // Select columns based on current mode
    const columns = groupByMode === 'priority' ? priorityColumns : statusColumns;

    // Transform todos to kanban format
    const kanbanData = todos.map(todo => ({
        id: todo.id.toString(),
        name: todo.title,
        column: groupByMode === 'priority' ? todo.priority : (todo.status || 'todo'),
        todo: todo // Keep reference to original todo
    }));

    const handleDataChange = (newData) => {
        // Extract the changes and call the drag handler with appropriate field
        const changes = newData.map(item => {
            const baseChange = {
                id: parseInt(item.id),
                todo: item.todo
            };

            if (groupByMode === 'priority') {
                baseChange.priority = item.column;
            } else {
                baseChange.status = item.column;
            }

            return baseChange;
        });
        onDragEnd(changes);
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-muted';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'backlog': return 'bg-muted';
            case 'todo': return 'bg-blue-500';
            case 'working': return 'bg-orange-500';
            case 'qa': return 'bg-purple-500';
            case 'in_review': return 'bg-yellow-500';
            case 'completed': return 'bg-green-500';
            default: return 'bg-muted';
        }
    };

    const getColumnColor = (columnId) => {
        return groupByMode === 'priority' ? getPriorityColor(columnId) : getStatusColor(columnId);
    };

    return (
        <div className="h-full w-full flex flex-col">
            {/* Kanban Content */}
            <div className="flex-1">
            <KanbanProvider
                columns={columns}
                data={kanbanData}
                onDataChange={handleDataChange}
                className="h-full"
            >
                {(column) => (
                    <KanbanBoard id={column.id} key={column.id} className={`h-full ${column.color} group/column`}>
                        <KanbanHeader className="flex items-center justify-between p-4 border-b">
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${getColumnColor(column.id)}`}></div>
                                <span className="font-semibold">{column.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                    {kanbanData.filter(item => item.column === column.id).length}
                                </Badge>
                            </div>
                            {groupByMode === 'status' && (column.id === 'backlog' || column.id === 'completed') && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                        if (column.id === 'backlog') {
                                            setShowBackburner(false);
                                        } else if (column.id === 'completed') {
                                            setShowCompleted(false);
                                        }
                                    }}
                                    className="h-6 w-6 p-0 hover:bg-muted"
                                    title={`Hide ${column.name}`}
                                >
                                    <EyeOff className="w-3 h-3" />
                                </Button>
                            )}
                        </KanbanHeader>

                        <div className="flex-1 flex flex-col">
                            <KanbanCards id={column.id} className="flex-1 p-2">
                                {(item) => (
                                    <KanbanCard key={item.id} id={item.id} name={item.name} className="group">
                                        <TodoCard
                                            todo={item.todo}
                                            onToggleComplete={onToggleComplete}
                                            onEdit={onEditTodo}
                                            onDelete={onDeleteTodo}
                                            variant="kanban"
                                        />
                                    </KanbanCard>
                                )}
                            </KanbanCards>
                            
                            {/* Add Todo Button - appears on hover */}
                            <div className="p-2 opacity-0 group-hover/column:opacity-100 transition-opacity">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onAddTodo?.(groupByMode === 'priority' ? { priority: column.id } : { status: column.id })}
                                    className="w-full h-8 text-muted-foreground hover:text-foreground border-2 border-dashed border-muted hover:border-muted-foreground/50 transition-colors"
                                >
                                    <Plus className="w-4 h-4 mr-1" />
                                    Add Todo
                                </Button>
                            </div>
                        </div>
                    </KanbanBoard>
                )}
            </KanbanProvider>
            </div>
        </div>
    );
}
