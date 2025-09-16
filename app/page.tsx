'use client';

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentGradient, setCurrentGradient] = useState(0);

  const gradients = [
    "from-purple-600 via-pink-600 to-blue-600",
    "from-blue-600 via-purple-600 to-pink-600", 
    "from-pink-600 via-blue-600 to-purple-600",
    "from-emerald-600 via-teal-600 to-cyan-600",
    "from-orange-600 via-red-600 to-pink-600"
  ];

  useEffect(() => {
    setIsLoaded(true);
    
    // Change gradient every 3 seconds
    const interval = setInterval(() => {
      setCurrentGradient((prev) => (prev + 1) % gradients.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-black">
      {/* Animated background */}
      <div className="fixed inset-0 z-0">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradients[currentGradient]} opacity-20 transition-all duration-1000`} />
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        {/* Mouse follower */}
        <div
          className="fixed w-96 h-96 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl pointer-events-none transition-all duration-300 ease-out z-0"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            transform: isLoaded ? 'scale(1)' : 'scale(0)',
          }}
        />
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-8">
        {/* Hero section */}
        <div className={`text-center max-w-4xl mx-auto transition-all duration-1000 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}>
          {/* Logo/Brand */}
          <div className="mb-8">
            <div className="inline-block p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <div className="text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                GRW
              </div>
            </div>
          </div>

          {/* Main heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
              Google Reviews
            </span>
            <br />
            <span className={`bg-gradient-to-r ${gradients[currentGradient]} bg-clip-text text-transparent transition-all duration-1000`}>
              Widget
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Beautiful, responsive Google Reviews widget that seamlessly integrates into your website. 
            Showcase customer feedback with style and elegance.
          </p>



        </div>

        {/* Footer */}
        <footer className={`mt-20 text-center ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } transition-opacity duration-1000 delay-1500`}>
          <div className="text-gray-400 mb-4">
            Built with ❤️ using Next.js & Tailwind CSS
          </div>
          <div className="flex justify-center space-x-8 text-sm">
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
              Documentation
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
              GitHub
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
              Support
            </a>
          </div>
      </footer>
      </div>
    </div>
  );
}