import React, { useState, useRef, useEffect } from 'react';

export default function TextElement({ element, isEditing, onDataChange }) {
    const [localContent, setLocalContent] = useState(element.data.content || '');
    const textareaRef = useRef(null);

    useEffect(() => {
        setLocalContent(element.data.content || '');
    }, [element.data.content]);

    useEffect(() => {
        if (isEditing && textareaRef.current) {
            textareaRef.current.focus();
            textareaRef.current.select();
        }
    }, [isEditing]);

    const handleContentChange = (e) => {
        setLocalContent(e.target.value);
    };

    const handleBlur = () => {
        onDataChange({
            ...element.data,
            content: localContent
        });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            textareaRef.current?.blur();
        }
        e.stopPropagation(); // Prevent canvas shortcuts while editing
    };

    if (isEditing) {
        return (
            <textarea
                ref={textareaRef}
                value={localContent}
                onChange={handleContentChange}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className="w-full h-full p-3 border-0 outline-none resize-none bg-white"
                style={{
                    fontSize: element.data.fontSize || 14,
                    color: element.data.color || '#000000',
                    fontFamily: element.data.fontFamily || 'inherit'
                }}
                placeholder="Enter your text..."
            />
        );
    }

    return (
        <div 
            className="w-full h-full p-3 bg-white rounded shadow-sm overflow-auto"
            style={{
                fontSize: element.data.fontSize || 14,
                color: element.data.color || '#000000',
                fontFamily: element.data.fontFamily || 'inherit'
            }}
        >
            {element.data.content ? (
                <div className="whitespace-pre-wrap">
                    {element.data.content}
                </div>
            ) : (
                <div className="text-gray-400 italic">
                    Click to edit text...
                </div>
            )}
        </div>
    );
}