import { useState, useCallback } from 'react';

export default function useAlertModal() {
    const [alert, setAlert] = useState({ show: false, title: '', message: '', onClose: null });

    const showAlert = useCallback((message, title = '', onClose = null) => {
        setAlert({ show: true, title, message, onClose });
    }, []);

    const hideAlert = useCallback(() => {
        setAlert(prev => {
            if (prev.onClose) prev.onClose();
            return { ...prev, show: false };
        });
    }, []);

    return {
        alert,
        showAlert,
        hideAlert,
    };
}
