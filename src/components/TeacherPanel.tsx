import React, { useState, useEffect } from 'react';
import ProfileHeader from './ProfileHeader';
import StatsGrid from './StatsGrid';
import QuickAccessPanel from './QuickAccessPanel';
import SubjectsList from './SubjectsList';
import NoticesCarousel from './NoticesCarousel';
import AcademicCalendar from './AcademicCalendar';
import RecentActivity from './RecentActivity';
import SubjectsPage from './SubjectsPage';
import AttendancePage from './AttendancePage';
import GradesPage from './GradesPage';
import SchedulePage from './SchedulePage';
import ResourcesPage from './ResourcesPage';
import ComingSoonPage from './ComingSoonPage';
import { mockSupabase, mockTestConnection } from '../utils/mockData';
import type { Teacher, TeacherSubject, Notice, Holiday, Activity, Stats } from '../types';
import { TrendingUp, FileText, Users } from 'lucide-react';

interface TeacherPanelProps {
  teacherId?: string;
  onLogout?: () => void;
}

const TeacherPanel: React.FC<TeacherPanelProps> = ({ teacherId = "T001", onLogout }) => {
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<TeacherSubject[]>([]);
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [stats, setStats] = useState<Stats>({
    totalSubjects: 0,
    totalSections: 0,
    totalStudents: "0",
    activeSemesters: 0,
  });
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed'>('checking');

  // Enhanced notices data
  const [notices] = useState<Notice[]>([
    {
      id: 1,
      title: "Faculty Development Program",
      content: "Join our upcoming faculty development program on modern teaching methodologies. Registration opens next week. This comprehensive program covers AI in education, interactive teaching methods, and student engagement strategies.",
      date: "2025-08-25",
      priority: "high",
      category: "Development",
      icon: "🎓",
      author: "Dean of Academic Affairs",
      readTime: "3 min read"
    },
    {
      id: 2,
      title: "Mid-Semester Exam Schedule",
      content: "The mid-semester examination schedule has been updated. Please check the revised timetable on the portal. All faculty members are requested to submit question papers by September 1st, 2025.",
      date: "2025-08-24",
      priority: "medium",
      category: "Academic",
      icon: "📋",
      author: "Controller of Examinations",
      readTime: "2 min read"
    },
    {
      id: 3,
      title: "Research Grant Applications",
      content: "Applications for research grants are now open. Deadline for submission is September 15th, 2025. Maximum funding available: ₹5,00,000 per project. Priority given to interdisciplinary research.",
      date: "2025-08-23",
      priority: "medium",
      category: "Research",
      icon: "💡",
      author: "Research & Development Cell",
      readTime: "4 min read"
    },
    {
      id: 4,
      title: "New Library Resources",
      content: "The library has acquired new digital resources including IEEE Xplore, ACM Digital Library, and Springer Nature journals. Access credentials will be shared via email.",
      date: "2025-08-22",
      priority: "low",
      category: "Resources",
      icon: "📚",
      author: "Chief Librarian",
      readTime: "2 min read"
    }
  ]);

  // Comprehensive holidays data for India
  const [holidays] = useState<Holiday[]>([
    // August 2025
    { date: "2025-08-15", name: "Independence Day", type: "national", description: "National Holiday" },
    { date: "2025-08-16", name: "Krishna Janmashtami", type: "festival", description: "Hindu Festival" },
    { date: "2025-08-27", name: "Ganesh Chaturthi", type: "festival", description: "Hindu Festival" },

    // September 2025
    { date: "2025-09-05", name: "Milad un-Nabi", type: "festival", description: "Islamic Festival" },
    { date: "2025-09-17", name: "Vishwakarma Puja", type: "festival", description: "Hindu Festival" },

    // October 2025
    { date: "2025-10-02", name: "Gandhi Jayanti", type: "national", description: "National Holiday" },
    { date: "2025-10-12", name: "Dussehra", type: "festival", description: "Hindu Festival" },
    { date: "2025-10-20", name: "Karva Chauth", type: "festival", description: "Hindu Festival" },
    { date: "2025-10-21", name: "Diwali", type: "festival", description: "Festival of Lights" },

    // November 2025
    { date: "2025-11-15", name: "Guru Nanak Jayanti", type: "festival", description: "Sikh Festival" },
    { date: "2025-11-24", name: "Guru Tegh Bahadur Martyrdom", type: "festival", description: "Sikh Festival" },

    // December 2025
    { date: "2025-12-25", name: "Christmas", type: "festival", description: "Christian Festival" },
  ]);

  const [activities] = useState<Activity[]>([
    {
      action: "Marked attendance for CS101 Section A",
      time: "2 hours ago",
      icon: "📋",
      color: "text-green-600 bg-green-50"
    },
    {
      action: "Updated grades for Database Systems",
      time: "5 hours ago", 
      icon: "📊",
      color: "text-blue-600 bg-blue-50"
    },
    {
      action: "Created assignment for Data Structures",
      time: "1 day ago",
      icon: "📝",
      color: "text-purple-600 bg-purple-50"
    },
    {
      action: "Uploaded lecture notes",
      time: "2 days ago",
      icon: "📚",
      color: "text-orange-600 bg-orange-50"
    }
  ]);

  // Test database connection on component mount
  useEffect(() => {
    const checkConnection = async () => {
      setConnectionStatus('checking');
      const isConnected = await mockTestConnection();
      setConnectionStatus(isConnected ? 'connected' : 'failed');
      if (!isConnected) {
        setError("Failed to connect to database. Please check your configuration.");
      }
    };
    checkConnection();
  }, []);

  // Fetch teacher details and related data
  const fetchTeacher = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('Fetching teacher with ID:', teacherId);
      
      // Import real Supabase client
      const { supabase } = await import('../lib/supabase');
      
      // Fetch teacher basic info from teacher_db schema
      const { data: teacherData, error: teacherError } = await supabase
        .schema('teacher_db')
        .from("teachers")
        .select("*")
        .eq("teacher_id", teacherId)
        .single();

      if (teacherError) {
        console.error("Teacher fetch error:", teacherError);
        throw new Error(`Failed to fetch teacher: ${teacherError.message}`);
      }
      
      console.log('Teacher data fetched:', teacherData);
      setTeacher(teacherData);

      // Fetch teacher subjects from teacher_db schema
      const { data: teacherSubjectsData, error: tsError } = await supabase
        .schema('teacher_db')
        .from("teacher_subjects")
        .select("*")
        .eq("teacher_id", teacherId);

      if (tsError) {
        console.error("Teacher subjects fetch error:", tsError);
        console.warn("Could not fetch teacher subjects, using empty array");
        setSubjects([]);
      } else if (teacherSubjectsData && teacherSubjectsData.length > 0) {
        // Fetch corresponding subject details for each teacher subject
        const subjectIds = teacherSubjectsData.map(ts => ts.subject_id);
        
        const { data: subjectsDetailsData, error: subjectsError } = await supabase
          .schema('teacher_db')
          .from("subjects")
          .select("*")
          .in("subject_id", subjectIds);

        if (subjectsError) {
          console.error("Subjects details fetch error:", subjectsError);
          setSubjects(teacherSubjectsData);
        } else {
          // Merge teacher subjects with subject details
          const mergedData = teacherSubjectsData.map(ts => ({
            ...ts,
            subjects: subjectsDetailsData?.find(s => s.subject_id === ts.subject_id)
          }));
          console.log('Merged subjects data:', mergedData);
          setSubjects(mergedData);
        }
      } else {
        console.log('No teacher subjects found');
        setSubjects([]);
      }

      // Calculate stats using the fetched data
      const uniqueSubjects = new Set(teacherSubjectsData?.map(ts => ts.subject_id) || []);
      const uniqueSections = new Set(teacherSubjectsData?.map(ts => ts.section) || []);
      const uniqueSemesters = new Set(teacherSubjectsData?.map(ts => ts.semester) || []);

      // Simulate student count (in real implementation, you'd query the students table)
      const estimatedStudents = uniqueSections.size * 35; // Assuming ~35 students per section

      setStats({
        totalSubjects: uniqueSubjects.size,
        totalSections: uniqueSections.size,
        totalStudents: estimatedStudents > 0 ? `${estimatedStudents}+` : "0",
        activeSemesters: uniqueSemesters.size,
      });

    } catch (error) {
      console.error("Error loading teacher profile:", error);
      setError((error as Error).message);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (teacherId && connectionStatus === 'connected') {
      fetchTeacher();
    } else if (!teacherId) {
      setError("No teacher ID provided");
      setLoading(false);
    }
  }, [teacherId, connectionStatus]);

  // Mock navigation function (replace with actual router navigation)
  const handleNavigation = (path: string) => {
    setCurrentPage(path);
  };

  const handleBackToDashboard = () => {
    setCurrentPage('dashboard');
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return '✅ Connected';
      case 'failed': return '❌ Connection Failed';
      default: return '⏳ Connecting...';
    }
  };

  // Loading state
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
        <p className="text-xl text-gray-600 font-medium">Loading Teacher Profile...</p>
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getConnectionStatusColor()}`}>
          {getConnectionStatusText()}
        </div>
      </div>
    </div>
  );
  
  // Error state
  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Connection Error</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <div className={`px-3 py-1 rounded-full text-sm font-medium border mb-4 ${getConnectionStatusColor()}`}>
          {getConnectionStatusText()}
        </div>
        <div className="flex gap-3 justify-center">
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reload Page
          </button>
          <button 
            onClick={fetchTeacher} 
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
  
  // No teacher found
  if (!teacher) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center bg-white rounded-2xl shadow-lg p-8 max-w-md">
        <div className="text-6xl mb-4">👤</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Teacher Not Found</h2>
        <p className="text-gray-600 mb-2">No profile found for Teacher ID:</p>
        <p className="text-lg font-mono bg-gray-100 px-3 py-1 rounded text-blue-600 mb-4">{teacherId}</p>
        <button 
          onClick={fetchTeacher} 
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  // Render different pages based on current route
  if (currentPage === 'subjects') {
    return <SubjectsPage teacherId={teacherId} onBack={handleBackToDashboard} />;
  }
  
  if (currentPage === 'attendance') {
    return <AttendancePage teacherId={teacherId} onBack={handleBackToDashboard} />;
  }
  
  if (currentPage === 'grades') {
    return <GradesPage teacherId={teacherId} onBack={handleBackToDashboard} />;
  }
  
  if (currentPage === 'schedule') {
    return <SchedulePage teacherId={teacherId} onBack={handleBackToDashboard} />;
  }
  
  if (currentPage === 'resources') {
    return <ResourcesPage teacherId={teacherId} onBack={handleBackToDashboard} />;
  }

  if (currentPage === 'reports') {
    return (
      <ComingSoonPage
        title="Reports & Analytics"
        description="Comprehensive reporting and analytics dashboard"
        onBack={handleBackToDashboard}
        icon={<TrendingUp className="w-6 h-6" />}
        features={[
          "Student Performance Analytics",
          "Attendance Reports & Trends",
          "Grade Distribution Charts",
          "Class Progress Tracking",
          "Export Reports (PDF/Excel)",
          "Custom Report Builder",
          "Comparative Analysis Tools",
          "Real-time Dashboard Widgets"
        ]}
      />
    );
  }

  if (currentPage === 'assignments') {
    return (
      <ComingSoonPage
        title="Assignment Management"
        description="Create, distribute, and manage student assignments"
        onBack={handleBackToDashboard}
        icon={<FileText className="w-6 h-6" />}
        features={[
          "Assignment Creation & Templates",
          "Online Assignment Distribution",
          "Submission Tracking & Management",
          "Auto-grading for MCQ/Fill-in-blanks",
          "Plagiarism Detection Integration",
          "Deadline Management & Reminders",
          "Feedback & Comments System",
          "Grade Integration with Gradebook"
        ]}
      />
    );
  }

  if (currentPage === 'students') {
    return (
      <ComingSoonPage
        title="Student Management"
        description="Comprehensive student profiles and management system"
        onBack={handleBackToDashboard}
        icon={<Users className="w-6 h-6" />}
        features={[
          "Complete Student Profiles & Information",
          "Academic Performance Tracking",
          "Attendance History & Analytics",
          "Grade Records & Transcripts",
          "Parent/Guardian Contact Details",
          "Student Communication Portal",
          "Disciplinary Records Management",
          "Fee Payment Status & History",
          "Course Enrollment Management",
          "Student Photo Gallery & ID Cards",
          "Scholarship & Awards Tracking",
          "Placement & Career Guidance Records"
        ]}
      />
    );
  }
  // Default dashboard view
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Connection Status Bar */}
      <div className={`w-full py-2 px-4 text-center text-sm font-medium ${getConnectionStatusColor()}`}>
        {getConnectionStatusText()} • Last updated: {new Date().toLocaleTimeString()}
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          
          {/* Left Side - Profile & Dashboard */}
          <div className="xl:col-span-7 flex flex-col space-y-6 h-full">
            <ProfileHeader teacher={teacher} onLogout={onLogout} />
            <StatsGrid stats={stats} />
            <QuickAccessPanel stats={stats} onNavigate={handleNavigation} />
            <SubjectsList subjects={subjects} onNavigate={handleNavigation} onRefresh={fetchTeacher} />
          </div>

          {/* Right Side - Notices & Calendar */}
          <div className="xl:col-span-5 flex flex-col space-y-6">
            <NoticesCarousel notices={notices} />
            <AcademicCalendar holidays={holidays} />
            <RecentActivity activities={activities} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherPanel;