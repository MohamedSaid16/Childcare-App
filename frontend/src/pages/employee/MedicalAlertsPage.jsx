import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { employeeAPI } from '../../utils/api';
import { FaExclamationTriangle, FaPlus, FaChild, FaStethoscope, FaCalendar, FaSearch } from 'react-icons/fa';

const MedicalAlertsPage = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [children, setChildren] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    childId: '',
    type: 'allergy',
    severity: 'medium',
    description: '',
    instructions: '',
    medication: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });

  useEffect(() => {
    loadAlerts();
    loadChildren();
  }, []);

  const loadAlerts = async () => {
    try {
      const response = await employeeAPI.getMedicalAlerts();
      setAlerts(response.data.data);
    } catch (error) {
      console.error('Failed to load medical alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadChildren = async () => {
    try {
      const response = await employeeAPI.getClassroomChildren();
      setChildren(response.data.data);
    } catch (error) {
      console.error('Failed to load children:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await employeeAPI.createMedicalAlert(formData);
      setShowForm(false);
      setFormData({
        childId: '',
        type: 'allergy',
        severity: 'medium',
        description: '',
        instructions: '',
        medication: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: ''
      });
      loadAlerts();
    } catch (error) {
      console.error('Failed to create medical alert:', error);
    }
  };

  const handleResolve = async (alertId) => {
    if (window.confirm('Mark this medical alert as resolved?')) {
      try {
        await employeeAPI.resolveMedicalAlert(alertId);
        loadAlerts();
      } catch (error) {
        console.error('Failed to resolve alert:', error);
      }
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[severity] || colors.medium;
  };

  const getTypeIcon = (type) => {
    const icons = {
      allergy: '🔴',
      medication: '💊',
      condition: '🩺',
      injury: '🩹',
      other: '⚠️'
    };
    return icons[type] || '⚠️';
  };

  const filteredAlerts = alerts.filter(alert =>
    alert.child.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.child.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeAlerts = filteredAlerts.filter(alert => !alert.resolved);
  const resolvedAlerts = filteredAlerts.filter(alert => alert.resolved);

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
              <h1 className="text-3xl font-bold text-gray-900">Medical Alerts</h1>
              <p className="mt-1 text-sm text-gray-600">
                Manage health information and medical alerts for children
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <FaPlus className="mr-2" />
              New Alert
            </button>
          </div>

          {/* Search */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by child name or alert type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Active Alerts */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Active Alerts</h2>
            <div className="bg-white shadow rounded-lg">
              {activeAlerts.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <FaExclamationTriangle className="mx-auto h-12 w-12 text-green-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No active alerts</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    All children are healthy and safe.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {activeAlerts.map((alert) => (
                    <div key={alert._id} className="px-6 py-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{getTypeIcon(alert.type)}</span>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {alert.child.firstName} {alert.child.lastName}
                              </h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-sm text-gray-500 capitalize">{alert.type}</span>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                                  {alert.severity} severity
                                </span>
                                <span className="text-sm text-gray-500">
                                  <FaCalendar className="inline mr-1" />
                                  {new Date(alert.startDate).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="mt-3 space-y-2">
                            <div>
                              <span className="text-sm font-medium text-gray-700">Description:</span>
                              <p className="text-sm text-gray-600 ml-2 inline">{alert.description}</p>
                            </div>
                            {alert.instructions && (
                              <div>
                                <span className="text-sm font-medium text-gray-700">Instructions:</span>
                                <p className="text-sm text-gray-600 ml-2 inline">{alert.instructions}</p>
                              </div>
                            )}
                            {alert.medication && (
                              <div>
                                <span className="text-sm font-medium text-gray-700">Medication:</span>
                                <p className="text-sm text-gray-600 ml-2 inline">{alert.medication}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleResolve(alert._id)}
                            className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full hover:bg-green-200 transition-colors"
                          >
                            Mark Resolved
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Resolved Alerts */}
          {resolvedAlerts.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Resolved Alerts</h2>
              <div className="bg-white shadow rounded-lg">
                <div className="divide-y divide-gray-200">
                  {resolvedAlerts.map((alert) => (
                    <div key={alert._id} className="px-6 py-4 bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="text-xl">{getTypeIcon(alert.type)}</span>
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {alert.child.firstName} {alert.child.lastName}
                              </h3>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-sm text-gray-500 capitalize">{alert.type}</span>
                                <span className="text-sm text-gray-500">
                                  Resolved on {new Date(alert.updatedAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="mt-2 text-sm text-gray-600">{alert.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Medical Alert Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Create Medical Alert</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Child</label>
                        <select
                          required
                          value={formData.childId}
                          onChange={(e) => setFormData({...formData, childId: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                          <option value="">Select a child</option>
                          {children.map(child => (
                            <option key={child._id} value={child._id}>
                              {child.firstName} {child.lastName}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Type</label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({...formData, type: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                          <option value="allergy">Allergy</option>
                          <option value="medication">Medication</option>
                          <option value="condition">Medical Condition</option>
                          <option value="injury">Injury</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Severity</label>
                        <select
                          value={formData.severity}
                          onChange={(e) => setFormData({...formData, severity: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input
                          type="date"
                          required
                          value={formData.startDate}
                          onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <textarea
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        rows="3"
                        placeholder="Describe the medical issue..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Care Instructions</label>
                      <textarea
                        value={formData.instructions}
                        onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        rows="2"
                        placeholder="Any specific care instructions..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Medication (if any)</label>
                      <input
                        type="text"
                        value={formData.medication}
                        onChange={(e) => setFormData({...formData, medication: e.target.value})}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="Medication name, dosage, frequency..."
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
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                      >
                        Create Alert
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

export default MedicalAlertsPage;