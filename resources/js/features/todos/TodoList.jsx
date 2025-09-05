import React from 'react';
import { List, ListItem, ListItemContent, ListItemMeta, ListItemActions } from '@/Components/ui/list';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
import { 
    Calendar,
    Edit,
    Trash2,
    Clock,
    Flag,
    CheckCircle,
    Plus
} from 'lucide-react';

export default function TodoList({
    todos,
    onToggleComplete,
    onEditTodo,
    onDeleteTodo,
    onAddTodo
}) {
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-500 hover:bg-red-600';
            case 'medium': return 'bg-yellow-500 hover:bg-yellow-600';
            case 'low': return 'bg-green-500 hover:bg-green-600';
            default: return 'bg-muted hover:bg-muted';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'completed': return 'text-green-600';
            case 'working': return 'text-orange-600';
            case 'qa': return 'text-purple-600';
            case 'in_review': return 'text-yellow-600';
            case 'backlog': return 'text-muted-foreground';
            default: return 'text-blue-600';
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'backlog': return 'Backburner';
            case 'todo': return 'To Do';
            case 'working': return 'Working';
            case 'qa': return 'QA';
            case 'in_review': return 'In Review';
            case 'completed': return 'Completed';
            default: return 'To Do';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <div className="rounded-md border bg-card">
            <List>
                {todos.map((todo) => (
                    <ListItem key={todo.id} className={todo.status === 'completed' ? 'opacity-75' : ''}>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                checked={todo.status === 'completed'}
                                onCheckedChange={() => onToggleComplete(todo.id)}
                            />
                            <div className={`w-1 h-8 rounded-full ${getPriorityColor(todo.priority)}`} />
                        </div>
                        
                        <ListItemContent>
                            <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                    <h4 className={`text-sm font-medium leading-none ${
                                        todo.status === 'completed' ? 'line-through text-muted-foreground' : ''
                                    }`}>
                                        {todo.title}
                                    </h4>
                                    <Badge 
                                        variant="outline" 
                                        className={`text-xs ${getStatusColor(todo.status)}`}
                                    >
                                        {getStatusLabel(todo.status)}
                                    </Badge>
                                </div>
                                
                                {todo.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-1">
                                        {todo.description}
                                    </p>
                                )}
                                
                                <ListItemMeta>
                                    {todo.due_date && (
                                        <div className="flex items-center space-x-1">
                                            <Calendar className="w-3 h-3" />
                                            <span>{formatDate(todo.due_date)}</span>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center space-x-1">
                                        <Flag className="w-3 h-3" />
                                        <span className="capitalize">{todo.priority}</span>
                                    </div>
                                    
                                    {todo.tags && todo.tags.length > 0 && (
                                        <div className="flex items-center space-x-1">
                                            {todo.tags.slice(0, 3).map(tag => (
                                                <Badge
                                                    key={tag.id}
                                                    variant="secondary"
                                                    className="text-xs px-1"
                                                    style={{ 
                                                        borderColor: tag.color,
                                                        color: tag.color 
                                                    }}
                                                >
                                                    {tag.name}
                                                </Badge>
                                            ))}
                                            {todo.tags.length > 3 && (
                                                <Badge variant="secondary" className="text-xs px-1">
                                                    +{todo.tags.length - 3}
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </ListItemMeta>
                            </div>
                        </ListItemContent>
                        
                        <ListItemActions>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEditTodo(todo)}
                                className="h-8 w-8 p-0"
                            >
                                <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDeleteTodo(todo.id)}
                                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </ListItemActions>
                    </ListItem>
                ))}
                
                {/* Add Todo Button - styled as list item */}
                <ListItem className="hover:bg-muted/50">
                    <Button
                        variant="ghost"
                        onClick={() => onAddTodo?.()}
                        className="w-full h-full p-4 flex items-center justify-center gap-3 text-muted-foreground hover:text-foreground border-2 border-dashed border-muted hover:border-muted-foreground/50 transition-colors rounded-none"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="font-medium">Add Todo</span>
                    </Button>
                </ListItem>
            </List>
        </div>
    );
}