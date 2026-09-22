import { useState, useEffect, useMemo } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, Bell, X, AlertCircle } from 'lucide-react';
import { format, startOfDay, addDays, isSameDay } from 'date-fns';
import TeacherCard from '../components/TeacherCard';
import SearchBar from '../components/SearchBar';
import AvailabilityCalendar from '../components/AvailabilityCalendar';
import AppointmentForm from '../components/AppointmentForm';
import { teacherSchedules, cabinDetails } from '../data/mockData';
import { getAvailableSlots, getTeacherStatus } from '../utils/availability';
import { storage } from '../utils/storage';
import { checkReminders, handleQuickCancel } from '../utils/reminders';

const StudentView = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [selectedDate, setSelectedDate] = useState(startOfDay(new Date()));
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [viewCounts, setViewCounts] = useState({});
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = () => {
    const user = storage.getCurrentUser();
    const allNotifications = storage.getNotifications();
    const studentNotifications = allNotifications.filter(n => {
      if (n.read) return false;
      if (n.type === 'acceptance' || n.type === 'rejection' || n.type === 'reminder' || n.type === 'attendance-warning' || n.type === 'cancellation') {
        if (n.appointmentId) {
          const appointments = storage.getAppointments();
          const appointment = appointments.find(apt => apt.id === n.appointmentId);
          return appointment && appointment.studentEmail === user.email;
        }
      }
      return n.type === 'booking';
    });
    setNotifications(studentNotifications);
  };

  useEffect(() => {
    // Check for reminders and attendance warnings
    checkReminders();

    // Initialize teachers with slots and view counts
    const initializedTeachers = teacherSchedules.map(teacher => {
      const existingAppointments = storage.getAppointments().filter(apt =>
        apt.teacherId === teacher.id && apt.status !== 'cancelled'
      );
      const slots = getAvailableSlots(teacher, selectedDate, existingAppointments);
      return { ...teacher, slots };
    });

    // Sort: subject teachers first
    const subjectTeachers = initializedTeachers.filter(t => t.isSubjectTeacher);
    const otherTeachers = initializedTeachers.filter(t => !t.isSubjectTeacher);
    setTeachers([...subjectTeachers, ...otherTeachers]);
    setFilteredTeachers([...subjectTeachers, ...otherTeachers]);

    // Load appointments
    setAppointments(storage.getAppointments());

    // Load notifications
    loadNotifications();

    // Simulate view counts for slots (for "wow" factor)
    const counts = {};
    initializedTeachers.forEach(teacher => {
      teacher.slots?.forEach(slot => {
        const key = `${teacher.id}-${slot.time}`;
        counts[key] = Math.floor(Math.random() * 5);
      });
    });
    setViewCounts(counts);
  }, [selectedDate]);

  // Refresh notifications when appointments change
  useEffect(() => {
    loadNotifications();
  }, [appointments]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      const subjectTeachers = teachers.filter(t => t.isSubjectTeacher);
      const otherTeachers = teachers.filter(t => !t.isSubjectTeacher);
      setFilteredTeachers([...subjectTeachers, ...otherTeachers]);
      return;
    }

    const termLower = term.toLowerCase();
    const filtered = teachers.filter(teacher =>
      teacher.name.toLowerCase().includes(termLower) ||
      teacher.department.toLowerCase().includes(termLower) ||
      teacher.subjects.some(subject => subject.toLowerCase().includes(termLower))
    );
    setFilteredTeachers(filtered);
  };

  const handleTeacherClick = (teacher) => {
    setSelectedTeacher(teacher);
    setSelectedSlot(null);
    setShowBookingForm(false);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setShowBookingForm(true);
  };

  const handleBookingSubmit = (bookingData) => {
    const user = storage.getCurrentUser();
    const appointment = {
      teacherId: selectedTeacher.id,
      teacherName: selectedTeacher.name,
      studentName: user.name,
      studentEmail: user.email,
      ...bookingData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    storage.addAppointment(appointment);

    // Add notification
    storage.addNotification({
      type: 'booking',
      message: `Appointment requested with ${selectedTeacher.name}`,
      appointmentId: appointment.id,
    });

    setAppointments(storage.getAppointments());
    setSelectedTeacher(null);
    setSelectedSlot(null);
    setShowBookingForm(false);

    // Show success animation
    alert('Appointment request sent! You will receive a notification when the teacher responds.');
  };

  const myAppointments = useMemo(() => {
    const user = storage.getCurrentUser();
    return appointments.filter(apt => apt.studentEmail === user.email && !apt.studentHidden);
  }, [appointments]);

  const handleHideAppointment = (appointmentId) => {
    storage.updateAppointment(appointmentId, { studentHidden: true });
    setAppointments(storage.getAppointments());
  };

  const handleRemoveNotification = (notificationId) => {
    storage.removeNotification(notificationId);
    loadNotifications();
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'acceptance':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'rejection':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'reminder':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'attendance-warning':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'cancellation':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'acceptance':
        return 'bg-green-50 border-green-200';
      case 'rejection':
        return 'bg-red-50 border-red-200';
      case 'reminder':
        return 'bg-blue-50 border-blue-200';
      case 'attendance-warning':
        return 'bg-orange-50 border-orange-200';
      case 'cancellation':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">TeacherSync</h1>
              <p className="text-sm text-gray-600">Book consultations with your teachers</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Bell className="h-6 w-6 text-gray-600 cursor-pointer hover:text-primary-600" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!selectedTeacher ? (
          <>
            {/* Search Bar */}
            <div className="mb-6">
              <SearchBar onSearch={handleSearch} />
            </div>

            {/* Notifications Section */}
            {notifications.length > 0 && (
              <div className="mb-6 bg-white rounded-lg shadow border border-gray-200 p-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary-600" />
                  Notifications
                </h2>
                <div className="space-y-3">
                  {notifications.map(notification => (
                    <div
                      key={notification.id}
                      className={`rounded-lg border-2 p-3 ${getNotificationColor(notification.type)}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          {getNotificationIcon(notification.type)}
                          <div className="flex-1">
                            <p className="text-gray-900 font-medium text-sm">{notification.message}</p>
                            {notification.appointmentId && (
                              <p className="text-xs text-gray-600 mt-1">
                                {(() => {
                                  const appointments = storage.getAppointments();
                                  const appointment = appointments.find(apt => apt.id === notification.appointmentId);
                                  if (appointment) {
                                    return format(new Date(appointment.timeSlot), 'MMM d, yyyy h:mm a');
                                  }
                                  return '';
                                })()}
                              </p>
                            )}
                            {notification.suggestedSlots && notification.suggestedSlots.length > 0 && (
                              <div className="mt-2 text-xs text-blue-600">
                                <p className="font-medium mb-1">Suggested alternative slots:</p>
                                {notification.suggestedSlots.map((slot, idx) => (
                                  <p key={idx}>• {format(slot.date, 'MMM d, yyyy')} at {slot.time}</p>
                                ))}
                              </div>
                            )}
                            {notification.canCancel && notification.appointmentId && (
                              <button
                                onClick={() => {
                                  handleQuickCancel(notification.appointmentId);
                                  handleRemoveNotification(notification.id);
                                }}
                                className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-xs font-medium transition-colors"
                              >
                                Cancel Appointment
                              </button>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveNotification(notification.id)}
                          className="ml-3 text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                          title="Dismiss notification"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* My Appointments Summary */}
            {myAppointments.length > 0 && (
              <div className="mb-6 bg-white rounded-lg shadow p-4 border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">My Appointment Requests</h2>
                <div className="space-y-2">
                  {myAppointments.slice(0, 3).map(apt => (
                    <div key={apt.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {apt.status === 'pending' && <Clock className="h-5 w-5 text-orange-500" />}
                        {apt.status === 'accepted' && <CheckCircle className="h-5 w-5 text-green-500" />}
                        {apt.status === 'rejected' && <XCircle className="h-5 w-5 text-red-500" />}
                        <div>
                          <div className="font-medium text-gray-900">{apt.teacherName}</div>
                          <div className="text-sm text-gray-600">
                            {format(new Date(apt.timeSlot), 'MMM d, h:mm a')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${apt.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                            apt.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                          }`}>
                          {apt.status}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleHideAppointment(apt.id);
                          }}
                          className="text-gray-400 hover:text-gray-600 transition-colors"
                          title="Hide this request"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Teachers Grid */}
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {filteredTeachers.filter(t => t.isSubjectTeacher).length > 0 && searchTerm === ''
                  ? 'Your Subject Teachers'
                  : 'All Teachers'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTeachers.map(teacher => {
                  const viewCount = Math.floor(Math.random() * 8);
                  return (
                    <TeacherCard
                      key={teacher.id}
                      teacher={teacher}
                      onClick={() => handleTeacherClick(teacher)}
                      viewCount={viewCount}
                    />
                  );
                })}
              </div>
              {filteredTeachers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  No teachers found matching your search
                </div>
              )}
            </div>

            {/* Show "All Teachers" section if subject teachers are shown */}
            {searchTerm === '' && filteredTeachers.filter(t => t.isSubjectTeacher).length > 0 && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">All Teachers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teachers.filter(t => !t.isSubjectTeacher).map(teacher => {
                    const viewCount = Math.floor(Math.random() * 8);
                    return (
                      <TeacherCard
                        key={teacher.id}
                        teacher={teacher}
                        onClick={() => handleTeacherClick(teacher)}
                        viewCount={viewCount}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6">
            {/* Back Button */}
            <button
              onClick={() => {
                setSelectedTeacher(null);
                setSelectedSlot(null);
                setShowBookingForm(false);
              }}
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-2"
            >
              ← Back to Teachers
            </button>

            {/* Teacher Info */}
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedTeacher.name}</h2>
              <p className="text-gray-600 mb-4">{selectedTeacher.department}</p>
              <div className="flex flex-wrap gap-2">
                {selectedTeacher.subjects.map((subject, idx) => (
                  <span key={idx} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-md text-sm">
                    {subject}
                  </span>
                ))}
              </div>
            </div>

            {/* Date Selection */}
            <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[0, 1, 2, 3, 4, 5, 6, 7].map(dayOffset => {
                  const date = addDays(startOfDay(new Date()), dayOffset);
                  const isSelected = isSameDay(date, selectedDate);
                  return (
                    <button
                      key={dayOffset}
                      onClick={() => setSelectedDate(date)}
                      className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${isSelected
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                      {format(date, 'EEE MMM d')}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Availability Calendar or Booking Form */}
            {!showBookingForm ? (
              <AvailabilityCalendar
                teacher={{
                  ...selectedTeacher,
                  slots: getAvailableSlots(
                    selectedTeacher,
                    selectedDate,
                    storage.getAppointments().filter(apt => apt.teacherId === selectedTeacher.id)
                  ),
                }}
                selectedDate={selectedDate}
                onSlotSelect={handleSlotSelect}
                existingAppointments={storage.getAppointments().filter(apt =>
                  apt.teacherId === selectedTeacher.id && apt.status !== 'cancelled'
                )}
                viewCounts={viewCounts}
              />
            ) : (
              <AppointmentForm
                teacher={selectedTeacher}
                selectedSlot={selectedSlot}
                onSubmit={handleBookingSubmit}
                onCancel={() => setShowBookingForm(false)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentView;
