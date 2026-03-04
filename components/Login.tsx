
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { PenTool, Lock, Mail, Loader2, ArrowRight, UserPlus, LogIn, User } from 'lucide-react';

export const Login = () => {
  const { login, register } = useAuth();
  const { updateSettings } = useSettings();
  const [isRegistering, setIsRegistering] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError("Please fill in required fields");
      return;
    }

    if (isRegistering) {
        if(!name) {
            setError("Please enter your name");
            return;
        }
    }
    
    setIsLoading(true);
    
    try {
      if (isRegistering) {
        await register(email, password, name);
      } else {
        await login(email, password);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setPassword('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900 p-4 font-sans">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-300">
        
        {/* Header */}
        <div className="bg-brand-600 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="p-3 bg-white/20 rounded-xl mb-4 backdrop-blur-sm shadow-lg">
              <PenTool className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">PRIVATEPEN PRO</h1>
            <p className="text-brand-100 text-sm mt-2 font-medium">
              {isRegistering ? "Create your account" : "Welcome back"}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 text-sm rounded-lg flex items-center justify-center font-medium animate-in fade-in slide-in-from-top-2">
                {error}
              </div>
            )}
            
            {isRegistering && (
              <div className="animate-in slide-in-from-left-4 fade-in duration-300 space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Full Name</label>
                    <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                        placeholder="John Doe"
                    />
                    </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-lg shadow-brand-500/30 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{isRegistering ? "Create Account" : "Sign In"}</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
            
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isRegistering ? "Already have an account?" : "Don't have an account?"}
              </p>
              <button
                type="button"
                onClick={toggleMode}
                className="mt-1 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 hover:underline transition-all flex items-center justify-center w-full gap-1"
              >
                {isRegistering ? (
                  <><LogIn size={14} /> Sign In instead</>
                ) : (
                  <><UserPlus size={14} /> Create a new account</>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
