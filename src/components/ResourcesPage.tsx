import React, { useState } from 'react';
import { 
  ArrowLeft, FolderOpen, Upload, Download, Search, Filter, FileText, Image, Video, File, 
  Plus, CreditCard as Edit, Trash2, Eye, File as FileEdit, Wand2, BookOpen, Calendar, GraduationCap, X
} from 'lucide-react';

interface ResourcesPageProps {
  teacherId: string;
  onBack: () => void;
}


interface Resource {
  id: string;
  name: string;
  type: 'document' | 'image' | 'video' | 'other';
  size: string;
  uploadDate: string;
  subject: string;
  category: string;
  description: string;
  downloads: number;
}

const ResourcesPage: React.FC<ResourcesPageProps> = ({ teacherId, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showPaperGenerator, setShowPaperGenerator] = useState(false);

  // Mock resources data
  const [resources] = useState<Resource[]>([
    {
      id: '1',
      name: 'Data Structures Lecture Notes.pdf',
      type: 'document',
      size: '2.4 MB',
      uploadDate: '2025-01-15',
      subject: 'CS201',
      category: 'Lecture Notes',
      description: 'Comprehensive notes covering arrays, linked lists, and trees',
      downloads: 45
    },
    {
      id: '2',
      name: 'Algorithm Visualization.mp4',
      type: 'video',
      size: '15.2 MB',
      uploadDate: '2025-01-14',
      subject: 'CS201',
      category: 'Videos',
      description: 'Visual demonstration of sorting algorithms',
      downloads: 32
    },
    {
      id: '3',
      name: 'Database Schema Diagram.png',
      type: 'image',
      size: '1.8 MB',
      uploadDate: '2025-01-13',
      subject: 'CS301',
      category: 'Diagrams',
      description: 'ER diagram for student management system',
      downloads: 28
    },
    {
      id: '4',
      name: 'Programming Assignment 1.docx',
      type: 'document',
      size: '0.5 MB',
      uploadDate: '2025-01-12',
      subject: 'CS101',
      category: 'Assignments',
      description: 'Basic programming exercises for beginners',
      downloads: 67
    },
    {
      id: '5',
      name: 'SQL Query Examples.sql',
      type: 'other',
      size: '0.3 MB',
      uploadDate: '2025-01-11',
      subject: 'CS301',
      category: 'Code Examples',
      description: 'Sample SQL queries for database operations',
      downloads: 23
    },
    {
      id: '6',
      name: 'Computer Networks Presentation.pptx',
      type: 'document',
      size: '8.7 MB',
      uploadDate: '2025-01-10',
      subject: 'CS401',
      category: 'Presentations',
      description: 'OSI model and network protocols overview',
      downloads: 19
    }
  ]);

  const categories = ['all', 'Lecture Notes', 'Videos', 'Diagrams', 'Assignments', 'Code Examples', 'Presentations'];
  const subjects = ['all', 'CS101', 'CS201', 'CS301', 'CS401'];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="w-8 h-8 text-blue-600" />;
      case 'image': return <Image className="w-8 h-8 text-green-600" />;
      case 'video': return <Video className="w-8 h-8 text-red-600" />;
      default: return <File className="w-8 h-8 text-gray-600" />;
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'document': return 'bg-blue-100 border-blue-200';
      case 'image': return 'bg-green-100 border-green-200';
      case 'video': return 'bg-red-100 border-red-200';
      default: return 'bg-gray-100 border-gray-200';
    }
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || resource.category === selectedCategory;
    const matchesSubject = selectedSubject === 'all' || resource.subject === selectedSubject;
    
    return matchesSearch && matchesCategory && matchesSubject;
  });

  const totalSize = resources.reduce((acc, resource) => {
    const size = parseFloat(resource.size);
    return acc + size;
  }, 0);

  const totalDownloads = resources.reduce((acc, resource) => acc + resource.downloads, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6 overflow-y-auto">
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
                  <FolderOpen className="w-6 h-6 text-indigo-600" />
                  Teaching Resources
                </h1>
                <p className="text-gray-600">Manage and organize your teaching materials</p>
              </div>
            </div>
            <button 
              onClick={() => setShowPaperGenerator(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Paper Generator
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{resources.length}</p>
                <p className="text-sm text-gray-600">Total Resources</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{totalSize.toFixed(1)} MB</p>
                <p className="text-sm text-gray-600">Total Size</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Download className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{totalDownloads}</p>
                <p className="text-sm text-gray-600">Total Downloads</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Plus className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">5</p>
                <p className="text-sm text-gray-600">This Week</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {subjects.map(subject => (
                  <option key={subject} value={subject}>
                    {subject === 'all' ? 'All Subjects' : subject}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Resource Library</h3>
                <p className="text-indigo-200 text-sm">
                  {filteredResources.length} of {resources.length} resources
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-white/20' : 'bg-white/10 hover:bg-white/15'
                  }`}
                >
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                    <div className="bg-white rounded-sm"></div>
                    <div className="bg-white rounded-sm"></div>
                    <div className="bg-white rounded-sm"></div>
                    <div className="bg-white rounded-sm"></div>
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-white/20' : 'bg-white/10 hover:bg-white/15'
                  }`}
                >
                  <div className="w-4 h-4 flex flex-col gap-0.5">
                    <div className="bg-white h-0.5 rounded-sm"></div>
                    <div className="bg-white h-0.5 rounded-sm"></div>
                    <div className="bg-white h-0.5 rounded-sm"></div>
                  </div>
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {filteredResources.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                <h4 className="text-xl font-medium text-gray-800 mb-2">No Resources Found</h4>
                <p className="text-gray-600 text-sm mb-6">
                  {searchTerm || selectedCategory !== 'all' || selectedSubject !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Upload your first teaching resource to get started'
                  }
                </p>
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto">
                  <Upload className="w-5 h-5" />
                  Upload Resource
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredResources.map((resource) => (
                  <div
                    key={resource.id}
                    className={`border rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${getFileTypeColor(resource.type)} ${
                      viewMode === 'list' ? 'flex items-center p-4' : 'p-6'
                    }`}
                  >
                    {viewMode === 'grid' ? (
                      <>
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {getFileIcon(resource.type)}
                            <div>
                              <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded">
                                {resource.category}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button className="p-1 hover:bg-white/50 rounded transition-colors">
                              <Eye className="w-4 h-4 text-gray-600" />
                            </button>
                            <button className="p-1 hover:bg-white/50 rounded transition-colors">
                              <Edit className="w-4 h-4 text-gray-600" />
                            </button>
                            <button className="p-1 hover:bg-white/50 rounded transition-colors">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </div>
                        </div>
                        <h4 className="font-bold text-gray-800 mb-2 text-lg">{resource.name}</h4>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{resource.description}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                          <span>{resource.subject}</span>
                          <span>{resource.size}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            <p>Uploaded: {new Date(resource.uploadDate).toLocaleDateString()}</p>
                            <p>{resource.downloads} downloads</p>
                          </div>
                          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-4 flex-1">
                          {getFileIcon(resource.type)}
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800 mb-1">{resource.name}</h4>
                            <p className="text-gray-600 text-sm mb-2">{resource.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>{resource.subject}</span>
                              <span>{resource.category}</span>
                              <span>{resource.size}</span>
                              <span>{resource.downloads} downloads</span>
                              <span>Uploaded: {new Date(resource.uploadDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="p-2 hover:bg-white/50 rounded transition-colors">
                            <Eye className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="p-2 hover:bg-white/50 rounded transition-colors">
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <button className="p-2 hover:bg-white/50 rounded transition-colors">
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                          <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;