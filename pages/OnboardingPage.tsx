import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Eye, EyeOff, Check } from 'lucide-react';
import { API_BASE_URL } from '../services/apiConfig';

const RegistrationStep: React.FC<{ setStep: (step: number) => void }> = ({ setStep }) => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordsMatch, setPasswordsMatch] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        
        if (password !== confirmPassword) {
            setPasswordsMatch(false);
            return;
        }
        setPasswordsMatch(true);
        setLoading(true);

        const form = e.currentTarget;
        const firstName = (form.elements.namedItem('firstName') as HTMLInputElement).value;
        const lastName = (form.elements.namedItem('lastName') as HTMLInputElement).value;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;
        const pin = (form.elements.namedItem('pin') as HTMLInputElement).value;

        try {
            const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: email,
                    email: email,
                    password: password,
                    firstName: firstName,
                    lastName: lastName,
                    phoneNumber: phone,
                    category: "SAVER",
                    pin: pin,
                })
            });

            const data = await response.json();

            if (!response.ok || data.success === false) {
                throw new Error(data.message || "Registration failed. Please try again.");
            }
            
            // On success, move to OTP step as per existing flow.
            // The API response doesn't give a challenge ID, so the OTP step will remain a mock for now.
            setStep(2);

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input type="text" name="firstName" required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input type="text" name="lastName" required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" name="email" required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <input 
                    type="tel" 
                    name="phone" 
                    required 
                    placeholder="e.g. 255712345678" 
                    pattern="[+]?[0-9]{9,15}" 
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" 
                />
            </div>
            
            <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input 
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => {
                        setPassword(e.target.value)
                        if (!passwordsMatch) setPasswordsMatch(true);
                    }}
                    required
                    className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                />
                 <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-8 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
            </div>
            
            <div className="relative">
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => {
                        setConfirmPassword(e.target.value)
                        if (!passwordsMatch) setPasswordsMatch(true);
                    }}
                    required
                    className={`mt-1 block w-full px-3 py-2 bg-white border ${passwordsMatch ? 'border-gray-300' : 'border-red-500'} rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary`}
                />
                 <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-8 text-gray-400 hover:text-gray-600">
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
                 {!passwordsMatch && <p className="text-red-500 text-xs mt-1">Passwords do not match.</p>}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">PIN (4-6 digits)</label>
                <input type="text" name="pin" inputMode="numeric" pattern="[0-9]{4,6}" maxLength={6} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>

            <button type="submit" disabled={loading} className="w-full flex justify-center items-center bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-md transition-colors duration-300 disabled:bg-primary-light">
                {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                    <>
                        Continue <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                )}
            </button>
        </form>
    );
};

const OtpStep: React.FC<{ setStep: (step: number) => void }> = ({ setStep }) => {
    const handleOtpSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock success, move to success step
        setStep(3);
    };

    return (
        <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Account</h2>
            <p className="text-gray-600 mb-6">Enter the 6-digit code sent to your mobile number.</p>
            <form onSubmit={handleOtpSubmit} className="space-y-4 max-w-sm mx-auto">
                <input type="text" maxLength={6} required autoFocus className="w-full text-center tracking-[1em] text-2xl font-bold px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                <p className="text-sm text-gray-500">Didn't receive code? <button type="button" className="font-medium text-primary hover:underline">Resend</button></p>
                <button type="submit" className="w-full flex justify-center items-center bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-md transition-colors duration-300">
                    Verify Account
                </button>
            </form>
        </div>
    );
};

const SuccessStep: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="text-center">
            <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Registration Submitted!</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">Thank you. Your account has been created and is awaiting admin approval. You will receive an SMS once it's active. You can log in now to see your account status.</p>
            <button onClick={() => navigate('/login')} className="w-full max-w-sm flex justify-center items-center bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-md transition-colors duration-300">
                Go to Login
            </button>
        </div>
    );
};

const OnboardingPage: React.FC = () => {
    const [step, setStep] = useState(1);
    
    const STEPS = [
        { title: 'Account Details', number: 1 },
        { title: 'Verification', number: 2 }
    ];

    const renderContent = () => {
        switch (step) {
            case 1:
                return <RegistrationStep setStep={setStep} />;
            case 2:
                return <OtpStep setStep={setStep} />;
            case 3:
                return <SuccessStep />;
            default:
                return null;
        }
    };
    
    return (
        <div className="bg-background min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-gray-900">Create your Saver Account</h1>
                    <p className="mt-2 text-lg text-gray-600">Join PesaFlow and start your savings journey today.</p>
                </div>
                
                {step < 3 && (
                    <div className="flex justify-center items-center mb-8">
                        {STEPS.map((s, index) => (
                            <React.Fragment key={s.number}>
                                <div className="flex items-center">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors ${step >= s.number ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                                        {step > s.number ? <Check size={16} /> : s.number}
                                    </div>
                                    <p className={`ml-3 font-semibold ${step >= s.number ? 'text-primary' : 'text-gray-500'}`}>{s.title}</p>
                                </div>
                                {index < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-4 ${step > s.number ? 'bg-primary' : 'bg-gray-200'}`}></div>}
                            </React.Fragment>
                        ))}
                    </div>
                )}

                <div className="bg-white p-8 rounded-xl shadow-lg">
                    {renderContent()}
                </div>
                 <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OnboardingPage;