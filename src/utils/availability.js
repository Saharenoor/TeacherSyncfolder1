import { format, addMinutes, isSameDay, parse, isBefore, isAfter } from 'date-fns';

// Get day name from date
export const getDayName = (date) => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
};

// Parse time string to minutes since midnight
const timeToMinutes = (timeStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

// Convert minutes to time string
const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
};

// Check if time is in class schedule
const isTimeInClass = (time, schedule, dayName) => {
  const daySchedule = schedule[dayName] || [];
  const timeMinutes = timeToMinutes(time);
  
  return daySchedule.some(classTime => {
    const startMinutes = timeToMinutes(classTime.start);
    const endMinutes = timeToMinutes(classTime.end);
    return timeMinutes >= startMinutes && timeMinutes < endMinutes;
  });
};

// Get available time slots for a teacher on a given date
export const getAvailableSlots = (teacher, date, existingAppointments = []) => {
  const dayName = getDayName(date);
  const schedule = teacher.schedule;
  const daySchedule = schedule[dayName] || [];
  
  // Check if teacher marked attendance and is present
  if (!teacher.attendance?.marked || !teacher.attendance?.present) {
    return [];
  }
  
  // Check if attendance was marked within last hour (or if it's marked as present today)
  const lastCheck = teacher.attendance?.lastCheck;
  if (lastCheck && isBefore(new Date(lastCheck), new Date(Date.now() - 3600000))) {
    // Attendance check is more than 1 hour old, consider unavailable
    if (!teacher.attendance.present) {
      return [];
    }
  }
  
  // Generate time slots (9 AM to 5 PM, 30-minute intervals)
  const slots = [];
  const startHour = 9;
  const endHour = 17;
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      
      // Check if time slot conflicts with class
      if (!isTimeInClass(timeStr, schedule, dayName)) {
        const slotDate = new Date(date);
        slotDate.setHours(hour, minute, 0, 0);
        
        // Check if slot conflicts with existing appointments
        const hasConflict = existingAppointments.some(apt => {
          if (apt.status === 'cancelled') return false;
          const aptDate = new Date(apt.timeSlot);
          const aptEnd = addMinutes(aptDate, apt.duration || 30);
          return (slotDate >= aptDate && slotDate < aptEnd) || 
                 (addMinutes(slotDate, 30) > aptDate && addMinutes(slotDate, 30) <= aptEnd);
        });
        
        if (!hasConflict && slotDate > new Date()) {
          slots.push({
            time: timeStr,
            datetime: slotDate,
            available: true,
          });
        }
      }
    }
  }
  
  return slots;
};

// Get teacher status (Available Now / In Class)
export const getTeacherStatus = (teacher) => {
  if (!teacher.attendance?.marked || !teacher.attendance?.present) {
    return { status: 'unavailable', label: 'Not Available', color: 'gray' };
  }
  
  const now = new Date();
  const dayName = getDayName(now);
  const daySchedule = teacher.schedule[dayName] || [];
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const inClass = daySchedule.some(classTime => {
    const startMinutes = timeToMinutes(classTime.start);
    const endMinutes = timeToMinutes(classTime.end);
    const currentMinutes = timeToMinutes(currentTime);
    return currentMinutes >= startMinutes && currentMinutes < endMinutes;
  });
  
  if (inClass) {
    return { status: 'in-class', label: 'In Class', color: 'orange' };
  }
  
  return { status: 'available', label: 'Available Now', color: 'green' };
};

// Get availability heatmap data for visualization
export const getAvailabilityHeatmap = (teacher, date, existingAppointments = []) => {
  const slots = getAvailableSlots(teacher, date, existingAppointments);
  const heatmap = {};
  
  slots.forEach(slot => {
    const hour = slot.datetime.getHours();
    if (!heatmap[hour]) {
      heatmap[hour] = { available: 0, total: 0 };
    }
    heatmap[hour].available++;
    heatmap[hour].total++;
  });
  
  // Fill in hours with no slots
  for (let hour = 9; hour < 17; hour++) {
    if (!heatmap[hour]) {
      heatmap[hour] = { available: 0, total: 2 }; // 2 slots per hour (30-min intervals)
    }
  }
  
  return heatmap;
};
