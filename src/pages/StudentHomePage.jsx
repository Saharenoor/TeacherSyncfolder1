import { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { storage } from '../utils/storage';
import { checkReminders, handleQuickCancel } from '../utils/reminders';
import { Link } from 'react-router-dom';

const StudentHomePage = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Check for reminders and attendance warnings
    checkReminders();
    
    // Load unread notifications
    const allNotifications = storage.getNotifications();
    const user = storage.getCurrentUser();
    
    // Filter notifications for this student
    const studentNotifications = allNotifications.filter(n => {
      if (n.read) return false;
      // Check if notification is for this student
      if (n.type === 'acceptance' || n.type === 'rejection' || n.type === 'reminder' || n.type === 'attendance-warning' || n.type === 'cancellation') {
        // Get appointment to check student email
        if (n.appointmentId) {
          const appointments = storage.getAppointments();
          const appointment = appointments.find(apt => apt.id === n.appointmentId);
          return appointment && appointment.studentEmail === user.email;
        }
      }
      return n.type === 'booking';
    });
    
    setNotifications(studentNotifications);
    
    // Set up interval to check reminders every minute
    const interval = setInterval(() => {
      checkReminders();
      const updatedNotifications = storage.getNotifications();
      const updatedStudentNotifications = updatedNotifications.filter(n => {
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
      setNotifications(updatedStudentNotifications);
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  const handleRemoveNotification = (notificationId) => {
    storage.removeNotification(notificationId);
    const allNotifications = storage.getNotifications();
    const user = storage.getCurrentUser();
    
    const studentNotifications = allNotifications.filter(n => {
      if (n.read) return false;
      if (n.type === 'acceptance' || n.type === 'rejection' || n.type === 'reminder' || n.type === 'attendance-warning') {
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
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Student Home</h1>
              <p className="text-sm text-gray-600">Welcome to TeacherSync</p>
            </div>
            <Link
              to="/teachersync"
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              Book Appointment
            </Link>
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
                              return format(new Date(appointment.timeSlot), 'MMM d, yyyy h:mm a');
                            }
                            return '';
                          })()}
                        </p>
                      )}
                      {notification.suggestedSlots && notification.suggestedSlots.length > 0 && (
                        <div className="mt-2 text-sm text-blue-600">
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

export default StudentHomePage;
