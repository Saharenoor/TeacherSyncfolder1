# TeacherSync - Teacher-Student Consultation Scheduler

A modern web application for scheduling consultations between students and teachers, built with React and Vite.

## Features

### Student View
- View all teachers with live availability status (Available Now / In Class)
- Search teachers by name, department, or subject
- Subject teachers shown at the top
- Calendly-like calendar interface with availability heatmap
- Book appointments with query/purpose field
- Duration selection (15, 30, 45, 60 minutes)
- Venue input for visiting lecturers
- Real-time status updates ("X viewing", "Slot filling fast")
- View appointment request status

### Teacher Dashboard
- View pending appointment requests
- Accept/Reject consultation requests
- See today's schedule (classes + appointments)
- View all appointments with status

### Admin View
- Compare raw timetable data vs. calculated availability
- See how schedule converts to free slots
- View attendance status
- Understand availability calculation logic

### Visual "Wow" Elements
- Live availability heatmap (color-coded busy/free times)
- Animated confirmation flow
- Real-time status updates ("3 others viewing this slot")
- Smooth transitions and hover effects

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **date-fns** - Date utilities
- **lucide-react** - Icons
- **localStorage** - Data persistence (for demo)

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd "FRONT END"
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # Reusable components
│   ├── TeacherCard.jsx
│   ├── SearchBar.jsx
│   ├── AvailabilityCalendar.jsx
│   ├── AppointmentForm.jsx
│   └── OdooEntryPoint.jsx
├── pages/              # Main pages
│   ├── StudentView.jsx
│   ├── TeacherDashboard.jsx
│   └── AdminView.jsx
├── data/               # Mock data
│   └── mockData.js
├── utils/              # Utility functions
│   ├── availability.js
│   └── storage.js
├── App.jsx             # Main app component with routing
└── main.jsx            # Entry point
```

## Usage

### Navigation

1. **Home/Odoo Entry Point** (`/` or `/odoo`)
   - Simulated Odoo portal sidebar
   - Click "TeacherSync" to enter the app

2. **Student View** (`/teachersync`)
   - Browse and search for teachers
   - Click on a teacher to view availability
   - Select a time slot and book an appointment

3. **Teacher Dashboard** (`/teacher-dashboard`)
   - Select a teacher from the dropdown
   - View and respond to appointment requests
   - See today's schedule

4. **Admin View** (`/admin`)
   - Select a teacher to analyze
   - Compare raw schedule data with calculated availability
   - Understand the availability algorithm

## Key Features Explained

### Availability Calculation

The system calculates available time slots based on:
- Teacher's class schedule (busy periods)
- Teacher's attendance status (must be marked present)
- Existing appointments
- Current time (past slots filtered out)

### Mock Data

The application uses mock data stored in `src/data/mockData.js`:
- 10 teachers with schedules
- Cabin details
- Sample appointments

All data persists in localStorage for the demo.

### Notifications

Notifications are simulated using localStorage. In a real implementation, these would integrate with:
- Outlook email notifications
- Odoo portal notifications
- Real-time push notifications

## Future Enhancements

- Integration with real Odoo API
- Outlook calendar integration
- Email notifications
- Real-time updates via WebSocket
- Student confirmation system (1-hour before)
- Auto-cancellation for no-shows
- One-click rescheduling with suggested slots
- Morning reminders

## License

This project is created for hackathon purposes.
