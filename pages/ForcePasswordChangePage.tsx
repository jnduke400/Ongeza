import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CircleDollarSign, Key, Eye, EyeOff, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '../services/apiConfig';
import { interceptedFetch } from '../services/api';

const DotPattern = () => (
    <div className="absolute w-48 h-48 -z-10">
        <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: 36 }).map((_, i) => (
                <div key={i} className="w-2 h-2 bg-gray-200 rounded-full"></div>
            ))}
        </div>
    </div>
);

const ForcePasswordChangePage: React.FC = () => {
    const navigate = useNavigate();
    
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleBackToLogin = () => {
        localStorage.clear();
        sessionStorage.clear();
        navigate('/login');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword.length < 8) {
            setError("New password must be at least 8 characters long.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        try {
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmPassword,
                }),
            });
            
            const data = await response.json();

            if (!response.ok || data.success === false) {
                throw new Error(data.message || 'Failed to update password.');
            }

            setSuccess(true);
            setMessage(data.data?.message || 'Your password has been changed successfully!');

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
                <div className="relative z-10 w-full max-w-md bg-white p-8 sm:p-12 rounded-2xl shadow-xl border border-gray-100 text-center">
                    <CheckCircle size={64} className="text-primary mx-auto mb-6" />
                    <h2 className="text-2xl font-bold text-gray-800">Password Changed!</h2>
                    <p className="text-gray-500 mt-4 leading-relaxed">{message}</p>
                    <button 
                        onClick={handleBackToLogin}
                        className="mt-8 w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition-all shadow-lg active:scale-[0.98]"
                    >
                        Back to login
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="relative min-h-screen bg-gray-50 flex items-center justify-center p-4 overflow-hidden font-sans">
            <div className="absolute -top-16 -right-16"><DotPattern /></div>
            <div className="absolute -bottom-16 -left-16"><DotPattern /></div>

            <div className="relative z-10 w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center mb-8">
                     <div className="flex justify-center items-center gap-2 mb-4">
                        <CircleDollarSign size={32} className="text-primary" />
                        <h1 className="text-3xl font-bold text-primary tracking-tight">Ongeza</h1>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">Reset Password <Key size={22} className="text-primary" /></h2>
                    <p className="text-gray-500 mt-2 font-medium">Please enter your new password below.</p>
                </div>
                
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative mb-6 text-sm flex items-center" role="alert">
                        <span className="block">{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Old Password</label>
                        <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-800 placeholder-gray-300"
                            placeholder="············"
                        />
                        <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-10 text-gray-400 hover:text-gray-600 transition-colors">
                            {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-bold text-gray-700 mb-1">New Password</label>
                        <input
                            type={showNewPassword ? 'text' : 'password'}
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-800 placeholder-gray-300"
                            placeholder="············"
                        />
                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-10 text-gray-400 hover:text-gray-600 transition-colors">
                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-bold text-gray-700 mb-1">Confirm New Password</label>
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-gray-800 placeholder-gray-300"
                            placeholder="············"
                        />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-10 text-gray-400 hover:text-gray-600 transition-colors">
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all shadow-lg active:scale-[0.98] disabled:bg-primary-light disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Reset Password'}
                        </button>
                    </div>
                </form>

                <div className="text-center mt-8 pt-4">
                    <button 
                        onClick={handleBackToLogin}
                        className="font-bold text-primary hover:text-primary-dark flex items-center justify-center transition-colors mx-auto"
                    >
                        <ArrowLeft size={18} className="mr-2" />
                        Back to login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ForcePasswordChangePage;