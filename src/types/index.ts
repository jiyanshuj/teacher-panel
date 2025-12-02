export interface Teacher {
  teacher_id: string;
  teacher_name: string;
  email?: string;
  phone_number?: string;
  department: string;
  qualification?: string;
  experience_years?: number;
  specialization?: string;
}

export interface Subject {
  subject_name: string;
  subject_code: string;
  class_name: string;
  credits?: number;
  theory_hours?: number;
  practical_hours?: number;
}

export interface TeacherSubject {
  id: number;
  subject_id: string;
  section: string;
  semester: number;
  subjects?: Subject;
}

export interface Stats {
  totalSubjects: number;
  totalSections: number;
  totalStudents: string | number;
  activeSemesters: number;
}

export interface Notice {
  id: number;
  title: string;
  content: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  icon: string;
  author: string;
  readTime: string;
}

export interface Holiday {
  date: string;
  name: string;
  type: 'national' | 'festival' | 'weekend';
  description: string;
}

export interface Activity {
  action: string;
  time: string;
  icon: string;
  color: string;
}