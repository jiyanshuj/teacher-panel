import React from 'react';
import { Activity as ActivityIcon } from 'lucide-react';
import type { Activity } from '../types';

interface RecentActivityProps {
  activities: Activity[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-5 border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <ActivityIcon className="w-5 h-5 text-gray-700" />
            <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
          </div>
          <p className="text-gray-600 text-sm">Your latest teaching activities</p>
        </div>
      </div>
      
      <div className="space-y-3">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activity.color}`}>
              <span className="text-lg">{activity.icon}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-800">{activity.action}</p>
              <p className="text-xs text-gray-500">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="w-full text-center text-blue-600 hover:text-blue-700 font-medium text-sm">
          View All Activity →
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;