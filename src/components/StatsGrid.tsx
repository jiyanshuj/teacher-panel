import React from 'react';
import { BookOpen, Users, Calendar, Award } from 'lucide-react';
import type { Stats } from '../types';

interface StatsGridProps {
  stats: Stats;
}

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  const statsData = [
    { 
      title: "Subjects", 
      value: stats.totalSubjects, 
      icon: "📚", 
      bgGradient: "from-blue-500 to-blue-600", 
      trend: `${stats.totalSubjects} Active`,
      change: "+2 this semester",
      changeType: "positive" as const
    },
    { 
      title: "Sections", 
      value: stats.totalSections, 
      icon: "👥", 
      bgGradient: "from-green-500 to-green-600", 
      trend: `${stats.totalSections} Classes`,
      change: "Same as last sem",
      changeType: "neutral" as const
    },
    { 
      title: "Students", 
      value: stats.totalStudents, 
      icon: "🎓", 
      bgGradient: "from-purple-500 to-purple-600", 
      trend: "Approx",
      change: "+15 new students",
      changeType: "positive" as const
    },
    { 
      title: "Semesters", 
      value: stats.activeSemesters, 
      icon: "📅", 
      bgGradient: "from-orange-500 to-orange-600", 
      trend: `${stats.activeSemesters} Active`,
      change: "Across all years",
      changeType: "neutral" as const
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statsData.map((stat, index) => (
        <div key={index} className="bg-white rounded-xl shadow-md hover:shadow-xl overflow-hidden border border-gray-100 transition-all duration-300 hover:-translate-y-1">
          <div className={`bg-gradient-to-r ${stat.bgGradient} p-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{stat.icon}</span>
              <div className="text-white text-right">
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs opacity-90">{stat.trend}</p>
              </div>
            </div>
          </div>
          <div className="p-3">
            <h3 className="text-sm font-bold text-gray-800 mb-1">{stat.title}</h3>
            <p className={`text-xs font-medium ${
              stat.changeType === 'positive' ? 'text-green-600' : 
              stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
            }`}>
              {stat.change}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;