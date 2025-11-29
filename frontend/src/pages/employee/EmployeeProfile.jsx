import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { employeeAPI } from '../../utils/api';
import { FaUser, FaEnvelope, FaPhone, FaCalendar, FaMapMarkerAlt, FaEdit, FaSave, FaTimes } from 'react-icons/fa';

const EmployeeProfile = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    qualifications: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await employeeAPI.getMyProfile();
      setProfile(response.data.data);
      setFormData({
        firstName: response.data.data.firstName,
        lastName: response.data.data.lastName,
        email: response.data.data.email,
        phone: response.data.data.phone || '',
        address: response.data.data.address || '',
        emergencyContact: response.data.data.emergencyContact || {
          name: '',
          phone: '',
          relationship: ''
        },
        qualifications: response.data.data.qualifications || ''
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await employeeAPI.updateProfile(formData);
      setProfile(response.data.data);
      updateUser(response.data.data);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone || '',
      address: profile.address || '',
      emergencyContact: profile.emergencyContact || {
        name: '',
        phone: '',
        relationship: ''
      },
      qualifications: profile.qualifications || ''
    });
    setIsEditing(false);
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage your personal information and settings
              </p>
            </div>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FaEdit className="mr-2" />
                Edit Profile
              </button>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={handleCancel}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaTimes className="mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <FaSave className="mr-2" />
                  Save Changes
                </button>
              </div>
            )}
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    ) : (
                      <div className="mt-1 flex items-center text-sm text-gray-900">
                        <FaUser className="mr-2 text-gray-400" />
                        {profile.firstName}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    ) : (
                      <div className="mt-1 text-sm text-gray-900">{profile.lastName}</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                      />
                    ) : (
                      <div className="mt-1 flex items-center text-sm text-gray-900">
                        <FaEnvelope className="mr-2 text-gray-400" />
                        {profile.email}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    ) : (
                      <div className="mt-1 flex items-center text-sm text-gray-900">
                        <FaPhone className="mr-2 text-gray-400" />
                        {profile.phone || 'Not provided'}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  {isEditing ? (
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                      rows="3"
                    />
                  ) : (
                    <div className="mt-1 flex items-start text-sm text-gray-900">
                      <FaMapMarkerAlt className="mr-2 text-gray-400 mt-0.5" />
                      {profile.address || 'Not provided'}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Qualifications</label>
                  {isEditing ? (
                    <textarea
                      value={formData.qualifications}
                      onChange={(e) => setFormData({...formData, qualifications: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                      rows="3"
                      placeholder="List your qualifications and certifications..."
                    />
                  ) : (
                    <div className="mt-1 text-sm text-gray-900">
                      {profile.qualifications || 'No qualifications listed'}
                    </div>
                  )}
                </div>

                {/* Emergency Contact */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.emergencyContact.name}
                          onChange={(e) => setFormData({
                            ...formData, 
                            emergencyContact: {...formData.emergencyContact, name: e.target.value}
                          })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <div className="mt-1 text-sm text-gray-900">
                          {profile.emergencyContact?.name || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={formData.emergencyContact.phone}
                          onChange={(e) => setFormData({
                            ...formData, 
                            emergencyContact: {...formData.emergencyContact, phone: e.target.value}
                          })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <div className="mt-1 text-sm text-gray-900">
                          {profile.emergencyContact?.phone || 'Not provided'}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Relationship</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.emergencyContact.relationship}
                          onChange={(e) => setFormData({
                            ...formData, 
                            emergencyContact: {...formData.emergencyContact, relationship: e.target.value}
                          })}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      ) : (
                        <div className="mt-1 text-sm text-gray-900">
                          {profile.emergencyContact?.relationship || 'Not provided'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Employment Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Employment Information</h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                      <div className="mt-1 flex items-center text-sm text-gray-900">
                        <FaUser className="mr-2 text-gray-400" />
                        {profile.employeeId}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Hire Date</label>
                      <div className="mt-1 flex items-center text-sm text-gray-900">
                        <FaCalendar className="mr-2 text-gray-400" />
                        {new Date(profile.hireDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;