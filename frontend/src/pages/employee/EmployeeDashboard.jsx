import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { employeeAPI, attendanceAPI } from '../../utils/api';
import { 
  FaChild, 
  FaCalendarCheck, 
  FaClipboardList,
  FaExclamationTriangle,
  FaChartLine,
  FaUsers,
  FaClock
} from 'react-icons/fa';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [classroom, setClassroom] = useState(null);
  const [todayAttendance, setTodayAttendance] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [stats, setStats] = useState({
    totalChildren: 0,
    presentToday: 0,
    activitiesToday: 0,
    pendingTasks: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [classroomRes, attendanceRes, activitiesRes] = await Promise.all([
        employeeAPI.getMyClassroom(),
        attendanceAPI.getTodayAttendance(),
        employeeAPI.getMyActivities()
      ]);

      setClassroom(classroomRes.data.data);
      setTodayAttendance(attendanceRes.data.data);
      
      const todayActivities = activitiesRes.data.data.filter(activity => 
        new Date(activity.date).toDateString() === new Date().toDateString()
      );
      setRecentActivities(todayActivities.slice(0, 5));

      const presentCount = attendanceRes.data.data.filter(a => a.status === 'present').length;
      
      setStats({
        totalChildren: classroomRes.data.data?.children?.length || 0,
        presentToday: presentCount,
        activitiesToday: todayActivities.length,
        pendingTasks: 3 // Mock data for tasks
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, subtitle, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-lg ${color} bg-opacity-10`}>
          <div className={`text-2xl ${color}`}>{icon}</div>
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  const CheckInButton = ({ child, attendance }) => {
    const isCheckedIn = attendance?.checkIn && !attendance?.checkOut;
    
    const handleCheckIn = async () => {
      try {
        await attendanceAPI.checkIn({ childId: child._id });
        loadDashboardData(); // Refresh data
      } catch (error) {
        console.error('Failed to check in:', error);
      }
    };

    const handleCheckOut = async () => {
      try {
        await attendanceAPI.checkOut(attendance._id, {});
        loadDashboardData(); // Refresh data
      } catch (error) {
        console.error('Failed to check out:', error);
      }
    };

    if (isCheckedIn) {
      return (
        <button
          onClick={handleCheckOut}
          className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full hover:bg-green-200 transition-colors"
        >
          Check Out
        </button>
      );
    }

    return (
      <button
        onClick={handleCheckIn}
        className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full hover:bg-blue-200 transition-colors"
      >
        Check In
      </button>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {user?.firstName}!
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                {classroom ? `Classroom: ${classroom.name}` : 'No classroom assigned'}
              </p>
            </div>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatCard
              icon={<FaUsers />}
              title="Total Children"
              value={stats.totalChildren}
              color="text-blue-600"
            />
            <StatCard
              icon={<FaCalendarCheck />}
              title="Present Today"
              value={stats.presentToday}
              subtitle={`of ${stats.totalChildren}`}
              color="text-green-600"
            />
            <StatCard
              icon={<FaClipboardList />}
              title="Activities Today"
              value={stats.activitiesToday}
              color="text-purple-600"
            />
            <StatCard
              icon={<FaExclamationTriangle />}
              title="Pending Tasks"
              value={stats.pendingTasks}
              color="text-yellow-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Attendance Section */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Today's Attendance</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {classroom?.children?.length || 0} children in your classroom
                  </p>
                </div>
                <div className="divide-y divide-gray-200">
                  {classroom?.children?.map((child) => {
                    const attendance = todayAttendance.find(a => a.child._id === child._id);
                    return (
                      <div key={child._id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <FaChild className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                              <h3 className="text-sm font-medium text-gray-900">
                                {child.firstName} {child.lastName}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {attendance ? (
                                  attendance.checkOut ? (
                                    <span className="text-green-600">Checked out at {new Date(attendance.checkOut).toLocaleTimeString()}</span>
                                  ) : attendance.checkIn ? (
                                    <span className="text-blue-600">Checked in at {new Date(attendance.checkIn).toLocaleTimeString()}</span>
                                  ) : null
                                ) : (
                                  <span className="text-gray-400">Not checked in</span>
                                )}
                              </p>
                            </div>
                          </div>
                          <CheckInButton child={child} attendance={attendance} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recent Activities */}
              <div className="mt-8 bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Today's Activities</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <div key={activity._id} className="px-6 py-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">{activity.title}</h4>
                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                            <div className="flex items-center mt-2 text-sm text-gray-500">
                              <FaClock className="mr-1" />
                              <span>
                                {activity.startTime && activity.endTime 
                                  ? `${new Date(activity.startTime).toLocaleTimeString()} - ${new Date(activity.endTime).toLocaleTimeString()}`
                                  : 'All day'
                                }
                              </span>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            activity.type === 'educational' ? 'bg-blue-100 text-blue-800' :
                            activity.type === 'creative' ? 'bg-purple-100 text-purple-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {activity.type}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center text-gray-500">
                      No activities scheduled for today
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                </div>
                <div className="p-6 space-y-3">
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                    <div className="flex items-center">
                      <FaClipboardList className="h-5 w-5 text-indigo-600 mr-3" />
                      <span>Record Activity</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                    <div className="flex items-center">
                      <FaChild className="h-5 w-5 text-indigo-600 mr-3" />
                      <span>Add Child Note</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                    <div className="flex items-center">
                      <FaExclamationTriangle className="h-5 w-5 text-indigo-600 mr-3" />
                      <span>Report Medical Alert</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Upcoming Tasks */}
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Upcoming Tasks</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Lunch Time</p>
                      <p className="text-sm text-gray-600">12:00 PM</p>
                    </div>
                    <FaClock className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Nap Time</p>
                      <p className="text-sm text-gray-600">1:30 PM</p>
                    </div>
                    <FaClock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Art Activity</p>
                      <p className="text-sm text-gray-600">3:00 PM</p>
                    </div>
                    <FaClipboardList className="h-5 w-5 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;