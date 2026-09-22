// Helper functions for the backend

const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const formatTime = (date) => {
  return date.toTimeString().split(' ')[0];
};

const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const calculateDuration = (start, end) => {
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  return endMinutes - startMinutes;
};

const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

module.exports = {
  generateId,
  formatDate,
  formatTime,
  isValidEmail,
  calculateDuration,
};
