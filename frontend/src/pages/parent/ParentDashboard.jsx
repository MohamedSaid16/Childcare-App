import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { parentAPI } from '../../utils/api';
import { 
  FaChild, 
  FaCalendarCheck, 
  FaDollarSign, 
  FaBell,
  FaChartLine,
  FaUtensils,
  FaBed,
  FaRunning
} from 'react-icons/fa';

const ParentDashboard = () => {
  const { user } = useAuth();
  const [children, setChildren] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalChildren: 0,
    attendanceThisWeek: 0,
    pendingPayments: 0,
    unreadNotifications: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [childrenRes, paymentsRes] = await Promise.all([
        parentAPI.getMyChildren(),
        parentAPI.getMyPayments()
      ]);

      setChildren(childrenRes.data.data);
      setPendingPayments(paymentsRes.data.data.filter(p => p.status === 'pending'));

      // Calculate stats
      const totalChildren = childrenRes.data.data.length;
      const pendingPaymentsCount = paymentsRes.data.data.filter(p => p.status === 'pending').length;
      
      setStats({
        totalChildren,
        attendanceThisWeek: Math.floor(Math.random() * totalChildren * 5), // Mock data
        pendingPayments: pendingPaymentsCount,
        unreadNotifications: 3 // Mock data
      });

      // Load recent activities for first child
      if (childrenRes.data.data.length > 0) {
        const activitiesRes = await parentAPI.getChildActivities(childrenRes.data.data[0]._id);
        setRecentActivities(activitiesRes.data.data.slice(0, 5));
      }

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon, title, value, color }) => (
    <div className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${color}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <div className="text-2xl">{icon}</div>
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );

  const ActivityCard = ({ activity }) => (
    <div className="bg-white rounded-lg p-4 shadow-sm border">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold text-gray-900">{activity.title}</h4>
          <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
          <div className="flex items-center mt-2 text-sm text-gray-500">
            <FaCalendarCheck className="mr-1" />
            <span>{new Date(activity.date).toLocaleDateString()}</span>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${
          activity.type === 'educational' ? 'bg-blue-100 text-blue-800' :
          activity.type === 'creative' ? 'bg-purple-100 text-purple-800' :
          activity.type === 'physical' ? 'bg-green-100 text-green-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {activity.type}
        </span>
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
                Welcome back, {user?.firstName}!
              </h1>
              <p className="mt-1 text-sm text-gray-600">
                Here's what's happening with your children today.
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
              title="Children Enrolled"
              value={stats.totalChildren}
              color="border-blue-500"
            />
            <StatCard
              icon={<FaCalendarCheck />}
              title="Attendance This Week"
              value={stats.attendanceThisWeek}
              color="border-green-500"
            />
            <StatCard
              icon={<FaDollarSign />}
              title="Pending Payments"
              value={stats.pendingPayments}
              color="border-yellow-500"
            />
            <StatCard
              icon={<FaBell />}
              title="Unread Notifications"
              value={stats.unreadNotifications}
              color="border-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Children List */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">My Children</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {children.map((child) => (
                    <div key={child._id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center">
                            <FaChild className="h-6 w-6 text-indigo-600" />
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg font-medium text-gray-900">
                              {child.firstName} {child.lastName}
                            </h3>
                            <p className="text-sm text-gray-500">
                              Age: {child.age} • {child.classroom?.name || 'No classroom assigned'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Present Today
                          </span>
                          <p className="text-sm text-gray-500 mt-1">
                            Checked in: 8:30 AM
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activities */}
              <div className="mt-8 bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Recent Activities</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity) => (
                      <ActivityCard key={activity._id} activity={activity} />
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center text-gray-500">
                      No recent activities to display
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Pending Payments */}
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Pending Payments</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {pendingPayments.length > 0 ? (
                    pendingPayments.map((payment) => (
                      <div key={payment._id} className="px-6 py-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">
                              {payment.child.firstName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {payment.period.month}/{payment.period.year}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              ${payment.totalAmount}
                            </p>
                            <p className="text-sm text-yellow-600">
                              Due {new Date(payment.dueDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <button className="mt-2 w-full bg-indigo-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors">
                          Pay Now
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="px-6 py-8 text-center text-gray-500">
                      No pending payments
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                </div>
                <div className="p-6 space-y-3">
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                    <div className="flex items-center">
                      <FaCalendarCheck className="h-5 w-5 text-indigo-600 mr-3" />
                      <span>View Attendance</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                    <div className="flex items-center">
                      <FaDollarSign className="h-5 w-5 text-indigo-600 mr-3" />
                      <span>Make Payment</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                    <div className="flex items-center">
                      <FaChild className="h-5 w-5 text-indigo-600 mr-3" />
                      <span>Register New Child</span>
                    </div>
                  </button>
                  <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                    <div className="flex items-center">
                      <FaBell className="h-5 w-5 text-indigo-600 mr-3" />
                      <span>Notification Settings</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;