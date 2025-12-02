import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import TeacherPanel from './components/TeacherPanel';
import PasswordResetModal from './components/PasswordResetModal';
import { teacherAuth } from './lib/supabase';

interface TeacherSession {
  teacher_id: string;
  must_reset: boolean;
  teacher: {
    teacher_id: string;
    teacher_name: string;
    email: string;
    phone_number: string;
    salary: number;
  };
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [teacherSession, setTeacherSession] = useState<TeacherSession | null>(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing session on app load
  useEffect(() => {
    const checkSession = async () => {
      console.log('Checking existing session...');
      
      if (teacherAuth.isLoggedIn()) {
        const session = teacherAuth.getCurrentTeacher();
        console.log('Found existing session:', session);
        
        if (session) {
          // Fetch full teacher data from teacher_db
          try {
            const result = await teacherAuth.getTeacherDetails(session.teacher_id);
            
            if (result.success && result.data) {
              console.log('Teacher details loaded:', result.data);
              
              setTeacherSession({
                teacher_id: session.teacher_id,
                must_reset: false,
                teacher: {
                  teacher_id: result.data.teacher_id,
                  teacher_name: result.data.teacher_name,
                  email: result.data.email,
                  phone_number: result.data.phone_number,
                  salary: result.data.salary
                }
              });
              setIsAuthenticated(true);
            } else {
              console.error('Failed to load teacher details:', result.error);
              teacherAuth.logout();
            }
          } catch (err) {
            console.error('Session validation error:', err);
            teacherAuth.logout();
          }
        }
      } else {
        console.log('No existing session found');
      }
      
      setLoading(false);
    };

    checkSession();
  }, []);

  const handleLogin = (teacherId: string, teacherData: any) => {
    console.log('Login successful, setting session:', teacherData);
    
    setTeacherSession(teacherData);
    setIsAuthenticated(true);
    
    // Check if password reset is required
    if (teacherData.must_reset) {
      console.log('Password reset required');
      setShowPasswordReset(true);
    }
  };

  const handleLogout = () => {
    console.log('Logging out...');
    teacherAuth.logout();
    setIsAuthenticated(false);
    setTeacherSession(null);
    setShowPasswordReset(false);
  };

  const handlePasswordResetSuccess = () => {
    console.log('Password reset successful');
    setShowPasswordReset(false);
    // Update session to remove must_reset flag
    if (teacherSession) {
      setTeacherSession({
        ...teacherSession,
        must_reset: false
      });
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600 font-medium">Loading Academic Portal...</p>
          <p className="text-sm text-gray-500 mt-2">Checking authentication status</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated (this will show first)
  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Show password reset modal if required
  if (showPasswordReset && teacherSession) {
    return (
      <>
        <TeacherPanel teacherId={teacherSession.teacher_id} onLogout={handleLogout} />
        <PasswordResetModal
          teacherId={teacherSession.teacher_id}
          onClose={() => setShowPasswordReset(false)}
          onSuccess={handlePasswordResetSuccess}
        />
      </>
    );
  }

  // Show main dashboard after successful authentication
  return (
    <TeacherPanel 
      teacherId={teacherSession?.teacher_id || ''} 
      onLogout={handleLogout}
    />
  );
}

export default App;