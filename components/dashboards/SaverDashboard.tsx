import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    PieChart, Pie, Cell
} from 'recharts';
import { 
    PiggyBank, Sparkles, TrendingUp, Clock, Award, CheckCircle2, Wallet, CreditCard, Loader2, Target, Plus, MoreVertical,
    Rocket, Plane, Home, Briefcase, BookOpen, HeartPulse, Gift, PartyPopper
} from 'lucide-react';
import { API_BASE_URL } from '../../services/apiConfig';
import { interceptedFetch } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { QuickSaveModal } from '../common/QuickSaveModal';

// Reusable Card component
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 ${className}`}>
        {children}
    </div>
);

// Summary Stat Card
const SummaryStatCard: React.FC<{
    icon: React.ReactNode;
    value: string;
    title: string;
}> = ({ icon, value, title }) => {
    const parts = value.split(' ');
    const isCurrency = parts.length >= 2 && /^[A-Z]+$/.test(parts[0]);

    return (
        <Card className="flex flex-col h-full min-h-[140px] transition-all hover:shadow-md border-transparent hover:border-gray-100">
            <div className="flex justify-between items-start">
                <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500">
                    {icon}
                </div>
                <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                    <MoreVertical size={18} />
                </button>
            </div>
            <div className="mt-auto pt-4">
                <div className="flex flex-col">
                    {isCurrency ? (
                        <div className="flex items-baseline flex-wrap gap-x-1">
                            <span className="text-[10px] font-medium text-gray-400">{parts[0]}</span>
                            <span className="text-2xl font-bold text-gray-700 tracking-tight">{parts.slice(1).join(' ')}</span>
                        </div>
                    ) : (
                        <p className="text-3xl font-bold text-gray-700 tracking-tight">{value}</p>
                    )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{title}</p>
            </div>
        </Card>
    );
};

// --- CONFETTI ANIMATION COMPONENT ---
const ConfettiRain: React.FC = () => {
    const particles = useMemo(() => {
        return Array.from({ length: 80 }).map((_, i) => ({
            id: i,
            left: `${Math.random() * 100}%`,
            delay: `${Math.random() * 2}s`,
            duration: `${1.5 + Math.random() * 2}s`,
            color: ['#10B981', '#3B82F6', '#FBBF24', '#EC4899', '#8B5CF6'][i % 5],
            size: `${Math.random() * 10 + 5}px`,
            tilt: `${Math.random() * 360}deg`
        }));
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[300] overflow-hidden">
            <style>
                {`
                @keyframes confetti-fall {
                    0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
                    100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
                }
                .confetti-particle {
                    position: absolute;
                    top: -20px;
                    animation: confetti-fall linear forwards;
                }
                `}
            </style>
            {/* FIX: Changed 'i % 2 === 0' to 'p.id % 2 === 0' to fix the "Cannot find name 'i'" error. */}
            {particles.map(p => (
                <div
                    key={p.id}
                    className="confetti-particle"
                    style={{
                        left: p.left,
                        backgroundColor: p.color,
                        width: p.size,
                        height: p.size,
                        borderRadius: p.id % 2 === 0 ? '50%' : '2px',
                        animationDelay: p.delay,
                        animationDuration: p.duration,
                        transform: `rotate(${p.tilt})`
                    }}
                />
            ))}
        </div>
    );
};

// First Login Celebration Component
const FirstLoginCelebration: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [isExploding, setIsExploding] = useState(false);

    const handleStart = () => {
        setIsExploding(true);
        // Particles last for 3 seconds before modal closes as instructed
        setTimeout(() => {
            onClose();
        }, 3000);
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center">
            {isExploding && <ConfettiRain />}
            <div className={`absolute inset-0 bg-black/40 backdrop-blur-[4px] transition-opacity duration-500 ${isExploding ? 'opacity-0' : 'opacity-100'}`}></div>
            <div className={`relative bg-white p-8 rounded-[40px] shadow-2xl border border-emerald-100 text-center transition-all duration-500 max-w-sm mx-4 ${isExploding ? 'scale-0 opacity-0' : 'scale-100 opacity-100 animate-in zoom-in'}`}>
                <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 animate-bounce">
                    <PartyPopper size={48} />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">Welcome Aboard! 🎉</h2>
                <p className="text-gray-600 font-medium mb-8 leading-relaxed">
                    Congratulations! Your account is now active. We're excited to help you reach your financial goals.
                </p>
                <button 
                    onClick={handleStart}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-black py-5 rounded-[24px] shadow-xl shadow-emerald-200 transition-all active:scale-95 text-lg"
                >
                    Let's Start Saving
                </button>
            </div>
        </div>
    );
};

// Dynamic Savings CTA Banner
const SavingsBanner: React.FC = () => {
    const { user } = useAuth();
    const [isQuickSaveOpen, setIsQuickSaveOpen] = useState(false);
    
    const bannerConfig = useMemo(() => {
        const goalsCount = user?.goalsCount || 0;
        const rate = user?.goalAchievementRate || 0;

        if (goalsCount === 0) {
            return {
                gradient: "from-indigo-900 via-indigo-800 to-indigo-700",
                title: "Achieve your goals faster! 🚀",
                text: "Consistency is the secret to wealth. Every deposit brings you one step closer to your dream. Start growing your savings today with PesaFlow.",
                buttonText: "Start Now",
                buttonIcon: <TrendingUp size={18} />,
                actionType: 'NAVIGATE',
                icon: (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-emerald-400 drop-shadow-md">
                        <path d="M19 18.5C19 19.8807 17.8807 21 16.5 21H7.5C6.11929 21 5 19.8807 5 18.5V11C5 7.13401 8.13401 4 12 4C15.866 4 19 7.13401 19 11V18.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 2V4M12 21V23M5 11H3M21 11H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M9 13L12 10L15 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M12 10V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                )
            };
        }

        if (rate < 20) {
            return {
                gradient: "from-rose-900 via-rose-800 to-rose-700",
                title: "Stay on track with your goals! ⏰",
                text: "Every second counts. Regular savings ensure you meet your targets on time. Don't delay your dreams—consistency is the key to fulfilling what you set out to achieve.",
                buttonText: "Save for Goals",
                buttonIcon: <Wallet size={18} />,
                actionType: 'MODAL',
                icon: <Clock size={40} className="text-rose-300 drop-shadow-md" />
            };
        }

        if (rate < 50) {
            return {
                gradient: "from-amber-900 via-amber-800 to-amber-700",
                title: "You're making steady progress! 🌱",
                text: "You've started strong and already reached over 20% of your targets! Keep pushing to reach that 50% milestone. Your future self will thank you for the extra effort today.",
                buttonText: "Do More",
                buttonIcon: <Rocket size={18} />,
                actionType: 'MODAL',
                icon: <TrendingUp size={40} className="text-amber-300 drop-shadow-md" />
            };
        }

        if (rate < 80) {
            return {
                gradient: "from-sky-900 via-sky-800 to-sky-700",
                title: "Over halfway there! 📈",
                text: "Incredible effort! You've crossed the halfway mark. You are closer to your goal than you think. Keep the momentum going and watch your dreams manifest.",
                buttonText: "Continue Saving",
                buttonIcon: <PiggyBank size={18} />,
                actionType: 'MODAL',
                icon: <Award size={40} className="text-sky-300 drop-shadow-md" />
            };
        }

        if (rate < 100) {
            return {
                gradient: "from-emerald-900 via-emerald-800 to-emerald-700",
                title: "Almost at the finish line! 🎯",
                text: "Congratulations on your amazing progress! You're in the home stretch now. Your dedication is truly inspiring—finish strong and fulfill your goals today.",
                buttonText: "Complete Goal",
                buttonIcon: <CheckCircle2 size={18} />,
                actionType: 'MODAL',
                icon: <Sparkles size={40} className="text-emerald-300 drop-shadow-md" />
            };
        }

        return {
            gradient: "from-fuchsia-900 via-fuchsia-800 to-fuchsia-700",
            title: "Mission Accomplished! 🎊",
            text: "You've hit 100%! This is a testament to your incredible discipline. Why stop here? Your success today is the foundation for an even bigger dream tomorrow.",
            buttonText: "Set New Goal",
            buttonIcon: <Plus size={18} />,
            actionType: 'NAVIGATE',
            icon: <Award size={40} className="text-fuchsia-300 drop-shadow-md" />
        };
    }, [user]);

    const handleAction = (e: React.MouseEvent) => {
        if (bannerConfig.actionType === 'MODAL') {
            e.preventDefault();
            setIsQuickSaveOpen(true);
        }
    };

    return (
        <>
            <div className={`relative overflow-hidden bg-gradient-to-r ${bannerConfig.gradient} rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between shadow-xl border border-white/10 group transition-all duration-500`}>
                <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-700"></div>
                <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-700"></div>
                <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8 z-10">
                    <div className="relative">
                        <div className="w-16 h-16 md:w-20 md:h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-2xl">
                            {bannerConfig.icon}
                            <div className="absolute -top-1 -right-1 bg-yellow-400 rounded-full p-1 shadow-lg animate-bounce">
                                <Sparkles size={10} className="text-indigo-900" />
                            </div>
                        </div>
                    </div>
                    <div className="text-center md:text-left">
                        <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight leading-tight">{bannerConfig.title}</h2>
                        <p className="text-white/80 text-xs sm:text-sm md:text-base mt-2 max-w-xl font-medium leading-relaxed">{bannerConfig.text}</p>
                    </div>
                </div>
                <div className="mt-6 md:mt-0 z-10 w-full md:w-auto">
                    {bannerConfig.actionType === 'NAVIGATE' ? (
                        <Link to="/goals" className="flex items-center justify-center space-x-2 w-full md:w-auto bg-yellow-400 hover:bg-yellow-500 text-indigo-900 font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg active:scale-95 group/btn whitespace-nowrap">
                            {React.cloneElement(bannerConfig.buttonIcon as React.ReactElement<any>, { className: 'group-hover/btn:scale-110 transition-transform' })}
                            <span className="text-sm sm:text-base">{bannerConfig.buttonText}</span>
                        </Link>
                    ) : (
                        <button onClick={handleAction} className="flex items-center justify-center space-x-2 w-full md:w-auto bg-yellow-400 hover:bg-yellow-500 text-indigo-900 font-bold py-3.5 px-8 rounded-xl transition-all shadow-lg active:scale-95 group/btn whitespace-nowrap">
                            {React.cloneElement(bannerConfig.buttonIcon as React.ReactElement<any>, { className: 'group-hover/btn:scale-110 transition-transform' })}
                            <span className="text-sm sm:text-base">{bannerConfig.buttonText}</span>
                        </button>
                    )}
                </div>
            </div>
            <QuickSaveModal isOpen={isQuickSaveOpen} onClose={() => setIsQuickSaveOpen(false)} />
        </>
    );
};

// Statistics Chart Card
const StatisticsChartCard: React.FC<{ chartData: any[], currency: string }> = ({ chartData, currency }) => {
    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const earnings = payload.find((p: any) => p.dataKey === 'earnings')?.value;
            const savings = payload.find((p: any) => p.dataKey === 'savings')?.value;
            return (
                <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-100">
                    <p className="text-xs font-bold text-gray-600 mb-2">{label}</p>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500 mr-2"></span><span className="text-sm text-gray-700">{currency} {earnings?.toLocaleString()}</span></div>
                        <div className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-pink-500 mr-2"></span><span className="text-sm text-gray-700">{currency} {savings?.toLocaleString()}</span></div>
                    </div>
                </div>
            );
        }
        return null;
    };
    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-800">Statistics</h3>
                <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-indigo-500 mr-2"></span><span>Earnings</span></div>
                    <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-pink-500 mr-2"></span><span>Savings</span></div>
                </div>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value >= 1000 ? (value/1000).toFixed(0) + 'k' : value}`} />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '3 3' }} />
                        <Line type="monotone" dataKey="earnings" stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 6, fill: '#6366f1', stroke: 'white', strokeWidth: 2 }} />
                        <Line type="monotone" dataKey="savings" stroke="#ec4899" strokeWidth={2} dot={false} activeDot={{ r: 6, fill: '#ec4899', stroke: 'white', strokeWidth: 2 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

const GoalCard: React.FC<{ iconStr: string; title: string; subtitle: string; current: number; target: number; color: string; currency: string }> = ({ iconStr, title, subtitle, current, target, color, currency }) => {
    const progress = target > 0 ? (current / target) * 100 : 0;
    const getIcon = (str: string) => {
        switch (str) {
            case 'PLANE': return <Plane size={20} />;
            case 'HOME': return <Home size={20} />;
            case 'BRIEFCASE': return <Briefcase size={20} />;
            case 'BOOK': return <BookOpen size={20} />;
            case 'HEART': return <HeartPulse size={20} />;
            case 'GIFT': return <Gift size={20} />;
            default: return <Wallet size={20} />;
        }
    };
    return (
        <Card>
            <div className="flex items-start space-x-3">
                <div className="p-3 rounded-lg bg-opacity-20" style={{ backgroundColor: `${color}20`, color }}>{getIcon(iconStr)}</div>
                <div><p className="font-bold text-gray-800 text-sm line-clamp-1" title={title}>{title}</p><p className="text-xs text-gray-500">{subtitle}</p></div>
            </div>
            <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2"><div className="h-2 rounded-full" style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: color }}></div></div>
                <div className="flex justify-between text-xs font-medium text-gray-600 mt-1"><span>{currency} {current.toLocaleString()}</span><span>{currency} {target.toLocaleString()}</span></div>
            </div>
        </Card>
    );
};

const RightSidebarContent: React.FC<{ transactions: any[], currency: string }> = ({ transactions, currency }) => {
    const getStatusColor = (status: string) => {
        const normalizedStatus = status ? status.toUpperCase() : '';
        switch (normalizedStatus) {
            case 'COMPLETED': return 'bg-green-100 text-green-600';
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            case 'FAILED':
            case 'CANCELLED': return 'bg-red-100 text-red-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const formatTransactionDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);

        const diffMs = now.getTime() - date.getTime();
        const diffMin = Math.floor(diffMs / 60000);

        if (diffMin < 1) return 'now';

        const isToday = date.toDateString() === now.toDateString();
        const isYesterday = date.toDateString() === yesterday.toDateString();

        const timeString = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

        if (isToday) return timeString;
        if (isYesterday) return `Yesterday at ${timeString}`;
        
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        }).replace(',', ' at');
    };

    return (
        <Card>
            <h3 className="font-bold text-lg text-gray-800 mb-4">Linked Cards</h3>
            <div className="relative h-48 flex items-center justify-center">
                <div className="absolute w-full max-w-xs h-44 bg-yellow-300 rounded-xl transform rotate-6"></div>
                <div className="absolute w-full max-w-xs h-44 bg-green-300 rounded-xl transform rotate-3"></div>
                <div className="absolute w-full max-w-xs h-44 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl p-4 text-white flex flex-col justify-between shadow-lg">
                    <div className="flex justify-between items-start">
                        <div><p className="text-3xl font-bold">TZS 410,274</p><p className="text-sm opacity-80">Debit Card</p></div>
                        <div className="flex -space-x-2"><div className="w-6 h-6 rounded-full bg-red-400 border-2 border-pink-500"></div><div className="w-6 h-6 rounded-full bg-yellow-300 opacity-90 border-2 border-pink-500"></div></div>
                    </div>
                    <div className="flex justify-between items-end"><span className="font-mono text-sm opacity-80">**** 1973</span><div className="w-8 h-6 bg-white/20 rounded"></div></div>
                </div>
            </div>
            <div className="flex justify-between items-center mt-8 mb-6"><h3 className="font-bold text-lg text-gray-800">Recent Transactions</h3><Link to="/activity" className="text-sm text-blue-500 font-medium hover:underline">See All</Link></div>
            <div className="space-y-6">
                {transactions.length === 0 ? (<p className="text-gray-500 text-sm text-center">No recent transactions.</p>) : (transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 flex items-center justify-center rounded-full ${getStatusColor(tx.status)} transition-transform hover:scale-110`}>{tx.paymentType === 'SAVING' ? <PiggyBank size={22} /> : <Wallet size={22} />}</div>
                            <div><p className="font-bold text-gray-800 text-sm line-clamp-1" title={tx.description}>{tx.description}</p><p className="text-xs text-gray-500 mt-1">{formatTransactionDate(tx.transactionDate)}</p></div>
                        </div>
                        <p className={`font-bold text-sm ${tx.transactionType === 'INCOME' ? 'text-green-600' : 'text-gray-800'}`}>{tx.transactionType === 'INCOME' ? '+' : '-'}{currency} {tx.amount.toLocaleString()}</p>
                    </div>
                )))}
            </div>
        </Card>
    );
};

const SaverDashboard: React.FC = () => {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showCelebration, setShowCelebration] = useState(false);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await interceptedFetch(`${API_BASE_URL}/api/v1/savings/dashboard`);
                const data = await response.json();
                if (data.success) {
                    setDashboardData(data.data);
                    
                    // Trigger first-login animation if loginCount from Auth context is exactly 1
                    if (user?.loginCount === 1 && !sessionStorage.getItem('firstLoginCelebrated')) {
                        setShowCelebration(true);
                        sessionStorage.setItem('firstLoginCelebrated', 'true');
                    }
                }
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, [user]);

    const chartData = useMemo(() => {
        if (!dashboardData?.chartData) return [];
        const { categories, series } = dashboardData.chartData;
        return categories.map((cat: string, index: number) => ({
            name: cat,
            earnings: series.find((s: any) => s.name === 'Earnings')?.data[index] || 0,
            savings: series.find((s: any) => s.name === 'Savings')?.data[index] || 0
        }));
    }, [dashboardData]);

    if (loading) return <div className="flex items-center justify-center h-[calc(100vh-100px)]"><Loader2 size={48} className="animate-spin text-primary" /></div>;
    if (!dashboardData) return <div className="p-8 text-center text-gray-500">Unable to load dashboard data.</div>;

    const { summary, goals, recentTransactions } = dashboardData;

    return (
        <div className="relative">
            {showCelebration && <FirstLoginCelebration onClose={() => setShowCelebration(false)} />}
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 xl:gap-8">
                <div className="lg:col-span-2 space-y-6 xl:space-y-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                        <SummaryStatCard icon={<Wallet size={20} />} title="Current balance" value={`${summary.currency} ${summary.currentBalance.toLocaleString()}`} />
                        <SummaryStatCard icon={<TrendingUp size={20} />} title="Monthly Earnings" value={`${summary.currency} ${summary.monthlyEarnings.toLocaleString()}`} />
                        <SummaryStatCard icon={<PiggyBank size={20} />} title="Total Savings" value={`${summary.currency} ${summary.totalSavings.toLocaleString()}`} />
                        <SummaryStatCard icon={<CreditCard size={20} />} title="Total Expenditure" value={`${summary.currency} ${summary.totalExpenditure.toLocaleString()}`} />
                    </div>
                    <SavingsBanner />
                    <StatisticsChartCard chartData={chartData} currency={summary.currency} />
                    <div>
                        <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-gray-800">Goals</h2><Link to="/goals" className="text-sm text-primary font-medium hover:underline">See All</Link></div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {goals && goals.length > 0 ? goals.slice(0, 3).map((goal: any, i: number) => (
                                <GoalCard key={goal.id} iconStr={goal.icon} title={goal.goalName} subtitle={`${goal.daysRemaining} days left`} current={goal.currentAmount} target={goal.targetAmount} color={['#f97316', '#ec4899', '#8b5cf6'][i % 3]} currency={goal.currency} />
                            )) : (
                                <Card className="flex flex-col items-center justify-center text-center h-full border-dashed border-2 border-gray-300">
                                    <Plus size={24} className="text-gray-400 mb-3" />
                                    <h3 className="font-semibold text-gray-800">No Goals Yet</h3>
                                    <Link to="/goals" className="mt-4 bg-primary text-white text-xs font-bold py-2 px-4 rounded-lg">Create Goal</Link>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1 space-y-6 xl:space-y-8">
                    <RightSidebarContent transactions={recentTransactions.slice(0, 5)} currency={summary.currency} />
                </div>
            </div>
        </div>
    );
};

export default SaverDashboard;