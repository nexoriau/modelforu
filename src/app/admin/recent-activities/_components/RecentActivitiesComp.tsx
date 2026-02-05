'use client';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  SearchIcon,
  FilterIcon,
  XIcon,
  CalendarIcon,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import moment from 'moment';
import { PiMicrosoftExcelLogoFill } from 'react-icons/pi';
import { useGetActivities } from '@/hooks/use-activities';

// Activity type mapping for better display
const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  model_created: 'Model Created',
  model_added: 'Model Added to List',
  generation_photo: 'Photo Generated',
  generation_video: 'Video Generated',
  generation_audio: 'Audio Generated',
};

// Activity type colors
const ACTIVITY_TYPE_COLORS: Record<string, string> = {
  model_created: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  model_added: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  generation_photo: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  generation_video: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  generation_audio: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
};

export default function RecentActivities() {
  // Filter states
  const [userNameFilter, setUserNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Applied filters (used for API call)
  const [appliedFilters, setAppliedFilters] = useState<{
    userName?: string;
    email?: string;
    date?: string;
  }>({});

  const { data: activities, isLoading } = useGetActivities(appliedFilters);

  const applyFilters = () => {
    const filters: any = {};
    
    if (userNameFilter) filters.userName = userNameFilter;
    if (emailFilter) filters.email = emailFilter;
    if (dateFilter) filters.date = moment(dateFilter).format('YYYY-MM-DD');

    setAppliedFilters(filters);
    setPopoverOpen(false);
  };

  const clearFilters = () => {
    setUserNameFilter('');
    setEmailFilter('');
    setDateFilter(undefined);
    setAppliedFilters({});
  };

  const hasActiveFilters = Object.keys(appliedFilters).length > 0;

  const exportToCSV = () => {
    if (!activities || activities.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'User Name',
      'Email',
      'Date',
      'Activity Type',
      'Description',
      'Tokens Used',
      'Generation Time (s)',
    ];

    const rows = activities.map((activity) => [
      activity.userName,
      activity.email,
      activity.createdAt
        ? moment(activity.createdAt).format('MMM DD, YYYY HH:mm')
        : 'N/A',
      ACTIVITY_TYPE_LABELS[activity.activityType] || activity.activityType,
      activity.description,
      activity.tokensUsed,
      activity.generationTime || 'N/A',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((cell) => `"${cell}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activities-${moment().format('YYYY-MM-DD')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <Loader2 className="size-8 animate-spin mr-2" />
        <span className="text-lg">Loading recent activities...</span>
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-purple-600 to-pink-600">
            Recent User Activities 🚀
          </h1>
          <Button
            onClick={exportToCSV}
            disabled={!activities || activities.length === 0}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 border border-green-700"
          >
            <PiMicrosoftExcelLogoFill className="size-5" />
            <span className="font-semibold">Export to Excel</span>
          </Button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center">
              <FilterIcon className="mr-2 h-5 w-5" />
              Filter Activities
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Username Filter */}
            <div>
              <Label className="text-sm font-medium mb-1 block">Username</Label>
              <Input
                placeholder="Search by username..."
                value={userNameFilter}
                onChange={(e) => setUserNameFilter(e.target.value)}
              />
            </div>

            {/* Email Filter */}
            <div>
              <Label className="text-sm font-medium mb-1 block">Email</Label>
              <Input
                placeholder="Search by email..."
                value={emailFilter}
                onChange={(e) => setEmailFilter(e.target.value)}
              />
            </div>

            {/* Date Filter */}
            <div>
              <Label className="text-sm font-medium mb-1 block">
                Activity Date
              </Label>
              <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dateFilter && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFilter
                      ? moment(dateFilter).format('MMM DD, YYYY')
                      : 'Pick a date'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={dateFilter}
                    onSelect={(value) => {
                      setDateFilter(value);
                      setPopoverOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="flex justify-start gap-3 mt-4">
            <Button onClick={applyFilters}>
              <SearchIcon className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                <XIcon className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table className="w-full text-sm">
              <TableHeader className="bg-gray-100 dark:bg-gray-700 sticky top-0 z-10">
                <TableRow>
                  <TableHead className="px-3 sm:px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                    User Name
                  </TableHead>
                  <TableHead className="px-3 sm:px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                    Email
                  </TableHead>
                  <TableHead className="px-3 sm:px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                    Date & Time
                  </TableHead>
                  <TableHead className="px-3 sm:px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                    Activity Type
                  </TableHead>
                  <TableHead className="px-3 sm:px-4 py-3 font-semibold text-gray-700 dark:text-gray-200">
                    Description
                  </TableHead>
                  <TableHead className="px-3 sm:px-4 py-3 font-semibold text-gray-700 dark:text-gray-200 text-center">
                    Tokens
                  </TableHead>
                  <TableHead className="px-3 sm:px-4 py-3 font-semibold text-gray-700 dark:text-gray-200 text-center">
                    Time (s)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activities && activities.length > 0 ? (
                  activities.map((activity) => (
                    <TableRow
                      key={activity.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <TableCell className="px-3 sm:px-4 py-3 text-gray-700 dark:text-gray-300 font-medium">
                        {activity.userName}
                      </TableCell>
                      <TableCell className="px-3 sm:px-4 py-3 text-gray-600 dark:text-gray-400">
                        {activity.email}
                      </TableCell>
                      <TableCell className="px-3 sm:px-4 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                        {activity.createdAt
                          ? moment(activity.createdAt).format('MMM DD, YYYY HH:mm')
                          : 'N/A'}
                      </TableCell>
                      <TableCell className="px-3 sm:px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                            ACTIVITY_TYPE_COLORS[activity.activityType] ||
                              'bg-gray-100 text-gray-800'
                          )}
                        >
                          {ACTIVITY_TYPE_LABELS[activity.activityType] ||
                            activity.activityType}
                        </span>
                      </TableCell>
                      <TableCell className="px-3 sm:px-4 py-3 text-gray-700 dark:text-gray-300 max-w-xs truncate">
                        {activity.description}
                      </TableCell>
                      <TableCell className="px-3 sm:px-4 py-3 font-semibold text-center text-yellow-600 dark:text-yellow-400">
                        {activity.tokensUsed || '-'}
                      </TableCell>
                      <TableCell className="px-3 sm:px-4 py-3 text-center text-gray-700 dark:text-gray-300">
                        {activity.generationTime
                          ? `${activity.generationTime}s`
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-gray-500 dark:text-gray-400"
                    >
                      {hasActiveFilters
                        ? 'No activities found matching the current filters.'
                        : "No recent activities to display. They'll appear here once users start interacting with the platform."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}