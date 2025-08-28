import React from "react";
import { Button, Textarea } from "@/Components/ui";
import { StickyNote, Edit, Eye, X } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function QuickNotesSidebar({
    isOpen,
    onClose,
    isNotesPreviewMode,
    setIsNotesPreviewMode,
    quickNotes,
    setQuickNotes
}) {
    return (
        <div className={`fixed top-0 right-0 h-full w-80 bg-card border-l shadow-xl transform transition-transform duration-300 ease-in-out z-40 ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
            <div className="flex flex-col h-full">
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <StickyNote className="w-5 h-5" />
                        Quick Notes
                    </h2>
                    <div className="flex items-center gap-2">
                        <Button
                            variant={isNotesPreviewMode ? "ghost" : "outline"}
                            size="sm"
                            onClick={() => setIsNotesPreviewMode(false)}
                            title="Edit Mode"
                        >
                            <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                            variant={isNotesPreviewMode ? "outline" : "ghost"}
                            size="sm"
                            onClick={() => {
                                // Auto-save when switching to preview mode
                                localStorage.setItem('kaiba-quick-notes', quickNotes);
                                setIsNotesPreviewMode(true);
                            }}
                            title="Preview Mode"
                        >
                            <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 p-4">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                {isNotesPreviewMode ? 'Preview' : 'Notes'}
                            </label>
                            {isNotesPreviewMode ? (
                                <div className="min-h-[300px] p-3 border rounded-md bg-muted overflow-y-auto">
                                    {quickNotes.trim() ? (
                                        <ReactMarkdown
                                            className="prose prose-sm max-w-none"
                                            components={{
                                                h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-gray-900">{children}</h1>,
                                                h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-gray-800">{children}</h2>,
                                                h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-gray-800">{children}</h3>,
                                                p: ({ children }) => <p className="mb-2 text-sm text-gray-700">{children}</p>,
                                                ul: ({ children }) => <ul className="mb-2 ml-4 list-disc text-sm text-gray-700">{children}</ul>,
                                                ol: ({ children }) => <ol className="mb-2 ml-4 list-decimal text-sm text-gray-700">{children}</ol>,
                                                li: ({ children }) => <li className="mb-1">{children}</li>,
                                                code: ({ children }) => <code className="px-1 py-0.5 bg-muted rounded text-xs">{children}</code>,
                                                pre: ({ children }) => <pre className="p-2 bg-muted rounded text-xs overflow-x-auto mb-2">{children}</pre>,
                                                blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-300 pl-3 mb-2 text-sm italic text-gray-600">{children}</blockquote>,
                                                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                                em: ({ children }) => <em className="italic">{children}</em>
                                            }}
                                        >
                                            {quickNotes}
                                        </ReactMarkdown>
                                    ) : (
                                        <p className="text-sm text-gray-500 italic">No notes to preview. Switch to edit mode to add some notes.</p>
                                    )}
                                </div>
                            ) : (
                                <Textarea
                                    value={quickNotes}
                                    onChange={(e) => setQuickNotes(e.target.value)}
                                    placeholder="Jot down quick notes, ideas, or reminders...\n\nSupports Markdown:\n# Heading\n**bold** *italic*\n- List item\n1. Numbered item\n`code`\n> Quote"
                                    className="min-h-[300px] resize-none"
                                />
                            )}
                        </div>
                        <div className="text-xs text-gray-500">
                            {isNotesPreviewMode
                                ? 'Notes are rendered with Markdown support. Click edit to modify.'
                                : 'Supports Markdown formatting. Notes auto-save every 2 seconds.'
                            }
                        </div>
                    </div>
                </div>

                {/* Sidebar Footer */}
                <div className="border-t p-4">
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setQuickNotes('');
                                localStorage.removeItem('kaiba-quick-notes');
                            }}
                            className="flex-1"
                        >
                            Clear Notes
                        </Button>
                        {!isNotesPreviewMode && (
                            <Button
                                onClick={() => {
                                    localStorage.setItem('kaiba-quick-notes', quickNotes);
                                    alert('Notes saved manually!');
                                }}
                                className="flex-1"
                                variant="outline"
                            >
                                Save Now
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
