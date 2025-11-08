'use client';

/**
 * WorkZen HRMS - Login Page
 * 
 * DEFAULT CREDENTIALS:
 * 
 * ADMIN:
 * Email: adminworkzen@gmail.com
 * Password: admin@1234
 * 
 * HR MANAGER:
 * Email: hrworkzen@gmail.com
 * Password: hr@1234
 * 
 * PAYROLL OFFICER:
 * Email: payrollworkzen@gmail.com
 * Password: payroll@1234
 * 
 * EMPLOYEE:
 * Email: employeeworkzen@gmail.com
 * Password: employee@1234
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, LogIn, Mail, Lock, Loader2, Eye, EyeOff, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (role: string) => {
    const credentials: any = {
      admin: { email: 'adminworkzen@gmail.com', password: 'admin@1234' },
      hr: { email: 'hrworkzen@gmail.com', password: 'hr@1234' },
      payroll: { email: 'payrollworkzen@gmail.com', password: 'payroll@1234' },
      employee: { email: 'employeeworkzen@gmail.com', password: 'employee@1234' },
    };
    setEmail(credentials[role].email);
    setPassword(credentials[role].password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-0 left-0 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -180, 0],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-6xl w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden lg:block text-white"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="flex items-center space-x-4 mb-8"
            >
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-4 rounded-2xl shadow-2xl">
                <Building2 className="h-12 w-12" />
              </div>
              <div>
                <h1 className="text-4xl font-black">WorkZen</h1>
                <p className="text-blue-200">Enterprise HRMS</p>
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-5xl font-black mb-6 leading-tight"
            >
              Manage Your
              <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Workforce Effortlessly
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-lg text-blue-100 mb-8 leading-relaxed"
            >
              Enterprise-grade HR management with intelligent automation, 
              real-time analytics, and seamless integration.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="space-y-4"
            >
              {['Employee Management', 'Attendance Tracking', 'Leave Management', 'Payroll Automation'].map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1 + idx * 0.1 }}
                  className="flex items-center space-x-3"
                >
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-blue-50">{feature}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Side - Login Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="glass backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
              {/* Back Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 text-white/70 hover:text-white mb-6 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </motion.button>

              {/* Header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.2 }}
                  className="lg:hidden flex justify-center mb-4">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-3 rounded-2xl">
                    <Building2 className="h-10 w-10 text-white" />
                  </div>
                </motion.div>
                <h2 className="text-3xl font-black text-white mb-2 drop-shadow-lg">Welcome Back</h2>
                <p className="text-blue-100 font-medium">Sign in to access your dashboard</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2 drop-shadow">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-white/95 border-2 border-blue-300/50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium shadow-lg"
                      placeholder="you@company.com"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-bold text-white mb-2 drop-shadow">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-blue-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-12 py-4 bg-white/95 border-2 border-blue-300/50 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium shadow-lg"
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-600 hover:text-blue-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Error/Success Message */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center space-x-2 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl backdrop-blur-sm"
                    >
                      <AlertCircle className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm">{error}</span>
                    </motion.div>
                  )}
                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center space-x-2 bg-green-500/20 border border-green-500/50 text-green-200 px-4 py-3 rounded-xl backdrop-blur-sm"
                    >
                      <CheckCircle className="h-5 w-5 flex-shrink-0" />
                      <span className="text-sm">Login successful! Redirecting...</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: loading ? 1 : 1.02 }}
                  whileTap={{ scale: loading ? 1 : 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all transform disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="h-5 w-5" />
                      <span>Sign In</span>
                    </>
                  )}
                </motion.button>

                {/* Forgot Password Link */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => router.push('/forgot-password')}
                    className="text-blue-200 hover:text-white text-sm transition-colors underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              </form>

              {/* Quick Login */}
              <div className="mt-8 pt-6 border-t border-white/20">
                <p className="text-sm text-white font-bold text-center mb-4 drop-shadow">Quick Login (Demo)</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { role: 'admin', label: 'Admin', gradient: 'from-red-500 to-red-600' },
                    { role: 'hr', label: 'HR Manager', gradient: 'from-blue-500 to-blue-600' },
                    { role: 'payroll', label: 'Payroll Officer', gradient: 'from-green-500 to-green-600' },
                    { role: 'employee', label: 'Employee', gradient: 'from-purple-500 to-purple-600' },
                  ].map((item) => (
                    <motion.button
                      key={item.role}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => quickLogin(item.role)}
                      className={`bg-gradient-to-r ${item.gradient} hover:opacity-90 text-white text-sm font-bold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl`}
                    >
                      {item.label}
                    </motion.button>
                  ))}
                </div>
                <p className="text-xs text-blue-100 text-center mt-4 font-medium">
                  Click to auto-fill credentials
                </p>
              </div>

              {/* Credentials Display */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/20 rounded-xl backdrop-blur-sm"
              >
                <p className="text-xs text-white/80 font-bold mb-2 text-center">📝 Test Credentials (All passwords: admin@1234, hr@1234, etc.)</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-white/70">
                    <span className="font-bold text-red-300">Admin:</span> adminworkzen@gmail.com
                  </div>
                  <div className="text-white/70">
                    <span className="font-bold text-blue-300">HR:</span> hrworkzen@gmail.com
                  </div>
                  <div className="text-white/70">
                    <span className="font-bold text-green-300">Payroll:</span> payrollworkzen@gmail.com
                  </div>
                  <div className="text-white/70">
                    <span className="font-bold text-purple-300">Employee:</span> employeeworkzen@gmail.com
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
