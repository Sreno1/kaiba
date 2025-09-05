import React, { useState } from 'react';
import { Upload, ExternalLink } from 'lucide-react';
import { Button, Input } from '@/Components/ui';

export default function ImageElement({ element, isEditing, onDataChange }) {
    const [urlInput, setUrlInput] = useState(element.data.src || '');

    const handleUrlChange = (e) => {
        setUrlInput(e.target.value);
    };

    const handleUrlSubmit = () => {
        onDataChange({
            ...element.data,
            src: urlInput,
            alt: element.data.alt || 'Image'
        });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleUrlSubmit();
        }
        e.stopPropagation();
    };

    if (isEditing) {
        return (
            <div className="w-full h-full p-4 bg-white rounded shadow-sm">
                <div className="space-y-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Image URL
                        </label>
                        <div className="flex gap-2">
                            <Input
                                type="url"
                                value={urlInput}
                                onChange={handleUrlChange}
                                onKeyDown={handleKeyDown}
                                placeholder="https://example.com/image.jpg"
                                className="flex-1"
                            />
                            <Button
                                size="sm"
                                onClick={handleUrlSubmit}
                                disabled={!urlInput.trim()}
                            >
                                <ExternalLink className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Alt text
                        </label>
                        <Input
                            type="text"
                            value={element.data.alt || ''}
                            onChange={(e) => onDataChange({
                                ...element.data,
                                alt: e.target.value
                            })}
                            placeholder="Describe the image..."
                        />
                    </div>
                </div>
            </div>
        );
    }

    if (!element.data.src) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 rounded shadow-sm border-2 border-dashed border-gray-300">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 text-center">
                    Click to add an image
                </p>
            </div>
        );
    }

    return (
        <div className="w-full h-full bg-white rounded shadow-sm overflow-hidden">
            <img
                src={element.data.src}
                alt={element.data.alt || 'Image'}
                className="w-full h-full object-cover"
                onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                }}
            />
            <div 
                className="w-full h-full hidden flex-col items-center justify-center bg-red-100 text-red-600"
            >
                <p className="text-sm">Failed to load image</p>
                <p className="text-xs text-gray-500 mt-1">Click to edit URL</p>
            </div>
        </div>
    );
}