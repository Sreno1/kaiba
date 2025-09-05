import React from 'react';
import { Card, CardDescription } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
import { Edit2, Trash2, Calendar } from 'lucide-react';

export default function TodoCard({
    todo,
    onToggleComplete,
    onEdit,
    onDelete,
    className = '',
    variant = 'grid' // 'grid' or 'kanban'
}) {
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'backlog': return 'bg-gray-500';
            case 'todo': return 'bg-blue-500';
            case 'working': return 'bg-orange-500';
            case 'qa': return 'bg-purple-500';
            case 'in_review': return 'bg-yellow-500';
            case 'completed': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const formatStatus = (status) => {
        switch (status) {
            case 'in_review': return 'In Review';
            case 'qa': return 'QA';
            default: return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Todo';
        }
    };

    // Always use Card as the outer element for both variants
    const firstTagColor = todo.tags && todo.tags.length > 0 ? todo.tags[0].color : null;
    return (
        <Card
            className={`
                ${todo.status === 'completed' ? 'opacity-60' : ''}
                group transition-all duration-200
                border border-gray-200 hover:border-gray-300 bg-white dark:bg-gray-900 rounded-lg
                ${variant === 'grid' ? 'hover:shadow-lg' : ''}
                ${className}
            `}
            style={firstTagColor ? { borderLeft: `6px solid ${firstTagColor}` } : {}}
        >
            <div className={`space-y-3 ${variant === 'grid' ? 'p-4' : 'p-2'}`}>
                {/* Header with checkbox, title and actions */}
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <Checkbox
                            checked={todo.status === 'completed'}
                            onCheckedChange={() => onToggleComplete(todo.id)}
                            onClick={(e) => e.stopPropagation()}
                        />
                        <h3 className={`font-medium text-sm leading-tight ${
                            todo.status === 'completed' ? 'line-through text-muted-foreground' : 'text-foreground'
                        } truncate`}>
                            {todo.title}
                        </h3>
                    </div>
                    <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(todo);
                            }}
                            className="h-6 w-6 p-0 pointer-events-auto"
                        >
                            <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete(todo.id);
                            }}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 pointer-events-auto"
                        >
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </div>
                </div>

                {/* Priority indicator bar and Status badge */}
                <div className="flex items-center justify-between gap-2">
                    <div className={`w-1 h-6 rounded-full ${getPriorityColor(todo.priority)}`}></div>
                    <div className="flex items-center gap-2 flex-1">
                        <Badge 
                            variant="outline" 
                            className={`text-xs px-2 py-0.5 h-5 ${
                                todo.status === 'completed' ? 'text-green-600 border-green-200' :
                                todo.status === 'working' ? 'text-orange-600 border-orange-200' :
                                todo.status === 'qa' ? 'text-purple-600 border-purple-200' :
                                todo.status === 'in_review' ? 'text-yellow-600 border-yellow-200' :
                                todo.status === 'backlog' ? 'text-muted-foreground border-muted' :
                                'text-blue-600 border-blue-200'
                            }`}
                        >
                            {formatStatus(todo.status || 'todo')}
                        </Badge>
                        <span className="text-xs text-muted-foreground capitalize">{todo.priority} priority</span>
                    </div>
                </div>

                {/* Description */}
                {todo.description && (
                    <CardDescription className="text-xs leading-tight line-clamp-2 text-muted-foreground">
                        {todo.description}
                    </CardDescription>
                )}

                {/* Due date */}
                {todo.due_date && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(todo.due_date).toLocaleDateString()}</span>
                    </div>
                )}

                {/* Tags */}
                {todo.tags && todo.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {todo.tags.slice(0, 3).map((tag) => (
                            <Badge
                                key={tag.id}
                                style={{
                                    backgroundColor: tag.color + '20',
                                    color: tag.color,
                                    borderColor: tag.color + '40'
                                }}
                                className="text-xs px-1 py-0 h-5 border"
                            >
                                {tag.name}
                            </Badge>
                        ))}
                        {todo.tags.length > 3 && (
                            <Badge variant="secondary" className="text-xs px-1 py-0 h-5">
                                +{todo.tags.length - 3}
                            </Badge>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
}
