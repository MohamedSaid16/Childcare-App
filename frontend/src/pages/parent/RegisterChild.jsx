import React from 'react';
import AddChildForm from '../../components/forms/AddChildForm';
import { useNavigate } from 'react-router-dom';

const RegisterChild = () => {
  const navigate = useNavigate();

  const handleSuccess = (childData) => {
    navigate('/parent/dashboard', { 
      state: { 
        message: 'Child registered successfully!',
        childName: `${childData.firstName} ${childData.lastName}`
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <AddChildForm onSuccess={handleSuccess} />
    </div>
  );
};

export default RegisterChild;