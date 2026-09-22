import { Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const OdooEntryPoint = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-8 border border-gray-200">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Calendar className="h-8 w-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Odoo Portal</h1>
          <p className="text-gray-600">University Management System</p>
        </div>

        {/* Simulated Odoo Sidebar */}
        <div className="border border-gray-300 rounded-lg p-6 bg-gray-50 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase mb-4">Modules</h2>
          <div className="space-y-2">
            <div className="p-3 bg-gray-200 rounded text-sm text-gray-600">Dashboard</div>
            <div className="p-3 bg-gray-200 rounded text-sm text-gray-600">Courses</div>
            <div className="p-3 bg-gray-200 rounded text-sm text-gray-600">Grades</div>
            <div 
              onClick={() => navigate('/teachersync')}
              className="p-3 bg-primary-600 text-white rounded cursor-pointer hover:bg-primary-700 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-2">
                <Calendar size={18} />
                <span className="font-medium">TeacherSync</span>
              </div>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="p-3 bg-gray-200 rounded text-sm text-gray-600">Library</div>
            <div className="p-3 bg-gray-200 rounded text-sm text-gray-600">Resources</div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This is a simulated Odoo portal entry point. In the actual implementation, 
            TeacherSync would appear as a module in the real Odoo sidebar. Click on "TeacherSync" above to 
            navigate to the main application.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OdooEntryPoint;
