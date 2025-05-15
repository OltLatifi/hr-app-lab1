import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, dateFnsLocalizer, Event, View, ToolbarProps } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { getleaves } from '@/services/leaverequestService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

interface LeaveRequestResponse {
    id: number;
    employee: {
        id: number;
        firstName: string;
        lastName: string;
    };
    leaveType: {
        id: number;
        typeName: string;
    };
    startDate: string;
    endDate: string;
    status: string;
}

interface CalendarEvent extends Event {
    id: number;
    status: string;
}

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const getEventStyle = (status: string) => {
    const baseStyle = {
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        padding: '2px 4px',
        fontSize: '0.875rem',
        fontWeight: 500,
    };

    switch (status.toLowerCase()) {
        case 'approved':
            return { ...baseStyle, backgroundColor: '#22c55e' };
        case 'rejected':
            return { ...baseStyle, backgroundColor: '#ef4444' };
        case 'pending':
            return { ...baseStyle, backgroundColor: '#eab308' };
        default:
            return { ...baseStyle, backgroundColor: '#6b7280' };
    }
};

const CustomToolbar: React.FC<ToolbarProps<CalendarEvent>> = ({ date, onNavigate, onView, view }) => {
    const goToToday = () => {
        onNavigate('TODAY');
    };

    const goToPrevious = () => {
        onNavigate('PREV');
    };

    const goToNext = () => {
        onNavigate('NEXT');
    };

    const changeView = (newView: View) => {
        onView(newView);
    };

    return (
        <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={goToToday}
                    className="flex items-center gap-1"
                >
                    <CalendarIcon className="h-4 w-4" />
                    Today
                </Button>
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={goToPrevious}
                        className="h-8 w-8"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={goToNext}
                        className="h-8 w-8"
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <span className="ml-2 text-lg font-semibold">
                    {format(date, 'MMMM yyyy')}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant={view === 'month' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => changeView('month')}
                >
                    Month
                </Button>
                <Button
                    variant={view === 'week' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => changeView('week')}
                >
                    Week
                </Button>
                <Button
                    variant={view === 'day' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => changeView('day')}
                >
                    Day
                </Button>
            </div>
        </div>
    );
};

const LeaveCalendarPage: React.FC = () => {
    const [date, setDate] = useState<Date>(new Date());
    const [view, setView] = useState<View>('month');

    const {
        data: leaves = [],
        isLoading,
        isError,
        error
    } = useQuery<LeaveRequestResponse[], Error>({
        queryKey: ['leaves'],
        queryFn: getleaves,
    });

    const transformLeavesToEvents = (leaves: LeaveRequestResponse[]): CalendarEvent[] => {
        return leaves.map(leave => ({
            id: leave.id,
            title: `${leave.employee.firstName} ${leave.employee.lastName} - ${leave.leaveType.typeName}`,
            start: new Date(leave.startDate),
            end: new Date(leave.endDate),
            status: leave.status,
        }));
    };

    const handleNavigate = (newDate: Date) => {
        setDate(newDate);
    };

    const handleViewChange = (newView: View) => {
        setView(newView);
    };

    const renderCalendar = () => {
        if (isLoading) {
            return <div className="h-[600px] flex items-center justify-center">Loading calendar...</div>;
        }

        if (isError) {
            return <div className="h-[600px] flex items-center justify-center text-destructive">Error loading calendar: {error?.message}</div>;
        }

        const events = transformLeavesToEvents(leaves);

        return (
            <div className="h-[600px] w-full">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    eventPropGetter={(event: CalendarEvent) => ({
                        style: getEventStyle(event.status)
                    })}
                    views={['month', 'week', 'day']}
                    view={view}
                    onView={handleViewChange}
                    date={date}
                    onNavigate={handleNavigate}
                    className="h-full"
                    components={{
                        toolbar: CustomToolbar
                    }}
                    popup
                    selectable
                    step={60}
                    timeslots={1}
                />
            </div>
        );
    };

    return (
        <div className="container mx-auto py-10">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Leave Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                    {renderCalendar()}
                </CardContent>
            </Card>
        </div>
    );
};

export default LeaveCalendarPage; 