import React from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    Input,
    Textarea,
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
    Button
} from "@/Components/ui";
import TagSelector from "@/Components/Todos/TagSelector";
import { useTodos } from "@/Components/TodosContext";

export default function TodoDialog({ open, onOpenChange, mode = "create", loading = false }) {
    const {
        todoForm,
        setTodoForm,
        tags,
        handleCreateTodo,
        handleUpdateTodo,
    } = useTodos();
    const isEdit = mode === "edit";

    const handleSubmit = (e) => {
        e?.preventDefault?.();
        if (isEdit) {
            handleUpdateTodo();
        } else {
            handleCreateTodo();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Todo" : "Add Todo"}</DialogTitle>
                    <DialogDescription>
                        {isEdit ? "Update your todo item." : "Create a new todo item."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Title</label>
                        <Input
                            value={todoForm.title}
                            onChange={e => setTodoForm(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Todo title"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Description</label>
                        <Textarea
                            value={todoForm.description}
                            onChange={e => setTodoForm(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Todo description (optional)"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Status</label>
                        <Select value={todoForm.status} onValueChange={value => setTodoForm(prev => ({ ...prev, status: value }))}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="backlog">Backlog</SelectItem>
                                <SelectItem value="todo">Todo</SelectItem>
                                <SelectItem value="working">Working</SelectItem>
                                <SelectItem value="qa">QA</SelectItem>
                                <SelectItem value="in_review">In Review</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Priority</label>
                        <Select value={todoForm.priority} onValueChange={value => setTodoForm(prev => ({ ...prev, priority: value }))}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Due Date</label>
                        <Input
                            type="date"
                            value={todoForm.due_date}
                            onChange={e => setTodoForm(prev => ({ ...prev, due_date: e.target.value }))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">Tags</label>
                        <TagSelector
                            tags={tags}
                            selectedTagIds={todoForm.tag_ids}
                            onChange={newTagIds => setTodoForm(prev => ({ ...prev, tag_ids: newTagIds }))}
                        />
                        {tags.length === 0 && (
                            <p className="text-sm text-gray-500">No tags available. Create some tags first.</p>
                        )}
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" disabled={loading}>
                        {isEdit ? "Update Todo" : "Add Todo"}
                    </Button>
                </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
