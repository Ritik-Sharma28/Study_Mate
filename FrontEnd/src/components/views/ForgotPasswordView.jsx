import React, { useState } from 'react';
import { apiForgotPassword } from '../../services/apiService.js';

const ForgotPasswordView = ({ onGoBack }) => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            await apiForgotPassword(email);
            setMessage('Email sent! Please check your inbox for the reset link.');
        } catch (err) {
            setError(err.message || 'Failed to send email.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
            <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">Forgot Password</h2>

                {message && (
                    <div className="p-3 mb-4 bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-700 rounded-lg text-center">
                        <p className="text-sm font-medium text-green-700 dark:text-green-200">{message}</p>
                    </div>
                )}

                {error && (
                    <div className="p-3 mb-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 rounded-lg text-center">
                        <p className="text-sm font-medium text-red-700 dark:text-red-200">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1 w-full p-2.5 bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 rounded-lg outline-none text-gray-800 dark:text-gray-200 transition-colors"
                            required
                            placeholder="Enter your email"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:opacity-75 disabled:scale-100"
                    >
                        {isLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={onGoBack}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordView;
