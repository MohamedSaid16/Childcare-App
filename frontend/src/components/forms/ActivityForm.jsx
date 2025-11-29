import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../../utils/api';
import { FaCalendar, FaClock, FaUsers, FaClipboard, FaImage } from 'react-icons/fa';

const ActivityForm = ({ classroom, onSuccess, editActivity }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'educational',
    classroom: classroom?._id || '',
    date: new Date().toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    participants: [],
    materials: [''],
    learningObjectives: [''],
    photos: []
  });
  const [availableChildren, setAvailableChildren] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (classroom) {
      loadClassroomChildren();
    }
    if (editActivity) {
      setFormData({
        ...editActivity,
        date: new Date(editActivity.date).toISOString().split('T')[0],
        startTime: editActivity.startTime ? new Date(editActivity.startTime).toTimeString().slice(0,5) : '',
        endTime: editActivity.endTime ? new Date(editActivity.endTime).toTimeString().slice(0,5) : '',
        participants: editActivity.participants || []
      });
    }
  }, [classroom, editActivity]);

  const loadClassroomChildren = async () => {
    try {
      const response = await employeeAPI.getClassroomChildren();
      setAvailableChildren(response.data.data);
      
      // Initialize participants with all children
      setFormData(prev => ({
        ...prev,
        participants: response.data.data.map(child => ({
          child: child._id,
          observations: '',
          mood: 'happy'
        }))
      }));
    } catch (error) {
      console.error('Failed to load children:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleArrayChange = (section, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: prev[section].map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleParticipantChange = (childId, field, value) => {
    setFormData(prev => ({
      ...prev,
      participants: prev.participants.map(participant => 
        participant.child === childId ? { ...participant, [field]: value } : participant
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

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Activity title is required');
      return false;
    }
    
    if (!formData.date) {
      setError('Activity date is required');
      return false;
    }
    
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      setError('End time must be after start time');
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
      // Prepare data for submission
      const submitData = {
        ...formData,
        participants: formData.participants.filter(p => p.child), // Remove empty participants
        materials: formData.materials.filter(m => m.trim() !== ''),
        learningObjectives: formData.learningObjectives.filter(obj => obj.trim() !== ''),
        // Convert time strings to full datetime
        startTime: formData.startTime ? `${formData.date}T${formData.startTime}` : null,
        endTime: formData.endTime ? `${formData.date}T${formData.endTime}` : null
      };

      let response;
      if (editActivity) {
        // Update existing activity
        response = await employeeAPI.updateActivity(editActivity._id, submitData);
      } else {
        // Create new activity
        response = await employeeAPI.recordActivity(submitData);
      }

      if (response.data.success) {
        setSuccess(editActivity ? 'Activity updated successfully!' : 'Activity recorded successfully!');
        setTimeout(() => {
          onSuccess(response.data.data);
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.message || `Failed to ${editActivity ? 'update' : 'record'} activity`);
    } finally {
      setLoading(false);
    }
  };

  const activityTypes = [
    { value: 'educational', label: 'Educational', color: 'blue' },
    { value: 'creative', label: 'Creative', color: 'purple' },
    { value: 'physical', label: 'Physical', color: 'green' },
    { value: 'social', label: 'Social', color: 'yellow' },
    { value: 'musical', label: 'Musical', color: 'pink' }
  ];

  const moodOptions = [
    { value: 'happy', label: '😊 Happy', color: 'green' },
    { value: 'calm', label: '😌 Calm', color: 'blue' },
    { value: 'excited', label: '🎉 Excited', color: 'yellow' },
    { value: 'tired', label: '😴 Tired', color: 'gray' },
    { value: 'sad', label: '😢 Sad', color: 'red' }
  ];

  return (
    <div className="max-w-4xl mx-auto bg-white shadow rounded-lg">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {editActivity ? 'Edit Activity' : 'Record New Activity'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Activity Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="e.g., Finger Painting, Story Time, etc."
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Activity Type *
              </label>
              <select
                id="type"
                name="type"
                required
                value={formData.type}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                {activityTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date *
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  id="date"
                  name="date"
                  required
                  value={formData.date}
                  onChange={handleChange}
                  className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaClock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="time"
                    id="startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaClock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="time"
                    id="endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Describe the activity, objectives, and any special instructions..."
            />
          </div>

          {/* Learning Objectives */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Learning Objectives
            </label>
            {formData.learningObjectives.map((objective, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={objective}
                    onChange={(e) => handleArrayChange('learningObjectives', index, '', e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g., Develop fine motor skills, Learn colors..."
                  />
                </div>
                {formData.learningObjectives.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('learningObjectives', index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('learningObjectives', '')}
              className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
            >
              + Add Learning Objective
            </button>
          </div>

          {/* Materials */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Materials Needed
            </label>
            {formData.materials.map((material, index) => (
              <div key={index} className="flex items-center space-x-2 mb-2">
                <div className="flex-1">
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => handleArrayChange('materials', index, '', e.target.value)}
                    className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="e.g., Paint, Paper, Brushes..."
                  />
                </div>
                {formData.materials.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem('materials', index)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('materials', '')}
              className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
            >
              + Add Material
            </button>
          </div>

          {/* Participants */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Participants</h3>
            <div className="space-y-4">
              {availableChildren.map((child) => {
                const participant = formData.participants.find(p => p.child === child._id) || {};
                return (
                  <div key={child._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                          <FaUsers className="h-5 w-5 text-indigo-600" />
                        </div>
                        <div className="ml-3">
                          <h4 className="text-sm font-medium text-gray-900">
                            {child.firstName} {child.lastName}
                          </h4>
                          <p className="text-sm text-gray-500">Age: {child.age}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Mood
                        </label>
                        <select
                          value={participant.mood || 'happy'}
                          onChange={(e) => handleParticipantChange(child._id, 'mood', e.target.value)}
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          {moodOptions.map(mood => (
                            <option key={mood.value} value={mood.value}>
                              {mood.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Observations
                        </label>
                        <input
                          type="text"
                          value={participant.observations || ''}
                          onChange={(e) => handleParticipantChange(child._id, 'observations', e.target.value)}
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="How did the child participate?"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => onSuccess(null)}
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
                editActivity ? 'Update Activity' : 'Record Activity'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityForm;