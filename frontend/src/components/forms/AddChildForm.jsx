import React, { useState } from 'react';
import { parentAPI } from '../../utils/api';
import { useNavigate } from 'react-router-dom';
import { 
  FaUser, 
  FaCalendar, 
  FaVenusMars, 
  FaAllergies, 
  FaNotesMedical,
  FaUserMd 
} from 'react-icons/fa';

const AddChildForm = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    medicalInfo: {
      allergies: [''],
      medications: [{ name: '', dosage: '', timing: '' }],
      specialNeeds: '',
      doctorName: '',
      doctorPhone: ''
    },
    emergencyContacts: [
      { name: '', phone: '', relationship: '' }
    ]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    setError('');
    setSuccess('');
  };

  const handleArrayChange = (section, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addArrayItem = (section, template) => {
    setFormData(prev => ({
      ...prev,
      [section]: [...prev[section], template]
    }));
  };

  const removeArrayItem = (section, index) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const calculateAge = (dateString) => {
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName) {
      setError('First name and last name are required');
      return false;
    }
    
    if (!formData.dateOfBirth) {
      setError('Date of birth is required');
      return false;
    }
    
    const age = calculateAge(formData.dateOfBirth);
    if (age < 0 || age > 6) {
      setError('Child must be between 0 and 6 years old');
      return false;
    }
    
    if (!formData.gender) {
      setError('Please select gender');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Clean up empty array items
      const submitData = {
        ...formData,
        medicalInfo: {
          ...formData.medicalInfo,
          allergies: formData.medicalInfo.allergies.filter(allergy => allergy.trim() !== ''),
          medications: formData.medicalInfo.medications.filter(med => med.name.trim() !== '')
        },
        emergencyContacts: formData.emergencyContacts.filter(contact => 
          contact.name.trim() !== '' && contact.phone.trim() !== ''
        )
      };

      const response = await parentAPI.registerChild(submitData);
      
      if (response.data.success) {
        setSuccess('Child registered successfully!');
        setTimeout(() => {
          navigate('/parent/dashboard');
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to register child');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Register New Child
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Add your child's information to our nursery system
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {error && (
              <div className="rounded-md bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-1 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="rounded-md bg-green-50 p-4 border border-green-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">Success</h3>
                    <div className="mt-1 text-sm text-green-700">{success}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name *
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaUser className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleChange}
                      className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Emma"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name *
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleChange}
                      className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Johnson"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
                    Date of Birth *
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaCalendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      required
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                  {formData.dateOfBirth && (
                    <p className="mt-1 text-sm text-gray-500">
                      Age: {calculateAge(formData.dateOfBirth)} years old
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                    Gender *
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaVenusMars className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      id="gender"
                      name="gender"
                      required
                      value={formData.gender}
                      onChange={handleChange}
                      className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Medical Information</h3>
              
              {/* Allergies */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergies
                </label>
                {formData.medicalInfo.allergies.map((allergy, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaAllergies className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={allergy}
                        onChange={(e) => handleArrayChange('medicalInfo.allergies', index, '', e.target.value)}
                        className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="e.g., Peanuts, Dairy, etc."
                      />
                    </div>
                    {formData.medicalInfo.allergies.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeArrayItem('medicalInfo.allergies', index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('medicalInfo.allergies', '')}
                  className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  + Add Allergy
                </button>
              </div>

              {/* Medications */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Medications
                </label>
                {formData.medicalInfo.medications.map((medication, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Medication Name</label>
                        <input
                          type="text"
                          value={medication.name}
                          onChange={(e) => handleArrayChange('medicalInfo.medications', index, 'name', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="e.g., Antibiotic"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Dosage</label>
                        <input
                          type="text"
                          value={medication.dosage}
                          onChange={(e) => handleArrayChange('medicalInfo.medications', index, 'dosage', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="e.g., 5ml"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500">Timing</label>
                        <input
                          type="text"
                          value={medication.timing}
                          onChange={(e) => handleArrayChange('medicalInfo.medications', index, 'timing', e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="e.g., Twice daily"
                        />
                      </div>
                    </div>
                    {formData.medicalInfo.medications.length > 1 && (
                      <div className="mt-2 text-right">
                        <button
                          type="button"
                          onClick={() => removeArrayItem('medicalInfo.medications', index)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove Medication
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayItem('medicalInfo.medications', { name: '', dosage: '', timing: '' })}
                  className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
                >
                  + Add Medication
                </button>
              </div>

              {/* Special Needs & Doctor Info */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="medicalInfo.specialNeeds" className="block text-sm font-medium text-gray-700">
                    Special Needs
                  </label>
                  <div className="mt-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaNotesMedical className="h-5 w-5 text-gray-400" />
                    </div>
                    <textarea
                      id="medicalInfo.specialNeeds"
                      name="medicalInfo.specialNeeds"
                      rows={3}
                      value={formData.medicalInfo.specialNeeds}
                      onChange={handleChange}
                      className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Any special needs or conditions..."
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label htmlFor="medicalInfo.doctorName" className="block text-sm font-medium text-gray-700">
                      Doctor's Name
                    </label>
                    <div className="mt-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUserMd className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        id="medicalInfo.doctorName"
                        name="medicalInfo.doctorName"
                        value={formData.medicalInfo.doctorName}
                        onChange={handleChange}
                        className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Dr. Smith"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="medicalInfo.doctorPhone" className="block text-sm font-medium text-gray-700">
                      Doctor's Phone
                    </label>
                    <input
                      type="tel"
                      id="medicalInfo.doctorPhone"
                      name="medicalInfo.doctorPhone"
                      value={formData.medicalInfo.doctorPhone}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Contacts */}
            <div className="border-t border-gray-200 pt-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contacts</h3>
              {formData.emergencyContacts.map((contact, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Contact Name *</label>
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => handleArrayChange('emergencyContacts', index, 'name', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Phone Number *</label>
                      <input
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => handleArrayChange('emergencyContacts', index, 'phone', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="+1 (555) 123-4567"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500">Relationship *</label>
                      <input
                        type="text"
                        value={contact.relationship}
                        onChange={(e) => handleArrayChange('emergencyContacts', index, 'relationship', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Father, Mother, etc."
                        required
                      />
                    </div>
                  </div>
                  {formData.emergencyContacts.length > 1 && (
                    <div className="mt-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeArrayItem('emergencyContacts', index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove Contact
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={() => addArrayItem('emergencyContacts', { name: '', phone: '', relationship: '' })}
                className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
              >
                + Add Emergency Contact
              </button>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate('/parent/dashboard')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  'Register Child'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddChildForm;