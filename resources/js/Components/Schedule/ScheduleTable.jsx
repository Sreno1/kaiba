import React, { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Checkbox } from '@/Components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/select';
import { Plus, Trash2, Clock, Award, CalendarDays } from 'lucide-react';

export default function ScheduleTable() {
    const [scheduleItems, setScheduleItems] = useState([]);
    const [newItem, setNewItem] = useState({ item: '', hours: '0.25', points: 0 });

    // Generate time options in 15-minute increments
    const generateTimeOptions = () => {
        const options = [];
        for (let hours = 0; hours <= 12; hours++) {
            for (let minutes = 0; minutes < 60; minutes += 15) {
                const decimal = hours + minutes / 60;
                const label = decimal === 0.25 ? '15 min' : 
                             decimal < 1 ? `${minutes} min` : 
                             decimal === 1 ? '1 hour' : 
                             decimal % 1 === 0 ? `${decimal} hours` : 
                             `${Math.floor(decimal)} hr ${minutes} min`;
                options.push({ value: decimal.toString(), label });
            }
        }
        return options;
    };

    const timeOptions = generateTimeOptions();

    useEffect(() => {
        loadTodaySchedule();
        setupMidnightReset();
    }, []);

    // Auto-save schedule items whenever they change
    useEffect(() => {
        if (scheduleItems.length > 0) {
            saveSchedule();
        }
    }, [scheduleItems]);

    const loadTodaySchedule = () => {
        const today = new Date().toDateString();
        const savedSchedule = localStorage.getItem(`schedule-${today}`);
        
        if (savedSchedule) {
            try {
                setScheduleItems(JSON.parse(savedSchedule));
            } catch (error) {
                console.error('Error loading schedule:', error);
                setScheduleItems([]);
            }
        } else {
            // Load from template if exists
            const template = localStorage.getItem('schedule-template');
            if (template) {
                try {
                    const templateItems = JSON.parse(template);
                    // Reset all done statuses for new day
                    const newDayItems = templateItems.map(item => ({
                        ...item,
                        done: false
                    }));
                    setScheduleItems(newDayItems);
                } catch (error) {
                    console.error('Error loading template:', error);
                    setScheduleItems([]);
                }
            }
        }
    };

    const saveSchedule = () => {
        const today = new Date().toDateString();
        localStorage.setItem(`schedule-${today}`, JSON.stringify(scheduleItems));
    };

    const setupMidnightReset = () => {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0); // Set to midnight
        
        const msUntilMidnight = tomorrow.getTime() - now.getTime();
        
        setTimeout(() => {
            // Save current schedule to history before reset
            archiveCurrentSchedule();
            // Reset for new day
            loadTodaySchedule();
            // Setup next midnight reset
            setupMidnightReset();
        }, msUntilMidnight);
    };

    const archiveCurrentSchedule = () => {
        const today = new Date().toDateString();
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        // Save current items to history
        const historyKey = `schedule-history-${yesterdayStr}`;
        localStorage.setItem(historyKey, JSON.stringify(scheduleItems));
        
        // Update history index
        const historyIndex = localStorage.getItem('schedule-history-index');
        let history = historyIndex ? JSON.parse(historyIndex) : [];
        
        if (!history.includes(yesterdayStr)) {
            history.push(yesterdayStr);
            // Keep only last 90 days
            if (history.length > 90) {
                const oldDate = history.shift();
                localStorage.removeItem(`schedule-history-${oldDate}`);
            }
            localStorage.setItem('schedule-history-index', JSON.stringify(history));
        }
    };

    const addItem = () => {
        if (!newItem.item.trim() || !newItem.hours) return;
        
        const item = {
            id: Date.now(),
            item: newItem.item.trim(),
            hours: parseFloat(newItem.hours),
            points: parseInt(newItem.points) || 0,
            done: false
        };
        
        setScheduleItems(prev => [...prev, item]);
        setNewItem({ item: '', hours: '0.25', points: 0 });
    };

    // Helper function to format hours for display
    const formatHours = (hours) => {
        if (hours === 0.25) return '15 min';
        if (hours < 1) return `${hours * 60} min`;
        if (hours === 1) return '1 hour';
        if (hours % 1 === 0) return `${hours} hours`;
        const wholeHours = Math.floor(hours);
        const minutes = Math.round((hours % 1) * 60);
        return `${wholeHours} hr ${minutes} min`;
    };

    const toggleDone = (id) => {
        setScheduleItems(prev => prev.map(item => 
            item.id === id ? { ...item, done: !item.done } : item
        ));
    };

    const deleteItem = (id) => {
        setScheduleItems(prev => prev.filter(item => item.id !== id));
    };

    const updateItem = (id, field, value) => {
        setScheduleItems(prev => prev.map(item => 
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const saveAsTemplate = () => {
        // Save current items (without done status) as template
        const template = scheduleItems.map(item => ({
            ...item,
            done: false
        }));
        localStorage.setItem('schedule-template', JSON.stringify(template));
        alert('Schedule saved as template for future days!');
    };

    const getTotalPoints = () => {
        return scheduleItems.reduce((total, item) => total + (item.done ? item.points : 0), 0);
    };

    const getMaxPoints = () => {
        return scheduleItems.reduce((total, item) => total + item.points, 0);
    };

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <CalendarDays className="w-5 h-5" />
                        Today's Schedule
                    </CardTitle>
                    <div className="flex items-center gap-2">
                        <div className="text-sm text-gray-600 flex items-center gap-1">
                            <Award className="w-4 h-4" />
                            {getTotalPoints()}/{getMaxPoints()}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={saveAsTemplate}
                            disabled={scheduleItems.length === 0}
                        >
                            Save Template
                        </Button>
                    </div>
                </div>
                <div className="text-xs text-gray-500">
                    Resets automatically at midnight
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Add new item form */}
                <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                    <div className="grid grid-cols-1 gap-2">
                        <Input
                            placeholder="Schedule item..."
                            value={newItem.item}
                            onChange={(e) => setNewItem(prev => ({ ...prev, item: e.target.value }))}
                            onKeyPress={(e) => e.key === 'Enter' && addItem()}
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <Select value={newItem.hours} onValueChange={(value) => setNewItem(prev => ({ ...prev, hours: value }))}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Duration" />
                                </SelectTrigger>
                                <SelectContent>
                                    {timeOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Input
                                type="number"
                                placeholder="Points"
                                min="0"
                                value={newItem.points || ''}
                                onChange={(e) => setNewItem(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                            />
                        </div>
                    </div>
                    <Button onClick={addItem} size="sm" className="w-full">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Item
                    </Button>
                </div>

                {/* Schedule items table */}
                <div className="space-y-2">
                    {scheduleItems.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No scheduled items for today</p>
                            <p className="text-xs">Add your first item above</p>
                        </div>
                    ) : (
                        <div className="space-y-1 max-h-96 overflow-y-auto">
                            {scheduleItems
                                .sort((a, b) => (a.hours || 0) - (b.hours || 0))
                                .map((item) => (
                                <div key={item.id} className={`flex items-center gap-2 p-2 rounded border ${
                                    item.done ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                                }`}>
                                    <Checkbox
                                        checked={item.done}
                                        onCheckedChange={() => toggleDone(item.id)}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <Input
                                            value={item.item}
                                            onChange={(e) => updateItem(item.id, 'item', e.target.value)}
                                            className={`text-sm h-8 ${item.done ? 'line-through text-gray-500' : ''}`}
                                        />
                                    </div>
                                    <Select 
                                        value={(item.hours || item.time || '0.25').toString()} 
                                        onValueChange={(value) => updateItem(item.id, 'hours', parseFloat(value))}
                                    >
                                        <SelectTrigger className={`w-24 h-8 text-sm ${item.done ? 'text-gray-500' : ''}`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {timeOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={item.points}
                                        onChange={(e) => updateItem(item.id, 'points', parseInt(e.target.value) || 0)}
                                        className={`w-16 text-sm h-8 ${item.done ? 'text-gray-500' : ''}`}
                                    />
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => deleteItem(item.id)}
                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Progress summary */}
                {scheduleItems.length > 0 && (
                    <div className="pt-2 border-t">
                        <div className="flex justify-between text-sm">
                            <span>Completed: {scheduleItems.filter(item => item.done).length}/{scheduleItems.length}</span>
                            <span className="font-medium">Points: {getTotalPoints()}/{getMaxPoints()}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${(getTotalPoints() / Math.max(getMaxPoints(), 1)) * 100}%` }}
                            />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
