import { format, isSameDay, differenceInHours, startOfDay, isBefore, isAfter } from 'date-fns';
import { storage } from './storage';
import { teacherSchedules } from '../data/mockData';

// Check for appointments that need reminders
export const checkReminders = () => {
  const appointments = storage.getAppointments();
  const notifications = storage.getNotifications();
  const now = new Date();
  const todayStart = startOfDay(now);
  
  appointments.forEach(appointment => {
    if (appointment.status !== 'accepted') return;
    
    const appointmentDate = new Date(appointment.timeSlot);
    const appointmentDay = startOfDay(appointmentDate);
    const hoursUntilAppointment = differenceInHours(appointmentDate, now);
    
    // Check if appointment was booked in advance (created more than 1 day before appointment date)
    const appointmentCreated = appointment.createdAt ? new Date(appointment.createdAt) : now;
    const daysInAdvance = Math.floor((appointmentDate.getTime() - appointmentCreated.getTime()) / (1000 * 60 * 60 * 24));
    const isAdvanceBooking = daysInAdvance >= 1;
    
    // Morning-of reminder: send reminder if appointment is today and it's morning (before 10 AM)
    const isToday = isSameDay(appointmentDate, now);
    const isMorning = now.getHours() < 10;
    
    if (isAdvanceBooking && isToday && isMorning) {
      // Check if reminder already sent
      const reminderSent = notifications.some(n => 
        n.type === 'reminder' && 
        n.appointmentId === appointment.id &&
        isSameDay(new Date(n.timestamp), todayStart)
      );
      
      if (!reminderSent) {
        // Send reminder to student
        storage.addNotification({
          type: 'reminder',
          message: `Reminder: You have an appointment with ${appointment.teacherName} today at ${format(appointmentDate, 'h:mm a')}`,
          appointmentId: appointment.id,
          canCancel: true,
        });
        
        // Send reminder to teacher
        const teacher = teacherSchedules.find(t => t.id === appointment.teacherId);
        if (teacher) {
          storage.addNotification({
            type: 'reminder',
            message: `Reminder: You have an appointment with ${appointment.studentName} today at ${format(appointmentDate, 'h:mm a')}`,
            appointmentId: appointment.id,
            canCancel: true,
          });
        }
      }
    }
    
    // Attendance check: if appointment is within 1 hour and teacher hasn't marked attendance
    if (hoursUntilAppointment > 0 && hoursUntilAppointment <= 1 && isToday) {
      const teacher = teacherSchedules.find(t => t.id === appointment.teacherId);
      if (teacher) {
        const attendanceMarked = teacher.attendance?.marked;
        const attendancePresent = teacher.attendance?.present;
        const lastCheck = teacher.attendance?.lastCheck ? new Date(teacher.attendance.lastCheck) : null;
        
        // Check if attendance was marked within last hour
        const attendanceRecent = lastCheck && differenceInHours(now, lastCheck) < 1;
        
        if (!attendanceMarked || !attendancePresent || !attendanceRecent) {
          // Check if warning already sent
          const warningSent = notifications.some(n => 
            n.type === 'attendance-warning' && 
            n.appointmentId === appointment.id &&
            isSameDay(new Date(n.timestamp), todayStart)
          );
          
          if (!warningSent) {
            storage.addNotification({
              type: 'attendance-warning',
              message: `Warning: ${teacher.name} hasn't marked attendance as present. The appointment may be cancelled.`,
              appointmentId: appointment.id,
            });
          }
        }
      }
    }
  });
};

// Quick cancellation handler
export const handleQuickCancel = (appointmentId) => {
  storage.updateAppointment(appointmentId, { status: 'cancelled' });
  
  const appointment = storage.getAppointments().find(apt => apt.id === appointmentId);
  if (appointment) {
    // Notify the other party
    const user = storage.getCurrentUser();
    if (user.role === 'student') {
      // Notify teacher
      storage.addNotification({
        type: 'cancellation',
        message: `${appointment.studentName} cancelled the appointment scheduled for ${format(new Date(appointment.timeSlot), 'MMM d, h:mm a')}`,
        appointmentId: appointmentId,
      });
    } else {
      // Notify student
      storage.addNotification({
        type: 'cancellation',
        message: `${appointment.teacherName} cancelled the appointment scheduled for ${format(new Date(appointment.timeSlot), 'MMM d, h:mm a')}`,
        appointmentId: appointmentId,
      });
    }
  }
};
