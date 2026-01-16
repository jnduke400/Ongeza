import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CircleDollarSign } from 'lucide-react';
import { API_BASE_URL } from '../services/apiConfig';
import { interceptedFetch } from '../services/api';

const DotPattern = () => (
    <div className="absolute w-48 h-48 -z-10">
        <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: 36 }).map((_, i) => (
                <div key={i} className="w-2 h-2 bg-gray-200/50 rounded-full"></div>
            ))}
        </div>
    </div>
);

const PinVerificationPage: React.FC = () => {
    const [pin, setPin] = useState(['', '', '', '']);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        inputsRef.current[0]?.focus();
    }, []);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const { value } = e.target;
        // Allow only single digits
        if (/^[0-9]$/.test(value) || value === '') {
            const newPin = [...pin];
            newPin[index] = value;
            setPin(newPin);
            setError(''); // Clear error on new input

            // Move focus to next input if a digit was entered
            if (value && index < 3) {
                inputsRef.current[index + 1]?.focus();
            }
        }
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && pin[index] === '' && index > 0) {
            inputsRef.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
        if (pasteData.length === 4) {
            setPin(pasteData.split(''));
            inputsRef.current[3]?.focus();
        }
    };

    // Auto-submit when all digits are filled
    useEffect(() => {
        if (pin.every(digit => digit !== '')) {
            handleSubmit();
        }
    }, [pin]);
    
    const getRedirectState = () => {
        const storedState = sessionStorage.getItem('redirectAfterPin');
        if (storedState) {
            sessionStorage.removeItem('redirectAfterPin'); // Clear after reading
            try {
                return JSON.parse(storedState);
            } catch(e) {
                console.error("Failed to parse redirect state from sessionStorage", e);
                return null;
            }
        }
        return location.state;
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (pin.join('').length !== 4) {
            setError('Please enter a 4-digit PIN.');
            return;
        }
        setError('');
        setLoading(true);

        const fullPin = pin.join('');
        
        try {
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/pin/verify`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ pin: fullPin }),
            });

            const data = await response.json();

            if (!response.ok || data.success === false) {
                throw new Error(data.message || 'PIN verification failed.');
            }
            
            // On successful verification, update the session ID
            if (data.data && data.data.sessionId) {
                localStorage.setItem('sessionId', data.data.sessionId);
            }
            
            // Navigate to the original destination or dashboard
            const redirectState = getRedirectState();
            const from = redirectState?.from || '/dashboard';
            navigate(from, { replace: true });

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            setPin(['', '', '', '']); // Clear PIN on error
            inputsRef.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-gray-50 flex items-center justify-center p-4 overflow-hidden">
            <div className="absolute -top-20 -right-20"><DotPattern /></div>
            <div className="absolute -bottom-20 -left-20"><DotPattern /></div>

            <div className="relative z-10 w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center gap-2 mb-4">
                        <CircleDollarSign size={32} className="text-primary" />
                        <h1 className="text-3xl font-bold text-primary">Ongeza</h1>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">PIN Verification 💭</h2>
                    <p className="text-gray-500 mt-2">Please enter your 4-digit security PIN to continue.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 text-center mb-4">Type your 4 digit security code</label>
                        <div className="flex justify-center gap-3 sm:gap-4" onPaste={handlePaste}>
                            {pin.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { inputsRef.current[index] = el; }}
                                    type="password"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(e, index)}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    className="w-14 h-14 sm:w-16 sm:h-16 text-center text-2xl font-semibold bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                                />
                            ))}
                        </div>
                    </div>
                     {error && (
                        <p className="text-red-500 text-sm text-center pt-2">{error}</p>
                    )}
                    <div>
                        <button
                            type="submit"
                            disabled={loading || pin.join('').length !== 4}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-primary-light"
                        >
                            {loading ? 'Verifying...' : 'Verify PIN'}
                        </button>
                    </div>
                </form>

                 <p className="mt-8 text-center text-sm text-gray-600">
                    Forgot PIN?{' '}
                    <Link to="/contact" className="font-medium text-primary hover:text-primary-dark">
                        Contact Support
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default PinVerificationPage;