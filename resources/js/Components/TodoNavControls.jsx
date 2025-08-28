import React from 'react';
import ThemeToggle from './ThemeToggle';
import { useTodos } from "@/Components/TodosContext";
import {
    Button,
    Input,
    Textarea,
    Badge,
    Checkbox,
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/Components/ui";
import {
    LayoutGrid,
    Kanban,
    Tag,
    Plus,
    Trash2,
} from "lucide-react";

export default function TodoNavControls({
    viewMode,
    onViewModeChange,
    activeTagFilter,
    onTagFilterChange,
    isTagManagerOpen,
    setIsTagManagerOpen,
    isTagDialogOpen,
    setIsTagDialogOpen,
    isCreateDialogOpen,
    setIsCreateDialogOpen
}) {
    // All todos/tags state and handlers from context
    const {
        tags,
        tagForm,
        setTagForm,
        handleCreateTag,
        handleDeleteTag,
    } = useTodos();
    return (
        <div className="flex items-center gap-3">
                            <ThemeToggle />

            <div className="flex gap-1 p-1 bg-muted rounded-lg">
                <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewModeChange('grid')}
                    className="h-8"
                >
                    <LayoutGrid className="w-4 h-4 mr-1" />
                    Grid
                </Button>
                <Button
                    variant={viewMode === 'kanban' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => onViewModeChange('kanban')}
                    className="h-8"
                >
                    <Kanban className="w-4 h-4 mr-1" />
                    Kanban
                </Button>
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-border" />

            {/* Tag Management */}
            <div className="flex items-center gap-2">
                <Dialog open={isTagManagerOpen} onOpenChange={setIsTagManagerOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Tag className="w-4 h-4 mr-2" />
                            Manage Tags
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Tag Manager</DialogTitle>
                            <DialogDescription>
                                Manage your tags - view, create, and delete tags.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            {/* Create New Tag Section */}
                            <div className="border rounded-lg p-4 bg-card">
                                <h3 className="font-medium mb-3">Create New Tag</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Name</label>
                                        <Input
                                            value={tagForm.name}
                                            onChange={(e) => setTagForm(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="Tag name"
                                            size="sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Color</label>
                                        <Input
                                            type="color"
                                            value={tagForm.color}
                                            onChange={(e) => setTagForm(prev => ({ ...prev, color: e.target.value }))}
                                            size="sm"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <Button onClick={handleCreateTag} size="sm" className="w-full">
                                            Create Tag
                                        </Button>
                                    </div>
                                </div>
                                {tagForm.description !== '' && (
                                    <div className="mt-3">
                                        <label className="block text-sm font-medium mb-1">Description</label>
                                        <Textarea
                                            value={tagForm.description}
                                            onChange={(e) => setTagForm(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Tag description (optional)"
                                            rows={2}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Existing Tags List */}
                            <div>
                                <h3 className="font-medium mb-3">Existing Tags ({tags.length})</h3>
                                {tags.length > 0 ? (
                                    <div className="max-h-60 overflow-y-auto border rounded-lg">
                                        <div className="grid gap-2 p-2">
                                            {tags.map((tag) => (
                                                <div key={tag.id} className="flex items-center justify-between p-2 border rounded hover:bg-muted">
                                                    <div className="flex items-center gap-3">
                                                        <div
                                                            className="w-4 h-4 rounded-full border"
                                                            style={{ backgroundColor: tag.color }}
                                                        ></div>
                                                        <div>
                                                            <div className="font-medium text-sm">{tag.name}</div>
                                                            {tag.description && (
                                                                <div className="text-xs text-gray-500">{tag.description}</div>
                                                            )}
                                                            <div className="text-xs text-gray-400">
                                                                Used in {tag.todos?.length || 0} todo(s)
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeleteTag(tag.id)}
                                                        className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <Tag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                        <p>No tags created yet.</p>
                                        <p className="text-sm">Create your first tag above!</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                {/* Add ToDo Button replaces Quick Tag */}
                <Button
                    variant="primary"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() => setIsCreateDialogOpen && setIsCreateDialogOpen(true)}
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Add ToDo
                </Button>
            </div>

            {/* Separator */}
            <div className="h-6 w-px bg-border" />

            {/* Tag Filter Buttons */}
            <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-500">Filter:</span>
                <Button
                    variant={!activeTagFilter ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onTagFilterChange(null)}
                >
                    All
                </Button>
                {tags.slice(0, 4).map(tag => (
                    <Button
                        key={tag.id}
                        variant={activeTagFilter === tag.id ? 'default' : 'outline'}
                        size="sm"
                        style={{ borderColor: tag.color, color: tag.color }}
                        onClick={() => onTagFilterChange(tag.id)}
                        className="flex items-center gap-1"
                    >
                        <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: tag.color }}></span>
                        {tag.name}
                    </Button>
                ))}
                {tags.length > 4 && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="text-xs text-gray-500"
                    >
                        +{tags.length - 4} more
                    </Button>
                )}
            </div>
        </div>
    );
}
