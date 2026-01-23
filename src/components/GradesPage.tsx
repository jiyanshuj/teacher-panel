import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { TeacherSubject } from '../types';

interface GradesPageProps {
    teacherId?: string;
    onBack: () => void;
    onNavigate?: (path: string, payload?: any) => void;
}

interface Student {
    student_id: string;
    student_name: string;
    roll_number: string;
}

interface StudentGrade {
    student_id: string;
    student_name: string;
    roll_number: string;
    midterm: number;
    endterm: number;
    assignment: number;
    practical: number;
    total: number;
    grade: string;
}

export default function GradesPage({ teacherId = 'T001', onBack, onNavigate = () => { } }: GradesPageProps) {
    const [subjects] = useState<TeacherSubject[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<TeacherSubject | null>(null);
    const [grades, setGrades] = useState<StudentGrade[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [editingGrade, setEditingGrade] = useState<{ student_id: string; field: string } | null>(null);
    const [editValue, setEditValue] = useState('');

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return grades.filter(g =>
            g.student_name.toLowerCase().includes(q) ||
            g.roll_number.toLowerCase().includes(q)
        );
    }, [grades, search]);

    const calculateGrade = (total: number): string => {
        if (total >= 90) return 'A+';
        if (total >= 80) return 'A';
        if (total >= 70) return 'B+';
        if (total >= 60) return 'B';
        if (total >= 50) return 'C';
        return 'F';
    };

    const handleGradeUpdate = (studentId: string, field: string, value: string) => {
        const numValue = Math.min(100, Math.max(0, parseInt(value) || 0));
        setGrades(prev =>
            prev.map(g => {
                if (g.student_id === studentId) {
                    const updated = { ...g, [field]: numValue };
                    const midterm = field === 'midterm' ? numValue : updated.midterm;
                    const endterm = field === 'endterm' ? numValue : updated.endterm;
                    const assignment = field === 'assignment' ? numValue : updated.assignment;
                    const practical = field === 'practical' ? numValue : updated.practical;
                    const total = (midterm * 0.2 + endterm * 0.4 + assignment * 0.2 + practical * 0.2);
                    return {
                        ...updated,
                        total: Math.round(total),
                        grade: calculateGrade(total)
                    };
                }
                return g;
            })
        );
        setEditingGrade(null);
    };

    const exportGrades = () => {
        const headers = ['Roll Number', 'Student Name', 'Midterm', 'Endterm', 'Assignment', 'Practical', 'Total', 'Grade'];
        const rows = filtered.map(g => [
            g.roll_number,
            g.student_name,
            g.midterm,
            g.endterm,
            g.assignment,
            g.practical,
            g.total,
            g.grade
        ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','));

        const csv = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `grades_${teacherId}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    // Mock data initialization
    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            const mockGrades: StudentGrade[] = [
                { student_id: 'S001', student_name: 'Aarav Kumar', roll_number: '001', midterm: 85, endterm: 88, assignment: 90, practical: 92, total: 89, grade: 'A' },
                { student_id: 'S002', student_name: 'Bhavna Singh', roll_number: '002', midterm: 78, endterm: 82, assignment: 80, practical: 85, total: 81, grade: 'A' },
                { student_id: 'S003', student_name: 'Chirag Patel', roll_number: '003', midterm: 72, endterm: 75, assignment: 78, practical: 80, total: 76, grade: 'B+' },
                { student_id: 'S004', student_name: 'Divya Sharma', roll_number: '004', midterm: 88, endterm: 90, assignment: 92, practical: 88, total: 89, grade: 'A' },
                { student_id: 'S005', student_name: 'Eshan Verma', roll_number: '005', midterm: 65, endterm: 68, assignment: 70, practical: 72, total: 69, grade: 'B' },
            ];
            setGrades(mockGrades);
            setLoading(false);
        }, 500);
    }, []);

    return (
        <div className="min-h-screen p-6 bg-gradient-to-br from-white to-green-50">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="px-3 py-2 rounded-lg bg-white shadow border hover:shadow-md transition-colors">
                            ← Back
                        </button>
                        <div>
                            <h1 className="text-2xl font-semibold">Grade Management</h1>
                            <p className="text-sm text-gray-500">Manage and track student grades</p>
                        </div>
                    </div>
                    <button
                        onClick={exportGrades}
                        className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                    >
                        📥 Export Grades
                    </button>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow mb-6">
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by student name or roll number"
                        className="w-full p-2 rounded-lg border border-gray-300 focus:border-green-500 focus:outline-none transition-colors"
                    />
                </div>

                <div className="bg-white rounded-2xl shadow overflow-hidden">
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                            <p className="mt-2 text-gray-600">Loading grades...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p className="text-lg font-medium">No grades found</p>
                            <p className="text-sm">Try adjusting your search</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Roll No.</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Student Name</th>
                                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Midterm</th>
                                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Endterm</th>
                                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Assignment</th>
                                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Practical</th>
                                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Total</th>
                                        <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Grade</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((grade, idx) => (
                                        <motion.tr
                                            key={grade.student_id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="border-b hover:bg-gray-50 transition-colors"
                                        >
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{grade.roll_number}</td>
                                            <td className="px-6 py-4 text-sm text-gray-700">{grade.student_name}</td>
                                            <td
                                                className="px-6 py-4 text-center text-sm cursor-pointer hover:bg-blue-50 rounded"
                                                onClick={() => setEditingGrade({ student_id: grade.student_id, field: 'midterm' })}
                                            >
                                                {editingGrade?.student_id === grade.student_id && editingGrade?.field === 'midterm' ? (
                                                    <input
                                                        type="number"
                                                        max="100"
                                                        min="0"
                                                        autoFocus
                                                        value={editValue}
                                                        onChange={e => setEditValue(e.target.value)}
                                                        onBlur={() => handleGradeUpdate(grade.student_id, 'midterm', editValue)}
                                                        onKeyDown={e => e.key === 'Enter' && handleGradeUpdate(grade.student_id, 'midterm', editValue)}
                                                        className="w-12 px-2 py-1 border rounded text-center"
                                                    />
                                                ) : (
                                                    <span className="font-medium text-blue-600">{grade.midterm}</span>
                                                )}
                                            </td>
                                            <td
                                                className="px-6 py-4 text-center text-sm cursor-pointer hover:bg-blue-50 rounded"
                                                onClick={() => setEditingGrade({ student_id: grade.student_id, field: 'endterm' })}
                                            >
                                                {editingGrade?.student_id === grade.student_id && editingGrade?.field === 'endterm' ? (
                                                    <input
                                                        type="number"
                                                        max="100"
                                                        min="0"
                                                        autoFocus
                                                        value={editValue}
                                                        onChange={e => setEditValue(e.target.value)}
                                                        onBlur={() => handleGradeUpdate(grade.student_id, 'endterm', editValue)}
                                                        onKeyDown={e => e.key === 'Enter' && handleGradeUpdate(grade.student_id, 'endterm', editValue)}
                                                        className="w-12 px-2 py-1 border rounded text-center"
                                                    />
                                                ) : (
                                                    <span className="font-medium text-green-600">{grade.endterm}</span>
                                                )}
                                            </td>
                                            <td
                                                className="px-6 py-4 text-center text-sm cursor-pointer hover:bg-blue-50 rounded"
                                                onClick={() => setEditingGrade({ student_id: grade.student_id, field: 'assignment' })}
                                            >
                                                {editingGrade?.student_id === grade.student_id && editingGrade?.field === 'assignment' ? (
                                                    <input
                                                        type="number"
                                                        max="100"
                                                        min="0"
                                                        autoFocus
                                                        value={editValue}
                                                        onChange={e => setEditValue(e.target.value)}
                                                        onBlur={() => handleGradeUpdate(grade.student_id, 'assignment', editValue)}
                                                        onKeyDown={e => e.key === 'Enter' && handleGradeUpdate(grade.student_id, 'assignment', editValue)}
                                                        className="w-12 px-2 py-1 border rounded text-center"
                                                    />
                                                ) : (
                                                    <span className="font-medium text-purple-600">{grade.assignment}</span>
                                                )}
                                            </td>
                                            <td
                                                className="px-6 py-4 text-center text-sm cursor-pointer hover:bg-blue-50 rounded"
                                                onClick={() => setEditingGrade({ student_id: grade.student_id, field: 'practical' })}
                                            >
                                                {editingGrade?.student_id === grade.student_id && editingGrade?.field === 'practical' ? (
                                                    <input
                                                        type="number"
                                                        max="100"
                                                        min="0"
                                                        autoFocus
                                                        value={editValue}
                                                        onChange={e => setEditValue(e.target.value)}
                                                        onBlur={() => handleGradeUpdate(grade.student_id, 'practical', editValue)}
                                                        onKeyDown={e => e.key === 'Enter' && handleGradeUpdate(grade.student_id, 'practical', editValue)}
                                                        className="w-12 px-2 py-1 border rounded text-center"
                                                    />
                                                ) : (
                                                    <span className="font-medium text-orange-600">{grade.practical}</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm font-bold text-gray-900 bg-gray-100">
                                                {grade.total}
                                            </td>
                                            <td className="px-6 py-4 text-center text-sm font-bold">
                                                <span className={`px-3 py-1 rounded-full text-white ${grade.grade === 'A+' || grade.grade === 'A' ? 'bg-green-600' :
                                                        grade.grade === 'B+' ? 'bg-blue-600' :
                                                            grade.grade === 'B' ? 'bg-yellow-600' : 'bg-red-600'
                                                    }`}>
                                                    {grade.grade}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
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
