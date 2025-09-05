import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, Edit3 } from 'lucide-react';
import { Button } from '@/Components/ui';
import TextElement from './elements/TextElement';
import ImageElement from './elements/ImageElement';
import ChecklistElement from './elements/ChecklistElement';

export default function ScratchpadElement({ 
    element, 
    isSelected, 
    isDragging = false,
    onSelect, 
    onUpdate, 
    onDelete 
}) {
    const [isEditing, setIsEditing] = useState(false);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useDraggable({
        id: element.id,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        transition,
        position: 'absolute',
        left: element.position.x,
        top: element.position.y,
        width: element.size.width,
        minHeight: element.size.height,
        zIndex: isSelected ? 10 : 1,
    };

    const handleDataChange = (newData) => {
        onUpdate(element.id, { data: newData });
    };

    const handleSizeChange = (newSize) => {
        onUpdate(element.id, { size: newSize });
    };

    const renderElement = () => {
        const commonProps = {
            element,
            isEditing,
            onDataChange: handleDataChange,
            onSizeChange: handleSizeChange,
        };

        switch (element.type) {
            case 'text':
                return <TextElement {...commonProps} />;
            case 'image':
                return <ImageElement {...commonProps} />;
            case 'checklist':
                return <ChecklistElement {...commonProps} />;
            default:
                return (
                    <div className="p-4 bg-red-100 border border-red-300 rounded">
                        Unknown element type: {element.type}
                    </div>
                );
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
                group cursor-move border-2 transition-all
                ${isSelected 
                    ? 'border-blue-500 shadow-lg' 
                    : 'border-transparent hover:border-gray-300'
                }
                ${isDragging ? 'opacity-50' : ''}
            `}
            onClick={(e) => {
                e.stopPropagation();
                onSelect();
            }}
            {...attributes}
            {...listeners}
        >
            {/* Selection controls */}
            {isSelected && !isDragging && (
                <div className="absolute -top-8 right-0 flex gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 bg-white border border-gray-200 shadow-sm"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(!isEditing);
                        }}
                    >
                        <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 bg-white border border-gray-200 shadow-sm hover:bg-red-50"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                    >
                        <Trash2 className="w-3 h-3 text-red-600" />
                    </Button>
                </div>
            )}

            {/* Element content */}
            <div className="w-full h-full">
                {renderElement()}
            </div>

            {/* Resize handle */}
            {isSelected && !isDragging && (
                <div 
                    className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize"
                    onMouseDown={(e) => {
                        e.stopPropagation();
                        // TODO: Implement resize functionality
                    }}
                />
            )}
        </div>
    );
}