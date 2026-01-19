import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
    X, Loader2, Smartphone, CheckCircle2, ArrowRight, Mail, MapPin, User as UserIcon, XCircle, ChevronLeft, Wallet, Lock
} from 'lucide-react';
import { API_BASE_URL } from '../services/apiConfig';
import { interceptedFetch } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Helper to map icon strings to emojis
const getGoalIcon = (iconStr: string | null | undefined) => {
    switch (iconStr?.toUpperCase()) {
        case 'PLANE': return '✈️';
        case 'HOME': return '🏠';
        case 'BRIEFCASE': return '💼';
        case 'BOOK': return '📚';
        case 'HEART': return '❤️';
        case 'GIFT': return '🎁';
        case 'VACATION': return '🏖️';
        default: return '💰';
    }
};

const CheckoutPage: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Data from navigation state
    const state = location.state as { amount: string; selectedGoal: any } | null;
    
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentStatus, setPaymentStatus] = useState<'IDLE' | 'PENDING' | 'SUCCESS' | 'FAILED'>('IDLE');
    const [statusMessage, setStatusMessage] = useState('');
    const [profile, setProfile] = useState<any>(null);

    useEffect(() => {
        if (!state) {
            navigate('/dashboard');
            return;
        }

        const fetchProfile = async () => {
            try {
                const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/users/me`);
                const result = await response.json();
                if (result.success) {
                    setProfile(result.data);
                    const p = result.data.phoneNumber || '';
                    const cleaned = p.replace(/^255/, '').replace(/^0+/, '');
                    setPhoneNumber(cleaned);
                }
            } catch (error) {
                console.error("Failed to fetch profile", error);
            }
        };
        fetchProfile();
    }, [state, navigate]);

    const pollPaymentStatus = async (orderNumber: string) => {
        const startTime = Date.now();
        let currentDelay = 1000;
        const maxDuration = 3 * 60 * 1000;

        while (Date.now() - startTime < maxDuration) {
            try {
                const response = await interceptedFetch(`${API_BASE_URL}/api/v1/payments/status/${orderNumber}`);
                const result = await response.json();

                if (result.success && result.data) {
                    const status = result.data.status;
                    setStatusMessage(result.data.message || "Checking payment status...");

                    if (status === 'SUCCESS') {
                        setPaymentStatus('SUCCESS');
                        setTimeout(() => navigate('/activity'), 2000);
                        return;
                    } else if (status === 'FAILED') {
                        setPaymentStatus('FAILED');
                        setTimeout(() => setPaymentStatus('IDLE'), 2500);
                        return;
                    }
                }
            } catch (error) {
                console.error("Error polling payment status:", error);
            }
            await new Promise(resolve => setTimeout(resolve, currentDelay));
            currentDelay = currentDelay * 1.5;
        }

        setPaymentStatus('FAILED');
        setStatusMessage("Payment status check timed out. Please check your history.");
        setTimeout(() => setPaymentStatus('IDLE'), 3000);
    };

    const handlePayment = async () => {
        if (!phoneNumber || phoneNumber.length < 9 || !state) return;

        setIsProcessing(true);
        setPaymentStatus('PENDING');
        setStatusMessage("Initiating deposit request...");

        try {
            const payload = {
                goalId: Number(state.selectedGoal.id),
                amount: Number(state.amount),
                msisdn: `255${phoneNumber}`
            };

            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/payments/deposit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            if (!response.ok || result.success === false) throw new Error(result.message || 'Failed to initiate deposit.');

            const orderNo = result.data?.orderNumber;
            if (orderNo) {
                pollPaymentStatus(orderNo);
            } else {
                setPaymentStatus('SUCCESS');
                setTimeout(() => navigate('/activity'), 2000);
            }
        } catch (error: any) {
            setPaymentStatus('FAILED');
            setStatusMessage(error.message || "An unexpected error occurred.");
            setTimeout(() => setPaymentStatus('IDLE'), 3000);
        } finally {
            setIsProcessing(false);
        }
    };

    if (!state) return null;

    const { amount, selectedGoal } = state;
    const numericAmount = parseFloat(amount) || 0;
    const estimatedFee = 0; // Fee set to 0 as instructed
    const currentProgress = selectedGoal ? (selectedGoal.currentAmount / selectedGoal.targetAmount) * 100 : 0;
    const expectedProgress = selectedGoal ? ((selectedGoal.currentAmount + numericAmount) / selectedGoal.targetAmount) * 100 : 0;

    return (
        <div className="max-w-7xl mx-auto pb-12 px-4 sm:px-6">
            <div className="mb-6">
                <button onClick={() => navigate(-1)} className="flex items-center text-primary font-bold hover:underline mb-2 transition-all">
                    <ChevronLeft size={20} className="mr-1" />
                    Back to Selection
                </button>
            </div>

            <div className="bg-white text-gray-900 rounded-[32px] overflow-hidden flex flex-col md:flex-row border border-gray-100 relative min-h-[700px]">
                {paymentStatus !== 'IDLE' && (
                    <div className="absolute inset-0 z-[120] bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-in fade-in duration-300">
                        <div className="mb-6">
                            {paymentStatus === 'PENDING' && (
                                <div className="relative">
                                    <Loader2 size={64} className="animate-spin text-blue-600" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Smartphone size={24} className="text-blue-600 animate-pulse" />
                                    </div>
                                </div>
                            )}
                            {paymentStatus === 'SUCCESS' && (
                                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 animate-in zoom-in duration-500">
                                    <CheckCircle2 size={48} />
                                </div>
                            )}
                            {paymentStatus === 'FAILED' && (
                                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center text-red-600 animate-in zoom-in duration-500">
                                    <XCircle size={48} />
                                </div>
                            )}
                        </div>
                        <h3 className={`text-2xl font-bold mb-3 ${paymentStatus === 'SUCCESS' ? 'text-emerald-700' : paymentStatus === 'FAILED' ? 'text-red-700' : 'text-gray-900'}`}>
                            {paymentStatus === 'PENDING' ? 'Processing Payment' : paymentStatus === 'SUCCESS' ? 'Payment Successful!' : 'Payment Failed'}
                        </h3>
                        <p className="text-gray-500 font-medium text-base max-w-xs leading-relaxed">{statusMessage}</p>
                    </div>
                )}

                {/* Left Side: Checkout Fields */}
                <div className="flex-1 p-6 md:p-12 bg-white">
                    <div className="mb-10">
                        <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Checkout</h2>
                        <p className="text-gray-500 mt-4 leading-relaxed font-medium text-sm md:text-base max-w-lg">
                            Complete your saving order by providing your mobile number. Funds will be deducted from your linked wallet.
                        </p>
                    </div>

                    <div className="mb-12">
                        <div className="flex flex-col">
                            <div className="flex items-center space-x-6 group border-b-2 border-blue-600/50 focus-within:border-blue-600 transition-all pb-3">
                                <span className="text-3xl font-bold text-blue-600 transition-colors">255</span>
                                <input 
                                    type="text"
                                    inputMode="numeric"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 9))}
                                    placeholder="XXXXXXXXX"
                                    className="w-full text-4xl font-bold text-gray-900 focus:outline-none placeholder:text-gray-200 bg-transparent py-1 tracking-wider"
                                />
                            </div>
                            <p className="text-[11px] font-bold text-gray-400 mt-3 uppercase tracking-widest ml-[4.2rem]">Recipient mobile number</p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <h3 className="text-xl font-bold text-gray-800 border-b border-gray-50 pb-3">Personal Information</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                                <div className="relative">
                                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="text" readOnly value={profile?.email || user?.email || 'fatma.k@email.com'} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-12 py-3.5 text-sm text-gray-700 font-medium outline-none shadow-sm" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                                <div className="relative">
                                    <UserIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="text" readOnly value={profile ? `${profile.firstName} ${profile.lastName}` : (user ? `${user.firstName} ${user.lastName}` : 'Piko Khamis')} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-12 py-3.5 text-sm text-gray-700 font-medium outline-none shadow-sm" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Region</label>
                                <div className="relative">
                                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="text" readOnly value={profile?.address?.region || 'Dar es Salaam'} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-12 py-3.5 text-sm text-gray-700 font-medium outline-none shadow-sm" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">District</label>
                                <div className="relative">
                                    <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input type="text" readOnly value={profile?.address?.district || 'Kinondoni'} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-12 py-3.5 text-sm text-gray-700 font-medium outline-none shadow-sm" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 p-6 bg-blue-50/50 rounded-3xl border border-blue-100 shadow-sm">
                        <div className="flex items-center justify-between mb-5">
                            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-widest">Goal impact</h4>
                            <span className="text-[10px] font-bold bg-blue-600 text-white px-3 py-1 rounded-full uppercase">Target: {selectedGoal?.currency || 'TZS'} {selectedGoal?.targetAmount?.toLocaleString() || '100,000'}</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-baseline">
                                <span className="text-gray-500 font-semibold text-xs">Expected Progress After Saving</span>
                                <span className="font-bold text-gray-900 text-lg">{Math.min(expectedProgress, 100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-white border border-blue-100 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-emerald-400 h-full transition-all duration-1000 ease-out" style={{ width: `${expectedProgress}%` }}></div>
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">This deposit will increase your goal progress by {(expectedProgress - currentProgress).toFixed(1)}%</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Summary Sidebar */}
                <div className="w-full md:w-[380px] bg-gray-50/50 border-l border-gray-100 flex flex-col">
                    <div className="flex-1 px-8 py-12 flex flex-col">
                        <div className="mb-10">
                            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Order Summary</h2>
                            <p className="text-gray-500 mt-4 leading-relaxed font-medium text-sm">
                                Verify your saving details before proceeding with the mobile money transaction.
                            </p>
                        </div>

                        <div className="bg-white rounded-3xl p-6 border border-gray-100 mb-10 shadow-xl shadow-gray-200/30 flex flex-col">
                            <p className="text-gray-400 text-[10px] font-bold mb-4 uppercase tracking-widest">Targeted goal</p>
                            <div className="flex items-baseline space-x-1.5 mb-6 border-b border-gray-50 pb-4">
                                <span className="text-3xl font-bold text-gray-900">{user?.currency || 'TZS'} {numericAmount.toLocaleString()}</span>
                                <span className="text-xs text-gray-400 font-semibold">/deposit</span>
                            </div>
                            <div className="flex items-center space-x-3 p-3 bg-gray-50/50 rounded-2xl border border-gray-100 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl shadow-lg shadow-blue-100">
                                    {getGoalIcon(selectedGoal?.icon)}
                                </div>
                                <span className="font-bold text-sm text-gray-800 truncate">{selectedGoal?.goalName || selectedGoal?.name || 'Preparation'}</span>
                            </div>
                            <button 
                                onClick={() => navigate(-1)}
                                className="w-full py-3 bg-white hover:bg-gray-50 text-gray-600 text-[10px] font-bold rounded-xl border border-gray-100 transition-all active:scale-[0.98] shadow-sm uppercase tracking-widest"
                            >
                                Change Goal or Amount
                            </button>
                        </div>

                        <div className="space-y-4 mb-10 px-1">
                            <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider">
                                <span className="text-gray-400">Saving amount</span>
                                <span className="text-gray-800">{user?.currency || 'TZS'} {numericAmount.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-[11px] font-bold uppercase tracking-wider">
                                <span className="text-gray-400">Platform fee</span>
                                <span className="text-gray-800">{user?.currency || 'TZS'} {estimatedFee.toLocaleString()}</span>
                            </div>
                            <div className="pt-5 border-t border-gray-100 flex justify-between items-center">
                                <span className="text-lg font-bold text-gray-900">Total</span>
                                <span className="text-2xl font-bold text-blue-600">{user?.currency || 'TZS'} {(numericAmount + estimatedFee).toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="mt-auto">
                            <button 
                                onClick={handlePayment}
                                disabled={isProcessing || phoneNumber.length < 9}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center space-x-3 text-lg active:scale-[0.97]"
                            >
                                {isProcessing ? <Loader2 size={24} className="animate-spin" /> : <><span>Proceed with payment</span><ArrowRight size={20} /></>}
                            </button>
                            
                            <div className="text-center mt-8 px-2">
                                <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">
                                    By continuing, you accept our <a href="#" className="text-blue-500 hover:underline">Terms of Services</a> and <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>.
                                </p>
                                <p className="text-[10px] text-gray-400 font-semibold mt-3 opacity-80 leading-tight">
                                    Please note that deposits are non-refundable once processed.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-12 flex items-center justify-center space-x-2 text-gray-400 text-xs font-medium opacity-80">
                <Lock size={14} />
                <span>Highly secured and encrypted by Ongeza Bank</span>
            </div>
        </div>
    );
};

export default CheckoutPage;