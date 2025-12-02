import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { fetchTeacherSubjects } from '../lib/supabase'; // Import your real supabase function

interface Subject {
  subject_id: string;
  subject_code: string;
  subject_name: string;
  class_name: string;
  semester: number;
}

interface TeacherSubject {
  teacher_id: string;
  subject_id: string;
  section: string;
  semester: number;
  subjects?: Subject;
}

interface SubjectsPageProps {
  teacherId?: string;
  onBack: () => void;
  onNavigate?: (path: string, payload?: any) => void;
}

export default function SubjectsPage({ teacherId = 'T001', onBack, onNavigate = () => {} }: SubjectsPageProps) {
  const [subjects, setSubjects] = useState<TeacherSubject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [semesterFilter, setSemesterFilter] = useState<string>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        // Use the real fetchTeacherSubjects function
        const data = await fetchTeacherSubjects(teacherId);
        setSubjects(data || []);
      } catch (e) {
        setError((e as Error).message || 'Failed to load subjects');
        console.error('Error loading subjects:', e);
      }
      setLoading(false);
    };
    load();
  }, [teacherId]);

  const semesters = useMemo(() => {
    const s = new Set<string>();
    subjects.forEach((x) => { 
      if (x.semester) s.add(String(x.semester)); 
      if (x.subjects?.semester) s.add(String(x.subjects.semester));
    });
    return Array.from(s).sort();
  }, [subjects]);

  const sections = useMemo(() => {
    const s = new Set<string>();
    subjects.forEach((x) => { if (x.section) s.add(String(x.section)); });
    return Array.from(s).sort();
  }, [subjects]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return subjects.filter((s) => {
      const meta = s.subjects || {};
      const name = String(meta.subject_name || '').toLowerCase();
      const code = String(meta.subject_code || '').toLowerCase();
      const sem = String(s.semester || '').toLowerCase();
      const sec = String(s.section || '').toLowerCase();
      
      if (semesterFilter !== 'all' && sem !== semesterFilter) return false;
      if (sectionFilter !== 'all' && sec !== sectionFilter) return false;
      if (!q) return true;
      return name.includes(q) || code.includes(q) || sec.includes(q) || sem.includes(q);
    });
  }, [subjects, search, semesterFilter, sectionFilter]);

  const exportCSV = () => {
    // Updated CSV export to only include existing fields
    const headers = ['Subject Code', 'Subject Name', 'Class', 'Section', 'Semester'];
    const rows = filtered.map((s) => {
      const meta = s.subjects || {};
      return [
        meta.subject_code || '', 
        meta.subject_name || '', 
        meta.class_name || '', 
        s.section || '', 
        s.semester || ''
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subjects_${teacherId}_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTeacherSubjects(teacherId);
      setSubjects(data || []);
    } catch (e) {
      setError((e as Error).message || 'Refresh failed');
      console.error('Error refreshing subjects:', e);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-white to-blue-50">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="px-3 py-2 rounded-lg bg-white shadow border hover:shadow-md transition-colors">
              ← Back
            </button>
            <div>
              <h1 className="text-2xl font-semibold">Teaching Subjects</h1>
              <p className="text-sm text-gray-500">
                {subjects.length} subject{subjects.length !== 1 ? 's' : ''} • {filtered.length} shown
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRefresh} 
              disabled={loading}
              className="px-3 py-2 rounded-lg bg-white shadow border hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button 
              onClick={exportCSV} 
              className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl shadow grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="md:col-span-2">
            <input 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              placeholder="Search by name, code, section or semester" 
              className="w-full p-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none transition-colors" 
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={semesterFilter} 
              onChange={e => setSemesterFilter(e.target.value)} 
              className="w-full p-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Semesters</option>
              {semesters.map(s => <option key={s} value={s}>Semester {s}</option>)}
            </select>
            <select 
              value={sectionFilter} 
              onChange={e => setSectionFilter(e.target.value)} 
              className="w-full p-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:outline-none"
            >
              <option value="all">All Sections</option>
              {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading && (
            <div className="col-span-full text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading subjects...</p>
            </div>
          )}
          
          {!loading && error && (
            <div className="col-span-full text-red-600 text-center py-6 bg-red-50 rounded-lg border border-red-200">
              <p className="font-medium">Error loading subjects</p>
              <p className="text-sm mt-1">{error}</p>
              <button 
                onClick={handleRefresh}
                className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          )}
          
          {!loading && filtered.length === 0 && !error && (
            <div className="col-span-full text-center py-10 text-gray-500">
              <div className="text-4xl mb-2">📚</div>
              <p className="font-medium">No subjects found</p>
              <p className="text-sm">Try adjusting your search or filters</p>
            </div>
          )}
          
          {filtered.map((s, index) => {
            const meta = s.subjects || {};
            return (
              <motion.div 
                key={s.subject_id || `subject-${index}`} 
                layout 
                whileHover={{ translateY: -4 }} 
                className="bg-white p-4 rounded-2xl shadow hover:shadow-lg transition-all duration-200 border border-gray-100"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded w-fit mb-2">
                      {meta.subject_code || '—'}
                    </div>
                    <div className="text-lg font-semibold text-gray-800 mb-1">
                      {meta.subject_name || 'Untitled Subject'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {meta.class_name || 'N/A'} • Section {s.section || '—'} • Semester {s.semester || '—'}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => onNavigate('attendance', { subject: s })} 
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 hover:border-blue-300 transition-colors"
                  >
                    📊 Attendance
                  </button>
                  <button 
                    onClick={() => onNavigate('grades', { subject: s })} 
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 hover:border-green-300 transition-colors"
                  >
                    📝 Grades
                  </button>
                  <button 
                    onClick={() => onNavigate('schedule', { subject: s })} 
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 hover:border-purple-300 transition-colors"
                  >
                    🕒 Schedule
                  </button>
                  <button 
                    onClick={() => onNavigate('assignments', { subject: s })} 
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm hover:bg-gray-50 hover:border-orange-300 transition-colors"
                  >
                    📋 Assignments
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <button 
            onClick={onBack} 
            className="px-6 py-3 rounded-lg bg-gray-100 border hover:bg-gray-200 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}