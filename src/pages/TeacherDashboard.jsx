import { useState, useEffect, useMemo } from 'react';
import { CheckCircle, XCircle, Clock, Calendar, User, MessageSquare, MapPin, Bell } from 'lucide-react';
import { format, isSameDay, addDays, startOfDay } from 'date-fns';
import { teacherSchedules } from '../data/mockData';
import { storage } from '../utils/storage';
import { getAvailableSlots } from '../utils/availability';
import { checkReminders } from '../utils/reminders';

const TeacherDashboard = () => {
  const [teacherId, setTeacherId] = useState(1); // Default to first teacher for demo
  const [teacher, setTeacher] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [rejectingAppointmentId, setRejectingAppointmentId] = useState(null);
  const [suggestedSlots, setSuggestedSlots] = useState([]);

  useEffect(() => {
    // Check for reminders
    checkReminders();

    const selectedTeacher = teacherSchedules.find(t => t.id === teacherId);
    setTeacher(selectedTeacher);

    const allAppointments = storage.getAppointments();
    const teacherAppointments = allAppointments.filter(apt => apt.teacherId === teacherId);
    setAppointments(teacherAppointments);
    setPendingRequests(teacherAppointments.filter(apt => apt.status === 'pending'));

    // Add notifications for new appointment requests
    teacherAppointments
      .filter(apt => apt.status === 'pending')
      .forEach(apt => {
        const notifications = storage.getNotifications();
        const existing = notifications.find(n =>
          n.type === 'appointment-request' && n.appointmentId === apt.id
        );
        if (!existing) {
          storage.addNotification({
            type: 'appointment-request',
            message: `New appointment request from ${apt.studentName}`,
            appointmentId: apt.id,
          });
        }
      });

    // Set up interval to check reminders every minute
    const interval = setInterval(() => {
      checkReminders();
      const updatedAppointments = storage.getAppointments();
      const updatedTeacherAppointments = updatedAppointments.filter(apt => apt.teacherId === teacherId);
      setAppointments(updatedTeacherAppointments);
      setPendingRequests(updatedTeacherAppointments.filter(apt => apt.status === 'pending'));
    }, 60000);

    return () => clearInterval(interval);
  }, [teacherId]);

  const [venueInput, setVenueInput] = useState('');
  const [acceptingAppointmentId, setAcceptingAppointmentId] = useState(null);

  const handleAcceptClick = (appointmentId) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (teacher.isVisiting && !appointment.venue) {
      setAcceptingAppointmentId(appointmentId);
      setVenueInput('');
    } else {
      handleAccept(appointmentId);
    }
  };

  const handleConfirmAccept = () => {
    if (!venueInput.trim()) {
      alert('Please enter a venue');
      return;
    }
    handleAccept(acceptingAppointmentId, venueInput);
    setAcceptingAppointmentId(null);
    setVenueInput('');
  };

  const handleCancelAccept = () => {
    setAcceptingAppointmentId(null);
    setVenueInput('');
  };

  const handleAccept = (appointmentId, venue = null) => {
    const updates = { status: 'accepted' };
    if (venue) {
      updates.venue = venue;
    }

    storage.updateAppointment(appointmentId, updates);

    // Add notification for student
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      let message = `Your appointment with ${teacher.name} has been accepted`;
      if (venue) {
        message += `. Venue: ${venue}`;
      }

      storage.addNotification({
        type: 'acceptance',
        message: message,
        appointmentId: appointmentId,
      });
    }

    const allAppointments = storage.getAppointments();
    setAppointments(allAppointments.filter(apt => apt.teacherId === teacherId));
    setPendingRequests(allAppointments.filter(apt => apt.teacherId === teacherId && apt.status === 'pending'));
  };

  const getSuggestedSlots = (appointmentId) => {
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (!appointment || !teacher) return [];

    const existingAppointments = storage.getAppointments().filter(apt =>
      apt.teacherId === teacherId && apt.status !== 'cancelled' && apt.id !== appointmentId
    );

    const slots = [];
    const today = startOfDay(new Date());

    // Check next 7 days for available slots
    for (let dayOffset = 0; dayOffset < 7 && slots.length < 3; dayOffset++) {
      const date = addDays(today, dayOffset);
      const availableSlots = getAvailableSlots(teacher, date, existingAppointments);

      for (const slot of availableSlots) {
        if (slots.length >= 3) break;
        slots.push({
          ...slot,
          date: date,
        });
      }
    }

    return slots.slice(0, 3);
  };

  const handleRejectClick = (appointmentId) => {
    const slots = getSuggestedSlots(appointmentId);
    setSuggestedSlots(slots);
    setRejectingAppointmentId(appointmentId);
  };

  const handleReject = (appointmentId) => {
    storage.updateAppointment(appointmentId, { status: 'rejected' });

    // Add notification for student with suggested slots
    const appointment = appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      const suggested = getSuggestedSlots(appointmentId);
      let message = `Your appointment with ${teacher.name} has been rejected`;
      if (suggested.length > 0) {
        message += `. Suggested alternative slots available.`;
      }

      storage.addNotification({
        type: 'rejection',
        message: message,
        appointmentId: appointmentId,
        suggestedSlots: suggested,
      });
    }

    const allAppointments = storage.getAppointments();
    setAppointments(allAppointments.filter(apt => apt.teacherId === teacherId));
    setPendingRequests(allAppointments.filter(apt => apt.teacherId === teacherId && apt.status === 'pending'));
    setRejectingAppointmentId(null);
    setSuggestedSlots([]);
  };

  const handleCancelReject = () => {
    setRejectingAppointmentId(null);
    setSuggestedSlots([]);
  };

  const scheduleItems = useMemo(() => {
    if (!teacher) return [];
    const items = [];
    const today = new Date();
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today.getDay()];
    const daySchedule = teacher.schedule[dayName] || [];

    daySchedule.forEach(classTime => {
      items.push({
        type: 'class',
        time: classTime.start,
        end: classTime.end,
        title: classTime.course,
        description: 'Class',
      });
    });

    appointments
      .filter(apt => apt.status === 'accepted' && isSameDay(new Date(apt.timeSlot), today))
      .forEach(apt => {
        items.push({
          type: 'appointment',
          time: format(new Date(apt.timeSlot), 'HH:mm'),
          end: format(new Date(new Date(apt.timeSlot).getTime() + (apt.duration || 30) * 60000), 'HH:mm'),
          title: `Consultation with ${apt.studentName}`,
          description: apt.query,
          venue: apt.venue,
        });
      });

    return items.sort((a, b) => a.time.localeCompare(b.time));
  }, [teacher, appointments]);

  if (!teacher) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
              <p className="text-sm text-gray-600">{teacher.name}</p>
            </div>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(Number(e.target.value))}
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
        {/* Pending Requests */}
        <div className="mb-8 bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            You have {pendingRequests.length} appointment request{pendingRequests.length !== 1 ? 's' : ''}
          </h2>

          {pendingRequests.length === 0 ? (
            <p className="text-gray-500">No pending requests</p>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map(request => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-5 w-5 text-gray-600" />
                        <span className="font-semibold text-gray-900">{request.studentName}</span>
                        <span className="text-sm text-gray-500">({request.studentEmail})</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(request.timeSlot), 'EEEE, MMMM d, yyyy h:mm a')}
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-700 mb-2">
                        <MessageSquare className="h-4 w-4 mt-0.5" />
                        <span>{request.query}</span>
                      </div>
                      {request.venue && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="h-4 w-4" />
                          <span>Venue: {request.venue}</span>
                        </div>
                      )}

                      {rejectingAppointmentId === request.id && suggestedSlots.length > 0 && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <p className="text-sm font-medium text-blue-900 mb-2">Suggested Alternative Slots:</p>
                          <div className="space-y-2">
                            {suggestedSlots.map((slot, idx) => (
                              <div key={idx} className="text-sm text-blue-800">
                                {format(slot.date, 'MMM d, yyyy')} at {slot.time}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      {rejectingAppointmentId === request.id ? (
                        <>
                          <button
                            onClick={handleCancelReject}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleReject(request.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                          >
                            <XCircle size={16} />
                            Confirm Reject
                          </button>
                        </>
                      ) : acceptingAppointmentId === request.id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={venueInput}
                            onChange={(e) => setVenueInput(e.target.value)}
                            placeholder="Enter venue..."
                            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
                            autoFocus
                          />
                          <button
                            onClick={handleConfirmAccept}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={handleCancelAccept}
                            className="px-2 py-2 text-gray-600 hover:text-gray-800"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => handleAcceptClick(request.id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center gap-2"
                          >
                            <CheckCircle size={16} />
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectClick(request.id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-2"
                          >
                            <XCircle size={16} />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schedule View */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary-600" />
            Today's Schedule
          </h2>

          {scheduleItems.length === 0 ? (
            <p className="text-gray-500">No scheduled items for today</p>
          ) : (
            <div className="space-y-3">
              {scheduleItems.map((item, idx) => (
                <div
                  key={idx}
                  className={`border-l-4 rounded-lg p-4 ${item.type === 'class'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-green-500 bg-green-50'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-gray-900">{item.title}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${item.type === 'class'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                          }`}>
                          {item.type === 'class' ? 'Class' : 'Appointment'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">{item.description}</div>
                      <div className="text-sm font-medium text-gray-700">
                        {item.time} - {item.end}
                      </div>
                      {item.venue && (
                        <div className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                          <MapPin size={14} />
                          {item.venue}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Appointments */}
        <div className="mt-8 bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">All Appointments</h2>

          {appointments.length === 0 ? (
            <p className="text-gray-500">No appointments</p>
          ) : (
            <div className="space-y-3">
              {appointments.map(apt => (
                <div
                  key={apt.id}
                  className={`border rounded-lg p-4 ${apt.status === 'accepted' ? 'border-green-200 bg-green-50' :
                    apt.status === 'rejected' ? 'border-red-200 bg-red-50' :
                      'border-orange-200 bg-orange-50'
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 mb-1">{apt.studentName}</div>
                      <div className="text-sm text-gray-600 mb-1">{apt.query}</div>
                      <div className="text-sm text-gray-700">
                        {format(new Date(apt.timeSlot), 'MMM d, yyyy h:mm a')}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${apt.status === 'accepted' ? 'bg-green-100 text-green-800' :
                      apt.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                      {apt.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
