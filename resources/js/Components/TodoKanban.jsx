import React, { useState } from 'react';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { KanbanProvider, KanbanBoard, KanbanHeader, KanbanCards, KanbanCard } from '@/Components/ui/kanban';
import { Award, Activity } from 'lucide-react';
import TodoCard from '@/Components/TodoCard';

export default function TodoKanban({
    todos,
    onToggleComplete,
    onEditTodo,
    onDeleteTodo,
    onDragEnd
}) {
    // Default to 'status' view
    const [groupByMode, setGroupByMode] = useState('status'); // 'priority' or 'status'
    // Filter toggles
    const [showBackburner, setShowBackburner] = useState(true);
    const [showCompleted, setShowCompleted] = useState(true);

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
            {/* Toggle Header */}
            <div className="flex items-center justify-between p-4 border-b bg-card">
                <h3 className="text-lg font-semibold text-foreground">Kanban Board</h3>
                <div className="flex gap-2 items-center">
                    {/* Group By Buttons */}
                    <div className="flex gap-1 p-1 bg-muted rounded-lg">
                        <Button
                            variant={groupByMode === 'priority' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setGroupByMode('priority')}
                            className="h-8 text-xs"
                        >
                            <Award className="w-3 h-3 mr-1" />
                            Priority
                        </Button>
                        <Button
                            variant={groupByMode === 'status' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setGroupByMode('status')}
                            className="h-8 text-xs"
                        >
                            <Activity className="w-3 h-3 mr-1" />
                            Status
                        </Button>
                    </div>
                    {/* Filter Toggles */}
                    {groupByMode === 'status' && (
                        <div className="flex gap-1 ml-2">
                            <Button
                                variant={showBackburner ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setShowBackburner(v => !v)}
                                className="h-8 text-xs"
                            >
                                Backburner
                            </Button>
                            <Button
                                variant={showCompleted ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setShowCompleted(v => !v)}
                                className="h-8 text-xs"
                            >
                                Completed
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Kanban Content */}
            <div className="flex-1">
            <KanbanProvider
                columns={columns}
                data={kanbanData}
                onDataChange={handleDataChange}
                className="h-full"
            >
                {(column) => (
                    <KanbanBoard id={column.id} key={column.id} className={`h-full ${column.color}`}>
                        <KanbanHeader className="flex items-center justify-between p-4 border-b">
                            <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${getColumnColor(column.id)}`}></div>
                                <span className="font-semibold">{column.name}</span>
                                <Badge variant="secondary" className="text-xs">
                                    {kanbanData.filter(item => item.column === column.id).length}
                                </Badge>
                            </div>
                        </KanbanHeader>

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
                    </KanbanBoard>
                )}
            </KanbanProvider>
            </div>
        </div>
    );
}
