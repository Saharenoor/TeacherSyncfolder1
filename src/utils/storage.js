// Simple localStorage-based state management for the demo

export const storage = {
  getAppointments: () => {
    const stored = localStorage.getItem('appointments');
    return stored ? JSON.parse(stored) : [];
  },
  
  saveAppointments: (appointments) => {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  },
  
  addAppointment: (appointment) => {
    const appointments = storage.getAppointments();
    const newAppointment = {
      ...appointment,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    };
    appointments.push(newAppointment);
    storage.saveAppointments(appointments);
    return newAppointment;
  },
  
  updateAppointment: (id, updates) => {
    const appointments = storage.getAppointments();
    const index = appointments.findIndex(apt => apt.id === id);
    if (index !== -1) {
      appointments[index] = { ...appointments[index], ...updates };
      storage.saveAppointments(appointments);
      return appointments[index];
    }
    return null;
  },
  
  getNotifications: () => {
    const stored = localStorage.getItem('notifications');
    return stored ? JSON.parse(stored) : [];
  },
  
  addNotification: (notification) => {
    const notifications = storage.getNotifications();
    notifications.push({
      ...notification,
      id: Date.now(),
      read: false,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('notifications', JSON.stringify(notifications));
  },
  
  markNotificationRead: (id) => {
    const notifications = storage.getNotifications();
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications[index].read = true;
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  },
  
  removeNotification: (id) => {
    const notifications = storage.getNotifications();
    const filtered = notifications.filter(n => n.id !== id);
    localStorage.setItem('notifications', JSON.stringify(filtered));
  },
  
  getCurrentUser: () => {
    const stored = localStorage.getItem('currentUser');
    return stored ? JSON.parse(stored) : { role: 'student', name: 'Student User', email: 'student@university.edu' };
  },
  
  setCurrentUser: (user) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
  },
};
