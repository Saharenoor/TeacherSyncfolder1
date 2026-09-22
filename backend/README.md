# TeacherSync Backend

Backend API for the TeacherSync application built with Node.js, Express, and PostgreSQL.

## Features

- Teacher management with schedules and attendance
- Appointment booking and management
- Availability computation
- Notification system
- Admin dashboard for data management

## Installation

1. Install dependencies:
   ```
   npm install
   ```

2. Set up PostgreSQL database and update `.env` file with your database credentials.

3. Run database migrations:
   ```
   npm run migrate
   ```

4. Start the server:
   ```
   npm start
   ```

   For development:
   ```
   npm run dev
   ```

## API Endpoints

### Teachers
- `GET /api/teachers` - Get all teachers (with search/filter)
- `GET /api/teachers/:id` - Get teacher by ID
- `GET /api/teachers/:id/availability` - Get teacher's availability
- `PUT /api/teachers/:id/attendance` - Update teacher attendance

### Appointments
- `GET /api/appointments` - Get appointments for user
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment status
- `DELETE /api/appointments/:id` - Cancel appointment

### Admin
- `GET /api/admin/teachers` - Get all teachers
- `GET /api/admin/cabins` - Get all cabins
- `GET /api/admin/appointments` - Get all appointments
- `GET /api/admin/teachers/:id/availability` - Get availability data

## Database Schema

- **Teachers**: id, name, department, subjects, cabin, isVisiting, isSubjectTeacher, schedule, attendance
- **Cabins**: id, cabin, location, floor
- **Appointments**: id, teacherId, studentName, studentEmail, query, timeSlot, duration, status, venue, createdAt

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=teachersync
DB_USER=postgres
DB_PASSWORD=password
PORT=5000
JWT_SECRET=your_jwt_secret_here
EMAIL_HOST=smtp.outlook.com
EMAIL_PORT=587
EMAIL_USER=your_email@outlook.com
EMAIL_PASS=your_email_password
