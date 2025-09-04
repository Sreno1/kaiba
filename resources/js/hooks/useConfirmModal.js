import { useState, useCallback } from 'react';

export default function useConfirmModal() {
    const [confirm, setConfirm] = useState({ show: false, title: '', message: '', onConfirm: null, onCancel: null });

    const showConfirm = useCallback((message, title = '', onConfirm, onCancel) => {
        setConfirm({ show: true, title, message, onConfirm, onCancel });
    }, []);

    const handleConfirm = useCallback(() => {
        setConfirm(prev => {
            if (prev.onConfirm) prev.onConfirm();
            return { ...prev, show: false };
        });
    }, []);

    const handleCancel = useCallback(() => {
        setConfirm(prev => {
            if (prev.onCancel) prev.onCancel();
            return { ...prev, show: false };
        });
    }, []);

    return {
        confirm,
        showConfirm,
        handleConfirm,
        handleCancel,
    };
}
