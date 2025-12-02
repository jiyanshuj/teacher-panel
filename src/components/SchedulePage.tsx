import React, { useState } from 'react';
import { ArrowLeft, Calendar, Clock, MapPin, Users, Plus, Edit } from 'lucide-react';

interface SchedulePageProps {
  teacherId: string;
  onBack: () => void;
}

interface ClassSchedule {
  id: string;
  subject: string;
  subjectCode: string;
  section: string;
  time: string;
  duration: string;
  room: string;
  type: 'theory' | 'practical' | 'tutorial';
  students: number;
}

const SchedulePage: React.FC<SchedulePageProps> = ({ teacherId, onBack }) => {
  const [selectedDay, setSelectedDay] = useState('monday');
  
  const weekDays = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
  ];

  // Mock schedule data
  const scheduleData: Record<string, ClassSchedule[]> = {
    monday: [
      { id: '1', subject: 'Computer Science Fundamentals', subjectCode: 'CS101', section: 'A', time: '09:00', duration: '1h 30m', room: 'Room 101', type: 'theory', students: 35 },
      { id: '2', subject: 'Data Structures Lab', subjectCode: 'CS201', section: 'B', time: '14:00', duration: '2h', room: 'Lab 201', type: 'practical', students: 30 },
    ],
    tuesday: [
      { id: '3', subject: 'Database Management Systems', subjectCode: 'CS301', section: 'A', time: '10:30', duration: '1h 30m', room: 'Room 102', type: 'theory', students: 38 },
      { id: '4', subject: 'CS Fundamentals Tutorial', subjectCode: 'CS101', section: 'A', time: '15:30', duration: '1h', room: 'Room 103', type: 'tutorial', students: 18 },
    ],
    wednesday: [
      { id: '5', subject: 'Computer Science Fundamentals', subjectCode: 'CS101', section: 'A', time: '09:00', duration: '1h 30m', room: 'Room 101', type: 'theory', students: 35 },
      { id: '6', subject: 'Database Lab', subjectCode: 'CS301', section: 'A', time: '14:00', duration: '2h', room: 'Lab 301', type: 'practical', students: 38 },
    ],
    thursday: [
      { id: '7', subject: 'Data Structures and Algorithms', subjectCode: 'CS201', section: 'B', time: '11:00', duration: '1h 30m', room: 'Room 201', type: 'theory', students: 30 },
    ],
    friday: [
      { id: '8', subject: 'Database Management Systems', subjectCode: 'CS301', section: 'A', time: '10:30', duration: '1h 30m', room: 'Room 102', type: 'theory', students: 38 },
      { id: '9', subject: 'Data Structures Tutorial', subjectCode: 'CS201', section: 'B', time: '16:00', duration: '1h', room: 'Room 202', type: 'tutorial', students: 15 },
    ],
    saturday: [
      { id: '10', subject: 'Faculty Meeting', subjectCode: 'ADMIN', section: 'ALL', time: '10:00', duration: '2h', room: 'Conference Hall', type: 'theory', students: 0 },
    ],
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'theory': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'practical': return 'bg-green-100 text-green-800 border-green-200';
      case 'tutorial': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const currentSchedule = scheduleData[selectedDay] || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-amber-600" />
                  Class Schedule
                </h1>
                <p className="text-gray-600">Weekly teaching timetable and room assignments</p>
              </div>
            </div>
            <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Class
            </button>
          </div>
        </div>

        {/* Day Selection */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex flex-wrap gap-2">
            {weekDays.map((day) => (
              <button
                key={day.key}
                onClick={() => setSelectedDay(day.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedDay === day.key
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {day.label}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="space-y-4">
          {currentSchedule.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-800 mb-2">No Classes Scheduled</h3>
              <p className="text-gray-600 mb-4">No classes are scheduled for {weekDays.find(d => d.key === selectedDay)?.label}</p>
              <button className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors">
                Add Class
              </button>
            </div>
          ) : (
            currentSchedule.map((classItem) => (
              <div key={classItem.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                        {classItem.time}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{classItem.subject}</h3>
                        <p className="text-gray-600">{classItem.subjectCode} - Section {classItem.section}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTypeColor(classItem.type)}`}>
                        {classItem.type.charAt(0).toUpperCase() + classItem.type.slice(1)}
                      </span>
                      <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Duration: {classItem.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">Location: {classItem.room}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">Students: {classItem.students}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SchedulePage;