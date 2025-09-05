import React, { useState, useEffect } from 'react';
import { X, FileText, Hash, ChevronDown, ChevronRight } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { ScrollArea } from '@/Components/ui/scroll-area';
import { Button } from '@/Components/ui/button';

const DocsDashboard = ({ isOpen, onClose }) => {
    const [docs, setDocs] = useState([]);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedHeadings, setExpandedHeadings] = useState({});

    useEffect(() => {
        if (isOpen) {
            fetchDocs();
            // Check URL for initial doc selection
            const urlParams = new URLSearchParams(window.location.search);
            const docSlug = urlParams.get('doc');
            const anchor = urlParams.get('anchor');
            
            if (docSlug) {
                setSelectedDoc(docSlug);
                if (anchor) {
                    // Scroll to anchor after component mounts
                    setTimeout(() => scrollToAnchor(anchor), 100);
                }
            }
        }
    }, [isOpen]);

    const fetchDocs = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/docs');
            if (!response.ok) {
                throw new Error('Failed to fetch docs');
            }
            const data = await response.json();
            setDocs(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const selectDoc = (slug, anchor = null) => {
        setSelectedDoc(slug);
        
        // Update URL without page reload
        const url = new URL(window.location);
        url.searchParams.set('doc', slug);
        if (anchor) {
            url.searchParams.set('anchor', anchor);
        } else {
            url.searchParams.delete('anchor');
        }
        window.history.pushState({}, '', url);
        
        if (anchor) {
            setTimeout(() => scrollToAnchor(anchor), 100);
        }
    };

    const scrollToAnchor = (anchor) => {
        const element = document.getElementById(anchor);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const toggleHeadingExpansion = (docSlug) => {
        setExpandedHeadings(prev => ({
            ...prev,
            [docSlug]: !prev[docSlug]
        }));
    };

    const currentDoc = selectedDoc ? docs.find(doc => doc.slug === selectedDoc) : null;

    // Custom renderer for markdown to add anchor IDs
    const markdownComponents = {
        h1: ({children, ...props}) => {
            const text = children?.toString() || '';
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return <h1 id={id} className="scroll-mt-16 text-3xl font-bold mb-4 text-foreground" {...props}>{children}</h1>;
        },
        h2: ({children, ...props}) => {
            const text = children?.toString() || '';
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return <h2 id={id} className="scroll-mt-16 text-2xl font-semibold mb-3 text-foreground" {...props}>{children}</h2>;
        },
        h3: ({children, ...props}) => {
            const text = children?.toString() || '';
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return <h3 id={id} className="scroll-mt-16 text-xl font-semibold mb-2 text-foreground" {...props}>{children}</h3>;
        },
        h4: ({children, ...props}) => {
            const text = children?.toString() || '';
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return <h4 id={id} className="scroll-mt-16 text-lg font-semibold mb-2 text-foreground" {...props}>{children}</h4>;
        },
        h5: ({children, ...props}) => {
            const text = children?.toString() || '';
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return <h5 id={id} className="scroll-mt-16 text-base font-semibold mb-2 text-foreground" {...props}>{children}</h5>;
        },
        h6: ({children, ...props}) => {
            const text = children?.toString() || '';
            const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            return <h6 id={id} className="scroll-mt-16 text-sm font-semibold mb-2 text-foreground" {...props}>{children}</h6>;
        },
        p: ({children, ...props}) => <p className="mb-4 text-foreground leading-relaxed" {...props}>{children}</p>,
        ul: ({children, ...props}) => <ul className="mb-4 ml-6 list-disc text-foreground" {...props}>{children}</ul>,
        ol: ({children, ...props}) => <ol className="mb-4 ml-6 list-decimal text-foreground" {...props}>{children}</ol>,
        li: ({children, ...props}) => <li className="mb-1" {...props}>{children}</li>,
        code: ({inline, children, ...props}) => {
            if (inline) {
                return <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono text-foreground" {...props}>{children}</code>;
            }
            return <code className="block bg-muted p-4 rounded-lg text-sm font-mono text-foreground overflow-x-auto mb-4" {...props}>{children}</code>;
        },
        blockquote: ({children, ...props}) => (
            <blockquote className="border-l-4 border-primary pl-4 mb-4 text-muted-foreground italic" {...props}>
                {children}
            </blockquote>
        ),
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-background border border-border rounded-lg w-full max-w-7xl h-full max-h-[90vh] flex overflow-hidden shadow-2xl">
                {/* Sidebar */}
                <div className="w-80 border-r border-border bg-muted/20 flex flex-col">
                    <div className="p-4 border-b border-border">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Documentation
                            </h2>
                            <Button variant="ghost" size="sm" onClick={onClose}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    
                    <ScrollArea className="flex-1">
                        <div className="p-4">
                            {loading && <p className="text-muted-foreground">Loading docs...</p>}
                            {error && <p className="text-destructive">Error: {error}</p>}
                            
                            {docs.map(doc => (
                                <div key={doc.slug} className="mb-2">
                                    <div className="flex items-center">
                                        <button
                                            onClick={() => selectDoc(doc.slug)}
                                            className={`flex-1 text-left px-3 py-2 rounded-md text-sm transition-colors ${
                                                selectedDoc === doc.slug 
                                                    ? 'bg-primary text-primary-foreground' 
                                                    : 'text-foreground hover:bg-muted'
                                            }`}
                                        >
                                            {doc.title}
                                        </button>
                                        {doc.headings.length > 0 && (
                                            <button
                                                onClick={() => toggleHeadingExpansion(doc.slug)}
                                                className="p-1 ml-2 text-muted-foreground hover:text-foreground"
                                            >
                                                {expandedHeadings[doc.slug] ? 
                                                    <ChevronDown className="w-4 h-4" /> : 
                                                    <ChevronRight className="w-4 h-4" />
                                                }
                                            </button>
                                        )}
                                    </div>
                                    
                                    {expandedHeadings[doc.slug] && (
                                        <div className="ml-4 mt-1 space-y-1">
                                            {doc.headings.map(heading => (
                                                <button
                                                    key={heading.anchor}
                                                    onClick={() => selectDoc(doc.slug, heading.anchor)}
                                                    className="flex items-center text-left w-full px-2 py-1 text-xs text-muted-foreground hover:text-foreground rounded transition-colors"
                                                    style={{ paddingLeft: `${heading.level * 8 + 8}px` }}
                                                >
                                                    <Hash className="w-3 h-3 mr-1 flex-shrink-0" />
                                                    {heading.text}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Main content */}
                <div className="flex-1 flex flex-col">
                    {currentDoc ? (
                        <>
                            <div className="p-4 border-b border-border">
                                <h1 className="text-xl font-semibold text-foreground">{currentDoc.title}</h1>
                            </div>
                            <ScrollArea className="flex-1">
                                <div className="p-6 prose prose-stone dark:prose-invert max-w-none">
                                    <ReactMarkdown components={markdownComponents}>
                                        {currentDoc.content}
                                    </ReactMarkdown>
                                </div>
                            </ScrollArea>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center text-muted-foreground">
                                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                <p>Select a document to view</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DocsDashboard;