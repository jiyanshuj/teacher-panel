import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Bell } from 'lucide-react';
import type { Notice } from '../types';

interface NoticesCarouselProps {
  notices: Notice[];
}

const NoticesCarousel: React.FC<NoticesCarouselProps> = ({ notices }) => {
  const [currentNoticeIndex, setCurrentNoticeIndex] = useState(0);

  // Auto-slide notices every 6 seconds
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentNoticeIndex((prevIndex) => 
        prevIndex === notices.length - 1 ? 0 : prevIndex + 1
      );
    }, 6000);

    return () => clearInterval(slideInterval);
  }, [notices.length]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getTimeDifference = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-red-100';
      case 'medium': return 'border-l-4 border-yellow-500 bg-gradient-to-r from-yellow-50 to-yellow-100';
      case 'low': return 'border-l-4 border-green-500 bg-gradient-to-r from-green-50 to-green-100';
      default: return 'border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-blue-100';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Administrative': 'bg-blue-100 text-blue-800',
      'Academic': 'bg-green-100 text-green-800',
      'Development': 'bg-purple-100 text-purple-800',
      'Student Affairs': 'bg-orange-100 text-orange-800',
      'Resources': 'bg-indigo-100 text-indigo-800',
      'Research': 'bg-pink-100 text-pink-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4">
        <div className="flex items-center justify-between text-white">
          <div>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              <h3 className="text-lg font-bold">Important Notices</h3>
            </div>
            <p className="text-indigo-200 text-sm">Stay updated with latest announcements</p>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-90">{currentNoticeIndex + 1} of {notices.length}</p>
          </div>
        </div>
      </div>

      <div className="relative h-64 overflow-hidden">
        {notices.map((notice, index) => (
          <div
            key={notice.id}
            className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
              index === currentNoticeIndex ? 'translate-x-0' : 
              index < currentNoticeIndex ? '-translate-x-full' : 'translate-x-full'
            }`}
          >
            <div className={`h-full p-5 ${getPriorityColor(notice.priority)}`}>
              <div className="flex items-start gap-3 mb-3">
                <div className="text-2xl flex-shrink-0">{notice.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(notice.category)}`}>
                      {notice.category}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      notice.priority === 'high' ? 'bg-red-100 text-red-800' :
                      notice.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {notice.priority.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2 text-lg">{notice.title}</h4>
                  <p className="text-gray-700 text-sm leading-relaxed mb-3 line-clamp-4">{notice.content}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-600 mt-auto">
                <div className="flex items-center gap-4">
                  <span>📅 {formatDate(notice.date)}</span>
                  <span>👤 {notice.author}</span>
                  <span>⏱ {notice.readTime}</span>
                </div>
                <span>{getTimeDifference(notice.date)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Notice Navigation */}
      <div className="bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex space-x-1">
            {notices.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentNoticeIndex(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentNoticeIndex ? 'bg-indigo-600 w-6' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentNoticeIndex(prev => prev === 0 ? notices.length - 1 : prev - 1)}
              className="bg-white hover:bg-gray-100 border border-gray-300 rounded-lg px-3 py-1 text-sm font-medium transition-colors flex items-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentNoticeIndex(prev => prev === notices.length - 1 ? 0 : prev + 1)}
              className="bg-white hover:bg-gray-100 border border-gray-300 rounded-lg px-3 py-1 text-sm font-medium transition-colors flex items-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticesCarousel;