import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CircleDollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const DotPattern = () => (
    <div className="absolute w-48 h-48 -z-10">
        <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: 36 }).map((_, i) => (
                <div key={i} className="w-2 h-2 bg-gray-200/50 rounded-full"></div>
            ))}
        </div>
    </div>
);

const TwoFactorAuthPage: React.FC = () => {
    const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
    const location = useLocation();
    const navigate = useNavigate();
    const { verifyLoginOtp } = useAuth();

    const challengeId = location.state?.challengeId;

    useEffect(() => {
        if (!challengeId) {
            setError('No verification challenge found. Please try logging in again.');
            setTimeout(() => navigate('/login'), 3000);
        } else {
            inputsRef.current[0]?.focus();
        }
    }, [challengeId, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const { value } = e.target;
        if (/^[0-9]$/.test(value) || value === '') {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
            setError('');
            if (value && index < 5) {
                inputsRef.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputsRef.current[index - 1]?.focus();
        } else if (e.key === 'Backspace' && otp[index] !== '') {
            const newOtp = [...otp];
            newOtp[index] = '';
            setOtp(newOtp);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasteData.length === 6) {
            setOtp(pasteData.split(''));
            inputsRef.current[5]?.focus();
        }
    };

    const handleVerify = async () => {
        const fullOtp = otp.join('');
        if (fullOtp.length !== 6 || !challengeId) {
            setError('Please enter a valid 6-digit code.');
            return;
        }

        setLoading(true);
        setError('');

        const result = await verifyLoginOtp(challengeId, fullOtp);

        if (!result.success) {
            setError(result.message);
            setOtp(Array(6).fill(''));
            inputsRef.current[0]?.focus();
        }
        // On success, the AuthContext handles navigation.
        setLoading(false);
    };
    
    useEffect(() => {
        if (otp.join('').length === 6) {
            handleVerify();
        }
    }, [otp]);

    return (
        <div className="relative min-h-screen bg-gray-50 flex items-center justify-center p-4 overflow-hidden">
            <div className="absolute -top-20 -right-20"><DotPattern /></div>
            <div className="absolute -bottom-20 -left-20"><DotPattern /></div>

            <div className="relative z-10 w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center mb-8">
                    <div className="flex justify-center items-center gap-2 mb-4">
                        <CircleDollarSign size={32} className="text-primary" />
                        <h1 className="text-3xl font-bold text-primary">PesaFlow</h1>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Two-Factor Verification</h2>
                    <p className="text-gray-500 mt-2">Please enter the 6-digit code sent to your device to complete your login.</p>
                </div>

                <div className="flex justify-center gap-2 mb-4" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            ref={(el) => { inputsRef.current[index] = el; }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={e => handleChange(e, index)}
                            onKeyDown={e => handleKeyDown(e, index)}
                            className="w-12 h-14 text-center text-2xl font-semibold bg-gray-50 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                            disabled={loading || !challengeId}
                        />
                    ))}
                </div>
                {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
                <div className="mt-6">
                    <button onClick={handleVerify} disabled={loading || otp.join('').length !== 6} className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:bg-primary-dark transition-all duration-300 flex justify-center items-center disabled:bg-primary/70">
                        {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Verify'}
                    </button>
                </div>
                 <p className="mt-8 text-center text-sm text-gray-600">
                    Didn't receive a code?{' '}
                    <button className="font-medium text-primary hover:text-primary-dark">
                        Resend Code
                    </button>
                </p>
            </div>
        </div>
    );
};

export default TwoFactorAuthPage;
