import React, { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/Components/ui/popover';
import { Checkbox } from '@/Components/ui/checkbox';
import { 
    Filter,
    X,
    AlertCircle,
    Clock,
    Flag,
    Calendar,
    Tag,
    Search,
    Sparkles,
    TrendingUp
} from 'lucide-react';

export default function AdvancedFilters({
    filters = {},
    onFiltersChange,
    tags = [],
    todos = [],
    className = ''
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState({
        search: '',
        status: [],
        priority: [],
        tags: [],
        overdue: false,
        due_within: null,
        recent_days: null,
        ...filters
    });

    // Quick filter presets
    const quickFilters = [
        {
            id: 'overdue',
            label: 'Overdue',
            icon: AlertCircle,
            color: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
            filters: { overdue: true }
        },
        {
            id: 'due_soon',
            label: 'Due Soon',
            icon: Clock,
            color: 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200',
            filters: { due_within: 3 }
        },
        {
            id: 'high_priority',
            label: 'High Priority',
            icon: Flag,
            color: 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200',
            filters: { priority: ['high'] }
        },
        {
            id: 'in_progress',
            label: 'In Progress',
            icon: TrendingUp,
            color: 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200',
            filters: { status: ['working', 'qa', 'in_review'] }
        },
        {
            id: 'recent',
            label: 'Recent',
            icon: Sparkles,
            color: 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200',
            filters: { recent_days: 7 }
        }
    ];

    const statusOptions = [
        { value: 'backlog', label: 'Backburner', color: '#6b7280' },
        { value: 'todo', label: 'To Do', color: '#3b82f6' },
        { value: 'working', label: 'Working', color: '#f59e0b' },
        { value: 'qa', label: 'QA', color: '#8b5cf6' },
        { value: 'in_review', label: 'In Review', color: '#f59e0b' },
        { value: 'completed', label: 'Completed', color: '#10b981' }
    ];

    const priorityOptions = [
        { value: 'low', label: 'Low', color: '#10b981' },
        { value: 'medium', label: 'Medium', color: '#f59e0b' },
        { value: 'high', label: 'High', color: '#ef4444' }
    ];

    // Update parent when local filters change
    useEffect(() => {
        onFiltersChange?.(localFilters);
    }, [localFilters, onFiltersChange]);

    const updateFilter = (key, value) => {
        setLocalFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const toggleArrayFilter = (key, value) => {
        setLocalFilters(prev => ({
            ...prev,
            [key]: prev[key]?.includes(value) 
                ? prev[key].filter(v => v !== value)
                : [...(prev[key] || []), value]
        }));
    };

    const applyQuickFilter = (quickFilter) => {
        setLocalFilters(prev => ({
            ...prev,
            ...quickFilter.filters
        }));
    };

    const clearAllFilters = () => {
        setLocalFilters({
            search: '',
            status: [],
            priority: [],
            tags: [],
            overdue: false,
            due_within: null,
            recent_days: null
        });
    };

    const hasActiveFilters = () => {
        return localFilters.search ||
               localFilters.status?.length ||
               localFilters.priority?.length ||
               localFilters.tags?.length ||
               localFilters.overdue ||
               localFilters.due_within ||
               localFilters.recent_days;
    };

    const getActiveFilterCount = () => {
        let count = 0;
        if (localFilters.search) count++;
        if (localFilters.status?.length) count += localFilters.status.length;
        if (localFilters.priority?.length) count += localFilters.priority.length;
        if (localFilters.tags?.length) count += localFilters.tags.length;
        if (localFilters.overdue) count++;
        if (localFilters.due_within) count++;
        if (localFilters.recent_days) count++;
        return count;
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {/* Quick Filter Buttons */}
            <div className="flex items-center gap-1">
                {quickFilters.map(filter => {
                    const Icon = filter.icon;
                    return (
                        <Button
                            key={filter.id}
                            variant="outline"
                            size="sm"
                            onClick={() => applyQuickFilter(filter)}
                            className={`h-8 px-3 border ${filter.color}`}
                        >
                            <Icon className="w-3 h-3 mr-1" />
                            <span className="text-xs">{filter.label}</span>
                        </Button>
                    );
                })}
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-border" />

            {/* Advanced Filters Popover */}
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button 
                        variant={hasActiveFilters() ? "default" : "outline"} 
                        size="sm"
                        className="h-8"
                    >
                        <Filter className="w-4 h-4 mr-1" />
                        <span className="hidden sm:inline">
                            Filters
                            {hasActiveFilters() && (
                                <Badge variant="secondary" className="ml-2 h-5 px-1 text-xs">
                                    {getActiveFilterCount()}
                                </Badge>
                            )}
                        </span>
                    </Button>
                </PopoverTrigger>
                
                <PopoverContent className="w-80" align="end">
                    <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium">Advanced Filters</h4>
                            {hasActiveFilters() && (
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={clearAllFilters}
                                    className="h-8 px-2 text-muted-foreground"
                                >
                                    <X className="w-3 h-3 mr-1" />
                                    Clear
                                </Button>
                            )}
                        </div>

                        {/* Search */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Search className="w-4 h-4" />
                                Search
                            </label>
                            <Input
                                type="text"
                                placeholder="Search todos, descriptions, tags..."
                                value={localFilters.search}
                                onChange={(e) => updateFilter('search', e.target.value)}
                                className="h-8"
                            />
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <TrendingUp className="w-4 h-4" />
                                Status
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {statusOptions.map(status => (
                                    <div key={status.value} className="flex items-center space-x-2">
                                        <Checkbox
                                            checked={localFilters.status?.includes(status.value)}
                                            onCheckedChange={() => toggleArrayFilter('status', status.value)}
                                        />
                                        <div className="flex items-center gap-2">
                                            <div 
                                                className="w-2 h-2 rounded-full" 
                                                style={{ backgroundColor: status.color }}
                                            />
                                            <span className="text-xs">{status.label}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Priority Filter */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Flag className="w-4 h-4" />
                                Priority
                            </label>
                            <div className="flex gap-2">
                                {priorityOptions.map(priority => (
                                    <div key={priority.value} className="flex items-center space-x-2">
                                        <Checkbox
                                            checked={localFilters.priority?.includes(priority.value)}
                                            onCheckedChange={() => toggleArrayFilter('priority', priority.value)}
                                        />
                                        <div className="flex items-center gap-2">
                                            <div 
                                                className="w-2 h-2 rounded-full" 
                                                style={{ backgroundColor: priority.color }}
                                            />
                                            <span className="text-xs">{priority.label}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Tags Filter */}
                        {tags.length > 0 && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Tag className="w-4 h-4" />
                                    Tags
                                </label>
                                <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                                    {tags.slice(0, 10).map(tag => (
                                        <div key={tag.id} className="flex items-center space-x-2">
                                            <Checkbox
                                                checked={localFilters.tags?.includes(tag.id)}
                                                onCheckedChange={() => toggleArrayFilter('tags', tag.id)}
                                            />
                                            <div className="flex items-center gap-2">
                                                <div 
                                                    className="w-2 h-2 rounded-full" 
                                                    style={{ backgroundColor: tag.color }}
                                                />
                                                <span className="text-xs">{tag.name}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Time-based Filters */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Time Filters
                            </label>
                            <div className="space-y-2">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        checked={localFilters.overdue}
                                        onCheckedChange={(checked) => updateFilter('overdue', checked)}
                                    />
                                    <span className="text-xs">Show overdue todos</span>
                                </div>
                                
                                <div className="space-y-2">
                                    <span className="text-xs text-muted-foreground">Due within days:</span>
                                    <Input
                                        type="number"
                                        placeholder="e.g., 7"
                                        value={localFilters.due_within || ''}
                                        onChange={(e) => updateFilter('due_within', parseInt(e.target.value) || null)}
                                        className="h-8"
                                        min="1"
                                        max="365"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <span className="text-xs text-muted-foreground">Created within days:</span>
                                    <Input
                                        type="number"
                                        placeholder="e.g., 30"
                                        value={localFilters.recent_days || ''}
                                        onChange={(e) => updateFilter('recent_days', parseInt(e.target.value) || null)}
                                        className="h-8"
                                        min="1"
                                        max="365"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            {/* Clear All Button (when filters active) */}
            {hasActiveFilters() && (
                <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearAllFilters}
                    className="h-8 px-2 text-muted-foreground"
                >
                    <X className="w-3 h-3 mr-1" />
                    Clear All
                </Button>
            )}
        </div>
    );
}