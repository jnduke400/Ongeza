import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CircleDollarSign, Lock, ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../services/apiConfig';

const DotPattern = () => (
    <div className="absolute w-48 h-48 -z-10">
        <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: 36 }).map((_, i) => (
                <div key={i} className="w-2 h-2 bg-gray-200 rounded-full"></div>
            ))}
        </div>
    </div>
);

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [resetToken, setResetToken] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setError('');
        setResetToken(null);

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (!response.ok || data.success === false) {
                throw new Error(data.message || 'Failed to send reset link. Please try again.');
            }
            
            // Use the default token as specified.
            const mockToken = '123456';
            setResetToken(mockToken);
            setMessage(data.data.message || 'A password reset link has been sent. Please check your inbox.');

        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-gray-50 flex items-center justify-center p-4 overflow-hidden">
            <div className="absolute -top-16 -right-16"><DotPattern /></div>
            <div className="absolute -bottom-16 -left-16"><DotPattern /></div>

            <div className="relative z-10 w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center gap-2 mb-4">
                        <CircleDollarSign size={32} className="text-primary" />
                        <h1 className="text-3xl font-bold text-primary">PesaFlow</h1>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">Forgot Password? <Lock size={22} className="text-amber-500" /></h2>
                    <p className="text-gray-500 mt-2">Enter your email and we'll send you instructions to reset your password</p>
                </div>
                
                {message && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-6 text-sm" role="alert">
                        <span className="block sm:inline">{message}</span>
                        {resetToken && (
                            <p className="mt-2">
                                Since email is not configured, please use this link: {' '}
                                <Link to={`/reset-password?token=${resetToken}`} className="font-bold underline">
                                    Reset Password
                                </Link>
                            </p>
                        )}
                    </div>
                )}

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 text-sm" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            id="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                            placeholder="Enter your email"
                        />
                    </div>
                    
                    <div>
                        <button
                            type="submit"
                            disabled={loading || !!message}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-primary-light"
                        >
                             {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-6">
                    <Link to="/login" className="font-medium text-primary hover:text-primary-dark flex items-center justify-center">
                        <ArrowLeft size={16} className="mr-2" />
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;