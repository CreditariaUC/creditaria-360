import React from 'react';
import LoginForm from './LoginForm';
import { VideoBackground } from './VideoBackground';

const AuthContainer: React.FC = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <VideoBackground />
      <LoginForm />
    </div>
  );
};

export default AuthContainer;