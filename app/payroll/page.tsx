'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, Plus, Search, Filter, Download, Eye, Calculator,
  ArrowLeft, User, Calendar, TrendingUp, CreditCard, FileText, Clock
} from 'lucide-react';

export default function PayrollPage() {
  const router = useRouter();
  const [payrolls, setPayrolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [showModal, setShowModal] = useState(false);
  const [selectedPayroll, setSelectedPayroll] = useState<any>(null);

  useEffect(() => {
    fetchPayrolls();
  }, [selectedMonth]);

  const fetchPayrolls = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`/api/payroll?month=${selectedMonth}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPayrolls(data);
      }
    } catch (error) {
      console.error('Failed to fetch payrolls:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayroll = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('/api/payroll/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ month: selectedMonth }),
      });

      if (response.ok) {
        fetchPayrolls();
      }
    } catch (error) {
      console.error('Failed to generate payroll:', error);
    }
  };

  const filteredPayrolls = payrolls.filter(payroll =>
    payroll.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payroll.employee_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalPayroll: payrolls.reduce((sum, p) => sum + parseFloat(p.net_salary || 0), 0),
    employees: payrolls.length,
    avgSalary: payrolls.length > 0 
      ? payrolls.reduce((sum, p) => sum + parseFloat(p.net_salary || 0), 0) / payrolls.length 
      : 0,
    totalDeductions: payrolls.reduce((sum, p) => sum + parseFloat(p.total_deductions || 0), 0),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <button
              onClick={() => router.push('/dashboard')}
              className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 mb-2 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </button>
            <h1 className="text-4xl font-black gradient-text">Payroll Management</h1>
            <p className="text-slate-600 mt-2">Automated salary processing & payslips</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGeneratePayroll}
            className="btn-primary flex items-center space-x-2"
          >
            <Calculator className="h-5 w-5" />
            <span>Generate Payroll</span>
          </motion.button>
        </motion.div>
      </div>

      {/* Statistics Dashboard */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<DollarSign className="h-6 w-6" />}
            label="Total Payroll"
            value={`₹${stats.totalPayroll.toLocaleString()}`}
            color="from-green-500 to-green-600"
            subtitle="This month"
          />
          <StatCard
            icon={<User className="h-6 w-6" />}
            label="Employees Paid"
            value={stats.employees}
            color="from-blue-500 to-blue-600"
            subtitle={`${stats.employees} payslips`}
          />
          <StatCard
            icon={<TrendingUp className="h-6 w-6" />}
            label="Avg Salary"
            value={`₹${Math.round(stats.avgSalary).toLocaleString()}`}
            color="from-purple-500 to-purple-600"
            subtitle="Per employee"
          />
          <StatCard
            icon={<Calculator className="h-6 w-6" />}
            label="Total Deductions"
            value={`₹${Math.round(stats.totalDeductions).toLocaleString()}`}
            color="from-orange-500 to-orange-600"
            subtitle="Tax + Other"
          />
        </div>
      </div>

      {/* Payroll Breakdown */}
      <div className="max-w-7xl mx-auto mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="premium-card relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center space-x-3">
              <CreditCard className="h-6 w-6 text-green-600" />
              <span>Payroll Breakdown</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center p-6 glass rounded-2xl">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
                  <DollarSign className="h-8 w-8" />
                </div>
                <p className="text-3xl font-black gradient-text mb-2">
                  ₹{(stats.totalPayroll - stats.totalDeductions).toLocaleString()}
                </p>
                <p className="text-sm text-slate-600 font-semibold">Gross Salary</p>
              </div>
              <div className="text-center p-6 glass rounded-2xl">
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
                  <Calculator className="h-8 w-8" />
                </div>
                <p className="text-3xl font-black text-slate-900 mb-2">
                  ₹{Math.round(stats.totalDeductions).toLocaleString()}
                </p>
                <p className="text-sm text-slate-600 font-semibold">Deductions</p>
              </div>
              <div className="text-center p-6 glass rounded-2xl">
                <div className="bg-gradient-to-br from-green-500 to-green-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
                  <TrendingUp className="h-8 w-8" />
                </div>
                <p className="text-3xl font-black text-slate-900 mb-2">
                  ₹{stats.totalPayroll.toLocaleString()}
                </p>
                <p className="text-sm text-slate-600 font-semibold">Net Payable</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search & Filter */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="premium-card flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-premium pl-12"
            />
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="input-premium pl-10 pr-4"
              />
            </div>
            <button className="glass px-4 py-2 rounded-xl flex items-center space-x-2 hover:bg-white/80">
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Payroll List */}
      <div className="max-w-7xl mx-auto">
        <div className="premium-card">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton h-24 rounded-lg" />
              ))}
            </div>
          ) : filteredPayrolls.length > 0 ? (
            <div className="space-y-4">
              {filteredPayrolls.map((payroll, idx) => (
                <motion.div
                  key={payroll.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ x: 5, backgroundColor: 'rgba(59, 130, 246, 0.03)' }}
                  className="glass p-6 rounded-2xl border border-white/20 hover:border-blue-200 transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedPayroll(payroll);
                    setShowModal(true);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-4 rounded-xl">
                        <User className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-bold text-slate-900">{payroll.employee_name}</h3>
                          <span className="badge badge-info">{payroll.employee_code}</span>
                        </div>
                        <div className="grid md:grid-cols-5 gap-4">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4 text-blue-500" />
                            <div>
                              <p className="text-xs text-slate-500">Basic</p>
                              <p className="font-semibold text-slate-900">₹{parseFloat(payroll.basic_salary || 0).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <div>
                              <p className="text-xs text-slate-500">Allowances</p>
                              <p className="font-semibold text-slate-900">₹{parseFloat(payroll.total_allowances || 0).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calculator className="h-4 w-4 text-orange-500" />
                            <div>
                              <p className="text-xs text-slate-500">Deductions</p>
                              <p className="font-semibold text-slate-900">₹{parseFloat(payroll.total_deductions || 0).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-purple-500" />
                            <div>
                              <p className="text-xs text-slate-500">Days</p>
                              <p className="font-semibold text-slate-900">{payroll.working_days || 0} / {payroll.total_days || 30}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CreditCard className="h-4 w-4 text-green-500" />
                            <div>
                              <p className="text-xs text-slate-500">Net Salary</p>
                              <p className="font-bold text-green-600">₹{parseFloat(payroll.net_salary || 0).toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-3 rounded-xl shadow-lg ml-4"
                    >
                      <Eye className="h-5 w-5" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Payroll Records</h3>
              <p className="text-slate-600 mb-4">Generate payroll for the selected month</p>
              <button
                onClick={handleGeneratePayroll}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Calculator className="h-4 w-4" />
                <span>Generate Now</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Payslip Modal */}
      <AnimatePresence>
        {showModal && selectedPayroll && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="glass backdrop-blur-xl rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Payslip Header */}
              <div className="text-center mb-8 pb-6 border-b-2 border-gradient">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                  <h2 className="text-4xl font-black text-transparent">PAYSLIP</h2>
                </div>
                <p className="text-slate-600 mt-2">
                  {new Date(selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>

              {/* Employee Details */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="glass p-4 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">Employee Name</p>
                  <p className="font-bold text-slate-900">{selectedPayroll.employee_name}</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">Employee Code</p>
                  <p className="font-bold text-slate-900">{selectedPayroll.employee_code}</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">Department</p>
                  <p className="font-bold text-slate-900">{selectedPayroll.department || 'N/A'}</p>
                </div>
                <div className="glass p-4 rounded-xl">
                  <p className="text-xs text-slate-500 mb-1">Working Days</p>
                  <p className="font-bold text-slate-900">{selectedPayroll.working_days || 0} / {selectedPayroll.total_days || 30}</p>
                </div>
              </div>

              {/* Earnings */}
              <div className="glass p-6 rounded-2xl mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Earnings</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Basic Salary</span>
                    <span className="font-bold">₹{parseFloat(selectedPayroll.basic_salary || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Allowances</span>
                    <span className="font-bold">₹{parseFloat(selectedPayroll.total_allowances || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t-2 border-dashed">
                    <span className="font-bold text-slate-900">Gross Salary</span>
                    <span className="font-bold text-green-600">
                      ₹{(parseFloat(selectedPayroll.basic_salary || 0) + parseFloat(selectedPayroll.total_allowances || 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="glass p-6 rounded-2xl mb-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
                  <Calculator className="h-5 w-5 text-orange-600" />
                  <span>Deductions</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Tax</span>
                    <span className="font-bold">₹{parseFloat(selectedPayroll.tax || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Other Deductions</span>
                    <span className="font-bold">₹{(parseFloat(selectedPayroll.total_deductions || 0) - parseFloat(selectedPayroll.tax || 0)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t-2 border-dashed">
                    <span className="font-bold text-slate-900">Total Deductions</span>
                    <span className="font-bold text-orange-600">₹{parseFloat(selectedPayroll.total_deductions || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Net Salary */}
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 rounded-2xl mb-6 text-white shadow-2xl">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-green-100 text-sm mb-1">Net Salary</p>
                    <p className="text-4xl font-black">₹{parseFloat(selectedPayroll.net_salary || 0).toLocaleString()}</p>
                  </div>
                  <CreditCard className="h-16 w-16 text-white/30" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 glass px-6 py-3 rounded-xl font-semibold hover:bg-white/80 transition-colors"
                >
                  Close
                </button>
                <button className="flex-1 btn-primary flex items-center justify-center space-x-2">
                  <Download className="h-4 w-4" />
                  <span>Download PDF</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, label, value, color, subtitle }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
      className="premium-card relative overflow-hidden"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`bg-gradient-to-br ${color} p-3 rounded-xl text-white shadow-lg`}>
          {icon}
        </div>
      </div>
      <p className="text-sm text-slate-600 font-semibold mb-2">{label}</p>
      <p className="text-3xl font-black text-slate-900 mb-1">{value}</p>
      <p className="text-xs text-slate-500">{subtitle}</p>
      <motion.div
        className={`absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br ${color} opacity-10 rounded-full blur-2xl`}
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </motion.div>
  );
}
