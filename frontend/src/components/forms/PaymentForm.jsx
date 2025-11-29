import React, { useState } from 'react';
import { parentAPI } from '../../utils/api';
import { FaCreditCard, FaUniversity, FaMoneyBillWave, FaCheck } from 'react-icons/fa';

const PaymentForm = ({ invoice, onSuccess }) => {
  const [formData, setFormData] = useState({
    paymentMethod: 'card',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: '',
    bankName: '',
    accountNumber: '',
    routingNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (formData.paymentMethod === 'card') {
      if (!formData.cardNumber || !formData.expiryDate || !formData.cvv || !formData.cardHolder) {
        setError('Please fill all card details');
        return false;
      }
      
      if (formData.cardNumber.replace(/\s/g, '').length !== 16) {
        setError('Please enter a valid 16-digit card number');
        return false;
      }
      
      if (formData.cvv.length !== 3) {
        setError('Please enter a valid 3-digit CVV');
        return false;
      }
    } else if (formData.paymentMethod === 'bank_transfer') {
      if (!formData.bankName || !formData.accountNumber || !formData.routingNumber) {
        setError('Please fill all bank transfer details');
        return false;
      }
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
      const transactionId = `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await parentAPI.makePayment(invoice._id, {
        paymentMethod: formData.paymentMethod,
        transactionId: transactionId
      });

      if (response.data.success) {
        setSuccess('Payment processed successfully!');
        setTimeout(() => {
          onSuccess(response.data.data);
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCardNumber = (value) => {
    return value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  const formatExpiryDate = (value) => {
    return value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').substr(0, 5);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow rounded-lg">
      <div className="p-6">
        {/* Invoice Summary */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Invoice Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Invoice #:</span>
              <p className="font-medium">{invoice.invoiceNumber}</p>
            </div>
            <div>
              <span className="text-gray-600">Child:</span>
              <p className="font-medium">{invoice.child.firstName} {invoice.child.lastName}</p>
            </div>
            <div>
              <span className="text-gray-600">Period:</span>
              <p className="font-medium">{invoice.period.month}/{invoice.period.year}</p>
            </div>
            <div>
              <span className="text-gray-600">Amount Due:</span>
              <p className="font-medium text-lg text-green-600">${invoice.totalAmount}</p>
            </div>
          </div>
        </div>

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
                  <FaCheck className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">Success</h3>
                  <div className="mt-1 text-sm text-green-700">{success}</div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Payment Method
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <label className="relative flex cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="card"
                  checked={formData.paymentMethod === 'card'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`flex items-center justify-center w-full p-3 border-2 rounded-lg ${
                  formData.paymentMethod === 'card' 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-300 bg-white'
                }`}>
                  <FaCreditCard className={`h-5 w-5 ${
                    formData.paymentMethod === 'card' ? 'text-indigo-600' : 'text-gray-400'
                  }`} />
                  <span className="ml-2 text-sm font-medium">Credit Card</span>
                </div>
              </label>

              <label className="relative flex cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bank_transfer"
                  checked={formData.paymentMethod === 'bank_transfer'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`flex items-center justify-center w-full p-3 border-2 rounded-lg ${
                  formData.paymentMethod === 'bank_transfer' 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-300 bg-white'
                }`}>
                  <FaUniversity className={`h-5 w-5 ${
                    formData.paymentMethod === 'bank_transfer' ? 'text-indigo-600' : 'text-gray-400'
                  }`} />
                  <span className="ml-2 text-sm font-medium">Bank Transfer</span>
                </div>
              </label>

              <label className="relative flex cursor-pointer">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={formData.paymentMethod === 'cash'}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`flex items-center justify-center w-full p-3 border-2 rounded-lg ${
                  formData.paymentMethod === 'cash' 
                    ? 'border-indigo-500 bg-indigo-50' 
                    : 'border-gray-300 bg-white'
                }`}>
                  <FaMoneyBillWave className={`h-5 w-5 ${
                    formData.paymentMethod === 'cash' ? 'text-indigo-600' : 'text-gray-400'
                  }`} />
                  <span className="ml-2 text-sm font-medium">Cash</span>
                </div>
              </label>
            </div>
          </div>

          {/* Card Payment Details */}
          {formData.paymentMethod === 'card' && (
            <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-900">Card Details</h4>
              
              <div>
                <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  id="cardHolder"
                  name="cardHolder"
                  required
                  value={formData.cardHolder}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700">
                  Card Number
                </label>
                <div className="mt-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaCreditCard className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    required
                    value={formData.cardNumber}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      cardNumber: formatCardNumber(e.target.value)
                    }))}
                    maxLength={19}
                    className="pl-10 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      expiryDate: formatExpiryDate(e.target.value)
                    }))}
                    maxLength={5}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="MM/YY"
                  />
                </div>

                <div>
                  <label htmlFor="cvv" className="block text-sm font-medium text-gray-700">
                    CVV
                  </label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    required
                    value={formData.cvv}
                    onChange={handleChange}
                    maxLength={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="123"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bank Transfer Details */}
          {formData.paymentMethod === 'bank_transfer' && (
            <div className="space-y-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-900">Bank Transfer Details</h4>
              
              <div>
                <label htmlFor="bankName" className="block text-sm font-medium text-gray-700">
                  Bank Name
                </label>
                <input
                  type="text"
                  id="bankName"
                  name="bankName"
                  required
                  value={formData.bankName}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Bank of America"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700">
                    Account Number
                  </label>
                  <input
                    type="text"
                    id="accountNumber"
                    name="accountNumber"
                    required
                    value={formData.accountNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="123456789"
                  />
                </div>

                <div>
                  <label htmlFor="routingNumber" className="block text-sm font-medium text-gray-700">
                    Routing Number
                  </label>
                  <input
                    type="text"
                    id="routingNumber"
                    name="routingNumber"
                    required
                    value={formData.routingNumber}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="021000021"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Cash Payment Notice */}
          {formData.paymentMethod === 'cash' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FaMoneyBillWave className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Cash Payment</h3>
                  <div className="mt-1 text-sm text-yellow-700">
                    Please bring the exact amount to the nursery office. Your payment will be processed manually.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Secure Payment</h3>
                <div className="mt-1 text-sm text-blue-700">
                  Your payment information is encrypted and secure. We do not store your card details.
                </div>
              </div>
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
                `Pay $${invoice.totalAmount}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentForm;