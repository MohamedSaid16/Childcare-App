import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import { FaDollarSign, FaSearch, FaEye, FaCheck, FaTimes, FaPrint, FaEnvelope, FaCalendar, FaUser } from 'react-icons/fa';

const ManagePayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [filter, setFilter] = useState('all');
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const response = await adminAPI.getPayments();
      setPayments(response.data.data);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (paymentId, status) => {
    try {
      await adminAPI.updatePaymentStatus(paymentId, { status });
      loadPayments();
    } catch (error) {
      console.error('Failed to update payment status:', error);
    }
  };

  const sendReminder = async (paymentId) => {
    try {
      await adminAPI.sendPaymentReminder(paymentId);
      alert('Payment reminder sent successfully!');
    } catch (error) {
      console.error('Failed to send reminder:', error);
    }
  };

  const generateInvoice = async (paymentId) => {
    try {
      const response = await adminAPI.generateInvoice(paymentId);
      // In a real app, this would download the PDF
      window.open(response.data.invoiceUrl, '_blank');
    } catch (error) {
      console.error('Failed to generate invoice:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      failed: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.pending;
  };

  const getTotalStats = () => {
    const total = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const paid = payments
      .filter(p => p.status === 'paid')
      .reduce((sum, payment) => sum + payment.amount, 0);
    const pending = payments
      .filter(p => p.status === 'pending')
      .reduce((sum, payment) => sum + payment.amount, 0);
    const overdue = payments
      .filter(p => p.status === 'overdue')
      .reduce((sum, payment) => sum + payment.amount, 0);

    return { total, paid, pending, overdue };
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.parent?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.parent?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.child?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = 
      filter === 'all' || 
      payment.status === filter;

    const matchesDate = 
      (!dateRange.start || new Date(payment.dueDate) >= new Date(dateRange.start)) &&
      (!dateRange.end || new Date(payment.dueDate) <= new Date(dateRange.end));

    return matchesSearch && matchesFilter && matchesDate;
  });

  const stats = getTotalStats();

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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Manage Payments</h1>
            <p className="mt-1 text-sm text-gray-600">
              View and manage all payment transactions
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <FaDollarSign className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                      <dd className="text-lg font-medium text-gray-900">${stats.total.toFixed(2)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <FaCheck className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Paid</dt>
                      <dd className="text-lg font-medium text-gray-900">${stats.paid.toFixed(2)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <FaCalendar className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                      <dd className="text-lg font-medium text-gray-900">${stats.pending.toFixed(2)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                    <FaTimes className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Overdue</dt>
                      <dd className="text-lg font-medium text-gray-900">${stats.overdue.toFixed(2)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
              <div className="sm:col-span-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaSearch className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by parent, child, or invoice number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <div>
                <button
                  onClick={() => {
                    setDateRange({ start: '', end: '' });
                    setFilter('all');
                    setSearchTerm('');
                  }}
                  className="w-full px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Clear Filters
                </button>
              </div>
            </div>
            
            {/* Date Range */}
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
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
              <div className="flex items-end">
                <button
                  onClick={loadPayments}
                  className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Payment Records</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parent & Child
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <FaDollarSign className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {searchTerm || filter !== 'all' ? 'No payments match your filters.' : 'No payment records yet.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((payment) => (
                      <tr key={payment._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {payment.invoiceNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(payment.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {payment.parent?.firstName} {payment.parent?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payment.child?.firstName} {payment.child?.lastName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ${payment.amount.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500 capitalize">
                            {payment.type}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(payment.dueDate).toLocaleDateString()}
                          </div>
                          <div className={`text-sm ${
                            new Date(payment.dueDate) < new Date() && payment.status !== 'paid'
                              ? 'text-red-600'
                              : 'text-gray-500'
                          }`}>
                            {new Date(payment.dueDate) < new Date() && payment.status !== 'paid'
                              ? 'Overdue'
                              : 'Due'
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedPayment(payment);
                                setShowDetails(true);
                              }}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              <FaEye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => generateInvoice(payment._id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <FaPrint className="h-4 w-4" />
                            </button>
                            {payment.status !== 'paid' && (
                              <button
                                onClick={() => sendReminder(payment._id)}
                                className="text-yellow-600 hover:text-yellow-900"
                              >
                                <FaEnvelope className="h-4 w-4" />
                              </button>
                            )}
                            {payment.status === 'pending' && (
                              <button
                                onClick={() => handleStatusUpdate(payment._id, 'paid')}
                                className="text-green-600 hover:text-green-900"
                              >
                                <FaCheck className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Details Modal */}
          {showDetails && selectedPayment && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Payment Details - {selectedPayment.invoiceNumber}
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
                        <label className="block text-sm font-medium text-gray-700">Invoice Number</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedPayment.invoiceNumber}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Amount</label>
                        <p className="mt-1 text-sm text-gray-900">${selectedPayment.amount.toFixed(2)}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Parent</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedPayment.parent?.firstName} {selectedPayment.parent?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{selectedPayment.parent?.email}</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Child</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedPayment.child?.firstName} {selectedPayment.child?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {selectedPayment.child?.classroom?.name}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Due Date</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(selectedPayment.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedPayment.status)}`}>
                          {selectedPayment.status}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                      <p className="mt-1 text-sm text-gray-900 capitalize">
                        {selectedPayment.paymentMethod || 'Not specified'}
                      </p>
                    </div>
                    
                    {selectedPayment.notes && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Notes</label>
                        <p className="mt-1 text-sm text-gray-900">{selectedPayment.notes}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Created</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(selectedPayment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {new Date(selectedPayment.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => generateInvoice(selectedPayment._id)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <FaPrint className="mr-2" />
                      Print Invoice
                    </button>
                    {selectedPayment.status !== 'paid' && (
                      <button
                        onClick={() => sendReminder(selectedPayment._id)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                      >
                        <FaEnvelope className="mr-2" />
                        Send Reminder
                      </button>
                    )}
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

export default ManagePayments;