import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import { FaUsers, FaChild, FaUserTie, FaPlus, FaEdit, FaTrash, FaSearch, FaMapMarkerAlt } from 'react-icons/fa';

const ManageClasses = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    ageRange: '0-2',
    capacity: 10,
    location: '',
    description: '',
    teacher: ''
  });

  useEffect(() => {
    loadClassrooms();
    loadEmployees();
  }, []);

  const loadClassrooms = async () => {
    try {
      const response = await adminAPI.getClassrooms();
      setClassrooms(response.data.data);
    } catch (error) {
      console.error('Failed to load classrooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await adminAPI.getEmployees();
      setEmployees(response.data.data.filter(emp => emp.position === 'teacher' && emp.isActive));
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClass) {
        await adminAPI.updateClassroom(editingClass._id, formData);
      } else {
        await adminAPI.createClassroom(formData);
      }
      setShowForm(false);
      setEditingClass(null);
      setFormData({
        name: '',
        ageRange: '0-2',
        capacity: 10,
        location: '',
        description: '',
        teacher: ''
      });
      loadClassrooms();
    } catch (error) {
      console.error('Failed to save classroom:', error);
    }
  };

  const handleEdit = (classroom) => {
    setEditingClass(classroom);
    setFormData({
      name: classroom.name,
      ageRange: classroom.ageRange,
      capacity: classroom.capacity,
      location: classroom.location || '',
      description: classroom.description || '',
      teacher: classroom.teacher?._id || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (classroomId) => {
    if (window.confirm('Are you sure you want to delete this classroom? This action cannot be undone.')) {
      try {
        await adminAPI.deleteClassroom(classroomId);
        loadClassrooms();
      } catch (error) {
        console.error('Failed to delete classroom:', error);
      }
    }
  };

  const getAgeRangeColor = (ageRange) => {
    const colors = {
      '0-2': 'bg-pink-100 text-pink-800',
      '2-3': 'bg-purple-100 text-purple-800',
      '3-4': 'bg-blue-100 text-blue-800',
      '4-5': 'bg-green-100 text-green-800',
      '5-6': 'bg-yellow-100 text-yellow-800'
    };
    return colors[ageRange] || 'bg-gray-100 text-gray-800';
  };

  const getUtilizationColor = (utilization) => {
    if (utilization >= 90) return 'bg-red-100 text-red-800';
    if (utilization >= 75) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  const filteredClassrooms = classrooms.filter(classroom =>
    classroom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classroom.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classroom.teacher?.firstName.toLowerCase().includes(searchTerm.toLowerCase())
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
              <h1 className="text-3xl font-bold text-gray-900">Manage Classrooms</h1>
              <p className="mt-1 text-sm text-gray-600">
                View and manage all classrooms and their assignments
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaPlus className="mr-2" />
              Add Classroom
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <FaMapMarkerAlt className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Classrooms</dt>
                      <dd className="text-lg font-medium text-gray-900">{classrooms.length}</dd>
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
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Capacity</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {classrooms.reduce((sum, room) => sum + room.capacity, 0)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
                    <FaUsers className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Enrolled Children</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {classrooms.reduce((sum, room) => sum + (room.children?.length || 0), 0)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
                    <FaUserTie className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active Teachers</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {new Set(classrooms.map(room => room.teacher?._id).filter(Boolean)).size}
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
                placeholder="Search classrooms by name, location, or teacher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Classrooms Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredClassrooms.length === 0 ? (
              <div className="col-span-full bg-white shadow rounded-lg p-12 text-center">
                <FaMapMarkerAlt className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No classrooms found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm ? 'No classrooms match your search.' : 'No classrooms created yet.'}
                </p>
              </div>
            ) : (
              filteredClassrooms.map((classroom) => {
                const childrenCount = classroom.children?.length || 0;
                const utilization = (childrenCount / classroom.capacity) * 100;
                
                return (
                  <div key={classroom._id} className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">{classroom.name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAgeRangeColor(classroom.ageRange)}`}>
                          {classroom.ageRange} years
                        </span>
                      </div>
                      
                      <p className="mt-2 text-sm text-gray-600">{classroom.description}</p>
                      
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Location:</span>
                          <span className="font-medium">{classroom.location}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Teacher:</span>
                          <span className="font-medium">
                            {classroom.teacher 
                              ? `${classroom.teacher.firstName} ${classroom.teacher.lastName}`
                              : 'Not assigned'
                            }
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Capacity:</span>
                          <span className="font-medium">
                            {childrenCount} / {classroom.capacity}
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              utilization >= 90 ? 'bg-red-600' :
                              utilization >= 75 ? 'bg-yellow-600' : 'bg-green-600'
                            }`}
                            style={{ width: `${Math.min(utilization, 100)}%` }}
                          ></div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Utilization:</span>
                          <span className={`font-medium ${getUtilizationColor(utilization)} px-2 py-1 rounded-full text-xs`}>
                            {utilization.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-6 flex justify-between space-x-2">
                        <button
                          onClick={() => handleEdit(classroom)}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <FaEdit className="mr-2" />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(classroom._id)}
                          className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <FaTrash className="mr-2" />
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    {/* Children List */}
                    {childrenCount > 0 && (
                      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Children in Class:</h4>
                        <div className="space-y-1">
                          {classroom.children?.slice(0, 3).map(child => (
                            <div key={child._id} className="flex items-center text-sm text-gray-600">
                              <FaChild className="h-3 w-3 mr-2 text-gray-400" />
                              {child.firstName} {child.lastName}
                            </div>
                          ))}
                          {childrenCount > 3 && (
                            <div className="text-sm text-gray-500">
                              +{childrenCount - 3} more children
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Classroom Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingClass ? 'Edit Classroom' : 'Add New Classroom'}
                  </h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Classroom Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="e.g., Sunshine Room, Rainbow Class"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Age Range</label>
                      <select
                        value={formData.ageRange}
                        onChange={(e) => setFormData({...formData, ageRange: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      >
                        <option value="0-2">Infants (0-2 years)</option>
                        <option value="2-3">Toddlers (2-3 years)</option>
                        <option value="3-4">Preschool (3-4 years)</option>
                        <option value="4-5">Pre-K (4-5 years)</option>
                        <option value="5-6">Kindergarten (5-6 years)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Capacity</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="30"
                        value={formData.capacity}
                        onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="e.g., Building A, Room 101"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Teacher</label>
                      <select
                        value={formData.teacher}
                        onChange={(e) => setFormData({...formData, teacher: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      >
                        <option value="">Select a teacher</option>
                        {employees.map(employee => (
                          <option key={employee._id} value={employee._id}>
                            {employee.firstName} {employee.lastName}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        rows="3"
                        placeholder="Brief description of the classroom..."
                      />
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          setEditingClass(null);
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                      >
                        {editingClass ? 'Update' : 'Create'} Classroom
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageClasses;