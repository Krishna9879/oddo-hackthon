'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  DollarSign, Users, TrendingUp, Calculator, FileText, Bell, LogOut,
  Download, CheckCircle, Clock, CreditCard, BarChart3
} from 'lucide-react';

export default function PayrollDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPayroll: 10850000,
    employees: 145,
    avgSalary: 74827,
    pendingPayroll: 12,
    processed: 133,
    totalDeductions: 1250000,
    netPayable: 9600000,
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [recentPayrolls, setRecentPayrolls] = useState<any[]>([]);
  const [pendingProcessing, setPendingProcessing] = useState<any[]>([]);

  useEffect(() => {
    const init = async () => {
      const userData = localStorage.getItem('user');
      if (!userData) {
        router.push('/login');
        return;
      }

      setUser(JSON.parse(userData));

      // Static demo data until backend endpoints are available
      setRecentPayrolls([
        { employee: 'John Doe', code: 'EMP001', basicSalary: 50000, allowances: 10000, deductions: 5000, netSalary: 55000, status: 'Paid' },
        { employee: 'Jane Smith', code: 'EMP002', basicSalary: 60000, allowances: 12000, deductions: 6000, netSalary: 66000, status: 'Paid' },
        { employee: 'Mike Johnson', code: 'EMP003', basicSalary: 55000, allowances: 11000, deductions: 5500, netSalary: 60500, status: 'Paid' },
      ]);

      setPendingProcessing([
        { employee: 'Sarah Williams', code: 'EMP146', department: 'IT', workingDays: 22, presentDays: 22 },
        { employee: 'Robert Brown', code: 'EMP147', department: 'Finance', workingDays: 22, presentDays: 21 },
      ]);

      const token = localStorage.getItem('token');
      if (token) {
        try {
          const notifRes = await fetch('/api/notifications', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          if (notifRes.ok) {
            const notifData = await notifRes.json();
            setNotifications(notifData);
          }
        } catch (error) {
          console.error('Failed to fetch notifications:', error);
        }
      }

      setLoading(false);
    };

    init();
  }, [router]);

  const markNotificationsAsRead = async () => {
    const unread = notifications.some((notification) => !notification.is_read);
    if (!unread) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return;
    }

    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ markAllRead: true }),
      });

      setNotifications((prev) => prev.map((notification) => ({
        ...notification,
        is_read: true,
      })));
    } catch (error) {
      console.error('Failed to mark notifications as read:', error);
    }
  };

  const handleNotificationToggle = async () => {
    const next = !showNotifications;
    setShowNotifications(next);
    if (next) {
      await markNotificationsAsRead();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30">
      {/* Top Bar */}
      <header className="glass sticky top-0 z-40 border-b border-white/20 backdrop-blur-xl">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black gradient-text">Payroll Dashboard</h1>
            <p className="text-sm text-slate-600">Salary Processing & Management</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleNotificationToggle}
                className="relative p-2 glass rounded-xl hover:bg-white/50 transition-colors"
              >
                <Bell className="h-5 w-5 text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </motion.button>
              {showNotifications && (
                <div className="absolute right-0 mt-3 w-72 glass rounded-2xl shadow-xl border border-white/40 max-h-80 overflow-y-auto z-50">
                  <div className="p-4 flex items-center justify-between border-b border-white/30">
                    <h4 className="text-sm font-semibold text-slate-800">Notifications</h4>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-xs text-slate-500 hover:text-slate-700"
                    >
                      Close
                    </button>
                  </div>
                  <div className="p-3 space-y-3">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center">No notifications yet.</p>
                    ) : (
                      notifications.map((notification) => (
                        <div key={notification.id} className="p-3 rounded-xl bg-white/60">
                          <p className="text-xs font-semibold text-slate-700">{notification.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{notification.message}</p>
                          <p className="text-[10px] text-slate-400 mt-2">
                            {notification.created_at ? new Date(notification.created_at).toLocaleString() : ''}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl font-semibold flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </motion.button>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-7xl mx-auto">
        {/* Main Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card mb-6 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl" />
          <div className="relative grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-3 shadow-lg">
                <DollarSign className="h-8 w-8" />
              </div>
              <p className="text-4xl font-black gradient-text mb-1">₹{(stats.totalPayroll / 1000000).toFixed(2)}M</p>
              <p className="text-sm text-slate-600 font-semibold">Total Monthly Payroll</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-3 shadow-lg">
                <Users className="h-8 w-8" />
              </div>
              <p className="text-4xl font-black text-slate-900 mb-1">{stats.employees}</p>
              <p className="text-sm text-slate-600 font-semibold">Total Employees</p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-3 shadow-lg">
                <TrendingUp className="h-8 w-8" />
              </div>
              <p className="text-4xl font-black text-slate-900 mb-1">₹{Math.round(stats.avgSalary).toLocaleString()}</p>
              <p className="text-sm text-slate-600 font-semibold">Average Salary</p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <StatCard
            icon={<CheckCircle className="h-6 w-6" />}
            label="Processed"
            value={stats.processed}
            color="from-green-500 to-green-600"
          />
          <StatCard
            icon={<Clock className="h-6 w-6" />}
            label="Pending"
            value={stats.pendingPayroll}
            color="from-orange-500 to-orange-600"
          />
          <StatCard
            icon={<Calculator className="h-6 w-6" />}
            label="Total Deductions"
            value={`₹${(stats.totalDeductions / 1000000).toFixed(2)}M`}
            color="from-red-500 to-red-600"
          />
          <StatCard
            icon={<CreditCard className="h-6 w-6" />}
            label="Net Payable"
            value={`₹${(stats.netPayable / 1000000).toFixed(2)}M`}
            color="from-blue-500 to-blue-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <QuickAction
            icon={<Calculator className="h-5 w-5" />}
            label="Generate Payroll"
            onClick={() => router.push('/payroll')}
            color="from-green-500 to-green-600"
          />
          <QuickAction
            icon={<FileText className="h-5 w-5" />}
            label="View Reports"
            onClick={() => {}}
            color="from-blue-500 to-blue-600"
          />
          <QuickAction
            icon={<Download className="h-5 w-5" />}
            label="Export Data"
            onClick={() => {}}
            color="from-purple-500 to-purple-600"
          />
          <QuickAction
            icon={<BarChart3 className="h-5 w-5" />}
            label="Analytics"
            onClick={() => {}}
            color="from-orange-500 to-orange-600"
          />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Recent Payroll Processing */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="premium-card"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span>Recent Payroll (Processed)</span>
            </h3>
            <div className="space-y-3">
              {recentPayrolls.map((payroll, idx) => (
                <div key={idx} className="p-4 glass rounded-xl hover:bg-white/80 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-slate-900">{payroll.employee}</p>
                      <p className="text-sm text-slate-600">{payroll.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black gradient-text">₹{payroll.netSalary.toLocaleString()}</p>
                      <span className="badge badge-success text-xs">{payroll.status}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-slate-500">Basic</p>
                      <p className="font-semibold">₹{payroll.basicSalary.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Allowances</p>
                      <p className="font-semibold text-green-600">+₹{payroll.allowances.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Deductions</p>
                      <p className="font-semibold text-red-600">-₹{payroll.deductions.toLocaleString()}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full mt-3 glass px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-white"
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-sm font-semibold">Download Payslip</span>
                  </motion.button>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Pending Processing */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="premium-card"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <span>Pending Processing</span>
              </h3>
              <span className="badge badge-warning">{pendingProcessing.length}</span>
            </div>
            <div className="space-y-3">
              {pendingProcessing.map((emp, idx) => (
                <div key={idx} className="p-4 glass rounded-xl hover:bg-white/80 transition-all">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-bold text-slate-900">{emp.employee}</p>
                      <p className="text-sm text-slate-600">{emp.code} • {emp.department}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <p className="text-slate-500">Working Days</p>
                      <p className="font-semibold text-slate-900">{emp.workingDays}</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Present Days</p>
                      <p className="font-semibold text-green-600">{emp.presentDays}</p>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center justify-center space-x-2"
                  >
                    <Calculator className="h-4 w-4" />
                    <span>Process Payroll</span>
                  </motion.button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Department-wise Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card mt-6"
        >
          <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <span>Department-wise Payroll Breakdown</span>
          </h3>
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { dept: 'IT', amount: 3375000, employees: 45, color: 'from-blue-500 to-blue-600' },
              { dept: 'Finance', amount: 2240000, employees: 28, color: 'from-green-500 to-green-600' },
              { dept: 'Sales', amount: 2625000, employees: 35, color: 'from-purple-500 to-purple-600' },
              { dept: 'Operations', amount: 1650000, employees: 22, color: 'from-orange-500 to-orange-600' },
              { dept: 'HR', amount: 960000, employees: 15, color: 'from-pink-500 to-pink-600' },
            ].map((dept, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="premium-card"
              >
                <div className={`bg-gradient-to-br ${dept.color} w-10 h-10 rounded-xl flex items-center justify-center text-white mb-3`}>
                  <DollarSign className="h-5 w-5" />
                </div>
                <p className="text-sm text-slate-600 font-semibold mb-1">{dept.dept}</p>
                <p className="text-xl font-black text-slate-900 mb-1">₹{(dept.amount / 1000).toFixed(0)}K</p>
                <p className="text-xs text-slate-500">{dept.employees} employees</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Salary Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="premium-card mt-6"
        >
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            <span>Salary Distribution by Range</span>
          </h3>
          <div className="space-y-4">
            {[
              { range: '< ₹50K', count: 28, percentage: 19, color: 'from-blue-400 to-blue-500' },
              { range: '₹50K - ₹75K', count: 52, percentage: 36, color: 'from-purple-400 to-purple-500' },
              { range: '₹75K - ₹1L', count: 41, percentage: 28, color: 'from-pink-400 to-pink-500' },
              { range: '₹1L - ₹1.5L', count: 18, percentage: 12, color: 'from-orange-400 to-orange-500' },
              { range: '> ₹1.5L', count: 6, percentage: 5, color: 'from-green-400 to-green-500' },
            ].map((item, idx) => (
              <motion.div
                key={item.range}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700 w-32">{item.range}</span>
                  <div className="flex-1 mx-4">
                    <div className="relative h-10 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ duration: 1, delay: idx * 0.1 }}
                        className={`h-full bg-gradient-to-r ${item.color} flex items-center justify-end pr-3`}
                      >
                        <span className="text-xs font-bold text-white drop-shadow-lg">{item.percentage}%</span>
                      </motion.div>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-slate-900 w-20 text-right">{item.count} emp</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Monthly Payroll Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="premium-card mt-6"
        >
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <span>Payroll Trend - Last 6 Months</span>
          </h3>
          <div className="flex items-end justify-between space-x-2 h-64">
            {[
              { month: 'Jul', amount: 9800000 },
              { month: 'Aug', amount: 10200000 },
              { month: 'Sep', amount: 10500000 },
              { month: 'Oct', amount: 10300000 },
              { month: 'Nov', amount: 10700000 },
              { month: 'Dec', amount: 10850000 },
            ].map((data, idx) => {
              const maxAmount = 11000000;
              const heightPercentage = (data.amount / maxAmount) * 100;
              return (
                <div key={data.month} className="flex-1 flex flex-col items-center space-y-2">
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: `${heightPercentage}%`, opacity: 1 }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className="w-full bg-gradient-to-t from-green-700 via-green-500 to-green-400 rounded-t-xl relative group cursor-pointer hover:from-green-800 hover:via-green-600 hover:to-green-500 transition-all shadow-lg"
                  >
                    <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap font-bold shadow-xl">
                      ₹{(data.amount / 100000).toFixed(1)}L
                    </div>
                  </motion.div>
                  <span className="text-sm font-bold text-slate-600">{data.month}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div className="glass p-4 rounded-xl text-center">
              <p className="text-xs text-slate-600 mb-1">Average</p>
              <p className="text-2xl font-black text-slate-900">₹10.3M</p>
            </div>
            <div className="glass p-4 rounded-xl text-center">
              <p className="text-xs text-slate-600 mb-1">Growth</p>
              <p className="text-2xl font-black text-green-600">+10.7%</p>
            </div>
            <div className="glass p-4 rounded-xl text-center">
              <p className="text-xs text-slate-600 mb-1">Highest</p>
              <p className="text-2xl font-black text-slate-900">₹10.85M</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: any) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="premium-card relative overflow-hidden"
    >
      <div className={`bg-gradient-to-br ${color} w-12 h-12 rounded-xl flex items-center justify-center text-white mb-3 shadow-lg`}>
        {icon}
      </div>
      <p className="text-sm text-slate-600 font-semibold mb-1">{label}</p>
      <p className="text-2xl font-black text-slate-900">{value}</p>
    </motion.div>
  );
}

function QuickAction({ icon, label, onClick, color }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="premium-card flex items-center space-x-3 p-4 hover:shadow-xl transition-all group"
    >
      <div className={`bg-gradient-to-br ${color} p-3 rounded-xl text-white group-hover:scale-110 transition-transform shadow-lg`}>
        {icon}
      </div>
      <span className="font-semibold text-slate-900">{label}</span>
    </motion.button>
  );
}
