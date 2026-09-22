import { useState, useEffect } from 'react';
import { Database, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { teacherSchedules } from '../data/mockData';
import { getAvailableSlots, getTeacherStatus } from '../utils/availability';
import { storage } from '../utils/storage';

const AdminView = () => {
  const [selectedTeacher, setSelectedTeacher] = useState(teacherSchedules[0]);
  const [rawSchedule, setRawSchedule] = useState(null);
  const [calculatedAvailability, setCalculatedAvailability] = useState([]);

  useEffect(() => {
    if (selectedTeacher) {
      setRawSchedule(selectedTeacher.schedule);
      const appointments = storage.getAppointments().filter(apt => 
        apt.teacherId === selectedTeacher.id && apt.status !== 'cancelled'
      );
      const slots = getAvailableSlots(selectedTeacher, new Date(), appointments);
      setCalculatedAvailability(slots);
    }
  }, [selectedTeacher]);

  const getDaySchedule = (dayName) => {
    return rawSchedule?.[dayName] || [];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin View</h1>
              <p className="text-sm text-gray-600">Raw timetable data vs. calculated availability</p>
            </div>
            <select
              value={selectedTeacher.id}
              onChange={(e) => setSelectedTeacher(teacherSchedules.find(t => t.id === Number(e.target.value)))}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
            >
              {teacherSchedules.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Teacher Info */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{selectedTeacher.name}</h2>
          <p className="text-gray-600 mb-4">{selectedTeacher.department}</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {selectedTeacher.attendance?.marked && selectedTeacher.attendance?.present ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-green-700 font-medium">Present (Attendance Marked)</span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-700 font-medium">
                    {!selectedTeacher.attendance?.marked ? 'Attendance Not Marked' : 'Not Present'}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Raw Timetable Data */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Database className="h-5 w-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Raw Timetable Data</h2>
            </div>
            
            <div className="space-y-4">
              {['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].map(day => {
                const daySchedule = getDaySchedule(day);
                return (
                  <div key={day} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 capitalize">{day}</h3>
                    {daySchedule.length === 0 ? (
                      <p className="text-gray-500 text-sm">No classes scheduled</p>
                    ) : (
                      <div className="space-y-2">
                        {daySchedule.map((classTime, idx) => (
                          <div key={idx} className="bg-blue-50 border border-blue-200 rounded p-2">
                            <div className="font-medium text-blue-900">{classTime.course}</div>
                            <div className="text-sm text-blue-700">{classTime.start} - {classTime.end}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calculated Availability */}
          <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Calculated Availability</h2>
            </div>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Today's Available Slots</h3>
              {calculatedAvailability.length === 0 ? (
                <p className="text-gray-500 text-sm">
                  {!selectedTeacher.attendance?.marked || !selectedTeacher.attendance?.present
                    ? 'No availability - Teacher not present or attendance not marked'
                    : 'No available slots (all times are booked or in class)'}
                </p>
              ) : (
                <div className="text-sm text-gray-700">
                  <p className="mb-2">Found {calculatedAvailability.length} available slot(s)</p>
                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {calculatedAvailability.map((slot, idx) => (
                      <div
                        key={idx}
                        className="bg-green-100 border border-green-300 rounded p-2 text-center text-sm font-medium text-green-800"
                      >
                        {slot.time}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900">Calculation Logic</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Class hours are marked as <strong>Busy</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Non-class hours are marked as <strong>Available</strong></span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Only shows slots if teacher marked attendance and is present</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Existing appointments block time slots</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />
                  <span>Past time slots are automatically filtered out</span>
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Availability Status</h4>
              <div className="text-sm text-blue-800">
                <p>Current Status: <strong>{getTeacherStatus(selectedTeacher).label}</strong></p>
                <p className="mt-1">
                  Attendance: {selectedTeacher.attendance?.marked ? 'Marked' : 'Not Marked'} 
                  {selectedTeacher.attendance?.marked && ` (${selectedTeacher.attendance.present ? 'Present' : 'Absent'})`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminView;
