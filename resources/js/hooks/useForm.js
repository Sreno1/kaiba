import { useState, useCallback } from 'react';

export function useForm(initialState = {}) {
    const [values, setValues] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [isDirty, setIsDirty] = useState(false);

    const setValue = useCallback((field, value) => {
        setValues(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    }, [errors]);

    const setValues = useCallback((newValues) => {
        setValues(newValues);
        setIsDirty(false);
        setErrors({});
    }, []);

    const reset = useCallback(() => {
        setValues(initialState);
        setErrors({});
        setIsDirty(false);
    }, [initialState]);

    const setFieldError = useCallback((field, error) => {
        setErrors(prev => ({ ...prev, [field]: error }));
    }, []);

    const handleChange = useCallback((e) => {
        const { name, value, type, checked } = e.target;
        setValue(name, type === 'checkbox' ? checked : value);
    }, [setValue]);

    return {
        values,
        setValues,
        setValue,
        errors,
        setFieldError,
        isDirty,
        reset,
        handleChange,
    };
}
