import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Users, Calendar, Settings, Home } from 'lucide-react';
import StudentView from './pages/StudentView';
import StudentHomePage from './pages/StudentHomePage';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherHomePage from './pages/TeacherHomePage';
import AdminView from './pages/AdminView';
import OdooEntryPoint from './components/OdooEntryPoint';

const Navigation = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/student-home', label: 'Student Home', icon: Home },
    { path: '/teacher-home', label: 'Teacher Home', icon: Home },
    { path: '/teachersync', label: 'Student View', icon: Users },
    { path: '/teacher-dashboard', label: 'Teacher Dashboard', icon: Calendar },
    { path: '/admin', label: 'Admin View', icon: Settings },
  ];

  if (location.pathname === '/' || location.pathname === '/odoo') {
    return null;
  }

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary-600" />
            <Link to="/teachersync" className="text-xl font-bold text-gray-900">
              TeacherSync
            </Link>
          </div>
          <div className="flex gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <Routes>
          <Route path="/" element={<OdooEntryPoint />} />
          <Route path="/odoo" element={<OdooEntryPoint />} />
          <Route path="/student-home" element={<StudentHomePage />} />
          <Route path="/teacher-home" element={<TeacherHomePage />} />
          <Route path="/teachersync" element={<StudentView />} />
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/admin" element={<AdminView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
