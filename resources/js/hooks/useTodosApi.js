import { useState } from "react";
import axios from "axios";

export default function useTodosApi({
    initialTodos = [],
    initialTags = [],
    setTodos: externalSetTodos,
    setTags: externalSetTags,
    setTodoForm: externalSetTodoForm,
    setIsCreateDialogOpen,
    setIsEditDialogOpen,
    setIsTagManagerOpen,
    setIsTagDialogOpen,
    setTagForm: externalSetTagForm,
    showAlert,
}) {
    // Local state fallback if not provided
    const [todos, setTodos] = externalSetTodos ? [null, externalSetTodos] : useState(initialTodos);
    const [tags, setTags] = externalSetTags ? [null, externalSetTags] : useState(initialTags);
    const [todoForm, setTodoForm] = externalSetTodoForm ? [null, externalSetTodoForm] : useState({
        title: "",
        description: "",
        status: "todo",
        priority: "medium",
        due_date: "",
        tag_ids: [],
    });
    const [tagForm, setTagForm] = externalSetTagForm ? [null, externalSetTagForm] : useState({
        name: "",
        color: "#3b82f6",
        description: "",
    });

    // API Handlers
    const handleCreateTag = async () => {
        if (!tagForm.name.trim()) {
            showAlert && showAlert('Please enter a tag name', 'Validation');
            return;
        }
        try {
            const response = await axios.post('/api/tags', {
                name: tagForm.name.trim(),
                color: tagForm.color,
                description: tagForm.description || null
            });
            setTags(prev => [...prev, response.data]);
            setTagForm({ name: '', color: '#3b82f6', description: '' });
            setIsTagManagerOpen && setIsTagManagerOpen(false);
            setIsTagDialogOpen && setIsTagDialogOpen(false);
            showAlert && showAlert('Tag created successfully!', 'Success');
        } catch (error) {
            console.error('Error creating tag:', error);
            const errorMessage = error.response?.data?.message || 'Failed to create tag';
            showAlert && showAlert(`Error: ${errorMessage}`, 'Error');
        }
    };

    const handleDeleteTag = async (id) => {
        if (!confirm('Are you sure you want to delete this tag?')) {
            return;
        }
        try {
            await axios.delete(`/api/tags/${id}`);
            setTags(prev => prev.filter(tag => tag.id !== id));
            setTodos(prev => prev.map(todo => ({
                ...todo,
                tags: todo.tags ? todo.tags.filter(tag => tag.id !== id) : []
            })));
            showAlert && showAlert('Tag deleted successfully!', 'Success');
        } catch (error) {
            console.error('Error deleting tag:', error);
            const errorMessage = error.response?.data?.message || 'Failed to delete tag';
            showAlert && showAlert(`Error: ${errorMessage}`, 'Error');
        }
    };

    const handleCreateTodo = async () => {
        if (!todoForm.title.trim()) {
            showAlert && showAlert('Please enter a todo title', 'Validation');
            return;
        }
        try {
            const response = await axios.post('/api/todos', {
                title: todoForm.title.trim(),
                description: todoForm.description || null,
                status: todoForm.status,
                priority: todoForm.priority,
                due_date: todoForm.due_date || null,
                tag_ids: todoForm.tag_ids
            });
            setTodos(prev => [response.data, ...prev]);
            setTodoForm({
                title: '',
                description: '',
                status: 'todo',
                priority: 'medium',
                due_date: '',
                tag_ids: []
            });
            setIsCreateDialogOpen && setIsCreateDialogOpen(false);
            showAlert && showAlert('Todo created successfully!', 'Success');
        } catch (error) {
            console.error('Error creating todo:', error);
            const errorMessage = error.response?.data?.message || 'Failed to create todo';
            showAlert && showAlert(`Error: ${errorMessage}`, 'Error');
        }
    };

    const handleUpdateTodo = async () => {
        if (!todoForm.title.trim()) {
            showAlert && showAlert('Please enter a todo title', 'Validation');
            return;
        }
        try {
            const response = await axios.put(`/api/todos/${todoForm.id}`, {
                title: todoForm.title.trim(),
                description: todoForm.description || null,
                status: todoForm.status,
                priority: todoForm.priority,
                due_date: todoForm.due_date || null,
                tag_ids: todoForm.tag_ids
            });
            setTodos(prev => prev.map(todo =>
                todo.id === todoForm.id ? response.data : todo
            ));
            setIsEditDialogOpen && setIsEditDialogOpen(false);
            showAlert && showAlert('Todo updated successfully!', 'Success');
        } catch (error) {
            console.error('Error updating todo:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update todo';
            showAlert && showAlert(`Error: ${errorMessage}`, 'Error');
        }
    };

    const handleToggleComplete = async (id) => {
        const todo = (todos || []).find(t => t.id === id);
        if (!todo) return;
        try {
            const newStatus = todo.status === 'completed' ? 'todo' : 'completed';
            const response = await axios.put(`/api/todos/${id}`, {
                status: newStatus
            });
            setTodos(prev => prev.map(t =>
                t.id === id ? response.data : t
            ));
        } catch (error) {
            console.error('Error toggling todo completion:', error);
            const errorMessage = error.response?.data?.message || 'Failed to update todo';
            showAlert && showAlert(`Error: ${errorMessage}`, 'Error');
        }
    };

    const openEditDialog = (todo) => {
        setTodoForm({
            id: todo.id,
            title: todo.title,
            description: todo.description || '',
            status: todo.status,
            priority: todo.priority,
            due_date: todo.due_date || '',
            tag_ids: todo.tags ? todo.tags.map(tag => tag.id) : []
        });
        setIsEditDialogOpen && setIsEditDialogOpen(true);
    };

    const handleDeleteTodo = async (id) => {
        // Use custom confirm modal if provided
        if (typeof showConfirm === 'function') {
            return new Promise((resolve) => {
                showConfirm(
                    'Are you sure you want to delete this todo?',
                    'Delete Todo',
                    async () => {
                        try {
                            await axios.delete(`/api/todos/${id}`);
                            setTodos(prev => prev.filter(todo => todo.id !== id));
                            showAlert && showAlert('Todo deleted successfully!', 'Success');
                            resolve(true);
                        } catch (error) {
                            console.error('Error deleting todo:', error);
                            const errorMessage = error.response?.data?.message || 'Failed to delete todo';
                            showAlert && showAlert(`Error: ${errorMessage}`, 'Error');
                            resolve(false);
                        }
                    },
                    () => resolve(false)
                );
            });
        } else {
            if (!window.confirm('Are you sure you want to delete this todo?')) {
                return;
            }
            try {
                await axios.delete(`/api/todos/${id}`);
                setTodos(prev => prev.filter(todo => todo.id !== id));
                showAlert && showAlert('Todo deleted successfully!', 'Success');
            } catch (error) {
                console.error('Error deleting todo:', error);
                const errorMessage = error.response?.data?.message || 'Failed to delete todo';
                showAlert && showAlert(`Error: ${errorMessage}`, 'Error');
            }
        }
        try {
            await axios.delete(`/api/todos/${id}`);
            setTodos(prev => prev.filter(todo => todo.id !== id));
            showAlert && showAlert('Todo deleted successfully!', 'Success');
        } catch (error) {
            console.error('Error deleting todo:', error);
            const errorMessage = error.response?.data?.message || 'Failed to delete todo';
            showAlert && showAlert(`Error: ${errorMessage}`, 'Error');
        }
    };

    return {
        todos,
        setTodos,
        tags,
        setTags,
        todoForm,
        setTodoForm,
        tagForm,
        setTagForm,
        handleCreateTag,
        handleDeleteTag,
        handleCreateTodo,
        handleUpdateTodo,
        handleToggleComplete,
        openEditDialog,
        handleDeleteTodo,
    };
}
