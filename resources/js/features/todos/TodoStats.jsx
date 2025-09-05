import React from 'react';
import { Card } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { 
    CheckCircle,
    Clock,
    AlertCircle,
    TrendingUp,
    Flag,
    Calendar,
    Target,
    Zap
} from 'lucide-react';

export default function TodoStats({ todos = [], className = '' }) {
    // Calculate various statistics using our collection macros
    const totalTodos = todos.length;
    const activeTodos = todos.filter(todo => todo.status !== 'completed').length;
    const completedTodos = todos.filter(todo => todo.status === 'completed').length;
    const overdueTodos = todos.filter(todo => todo.is_overdue).length;
    
    // Priority breakdown
    const highPriority = todos.filter(todo => todo.priority === 'high').length;
    const mediumPriority = todos.filter(todo => todo.priority === 'medium').length;
    const lowPriority = todos.filter(todo => todo.priority === 'low').length;
    
    // Status breakdown
    const statusCounts = {
        backlog: todos.filter(todo => todo.status === 'backlog').length,
        todo: todos.filter(todo => todo.status === 'todo').length,
        working: todos.filter(todo => todo.status === 'working').length,
        qa: todos.filter(todo => todo.status === 'qa').length,
        in_review: todos.filter(todo => todo.status === 'in_review').length,
        completed: completedTodos
    };
    
    // Due soon (within 3 days)
    const dueSoon = todos.filter(todo => {
        if (!todo.due_date || todo.status === 'completed') return false;
        const daysUntilDue = Math.ceil((new Date(todo.due_date) - new Date()) / (1000 * 60 * 60 * 24));
        return daysUntilDue >= 0 && daysUntilDue <= 3;
    }).length;
    
    // Recent todos (created in last 7 days)
    const recentTodos = todos.filter(todo => {
        const daysSinceCreated = Math.ceil((new Date() - new Date(todo.created_at)) / (1000 * 60 * 60 * 24));
        return daysSinceCreated <= 7;
    }).length;
    
    // Completion rate
    const completionRate = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;
    
    // Progress indicators
    const workInProgress = statusCounts.working + statusCounts.qa + statusCounts.in_review;

    const statCards = [
        {
            title: 'Total Tasks',
            value: totalTodos,
            icon: Target,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50 border-blue-200'
        },
        {
            title: 'Active',
            value: activeTodos,
            icon: TrendingUp,
            color: 'text-green-600',
            bgColor: 'bg-green-50 border-green-200'
        },
        {
            title: 'Completed',
            value: completedTodos,
            icon: CheckCircle,
            color: 'text-emerald-600',
            bgColor: 'bg-emerald-50 border-emerald-200',
            subtitle: `${completionRate}% completion rate`
        },
        {
            title: 'In Progress',
            value: workInProgress,
            icon: Zap,
            color: 'text-orange-600',
            bgColor: 'bg-orange-50 border-orange-200',
            subtitle: 'Working + QA + Review'
        },
        {
            title: 'Overdue',
            value: overdueTodos,
            icon: AlertCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-50 border-red-200',
            urgent: overdueTodos > 0
        },
        {
            title: 'Due Soon',
            value: dueSoon,
            icon: Clock,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50 border-yellow-200',
            subtitle: 'Within 3 days'
        },
        {
            title: 'High Priority',
            value: highPriority,
            icon: Flag,
            color: 'text-red-600',
            bgColor: 'bg-red-50 border-red-200'
        },
        {
            title: 'Recent',
            value: recentTodos,
            icon: Calendar,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50 border-purple-200',
            subtitle: 'Last 7 days'
        }
    ];

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <Card 
                            key={index} 
                            className={`p-4 border-2 transition-all hover:shadow-md ${stat.bgColor} ${
                                stat.urgent ? 'animate-pulse' : ''
                            }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <Icon className={`w-5 h-5 ${stat.color}`} />
                                {stat.urgent && (
                                    <Badge variant="destructive" className="text-xs px-1 py-0">
                                        Urgent
                                    </Badge>
                                )}
                            </div>
                            <div className="space-y-1">
                                <div className={`text-2xl font-bold ${stat.color}`}>
                                    {stat.value}
                                </div>
                                <div className="text-sm font-medium text-gray-700">
                                    {stat.title}
                                </div>
                                {stat.subtitle && (
                                    <div className="text-xs text-muted-foreground">
                                        {stat.subtitle}
                                    </div>
                                )}
                            </div>
                        </Card>
                    );
                })}
            </div>

            {/* Priority & Status Breakdown */}
            <div className="grid md:grid-cols-2 gap-4">
                {/* Priority Breakdown */}
                <Card className="p-4">
                    <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
                        <Flag className="w-4 h-4" />
                        Priority Distribution
                    </h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <span className="text-sm">High</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{highPriority}</span>
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-red-500 h-2 rounded-full" 
                                        style={{ 
                                            width: totalTodos > 0 ? `${(highPriority / totalTodos) * 100}%` : '0%' 
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <span className="text-sm">Medium</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{mediumPriority}</span>
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-yellow-500 h-2 rounded-full" 
                                        style={{ 
                                            width: totalTodos > 0 ? `${(mediumPriority / totalTodos) * 100}%` : '0%' 
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span className="text-sm">Low</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{lowPriority}</span>
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-green-500 h-2 rounded-full" 
                                        style={{ 
                                            width: totalTodos > 0 ? `${(lowPriority / totalTodos) * 100}%` : '0%' 
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Status Breakdown */}
                <Card className="p-4">
                    <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Status Distribution
                    </h3>
                    <div className="space-y-2">
                        {Object.entries(statusCounts)
                            .filter(([_, count]) => count > 0)
                            .map(([status, count]) => {
                                const statusConfig = {
                                    backlog: { label: 'Backburner', color: 'bg-gray-500' },
                                    todo: { label: 'To Do', color: 'bg-blue-500' },
                                    working: { label: 'Working', color: 'bg-orange-500' },
                                    qa: { label: 'QA', color: 'bg-purple-500' },
                                    in_review: { label: 'In Review', color: 'bg-yellow-500' },
                                    completed: { label: 'Completed', color: 'bg-green-500' }
                                };
                                
                                const config = statusConfig[status];
                                return (
                                    <div key={status} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${config.color}`} />
                                            <span className="text-sm">{config.label}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium">{count}</span>
                                            <div className="w-16 bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className={`${config.color} h-2 rounded-full`}
                                                    style={{ 
                                                        width: totalTodos > 0 ? `${(count / totalTodos) * 100}%` : '0%' 
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                </Card>
            </div>
        </div>
    );
}