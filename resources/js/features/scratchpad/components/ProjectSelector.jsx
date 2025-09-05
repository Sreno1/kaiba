import React, { useState } from 'react';
import { FolderOpen, Plus } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import ScratchpadModal from './ScratchpadModal';

export default function ProjectSelector({ tags = [] }) {
    const [selectedTag, setSelectedTag] = useState(null);
    const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);

    const handleProjectSelect = (tag) => {
        setSelectedTag(tag);
        setIsScratchpadOpen(true);
    };

    const closeScratchpad = () => {
        setIsScratchpadOpen(false);
        setSelectedTag(null);
    };

    if (!tags || tags.length === 0) {
        return null;
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground rounded-md hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                    <FolderOpen className="w-5 h-5" />
                    <span className="hidden sm:inline">Projects</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Open Project Scratchpad</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {tags.map((tag) => (
                        <DropdownMenuItem
                            key={tag.id}
                            onClick={() => handleProjectSelect(tag)}
                            className="flex items-center gap-3 cursor-pointer"
                        >
                            <div 
                                className="w-3 h-3 rounded-full flex-shrink-0" 
                                style={{ backgroundColor: tag.color || '#3b82f6' }}
                            />
                            <span className="truncate">{tag.name}</span>
                        </DropdownMenuItem>
                    ))}
                    
                    {tags.length === 0 && (
                        <DropdownMenuItem disabled className="text-muted-foreground">
                            No projects available
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <ScratchpadModal 
                tag={selectedTag}
                open={isScratchpadOpen}
                onClose={closeScratchpad}
            />
        </>
    );
}