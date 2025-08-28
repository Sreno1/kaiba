import React from "react";
import { Button } from "@/Components/ui";
import { Calendar, X } from "lucide-react";
import Schedule from "@/Components/Schedule/Schedule";

export default function ScheduleSidebar({ isOpen, onClose }) {
    return (
        <div className={`fixed top-0 left-0 h-full w-80 bg-card border-r shadow-xl transform transition-transform duration-300 ease-in-out z-30 ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
            <div className="flex flex-col h-full">
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Schedule
                    </h2>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Sidebar Content */}
                <div className="flex-1 p-4 overflow-hidden">
                    <Schedule />
                </div>
            </div>
        </div>
    );
}
