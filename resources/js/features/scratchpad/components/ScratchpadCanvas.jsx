import React, { useState, useRef } from 'react';
import { DndContext, DragOverlay, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { restrictToParentElement } from '@dnd-kit/modifiers';
import ScratchpadElement from './ScratchpadElement';

export default function ScratchpadCanvas({ data, onChange }) {
    const [selectedElement, setSelectedElement] = useState(null);
    const [draggedElement, setDraggedElement] = useState(null);
    const canvasRef = useRef(null);
    
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleDragStart = (event) => {
        const { active } = event;
        const element = data.elements.find(el => el.id === active.id);
        setDraggedElement(element);
    };

    const handleDragEnd = (event) => {
        const { active, delta } = event;
        
        if (delta.x === 0 && delta.y === 0) return;

        const newElements = data.elements.map(element => {
            if (element.id === active.id) {
                return {
                    ...element,
                    position: {
                        x: element.position.x + delta.x,
                        y: element.position.y + delta.y
                    }
                };
            }
            return element;
        });

        onChange({
            ...data,
            elements: newElements
        });

        setDraggedElement(null);
    };

    const handleElementUpdate = (elementId, updates) => {
        const newElements = data.elements.map(element => {
            if (element.id === elementId) {
                return { ...element, ...updates };
            }
            return element;
        });

        onChange({
            ...data,
            elements: newElements
        });
    };

    const handleElementDelete = (elementId) => {
        const newElements = data.elements.filter(element => element.id !== elementId);
        onChange({
            ...data,
            elements: newElements
        });
        
        if (selectedElement?.id === elementId) {
            setSelectedElement(null);
        }
    };

    const handleCanvasClick = (event) => {
        // Deselect element if clicking on canvas
        if (event.target === canvasRef.current) {
            setSelectedElement(null);
        }
    };

    const handleKeyDown = (event) => {
        // Delete selected element with Delete key
        if (event.key === 'Delete' && selectedElement) {
            handleElementDelete(selectedElement.id);
        }
        // Deselect with Escape key
        if (event.key === 'Escape') {
            setSelectedElement(null);
        }
    };

    return (
        <div 
            className="relative w-full h-full overflow-hidden bg-gray-50"
            onClick={handleCanvasClick}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            style={{
                backgroundImage: data.canvas.gridEnabled 
                    ? 'radial-gradient(circle, #ccc 1px, transparent 1px)'
                    : 'none',
                backgroundSize: data.canvas.gridEnabled ? '20px 20px' : 'auto',
                transform: `scale(${data.canvas.zoom || 1})`,
                transformOrigin: 'top left'
            }}
        >
            <div ref={canvasRef} className="absolute inset-0">
                <DndContext
                    sensors={sensors}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToParentElement]}
                >
                    {data.elements.map((element) => (
                        <ScratchpadElement
                            key={element.id}
                            element={element}
                            isSelected={selectedElement?.id === element.id}
                            onSelect={() => setSelectedElement(element)}
                            onUpdate={handleElementUpdate}
                            onDelete={() => handleElementDelete(element.id)}
                        />
                    ))}
                    
                    <DragOverlay>
                        {draggedElement ? (
                            <ScratchpadElement
                                element={draggedElement}
                                isDragging={true}
                                onSelect={() => {}}
                                onUpdate={() => {}}
                                onDelete={() => {}}
                            />
                        ) : null}
                    </DragOverlay>
                </DndContext>
            </div>
        </div>
    );
}