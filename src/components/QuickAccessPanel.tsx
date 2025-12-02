import React from 'react';
import { 
  BookOpen, 
  ClipboardCheck, 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  FileText, 
  Users, 
  FolderOpen 
} from 'lucide-react';
import type { Stats } from '../types';

interface QuickAccessPanelProps {
  stats: Stats;
  onNavigate: (path: string) => void;
}

const QuickAccessPanel: React.FC<QuickAccessPanelProps> = ({ stats, onNavigate }) => {
  const features = [
    { to: "subjects", bg: "blue", icon: BookOpen, title: "My Subjects", desc: "Manage course content", count: stats.totalSubjects },
    { to: "attendance", bg: "green", icon: ClipboardCheck, title: "Attendance", desc: "Mark & track attendance", count: "Today" },
    { to: "grades", bg: "purple", icon: BarChart3, title: "Grades", desc: "Student evaluation", count: "New" },
    { to: "schedule", bg: "amber", icon: Calendar, title: "Schedule", desc: "Class timetable", count: "Week" },
    { to: "reports", bg: "indigo", icon: TrendingUp, title: "Reports", desc: "Analytics & insights", count: "Generate" },
    { to: "assignments", bg: "red", icon: FileText, title: "Assignments", desc: "Create & manage", count: "5 Due" },
    { to: "students", bg: "teal", icon: Users, title: "Students", desc: "Student profiles", count: stats.totalStudents },
    { to: "resources", bg: "pink", icon: FolderOpen, title: "Resources", desc: "Teaching materials", count: "Library" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
      <div className="mb-5">
        <h3 className="text-xl font-bold text-gray-800 mb-1">Quick Access Panel</h3>
        <p className="text-gray-600 text-sm">Essential teaching tools and management features</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {features.map((feature, index) => (
          <button
            key={index}
            onClick={() => onNavigate(feature.to)}
            className="group bg-gray-50 hover:bg-white rounded-xl p-4 text-center transition-all duration-300 hover:shadow-lg border border-gray-100 hover:border-gray-200 hover:-translate-y-1 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-200 to-transparent group-hover:via-blue-400 transition-all duration-300"></div>
            <div className={`w-12 h-12 bg-${feature.bg}-100 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300 relative`}>
              <feature.icon className={`w-6 h-6 text-${feature.bg}-600`} />
              {feature.count && (
                <div className={`absolute -top-1 -right-1 bg-${feature.bg}-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center`}>
                  {typeof feature.count === 'number' && feature.count > 99 ? '99+' : feature.count}
                </div>
              )}
            </div>
            <h4 className="font-bold text-gray-800 mb-1 text-sm">{feature.title}</h4>
            <p className="text-xs text-gray-600">{feature.desc}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickAccessPanel;