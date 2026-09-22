const nodemailer = require('nodemailer');
require('dotenv').config();

// Create transporter for Outlook
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp-mail.outlook.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Send notification email
const sendNotification = async (to, subject, text, html) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: error.message };
  }
};

// Send appointment confirmation
const sendAppointmentConfirmation = async (appointment, teacher) => {
  const subject = 'Appointment Confirmed - TeacherSync';
  const text = `Your appointment with ${teacher.name} on ${appointment.timeSlot} has been confirmed. Venue: ${appointment.venue}`;
  const html = `<p>Your appointment with <strong>${teacher.name}</strong> on <strong>${appointment.timeSlot}</strong> has been confirmed.</p><p>Venue: ${appointment.venue}</p>`;

  return await sendNotification(appointment.studentEmail, subject, text, html);
};

// Send appointment rejection
const sendAppointmentRejection = async (appointment, teacher, suggestedSlots) => {
  const subject = 'Appointment Request Rejected - TeacherSync';
  const text = `Your appointment request with ${teacher.name} has been rejected. Suggested alternative slots: ${suggestedSlots.join(', ')}`;
  const html = `<p>Your appointment request with <strong>${teacher.name}</strong> has been rejected.</p><p>Suggested alternative slots: ${suggestedSlots.join(', ')}</p>`;

  return await sendNotification(appointment.studentEmail, subject, text, html);
};

// Send reminder
const sendReminder = async (appointment, teacher) => {
  const subject = 'Appointment Reminder - TeacherSync';
  const text = `Reminder: You have an appointment with ${teacher.name} in 1 hour at ${appointment.venue}`;
  const html = `<p>Reminder: You have an appointment with <strong>${teacher.name}</strong> in 1 hour at <strong>${appointment.venue}</strong></p>`;

  return await sendNotification(appointment.studentEmail, subject, text, html);
};

module.exports = {
  sendNotification,
  sendAppointmentConfirmation,
  sendAppointmentRejection,
  sendReminder,
};
