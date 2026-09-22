const { Teacher } = require('../models');

// Compute availability for a teacher
const computeAvailability = (teacher) => {
  const today = new Date();
  const dayOfWeek = today.toLocaleLowerCase().slice(0, 3); // 'mon', 'tue', etc.

  const schedule = teacher.schedule[dayOfWeek] || [];
  const busySlots = schedule.map(slot => ({
    start: slot.start,
    end: slot.end,
  }));

  // Check if teacher is present
  const isPresent = teacher.attendance.present && teacher.attendance.marked;

  // Generate free slots (assuming 9 AM to 5 PM working hours)
  const workingHours = { start: '09:00', end: '17:00' };
  const freeSlots = generateFreeSlots(workingHours, busySlots);

  return {
    isPresent,
    busySlots,
    freeSlots,
  };
};

// Generate free time slots
const generateFreeSlots = (workingHours, busySlots) => {
  const slots = [];
  const startMinutes = timeToMinutes(workingHours.start);
  const endMinutes = timeToMinutes(workingHours.end);

  let currentMinutes = startMinutes;

  while (currentMinutes < endMinutes) {
    const slotStart = minutesToTime(currentMinutes);
    const slotEnd = minutesToTime(currentMinutes + 30); // 30-minute slots

    const isBusy = busySlots.some(busy => {
      const busyStart = timeToMinutes(busy.start);
      const busyEnd = timeToMinutes(busy.end);
      return currentMinutes >= busyStart && currentMinutes < busyEnd;
    });

    if (!isBusy) {
      slots.push({ start: slotStart, end: slotEnd });
    }

    currentMinutes += 30;
  }

  return slots;
};

// Helper functions
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

module.exports = {
  computeAvailability,
};
