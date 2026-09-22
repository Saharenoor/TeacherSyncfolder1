import { Clock, MapPin, BookOpen, Building2 } from 'lucide-react';
import { getTeacherStatus } from '../utils/availability';

const TeacherCard = ({ teacher, onClick, viewCount = 0 }) => {
  const status = getTeacherStatus(teacher);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 p-5 hover:border-primary-500 hover:scale-[1.02]"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{teacher.name}</h3>
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <Building2 size={14} />
            {teacher.department}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${status.color === 'green'
                ? 'bg-green-100 text-green-800'
                : status.color === 'orange'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
          >
            {status.label}
          </span>

        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {teacher.subjects.slice(0, 2).map((subject, idx) => (
          <span
            key={idx}
            className="px-2 py-1 bg-primary-50 text-primary-700 text-xs rounded-md flex items-center gap-1"
          >
            <BookOpen size={12} />
            {subject}
          </span>
        ))}
        {teacher.subjects.length > 2 && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
            +{teacher.subjects.length - 2} more
          </span>
        )}
      </div>

      {teacher.cabin && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin size={16} />
          <span>Cabin: {teacher.cabin}</span>
        </div>
      )}
      {teacher.isVisiting && (
        <div className="flex items-center gap-2 text-sm text-amber-600">
          <MapPin size={16} />
          <span>Visiting Lecturer</span>
        </div>
      )}


    </div>
  );
};

export default TeacherCard;
