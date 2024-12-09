import React from 'react';
import LoginForm from './LoginForm';

const AuthContainer: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 py-12 px-4 sm:px-6 lg:px-8">
      <LoginForm />
    </div>
  );
};

export default AuthContainer;