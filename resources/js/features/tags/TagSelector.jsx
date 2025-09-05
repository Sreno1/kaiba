import React, { useState } from "react";
import { Button, Input, Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/Components/ui";
import { Plus } from "lucide-react";
import { useTodos } from "@/features/todos/TodosContext";

export default function TagSelector({ selectedTagIds, onChange }) {
    const { tags, handleCreateTag, tagForm, setTagForm } = useTodos();
    const [isCreateTagOpen, setIsCreateTagOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    
    const handleToggleTag = (tagId) => {
        if (selectedTagIds.includes(tagId)) {
            onChange(selectedTagIds.filter((id) => id !== tagId));
        } else {
            onChange([...selectedTagIds, tagId]);
        }
    };
    
    const handleQuickCreateTag = async () => {
        if (!tagForm.name.trim()) return;
        
        setIsCreating(true);
        try {
            const createdTag = await handleCreateTag();
            if (createdTag && !selectedTagIds.includes(createdTag.id)) {
                // Automatically select the newly created tag
                onChange([...selectedTagIds, createdTag.id]);
            }
            setIsCreateTagOpen(false);
        } catch (error) {
            console.error('Error creating tag:', error);
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <>
            <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                    <Button
                        key={tag.id}
                        type="button"
                        variant={selectedTagIds.includes(tag.id) ? "default" : "outline"}
                        className="px-3 py-1 text-xs rounded-full"
                        style={{ backgroundColor: selectedTagIds.includes(tag.id) ? tag.color : undefined, color: selectedTagIds.includes(tag.id) ? "#fff" : undefined }}
                        onClick={() => handleToggleTag(tag.id)}
                    >
                        {tag.name}
                    </Button>
                ))}
                
                {/* Add new tag button */}
                <Button
                    type="button"
                    variant="outline"
                    className="px-3 py-1 text-xs rounded-full border-dashed"
                    onClick={() => {
                        // Reset form to default state
                        setTagForm({ name: '', color: '#3b82f6', description: '' });
                        setIsCreateTagOpen(true);
                    }}
                >
                    <Plus className="w-3 h-3 mr-1" />
                    New Tag
                </Button>
            </div>
            
            {/* Quick tag creation dialog */}
            <Dialog open={isCreateTagOpen} onOpenChange={setIsCreateTagOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Create New Tag</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Tag Name</label>
                            <Input
                                value={tagForm.name}
                                onChange={(e) => setTagForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Enter tag name"
                                autoFocus={isCreateTagOpen}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleQuickCreateTag();
                                    }
                                    if (e.key === 'Escape') {
                                        setIsCreateTagOpen(false);
                                    }
                                }}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Color</label>
                            <div className="flex gap-2 items-center">
                                <Input
                                    type="color"
                                    value={tagForm.color}
                                    onChange={(e) => setTagForm(prev => ({ ...prev, color: e.target.value }))}
                                    className="w-16 h-8"
                                />
                                <span className="text-sm text-gray-500">{tagForm.color}</span>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => setIsCreateTagOpen(false)}
                            disabled={isCreating}
                        >
                            Cancel
                        </Button>
                        <Button 
                            onClick={handleQuickCreateTag}
                            disabled={!tagForm.name.trim() || isCreating}
                        >
                            {isCreating ? 'Creating...' : 'Create Tag'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
