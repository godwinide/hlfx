
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RiArrowRightLine, RiBankFill } from 'react-icons/ri';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Automatically redirect to admin login after a brief delay
    const redirectTimer = setTimeout(() => {
      router.push('/admin/login');
    }, 3000);

    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="w-full max-w-md text-center">
        {/* Logo/Brand Section */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-4">
            <RiBankFill className="text-teal-500" size={60} />
          </div>
          <h1 className="text-5xl font-bold text-white mb-2">Halifax<span className="text-teal-500">Bank</span></h1>
          <p className="text-gray-400 text-xl">Banking Management System</p>
        </div>
        
        {/* Redirect Message */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 mb-8">
          <p className="text-white text-lg mb-4">Welcome to Halifax Bank Admin Portal</p>
          <p className="text-gray-300">Redirecting you to the login page...</p>
          
          <div className="mt-6 flex justify-center">
            <div className="animate-pulse flex items-center text-teal-500">
              <div className="h-2 w-2 rounded-full bg-teal-500 mr-1"></div>
              <div className="h-2 w-2 rounded-full bg-teal-500 mr-1"></div>
              <div className="h-2 w-2 rounded-full bg-teal-500"></div>
            </div>
          </div>
        </div>
        
        {/* Manual Navigation Button */}
        <button 
          onClick={() => router.push('/admin/login')} 
          className="bg-gradient-to-r from-teal-500 to-teal-700 text-white font-medium py-3 px-6 rounded-lg inline-flex items-center hover:from-teal-600 hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-teal-500 transition-all"
        >
          Go to Login
          <RiArrowRightLine className="ml-2" size={18} />
        </button>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Halifax Banking System</p>
          <p className="mt-1">Secure Admin Portal</p>
        </div>
      </div>
    </div>
  );
}