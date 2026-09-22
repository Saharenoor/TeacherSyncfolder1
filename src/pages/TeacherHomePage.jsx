import { useState, useEffect } from 'react';
import { Bell, X, Clock, AlertCircle, User } from 'lucide-react';
import { format } from 'date-fns';
import { storage } from '../utils/storage';
import { teacherSchedules } from '../data/mockData';
import { checkReminders, handleQuickCancel } from '../utils/reminders';
import { Link } from 'react-router-dom';

const TeacherHomePage = () => {
  const [notifications, setNotifications] = useState([]);
  const [teacherId, setTeacherId] = useState(1);

  useEffect(() => {
    // Check for reminders and attendance warnings
    checkReminders();
    
    // Load unread notifications for teacher
    const allNotifications = storage.getNotifications();
    const teacher = teacherSchedules.find(t => t.id === teacherId);
    
    if (!teacher) return;
    
    // Filter notifications for this teacher
    const teacherNotifications = allNotifications.filter(n => {
      if (n.read) return false;
      // Check if notification is for this teacher
      if (n.type === 'appointment-request' || n.type === 'reminder' || n.type === 'attendance-reminder' || n.type === 'cancellation') {
        if (n.appointmentId) {
          const appointments = storage.getAppointments();
          const appointment = appointments.find(apt => apt.id === n.appointmentId);
          return appointment && appointment.teacherId === teacherId;
        }
      }
      return false;
    });
    
    setNotifications(teacherNotifications);
    
    // Set up interval to check reminders every minute
    const interval = setInterval(() => {
      checkReminders();
      const updatedNotifications = storage.getNotifications();
      const teacher = teacherSchedules.find(t => t.id === teacherId);
      if (!teacher) return;
      
      const updatedTeacherNotifications = updatedNotifications.filter(n => {
        if (n.read) return false;
        if (n.type === 'appointment-request' || n.type === 'reminder' || n.type === 'attendance-reminder' || n.type === 'cancellation') {
          if (n.appointmentId) {
            const appointments = storage.getAppointments();
            const appointment = appointments.find(apt => apt.id === n.appointmentId);
            return appointment && appointment.teacherId === teacherId;
          }
        }
        return false;
      });
      setNotifications(updatedTeacherNotifications);
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, [teacherId]);

  const handleRemoveNotification = (notificationId) => {
    storage.removeNotification(notificationId);
    const allNotifications = storage.getNotifications();
    const teacher = teacherSchedules.find(t => t.id === teacherId);
    
    if (!teacher) return;
    
    const teacherNotifications = allNotifications.filter(n => {
      if (n.read) return false;
      if (n.type === 'appointment-request' || n.type === 'reminder' || n.type === 'attendance-reminder') {
        if (n.appointmentId) {
          const appointments = storage.getAppointments();
          const appointment = appointments.find(apt => apt.id === n.appointmentId);
          return appointment && appointment.teacherId === teacherId;
        }
      }
      return false;
    });
    
    setNotifications(teacherNotifications);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment-request':
        return <User className="h-5 w-5 text-blue-500" />;
      case 'reminder':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'attendance-reminder':
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
      case 'cancellation':
        return <X className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'appointment-request':
        return 'bg-blue-50 border-blue-200';
      case 'reminder':
        return 'bg-blue-50 border-blue-200';
      case 'attendance-reminder':
        return 'bg-orange-50 border-orange-200';
      case 'cancellation':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const teacher = teacherSchedules.find(t => t.id === teacherId);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Teacher Home</h1>
              <p className="text-sm text-gray-600">{teacher?.name || 'Teacher Dashboard'}</p>
            </div>
            <div className="flex items-center gap-4">
              <select
                value={teacherId}
                onChange={(e) => setTeacherId(Number(e.target.value))}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500"
              >
                {teacherSchedules.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <Link
                to="/teacher-dashboard"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No new notifications</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notifications</h2>
            {notifications.map(notification => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow border-2 p-4 ${getNotificationColor(notification.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <p className="text-gray-900 font-medium">{notification.message}</p>
                      {notification.appointmentId && (
                        <p className="text-sm text-gray-600 mt-1">
                          {(() => {
                            const appointments = storage.getAppointments();
                            const appointment = appointments.find(apt => apt.id === notification.appointmentId);
                            if (appointment) {
                              return `Appointment with ${appointment.studentName} on ${format(new Date(appointment.timeSlot), 'MMM d, yyyy h:mm a')}`;
                            }
                            return '';
                          })()}
                        </p>
                      )}
                      {notification.canCancel && notification.appointmentId && (
                        <button
                          onClick={() => {
                            handleQuickCancel(notification.appointmentId);
                            handleRemoveNotification(notification.id);
                          }}
                          className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 text-sm font-medium transition-colors"
                        >
                          Cancel Appointment
                        </button>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveNotification(notification.id)}
                    className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Remove notification"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherHomePage;
