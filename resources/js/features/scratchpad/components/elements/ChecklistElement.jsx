import React, { useState } from 'react';
import { Plus, X, Check } from 'lucide-react';
import { Button, Input, Checkbox } from '@/Components/ui';

export default function ChecklistElement({ element, isEditing, onDataChange }) {
    const [newItemText, setNewItemText] = useState('');

    const handleTitleChange = (newTitle) => {
        onDataChange({
            ...element.data,
            title: newTitle
        });
    };

    const handleItemChange = (itemId, field, value) => {
        const updatedItems = element.data.items.map(item => {
            if (item.id === itemId) {
                return { ...item, [field]: value };
            }
            return item;
        });

        onDataChange({
            ...element.data,
            items: updatedItems
        });
    };

    const handleAddItem = () => {
        if (!newItemText.trim()) return;

        const newItem = {
            id: Date.now(),
            text: newItemText,
            completed: false
        };

        onDataChange({
            ...element.data,
            items: [...element.data.items, newItem]
        });

        setNewItemText('');
    };

    const handleRemoveItem = (itemId) => {
        const updatedItems = element.data.items.filter(item => item.id !== itemId);
        onDataChange({
            ...element.data,
            items: updatedItems
        });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            if (e.target.name === 'newItem') {
                handleAddItem();
            }
        }
        e.stopPropagation();
    };

    return (
        <div className="w-full h-full p-4 bg-white rounded shadow-sm">
            {/* Title */}
            {isEditing ? (
                <Input
                    value={element.data.title || ''}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="font-semibold text-lg mb-3 border-0 border-b-2 px-0 rounded-none"
                    placeholder="Checklist title..."
                />
            ) : (
                <h3 className="font-semibold text-lg mb-3 border-b pb-2">
                    {element.data.title || 'Untitled Checklist'}
                </h3>
            )}

            {/* Items */}
            <div className="space-y-2 mb-3">
                {element.data.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 group">
                        <Checkbox
                            checked={item.completed}
                            onCheckedChange={(checked) => 
                                handleItemChange(item.id, 'completed', checked)
                            }
                        />
                        
                        {isEditing ? (
                            <Input
                                value={item.text}
                                onChange={(e) => 
                                    handleItemChange(item.id, 'text', e.target.value)
                                }
                                className={`flex-1 ${
                                    item.completed ? 'line-through text-gray-500' : ''
                                }`}
                                onKeyDown={handleKeyDown}
                            />
                        ) : (
                            <span 
                                className={`flex-1 ${
                                    item.completed ? 'line-through text-gray-500' : ''
                                }`}
                            >
                                {item.text}
                            </span>
                        )}

                        {isEditing && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 text-red-600"
                                onClick={() => handleRemoveItem(item.id)}
                            >
                                <X className="w-3 h-3" />
                            </Button>
                        )}
                    </div>
                ))}
            </div>

            {/* Add new item */}
            {isEditing && (
                <div className="flex gap-2">
                    <Input
                        name="newItem"
                        value={newItemText}
                        onChange={(e) => setNewItemText(e.target.value)}
                        placeholder="Add new item..."
                        className="flex-1"
                        onKeyDown={handleKeyDown}
                    />
                    <Button
                        size="sm"
                        onClick={handleAddItem}
                        disabled={!newItemText.trim()}
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
            )}

            {/* Progress indicator */}
            {!isEditing && element.data.items.length > 0 && (
                <div className="mt-3 pt-2 border-t">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>
                            {element.data.items.filter(item => item.completed).length} / {element.data.items.length} completed
                        </span>
                        <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-green-500 transition-all duration-300"
                                style={{
                                    width: `${(element.data.items.filter(item => item.completed).length / element.data.items.length) * 100}%`
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}