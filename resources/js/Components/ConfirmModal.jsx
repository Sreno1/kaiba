import React from 'react';
import Modal from './Modal';

export default function ConfirmModal({ show, title, message, onConfirm, onCancel }) {
    return (
        <Modal show={show} onClose={onCancel} maxWidth="sm">
            <div className="p-6">
                {title && <h2 className="text-lg font-semibold mb-2">{title}</h2>}
                <div className="mb-4 text-foreground">{message}</div>
                <div className="flex justify-end gap-2">
                    <button
                        className="px-4 py-2 bg-muted text-foreground rounded hover:bg-muted/80 focus:outline-none"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/90 focus:outline-none"
                        onClick={onConfirm}
                        autoFocus
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </Modal>
    );
}
