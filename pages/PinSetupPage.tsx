import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../services/apiConfig';
import { interceptedFetch } from '../services/api';

const PinSetupPage: React.FC = () => {
    const { updatePinStatus } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [pin, setPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');
    const [error, setError] = useState('');
    const [showPin, setShowPin] = useState(false);
    const [showConfirmPin, setShowConfirmPin] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const getRedirectState = () => {
        const storedState = sessionStorage.getItem('redirectAfterPin');
        if (storedState) {
            sessionStorage.removeItem('redirectAfterPin'); // Clear after reading
            try {
                return JSON.parse(storedState);
            } catch (e) {
                console.error("Failed to parse redirect state from sessionStorage", e);
                return null;
            }
        }
        return location.state;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (pin.length !== 4) {
            setError('PIN must be exactly 4 digits.');
            return;
        }

        if (pin !== confirmPin) {
            setError('PINs do not match. Please try again.');
            return;
        }

        setLoading(true);
        try {
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/pin/set`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pin }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to set PIN.');
            }

            updatePinStatus(true);
            
            const redirectState = getRedirectState();

            if (redirectState?.fromSessionExpiry) {
                navigate('/verify-pin', { state: { from: redirectState?.from } });
            } else {
                setSuccess(true);
            }

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const DotPattern = () => (
        <svg
            className="w-32 h-32 text-gray-300"
            fill="none"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
        >
            {Array.from({ length: 10 }).map((_, i) =>
                Array.from({ length: 10 }).map((__, j) => (
                    <circle key={`${i}-${j}`} cx={5 + i * 10} cy={5 + j * 10} r="1.5" fill="currentColor" />
                ))
            )}
        </svg>
    );

    if (success) {
        return (
            <div className="relative flex items-center justify-center py-12 overflow-hidden">
                <div className="absolute -top-16 -left-16 -z-10"><DotPattern /></div>
                <div className="absolute -bottom-16 -right-16 -z-10"><DotPattern /></div>
                <div className="relative z-10 max-w-md w-full bg-surface text-on-surface rounded-2xl shadow-lg p-8 border border-gray-200 text-center">
                    <CheckCircle size={64} className="mx-auto text-green-500 mb-6" />
                    <h2 className="text-2xl font-bold mb-3 text-gray-900">PIN Set Successfully!</h2>
                    <p className="text-gray-600 mb-6">
                        Congratulations! Your account is now more secure. You can now use your PIN for quick access.
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-primary-dark transition-all duration-300"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex items-center justify-center py-12 overflow-hidden">
             <div className="absolute -top-16 -left-16 -z-10">
                <DotPattern />
            </div>
            <div className="absolute -bottom-16 -right-16 -z-10">
                <DotPattern />
            </div>
            <div className="relative z-10 max-w-md w-full bg-surface text-on-surface rounded-2xl shadow-lg p-8 border border-gray-200 text-center">
                <div className="flex justify-center items-center gap-3 mb-6">
                    <ShieldCheck size={36} className="text-primary" />
                </div>

                <h2 className="text-2xl font-bold mb-3 text-gray-900">Set Up Your Security PIN</h2>
                <p className="text-gray-600 mb-6">
                    Create a 4-digit PIN to secure your account. This PIN will be required for quick access if your session expires, preventing unauthorized use of your savings.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4 text-left">
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                            New 4-Digit PIN
                        </label>
                        <input
                            type={showPin ? 'text' : 'password'}
                            value={pin}
                            onChange={(e) => {
                                if (/^\d{0,4}$/.test(e.target.value)) {
                                    setPin(e.target.value);
                                }
                            }}
                            maxLength={4}
                            required
                            className="w-full h-14 text-center text-2xl font-semibold bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 tracking-[1em]"
                        />
                         <button type="button" onClick={() => setShowPin(!showPin)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
                            {showPin ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                     <div className="relative">
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                            Confirm PIN
                        </label>
                        <input
                            type={showConfirmPin ? 'text' : 'password'}
                            value={confirmPin}
                            onChange={(e) => {
                                 if (/^\d{0,4}$/.test(e.target.value)) {
                                    setConfirmPin(e.target.value);
                                }
                            }}
                            maxLength={4}
                            required
                            className="w-full h-14 text-center text-2xl font-semibold bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900 tracking-[1em]"
                        />
                         <button type="button" onClick={() => setShowConfirmPin(!showConfirmPin)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
                            {showConfirmPin ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    
                    {error && <p className="text-red-500 text-sm text-center pt-2">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-primary-dark transition-all duration-300 mt-6 flex justify-center items-center disabled:bg-primary/70"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            'Create PIN'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PinSetupPage;