import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Teacher authentication functions
export const teacherAuth = {
  // Login teacher
  async login(teacherId: string, password: string) {
    try {
      console.log('Attempting login for teacher:', teacherId);

      // Query teacher_auth table (consistent schema usage)
      const { data: authData, error: authError } = await supabase
        .from('teacher_auth')
        .select('*')
        .eq('teacher_id', teacherId)
        .single();

      if (authError) {
        console.error('Login query error:', authError.message);
        throw new Error('Invalid credentials');
      }

      if (!authData) {
        console.error('No teacher found with ID:', teacherId);
        throw new Error('Invalid credentials');
      }

      console.log('Auth data found for teacher:', authData.teacher_id);

      // Validate password (plain text for now)
      if (authData.password !== password) {
        console.error('Password mismatch for teacher:', teacherId);
        throw new Error('Invalid credentials');
      }

      // Get teacher details
      const { data: teacherData, error: teacherError } = await supabase
        .from('teachers')
        .select('*')
        .eq('teacher_id', teacherId)
        .single();

      if (teacherError) {
        console.error('Teacher query error:', teacherError.message);
        throw new Error('Failed to fetch teacher details');
      }

      console.log('Login successful for teacher:', teacherData.teacher_name);

      // Combine data
      const combinedData = {
        ...authData,
        ...teacherData
      };

      // Store session
      const sessionData = {
        teacher: combinedData,
        teacher_name: teacherData.teacher_name,
        logged_in_at: new Date().toISOString()
      };

      localStorage.setItem('teacher_session', JSON.stringify(sessionData));

      return {
        success: true,
        data: {
          teacher_id: authData.teacher_id,
          must_reset: authData.must_reset,
          teacher: {
            teacher_id: authData.teacher_id,
            teacher_name: teacherData.teacher_name,
            email: teacherData.email,
            phone_number: teacherData.phone_number,
            salary: teacherData.salary
          }
        }
      };
    } catch (err) {
      console.error('Login error:', err);
      return {
        success: false,
        error: (err as Error).message
      };
    }
  },

  // Check if teacher is logged in
  isLoggedIn() {
    const session = localStorage.getItem('teacher_session');
    if (!session) return false;

    try {
      const sessionData = JSON.parse(session);
      const loginTime = new Date(sessionData.logged_in_at);
      const now = new Date();
      const hoursDiff =
        (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);

      return hoursDiff < 24;
    } catch {
      return false;
    }
  },

  // Get current teacher session
  getCurrentTeacher() {
    const session = localStorage.getItem('teacher_session');
    if (!session) return null;

    try {
      return JSON.parse(session);
    } catch {
      return null;
    }
  },

  // Logout teacher
  logout() {
    localStorage.removeItem('teacher_session');
  },

  // Change password - FIXED: Use consistent schema and existing tables
  async changePassword(
    teacherId: string,
    oldPassword: string,
    newPassword: string
  ) {
    try {
      // Verify old password using the same table structure as login
      const { data: authData, error: authError } = await supabase
        .from('teacher_auth')
        .select('teacher_id, password')
        .eq('teacher_id', teacherId)
        .single();

      if (authError) {
        console.error('Auth data fetch error:', authError.message);
        throw new Error('Failed to verify current password');
      }

      if (!authData) {
        console.error('No teacher found with ID:', teacherId);
        throw new Error('Teacher not found');
      }

      // Check if old password matches
      if (authData.password !== oldPassword) {
        console.error('Old password incorrect for teacher:', teacherId);
        throw new Error('Current password is incorrect');
      }

      // Update password in teacher_auth table
      const { error: updateError } = await supabase
        .from('teacher_auth')
        .update({
          password: newPassword,
          must_reset: false,
          updated_at: new Date().toISOString()
        })
        .eq('teacher_id', teacherId);

      if (updateError) {
        console.error('Password update error:', updateError.message);
        throw new Error('Failed to update password');
      }

      console.log('Password updated successfully for teacher:', teacherId);
      return { success: true };
    } catch (err) {
      console.error('Change password error:', err);
      return {
        success: false,
        error: (err as Error).message
      };
    }
  },

  // Get teacher details - FIXED: Use consistent schema
  async getTeacherDetails(teacherId: string) {
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .eq('teacher_id', teacherId)
        .single();

      if (error) {
        console.error('Teacher details fetch error:', error.message);
        throw new Error('Failed to fetch teacher details');
      }

      return {
        success: true,
        data: data
      };
    } catch (err) {
      console.error('Get teacher details error:', err);
      return {
        success: false,
        error: (err as Error).message
      };
    }
  }
};

// ✅ FIXED: Fetch teacher subjects without "credits"
export async function fetchTeacherSubjects(teacherId: string) {
  try {
    const { data, error } = await supabase
      .from('teacher_subjects')
      .select(
        `
        *,
        subjects(subject_name, subject_code, class_name, semester)
      `
      )
      .eq('teacher_id', teacherId);

    if (error) {
      console.error('Subjects fetch error:', error);
      throw error;
    }

    return data;
  } catch (err) {
    console.error('Fetch teacher subjects error:', err);
    throw err;
  }
}