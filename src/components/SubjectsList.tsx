import React from 'react';
import { ArrowRight, RefreshCw, Users, BookOpen } from 'lucide-react';

// Updated type to match your actual database schema
interface Subject {
  subject_id: string;
  subject_code: string;
  subject_name: string;
  class_name: string;
  semester: number;
}

interface TeacherSubject {
  teacher_id: string;
  subject_id: string;
  section: string;
  semester: number;
  subjects?: Subject;
}

interface SubjectsListProps {
  subjects: TeacherSubject[];
  onNavigate: (path: string) => void;
  onRefresh: () => void;
  loading?: boolean;
}

const SubjectsList: React.FC<SubjectsListProps> = ({ subjects, onNavigate, onRefresh, loading = false }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">Teaching Subjects</h3>
          <p className="text-gray-600 text-sm">Current semester assignments and course load</p>
        </div>
        <button 
          onClick={() => onNavigate('subjects')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <span>View All</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
          <h4 className="text-lg font-medium text-gray-800 mb-2">Loading Subjects</h4>
          <p className="text-gray-600 text-sm">Fetching your teaching assignments...</p>
        </div>
      ) : subjects.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <div className="text-4xl mb-3">📚</div>
          <h4 className="text-lg font-medium text-gray-800 mb-2">No Subjects Assigned</h4>
          <p className="text-gray-600 text-sm mb-4">No teaching assignments found for this semester</p>
          <button 
            onClick={onRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {subjects.slice(0, 3).map((subject, index) => (
            <div key={subject.subject_id || `subject-${index}`} className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300 hover:border-blue-300">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-sm">{subject.subjects?.subject_code || 'N/A'}</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-base">{subject.subjects?.subject_name || 'Unknown Subject'}</h4>
                      <p className="text-gray-600 text-sm">{subject.subjects?.class_name || 'N/A'} • Section {subject.section}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-600 ml-13">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      Semester {subject.subjects?.semester || subject.semester}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-green-500" />
                      {subject.subjects?.class_name || 'N/A'}
                    </span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => onNavigate(`attendance/${subject.subject_id}`)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                      title="View Attendance"
                    >
                      Attendance
                    </button>
                    <button 
                      onClick={() => onNavigate(`grades/${subject.subject_id}`)}
                      className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-lg text-xs font-medium transition-colors"
                      title="View Grades"
                    >
                      Grades
                    </button>
                  </div>
                  <div className="text-right flex items-center gap-1">
                    <Users className="w-3 h-3 text-gray-400" />
                    <p className="text-xs text-gray-500">~35 Students</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {subjects.length > 3 && (
            <div className="text-center pt-3">
              <button 
                onClick={() => onNavigate('subjects')}
                className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center justify-center gap-2 mx-auto transition-colors"
              >
                <span>View {subjects.length - 3} more subject{subjects.length - 3 === 1 ? '' : 's'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubjectsList;