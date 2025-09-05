import React, { useState, useEffect } from 'react';
import { X, Plus, Type, Image, CheckSquare, Save } from 'lucide-react';
import { Button, Dialog, DialogContent } from '@/Components/ui';
import ScratchpadCanvas from './ScratchpadCanvas';
import axios from 'axios';

export default function ScratchpadModal({ tag, open, onClose }) {
    const [scratchpadData, setScratchpadData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveTimeout, setSaveTimeout] = useState(null);

    // Load scratchpad data when modal opens
    useEffect(() => {
        if (open && tag) {
            loadScratchpad();
        }
    }, [open, tag]);

    const loadScratchpad = async () => {
        if (!tag) return;
        
        setLoading(true);
        try {
            const response = await axios.get(`/tags/${tag.id}/scratchpad`);
            setScratchpadData(response.data.data || {
                elements: [],
                canvas: { zoom: 1.0, gridEnabled: true }
            });
        } catch (error) {
            console.error('Failed to load scratchpad:', error);
            setScratchpadData({
                elements: [],
                canvas: { zoom: 1.0, gridEnabled: true }
            });
        } finally {
            setLoading(false);
        }
    };

    const saveScratchpad = async (data) => {
        if (!tag || saving) return;
        
        setSaving(true);
        try {
            await axios.put(`/tags/${tag.id}/scratchpad`, { data });
        } catch (error) {
            console.error('Failed to save scratchpad:', error);
        } finally {
            setSaving(false);
        }
    };

    const debouncedSave = (data) => {
        if (saveTimeout) {
            clearTimeout(saveTimeout);
        }
        
        const timeout = setTimeout(() => {
            saveScratchpad(data);
        }, 2000);
        
        setSaveTimeout(timeout);
    };

    const handleDataChange = (newData) => {
        setScratchpadData(newData);
        debouncedSave(newData);
    };

    const addElement = (type) => {
        const newElement = {
            id: `element-${Date.now()}`,
            type,
            position: { x: 100, y: 100 },
            size: { width: 200, height: 100 },
            data: getDefaultElementData(type),
            styles: {}
        };

        const newData = {
            ...scratchpadData,
            elements: [...scratchpadData.elements, newElement]
        };

        handleDataChange(newData);
    };

    const getDefaultElementData = (type) => {
        switch (type) {
            case 'text':
                return { content: 'New text block', fontSize: 14, color: '#000000' };
            case 'image':
                return { src: '', alt: 'New image' };
            case 'checklist':
                return { 
                    title: 'New checklist',
                    items: [
                        { id: 1, text: 'New item', completed: false }
                    ]
                };
            default:
                return {};
        }
    };

    if (!open) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-screen-xl w-full h-[90vh] p-0">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-background">
                    <div className="flex items-center gap-3">
                        <div 
                            className="w-4 h-4 rounded-full" 
                            style={{ backgroundColor: tag?.color || '#3b82f6' }}
                        />
                        <h2 className="text-lg font-semibold">
                            {tag?.name || 'Project'} Scratchpad
                        </h2>
                        {saving && (
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Save className="w-3 h-3" />
                                Saving...
                            </span>
                        )}
                    </div>
                    
                    {/* Toolbar */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addElement('text')}
                            disabled={loading}
                        >
                            <Type className="w-4 h-4 mr-1" />
                            Text
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addElement('image')}
                            disabled={loading}
                        >
                            <Image className="w-4 h-4 mr-1" />
                            Image
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addElement('checklist')}
                            disabled={loading}
                        >
                            <CheckSquare className="w-4 h-4 mr-1" />
                            Checklist
                        </Button>
                        
                        <div className="w-px h-6 bg-border mx-2" />
                        
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Loading scratchpad...</p>
                            </div>
                        </div>
                    ) : scratchpadData ? (
                        <ScratchpadCanvas
                            data={scratchpadData}
                            onChange={handleDataChange}
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-muted-foreground">Failed to load scratchpad</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}