import React from 'react';
import { ArrowLeft, Clock, Wrench, Star, Calendar } from 'lucide-react';

interface ComingSoonPageProps {
  title: string;
  description: string;
  onBack: () => void;
  icon?: React.ReactNode;
  features?: string[];
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ 
  title, 
  description, 
  onBack, 
  icon,
  features = []
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="bg-gray-100 hover:bg-gray-200 p-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              {icon && <div className="text-blue-600">{icon}</div>}
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                <p className="text-gray-600">{description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Content */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Coming Soon!</h2>
            <p className="text-blue-100 text-lg max-w-2xl mx-auto">
              We're working hard to bring you this amazing feature. Stay tuned for updates!
            </p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Development Status */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <Wrench className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-gray-800">In Development</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Planning & Design</span>
                    <span className="text-green-600 font-medium">✓ Complete</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-700">Development</span>
                    <span className="text-yellow-600 font-medium">🔄 In Progress</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <span className="text-gray-700">Testing</span>
                    <span className="text-gray-500 font-medium">⏳ Pending</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                    <span className="text-gray-700">Launch</span>
                    <span className="text-gray-500 font-medium">⏳ Pending</span>
                  </div>
                </div>
              </div>

              {/* Expected Features */}
              {features.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Star className="w-6 h-6 text-purple-600" />
                    <h3 className="text-xl font-bold text-gray-800">Expected Features</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <Calendar className="w-6 h-6 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-800">Expected Timeline</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-blue-600 mb-2">Phase 1</div>
                  <div className="text-sm text-gray-600">Core Development</div>
                  <div className="text-xs text-gray-500 mt-1">2-3 weeks</div>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-purple-600 mb-2">Phase 2</div>
                  <div className="text-sm text-gray-600">Testing & Refinement</div>
                  <div className="text-xs text-gray-500 mt-1">1-2 weeks</div>
                </div>
                <div className="p-4 bg-white rounded-lg shadow-sm">
                  <div className="text-2xl font-bold text-green-600 mb-2">Launch</div>
                  <div className="text-sm text-gray-600">Feature Release</div>
                  <div className="text-xs text-gray-500 mt-1">Soon!</div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="mt-8 text-center">
              <p className="text-gray-600 mb-4">
                Want to be notified when this feature is ready?
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
                  Get Notified
                </button>
                <button 
                  onClick={onBack}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage;