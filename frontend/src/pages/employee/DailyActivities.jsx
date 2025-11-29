import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { employeeAPI, activityAPI } from '../../utils/api';
import { FaPlus, FaClock, FaEdit, FaTrash, FaChild, FaUsers } from 'react-icons/fa';

const DailyActivities = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [classroom, setClassroom] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'educational',
    startTime: '',
    endTime: '',
    children: [],
    materials: ''
  });

  useEffect(() => {
    loadActivities();
    loadClassroom();
  }, []);

  const loadActivities = async () => {
    try {
      const response = await employeeAPI.getMyActivities();
      const todayActivities = response.data.data.filter(activity => 
        new Date(activity.date).toDateString() === new Date().toDateString()
      );
      setActivities(todayActivities);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClassroom = async () => {
    try {
      const response = await employeeAPI.getMyClassroom();
      setClassroom(response.data.data);
    } catch (error) {
      console.error('Failed to load classroom:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await activityAPI.createActivity({
        ...formData,
        date: new Date().toISOString(),
        employee: user._id,
        classroom: classroom?._id
      });
      setShowForm(false);
      setFormData({
        title: '',
        description: '',
        type: 'educational',
        startTime: '',
        endTime: '',
        children: [],
        materials: ''
      });
      loadActivities();
    } catch (error) {
      console.error('Failed to create activity:', error);
    }
  };

  const handleDelete = async (activityId) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await activityAPI.deleteActivity(activityId);
        loadActivities();
      } catch (error) {
        console.error('Failed to delete activity:', error);
      }
    }
  };

  const getActivityTypeColor = (type) => {
    const colors = {
      educational: 'bg-blue-100 text-blue-800',
      creative: 'bg-purple-100 text-purple-800',
      physical: 'bg-green-100 text-green-800',
      social: 'bg-yellow-100 text-yellow-800',
      musical: 'bg-pink-100 text-pink-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
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
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Daily Activities</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage activities for {classroom?.name || 'your classroom'}
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaPlus className="mr-2" />
              New Activity
            </button>
          </div>

          {/* Activity Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Activity</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        rows="3"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      >
                        <option value="educational">Educational</option>
                        <option value="creative">Creative</option>
                        <option value="physical">Physical</option>
                        <option value="social">Social</option>
                        <option value="musical">Musical</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Start Time</label>
                        <input
                          type="time"
                          value={formData.startTime}
                          onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">End Time</label>
                        <input
                          type="time"
                          value={formData.endTime}
                          onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Materials Needed</label>
                      <input
                        type="text"
                        value={formData.materials}
                        onChange={(e) => setFormData({...formData, materials: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="Crayons, paper, glue, etc."
                      />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                      >
                        Create Activity
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Activities List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Today's Activities - {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {activities.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <FaClipboardList className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No activities scheduled</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new activity.
                  </p>
                </div>
              ) : (
                activities.map((activity) => (
                  <div key={activity._id} className="px-6 py-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="text-lg font-medium text-gray-900">{activity.title}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActivityTypeColor(activity.type)}`}>
                            {activity.type}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{activity.description}</p>
                        
                        <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <FaClock className="mr-1" />
                            <span>
                              {activity.startTime && activity.endTime 
                                ? `${new Date(activity.startTime).toLocaleTimeString()} - ${new Date(activity.endTime).toLocaleTimeString()}`
                                : 'All day'
                              }
                            </span>
                          </div>
                          <div className="flex items-center">
                            <FaUsers className="mr-1" />
                            <span>{activity.children?.length || 0} participants</span>
                          </div>
                          {activity.materials && (
                            <div className="flex items-center">
                              <FaChild className="mr-1" />
                              <span>Materials: {activity.materials}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => handleDelete(activity._id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                        >
                          <FaTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyActivities;