import React, { useState, useEffect } from 'react';
import { employeeAPI, attendanceAPI } from '../../utils/api';
import { FaChild, FaCheck, FaTimes, FaClock, FaSearch, FaUserClock, FaSignOutAlt } from 'react-icons/fa';

const AttendancePage = () => {
  const [classroom, setClassroom] = useState(null);
  const [children, setChildren] = useState([]);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    loadClassroomData();
  }, []);

  const loadClassroomData = async () => {
    try {
      const [classroomRes, childrenRes, attendanceRes] = await Promise.all([
        employeeAPI.getMyClassroom(),
        employeeAPI.getClassroomChildren(),
        attendanceAPI.getTodayAttendance()
      ]);

      setClassroom(classroomRes.data.data);
      setChildren(childrenRes.data.data);
      setTodayAttendance(attendanceRes.data.data);
    } catch (error) {
      console.error('Failed to load classroom data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (childId) => {
    setActionLoading(childId);
    try {
      await attendanceAPI.checkIn({ childId });
      await loadClassroomData(); // Refresh data
    } catch (error) {
      console.error('Failed to check in:', error);
      alert('Failed to check in child. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckOut = async (attendanceId) => {
    setActionLoading(attendanceId);
    try {
      await attendanceAPI.checkOut(attendanceId, {});
      await loadClassroomData(); // Refresh data
    } catch (error) {
      console.error('Failed to check out:', error);
      alert('Failed to check out child. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredChildren = children.filter(child =>
    child.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    child.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getChildAttendance = (childId) => {
    return todayAttendance.find(a => a.child._id === childId);
  };

  const getAttendanceStats = () => {
    const total = children.length;
    const present = todayAttendance.filter(a => a.status === 'present' && !a.checkOut).length;
    const checkedOut = todayAttendance.filter(a => a.checkOut).length;
    const absent = total - present - checkedOut;

    return { total, present, checkedOut, absent };
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateDuration = (checkIn, checkOut) => {
    if (!checkIn) return 'N/A';
    const start = new Date(checkIn);
    const end = checkOut ? new Date(checkOut) : new Date();
    const diffMs = end - start;
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const getAttendanceStatus = (attendance) => {
    if (!attendance) return 'absent';
    if (attendance.checkOut) return 'checked-out';
    if (attendance.checkIn) return 'present';
    return 'absent';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'checked-out':
        return 'bg-blue-100 text-blue-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'present':
        return <FaCheck className="h-4 w-4 text-green-600" />;
      case 'checked-out':
        return <FaSignOutAlt className="h-4 w-4 text-blue-600" />;
      case 'absent':
        return <FaTimes className="h-4 w-4 text-red-600" />;
      default:
        return <FaClock className="h-4 w-4 text-gray-600" />;
    }
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
            <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
            <p className="mt-1 text-sm text-gray-600">
              {classroom ? `Classroom: ${classroom.name}` : 'No classroom assigned'}
            </p>
          </div>

          {/* Attendance Statistics */}
          <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <FaChild className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Children</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.total}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <FaCheck className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Present</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.present}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <FaClock className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Checked Out</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.checkedOut}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                    <FaTimes className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Absent</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.absent}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search children by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Children List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Today's Attendance - {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {filteredChildren.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <FaChild className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No children found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'No children match your search.' : 'No children in your classroom.'}
                  </p>
                </div>
              ) : (
                filteredChildren.map((child) => {
                  const attendance = getChildAttendance(child._id);
                  const status = getAttendanceStatus(attendance);
                  const isCheckedIn = status === 'present';
                  const isCheckedOut = status === 'checked-out';

                  return (
                    <div key={child._id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                              <FaChild className="h-6 w-6 text-indigo-600" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {child.firstName} {child.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              Age: {child.age} • {child.classroom?.name || 'No classroom'}
                            </p>
                            {attendance && (
                              <div className="mt-1 flex items-center space-x-4 text-xs text-gray-500">
                                {attendance.checkIn && (
                                  <span>In: {formatTime(attendance.checkIn)}</span>
                                )}
                                {attendance.checkOut && (
                                  <span>Out: {formatTime(attendance.checkOut)}</span>
                                )}
                                {(attendance.checkIn || attendance.checkOut) && (
                                  <span>Duration: {calculateDuration(attendance.checkIn, attendance.checkOut)}</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          {/* Status Badge */}
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                            {getStatusIcon(status)}
                            <span className="ml-1 capitalize">{status.replace('-', ' ')}</span>
                          </span>

                          {/* Action Buttons */}
                          <div className="flex space-x-2">
                            {!attendance && (
                              <button
                                onClick={() => handleCheckIn(child._id)}
                                disabled={actionLoading === child._id}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                              >
                                {actionLoading === child._id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  <>
                                    <FaUserClock className="mr-1" />
                                    Check In
                                  </>
                                )}
                              </button>
                            )}

                            {isCheckedIn && (
                              <button
                                onClick={() => handleCheckOut(attendance._id)}
                                disabled={actionLoading === attendance._id}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                              >
                                {actionLoading === attendance._id ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  <>
                                    <FaSignOutAlt className="mr-1" />
                                    Check Out
                                  </>
                                )}
                              </button>
                            )}

                            {isCheckedOut && (
                              <span className="text-sm text-gray-500">
                                Completed
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="flex space-x-4">
              <button
                onClick={() => {
                  const absentChildren = children.filter(child => !getChildAttendance(child._id));
                  if (absentChildren.length === 0) {
                    alert('All children are already checked in!');
                    return;
                  }
                  if (window.confirm(`Mark all ${absentChildren.length} absent children as present?`)) {
                    absentChildren.forEach(child => handleCheckIn(child._id));
                  }
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <FaCheck className="mr-2" />
                Check In All Absent
              </button>
              
              <button
                onClick={loadClassroomData}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FaClock className="mr-2" />
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;