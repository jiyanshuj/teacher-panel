import React, { useState, useEffect } from 'react';
import { ArrowLeft, BarChart3, Users, Award, TrendingUp, Download, Edit, Plus, X } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bwvwnvmtsrspxenadagc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3dndudm10c3JzcHhlbmFkYWdjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQwNzEwOTgsImV4cCI6MjA2OTY0NzA5OH0.i8m_Phom-ePMEyp1QPc2uJaPvwTNfOQIFVadcFBnFzo';
const supabase = createClient(supabaseUrl, supabaseKey);

interface GradesPageProps {
  teacherId: string;
  onBack: () => void;
}

interface StudentGrade {
  id: string;
  enrollment_number: string;
  student_name?: string;
  marks: number;
  exam_type: string;
  created_at: string;
}

interface Section {
  id: number;
  section_id: string;
  sections: {
    section_id: string;
    section_name: string;
    semester: string;
    branch: string;
    academic_year: string;
  };
}

const GradesPage: React.FC<GradesPageProps> = ({ teacherId, onBack }) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedExamType, setSelectedExamType] = useState('');
  const [grades, setGrades] = useState<StudentGrade[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [message, setMessage] = useState('');
  
  // Add grade form state
  const [newGrade, setNewGrade] = useState({
    enrollmentNumber: '',
    studentName: '',
    marks: ''
  });

  useEffect(() => {
    if (teacherId) {
      fetchSections();
    }
  }, [teacherId]);

  useEffect(() => {
    if (selectedSection && selectedExamType) {
      fetchGrades();
    }
  }, [selectedSection, selectedExamType]);

  const fetchSections = async () => {
    try {
      // Fetch ALL class_sections (not filtered by teacher)
      const { data: classSections, error: classError } = await supabase
        .from('class_sections')
        .select('id, subject_id, teacher_id, class_name, semester')
        .order('class_name', { ascending: true });

      if (classError) throw classError;

      if (!classSections || classSections.length === 0) {
        setSections([]);
        setMessage('No sections available in the system');
        return;
      }

      // Transform the data
      const transformedData = classSections.map(cs => ({
        id: cs.id,
        section_id: cs.id.toString(),
        class_name: cs.class_name,
        subject_id: cs.subject_id,
        semester: cs.semester,
        sections: {
          section_id: cs.id.toString(),
          section_name: cs.class_name,
          semester: cs.semester,
          branch: '',
          academic_year: ''
        }
      }));

      setSections(transformedData);
      
      if (transformedData.length > 0) {
        setSelectedSection(transformedData[0].section_id);
      }
    } catch (error) {
      console.error('Error fetching sections:', error);
      setMessage('Error loading sections');
    }
  };

  const fetchGrades = async () => {
    if (!selectedSection || !selectedExamType) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('grades')
        .select('*')
        .eq('section_id', selectedSection)
        .eq('exam_type', selectedExamType)
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGrades(data || []);
    } catch (error) {
      console.error('Error fetching grades:', error);
      setMessage('Error loading grades');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGrade = async () => {
    if (!newGrade.enrollmentNumber || !newGrade.marks) {
      setMessage('Please fill in enrollment number and marks');
      return;
    }

    if (!selectedSection || !selectedExamType) {
      setMessage('Please select section and exam type first');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('grades')
        .insert({
          teacher_id: teacherId,
          section_id: selectedSection,
          exam_type: selectedExamType,
          enrollment_number: newGrade.enrollmentNumber,
          marks: parseFloat(newGrade.marks),
          student_name: newGrade.studentName || null,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      setMessage('✓ Grade added successfully!');
      setNewGrade({ enrollmentNumber: '', studentName: '', marks: '' });
      setShowAddModal(false);
      fetchGrades();
      
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error adding grade:', error);
      setMessage('Error adding grade');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGrade = async (gradeId: string) => {
    if (!confirm('Are you sure you want to delete this grade?')) return;

    try {
      const { error } = await supabase
        .from('grades')
        .delete()
        .eq('id', gradeId);

      if (error) throw error;

      setMessage('✓ Grade deleted successfully!');
      fetchGrades();
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting grade:', error);
      setMessage('Error deleting grade');
    }
  };

  const calculateStats = () => {
    if (grades.length === 0) {
      return { average: 0, highest: 0, lowest: 0, passRate: 0 };
    }

    const marks = grades.map(g => g.marks);
    const average = marks.reduce((a, b) => a + b, 0) / marks.length;
    const highest = Math.max(...marks);
    const lowest = Math.min(...marks);
    const passing = grades.filter(g => g.marks >= 40).length;
    const passRate = (passing / grades.length) * 100;

    return {
      average: Math.round(average * 10) / 10,
      highest,
      lowest,
      passRate: Math.round(passRate * 10) / 10
    };
  };

  const stats = calculateStats();

  const getSelectedSectionName = () => {
    const section = sections.find(s => s.section_id === selectedSection);
    return section?.class_name || 'Select Section';
  };

  const exportToCSV = () => {
    if (grades.length === 0) {
      setMessage('No grades to export');
      return;
    }

    const csvContent = [
      ['Enrollment Number', 'Student Name', 'Marks', 'Exam Type', 'Date'],
      ...grades.map(g => [
        g.enrollment_number,
        g.student_name || 'N/A',
        g.marks,
        g.exam_type,
        new Date(g.created_at).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grades_${selectedExamType}_${getSelectedSectionName()}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

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
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                  Grades Management
                </h1>
                <p className="text-gray-600">Student evaluation and grade tracking</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Grade
              </button>
              <button 
                onClick={exportToCSV}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${message.includes('✓') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {message}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
              <select
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select Section</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.section_id}>
                    {section.class_name} (Semester {section.semester})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Exam Type</label>
              <select
                value={selectedExamType}
                onChange={(e) => setSelectedExamType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Select Exam Type</option>
                <option value="MST 1">MST 1</option>
                <option value="MST 2">MST 2</option>
              </select>
            </div>
          </div>
        </div>

        {/* Grade Statistics */}
        {selectedSection && selectedExamType && grades.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.average}</p>
                  <p className="text-sm text-gray-600">Class Average</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.highest}</p>
                  <p className="text-sm text-gray-600">Highest Score</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold text-red-600">{stats.lowest}</span>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.lowest}</p>
                  <p className="text-sm text-gray-600">Lowest Score</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl font-bold text-purple-600">{stats.passRate}%</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pass Rate</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Grades Table */}
        {selectedSection && selectedExamType ? (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4">
              <h3 className="text-lg font-bold text-white">Student Grades</h3>
              <p className="text-purple-200 text-sm">
                {selectedExamType} - {getSelectedSectionName()}
              </p>
            </div>
            
            {loading ? (
              <div className="p-8 text-center text-gray-600">Loading grades...</div>
            ) : grades.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                No grades found. Click "Add Grade" to enter grades.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Enrollment Number</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Student Name</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Marks</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Date</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {grades.map((grade) => (
                      <tr key={grade.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-800">{grade.enrollment_number}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-gray-800">{grade.student_name || 'N/A'}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="font-bold text-gray-800">{grade.marks}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm text-gray-600">
                            {new Date(grade.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button 
                            onClick={() => handleDeleteGrade(grade.id)}
                            className="bg-red-100 hover:bg-red-200 text-red-700 p-2 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">No Selection</h3>
            <p className="text-gray-600">Please select a section and exam type to view grades</p>
          </div>
        )}

        {/* Add Grade Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Add New Grade</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {!selectedSection || !selectedExamType ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">Please select section and exam type first</p>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-lg"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-purple-50 p-3 rounded-lg text-sm">
                    <p className="text-purple-900 font-medium">{selectedExamType}</p>
                    <p className="text-purple-700">{getSelectedSectionName()}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enrollment Number *
                    </label>
                    <input
                      type="text"
                      value={newGrade.enrollmentNumber}
                      onChange={(e) => setNewGrade({...newGrade, enrollmentNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter enrollment number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Student Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={newGrade.studentName}
                      onChange={(e) => setNewGrade({...newGrade, studentName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter student name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marks *
                    </label>
                    <input
                      type="number"
                      value={newGrade.marks}
                      onChange={(e) => setNewGrade({...newGrade, marks: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter marks"
                      min="0"
                      max="100"
                      step="0.01"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddGrade}
                      disabled={loading}
                      className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
                    >
                      {loading ? 'Adding...' : 'Add Grade'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GradesPage;