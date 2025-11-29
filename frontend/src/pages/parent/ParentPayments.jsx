import React, { useState, useEffect } from 'react';
import { parentAPI } from '../../utils/api';
import PaymentForm from '../../components/forms/PaymentForm';
import { FaDollarSign, FaCalendar, FaReceipt, FaCreditCard, FaCheck, FaClock, FaExclamationTriangle } from 'react-icons/fa';

const ParentPayments = () => {
  const [payments, setPayments] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPaid: 0,
    pendingAmount: 0,
    overdueAmount: 0
  });

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const response = await parentAPI.getMyPayments();
      setPayments(response.data.data);
      calculateStats(response.data.data);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (paymentData) => {
    const totalPaid = paymentData
      .filter(p => p.status === 'paid')
      .reduce((sum, p) => sum + p.totalAmount, 0);
    
    const pendingAmount = paymentData
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.totalAmount, 0);
    
    const overdueAmount = paymentData
      .filter(p => p.status === 'overdue')
      .reduce((sum, p) => sum + p.totalAmount, 0);

    setStats({ totalPaid, pendingAmount, overdueAmount });
  };

  const handlePaymentSuccess = (updatedPayment) => {
    setShowPaymentForm(false);
    setSelectedInvoice(null);
    loadPayments(); // Refresh the list
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'text-green-800 bg-green-100';
      case 'pending': return 'text-yellow-800 bg-yellow-100';
      case 'overdue': return 'text-red-800 bg-red-100';
      default: return 'text-gray-800 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <FaCheck className="h-4 w-4" />;
      case 'pending': return <FaClock className="h-4 w-4" />;
      case 'overdue': return <FaExclamationTriangle className="h-4 w-4" />;
      default: return <FaClock className="h-4 w-4" />;
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
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
            <p className="mt-1 text-sm text-gray-600">
              View and manage your nursery payments
            </p>
          </div>

          {/* Payment Statistics */}
          <div className="grid grid-cols-1 gap-6 mb-8 sm:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                    <FaCheck className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Paid</dt>
                      <dd className="text-lg font-medium text-gray-900">${stats.totalPaid.toFixed(2)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                    <FaClock className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                      <dd className="text-lg font-medium text-gray-900">${stats.pendingAmount.toFixed(2)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-red-500 rounded-md p-3">
                    <FaExclamationTriangle className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Overdue</dt>
                      <dd className="text-lg font-medium text-gray-900">${stats.overdueAmount.toFixed(2)}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form Modal */}
          {showPaymentForm && selectedInvoice && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
              <div className="relative top-20 mx-auto p-4 border w-full max-w-2xl shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <PaymentForm 
                    invoice={selectedInvoice} 
                    onSuccess={handlePaymentSuccess}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payments List */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Payment History</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {payments.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <FaReceipt className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No payments</h3>
                  <p className="mt-1 text-sm text-gray-500">You don't have any payment records yet.</p>
                </div>
              ) : (
                payments.map((payment) => (
                  <div key={payment._id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <FaReceipt className="h-5 w-5 text-indigo-600" />
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">
                              {payment.child.firstName} {payment.child.lastName}
                            </p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                              {getStatusIcon(payment.status)}
                              <span className="ml-1 capitalize">{payment.status}</span>
                            </span>
                          </div>
                          <p className="text-sm text-gray-500">
                            Invoice #{payment.invoiceNumber} • {payment.period.month}/{payment.period.year}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Due: {new Date(payment.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">
                          ${payment.totalAmount.toFixed(2)}
                        </p>
                        {payment.status === 'paid' ? (
                          <div className="text-sm text-gray-500">
                            Paid on {payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : 'N/A'}
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedInvoice(payment);
                              setShowPaymentForm(true);
                            }}
                            className="mt-2 inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <FaCreditCard className="mr-1 h-3 w-3" />
                            Pay Now
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Payment Breakdown */}
                    {payment.breakdown && payment.breakdown.length > 0 && (
                      <div className="mt-3 pl-14">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <h4 className="text-xs font-medium text-gray-700 mb-2">Breakdown</h4>
                          <div className="space-y-1">
                            {payment.breakdown.map((item, index) => (
                              <div key={index} className="flex justify-between text-xs">
                                <span className="text-gray-600">{item.description}</span>
                                <span className="text-gray-900">${item.amount.toFixed(2)}</span>
                              </div>
                            ))}
                            <div className="border-t border-gray-200 pt-1 flex justify-between text-xs font-medium">
                              <span>Total</span>
                              <span>${payment.totalAmount.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Payment Information */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Payment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
              <div>
                <h4 className="font-medium mb-1">Payment Methods</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Credit/Debit Card</li>
                  <li>Bank Transfer</li>
                  <li>Cash (at nursery office)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-1">Contact Information</h4>
                <p>For payment inquiries, please contact:</p>
                <p className="mt-1">
                  📞 (555) 123-4567<br />
                  ✉️ billing@nursery.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentPayments;