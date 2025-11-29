import React, { useState, useEffect } from 'react';
import { parentAPI } from '../../utils/api';
import { FaChild, FaCalendar, FaUtensils, FaBed, FaStar, FaNotesMedical } from 'react-icons/fa';

const ChildDailyReport = () => {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dailyReport, setDailyReport] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      loadDailyData(selectedChild._id, selectedDate);
    }
  }, [selectedChild, selectedDate]);

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

  const loadDailyData = async (childId, date) => {
    try {
      // In a real app, you'd have specific endpoints for daily reports
      const [attendanceRes, activitiesRes] = await Promise.all([
        parentAPI.getChildAttendance(childId),
        parentAPI.getChildActivities(childId)
      ]);

      // Filter for selected date
      const dayAttendance = attendanceRes.data.data.find(a => 
        new Date(a.date).toDateString() === new Date(date).toDateString()
      );

      const dayActivities = activitiesRes.data.data.filter(a => 
        new Date(a.date).toDateString() === new Date(date).toDateString()
      );

      setDailyReport(dayAttendance);
      setActivities(dayActivities);
    } catch (error) {
      console.error('Failed to load daily data:', error);
    }
  };

  const getMoodEmoji = (mood) => {
    switch (mood) {
      case 'happy': return '😊';
      case 'calm': return '😌';
      case 'excited': return '🎉';
      case 'tired': return '😴';
      case 'sad': return '😢';
      default: return '😐';
    }
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
      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Daily Report</h1>
            <p className="mt-1 text-sm text-gray-600">
              View your child's daily activities and progress
            </p>
          </div>

          {/* Child and Date Selection */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Select Child</label>
                <select
                  value={selectedChild?._id || ''}
                  onChange={(e) => setSelectedChild(children.find(c => c._id === e.target.value))}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  {children.map(child => (
                    <option key={child._id} value={child._id}>
                      {child.firstName} {child.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Select Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>
          </div>

          {selectedChild && (
            <>
              {/* Daily Summary */}
              {dailyReport ? (
                <div className="bg-white shadow rounded-lg mb-6">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Daily Summary - {new Date(selectedDate).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </h2>
                  </div>

                  <div className="p-6">
                    {/* Attendance Summary */}
                    <div className="mb-6">
                      <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                        <FaCalendar className="mr-2 text-indigo-500" />
                        Attendance
                      </h3>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm text-blue-600">Check In</p>
                          <p className="text-lg font-semibold">
                            {dailyReport.checkIn ? new Date(dailyReport.checkIn).toLocaleTimeString() : 'N/A'}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-600">Check Out</p>
                          <p className="text-lg font-semibold">
                            {dailyReport.checkOut ? new Date(dailyReport.checkOut).toLocaleTimeString() : 'N/A'}
                          </p>
                        </div>
                        <div className="text-center p-3 bg-purple-50 rounded-lg">
                          <p className="text-sm text-purple-600">Duration</p>
                          <p className="text-lg font-semibold">
                            {dailyReport.duration ? Math.round(dailyReport.duration / 60) : 0}h
                          </p>
                        </div>
                        <div className="text-center p-3 bg-orange-50 rounded-lg">
                          <p className="text-sm text-orange-600">Status</p>
                          <p className="text-lg font-semibold capitalize">{dailyReport.status}</p>
                        </div>
                      </div>
                    </div>

                    {/* Meals */}
                    <div className="mb-6">
                      <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                        <FaUtensils className="mr-2 text-green-500" />
                        Meals
                      </h3>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className={`p-3 rounded-lg border-2 ${dailyReport.meals?.breakfast ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                          <p className="font-medium">Breakfast</p>
                          <p className="text-sm text-gray-600">
                            {dailyReport.meals?.breakfast ? '✅ Eaten well' : '❌ Not eaten'}
                          </p>
                        </div>
                        <div className={`p-3 rounded-lg border-2 ${dailyReport.meals?.lunch ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                          <p className="font-medium">Lunch</p>
                          <p className="text-sm text-gray-600">
                            {dailyReport.meals?.lunch ? '✅ Eaten well' : '❌ Not eaten'}
                          </p>
                        </div>
                        <div className={`p-3 rounded-lg border-2 ${dailyReport.meals?.snack ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                          <p className="font-medium">Snack</p>
                          <p className="text-sm text-gray-600">
                            {dailyReport.meals?.snack ? '✅ Eaten well' : '❌ Not eaten'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Nap Time */}
                    {dailyReport.napTime && (
                      <div className="mb-6">
                        <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                          <FaBed className="mr-2 text-purple-500" />
                          Nap Time
                        </h3>
                        <div className="bg-purple-50 rounded-lg p-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-purple-600">Duration</p>
                              <p className="font-semibold">
                                {dailyReport.napTime.duration ? Math.round(dailyReport.napTime.duration) : 0} minutes
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-purple-600">Quality</p>
                              <p className="font-semibold">
                                {dailyReport.napTime.duration > 60 ? 'Good' : 'Short'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Teacher Notes */}
                    {dailyReport.notes && (
                      <div className="mb-6">
                        <h3 className="text-md font-medium text-gray-900 mb-3 flex items-center">
                          <FaNotesMedical className="mr-2 text-blue-500" />
                          Teacher's Notes
                        </h3>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="text-gray-700">{dailyReport.notes}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white shadow rounded-lg p-8 text-center mb-6">
                  <FaCalendar className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No report available</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No daily report found for {selectedChild.firstName} on {new Date(selectedDate).toLocaleDateString()}.
                  </p>
                </div>
              )}

              {/* Daily Activities */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Daily Activities</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {activities.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <FaStar className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No activities</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        No activities recorded for {selectedChild.firstName} on {new Date(selectedDate).toLocaleDateString()}.
                      </p>
                    </div>
                  ) : (
                    activities.map((activity) => (
                      <div key={activity._id} className="px-6 py-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <span className="text-2xl">
                                {activity.type === 'educational' ? '📚' :
                                 activity.type === 'creative' ? '🎨' :
                                 activity.type === 'physical' ? '⚽' :
                                 activity.type === 'musical' ? '🎵' : '🌟'}
                              </span>
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                                {activity.learningObjectives && activity.learningObjectives.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-xs text-gray-500 font-medium">Learning Objectives:</p>
                                    <ul className="text-xs text-gray-600 list-disc list-inside">
                                      {activity.learningObjectives.map((obj, index) => (
                                        <li key={index}>{obj}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Child's Participation */}
                            {activity.participants && activity.participants.find(p => p.child === selectedChild._id) && (
                              <div className="mt-3 ml-9 p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                  <span className="text-lg">
                                    {getMoodEmoji(activity.participants.find(p => p.child === selectedChild._id)?.mood)}
                                  </span>
                                  <span className="text-sm font-medium text-gray-900 capitalize">
                                    {activity.participants.find(p => p.child === selectedChild._id)?.mood} mood
                                  </span>
                                </div>
                                {activity.participants.find(p => p.child === selectedChild._id)?.observations && (
                                  <p className="text-sm text-gray-600">
                                    {activity.participants.find(p => p.child === selectedChild._id)?.observations}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>

                          <div className="text-right text-sm text-gray-500">
                            {activity.startTime && activity.endTime ? (
                              <>
                                <p>{new Date(activity.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                <p>to</p>
                                <p>{new Date(activity.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              </>
                            ) : (
                              <p>All day</p>
                            )}
                          </div>
                        </div>
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

export default ChildDailyReport;