"use client";

import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { RiLockLine, RiMailLine, RiLoginBoxLine, RiBankFill, RiShieldCheckLine, RiEyeLine, RiEyeOffLine } from 'react-icons/ri';

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type FormSchema = z.infer<typeof formSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const onSubmit: SubmitHandler<FormSchema> = async (data) => {
    setError(null);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
      } else {
        router.push("/admin/dashboard");
      }
    } catch (error) {
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-900/20 via-transparent to-transparent"></div>
        <div className="absolute top-0 -left-4 w-72 h-72 bg-teal-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-6">
        <div className={`w-full max-w-md transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          {/* Logo/Brand Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-700 rounded-2xl mb-6 shadow-2xl transform hover:scale-105 transition-transform duration-300">
              <RiBankFill className="text-white" size={40} />
            </div>
            <h1 className="text-5xl font-bold text-white mb-3">
              Halifax<span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-teal-600">Bank</span>
            </h1>
            <p className="text-gray-400 text-lg font-medium">Admin Portal</p>
            <div className="flex items-center justify-center mt-3 text-teal-400">
              <RiShieldCheckLine className="mr-2" size={16} />
              <span className="text-sm">Secure Access</span>
            </div>
          </div>
          
          {/* Login Card */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden hover:shadow-teal-500/10 hover:shadow-2xl transition-all duration-500">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-teal-500/20 to-teal-700/20 p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white flex items-center justify-center">
                <RiLoginBoxLine className="mr-3 text-teal-400" size={28} />
                Admin Sign In
              </h2>
              <p className="text-gray-300 text-center mt-2 text-sm">Enter your credentials to access the dashboard</p>
            </div>
            
            <div className="p-8">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl mb-6 text-sm backdrop-blur-sm animate-shake">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                    {error}
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-semibold text-gray-300 block mb-2 flex items-center">
                    <RiMailLine className="mr-2 text-teal-400" size={16} />
                    Email Address
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <RiMailLine className="h-5 w-5 text-gray-400 group-focus-within:text-teal-400 transition-colors" />
                    </div>
                    <input
                      {...register("email")}
                      id="email"
                      type="email"
                      placeholder="admin@halifax.com"
                      className="bg-white/5 border border-gray-600/50 text-white rounded-xl pl-12 pr-4 py-4 w-full focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 focus:bg-white/10 transition-all duration-300 placeholder-gray-500 hover:border-gray-500/70"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-2 flex items-center animate-fadeIn">
                      <span className="w-1 h-1 bg-red-400 rounded-full mr-2"></span>
                      {errors.email.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-semibold text-gray-300 block mb-2 flex items-center">
                    <RiLockLine className="mr-2 text-teal-400" size={16} />
                    Password
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <RiLockLine className="h-5 w-5 text-gray-400 group-focus-within:text-teal-400 transition-colors" />
                    </div>
                    <input
                      {...register("password")}
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      className="bg-white/5 border border-gray-600/50 text-white rounded-xl pl-12 pr-12 py-4 w-full focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 focus:bg-white/10 transition-all duration-300 placeholder-gray-500 hover:border-gray-500/70"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-teal-400 transition-colors"
                    >
                      {showPassword ? <RiEyeOffLine size={20} /> : <RiEyeLine size={20} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-400 text-sm mt-2 flex items-center animate-fadeIn">
                      <span className="w-1 h-1 bg-red-400 rounded-full mr-2"></span>
                      {errors.password.message}
                    </p>
                  )}
                </div>
                
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-teal-500 to-teal-700 text-white font-semibold py-4 px-6 rounded-xl flex items-center justify-center hover:from-teal-600 hover:to-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent focus:ring-teal-500/50 transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-500/25 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none group"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </>
                    ) : (
                      <>
                        <RiLoginBoxLine className="mr-2 group-hover:scale-110 transition-transform" size={20} />
                        Sign in to Dashboard
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
          
          {/* Footer */}
          <div className="mt-8 text-center">
            <div className="text-xs text-gray-500 space-y-1">
              <p className="flex items-center justify-center">
                <RiShieldCheckLine className="mr-1" size={12} />
                © {new Date().getFullYear()} Halifax Banking System
              </p>
              <p>Secure Admin Portal • Protected by SSL</p>
            </div>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
