import { format } from 'date-fns';
import { Clock, AlertCircle } from 'lucide-react';
import { getAvailabilityHeatmap, getAvailableSlots } from '../utils/availability';

const AvailabilityCalendar = ({ teacher, selectedDate, onSlotSelect, existingAppointments = [], viewCounts = {} }) => {
  const slots = teacher.slots || getAvailableSlots(teacher, selectedDate, existingAppointments);
  const heatmap = getAvailabilityHeatmap(teacher, selectedDate, existingAppointments);

  // Get heatmap color intensity
  const getHeatmapColor = (hour) => {
    const data = heatmap[hour];
    if (!data || data.available === 0) return 'bg-red-100 border-red-300';
    const ratio = data.available / data.total;
    if (ratio >= 0.8) return 'bg-green-100 border-green-300';
    if (ratio >= 0.5) return 'bg-yellow-100 border-yellow-300';
    return 'bg-orange-100 border-orange-300';
  };

  if (!teacher.attendance?.marked || !teacher.attendance?.present) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <p className="text-red-700 font-medium">Teacher is not available</p>
        <p className="text-red-600 text-sm mt-1">
          {!teacher.attendance?.marked 
            ? "Attendance not marked" 
            : "Not present on campus"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Availability Heatmap */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Availability Heatmap</h4>
        <div className="flex gap-2">
          {Array.from({ length: 8 }, (_, i) => {
            const hour = i + 9;
            const colorClass = getHeatmapColor(hour);
            return (
              <div key={hour} className="flex-1">
                <div className={`${colorClass} border-2 rounded p-2 text-center transition-all hover:scale-105`}>
                  <div className="text-xs font-medium text-gray-700">{hour}:00</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {heatmap[hour]?.available || 0}/2
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-4 mt-3 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span>High Availability</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
            <span>Moderate</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
            <span>Low/Busy</span>
          </div>
        </div>
      </div>

      {/* Time Slots Grid */}
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">
          Available Time Slots - {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </h4>
        {slots.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No available slots for this date</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {slots.map((slot, idx) => {
              const viewCount = viewCounts[slot.time] || 0;
              const isPopular = viewCount > 2;
              return (
                <button
                  key={idx}
                  onClick={() => onSlotSelect(slot)}
                  className={`relative p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                    isPopular
                      ? 'border-primary-500 bg-primary-50 hover:bg-primary-100'
                      : 'border-gray-200 bg-gray-50 hover:border-primary-300 hover:bg-primary-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-primary-600" />
                    <span className="font-medium text-gray-900">{slot.time}</span>
                  </div>
                  {isPopular && (
                    <div className="mt-2">
                      <span className="text-xs text-primary-600 font-medium">
                        {viewCount} viewing
                      </span>
                      {viewCount > 5 && (
                        <span className="ml-2 text-xs text-orange-600 font-medium">Filling fast!</span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailabilityCalendar;
