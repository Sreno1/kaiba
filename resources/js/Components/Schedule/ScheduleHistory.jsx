import React, { useState, useEffect } from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Checkbox } from '@/Components/ui/checkbox';
import { Calendar, ChevronLeft, ChevronRight, Award, Clock, TrendingUp, BarChart3 } from 'lucide-react';

export default function ScheduleHistory() {
    const [currentView, setCurrentView] = useState('daily'); // daily, weekly, monthly
    const [currentDate, setCurrentDate] = useState(new Date());
    const [historyData, setHistoryData] = useState({});

    useEffect(() => {
        loadHistoryData();
    }, [currentView, currentDate]);

    const loadHistoryData = () => {
        const historyIndex = localStorage.getItem('schedule-history-index');
        if (!historyIndex) {
            setHistoryData({});
            return;
        }

        try {
            const dates = JSON.parse(historyIndex);
            const data = {};

            dates.forEach(dateStr => {
                const scheduleData = localStorage.getItem(`schedule-history-${dateStr}`);
                if (scheduleData) {
                    try {
                        data[dateStr] = JSON.parse(scheduleData);
                    } catch (error) {
                        console.error('Error parsing schedule data for', dateStr, error);
                    }
                }
            });

            setHistoryData(data);
        } catch (error) {
            console.error('Error loading history data:', error);
            setHistoryData({});
        }
    };

    const navigateDate = (direction) => {
        const newDate = new Date(currentDate);
        
        switch (currentView) {
            case 'daily':
                newDate.setDate(newDate.getDate() + direction);
                break;
            case 'weekly':
                newDate.setDate(newDate.getDate() + (direction * 7));
                break;
            case 'monthly':
                newDate.setMonth(newDate.getMonth() + direction);
                break;
        }
        
        setCurrentDate(newDate);
    };

    const getDateRange = () => {
        const date = new Date(currentDate);
        
        switch (currentView) {
            case 'daily':
                return {
                    start: new Date(date),
                    end: new Date(date),
                    label: date.toDateString()
                };
            case 'weekly':
                const startOfWeek = new Date(date);
                startOfWeek.setDate(date.getDate() - date.getDay());
                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                return {
                    start: startOfWeek,
                    end: endOfWeek,
                    label: `${startOfWeek.toLocaleDateString()} - ${endOfWeek.toLocaleDateString()}`
                };
            case 'monthly':
                const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
                const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
                return {
                    start: startOfMonth,
                    end: endOfMonth,
                    label: date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
                };
            default:
                return { start: date, end: date, label: date.toDateString() };
        }
    };

    const getFilteredData = () => {
        const { start, end } = getDateRange();
        const filtered = {};

        Object.keys(historyData).forEach(dateStr => {
            const date = new Date(dateStr);
            if (date >= start && date <= end) {
                filtered[dateStr] = historyData[dateStr];
            }
        });

        return filtered;
    };

    const calculateStats = (data) => {
        let totalItems = 0;
        let completedItems = 0;
        let totalPoints = 0;
        let earnedPoints = 0;
        let days = 0;

        Object.values(data).forEach(daySchedule => {
            if (Array.isArray(daySchedule) && daySchedule.length > 0) {
                days++;
                daySchedule.forEach(item => {
                    totalItems++;
                    totalPoints += item.points || 0;
                    if (item.done) {
                        completedItems++;
                        earnedPoints += item.points || 0;
                    }
                });
            }
        });

        return {
            totalItems,
            completedItems,
            totalPoints,
            earnedPoints,
            days,
            completionRate: totalItems > 0 ? (completedItems / totalItems) * 100 : 0,
            avgPointsPerDay: days > 0 ? earnedPoints / days : 0
        };
    };

    const renderDailyView = () => {
        const { label } = getDateRange();
        const data = getFilteredData();
        const dateKey = Object.keys(data)[0];
        const daySchedule = dateKey ? data[dateKey] : [];

        if (!daySchedule || daySchedule.length === 0) {
            return (
                <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No schedule data for {label}</p>
                </div>
            );
        }

        const stats = calculateStats({ [dateKey]: daySchedule });

        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{stats.completedItems}/{stats.totalItems}</div>
                        <div className="text-xs text-gray-600">Tasks Complete</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{stats.earnedPoints}</div>
                        <div className="text-xs text-gray-600">Points Earned</div>
                    </div>
                </div>

                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {daySchedule
                        .sort((a, b) => a.time.localeCompare(b.time))
                        .map((item, index) => (
                        <div key={index} className={`flex items-center gap-3 p-2 rounded border ${
                            item.done ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
                        }`}>
                            <Checkbox checked={item.done} disabled />
                            <div className="flex-1">
                                <div className={`font-medium ${item.done ? 'line-through text-gray-500' : ''}`}>
                                    {item.item}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Clock className="w-3 h-3" />
                                {item.time}
                            </div>
                            <Badge variant={item.done ? "default" : "secondary"}>
                                {item.points} pts
                            </Badge>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderWeeklyView = () => {
        const data = getFilteredData();
        const stats = calculateStats(data);

        return (
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-xl font-bold text-blue-600">{stats.completedItems}/{stats.totalItems}</div>
                        <div className="text-xs text-gray-600">Tasks Complete</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-xl font-bold text-green-600">{stats.earnedPoints}</div>
                        <div className="text-xs text-gray-600">Points Earned</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-xl font-bold text-purple-600">{stats.completionRate.toFixed(1)}%</div>
                        <div className="text-xs text-gray-600">Completion Rate</div>
                    </div>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                    {Object.keys(data).sort().map(dateStr => {
                        const daySchedule = data[dateStr];
                        const dayStats = calculateStats({ [dateStr]: daySchedule });
                        
                        return (
                            <div key={dateStr} className="p-3 border rounded-lg">
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-medium">{new Date(dateStr).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</h3>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">{dayStats.completedItems}/{dayStats.totalItems}</Badge>
                                        <Badge>{dayStats.earnedPoints} pts</Badge>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1">
                                    <div 
                                        className="bg-blue-500 h-1 rounded-full transition-all duration-300"
                                        style={{ width: `${dayStats.completionRate}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderMonthlyView = () => {
        const data = getFilteredData();
        const stats = calculateStats(data);

        return (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <TrendingUp className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                        <div className="text-2xl font-bold text-blue-600">{stats.avgPointsPerDay.toFixed(1)}</div>
                        <div className="text-xs text-gray-600">Avg Points/Day</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                        <BarChart3 className="w-6 h-6 mx-auto mb-2 text-green-600" />
                        <div className="text-2xl font-bold text-green-600">{stats.completionRate.toFixed(1)}%</div>
                        <div className="text-xs text-gray-600">Overall Rate</div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-medium mb-3">Monthly Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-600">Active Days:</span>
                            <span className="font-medium ml-2">{stats.days}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Total Tasks:</span>
                            <span className="font-medium ml-2">{stats.totalItems}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Completed:</span>
                            <span className="font-medium ml-2">{stats.completedItems}</span>
                        </div>
                        <div>
                            <span className="text-gray-600">Points Earned:</span>
                            <span className="font-medium ml-2">{stats.earnedPoints}</span>
                        </div>
                    </div>
                </div>

                {Object.keys(data).length > 0 && (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        <h3 className="font-medium">Daily Breakdown</h3>
                        {Object.keys(data).sort().reverse().map(dateStr => {
                            const daySchedule = data[dateStr];
                            const dayStats = calculateStats({ [dateStr]: daySchedule });
                            
                            return (
                                <div key={dateStr} className="flex justify-between items-center p-2 bg-white rounded border">
                                    <span className="text-sm">{new Date(dateStr).toLocaleDateString()}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-600">{dayStats.completedItems}/{dayStats.totalItems}</span>
                                        <Badge size="sm">{dayStats.earnedPoints} pts</Badge>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    const { label } = getDateRange();

    return (
        <Card className="h-full">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Schedule History
                    </CardTitle>
                </div>
                
                {/* View selector */}
                <div className="flex gap-1">
                    {['daily', 'weekly', 'monthly'].map(view => (
                        <Button
                            key={view}
                            variant={currentView === view ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setCurrentView(view)}
                            className="capitalize"
                        >
                            {view}
                        </Button>
                    ))}
                </div>

                {/* Date navigation */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" size="sm" onClick={() => navigateDate(-1)}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="text-sm font-medium">{label}</span>
                    <Button variant="ghost" size="sm" onClick={() => navigateDate(1)}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {currentView === 'daily' && renderDailyView()}
                {currentView === 'weekly' && renderWeeklyView()}
                {currentView === 'monthly' && renderMonthlyView()}
            </CardContent>
        </Card>
    );
}
