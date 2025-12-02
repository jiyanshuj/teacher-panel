import React from 'react';
import { User, Mail, Phone, GraduationCap, LogOut } from 'lucide-react';
import type { Teacher } from '../types';

interface ProfileHeaderProps {
  teacher: Teacher;
  onLogout?: () => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ teacher, onLogout }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 p-6 relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-white/5 rounded-full"></div>
        
        <div className="relative flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          
          {/* Enhanced Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(teacher.teacher_name || 'Teacher')}&background=ffffff&color=3B82F6&size=120&font-size=0.4`}
              alt="Profile"
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl border-4 border-white shadow-xl object-cover"
            />
            <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 border-4 border-white rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-sm font-bold">✓</span>
            </div>
          </div>

          {/* Enhanced Teacher Info */}
          <div className="flex-1 text-white text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">{teacher.teacher_name}</h2>
            <p className="text-blue-200 text-sm mb-4 font-medium">{teacher.department} Department</p>
            
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                <p className="text-blue-200 text-xs font-medium">Teacher ID</p>
                <p className="text-white font-bold">{teacher.teacher_id}</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-3">
                <p className="text-blue-200 text-xs font-medium">Experience</p>
                <p className="text-white font-bold">{teacher.experience_years || 'N/A'} Years</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-3 col-span-2">
                <p className="text-blue-200 text-xs font-medium">Email</p>
                <p className="text-white font-bold truncate text-sm">{teacher.email || "N/A"}</p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center sm:justify-start gap-2 items-center">
              <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-medium border border-white/30">
                {teacher.qualification || 'Faculty Member'}
              </span>
              <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-medium border border-white/30">
                Academic Year 2024-25
              </span>
              <span className="bg-green-500/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold border border-green-400">
                Active
              </span>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="bg-red-500/80 hover:bg-red-600/80 backdrop-blur px-3 py-1 rounded-full text-xs font-medium border border-red-400 transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Specialization Section */}
      {teacher.specialization && (
        <div className="p-4 bg-gray-50 border-t border-gray-100">
          <h4 className="text-sm font-bold text-gray-800 mb-2">Specialization</h4>
          <p className="text-sm text-gray-600">{teacher.specialization}</p>
        </div>
      )}
    </div>
  );
};

export default ProfileHeader;