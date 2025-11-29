import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import { 
  FaChartBar, 
  FaDownload, 
  FaCalendar, 
  FaUsers, 
  FaChild, 
  FaDollarSign, 
  FaUserTie,
  FaFileExcel,
  FaFilePdf,
  FaPrint
} from 'react-icons/fa';

const AdminReports = () => {
  const [reports, setReports] = useState({
    attendance: {},
    financial: {},
    enrollment: {},
    staff: {}
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [reportType, setReportType] = useState('overview');
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadReports();
  }, [dateRange]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getReports(dateRange);
      setReports(response.data.data);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (format) => {
    try {
      setGenerating(true);
      const response = await adminAPI.generateReport({
        type: reportType,
        format,
        dateRange
      });
      
      // In a real app, this would download the file
      if (format === 'pdf') {
        window.open(response.data.reportUrl, '_blank');
      } else {
        // For Excel, create a download link
        const link = document.createElement('a');
        link.href = response.data.reportUrl;
        link.download = `${reportType}_report_${dateRange.start}_to_${dateRange.end}.${format}`;
        link.click();
      }
      
      alert(`${format.toUpperCase()} report generated successfully!`);
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const StatCard = ({ icon, title, value, change, changeType }) => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
            <div className="text-2xl text-white">{icon}</div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd className="text-lg font-medium text-gray-900">{value}</dd>
              {change && (
                <dd className={`text-sm font-medium ${
                  changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {changeType === 'positive' ? '+' : ''}{change}% from last period
                </dd>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );

  const AttendanceChart = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Attendance Overview</h3>
      <div className="space-y-4">
        {reports.attendance.daily && Object.entries(reports.attendance.daily).map(([date, data]) => (
          <div key={date} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{new Date(date).toLocaleDateString()}</span>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-900">{data.present} present</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${(data.present / data.total) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-500">{Math.round((data.present / data.total) * 100)}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const FinancialSummary = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Summary</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-green-600">
            ${reports.financial?.revenue?.current || 0}
          </div>
          <div className="text-sm text-green-800">Total Revenue</div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {reports.financial?.payments?.pending || 0}
          </div>
          <div className="text-sm text-blue-800">Pending Payments</div>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            ${reports.financial?.revenue?.outstanding || 0}
          </div>
          <div className="text-sm text-yellow-800">Outstanding</div>
        </div>
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {reports.financial?.payments?.processed || 0}
          </div>
          <div className="text-sm text-purple-800">Processed</div>
        </div>
      </div>
    </div>
  );

  const EnrollmentStats = () => (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Enrollment Statistics</h3>
      <div className="space-y-4">
        {reports.enrollment.byClassroom && Object.entries(reports.enrollment.byClassroom).map(([classroom, data]) => (
          <div key={classroom} className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900">{classroom}</span>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{data.current} / {data.capacity}</span>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    (data.current / data.capacity) >= 0.9 ? 'bg-red-600' :
                    (data.current / data.capacity) >= 0.7 ? 'bg-yellow-600' : 'bg-green-600'
                  }`}
                  style={{ width: `${(data.current / data.capacity) * 100}%` }}
                ></div>
              </div>
              <span className="text-sm text-gray-500">{Math.round((data.current / data.capacity) * 100)}%</span>
            </div>
          </div>
        ))}
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
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
              <p className="mt-1 text-sm text-gray-600">
                Comprehensive insights and analytics for your nursery
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => generateReport('pdf')}
                disabled={generating}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                <FaFilePdf className="mr-2" />
                {generating ? 'Generating...' : 'Export PDF'}
              </button>
              <button
                onClick={() => generateReport('excel')}
                disabled={generating}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                <FaFileExcel className="mr-2" />
                {generating ? 'Generating...' : 'Export Excel'}
              </button>
            </div>
          </div>

          {/* Date Range Selector */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Report Type</label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="overview">Overview</option>
                  <option value="attendance">Attendance</option>
                  <option value="financial">Financial</option>
                  <option value="enrollment">Enrollment</option>
                  <option value="staff">Staff Performance</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={loadReports}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaChartBar className="mr-2" />
                  Update Reports
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<FaUsers />}
              title="Total Children"
              value={reports.enrollment?.total || 0}
              change={reports.enrollment?.growth || 0}
              changeType={reports.enrollment?.growth >= 0 ? 'positive' : 'negative'}
            />
            <StatCard
              icon={<FaUserTie />}
              title="Staff Members"
              value={reports.staff?.total || 0}
            />
            <StatCard
              icon={<FaDollarSign />}
              title="Monthly Revenue"
              value={`$${reports.financial?.revenue?.current || 0}`}
              change={reports.financial?.revenue?.growth || 0}
              changeType={reports.financial?.revenue?.growth >= 0 ? 'positive' : 'negative'}
            />
            <StatCard
              icon={<FaChild />}
              title="Avg Attendance"
              value={`${reports.attendance?.averageRate || 0}%`}
              change={reports.attendance?.trend || 0}
              changeType={reports.attendance?.trend >= 0 ? 'positive' : 'negative'}
            />
          </div>

          {/* Detailed Reports */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <AttendanceChart />
            <FinancialSummary />
          </div>

          {/* Additional Reports */}
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <EnrollmentStats />
            
            {/* Staff Performance */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Staff Performance</h3>
              <div className="space-y-4">
                {reports.staff?.performance?.map((staff, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {staff.name}
                      </p>
                      <p className="text-sm text-gray-500">{staff.role}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {staff.attendanceRate}% Attendance
                      </p>
                      <p className="text-sm text-gray-500">
                        {staff.childrenCount} children
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Report Actions */}
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Generate Custom Reports</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <button
                onClick={() => {
                  setReportType('attendance');
                  generateReport('pdf');
                }}
                className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FaCalendar className="mr-2" />
                Attendance Report
              </button>
              <button
                onClick={() => {
                  setReportType('financial');
                  generateReport('pdf');
                }}
                className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FaDollarSign className="mr-2" />
                Financial Report
              </button>
              <button
                onClick={() => {
                  setReportType('enrollment');
                  generateReport('pdf');
                }}
                className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FaUsers className="mr-2" />
                Enrollment Report
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-6 bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity Summary</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {reports.recentActivity?.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center">
                      <div className={`h-3 w-3 rounded-full ${
                        activity.type === 'enrollment' ? 'bg-green-500' :
                        activity.type === 'payment' ? 'bg-blue-500' :
                        activity.type === 'attendance' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`}></div>
                      <span className="ml-3 text-sm text-gray-900">{activity.description}</span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminReports;