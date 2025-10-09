import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks/useAuth';

const AccountActivation = () => {
  const [searchParams] = useSearchParams();
  const { activateAccount } = useAuth();
  const [activationStatus, setActivationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [message, setMessage] = useState('');

  const email = searchParams.get('email');
  const token = searchParams.get('token');

  React.useEffect(() => {
    if (token) {
      handleActivation(token);
    }
  }, [token]);

  const handleActivation = async (activationToken: string) => {
    try {
      await activateAccount(activationToken);
      setActivationStatus('success');
      setMessage('Your account has been activated successfully!');
    } catch (error: any) {
      setActivationStatus('error');
      setMessage(error || 'Error during account activation');
    }
  };

  const handleResendEmail = async () => {
    if (!email) return;
    // TODO: Implement resend activation email
    console.log('Resend activation email to:', email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center">
            {activationStatus === 'success' && (
              <CheckCircleIcon className="h-12 w-12 text-green-500" />
            )}
            {activationStatus === 'error' && (
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />
            )}
            {activationStatus === 'pending' && (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            )}
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {token ? 'Account Activation' : 'Check your email'}
          </h2>
        </div>

        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {!token ? (
            // Page d'attente après inscription
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                Registration successful!
              </h3>
              <p className="text-sm text-gray-600">
                A verification email has been sent to:
              </p>
              <p className="text-sm font-medium text-gray-900">
                {email}
              </p>
              <p className="text-sm text-gray-600">
                Click the link in the email to activate your account.
              </p>
              
              <div className="mt-6 space-y-4">
                <button
                  onClick={handleResendEmail}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Resend email
                </button>
                <Link
                  to="/login"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Go to login
                </Link>
              </div>
            </div>
          ) : (
            // Page de résultat d'activation
            <div className="text-center space-y-4">
              {activationStatus === 'pending' && (
                <div>
                  <p className="text-sm text-gray-600">
                    Activating account...
                  </p>
                </div>
              )}
              
              {activationStatus === 'success' && (
                <div>
                  <h3 className="text-lg font-medium text-green-900">
                    Account activated!
                  </h3>
                  <p className="text-sm text-gray-600">
                    {message}
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/login"
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Sign in
                    </Link>
                  </div>
                </div>
              )}
              
              {activationStatus === 'error' && (
                <div>
                  <h3 className="text-lg font-medium text-red-900">
                    Activation error
                  </h3>
                  <p className="text-sm text-gray-600">
                    {message}
                  </p>
                  <div className="mt-6 space-y-3">
                    <button
                      onClick={handleResendEmail}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Resend email d'activation
                    </button>
                    <Link
                      to="/register"
                      className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Create new account
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountActivation;
