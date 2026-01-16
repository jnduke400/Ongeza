import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CircleDollarSign, Key, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
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

const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [token, setToken] = useState<string | null>(null);
    
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (!tokenFromUrl) {
            setError("Invalid or missing reset token. Please request a new password reset link.");
        } else {
            setToken(tokenFromUrl);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    newPassword: password,
                    confirmPassword: confirmPassword,
                    token: token,
                }),
            });
            
            const data = await response.json();

            if (!response.ok || data.success === false) {
                throw new Error(data.message || 'Failed to reset password.');
            }

            setSuccess(true);
            setMessage(data.data.message || 'Your password has been reset successfully!');
            setTimeout(() => navigate('/login'), 3000); // Redirect to login after 3 seconds

        } catch (err: any) {
            setError(err.message || 'An unknown error occurred.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
             <div className="relative min-h-screen bg-gray-50 flex items-center justify-center p-4 overflow-hidden">
                <div className="absolute -top-16 -right-16"><DotPattern /></div>
                <div className="absolute -bottom-16 -left-16"><DotPattern /></div>
                <div className="relative z-10 w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 text-center">
                    <CheckCircle size={56} className="text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800">Password Reset!</h2>
                    <p className="text-gray-500 mt-2">{message}</p>
                    <p className="text-gray-500 mt-2">Redirecting to login page...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="relative min-h-screen bg-gray-50 flex items-center justify-center p-4 overflow-hidden">
            <div className="absolute -top-16 -right-16"><DotPattern /></div>
            <div className="absolute -bottom-16 -left-16"><DotPattern /></div>

            <div className="relative z-10 w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center mb-8">
                     <div className="flex justify-center items-center gap-2 mb-4">
                        <CircleDollarSign size={32} className="text-primary" />
                        <h1 className="text-3xl font-bold text-primary">Ongeza</h1>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">Reset Password <Key size={22} className="text-primary" /></h2>
                    <p className="text-gray-500 mt-2">Please enter your new password below.</p>
                </div>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 text-sm" role="alert">
                        <span>{error}</span>
                    </div>
                )}

                {token ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                                placeholder="············"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                                placeholder="············"
                            />
                            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-primary-light"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                ) : null}

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

export default ResetPasswordPage;