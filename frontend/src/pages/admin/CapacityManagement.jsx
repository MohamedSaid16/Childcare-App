import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import { 
  FaUsers, 
  FaChild, 
  FaExclamationTriangle, 
  FaCheckCircle, 
  FaChartLine,
  FaPlus,
  FaEdit,
  FaSearch
} from 'react-icons/fa';

const CapacityManagement = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);
  const [showCapacityModal, setShowCapacityModal] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [formData, setFormData] = useState({
    childName: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    preferredAgeRange: '0-2',
    notes: '',
    priority: 'normal'
  });

  useEffect(() => {
    loadCapacityData();
  }, []);

  const loadCapacityData = async () => {
    try {
      const [classroomsRes, waitlistRes] = await Promise.all([
        adminAPI.getClassrooms(),
        adminAPI.getWaitlist()
      ]);
      
      setClassrooms(classroomsRes.data.data);
      setWaitlist(waitlistRes.data.data);
    } catch (error) {
      console.error('Failed to load capacity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWaitlistSubmit = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.addToWaitlist(formData);
      setShowWaitlistForm(false);
      setFormData({
        childName: '',
        parentName: '',
        parentEmail: '',
        parentPhone: '',
        preferredAgeRange: '0-2',
        notes: '',
        priority: 'normal'
      });
      loadCapacityData();
    } catch (error) {
      console.error('Failed to add to waitlist:', error);
    }
  };

  const updateClassroomCapacity = async (classroomId, newCapacity) => {
    try {
      await adminAPI.updateClassroom(classroomId, { capacity: newCapacity });
      setShowCapacityModal(false);
      setSelectedClassroom(null);
      loadCapacityData();
    } catch (error) {
      console.error('Failed to update capacity:', error);
    }
  };

  const removeFromWaitlist = async (waitlistId) => {
    if (window.confirm('Are you sure you want to remove this child from the waitlist?')) {
      try {
        await adminAPI.removeFromWaitlist(waitlistId);
        loadCapacityData();
      } catch (error) {
        console.error('Failed to remove from waitlist:', error);
      }
    }
  };

  const enrollFromWaitlist = async (waitlistEntry, classroomId) => {
    try {
      await adminAPI.enrollFromWaitlist(waitlistEntry._id, classroomId);
      loadCapacityData();
    } catch (error) {
      console.error('Failed to enroll from waitlist:', error);
    }
  };

  const getUtilizationStatus = (utilization) => {
    if (utilization >= 95) return { status: 'critical', color: 'bg-red-100 text-red-800' };
    if (utilization >= 85) return { status: 'warning', color: 'bg-yellow-100 text-yellow-800' };
    if (utilization >= 70) return { status: 'good', color: 'bg-green-100 text-green-800' };
    return { status: 'excellent', color: 'bg-blue-100 text-blue-800' };
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      normal: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800'
    };
    return colors[priority] || colors.normal;
  };

  const filteredClassrooms = classrooms.filter(classroom =>
    classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classroom.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const overallStats = {
    totalCapacity: classrooms.reduce((sum, room) => sum + room.capacity, 0),
    totalEnrolled: classrooms.reduce((sum, room) => sum + (room.children?.length || 0), 0),
    totalAvailable: classrooms.reduce((sum, room) => sum + (room.capacity - (room.children?.length || 0)), 0),
    overallUtilization: (classrooms.reduce((sum, room) => sum + (room.children?.length || 0), 0) / 
                        classrooms.reduce((sum, room) => sum + room.capacity, 0)) * 100
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
              <h1 className="text-3xl font-bold text-gray-900">Capacity Management</h1>
              <p className="mt-1 text-sm text-gray-600">
                Monitor classroom utilization and manage waitlists
              </p>
            </div>
            <button
              onClick={() => setShowWaitlistForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaPlus className="mr-2" />
              Add to Waitlist
            </button>
          </div>

          {/* Overall Stats */}
          <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <FaUsers className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Capacity</dt>
                      <dd className="text-lg font-medium text-gray-900">{overallStats.totalCapacity}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <FaChild className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Enrolled</dt>
                      <dd className="text-lg font-medium text-gray-900">{overallStats.totalEnrolled}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <FaChartLine className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Available</dt>
                      <dd className="text-lg font-medium text-gray-900">{overallStats.totalAvailable}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                    <FaUsers className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Utilization</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {overallStats.overallUtilization.toFixed(1)}%
                      </dd>
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
                placeholder="Search classrooms by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Classroom Capacity */}
            <div className="lg:col-span-2">
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Classroom Capacity</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {filteredClassrooms.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No classrooms found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchTerm ? 'No classrooms match your search.' : 'No classrooms available.'}
                      </p>
                    </div>
                  ) : (
                    filteredClassrooms.map((classroom) => {
                      const childrenCount = classroom.children?.length || 0;
                      const utilization = (childrenCount / classroom.capacity) * 100;
                      const status = getUtilizationStatus(utilization);

                      return (
                        <div key={classroom._id} className="px-6 py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-medium text-gray-900">{classroom.name}</h3>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                                  {status.status === 'critical' && <FaExclamationTriangle className="mr-1" />}
                                  {status.status === 'warning' && <FaExclamationTriangle className="mr-1" />}
                                  {status.status === 'good' && <FaCheckCircle className="mr-1" />}
                                  {status.status === 'excellent' && <FaCheckCircle className="mr-1" />}
                                  {utilization.toFixed(1)}% Full
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-gray-600">
                                {classroom.location} • Age: {classroom.ageRange} years
                              </p>
                              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                                <span>Teacher: {classroom.teacher?.firstName || 'Not assigned'}</span>
                                <span>Capacity: {childrenCount} / {classroom.capacity}</span>
                                <span>Available: {classroom.capacity - childrenCount}</span>
                              </div>
                              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    status.status === 'critical' ? 'bg-red-600' :
                                    status.status === 'warning' ? 'bg-yellow-600' :
                                    status.status === 'good' ? 'bg-green-600' : 'bg-blue-600'
                                  }`}
                                  style={{ width: `${utilization}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="ml-4 flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedClassroom(classroom);
                                  setShowCapacityModal(true);
                                }}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                <FaEdit className="mr-1" />
                                Adjust
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Waitlist */}
            <div>
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Waitlist</h2>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {waitlist.length} waiting
                    </span>
                  </div>
                </div>
                <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                  {waitlist.length === 0 ? (
                    <div className="px-6 py-8 text-center">
                      <FaChild className="mx-auto h-8 w-8 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Waitlist is empty</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        No children are currently on the waitlist.
                      </p>
                    </div>
                  ) : (
                    waitlist.map((entry) => (
                      <div key={entry._id} className="px-6 py-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h4 className="text-sm font-medium text-gray-900">{entry.childName}</h4>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(entry.priority)}`}>
                                {entry.priority}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-gray-600">
                              Parent: {entry.parentName}
                            </p>
                            <p className="text-sm text-gray-500">
                              Age Range: {entry.preferredAgeRange} • {entry.parentPhone}
                            </p>
                            {entry.notes && (
                              <p className="mt-1 text-sm text-gray-500">Notes: {entry.notes}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              Added: {new Date(entry.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="ml-4 flex space-x-1">
                            <select
                              onChange={(e) => {
                                if (e.target.value) {
                                  enrollFromWaitlist(entry, e.target.value);
                                }
                              }}
                              className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              defaultValue=""
                            >
                              <option value="">Enroll to...</option>
                              {classrooms
                                .filter(classroom => {
                                  const childrenCount = classroom.children?.length || 0;
                                  return childrenCount < classroom.capacity && 
                                         classroom.ageRange === entry.preferredAgeRange;
                                })
                                .map(classroom => (
                                  <option key={classroom._id} value={classroom._id}>
                                    {classroom.name} ({classroom.capacity - (classroom.children?.length || 0)} available)
                                  </option>
                                ))
                              }
                            </select>
                            <button
                              onClick={() => removeFromWaitlist(entry._id)}
                              className="text-red-600 hover:text-red-800 text-xs"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Capacity Alerts */}
              <div className="mt-6 bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Capacity Alerts</h3>
                </div>
                <div className="p-6">
                  {classrooms.filter(classroom => {
                    const childrenCount = classroom.children?.length || 0;
                    return (childrenCount / classroom.capacity) >= 0.9;
                  }).length === 0 ? (
                    <div className="text-center text-sm text-gray-500">
                      <FaCheckCircle className="mx-auto h-8 w-8 text-green-400 mb-2" />
                      No capacity alerts at this time
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {classrooms
                        .filter(classroom => {
                          const childrenCount = classroom.children?.length || 0;
                          return (childrenCount / classroom.capacity) >= 0.9;
                        })
                        .map(classroom => {
                          const childrenCount = classroom.children?.length || 0;
                          const utilization = (childrenCount / classroom.capacity) * 100;
                          
                          return (
                            <div key={classroom._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                              <div>
                                <p className="text-sm font-medium text-red-800">{classroom.name}</p>
                                <p className="text-sm text-red-600">
                                  {childrenCount} / {classroom.capacity} ({utilization.toFixed(1)}% full)
                                </p>
                              </div>
                              <FaExclamationTriangle className="h-5 w-5 text-red-400" />
                            </div>
                          );
                        })
                      }
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Waitlist Form Modal */}
          {showWaitlistForm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Add to Waitlist</h3>
                  <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Child's Name</label>
                      <input
                        type="text"
                        required
                        value={formData.childName}
                        onChange={(e) => setFormData({...formData, childName: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Parent's Name</label>
                      <input
                        type="text"
                        required
                        value={formData.parentName}
                        onChange={(e) => setFormData({...formData, parentName: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Parent Email</label>
                        <input
                          type="email"
                          required
                          value={formData.parentEmail}
                          onChange={(e) => setFormData({...formData, parentEmail: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Parent Phone</label>
                        <input
                          type="tel"
                          value={formData.parentPhone}
                          onChange={(e) => setFormData({...formData, parentPhone: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Preferred Age Range</label>
                        <select
                          value={formData.preferredAgeRange}
                          onChange={(e) => setFormData({...formData, preferredAgeRange: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                          <option value="0-2">0-2 years</option>
                          <option value="2-3">2-3 years</option>
                          <option value="3-4">3-4 years</option>
                          <option value="4-5">4-5 years</option>
                          <option value="5-6">5-6 years</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Priority</label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData({...formData, priority: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                          <option value="low">Low</option>
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        rows="3"
                        placeholder="Any special requirements or notes..."
                      />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setShowWaitlistForm(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                      >
                        Add to Waitlist
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Capacity Adjustment Modal */}
          {showCapacityModal && selectedClassroom && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Adjust Capacity - {selectedClassroom.name}
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600">
                        Current: {selectedClassroom.children?.length || 0} / {selectedClassroom.capacity}
                      </div>
                      <div className="text-sm text-gray-600">
                        Utilization: {((selectedClassroom.children?.length || 0) / selectedClassroom.capacity * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">New Capacity</label>
                      <input
                        type="number"
                        min={selectedClassroom.children?.length || 0}
                        max="30"
                        defaultValue={selectedClassroom.capacity}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        ref={input => input && input.focus()}
                      />
                    </div>
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        onClick={() => setShowCapacityModal(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          const newCapacity = parseInt(document.querySelector('input[type="number"]').value);
                          updateClassroomCapacity(selectedClassroom._id, newCapacity);
                        }}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                      >
                        Update Capacity
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CapacityManagement;