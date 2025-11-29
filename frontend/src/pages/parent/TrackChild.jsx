import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { parentAPI } from '../../utils/api';
import { FaChild, FaCalendar, FaClock, FaUtensils, FaBed, FaChartLine } from 'react-icons/fa';

const TrackChild = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadChildAttendance(selectedChild._id);
    }
  }, [selectedChild, dateRange]);

  const loadChildren = async () => {
    try {
      const response = await parentAPI.getMyChildren();
      setChildren(response.data.data);
      if (response.data.data.length > 0) {
        setSelectedChild(response.data.data[0]);
      }
    } catch (error) {
      console.error('Failed to load children:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChildAttendance = async (childId) => {
    try {
      const response = await parentAPI.getChildAttendance(childId);
      setAttendance(response.data.data);
    } catch (error) {
      console.error('Failed to load attendance:', error);
    }
  };

  const getAttendanceStats = () => {
    const totalDays = attendance.length;
    const presentDays = attendance.filter(a => a.status === 'present').length;
    const attendanceRate = totalDays > 0 ? (presentDays / totalDays * 100).toFixed(1) : 0;
    
    const totalHours = attendance.reduce((sum, record) => sum + (record.duration || 0), 0) / 60;
    const avgHoursPerDay = totalDays > 0 ? (totalHours / totalDays).toFixed(1) : 0;

    return { totalDays, presentDays, attendanceRate, totalHours, avgHoursPerDay };
  };

  const stats = getAttendanceStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Track Child</h1>
            <p className="mt-1 text-sm text-gray-600">
              Monitor your child's attendance and daily activities
            </p>
          </div>

          {/* Child Selection */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Child</h2>
            <div className="flex space-x-4 overflow-x-auto">
              {children.map((child) => (
                <button
                  key={child._id}
                  onClick={() => setSelectedChild(child)}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg border-2 min-w-max ${
                    selectedChild?._id === child._id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <FaChild className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">{child.firstName} {child.lastName}</p>
                    <p className="text-sm text-gray-500">Age: {child.age}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedChild && (
            <>
              {/* Date Range Filter */}
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Date Range</h2>
                <div className="flex space-x-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                        <FaCalendar className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Attendance Rate</dt>
                          <dd className="text-lg font-medium text-gray-900">{stats.attendanceRate}%</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                        <FaClock className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Avg Hours/Day</dt>
                          <dd className="text-lg font-medium text-gray-900">{stats.avgHoursPerDay}h</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                        <FaChartLine className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Present Days</dt>
                          <dd className="text-lg font-medium text-gray-900">{stats.presentDays}/{stats.totalDays}</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 bg-orange-500 rounded-md p-3">
                        <FaBed className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Hours</dt>
                          <dd className="text-lg font-medium text-gray-900">{stats.totalHours.toFixed(1)}h</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance History */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Attendance History</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {attendance.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <FaCalendar className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records</h3>
                      <p className="mt-1 text-sm text-gray-500">No attendance records found for the selected period.</p>
                    </div>
                  ) : (
                    attendance.map((record) => (
                      <div key={record._id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              record.status === 'present' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              {record.status === 'present' ? (
                                <FaClock className="h-5 w-5 text-green-600" />
                              ) : (
                                <FaCalendar className="h-5 w-5 text-red-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {new Date(record.date).toLocaleDateString('en-US', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}
                              </p>
                              <p className="text-sm text-gray-500 capitalize">{record.status}</p>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            {record.status === 'present' && (
                              <>
                                <p className="text-sm text-gray-900">
                                  {record.checkIn && new Date(record.checkIn).toLocaleTimeString()} -{' '}
                                  {record.checkOut && new Date(record.checkOut).toLocaleTimeString()}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Duration: {record.duration ? Math.round(record.duration / 60) : 0}h
                                </p>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Meal and Nap Information */}
                        {record.status === 'present' && (
                          <div className="mt-3 flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <FaUtensils className="h-4 w-4" />
                              <span>
                                Meals: {[record.meals?.breakfast, record.meals?.lunch, record.meals?.snack]
                                  .filter(Boolean).length}/3
                              </span>
                            </div>
                            {record.napTime && (
                              <div className="flex items-center space-x-1">
                                <FaBed className="h-4 w-4" />
                                <span>
                                  Nap: {record.napTime.duration ? Math.round(record.napTime.duration) : 0}min
                                </span>
                              </div>
                            )}
                            {record.notes && (
                              <div className="flex-1">
                                <span className="text-gray-500">Notes: {record.notes}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrackChild;