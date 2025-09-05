import React, { useState, useEffect } from 'react';
import { useTodos } from "./TodosContext";
import {
    Button,
    Input,
} from "@/Components/ui";
import {
    LayoutGrid,
    Kanban,
    List,
    Table,
    Plus,
    Search,
    X,
} from "lucide-react";

export default function TodoNavControls({
    viewMode,
    onViewModeChange,
    setIsCreateDialogOpen
}) {
    // All todos/tags state and handlers from context
    const {
        handleSearch,
    } = useTodos();

    // Search state
    const [searchQuery, setSearchQuery] = useState('');

    // Simple debounce using useEffect
    useEffect(() => {
        const timer = setTimeout(() => {
            handleSearch(searchQuery);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, handleSearch]);

    // Handle search input changes
    const handleSearchInputChange = (e) => {
        const query = e.target.value;
        setSearchQuery(query);
    };

    // Clear search
    const clearSearch = () => {
        setSearchQuery('');
    };

    return (
        <div className="flex items-center gap-3">
            {/* Search Input - priority item */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                    type="text"
                    placeholder="Search todos..."
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    className="pl-9 pr-9 w-48 lg:w-64"
                />
                {searchQuery && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSearch}
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                    >
                        <X className="w-4 h-4" />
                    </Button>
                )}
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-border" />

            {/* View Mode Toggle */}
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
                <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewModeChange('grid')}
                    className="h-8 px-2"
                >
                    <LayoutGrid className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">Grid</span>
                </Button>
                <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewModeChange('list')}
                    className="h-8 px-2"
                >
                    <List className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">List</span>
                </Button>
                <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewModeChange('table')}
                    className="h-8 px-2"
                >
                    <Table className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">Table</span>
                </Button>
                <Button
                    variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewModeChange('kanban')}
                    className="h-8 px-2"
                >
                    <Kanban className="w-4 h-4" />
                    <span className="hidden sm:inline ml-1">Kanban</span>
                </Button>
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-border" />

            {/* Add ToDo Button */}
            <Button
                variant="default"
                size="sm"
                className="h-8"
                onClick={() => setIsCreateDialogOpen && setIsCreateDialogOpen(true)}
            >
                <Plus className="w-4 h-4 md:mr-1" />
                <span className="hidden md:inline">Add ToDo</span>
            </Button>
        </div>
    );
}
