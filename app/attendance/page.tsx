'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Clock, CheckCircle, XCircle, Calendar, Download, ArrowLeft,
  MapPin, Activity, Power, PowerOff, Loader, ArrowRight
} from 'lucide-react';

export default function AttendancePage() {
  const router = useRouter();
  const [attendance, setAttendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayAttendance, setTodayAttendance] = useState<any>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      // Fetch today's attendance
      const todayRes = await fetch('/api/attendance/today', {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (todayRes.ok) {
        const todayData = await todayRes.json();
        setTodayAttendance(todayData);
      }

      // Fetch attendance records
      const attendanceRes = await fetch(`/api/attendance?date=${selectedDate}`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (attendanceRes.ok) {
        const attendanceData = await attendanceRes.json();
        setAttendance(attendanceData);
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    setCheckingIn(true);
    const token = localStorage.getItem('token');

    try {
      let latitude: number | null = null;
      let longitude: number | null = null;
      let locationName = 'Office';

      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        locationName = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }

      const response = await fetch('/api/attendance/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude,
          longitude,
          location: locationName,
        }),
      });

      if (response.ok) {
        await fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Check-in failed');
      }
    } catch (error) {
      console.error('Check-in error:', error);
      alert('Failed to check in. Please try again.');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckingOut(true);
    const token = localStorage.getItem('token');

    try {
      let latitude: number | null = null;
      let longitude: number | null = null;
      let locationName = 'Office';

      if (navigator.geolocation) {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        locationName = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
      }

      const response = await fetch('/api/attendance/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude,
          longitude,
          location: locationName,
        }),
      });

      if (response.ok) {
        await fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Check-out failed');
      }
    } catch (error) {
      console.error('Check-out error:', error);
      alert('Failed to check out. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <button
            onClick={() => router.push('/dashboard/employee')}
            className="flex items-center space-x-2 text-slate-600 hover:text-blue-600 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black gradient-text">Attendance Tracking</h1>
              <p className="text-slate-600 mt-2">Track your daily attendance with GPS location</p>
            </div>
            <motion.div
              className="glass p-6 rounded-2xl text-center"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="text-3xl font-black gradient-text">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="text-sm text-slate-600 mt-1">
                {currentTime.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Check-In/Check-Out Cards */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            className={`premium-card relative overflow-hidden ${
              todayAttendance?.checkedIn ? 'border-2 border-green-200' : ''
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center space-x-4 mb-4">
                <div className={`p-4 rounded-2xl ${
                  todayAttendance?.checkedIn ? 'bg-green-500' : 'bg-blue-500'
                }`}>
                  <Power className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Check In</h3>
                  {todayAttendance?.checkInTime && (
                    <p className="text-slate-600">Checked in at {todayAttendance.checkInTime}</p>
                  )}
                </div>
              </div>
              {todayAttendance?.checkInLocation && (
                <div className="mb-4 glass p-3 rounded-xl">
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <MapPin className="h-4 w-4" />
                    <span>{todayAttendance.checkInLocation}</span>
                  </div>
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCheckIn}
                disabled={todayAttendance?.checkedIn || checkingIn}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
                  todayAttendance?.checkedIn
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg'
                }`}
              >
                {checkingIn ? (
                  <span className="flex items-center justify-center space-x-2">
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Checking In...</span>
                  </span>
                ) : todayAttendance?.checkedIn ? (
                  'Already Checked In'
                ) : (
                  'Check In Now'
                )}
              </motion.button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            className={`premium-card relative overflow-hidden ${
              todayAttendance?.checkedOut ? 'border-2 border-orange-200' : ''
            }`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-400/20 to-orange-600/20 rounded-full blur-3xl" />
            <div className="relative">
              <div className="flex items-center space-x-4 mb-4">
                <div className={`p-4 rounded-2xl ${
                  todayAttendance?.checkedOut ? 'bg-orange-500' : 'bg-slate-400'
                }`}>
                  <PowerOff className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">Check Out</h3>
                  {todayAttendance?.checkOutTime && (
                    <p className="text-slate-600">Checked out at {todayAttendance.checkOutTime}</p>
                  )}
                  {todayAttendance?.workingHours && (
                    <p className="text-sm font-semibold text-green-600">Worked: {todayAttendance.workingHours} hrs</p>
                  )}
                </div>
              </div>
              {todayAttendance?.checkOutLocation && (
                <div className="mb-4 glass p-3 rounded-xl">
                  <div className="flex items-center space-x-2 text-sm text-slate-600">
                    <MapPin className="h-4 w-4" />
                    <span>{todayAttendance.checkOutLocation}</span>
                  </div>
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCheckOut}
                disabled={!todayAttendance?.checkedIn || todayAttendance?.checkedOut || checkingOut}
                className={`w-full py-4 rounded-xl font-bold text-white transition-all ${
                  !todayAttendance?.checkedIn || todayAttendance?.checkedOut
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 shadow-lg'
                }`}
              >
                {checkingOut ? (
                  <span className="flex items-center justify-center space-x-2">
                    <Loader className="h-5 w-5 animate-spin" />
                    <span>Checking Out...</span>
                  </span>
                ) : todayAttendance?.checkedOut ? (
                  'Already Checked Out'
                ) : !todayAttendance?.checkedIn ? (
                  'Check In First'
                ) : (
                  'Check Out Now'
                )}
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Date Filter */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="premium-card">
          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-slate-600" />
            <label className="text-sm font-semibold text-slate-700">View Attendance for:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-premium flex-1 max-w-xs"
            />
          </div>
        </div>
      </div>

      {/* Attendance Records */}
      <div className="max-w-7xl mx-auto">
        <div className="premium-card">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Attendance History</h3>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="skeleton h-16 rounded-lg" />
              ))}
            </div>
          ) : attendance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="premium-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Working Hours</th>
                    <th>Location</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map((record, idx) => (
                    <motion.tr
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <td>
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="font-mono">{record.check_in || '-'}</td>
                      <td className="font-mono">{record.check_out || '-'}</td>
                      <td>
                        <span className="badge badge-info">
                          {record.working_hours || 0} hrs
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-4 w-4 text-slate-400" />
                          <span className="text-sm">{record.check_in_location || 'N/A'}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          record.status === 'Present' ? 'badge-success' :
                          record.status === 'Late' ? 'badge-warning' :
                          'badge-danger'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Attendance Records</h3>
              <p className="text-slate-600">No records found for the selected date</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}