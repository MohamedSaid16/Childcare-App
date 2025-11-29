import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import { 
  FaChild, 
  FaUsers, 
  FaUserTie, 
  FaDollarSign, 
  FaChartBar,
  FaCalendarCheck,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes] = await Promise.all([
        adminAPI.getDashboardStats()
      ]);

      setStats(statsRes.data.data);
      
      // Mock recent activities
      setRecentActivities([
        {
          _id: '1',
          type: 'registration',
          description: 'New child registered: Emma Johnson',
          timestamp: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
        },
        {
          _id: '2',
          type: 'payment',
          description: 'Payment received from John Smith',
          timestamp: new Date(Date.now() - 1000 * 60 * 60) // 1 hour ago
        },
        {
          _id: '3',
          type: 'attendance',
          description: 'High attendance today: 95%',
          timestamp: new Date(Date.now() - 1000 * 60 * 120) // 2 hours ago
        }
      ]);

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, change, changeType, color }) => (
    <div className="bg-white rounded-xl p-6 shadow-sm border">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 flex items-center ${
              changeType === 'increase' ? 'text-green-600' : 'text-red-600'
            }`}>
              {changeType === 'increase' ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
              {change}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color} bg-opacity-10`}>
          <div className={`text-2xl ${color}`}>{icon}</div>
        </div>
      </div>
    </div>
  );

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
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Overview of your nursery management system
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
              icon={<FaChild />}
              title="Total Children"
              value={stats.totalChildren || 0}
              change="+5%"
              changeType="increase"
              color="text-blue-600"
            />
            <StatCard
              icon={<FaUsers />}
              title="Total Parents"
              value={stats.totalParents || 0}
              change="+3%"
              changeType="increase"
              color="text-green-600"
            />
            <StatCard
              icon={<FaUserTie />}
              title="Employees"
              value={stats.totalEmployees || 0}
              color="text-purple-600"
            />
            <StatCard
              icon={<FaCalendarCheck />}
              title="Today's Attendance"
              value={stats.todayAttendance || 0}
              change="+8%"
              changeType="increase"
              color="text-orange-600"
            />
            <StatCard
              icon={<FaDollarSign />}
              title="Pending Payments"
              value={stats.pendingPayments || 0}
              change="-2%"
              changeType="decrease"
              color="text-yellow-600"
            />
            <StatCard
              icon={<FaChartBar />}
              title="Recent Activities"
              value={stats.recentActivities || 0}
              change="+12%"
              changeType="increase"
              color="text-indigo-600"
            />
            <StatCard
              icon={<FaExclamationTriangle />}
              title="Capacity Usage"
              value="85%"
              color="text-red-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {recentActivities.map((activity) => (
                  <div key={activity._id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-900">{activity.description}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {activity.timestamp.toLocaleTimeString()} • {activity.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        activity.type === 'registration' ? 'bg-blue-100 text-blue-800' :
                        activity.type === 'payment' ? 'bg-green-100 text-green-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {activity.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
              </div>
              <div className="p-6 grid grid-cols-2 gap-4">
                <button className="p-4 text-left bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <FaUsers className="h-6 w-6 text-blue-600 mb-2" />
                  <p className="font-medium text-gray-900">Manage Parents</p>
                  <p className="text-sm text-gray-600">View and manage parent accounts</p>
                </button>
                <button className="p-4 text-left bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                  <FaChild className="h-6 w-6 text-green-600 mb-2" />
                  <p className="font-medium text-gray-900">Manage Children</p>
                  <p className="text-sm text-gray-600">View and manage children records</p>
                </button>
                <button className="p-4 text-left bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                  <FaUserTie className="h-6 w-6 text-purple-600 mb-2" />
                  <p className="font-medium text-gray-900">Manage Employees</p>
                  <p className="text-sm text-gray-600">View and manage staff accounts</p>
                </button>
                <button className="p-4 text-left bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                  <FaDollarSign className="h-6 w-6 text-yellow-600 mb-2" />
                  <p className="font-medium text-gray-900">Manage Payments</p>
                  <p className="text-sm text-gray-600">View and process payments</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;