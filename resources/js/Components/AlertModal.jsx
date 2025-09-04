import React from 'react';
import Modal from './Modal';

export default function AlertModal({ show, title, message, onClose }) {
    return (
        <Modal show={show} onClose={onClose} maxWidth="sm">
            <div className="p-6">
                {title && <h2 className="text-lg font-semibold mb-2">{title}</h2>}
                <div className="mb-4 text-foreground">{message}</div>
                <div className="flex justify-end">
                    <button
                        className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 focus:outline-none"
                        onClick={onClose}
                        autoFocus
                    >
                        OK
                    </button>
                </div>
            </div>
        </Modal>
    );
}
