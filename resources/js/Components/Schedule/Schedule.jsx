import React, { useState } from 'react';
import { Button } from '@/Components/ui/button';
import ScheduleTable from './ScheduleTable';
import ScheduleHistory from './ScheduleHistory';
import { Calendar, Clock } from 'lucide-react';

export default function Schedule() {
    const [activeTab, setActiveTab] = useState('today'); // today, history

    return (
        <div className="h-full flex flex-col">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 mb-4">
                <nav className="flex space-x-1">
                    <Button
                        variant={activeTab === 'today' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('today')}
                        className="flex items-center gap-2"
                    >
                        <Clock className="w-4 h-4" />
                        Today
                    </Button>
                    <Button
                        variant={activeTab === 'history' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('history')}
                        className="flex items-center gap-2"
                    >
                        <Calendar className="w-4 h-4" />
                        History
                    </Button>
                </nav>
            </div>

            {/* Tab Content */}
            <div className="flex-1">
                {activeTab === 'today' && <ScheduleTable />}
                {activeTab === 'history' && <ScheduleHistory />}
            </div>
        </div>
    );
}
