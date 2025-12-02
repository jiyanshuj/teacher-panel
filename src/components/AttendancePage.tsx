import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ClipboardCheck, Camera, Users, Calendar, CheckCircle, XCircle, Clock, Download, Play, Square, RotateCcw, AlertCircle, User, GraduationCap } from 'lucide-react';

interface AttendancePageProps {
    teacherId: string;
    onBack: () => void;
}

interface Student {
    id: string;
    name: string;
    rollNumber: string;
    email: string;
    status: 'present' | 'absent' | 'pending';
    confidence?: number;
    timestamp?: string;
}

interface RecognitionResult {
    student_id?: string;
    student_name?: string;
    name?: string;
    id?: string;
    confidence: number;
    timestamp: string;
    status: string;
    role?: string;
}

const AttendancePage: React.FC<AttendancePageProps> = ({ teacherId, onBack }) => {
    const [attendanceMode, setAttendanceMode] = useState<'student' | 'self'>('student');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedSubject, setSelectedSubject] = useState('CS101');
    const [selectedSection, setSelectedSection] = useState('A');
    const [selectedSemester, setSelectedSemester] = useState('7');
    const [students, setStudents] = useState<Student[]>([]);
    const [teacherAttendance, setTeacherAttendance] = useState<RecognitionResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [cameraActive, setCameraActive] = useState(false);
    const [recognitionResults, setRecognitionResults] = useState<RecognitionResult[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
    const [activeSession, setActiveSession] = useState<any>(null);
    const [isRecognizing, setIsRecognizing] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const recognitionIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const API_BASE = 'https://37f157ea0d3c.ngrok-free.app';

    useEffect(() => {
        checkBackendConnection();
        return () => {
            stopCamera();
            if (recognitionIntervalRef.current) {
                clearInterval(recognitionIntervalRef.current);
            }
        };
    }, []);

    const checkBackendConnection = async () => {
        setBackendStatus('checking');
        try {
            const response = await fetch(`${API_BASE}/debug/students`);
            if (response.ok) {
                setBackendStatus('connected');
            } else {
                setBackendStatus('disconnected');
            }
        } catch (error) {
            setBackendStatus('disconnected');
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                    facingMode: 'user'
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setCameraActive(true);
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            alert('Unable to access camera. Please check permissions.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        if (recognitionIntervalRef.current) {
            clearInterval(recognitionIntervalRef.current);
            recognitionIntervalRef.current = null;
        }
        setCameraActive(false);
        setIsRecognizing(false);
    };

    const startStudentAttendanceSession = async () => {
        try {
            const form = new FormData();
            form.append('teacher_id', teacherId);
            form.append('subject_id', selectedSubject);
            form.append('section', selectedSection);
            form.append('semester', selectedSemester);
            form.append('class_name', `${selectedSection}-${selectedSemester}`);
            form.append('duration_minutes', '60');

            const response = await fetch(`${API_BASE}/attendance/start-session`, {
                method: 'POST',
                body: form
            });

            const result = await response.json();

            if (response.ok) {
                setActiveSession(result.session);
                alert('Attendance session started!');
                startStudentRecognition();
            } else {
                alert(result.detail || 'Failed to start session');
            }
        } catch (err) {
            console.error('Start session error:', err);
            alert('Failed to start attendance session');
        }
    };

    const startStudentRecognition = async () => {
        try {
            if (!cameraActive) {
                await startCamera();
                await new Promise(resolve => setTimeout(resolve, 1500));
            }

            setIsRecognizing(true);

            if (recognitionIntervalRef.current) {
                clearInterval(recognitionIntervalRef.current);
            }

            recognitionIntervalRef.current = setInterval(async () => {
                const video = videoRef.current;
                const canvas = canvasRef.current;

                if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA && activeSession) {
                    try {
                        const captureCanvas = document.createElement('canvas');
                        captureCanvas.width = video.videoWidth;
                        captureCanvas.height = video.videoHeight;
                        const captureCtx = captureCanvas.getContext('2d');
                        if (captureCtx) {
                            captureCtx.drawImage(video, 0, 0);

                            captureCanvas.toBlob(async blob => {
                                if (blob) {
                                    const form = new FormData();
                                    form.append('image', blob, 'test.jpg');
                                    form.append('section', selectedSection);
                                    form.append('year', selectedSemester);

                                    try {
                                        const response = await fetch(`${API_BASE}/attendance/recognize-and-mark`, {
                                            method: 'POST',
                                            body: form
                                        });

                                        if (response.ok) {
                                            const result = await response.json();

                                            if (result.success) {
                                                const transformedResult: RecognitionResult = {
                                                    student_name: result.recognition.name,
                                                    student_id: result.recognition.id,
                                                    confidence: result.recognition.confidence,
                                                    status: result.status,
                                                    timestamp: new Date().toISOString()
                                                };

                                                setRecognitionResults(prev => [...prev, transformedResult]);

                                                setStudents(prev => {
                                                    const existingIndex = prev.findIndex(s => s.id === transformedResult.student_id);
                                                    const studentData: Student = {
                                                        id: transformedResult.student_id!,
                                                        name: transformedResult.student_name!,
                                                        rollNumber: transformedResult.student_id!,
                                                        email: `${transformedResult.student_name!.toLowerCase().replace(/\s+/g, '.')}@university.edu`,
                                                        status: 'present',
                                                        confidence: transformedResult.confidence,
                                                        timestamp: transformedResult.timestamp
                                                    };

                                                    if (existingIndex >= 0) {
                                                        const updated = [...prev];
                                                        updated[existingIndex] = studentData;
                                                        return updated;
                                                    } else {
                                                        return [...prev, studentData];
                                                    }
                                                });

                                                drawFaceBox(canvas.getContext('2d')!, video, transformedResult);
                                            }
                                        }
                                    } catch (err) {
                                        console.error('Recognition request error:', err);
                                    }
                                }
                            }, 'image/jpeg', 0.8);
                        }
                    } catch (err) {
                        console.error('Canvas error:', err);
                    }
                }
            }, 3000);
        } catch (error) {
            console.error('Recognition start error:', error);
            setIsRecognizing(false);
        }
    };

    const captureSelfAttendance = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        if (backendStatus !== 'connected') {
            alert('Backend service is not connected.');
            return;
        }

        setIsProcessing(true);

        try {
            const canvas = canvasRef.current;
            const video = videoRef.current;
            const context = canvas.getContext('2d');

            if (!context) return;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            canvas.toBlob(async blob => {
                if (blob) {
                    const form = new FormData();
                    form.append('image', blob, 'teacher.jpg');
                    form.append('section', '');
                    form.append('year', '');

                    try {
                        const response = await fetch(`${API_BASE}/test`, {
                            method: 'POST',
                            body: form
                        });

                        if (response.ok) {
                            const result = await response.json();

                            if (result.name !== 'Unknown') {
                                const transformedResult: RecognitionResult = {
                                    name: result.name,
                                    id: result.id || 'N/A',
                                    role: result.role,
                                    confidence: result.confidence || 0,
                                    status: 'present',
                                    timestamp: new Date().toISOString()
                                };

                                setTeacherAttendance(transformedResult);
                                alert(`✅ Teacher ${result.name} marked present (${(result.confidence * 100).toFixed(1)}% confidence)`);

                                drawFaceBox(context, video, transformedResult);
                            } else {
                                alert('Face not recognized. Please try again.');
                            }
                        } else {
                            alert('Recognition failed');
                        }
                    } catch (error) {
                        console.error('Error during face recognition:', error);
                        alert('Error connecting to face recognition service.');
                    }
                }
            }, 'image/jpeg', 0.8);
        } catch (error) {
            console.error('Error during face recognition:', error);
            alert('Error during recognition process.');
        }

        setIsProcessing(false);
    };

    const drawFaceBox = (ctx: CanvasRenderingContext2D, video: HTMLVideoElement, result: RecognitionResult) => {
        if (!result) return;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const boxWidth = video.videoWidth * 0.4;
        const boxHeight = video.videoHeight * 0.5;
        const boxX = (video.videoWidth - boxWidth) / 2;
        const boxY = (video.videoHeight - boxHeight) / 2 - video.videoHeight * 0.05;

        ctx.strokeStyle = '#10b981';
        ctx.lineWidth = 4;
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

        const labelHeight = 100;
        ctx.fillStyle = 'rgba(16, 185, 129, 0.9)';
        ctx.fillRect(boxX, boxY - labelHeight, boxWidth, labelHeight);

        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'left';

        const textX = boxX + 10;
        const displayName = result.student_name || result.name || 'Unknown';
        const displayId = result.student_id || result.id || 'N/A';

        ctx.fillText(displayName, textX, boxY - labelHeight + 25);
        ctx.font = '16px Arial';
        ctx.fillText(displayId, textX, boxY - labelHeight + 50);
        ctx.fillText(`Confidence: ${(result.confidence * 100).toFixed(1)}%`, textX, boxY - labelHeight + 72);
        if (result.role) {
            ctx.fillText(`Role: ${result.role}`, textX, boxY - labelHeight + 94);
        } else {
            ctx.fillText(`Status: ${result.status}`, textX, boxY - labelHeight + 94);
        }
    };

    const resetAttendance = () => {
        setStudents([]);
        setRecognitionResults([]);
        setTeacherAttendance(null);
        stopCamera();
    };

    const exportAttendance = () => {
        if (attendanceMode === 'student' && students.length === 0) {
            alert('No attendance data to export');
            return;
        }

        if (attendanceMode === 'self' && !teacherAttendance) {
            alert('No attendance data to export');
            return;
        }

        if (attendanceMode === 'student') {
            const csvContent = [
                ['Date', 'Subject', 'Section', 'Semester', 'Student ID', 'Student Name', 'Status', 'Confidence', 'Timestamp'].join(','),
                ...students.map(student => [
                    selectedDate,
                    selectedSubject,
                    selectedSection,
                    selectedSemester,
                    student.rollNumber,
                    student.name,
                    student.status,
                    student.confidence ? (student.confidence * 100).toFixed(1) + '%' : '',
                    student.timestamp ? new Date(student.timestamp).toLocaleString() : ''
                ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `student_attendance_${selectedSubject}_${selectedSection}_${selectedDate}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } else {
            const csvContent = [
                ['Date', 'Teacher ID', 'Teacher Name', 'Role', 'Status', 'Confidence', 'Timestamp'].join(','),
                [
                    selectedDate,
                    teacherAttendance?.id || '',
                    teacherAttendance?.name || '',
                    teacherAttendance?.role || '',
                    teacherAttendance?.status || '',
                    teacherAttendance?.confidence ? (teacherAttendance.confidence * 100).toFixed(1) + '%' : '',
                    teacherAttendance?.timestamp ? new Date(teacherAttendance.timestamp).toLocaleString() : ''
                ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
            ].join('\n');

            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `teacher_attendance_${selectedDate}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    };

    const presentCount = students.filter(s => s.status === 'present').length;
    const absentCount = students.filter(s => s.status === 'absent').length;
    const attendancePercentage = students.length > 0 ? ((presentCount / students.length) * 100).toFixed(1) : '0';

    const getBackendStatusColor = () => {
        switch (backendStatus) {
            case 'connected': return 'bg-green-100 text-green-800 border-green-200';
            case 'disconnected': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        }
    };

    const getBackendStatusText = () => {
        switch (backendStatus) {
            case 'connected': return '✅ Backend Connected';
            case 'disconnected': return '❌ Backend Disconnected';
            default: return '⏳ Checking Connection...';
        }
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
                                    <ClipboardCheck className="w-6 h-6 text-green-600" />
                                    Face Recognition Attendance
                                </h1>
                                <p className="text-gray-600">AI-powered attendance marking system</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getBackendStatusColor()}`}>
                                {getBackendStatusText()}
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={resetAttendance}
                                    className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Reset
                                </button>
                                <button
                                    onClick={exportAttendance}
                                    disabled={(attendanceMode === 'student' && students.length === 0) || (attendanceMode === 'self' && !teacherAttendance)}
                                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                >
                                    <Download className="w-4 h-4" />
                                    Export
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Backend Connection Warning */}
                {backendStatus === 'disconnected' && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <div>
                                <h3 className="font-bold text-red-800">Backend Service Disconnected</h3>
                                <p className="text-red-700 text-sm">Please ensure your backend server is running for face recognition to work.</p>
                            </div>
                            <button
                                onClick={checkBackendConnection}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* Attendance Mode Selection */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Select Attendance Mode</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={() => {
                                setAttendanceMode('student');
                                resetAttendance();
                            }}
                            className={`p-6 rounded-xl border-2 transition-all ${attendanceMode === 'student'
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-gray-200 bg-white hover:border-blue-300'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <GraduationCap className={`w-8 h-8 ${attendanceMode === 'student' ? 'text-blue-600' : 'text-gray-600'}`} />
                                <h4 className={`text-xl font-bold ${attendanceMode === 'student' ? 'text-blue-600' : 'text-gray-800'}`}>
                                    Student Attendance
                                </h4>
                            </div>
                            <p className="text-sm text-gray-600 text-center">Mark attendance for multiple students</p>
                        </button>

                        <button
                            onClick={() => {
                                setAttendanceMode('self');
                                resetAttendance();
                            }}
                            className={`p-6 rounded-xl border-2 transition-all ${attendanceMode === 'self'
                                    ? 'border-green-500 bg-green-50'
                                    : 'border-gray-200 bg-white hover:border-green-300'
                                }`}
                        >
                            <div className="flex items-center justify-center gap-3 mb-2">
                                <User className={`w-8 h-8 ${attendanceMode === 'self' ? 'text-green-600' : 'text-gray-600'}`} />
                                <h4 className={`text-xl font-bold ${attendanceMode === 'self' ? 'text-green-600' : 'text-gray-800'}`}>
                                    Self Attendance
                                </h4>
                            </div>
                            <p className="text-sm text-gray-600 text-center">Mark your own attendance as teacher</p>
                        </button>
                    </div>
                </div>

                {/* Controls */}
                {attendanceMode === 'student' && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                                <select
                                    value={selectedSubject}
                                    onChange={(e) => setSelectedSubject(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="CS101">Computer Science Fundamentals</option>
                                    <option value="CS201">Data Structures and Algorithms</option>
                                    <option value="CS301">Database Management Systems</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Section</label>
                                <input
                                    type="text"
                                    value={selectedSection}
                                    onChange={(e) => setSelectedSection(e.target.value.toUpperCase())}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., A"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
                                <input
                                    type="text"
                                    value={selectedSemester}
                                    onChange={(e) => setSelectedSemester(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., 7"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {attendanceMode === 'self' && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Teacher ID</label>
                                <input
                                    type="text"
                                    value={teacherId}
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Camera Section */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <Camera className="w-5 h-5 text-blue-600" />
                                Face Recognition Camera
                            </h3>
                            <p className="text-gray-600 text-sm">
                                {attendanceMode === 'student'
                                    ? 'Position students in front of the camera to mark attendance automatically'
                                    : 'Position yourself in front of the camera to mark your attendance'}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            {!cameraActive ? (
                                <button
                                    onClick={startCamera}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                >
                                    <Play className="w-4 h-4" />
                                    Start Camera
                                </button>
                            ) : (
                                <>
                                    {attendanceMode === 'student' ? (
                                        <>
                                            {!isRecognizing ? (
                                                <button
                                                    onClick={startStudentAttendanceSession}
                                                    disabled={backendStatus !== 'connected'}
                                                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                                >
                                                    <Camera className="w-4 h-4" />
                                                    Start Recognition
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setIsRecognizing(false);
                                                        if (recognitionIntervalRef.current) {
                                                            clearInterval(recognitionIntervalRef.current);
                                                        }
                                                    }}
                                                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                                >
                                                    <Square className="w-4 h-4" />
                                                    Pause Recognition
                                                </button>
                                            )}
                                        </>
                                    ) : (
                                        <button
                                            onClick={captureSelfAttendance}
                                            disabled={isProcessing || backendStatus !== 'connected'}
                                            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                        >
                                            <Camera className="w-4 h-4" />
                                            {isProcessing ? 'Processing...' : 'Capture & Mark'}
                                        </button>
                                    )}
                                    <button
                                        onClick={stopCamera}
                                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
                                    >
                                        <Square className="w-4 h-4" />
                                        Stop Camera
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <div className="bg-gray-900 rounded-xl overflow-hidden relative aspect-video">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    muted
                                    className="w-full h-full object-cover"
                                    style={{ display: cameraActive ? 'block' : 'none' }}
                                />
                                {!cameraActive && (
                                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                        <div className="text-center">
                                            <Camera className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                                            <p className="text-gray-600 font-medium text-lg mb-2">Camera Not Active</p>
                                            <p className="text-gray-500 text-sm mb-4">Click "Start Camera" to begin face recognition</p>
                                            <button
                                                onClick={startCamera}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                                            >
                                                <Play className="w-4 h-4" />
                                                Start Camera
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <canvas ref={canvasRef} style={{ display: 'none' }} />

                                {/* Processing Overlay */}
                                {isProcessing && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                        <div className="bg-white rounded-lg p-6 flex items-center gap-3">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                            <span className="text-gray-800 font-medium">Processing faces...</span>
                                        </div>
                                    </div>
                                )}

                                {/* Camera Controls Overlay */}
                                {cameraActive && (
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                                        {attendanceMode === 'student' ? (
                                            <button
                                                disabled={isProcessing || !isRecognizing}
                                                className="bg-white hover:bg-gray-100 disabled:bg-gray-300 text-gray-800 px-6 py-3 rounded-full font-medium transition-colors flex items-center gap-2 shadow-lg"
                                            >
                                                <Camera className="w-5 h-5" />
                                                {isRecognizing ? 'Recognizing...' : 'Waiting...'}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={captureSelfAttendance}
                                                disabled={isProcessing || backendStatus !== 'connected'}
                                                className="bg-white hover:bg-gray-100 disabled:bg-gray-300 text-gray-800 px-6 py-3 rounded-full font-medium transition-colors flex items-center gap-2 shadow-lg"
                                            >
                                                <Camera className="w-5 h-5" />
                                                {isProcessing ? 'Processing...' : 'Capture'}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recognition Status Panel */}
                        <div className="space-y-4">
                            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Recognition Status
                                </h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="text-blue-700">Backend Service:</span>
                                        <span className={`font-medium px-2 py-1 rounded text-xs ${backendStatus === 'connected' ? 'bg-green-100 text-green-800' :
                                                backendStatus === 'disconnected' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {backendStatus === 'connected' ? 'Online' :
                                                backendStatus === 'disconnected' ? 'Offline' : 'Checking'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-700">Camera Status:</span>
                                        <span className={`font-medium ${cameraActive ? 'text-green-600' : 'text-gray-600'}`}>
                                            {cameraActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    {attendanceMode === 'student' && (
                                        <>
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">Students Recognized:</span>
                                                <span className="font-medium text-blue-800">{students.length}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-blue-700">Recognition Rate:</span>
                                                <span className="font-medium text-blue-800">{attendancePercentage}%</span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Recent Recognition Results */}
                            {attendanceMode === 'student' && (
                                <div className="bg-gray-50 rounded-xl p-4">
                                    <h4 className="font-bold text-gray-800 mb-3">Recent Recognitions</h4>
                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                        {recognitionResults.length === 0 ? (
                                            <p className="text-gray-500 text-sm text-center py-4">No recognitions yet</p>
                                        ) : (
                                            recognitionResults.slice(-5).reverse().map((result, index) => (
                                                <div key={index} className="flex items-center justify-between bg-white rounded-lg p-3 text-sm shadow-sm">
                                                    <div>
                                                        <span className="font-medium text-gray-800">{result.student_name}</span>
                                                        <p className="text-xs text-gray-500">{result.student_id}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="text-green-600 font-medium">{(result.confidence * 100).toFixed(1)}%</span>
                                                        <p className="text-xs text-gray-500">
                                                            {new Date(result.timestamp).toLocaleTimeString()}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Instructions */}
                            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
                                <h4 className="font-bold text-yellow-800 mb-2">Instructions</h4>
                                <ul className="text-sm text-yellow-700 space-y-1">
                                    {attendanceMode === 'student' ? (
                                        <>
                                            <li>• Ensure good lighting for better recognition</li>
                                            <li>• Students should look directly at camera</li>
                                            <li>• Click "Start Recognition" to begin</li>
                                            <li>• Recognition runs automatically every 3 seconds</li>
                                            <li>• Backend must be running</li>
                                        </>
                                    ) : (
                                        <>
                                            <li>• Ensure good lighting and clear face visibility</li>
                                            <li>• Look directly at the camera</li>
                                            <li>• Click "Capture & Mark" to mark attendance</li>
                                            <li>• Backend must be running</li>
                                            <li>• One capture per session</li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attendance Summary - Student Mode */}
                {attendanceMode === 'student' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Users className="w-6 h-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-800">{students.length}</p>
                                        <p className="text-sm text-gray-600">Recognized Students</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-800">{presentCount}</p>
                                        <p className="text-sm text-gray-600">Present</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                        <XCircle className="w-6 h-6 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-800">{absentCount}</p>
                                        <p className="text-sm text-gray-600">Absent</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <span className="text-xl font-bold text-purple-600">{attendancePercentage}%</span>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Attendance Rate</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recognized Students List */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                            <div className="bg-gradient-to-r from-green-600 to-green-700 p-4">
                                <h3 className="text-lg font-bold text-white">Attendance Record</h3>
                                <p className="text-green-200 text-sm">Students recognized for {selectedSubject} - Section {selectedSection} on {new Date(selectedDate).toLocaleDateString()}</p>
                            </div>

                            <div className="p-6">
                                {students.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Camera className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                                        <h4 className="text-xl font-medium text-gray-800 mb-2">No Students Recognized Yet</h4>
                                        <p className="text-gray-600 text-sm mb-6">Start the camera and recognition to automatically mark attendance using face recognition</p>
                                        {!cameraActive && backendStatus === 'connected' && (
                                            <button
                                                onClick={startCamera}
                                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                                            >
                                                <Camera className="w-5 h-5" />
                                                Start Face Recognition
                                            </button>
                                        )}
                                        {backendStatus !== 'connected' && (
                                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
                                                <p className="text-red-700 text-sm">Please start your backend server to enable face recognition.</p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {students.map((student) => (
                                            <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-medium text-gray-800 text-lg">{student.name}</h4>
                                                        <p className="text-sm text-gray-600">{student.rollNumber} • {student.email}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    {student.confidence && (
                                                        <div className="text-right">
                                                            <p className="text-sm font-medium text-green-600">
                                                                {(student.confidence * 100).toFixed(1)}% confidence
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {student.timestamp && new Date(student.timestamp).toLocaleTimeString()}
                                                            </p>
                                                        </div>
                                                    )}
                                                    <div className="px-4 py-2 rounded-full text-sm font-medium border bg-green-100 text-green-800 border-green-200 flex items-center gap-2">
                                                        <CheckCircle className="w-4 h-4" />
                                                        Present
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <div className="mt-8 flex justify-center">
                                            <button
                                                onClick={() => {
                                                    if (students.length > 0) {
                                                        alert(`Attendance saved successfully for ${students.length} students!`);
                                                    } else {
                                                        alert('No attendance data to save');
                                                    }
                                                }}
                                                disabled={students.length === 0}
                                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                                            >
                                                <CheckCircle className="w-5 h-5" />
                                                Save Attendance Record
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* Teacher Attendance - Self Mode */}
                {attendanceMode === 'self' && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
                        <div className="bg-gradient-to-r from-green-600 to-green-700 p-4">
                            <h3 className="text-lg font-bold text-white">Your Attendance Record</h3>
                            <p className="text-green-200 text-sm">Self-marked attendance on {new Date(selectedDate).toLocaleDateString()}</p>
                        </div>

                        <div className="p-6">
                            {!teacherAttendance ? (
                                <div className="text-center py-12">
                                    <User className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                                    <h4 className="text-xl font-medium text-gray-800 mb-2">No Attendance Marked Yet</h4>
                                    <p className="text-gray-600 text-sm mb-6">Use the camera to capture your face and mark attendance</p>
                                    {!cameraActive && backendStatus === 'connected' && (
                                        <button
                                            onClick={startCamera}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                                        >
                                            <Camera className="w-5 h-5" />
                                            Start Camera
                                        </button>
                                    )}
                                    {backendStatus !== 'connected' && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
                                            <p className="text-red-700 text-sm">Please start your backend server to enable face recognition.</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-6 bg-green-50 rounded-xl border-2 border-green-200">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                                                <CheckCircle className="w-8 h-8 text-green-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-800 text-lg">{teacherAttendance.name}</h4>
                                                <p className="text-sm text-gray-600">ID: {teacherAttendance.id}</p>
                                                {teacherAttendance.role && (
                                                    <p className="text-sm text-gray-600">Role: {teacherAttendance.role}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-lg font-bold text-green-600">
                                                {(teacherAttendance.confidence * 100).toFixed(1)}% confidence
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {new Date(teacherAttendance.timestamp).toLocaleTimeString()}
                                            </p>
                                            <div className="mt-2 px-4 py-2 rounded-full text-sm font-medium border bg-green-100 text-green-800 border-green-200 flex items-center gap-2 ml-auto w-fit">
                                                <CheckCircle className="w-4 h-4" />
                                                Present
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-center gap-4">
                                        <button
                                            onClick={() => {
                                                alert(`Attendance marked successfully for ${teacherAttendance.name}!`);
                                            }}
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            Save Attendance
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

export default AttendancePage;
