import { useState, useCallback } from 'react';
import axios from 'axios';

export function useTags(initialTags = [], { onSuccess, onError } = {}) {
    const [tags, setTags] = useState(initialTags);
    const [loading, setLoading] = useState(false);

    const createTag = useCallback(async (tagData) => {
        setLoading(true);
        try {
            const response = await axios.post('/tags', tagData);
            const newTag = response.data;
            setTags(prev => [...prev, newTag]);
            onSuccess?.('Tag created successfully!');
            return newTag;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to create tag';
            onError?.(message);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [onSuccess, onError]);

    const updateTag = useCallback(async (id, updates) => {
        setLoading(true);
        try {
            const response = await axios.put(`/tags/${id}`, updates);
            const updatedTag = response.data;
            setTags(prev => prev.map(tag => 
                tag.id === id ? updatedTag : tag
            ));
            onSuccess?.('Tag updated successfully!');
            return updatedTag;
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to update tag';
            onError?.(message);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [onSuccess, onError]);

    const deleteTag = useCallback(async (id) => {
        setLoading(true);
        try {
            await axios.delete(`/tags/${id}`);
            setTags(prev => prev.filter(tag => tag.id !== id));
            onSuccess?.('Tag deleted successfully!');
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to delete tag';
            onError?.(message);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [onSuccess, onError]);

    return {
        tags,
        setTags,
        loading,
        createTag,
        updateTag,
        deleteTag,
    };
}
