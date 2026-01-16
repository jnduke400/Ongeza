import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
    BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, Tooltip,
} from 'recharts';
import {
    MoreHorizontal, ArrowUpRight, Upload, FileText, ChevronRight, Download, ChevronDown, AlertCircle, ShoppingBag, ArrowDownRight, X, Smartphone, CheckCircle2, XCircle, Loader2, Info, Wallet, AlignLeft
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isUserInAnyGroup } from '../services/mockData';
import { API_BASE_URL } from '../services/apiConfig';
import { interceptedFetch } from '../services/api';


// Reusable Card component
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-surface p-4 md:p-6 rounded-2xl shadow-sm ${className}`}>
        {children}
    </div>
);

interface WalletData {
    id: number;
    userId: number;
    mainBalance: number;
    availableBalance: number;
    totalBalance: number;
    currency: string;
    status: string;
    balanceTrend: string;
    balanceTrendLabel: string;
    accountNumber: string;
    expiryDate: string | null;
}

interface WalletStats {
    totalInterest: number;
    totalSavings: number;
    totalRewards: number;
    outstandingLoan: number;
    weeklySummary: { day: string; amount: number }[];
    recentContributors: any[];
}

interface WalletTransaction {
    id: number;
    walletId: number;
    transactionId: number;
    amount: number;
    fee: number;
    transactionType: string;
    status: string;
    description: string;
    referenceNumber: string;
    balanceBefore: number | null;
    balanceAfter: number | null;
    processedAt: string;
    createdAt: string;
    channel: string;
}

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

// --- WITHDRAWAL MODAL COMPONENT ---
const WithdrawalModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    availableBalance: number;
    currency: string;
    onSuccess: (updatedWallet: WalletData) => void;
}> = ({ isOpen, onClose, availableBalance, currency, onSuccess }) => {
    const [amount, setAmount] = useState('');
    const [withdrawalType, setWithdrawalType] = useState<'INSTANT' | 'SCHEDULED'>('INSTANT');
    const [msisdn, setMsisdn] = useState('');
    const [description, setDescription] = useState('Withdrawal to mobile money');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setAmount('');
            setWithdrawalType('INSTANT');
            setStatus('IDLE');
            setMessage('');
            setDescription('Withdrawal to mobile money');
        }
    }, [isOpen]);

    const handleWithdraw = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus('IDLE');

        try {
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/wallet/withdraw`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    withdrawalType,
                    msisdn: msisdn.startsWith('255') ? msisdn : `255${msisdn.replace(/^0+/, '')}`,
                    description
                })
            });

            const result = await response.json();

            if (result.success) {
                setStatus('SUCCESS');
                setMessage(result.message || 'Withdrawal processed successfully!');
                setTimeout(() => {
                    onSuccess(result.data);
                    onClose();
                }, 2000);
            } else {
                setStatus('ERROR');
                setMessage(result.message || 'Transaction failed.');
            }
        } catch (error: any) {
            setStatus('ERROR');
            setMessage('Network error. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-300 border border-gray-100">
                <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                    <h2 className="text-xl font-bold text-gray-800">Funds Withdrawal</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full text-gray-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    {status === 'SUCCESS' ? (
                        <div className="text-center py-10 animate-in zoom-in">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto mb-4">
                                <CheckCircle2 size={48} />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800">Done!</h3>
                            <p className="text-gray-500 mt-2">{message}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleWithdraw} className="space-y-6">
                            <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Available Balance</p>
                                    <p className="text-xl font-bold text-indigo-900">{currency} {availableBalance.toLocaleString()}</p>
                                </div>
                                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                                    <Wallet size={20} />
                                </div>
                            </div>

                            {status === 'ERROR' && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start space-x-3 animate-in shake duration-300">
                                    <XCircle size={18} className="text-red-500 shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-700 font-medium leading-relaxed">{message}</p>
                                </div>
                            )}

                            <div className="space-y-4 max-h-[400px] overflow-y-auto px-1 custom-scrollbar">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Amount to withdraw</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            required
                                            value={amount}
                                            onChange={e => setAmount(e.target.value)}
                                            placeholder="0.00"
                                            className="w-full h-14 bg-gray-50 border border-gray-200 rounded-xl px-4 text-lg font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">{currency}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Mobile Number (M-Pesa/Tigo)</label>
                                    <div className="relative">
                                        <Smartphone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input 
                                            type="tel" 
                                            required
                                            value={msisdn}
                                            onChange={e => setMsisdn(e.target.value.replace(/[^0-9]/g, ''))}
                                            placeholder="07XXXXXXXX"
                                            className="w-full h-14 bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 text-base font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 block">Reason for Withdrawal</label>
                                    <div className="relative">
                                        <AlignLeft size={18} className="absolute left-4 top-4 text-gray-400" />
                                        <textarea 
                                            rows={2}
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            placeholder="Purpose of this withdrawal..."
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setWithdrawalType('INSTANT')}
                                        className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${withdrawalType === 'INSTANT' ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                    >
                                        Instant
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setWithdrawalType('SCHEDULED')}
                                        className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${withdrawalType === 'SCHEDULED' ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'}`}
                                    >
                                        Scheduled
                                    </button>
                                </div>

                                {withdrawalType === 'SCHEDULED' && (
                                    <div className="flex items-start space-x-2 text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100 animate-in slide-in-from-top-2">
                                        <Info size={16} className="shrink-0 mt-0.5" />
                                        <p className="text-[11px] font-medium leading-relaxed">Scheduled withdrawals are free once a month but take 24-48 hours to process.</p>
                                    </div>
                                )}
                            </div>

                            <button 
                                type="submit" 
                                disabled={isSubmitting || !amount || !msisdn}
                                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-4 rounded-2xl shadow-xl shadow-emerald-200 transition-all active:scale-[0.98] flex items-center justify-center space-x-2 disabled:bg-gray-100 disabled:text-gray-300 disabled:shadow-none"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <span>Authorize Withdrawal</span>}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

// Wallet Balance Card
const WalletBalanceCard: React.FC<{ wallet: WalletData | null; onWithdrawClick: () => void }> = ({ wallet, onWithdrawClick }) => {
    const trend = wallet?.balanceTrend || '0%';
    const isPositive = !trend.startsWith('-');

    return (
        <Card className="flex flex-col justify-between h-full">
            <div>
                 <p className="text-sm text-gray-500">Wallet Balance</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                    {wallet ? `${wallet.currency} ${wallet.availableBalance.toLocaleString()}` : 'Loading...'}
                </p>
                <p className={`text-sm font-semibold flex items-center ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? <ArrowUpRight size={16} className="mr-1"/> : <ArrowDownRight size={16} className="mr-1"/>}
                    {trend} {wallet?.balanceTrendLabel ? ` ${wallet.balanceTrendLabel.replace('vs ', '')}` : ''}
                </p>
            </div>
            <div className="flex justify-around mt-6 text-center">
                <div>
                    <button className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full text-primary hover:bg-primary-light/50 transition-colors">
                        <Upload size={20} />
                    </button>
                    <p className="text-xs mt-2 font-medium text-gray-600">Transfer</p>
                </div>
                <div>
                    <button 
                        onClick={onWithdrawClick}
                        className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full text-primary hover:bg-primary-light/50 transition-colors"
                    >
                        <Download size={20} />
                    </button>
                    <p className="text-xs mt-2 font-medium text-gray-600">Withdrawal</p>
                </div>
            </div>
        </Card>
    );
};


// Main Balance (Credit Card)
const MainBalanceCard: React.FC<{ wallet: WalletData | null }> = ({ wallet }) => {
    const { user } = useAuth();
    
    // Fallback name if user not fully loaded yet
    const cardHolderName = user ? `${user.firstName} ${user.lastName}` : '...';
    const mainBalance = wallet ? wallet.mainBalance : 0;
    const currency = wallet ? wallet.currency : 'TZS';
    
    // Mask account number: Show last 4 digits
    const maskedAccount = wallet?.accountNumber 
        ? `**** **** **** ${wallet.accountNumber.slice(-4)}`
        : '**** **** **** ****';

    return (
        <Card className="bg-gradient-to-br from-primary to-secondary text-white relative overflow-hidden h-full">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-12 -left-8 w-32 h-32 bg-white/10 rounded-full"></div>
            <div className="flex justify-between items-start mb-4 z-10 relative">
                <h3 className="font-semibold">Main Balance</h3>
                <button><MoreHorizontal size={24} /></button>
            </div>
            <p className="text-4xl font-bold mb-4 z-10 relative">{currency} {mainBalance.toLocaleString()}</p>
            <div className="w-full bg-white/30 rounded-full h-1.5 mb-6 z-10 relative">
                <div className="bg-white h-1.5 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <div className="flex justify-between text-xs font-medium z-10 relative">
                <div>
                    <p className="opacity-70 mb-1">VALID THRU</p>
                    <p>{wallet?.expiryDate || 'N/A'}</p>
                </div>
                <div>
                    <p className="opacity-70 mb-1">CARD HOLDER</p>
                    <p className="uppercase">{cardHolderName}</p>
                </div>
                <div>
                    <p className="opacity-70 mb-1">NUMBER</p>
                    <p>{maskedAccount}</p>
                </div>
            </div>
        </Card>
    );
};

// Category Cards
const CategoryCard: React.FC<{ item: { name: string; value: number; progress: number; color: string } }> = ({ item }) => (
    <Card>
        <div className="flex items-center">
            <div className="relative w-12 h-12">
                <svg className="w-full h-full" viewBox="0 0 36 36" transform="rotate(-90)">
                    <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#e5e7eb" strokeWidth="3" />
                    <circle
                        cx="18" cy="18" r="15.9155"
                        fill="none"
                        stroke={item.color}
                        strokeWidth="3"
                        strokeDasharray={`${item.progress}, 100`}
                        strokeLinecap="round"
                    />
                </svg>
            </div>
            <div className="ml-4">
                <p className="font-bold text-gray-800">{item.name}</p>
                <p className="text-sm text-gray-500 whitespace-nowrap">TZS {item.value.toLocaleString()}</p>
            </div>
        </div>
    </Card>
);

const StatusPill: React.FC<{ status: string }> = ({ status }) => {
    // Normalize status to match keys or provide fallback
    const statusKey = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : 'Pending';
    
    const styles: { [key: string]: string } = {
        Pending: 'bg-yellow-400 text-yellow-900',
        Completed: 'bg-green-500 text-green-950',
        Failed: 'bg-red-500 text-red-950',
        Cancelled: 'bg-red-500 text-red-950',
    };
    return (
        <span className={`px-3 py-1.5 text-xs font-bold rounded-full whitespace-nowrap ${styles[statusKey] || 'bg-gray-400 text-gray-900'}`}>
            {statusKey}
        </span>
    );
};


const LatestTransactionCard: React.FC<{ transactions: WalletTransaction[] }> = ({ transactions }) => {
    const { user } = useAuth();
    const [openTransactionId, setOpenTransactionId] = useState<number | null>(null);

    const handleToggle = (id: number) => {
        setOpenTransactionId(prevId => (prevId === id ? null : id));
    };

    const userFullName = user ? `${user.firstName} ${user.lastName}` : 'User';
    const userEmail = user ? user.email : '';
    const userAvatar = user ? user.avatar : 'https://i.pravatar.cc/150';

    return (
        <Card>
            <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                <div>
                    <h3 className="font-bold text-lg text-gray-800">Latest Transaction</h3>
                    <p className="text-sm text-gray-500">{userFullName}'s Latest Transactions made</p>
                </div>
            </div>
            <div className="space-y-1">
                {transactions.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">No recent transactions found.</p>
                ) : (
                    transactions.map((t) => {
                        const isIncome = t.transactionType === 'DEPOSIT' || t.transactionType === 'INCOME';
                        const amountColor = isIncome ? 'text-green-600' : 'text-red-500';
                        const amountPrefix = isIncome ? '+' : '-';
                        
                        return (
                            <React.Fragment key={t.id}>
                                <div
                                    onClick={() => handleToggle(t.id)}
                                    className="grid grid-cols-6 md:grid-cols-12 items-center p-2 rounded-lg hover:bg-gray-100 cursor-pointer gap-x-2 md:gap-x-4 transition-colors duration-200"
                                >
                                    {/* 1. Avatar + Name + Email */}
                                    <div className="col-span-3 md:col-span-4 lg:col-span-3 flex items-center">
                                        <img src={userAvatar} className="w-10 h-10 rounded-full mr-3 object-cover" alt={userFullName} />
                                        <div className="hidden md:block overflow-hidden">
                                            <p className="font-semibold text-sm text-gray-800 truncate">{userFullName}</p>
                                            <p className="text-xs text-gray-400 truncate">{userEmail}</p>
                                        </div>
                                    </div>
                                    {/* 2. Date */}
                                    <p className="hidden md:block md:col-span-3 lg:col-span-3 text-xs text-gray-500 truncate">
                                        {formatDate(t.processedAt)}
                                    </p>
                                    {/* 3. Amount */}
                                    <p className={`hidden lg:block lg:col-span-2 text-sm font-semibold ${amountColor}`}>
                                        {amountPrefix}TZS {t.amount.toLocaleString()}
                                    </p>
                                    {/* 4. Channel */}
                                    <p className="hidden md:block md:col-span-2 lg:col-span-2 text-xs text-gray-400 truncate">
                                        {t.channel}
                                    </p>
                                    {/* 5. Status */}
                                     <div className="col-span-2 md:col-span-2 lg:col-span-1 flex justify-center md:justify-end lg:justify-center">
                                        <StatusPill status={t.status} />
                                    </div>
                                    {/* 6. Arrow */}
                                    <div className="col-span-1 flex justify-end text-gray-400">
                                        <button className="p-1 hover:text-gray-800">
                                            {openTransactionId === t.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                        </button>
                                    </div>
                                </div>
                                {openTransactionId === t.id && (
                                    <div className="bg-gray-50 p-4 my-1 mx-2 rounded-lg text-xs animate-fade-in">
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-4 gap-y-3 mb-4">
                                            <div>
                                                <p className="text-gray-500 mb-1">ID Payment</p>
                                                <p className="font-semibold text-gray-800">#{t.referenceNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 mb-1">Payment Method</p>
                                                <p className="font-semibold text-gray-800">{t.channel}</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 mb-1">Date Paid</p>
                                                <p className="font-semibold text-gray-800">{formatDate(t.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-md bg-blue-50 text-blue-800 border border-blue-100">
                                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                            <p>{t.description}</p>
                                        </div>
                                    </div>
                                )}
                            </React.Fragment>
                        );
                    })
                )}
            </div>
        </Card>
    );
};


// Weekly Summary Card
const WeeklySummaryCard: React.FC<{ wallet: WalletData | null; stats: WalletStats | null }> = ({ wallet, stats }) => {
    
    // Calculate total base for percentage comparison among the three fields
    const interest = stats?.totalInterest || 0;
    const savings = stats?.totalSavings || 0;
    const rewards = stats?.totalRewards || 0;
    
    // Sum of these three components defines the comparative base
    const totalComponents = interest + savings + rewards;
    const denominator = totalComponents || 1; // Prevent division by zero

    // Pie data logic: Compare Interest, Savings, and Reward against their combined sum
    const pieData = [
        { name: 'Interest', value: Math.round((interest / denominator) * 100), color: '#FDBA74' },
        { name: 'Savings', value: Math.round((savings / denominator) * 100), color: '#F87171' },
        { name: 'Reward', value: Math.round((rewards / denominator) * 100), color: '#D1D5DB' },
    ];
    
    // Ensure pie chart renders even if values are small or 0, by checking if we have data
    const totalPercentage = pieData.reduce((acc, curr) => acc + curr.value, 0);
    if (totalPercentage === 0) {
        // Fallback for empty state to show a gray ring
        pieData.push({ name: 'Other', value: 100, color: '#F3F4F6' });
    } else if (totalPercentage < 100 && totalPercentage > 0) {
         // Adjust rounding errors
         pieData[1].value += (100 - totalPercentage);
    }

    // Bar chart data from weekly summary
    const barData = stats?.weeklySummary.map(item => ({
        name: item.day,
        value: item.amount
    })) || [];

    const CustomWalletPieTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 px-3 rounded-lg shadow-lg border border-gray-100">
                    <p className="text-sm font-semibold text-gray-700">{payload[0].name}</p>
                    <p className="text-sm" style={{ color: payload[0].payload.fill }}>
                        {`${payload[0].value}%`}
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomWalletBarTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 px-3 rounded-lg shadow-lg border border-gray-100">
                    <p className="text-sm font-semibold text-gray-700">{label}</p>
                    <p className="text-sm text-blue-500">
                        {`Amount: TZS ${payload[0].value.toLocaleString()}`}
                    </p>
                </div>
            );
        }
        return null;
    };


    return (
        <Card>
            <h3 className="font-bold text-lg mb-4">Weekly Summary</h3>
            <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={pieData.filter(i => i.value > 0)} dataKey="value" innerRadius={40} outerRadius={60} startAngle={90} endAngle={450} stroke="none">
                            {pieData.filter(i => i.value > 0).map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip content={<CustomWalletPieTooltip />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
                {pieData.filter(i => i.name !== 'Other').map(item => (
                    <div key={item.name} className="flex justify-between items-center text-sm">
                        <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: item.color }}></span><span className="text-gray-500">{item.name}</span></div>
                        <span className="font-semibold text-gray-700">{item.value}%</span>
                    </div>
                ))}
            </div>
            <div className="h-32 mt-6">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 5, right: 0, left: 0, bottom: 5 }}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomWalletBarTooltip />} cursor={{fill: 'rgba(243, 244, 246, 0.5)'}} />
                        <Bar dataKey="value" fill="#60A5FA" radius={[10, 10, 10, 10]} barSize={12} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

// Empty State Illustration for Contributors
const EmptyContributorsIllustration = () => (
    <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
             <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-300">
                <path d="M19 8C20.6569 8 22 6.65685 22 5C22 3.34315 20.6569 2 19 2C17.3431 2 16 3.34315 16 5C16 6.65685 17.3431 8 19 8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 2H9C4 2 2 4 2 9V15C2 20 4 22 9 22H15C20 22 22 20 22 15V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M14 11H18M14 15H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 7H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 11V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
        <p className="text-gray-600 font-medium text-sm">No group contributors yet.</p>
        <p className="text-gray-400 text-xs mt-1 max-w-[200px]">Once members contribute to your shared goals, they will appear here.</p>
    </div>
);

// Recent Contributors Card
const RecentContributorsCard: React.FC<{ contributors: any[] }> = ({ contributors }) => (
    <Card>
        <h3 className="font-bold text-lg">Recent Contributors</h3>
        <p className="text-sm text-gray-500 mb-4">Your latest group Contributors</p>
        {contributors && contributors.length > 0 ? (
            <div className="space-y-4">
                {contributors.map((inv, index) => (
                    <div key={index} className="flex justify-between items-center">
                        <div className="flex items-center">
                            <img src={inv.avatar || `https://i.pravatar.cc/150?u=${inv.name}`} className="w-10 h-10 rounded-full mr-3 object-cover" alt={inv.name} />
                            <div>
                                <p className="font-semibold">{inv.name}</p>
                                <p className="text-xs text-gray-500">{inv.role || 'Member'}</p>
                            </div>
                        </div>
                        <p className="font-bold text-primary">TZS {inv.amount.toLocaleString()}</p>
                    </div>
                ))}
            </div>
        ) : (
            <EmptyContributorsIllustration />
        )}
    </Card>
);

const EarnBadgesCard: React.FC = () => (
    <Card className="bg-gradient-to-br from-[#4338CA] to-[#6D28D9] text-white text-center flex flex-col items-center justify-center h-full p-8 relative overflow-hidden">
         <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/5 rounded-full opacity-50"></div>
         <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/5 rounded-full opacity-50"></div>
        <div className="relative z-10 flex flex-col items-center">
            <ShoppingBag size={56} className="mx-auto text-cyan-300 mb-6" strokeWidth={1.5}/>
            <h3 className="text-2xl font-bold mb-4">You don’t have badges yet</h3>
            <button className="bg-cyan-400 hover:bg-cyan-500 text-indigo-900 font-bold py-3 px-8 rounded-xl transition-colors text-lg shadow-md">
                Earn Budges
            </button>
        </div>
    </Card>
);


// Main Page Component
const MyWalletPage: React.FC = () => {
    const { user } = useAuth();
    const [wallet, setWallet] = useState<WalletData | null>(null);
    const [stats, setStats] = useState<WalletStats | null>(null);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isWithdrawalOpen, setIsWithdrawalOpen] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Fetch Wallet Data
            const walletRes = await interceptedFetch(`${API_BASE_URL}/api/v1/wallet`);
            const walletData = await walletRes.json();
            if (walletData.success) {
                setWallet(walletData.data);
            }

            // 2. Fetch Wallet Stats
            const statsRes = await interceptedFetch(`${API_BASE_URL}/api/v1/wallet/stats`);
            const statsData = await statsRes.json();
            if (statsData.success) {
                setStats(statsData.data);
            }

            // 3. Fetch Wallet Transactions
            const txRes = await interceptedFetch(`${API_BASE_URL}/api/v1/wallet/transactions?page=0&size=5`);
            const txData = await txRes.json();
            if (txData.success && txData.data && Array.isArray(txData.data.content)) {
                setTransactions(txData.data.content);
            }

        } catch (error) {
            console.error("Error fetching wallet data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleWithdrawalSuccess = (updatedWallet: WalletData) => {
        setWallet(updatedWallet);
        // Refresh transactions and stats to reflect the new state
        fetchData();
    };


    const shouldShowBadgesCard = useMemo(() => {
        if (user?.isSolo) {
            return !isUserInAnyGroup(user.id);
        }
        return false;
    }, [user]);

    // Prepare Category Data based on API stats
    const categoryData = useMemo(() => {
        if (!stats || !wallet) return [];
        
        const balance = wallet.availableBalance || 1; // Avoid division by zero

        const calcPercent = (val: number) => Math.min((val / balance) * 100, 100);

        return [
            { 
                name: 'Interest', 
                value: stats.totalInterest, 
                progress: calcPercent(stats.totalInterest), 
                color: '#A78BFA' 
            }, 
            { 
                name: 'Savings', 
                value: stats.totalSavings, 
                progress: calcPercent(stats.totalSavings), 
                color: '#34D399' 
            }, 
            { 
                name: 'Reward', 
                value: stats.totalRewards, 
                progress: calcPercent(stats.totalRewards), 
                color: '#60A5FA' 
            }, 
            { 
                name: 'Loan', 
                value: stats.outstandingLoan, 
                progress: calcPercent(stats.outstandingLoan), 
                color: '#FBBF24' 
            }, 
        ];
    }, [stats, wallet]);

    if (loading && !wallet) {
        return <div className="p-8 text-center flex flex-col items-center justify-center h-64 space-y-4">
            <Loader2 className="animate-spin text-primary" size={40} />
            <p className="text-gray-500 font-medium">Loading wallet information...</p>
        </div>;
    }

    return (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left side (col-span-2) */}
            <div className="xl:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                        <WalletBalanceCard 
                            wallet={wallet} 
                            onWithdrawClick={() => setIsWithdrawalOpen(true)}
                        />
                    </div>
                    <div className="md:col-span-2"><MainBalanceCard wallet={wallet} /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categoryData.map((item, i) => <CategoryCard key={i} item={item} />)}
                </div>
                <LatestTransactionCard transactions={transactions} />
            </div>

            {/* Right side (col-span-1) */}
            <div className="xl:col-span-1 space-y-6">
                <WeeklySummaryCard wallet={wallet} stats={stats} />
                {shouldShowBadgesCard ? <EarnBadgesCard /> : <RecentContributorsCard contributors={stats?.recentContributors || []} />}
            </div>

            {/* Global Withdrawal Modal */}
            <WithdrawalModal 
                isOpen={isWithdrawalOpen} 
                onClose={() => setIsWithdrawalOpen(false)} 
                availableBalance={wallet?.availableBalance || 0}
                currency={wallet?.currency || 'TZS'}
                onSuccess={handleWithdrawalSuccess}
            />
        </div>
    );
};

export default MyWalletPage;