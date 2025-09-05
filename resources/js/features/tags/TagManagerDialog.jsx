import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    Button,
    Input,
    Textarea
} from "@/Components/ui";
import { Tag, Trash2 } from "lucide-react";

export default function TagManagerDialog({ 
    open, 
    onOpenChange, 
    tags, 
    tagForm, 
    setTagForm, 
    handleCreateTag, 
    handleDeleteTag, 
    onTagFilterChange 
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Tag Manager</DialogTitle>
                    <DialogDescription>
                        Manage your tags - view, create, and delete tags. Filter todos by clicking tag names below.
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

                    {/* Existing Tags List with Filter functionality */}
                    <div>
                        <h3 className="font-medium mb-3">
                            Existing Tags ({tags.length})
                            <span className="text-sm text-muted-foreground ml-2">Click to filter todos</span>
                        </h3>
                        {tags.length > 0 ? (
                            <div className="max-h-60 overflow-y-auto border rounded-lg">
                                <div className="grid gap-2 p-2">
                                    {tags.map((tag) => (
                                        <div key={tag.id} className="flex items-center justify-between p-2 border rounded hover:bg-muted">
                                            <button
                                                onClick={() => {
                                                    onTagFilterChange(tag.id);
                                                    onOpenChange(false);
                                                }}
                                                className="flex items-center gap-3 flex-1 text-left hover:bg-muted/50 rounded p-1"
                                            >
                                                <div
                                                    className="w-4 h-4 rounded-full border"
                                                    style={{ backgroundColor: tag.color }}
                                                ></div>
                                                <div>
                                                    <div className="font-medium text-sm">{tag.name}</div>
                                                    {tag.description && (
                                                        <div className="text-xs text-muted-foreground">{tag.description}</div>
                                                    )}
                                                    <div className="text-xs text-muted-foreground">
                                                        Used in {tag.todos?.length || 0} todo(s)
                                                    </div>
                                                </div>
                                            </button>
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
                            <div className="text-center py-8 text-muted-foreground">
                                <Tag className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>No tags created yet.</p>
                                <p className="text-sm">Create your first tag above!</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}