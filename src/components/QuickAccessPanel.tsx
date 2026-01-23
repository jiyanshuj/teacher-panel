import React from 'react';
import { 
  BookOpen, 
  ClipboardCheck, 
  BookMarked,
  FileText,
  Monitor
} from 'lucide-react';
import type { Stats } from '../types';

interface QuickAccessPanelProps {
  stats: Stats;
  onNavigate: (path: string) => void;
}

const QuickAccessPanel: React.FC<QuickAccessPanelProps> = ({ stats, onNavigate }) => {
  const features = [
    { 
      to: "subjects", 
      bg: "blue", 
      icon: BookOpen, 
      title: "My Subjects", 
      desc: "Manage course content", 
      count: stats.totalSubjects,
      isExternal: false
    },
    { 
      to: "attendance", 
      bg: "green", 
      icon: ClipboardCheck, 
      title: "Attendance", 
      desc: "Mark & track attendance", 
      count: "Today",
      isExternal: false
    },
    { 
      to: "https://project-alpha-roan.vercel.app/", 
      bg: "orange", 
      icon: BookMarked, 
      title: "eCanteen", 
      desc: "Canteen services", 
      count: "Order",
      isExternal: true
    },
    { 
      to: "https://eliberary.vercel.app/", 
      bg: "purple", 
      icon: BookOpen, 
      title: "eLibrary", 
      desc: "Digital library access", 
      count: "Browse",
      isExternal: true
    },
    { 
      to: "https://paper-vista-five.vercel.app/", 
      bg: "indigo", 
      icon: FileText, 
      title: "PaperVista", 
      desc: "Past papers & resources", 
      count: "View",
      isExternal: true
    },
    { 
      to: "https://auto-slide-x.vercel.app/", 
      bg: "red", 
      icon: Monitor, 
      title: "AutoSlideX", 
      desc: "Presentation maker", 
      count: "Create",
      isExternal: true
    },
  ];

  const handleClick = (feature: typeof features[0]) => {
    if (feature.isExternal) {
      window.open(feature.to, '_blank', 'noopener,noreferrer');
    } else {
      onNavigate(feature.to);
    }
  };

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
            onClick={() => handleClick(feature)}
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