"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/userStore';
import { ArrowRight, Users, Zap, Sparkles, MousePointer, Shapes, LayoutDashboard, Palette } from 'lucide-react';
import axios from 'axios';

export default function Home() {
  const router = useRouter();
  const { currentUser, isLoading, fetchUser } = useUserStore();
  const [isHovered, setIsHovered] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
    axios.get('http://localhost:5000/')
      .then((response) => {
        console.log(response.data);
      });
  }, [fetchUser]);

  const handleDashboardRedirect = () => {
    router.push('/dashboard');
  };

  const features = [
    {
      icon: <Palette className="w-8 h-8" />,
      title: "Infinite Canvas",
      description: "Create without boundaries on an infinite collaborative canvas"
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Real-time Collaboration",
      description: "Work together seamlessly with live cursor tracking and instant updates"
    },
    {
      icon: <Shapes className="w-8 h-8" />,
      title: "Rich Drawing Tools",
      description: "Express your ideas with shapes, text, and freehand drawing tools"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast",
      description: "Built with modern web technologies for smooth performance"
    }
  ];

  const demoShapes = [
    { id: 1, type: 'rect', x: 50, y: 50, width: 100, height: 60, fill: '#3B82F6' },
    { id: 2, type: 'circle', x: 200, y: 80, radius: 40, fill: '#EF4444' },
    { id: 3, type: 'polygon', x: 320, y: 70, radius: 35, sides: 6, fill: '#10B981' }
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-red-700">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-80 h-80 rounded-full bg-red-500/20 blur-3xl animate-pulse"></div>
          <div className="absolute top-80 -left-32 w-80 h-80 rounded-full bg-gray-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <Sparkles className="w-16 h-16 text-red-400 animate-bounce" />
                <div className="absolute inset-0 w-16 h-16 bg-red-400/20 rounded-full blur-xl animate-ping"></div>
              </div>
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-bold bg-gradient-to-r from-white via-gray-200 to-red-200 bg-clip-text text-transparent mb-6">
              IntelliSpace Canvas
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Where ideas come to life through collaborative visual thinking. Create, share, and innovate together in real-time.
            </p>

            {/* Dashboard Button for Logged In Users */}
            {currentUser && !isLoading && (
              <div className="mb-12">
                <button
                  onClick={handleDashboardRedirect}
                  className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-black via-gray-800 to-red-700 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-2xl hover:shadow-red-500/25 transform hover:scale-105 transition-all duration-300"
                >
                  <LayoutDashboard className="w-6 h-6" />
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-600 to-black opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></div>
                </button>
              </div>
            )}

            {/* Interactive Demo Canvas */}
            <div className="mb-16">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mx-auto max-w-2xl border border-white/20">
                <h3 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
                  <MousePointer className="w-5 h-5 text-red-400" />
                  Interactive Preview
                </h3>
                <div className="relative bg-white rounded-xl h-48 overflow-hidden">
                  <svg viewBox="0 0 400 200" className="w-full h-full">
                    {demoShapes.map((shape) => (
                      <g key={shape.id}>
                        {shape.type === 'rect' && (
                          <rect
                            x={shape.x}
                            y={shape.y}
                            width={shape.width}
                            height={shape.height}
                            fill={shape.fill}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            onMouseEnter={() => setIsHovered(`shape-${shape.id}`)}
                            onMouseLeave={() => setIsHovered(null)}
                            style={{
                              transform: isHovered === `shape-${shape.id}` ? 'scale(1.1)' : 'scale(1)',
                              transformOrigin: 'center',
                              transition: 'transform 0.3s ease'
                            }}
                          />
                        )}
                        {shape.type === 'circle' && 'radius' in shape && (
                          <circle
                            cx={shape.x}
                            cy={shape.y}
                            r={shape.radius as number}
                            fill={shape.fill}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            onMouseEnter={() => setIsHovered(`shape-${shape.id}`)}
                            onMouseLeave={() => setIsHovered(null)}
                            style={{
                              transform: isHovered === `shape-${shape.id}` ? 'scale(1.1)' : 'scale(1)',
                              transformOrigin: 'center',
                              transition: 'transform 0.3s ease'
                            }}
                          />
                        )}
                        {shape.type === 'polygon' && 'sides' in shape && 'radius' in shape && (
                          <polygon
                            points={Array.from({ length: shape.sides as number }, (_, i) => {
                              const sides = shape.sides as number;
                              const radius = shape.radius as number;
                              const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
                              const x = shape.x + radius * Math.cos(angle);
                              const y = shape.y + radius * Math.sin(angle);
                              return `${x},${y}`;
                            }).join(' ')}
                            fill={shape.fill}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            onMouseEnter={() => setIsHovered(`shape-${shape.id}`)}
                            onMouseLeave={() => setIsHovered(null)}
                            style={{
                              transform: isHovered === `shape-${shape.id}` ? 'scale(1.1)' : 'scale(1)',
                              transformOrigin: 'center',
                              transition: 'transform 0.3s ease'
                            }}
                          />
                        )}
                      </g>
                    ))}
                    <text x="50" y="140" fill="#374151" fontSize="14" fontWeight="500">
                      Hover over shapes to interact!
                    </text>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Powerful Features for Creative Minds
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Everything you need to bring your visual ideas to life and collaborate effectively
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:border-red-500/50 transform hover:scale-105 transition-all duration-300 hover:shadow-2xl hover:shadow-red-500/20"
              onMouseEnter={() => setIsHovered(`feature-${index}`)}
              onMouseLeave={() => setIsHovered(null)}
            >
              <div className={`text-red-400 mb-4 transform transition-all duration-300 ${
                isHovered === `feature-${index}` ? 'scale-110 text-red-300' : ''
              }`}>
                {feature.icon}
              </div>
              <h3 className="text-white font-semibold text-lg mb-2 group-hover:text-red-200 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-red-600/20 to-black/20 rounded-3xl p-12 text-center border border-red-500/20 backdrop-blur-sm">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Start Creating?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of creators, designers, and teams who use IntelliSpace Canvas to bring their ideas to life.
          </p>
          
          {!currentUser && !isLoading && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => router.push('/signup')}
                className="bg-gradient-to-r from-black via-gray-800 to-red-700 text-white px-8 py-3 rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Get Started Free
              </button>
              <button 
                onClick={() => router.push('/login')}
                className="border border-white/30 text-white px-8 py-3 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300"
              >
                Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
