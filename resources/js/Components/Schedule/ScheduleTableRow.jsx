import React, { useRef, useState } from 'react';
import { useSwipe } from './useSwipe';
import styles from './ScheduleTableRow.module.css';
import { Checkbox } from '@/Components/ui/checkbox';
import { Input } from '@/Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';

function ScheduleTableRow({
    item,
    toggleDone,
    updateItem,
    deleteItem,
    timeOptions
}) {
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const rowRef = useRef(null);

    // Custom swipe logic to trigger animation before delete
    const swipeHandlers = useSwipe(
        () => {
            setIsDeleting(true);
            setTimeout(() => deleteItem(item.id), 300); // match CSS duration
        },
        null
    );

    // Add mouse/touch drag feedback
    const handleDragStart = () => setIsDragging(true);
    const handleDragEnd = () => setIsDragging(false);

    // Only allow drag on non-input areas
    const isInputElement = (el) => {
        return (
            el.tagName === 'INPUT' ||
            el.tagName === 'SELECT' ||
            el.tagName === 'TEXTAREA' ||
            el.closest('input') ||
            el.closest('select') ||
            el.closest('textarea')
        );
    };

    const handleMouseDown = (e) => {
        if (!isInputElement(e.target)) {
            swipeHandlers.onMouseDown(e);
            handleDragStart();
        }
    };
    const handleMouseUp = (e) => {
        if (!isInputElement(e.target)) {
            swipeHandlers.onMouseUp(e);
            handleDragEnd();
        }
    };
    const handleTouchStart = (e) => {
        if (!isInputElement(e.target)) {
            swipeHandlers.onTouchStart(e);
            handleDragStart();
        }
    };
    const handleTouchEnd = (e) => {
        if (!isInputElement(e.target)) {
            swipeHandlers.onTouchEnd(e);
            handleDragEnd();
        }
    };

    return (
        <div
            ref={rowRef}
            className={`flex items-center gap-2 rounded border ${styles.row} ${
                isDeleting ? styles.deleting : isDragging ? styles.dragging : ''
            } ${
                item.done ? 'bg-green-50 border-green-200' : 'bg-white dark:bg-gray-900 border-gray-200'
            }`}
            {...swipeHandlers}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseMove={swipeHandlers.onMouseMove}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={swipeHandlers.onTouchMove}
        >
            <Checkbox
                checked={item.done}
                onCheckedChange={() => toggleDone(item.id)}
            />
            <div className="flex-1 min-w-0">
                <Input
                    value={item.item}
                    onChange={(e) => updateItem(item.id, 'item', e.target.value)}
                    className={`text-sm h-8 w-full px-3 py-2 ${item.done ? 'line-through text-gray-500' : ''}`}
                    style={{ minWidth: '100px', width: '100%', flex: 1 }}
                />
            </div>
            <Select
                value={(item.hours || item.time || '0.25').toString()}
                onValueChange={(value) => updateItem(item.id, 'hours', parseFloat(value))}
            >
                <SelectTrigger className={`w-12 h-8 text-sm text-center ${item.done ? 'text-gray-500' : ''}`} style={{ minWidth: 36, maxWidth: 48 }}>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {timeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-center">
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select
                value={String(item.points)}
                onValueChange={v => updateItem(item.id, 'points', parseInt(v))}
            >
                <SelectTrigger className={`w-10 h-8 text-sm text-center ${item.done ? 'text-gray-500' : ''}`} style={{ minWidth: 28, maxWidth: 36 }}>
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {[0,1,2,3,4,5].map((pt) => (
                        <SelectItem key={pt} value={String(pt)} className="text-center">{pt}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {/* Swipe left to delete, no trash icon */}
        </div>
    );
}

export default ScheduleTableRow;
