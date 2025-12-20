import React, { useState } from 'react';
import { apiResetPassword } from '../../services/apiService.js';

const ResetPasswordView = ({ token, onResetSuccess }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            await apiResetPassword(token, password);
            setMessage('Password reset successful! Redirecting to login...');
            setTimeout(() => {
                onResetSuccess();
            }, 2000);
        } catch (err) {
            setError(err.message || 'Failed to reset password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-500">
            <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100 mb-6">Reset Password</h2>

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
                        <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">New Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1 w-full p-2.5 bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 rounded-lg outline-none text-gray-800 dark:text-gray-200 transition-colors"
                            required
                            placeholder="Enter new password"
                        />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1 w-full p-2.5 bg-gray-100 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-blue-500 rounded-lg outline-none text-gray-800 dark:text-gray-200 transition-colors"
                            required
                            placeholder="Confirm new password"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:opacity-75 disabled:scale-100"
                    >
                        {isLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordView;
