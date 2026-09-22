import { useState } from 'react';
import { Calendar, Clock, MessageSquare, MapPin } from 'lucide-react';
import { format } from 'date-fns';

const AppointmentForm = ({ teacher, selectedSlot, onSubmit, onCancel }) => {
  const [query, setQuery] = useState('');
  const [duration, setDuration] = useState(30);
  const [venue, setVenue] = useState(teacher.cabin || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) {
      alert('Please enter your query/purpose for the appointment');
      return;
    }

    onSubmit({
      query: query.trim(),
      duration,
      venue: teacher.cabin, // Default to cabin, will be updated by teacher if visiting
      timeSlot: selectedSlot.datetime.toISOString(),
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 max-w-md mx-auto">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">Book Appointment</h3>

      <div className="space-y-4 mb-6">
        <div className="flex items-center gap-3 text-gray-700">
          <Calendar size={20} className="text-primary-600" />
          <div>
            <div className="text-sm text-gray-500">Date & Time</div>
            <div className="font-medium">{format(selectedSlot.datetime, 'EEEE, MMMM d, yyyy')}</div>
            <div className="text-sm text-primary-600">{selectedSlot.time}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-gray-700">
          <Clock size={20} className="text-primary-600" />
          <div>
            <div className="text-sm text-gray-500">Duration</div>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="mt-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>60 minutes</option>
            </select>
          </div>
        </div>



        <div className="flex items-start gap-3 text-gray-700">
          <MessageSquare size={20} className="text-primary-600 mt-1" />
          <div className="flex-1">
            <label className="text-sm text-gray-500 mb-1 block">Query / Purpose *</label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe the purpose of your consultation..."
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              required
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors font-medium"
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
};

export default AppointmentForm;
