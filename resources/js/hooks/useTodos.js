import { useState, useCallback } from 'react';
import axios from 'axios';

export function useTodos(initialTodos = [], { onSuccess, onError } = {}) {
    const [todos, setTodos] = useState(initialTodos);
    const [loading, setLoading] = useState(false);

    const createTodo = useCallback(async (todoData) => {
        setLoading(true);
        try {
            const response = await axios.post('/todos', todoData);
            const newTodo = response.data;
            setTodos(prev => [newTodo, ...prev]);
            onSuccess?.('Todo created successfully!');
            return newTodo;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create todo';
            onError?.(message);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [onSuccess, onError]);

    const updateTodo = useCallback(async (id, updates) => {
        setLoading(true);
        try {
            const response = await axios.put(`/todos/${id}`, updates);
            const updatedTodo = response.data;
            setTodos(prev => prev.map(todo => 
                todo.id === id ? updatedTodo : todo
            ));
            onSuccess?.('Todo updated successfully!');
            return updatedTodo;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update todo';
            onError?.(message);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [onSuccess, onError]);

    const deleteTodo = useCallback(async (id) => {
        setLoading(true);
        try {
            await axios.delete(`/todos/${id}`);
            setTodos(prev => prev.filter(todo => todo.id !== id));
            onSuccess?.('Todo deleted successfully!');
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete todo';
            onError?.(message);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [onSuccess, onError]);

    const toggleComplete = useCallback(async (id) => {
        const todo = todos.find(t => t.id === id);
        if (!todo) return;
        
        const newStatus = todo.status === 'completed' ? 'todo' : 'completed';
        return updateTodo(id, { status: newStatus });
    }, [todos, updateTodo]);

    return {
        todos,
        setTodos,
        loading,
        createTodo,
        updateTodo,
        deleteTodo,
        toggleComplete,
    };
}
