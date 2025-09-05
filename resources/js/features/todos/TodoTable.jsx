import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/Components/ui/table';
import { Badge } from '@/Components/ui/badge';
import { Button } from '@/Components/ui/button';
import { Checkbox } from '@/Components/ui/checkbox';
import { 
    Edit,
    Trash2,
    Calendar,
    Flag,
    Plus
} from 'lucide-react';

export default function TodoTable({
    todos,
    onToggleComplete,
    onEditTodo,
    onDeleteTodo,
    onAddTodo
}) {
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
            case 'completed': return 'text-green-600 bg-green-50';
            case 'working': return 'text-orange-600 bg-orange-50';
            case 'qa': return 'text-purple-600 bg-purple-50';
            case 'in_review': return 'text-yellow-600 bg-yellow-50';
            case 'backlog': return 'text-muted-foreground bg-muted';
            default: return 'text-blue-600 bg-blue-50';
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
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleDateString();
    };

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12">Done</TableHead>
                        <TableHead className="w-8"></TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Tags</TableHead>
                        <TableHead className="w-24">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {todos.map((todo) => (
                        <TableRow key={todo.id} className={todo.status === 'completed' ? 'opacity-75' : ''}>
                            <TableCell>
                                <Checkbox
                                    checked={todo.status === 'completed'}
                                    onCheckedChange={() => onToggleComplete(todo.id)}
                                />
                            </TableCell>
                            <TableCell>
                                <div className={`w-2 h-8 rounded-full ${getPriorityColor(todo.priority)}`} />
                            </TableCell>
                            <TableCell className="font-medium">
                                <div className="space-y-1">
                                    <div className={todo.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
                                        {todo.title}
                                    </div>
                                    {todo.description && (
                                        <div className="text-sm text-muted-foreground line-clamp-1">
                                            {todo.description}
                                        </div>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge 
                                    variant="secondary" 
                                    className={`${getStatusColor(todo.status)}`}
                                >
                                    {getStatusLabel(todo.status)}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center space-x-1">
                                    <Flag className={`w-3 h-3 ${
                                        todo.priority === 'high' ? 'text-red-500' :
                                        todo.priority === 'medium' ? 'text-yellow-500' :
                                        'text-green-500'
                                    }`} />
                                    <span className="capitalize text-sm">{todo.priority}</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                {todo.due_date && (
                                    <div className="flex items-center space-x-1 text-sm">
                                        <Calendar className="w-3 h-3" />
                                        <span>{formatDate(todo.due_date)}</span>
                                    </div>
                                )}
                                {!todo.due_date && <span className="text-muted-foreground">-</span>}
                            </TableCell>
                            <TableCell>
                                {todo.tags && todo.tags.length > 0 ? (
                                    <div className="flex items-center space-x-1">
                                        {todo.tags.slice(0, 2).map(tag => (
                                            <Badge
                                                key={tag.id}
                                                variant="outline"
                                                className="text-xs px-1"
                                                style={{ 
                                                    borderColor: tag.color,
                                                    color: tag.color 
                                                }}
                                            >
                                                {tag.name}
                                            </Badge>
                                        ))}
                                        {todo.tags.length > 2 && (
                                            <Badge variant="outline" className="text-xs px-1">
                                                +{todo.tags.length - 2}
                                            </Badge>
                                        )}
                                    </div>
                                ) : (
                                    <span className="text-muted-foreground">-</span>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center space-x-1">
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
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                    
                    {/* Add Todo Button - styled as table row */}
                    <TableRow className="hover:bg-muted/50">
                        <TableCell colSpan={8} className="p-0">
                            <Button
                                variant="ghost"
                                onClick={() => onAddTodo?.()}
                                className="w-full h-full p-4 flex items-center justify-center gap-3 text-muted-foreground hover:text-foreground border-2 border-dashed border-muted hover:border-muted-foreground/50 transition-colors rounded-none"
                            >
                                <Plus className="w-5 h-5" />
                                <span className="font-medium">Add Todo</span>
                            </Button>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
}