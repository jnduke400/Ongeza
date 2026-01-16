import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
// FIX: Added missing Loader2 import from lucide-react to fix compilation error.
import { CircleDollarSign, ShieldCheck, Eye, EyeOff, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
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

const ResetPinPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [token, setToken] = useState<string | null>(null);
    
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [showConfirmPin, setShowConfirmPin] = useState(false);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const tokenFromUrl = searchParams.get('token');
        if (!tokenFromUrl) {
            setError("Invalid or missing reset token. Please request a new PIN reset link from support.");
        } else {
            setToken(tokenFromUrl);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!/^\d{4}$/.test(pin)) {
            setError("PIN must be exactly 4 digits.");
            return;
        }

        if (pin !== confirmPin) {
            setError("PINs do not match");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/users/reset-pin/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    newPin: pin,
                    confirmPin: confirmPin,
                    token: token,
                }),
            });
            
            const data = await response.json();

            if (!response.ok || data.success === false) {
                throw new Error(data.message || 'Failed to reset PIN.');
            }

            setSuccess(true);
            setMessage(data.data?.message || 'Your security PIN has been reset successfully!');
            setTimeout(() => navigate('/login'), 3000); 

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
                <div className="relative z-10 w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 text-center text-on-surface">
                    <CheckCircle size={56} className="text-primary mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800">PIN Reset Successful!</h2>
                    <p className="text-gray-500 mt-2">{message}</p>
                    <p className="text-gray-500 mt-2 font-medium">Redirecting to login page...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="relative min-h-screen bg-gray-50 flex items-center justify-center p-4 overflow-hidden">
            <div className="absolute -top-16 -right-16"><DotPattern /></div>
            <div className="absolute -bottom-16 -left-16"><DotPattern /></div>

            <div className="relative z-10 w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 text-on-surface">
                <div className="text-center mb-8">
                     <div className="flex justify-center items-center gap-2 mb-4">
                        <CircleDollarSign size={32} className="text-primary" />
                        <h1 className="text-3xl font-bold text-primary">Ongeza</h1>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center justify-center gap-2">Reset PIN <ShieldCheck size={22} className="text-primary" /></h2>
                    <p className="text-gray-500 mt-2">Enter your new 4-digit security PIN.</p>
                </div>
                
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative mb-6 text-sm" role="alert">
                        <span>{error}</span>
                    </div>
                )}

                {token ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">New 4-Digit PIN</label>
                            <input
                                type={showPin ? 'text' : 'password'}
                                required
                                value={pin}
                                onChange={(e) => {
                                    if (/^\d{0,4}$/.test(e.target.value)) {
                                        setPin(e.target.value);
                                    }
                                }}
                                maxLength={4}
                                inputMode="numeric"
                                className="w-full px-4 py-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-center text-2xl font-bold tracking-[1em]"
                                placeholder="····"
                            />
                            <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-4 top-10 text-gray-400 hover:text-gray-600">
                                {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <div className="relative">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New PIN</label>
                            <input
                                type={showConfirmPin ? 'text' : 'password'}
                                required
                                value={confirmPin}
                                onChange={(e) => {
                                    if (/^\d{0,4}$/.test(e.target.value)) {
                                        setConfirmPin(e.target.value);
                                    }
                                }}
                                maxLength={4}
                                inputMode="numeric"
                                className="w-full px-4 py-4 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors text-center text-2xl font-bold tracking-[1em]"
                                placeholder="····"
                            />
                            <button type="button" onClick={() => setShowConfirmPin(!showConfirmPin)} className="absolute right-4 top-10 text-gray-400 hover:text-gray-600">
                                {showConfirmPin ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-primary-light transition-all shadow-md"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    'Reset Security PIN'
                                )}
                            </button>
                        </div>
                    </form>
                ) : null}

                <div className="text-center mt-8">
                    <Link to="/login" className="font-medium text-primary hover:text-primary-dark flex items-center justify-center">
                        <ArrowLeft size={16} className="mr-2" />
                        Back to login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPinPage;