import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import { FaChild, FaSearch, FaEye, FaEdit, FaTrash, FaPlus, FaUsers, FaBirthdayCake, FaMapMarkerAlt } from 'react-icons/fa';

const ManageChildren = () => {
  const [children, setChildren] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChild, setSelectedChild] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: 'male',
    allergies: '',
    medicalConditions: '',
    specialNeeds: '',
    classroom: '',
    parent: ''
  });

  useEffect(() => {
    loadChildren();
    loadClassrooms();
    loadParents();
  }, []);

  const loadChildren = async () => {
    try {
      const response = await adminAPI.getChildren();
      setChildren(response.data.data);
    } catch (error) {
      console.error('Failed to load children:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClassrooms = async () => {
    try {
      const response = await adminAPI.getClassrooms();
      setClassrooms(response.data.data);
    } catch (error) {
      console.error('Failed to load classrooms:', error);
    }
  };

  const loadParents = async () => {
    try {
      const response = await adminAPI.getParents();
      setParents(response.data.data);
    } catch (error) {
      console.error('Failed to load parents:', error);
    }
  };

  const handleCreateChild = async (e) => {
    e.preventDefault();
    try {
      await adminAPI.createChild(formData);
      setShowForm(false);
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'male',
        allergies: '',
        medicalConditions: '',
        specialNeeds: '',
        classroom: '',
        parent: ''
      });
      loadChildren();
    } catch (error) {
      console.error('Failed to create child:', error);
    }
  };

  const handleDeleteChild = async (childId) => {
    if (window.confirm('Are you sure you want to delete this child? This action cannot be undone.')) {
      try {
        await adminAPI.deleteChild(childId);
        loadChildren();
      } catch (error) {
        console.error('Failed to delete child:', error);
      }
    }
  };

  const calculateAge = (dateOfBirth) => {
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const filteredChildren = children.filter(child =>
    child.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    child.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    child.classroom?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAgeGroup = (age) => {
    if (age < 2) return 'Infant';
    if (age < 3) return 'Toddler';
    if (age < 5) return 'Preschool';
    return 'Kindergarten';
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
              <h1 className="text-3xl font-bold text-gray-900">Manage Children</h1>
              <p className="mt-1 text-sm text-gray-600">
                View and manage all children in the nursery
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaPlus className="mr-2" />
              Add Child
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <FaChild className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Children</dt>
                      <dd className="text-lg font-medium text-gray-900">{children.length}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <FaUsers className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Active</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {children.filter(c => c.isActive).length}
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
                    <FaBirthdayCake className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Avg Age</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {(
                          children.reduce((acc, child) => acc + calculateAge(child.dateOfBirth), 0) / 
                          children.length
                        ).toFixed(1)} years
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
                    <FaMapMarkerAlt className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Classrooms</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {new Set(children.map(c => c.classroom?._id).filter(Boolean)).size}
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
                placeholder="Search children by name or classroom..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Children Table */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Children</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Child
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Classroom
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Medical Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredChildren.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <FaChild className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No children found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {searchTerm ? 'No children match your search.' : 'No children registered yet.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredChildren.map((child) => (
                      <tr key={child._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                              <FaChild className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {child.firstName} {child.lastName}
                              </div>
                              <div className="text-sm text-gray-500 capitalize">
                                {child.gender}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {calculateAge(child.dateOfBirth)} years
                          </div>
                          <div className="text-sm text-gray-500">
                            {getAgeGroup(calculateAge(child.dateOfBirth))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {child.classroom?.name || 'Not assigned'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {child.parent?.firstName} {child.parent?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {child.parent?.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {child.allergies ? 'Allergies' : child.medicalConditions ? 'Conditions' : 'None'}
                          </div>
                          {child.specialNeeds && (
                            <div className="text-sm text-gray-500">Special needs</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedChild(child);
                                setShowDetails(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <FaEye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteChild(child._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FaTrash className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Child Details Modal */}
          {showDetails && selectedChild && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedChild.firstName} {selectedChild.lastName}
                    </h3>
                    <button
                      onClick={() => setShowDetails(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <FaTimes className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(selectedChild.dateOfBirth).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Age</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {calculateAge(selectedChild.dateOfBirth)} years
                          ({getAgeGroup(calculateAge(selectedChild.dateOfBirth))})
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        <p className="mt-1 text-sm text-gray-900 capitalize">{selectedChild.gender}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Classroom</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedChild.classroom?.name || 'Not assigned'}
                        </p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Parent</label>
                      <div className="mt-1 text-sm text-gray-900">
                        {selectedChild.parent?.firstName} {selectedChild.parent?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {selectedChild.parent?.email} • {selectedChild.parent?.phone}
                      </div>
                    </div>
                    
                    {selectedChild.allergies && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Allergies</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedChild.allergies}</p>
                      </div>
                    )}
                    
                    {selectedChild.medicalConditions && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Medical Conditions</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedChild.medicalConditions}</p>
                      </div>
                    )}
                    
                    {selectedChild.specialNeeds && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Special Needs</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedChild.specialNeeds}</p>
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Registration Date</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(selectedChild.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Add Child Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Child</h3>
                  <form onSubmit={handleCreateChild} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">First Name</label>
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                        <input
                          type="date"
                          required
                          value={formData.dateOfBirth}
                          onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Gender</label>
                        <select
                          value={formData.gender}
                          onChange={(e) => setFormData({...formData, gender: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Classroom</label>
                        <select
                          value={formData.classroom}
                          onChange={(e) => setFormData({...formData, classroom: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                          <option value="">Select a classroom</option>
                          {classrooms.map(classroom => (
                            <option key={classroom._id} value={classroom._id}>
                              {classroom.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Parent</label>
                        <select
                          required
                          value={formData.parent}
                          onChange={(e) => setFormData({...formData, parent: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                          <option value="">Select a parent</option>
                          {parents.map(parent => (
                            <option key={parent._id} value={parent._id}>
                              {parent.firstName} {parent.lastName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Allergies</label>
                      <textarea
                        value={formData.allergies}
                        onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        rows="2"
                        placeholder="List any allergies..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Medical Conditions</label>
                      <textarea
                        value={formData.medicalConditions}
                        onChange={(e) => setFormData({...formData, medicalConditions: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        rows="2"
                        placeholder="List any medical conditions..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Special Needs</label>
                      <textarea
                        value={formData.specialNeeds}
                        onChange={(e) => setFormData({...formData, specialNeeds: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        rows="2"
                        placeholder="List any special needs or accommodations..."
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
                        Create Child
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

export default ManageChildren;