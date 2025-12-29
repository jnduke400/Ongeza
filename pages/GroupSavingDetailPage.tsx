
import React, { useEffect, useState, useRef, useMemo } from 'react';
// FIX: Using namespace import for react-router-dom to handle potential module resolution issues.
import { useParams, Link, useNavigate } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';
import { MoreVertical } from 'lucide-react';
import { getGroupSavingDetail } from '../services/mockData';
import { GroupSavingDetail, GroupTransaction, MemberGoal, ActivityDataPoint } from '../types';
import { useAuth } from '../contexts/AuthContext';

type ActivityPeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
};

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-sm ${className}`}>
        {children}
    </div>
);

const ActivitiesChart: React.FC<{ 
    data: ActivityDataPoint[];
    activePeriod: ActivityPeriod;
    onPeriodChange: (period: ActivityPeriod) => void;
}> = ({ data, activePeriod, onPeriodChange }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const menuItems: { label: string, period: ActivityPeriod }[] = [
        { label: 'Daily', period: 'daily' },
        { label: 'Weekly', period: 'weekly' },
        { label: 'Monthly', period: 'monthly' },
        { label: 'Yearly', period: 'yearly' },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);
    
    const yAxisMax = useMemo(() => {
        if (!data || data.length === 0) return 5000;
        const maxVal = Math.max(...data.map(d => d.Payments), ...data.map(d => d.Transfer));
        
        if (maxVal <= 10000) return Math.ceil(maxVal / 1000) * 1000 + 1000;
        if (maxVal <= 100000) return Math.ceil(maxVal / 10000) * 10000 + 10000;
        return Math.ceil(maxVal / 100000) * 100000 + 100000;
    }, [data]);

    const yAxisTicks = useMemo(() => {
        if (yAxisMax === 0) return [0];
        const ticks = [];
        const numTicks = 5;
        const step = yAxisMax / numTicks;
        for (let i = 0; i <= yAxisMax; i += step) {
            ticks.push(Math.round(i));
        }
        return ticks;
    }, [yAxisMax]);


    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const paymentPayload = payload.find(p => p.dataKey === 'Payments');
            if (paymentPayload) {
                return (
                    <div className="bg-white p-2 px-4 rounded-lg shadow-lg border border-gray-100 relative -translate-x-1/2 -translate-y-12">
                         <div className="absolute w-3 h-3 bg-white border-r border-b border-gray-100 rotate-45 -bottom-1.5 left-1/2 -translate-x-1/2"></div>
                        <p className="font-bold text-sm text-gray-800">TZS {paymentPayload.value.toLocaleString()}</p>
                    </div>
                );
            }
        }
        return null;
    };

    const CustomCursor = (props: any) => {
        const { points, width, height } = props;
        if (!points || points.length === 0) return null;
        
        const { x } = points[0];
        const bandWidth = width / (data.length > 1 ? data.length - 1 : 1);

        return (
            <rect
                x={x - bandWidth / 2}
                y={0}
                width={bandWidth}
                height={height}
                fill="rgba(239, 246, 255, 0.7)"
            />
        );
    };

    return (
        <Card className="h-full flex flex-col">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <h3 className="font-bold text-xl text-gray-800">Activities</h3>
                <div className="flex items-center flex-wrap gap-x-4 gap-y-2">
                    <div className="flex items-center text-sm font-medium"><div className="w-2.5 h-2.5 rounded-full bg-indigo-700 mr-2"></div>Payments</div>
                    <div className="flex items-center text-sm font-medium"><div className="w-2.5 h-2.5 rounded-full bg-orange-500 mr-2"></div>Transfer</div>
                    <div className="relative" ref={menuRef}>
                        <button onClick={() => setIsMenuOpen(prev => !prev)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
                            <MoreVertical size={20}/>
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-20 p-2 border border-gray-100 text-left">
                                <ul className="text-sm text-gray-800 font-medium">
                                    {menuItems.map(item => (
                                        <li key={item.period}>
                                            <button 
                                                onClick={() => { onPeriodChange(item.period); setIsMenuOpen(false); }} 
                                                className={`w-full text-left flex items-center px-3 py-2 hover:bg-gray-100 rounded-md ${activePeriod === item.period ? 'font-bold text-primary' : ''}`}
                                            >
                                                {item.label}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 20, right: 30, left: 30, bottom: 10 }}>
                        <defs>
                            <filter id="shadowPayment" x="-50%" y="-50%" width="200%" height="200%">
                                <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#4338ca" floodOpacity="0.3"/>
                            </filter>
                            <filter id="shadowTransfer" x="-50%" y="-50%" width="200%" height="200%">
                                <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#f97316" floodOpacity="0.3"/>
                            </filter>
                        </defs>
                        <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#e5e7eb" />
                        <XAxis 
                            dataKey="name" 
                            tick={{ fill: '#6B7280', fontSize: 12 }} 
                            axisLine={false} 
                            tickLine={false} 
                            dy={10} 
                        />
                        <YAxis 
                            tick={{ fill: '#6B7280', fontSize: 12 }} 
                            axisLine={false} 
                            tickLine={false} 
                            tickFormatter={(value) => `TZS ${value.toLocaleString()}`}
                            domain={[0, yAxisMax]}
                            ticks={yAxisTicks}
                        />
                        <Tooltip 
                           content={<CustomTooltip />} 
                           cursor={<CustomCursor />}
                           wrapperStyle={{ zIndex: 10, outline: 'none' }}
                           allowEscapeViewBox={{ x: true, y: true }}
                        />
                        <Line 
                            type="monotone" 
                            dataKey="Payments" 
                            stroke="#4338ca" 
                            strokeWidth={3} 
                            dot={false}
                            activeDot={{ r: 5, stroke: 'white', strokeWidth: 2 }}
                            filter="url(#shadowPayment)"
                        />
                        <Line 
                            type="monotone" 
                            dataKey="Transfer" 
                            stroke="#f97316"
                            strokeWidth={3} 
                            dot={false}
                            activeDot={{ r: 5, stroke: 'white', strokeWidth: 2 }}
                             filter="url(#shadowTransfer)"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

const TransactionHistory: React.FC<{ transactions: GroupTransaction[] }> = ({ transactions }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const { groupId } = useParams<{ groupId: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    return (
        <Card className="h-full flex flex-col">
             <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h3 className="font-bold text-xl text-gray-800">Transaction History</h3>
                 <div className="relative" ref={menuRef}>
                    <button onClick={() => setIsMenuOpen(prev => !prev)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
                        <MoreVertical size={20}/>
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-20 p-2 border border-gray-100 text-left">
                            <ul className="text-sm text-gray-800 font-medium">
                                <li>
                                    <button
                                        onClick={() => { if(groupId) navigate(`/group-saving/${groupId}/transactions`); setIsMenuOpen(false); }}
                                        className="w-full text-left flex items-center px-3 py-2 hover:bg-gray-100 rounded-md"
                                    >
                                        View Transaction Details
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => { if(groupId) navigate(`/group-saving/${groupId}/summary`); setIsMenuOpen(false); }}
                                        className="w-full text-left flex items-center px-3 py-2 hover:bg-gray-100 rounded-md"
                                    >
                                        View Summary Report
                                    </button>
                                </li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>
            <p className="text-sm font-semibold text-gray-500 mb-4 flex-shrink-0">{transactions.length > 0 ? new Date(transactions[0].date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'No transactions'}</p>
            <div className="space-y-4 flex-grow">
                {transactions.map(tx => (
                    <div key={tx.id} className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                            <img src={tx.member.avatar} alt={tx.member.name} className="w-10 h-10 rounded-full mr-4"/>
                            <div>
                                <p className="font-semibold text-gray-800">{tx.member.name}</p>
                                <p className="text-xs text-gray-500">{formatDate(tx.date)}</p>
                            </div>
                        </div>
                        <div>
                            <p className={`font-bold ${tx.type === 'Income' ? 'text-green-600' : 'text-red-600'}`}>
                                {tx.type === 'Income' ? '+' : '-'} TZS {tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-gray-500 text-right">{tx.paymentType}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const StatisticsChart: React.FC = () => {
    const data = [{ name: 'Payment', value: 400 }, { name: 'Transfer', value: 300 }, { name: 'Balance', value: 300 }];
    const COLORS = ['#2D3B8E', '#F4694C', '#EEF0FA'];

    return (
        <Card className="h-full flex flex-col">
            <div className="w-full flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl text-gray-800">Statistics</h3>
                <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={20}/></button>
            </div>
            <div className="flex-grow flex flex-col items-center justify-center">
                <div className="w-40 h-40 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={data} cx="50%" cy="50%" innerRadius={50} outerRadius={70} fill="#8884d8" paddingAngle={5} dataKey="value" stroke="none">
                                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-gray-800">42%</span>
                    </div>
                </div>
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-4 text-sm font-medium">
                     <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-sm bg-[#2D3B8E] mr-2"></div>Payment</div>
                     <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-sm bg-[#F4694C] mr-2"></div>Transfer</div>
                     <div className="flex items-center"><div className="w-2.5 h-2.5 rounded-sm bg-[#EEF0FA] mr-2"></div>Balance</div>
                </div>
            </div>
        </Card>
    );
};

const CardInfo: React.FC<{ group: GroupSavingDetail }> = ({ group }) => {
    
    const MastercardIcon = () => (
         <div className="flex -space-x-3">
            <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-[#2D3B8E]"></div>
            <div className="w-6 h-6 rounded-full bg-yellow-400 opacity-90 border-2 border-[#2D3B8E]"></div>
        </div>
    );
    
     const SmallMastercardIcon = () => (
        <div className="flex -space-x-2">
            <div className="w-5 h-5 rounded-full bg-red-500"></div>
            <div className="w-5 h-5 rounded-full bg-yellow-400 opacity-90"></div>
        </div>
    );

    const TanzaniaFlagIcon = () => (
        <svg width="24" height="18" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg" className="rounded-sm shadow-sm">
          <defs>
            <clipPath id="clipTz">
              <polygon points="0 600, 900 0, 900 600" />
            </clipPath>
          </defs>
          <rect width="900" height="600" fill="#1eb53a"/>
          <rect width="900" height="600" fill="#00a3dd" clipPath="url(#clipTz)"/>
          <path d="M0 600L900 0" stroke="#fcd116" strokeWidth="200"/>
          <path d="M0 600L900 0" stroke="#000" strokeWidth="150"/>
        </svg>
    );

    const CardWave = () => (
        <div className="absolute bottom-0 right-0 w-full h-full overflow-hidden" aria-hidden="true">
            <svg width="220" height="90" viewBox="0 0 220 90" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute bottom-0 right-0">
                <path d="M219.722 89.5C219.722 89.5 158.423 98.4847 132.893 72.822C107.363 47.1593 113.882 25.4326 73.1093 17.026C32.3364 8.61933 0 45.421 0 45.421V89.5H219.722Z" fill="#F4694C" fillOpacity="0.8"/>
                <path d="M220 89.5C220 89.5 155.228 100.288 132.613 74.3821C110 48.4766 103.58 27.2023 68.3242 17.5134C33.0683 7.82453 0 48.4766 0 48.4766V89.5H220Z" fill="#2995D9" fillOpacity="0.8"/>
            </svg>
        </div>
    );
    
    return (
        <Card className="h-full flex flex-col">
            <h3 className="font-bold text-xl text-gray-800 mb-4">Account Info</h3>
            <div className="flex flex-col flex-grow">
                {/* Top Blue Card */}
                <div className="bg-[#2D3B8E] text-white p-5 rounded-2xl relative overflow-hidden flex-grow flex flex-col justify-between shadow-lg">
                    <CardWave />
                     <div className="relative z-10">
                        <div className="flex justify-between items-start">
                            <p className="text-sm opacity-80">Balance</p>
                            <MastercardIcon />
                        </div>
                        <p className="text-xl font-bold mt-2">
                            TZS {group.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                    </div>
                    <div className="relative z-10 text-sm font-mono opacity-80">
                        <p>7383 **** **** ****</p>
                        <p>9383</p>
                    </div>
                </div>

                {/* Bottom White Details Section */}
                <div className="bg-white p-5 rounded-2xl mt-4 shadow-sm space-y-3 text-sm border border-gray-100">
                     <div className="flex justify-between items-center">
                        <span className="text-gray-500">Status</span>
                        <span className="font-bold text-cyan-500">Active</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500">Type</span>
                        <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-800">Mastercard</span>
                            <SmallMastercardIcon />
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-500">Currency</span>
                        <div className="flex items-center space-x-2">
                            <span className="font-bold text-gray-800">TZS</span>
                            <TanzaniaFlagIcon />
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};


const GoalsBudget: React.FC<{ goals: MemberGoal[] }> = ({ goals }) => (
    <Card className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
            <h3 className="font-bold text-lg text-gray-800">Goals Budget</h3>
            <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={20}/></button>
        </div>
        <div className="space-y-4 flex-grow">
            {goals.map(goal => (
                <div key={goal.id}>
                    <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3" style={{backgroundColor: `${goal.color}30`}}>{goal.icon}</div>
                            <span className="font-semibold text-gray-700">{goal.name}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-500">{goal.progress}/100</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="h-2 rounded-full" style={{ width: `${goal.progress}%`, backgroundColor: goal.color }}></div>
                    </div>
                </div>
            ))}
        </div>
    </Card>
);

const ReferralIllustration = () => (
    <svg viewBox="0 0 320 210" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" style={{ maxWidth: '280px', margin: '0 auto' }}>
        <defs>
            <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#EFF6FF', stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: '#F9FAFB', stopOpacity: 1 }} />
            </linearGradient>
        </defs>
        <rect width="320" height="210" fill="url(#skyGradient)" />
        <path d="M-10 180 C 80 140, 160 220, 330 160 L 330 210 L -10 210 Z" fill="#E0F2FE" />
        <path d="M200 80 C 220 100, 230 140, 210 160 C 190 140, 200 100, 200 80 Z" fill="#DBEAFE" />
        <g fill="#DBEAFE">
            <rect x="230" y="100" width="10" height="60" rx="2" />
            <rect x="245" y="80" width="12" height="80" rx="2" />
            <rect x="262" y="110" width="10" height="50" rx="2" />
        </g>
        <g transform="translate(10, 0)">
            <path d="M40 170 L 280 170 L 270 185 L 50 185 Z" fill="#D1D5DB" />
            <rect x="45" y="170" width="230" height="5" fill="#9CA3AF" />
            <rect x="60" y="70" width="200" height="100" fill="#3B82F6" stroke="#1E3A8A" strokeWidth="4" rx="5" />
            <circle cx="160" cy="78" r="1.5" fill="#1E3A8A" />
        </g>
        <g fill="#F97316">
            <path d="M120 105 L 140 105 L 210 80 L 210 140 L 140 115 L 120 115 Z" />
            <rect x="110" y="105" width="10" height="10" />
        </g>
        <g>
            <path d="M90 120 C 95 110, 105 110, 110 120 L 105 170 L 95 170 Z" fill="#FB923C" />
            <path d="M90 120 L 110 120 L 105 135 L 95 135 Z" fill="white" />
            <path d="M92 125 L 95 150 L 90 140 Z" fill="#DC2626" />
            <circle cx="100" cy="110" r="8" fill="#FDE68A" />
            <path d="M95 105 h 10 v 5 h -10 Z" fill="#1E3A8A" />
            <rect x="80" y="108" width="15" height="5" fill="#1E3A8A" />
        </g>
        <g>
            <path d="M150 50 L 170 50 L 175 90 L 145 90 Z" fill="#1D4ED8" />
            <path d="M145 90 L 150 110 L 170 110 L 175 90" fill="#1E3A8A" />
            <circle cx="160" cy="40" r="8" fill="#FDE68A" />
            <path d="M152 35 h 16 v 8 h -16 Z" fill="#111827" />
            <rect x="165" y="55" width="20" height="12" fill="#FB923C" rx="2" />
        </g>
        <g>
            <rect x="155" y="110" width="10" height="30" fill="#3B82F6" />
            <rect x="152" y="100" width="16" height="20" fill="white" />
            <circle cx="160" cy="95" r="7" fill="#FDE68A" />
            <path d="M155 90 h 10 v 5 h -10 Z" fill="#1E3A8A" />
            <path d="M158 105 L 162 105 L 160 110 Z" fill="#EA580C" />
        </g>
        <g transform="translate(10, 0)">
            <path d="M220 110 L 240 110 L 235 150 L 225 150 Z" fill="#1D4ED8" />
            <path d="M220 150 L 240 150 L 235 170 L 225 170 Z" fill="#FB923C" />
            <circle cx="230" cy="100" r="8" fill="#FDE68A" />
            <path d="M222 95 h 16 v 8 h -16 Z" fill="#111827" />
            <path d="M225 110 L 235 110 L 230 125 Z" fill="white" />
            <rect x="240" y="120" width="10" height="8" fill="#1E3A8A" rx="2" />
        </g>
        <path d="M40 50 L 60 60 L 40 70 L 45 60 Z" fill="white" stroke="#BFDBFE" strokeWidth="1.5" />
        <path d="M270 60 L 290 70 L 270 80 L 275 70 Z" fill="white" stroke="#BFDBFE" strokeWidth="1.5" />
        <g>
            <circle cx="210" cy="40" r="6" fill="#A78BFA" stroke="white" strokeWidth="1.5" />
            <circle cx="240" cy="30" r="6" fill="#A78BFA" stroke="white" strokeWidth="1.5" />
            <circle cx="260" cy="50" r="6" fill="#A78BFA" stroke="white" strokeWidth="1.5" />
            <circle cx="245" cy="65" r="6" fill="#A78BFA" stroke="white" strokeWidth="1.5" />
            <g stroke="#A78BFA" strokeWidth="1" strokeDasharray="2 2" fill="none">
                <path d="M210 40 L 240 30 L 260 50 L 245 65 Z" />
            </g>
        </g>
    </svg>
);


const InviteCard: React.FC = () => (
    <Card className="text-center flex flex-col items-center justify-between h-full">
        <ReferralIllustration />
        <div className="flex-grow flex flex-col justify-center">
            <h3 className="font-bold text-lg text-gray-800 mt-2">Invite & Earn Rewards</h3>
            <p className="text-gray-600 text-sm mt-2 mb-4 max-w-xs mx-auto">
                Share the benefits of PesaFlow with your friends and earn rewards together.
            </p>
        </div>
        <button className="mt-auto bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-lg transition-colors w-full max-w-xs">
            Invite Friend
        </button>
    </Card>
);


const GroupSavingDetailPage: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const { user } = useAuth();
    const [groupDetail, setGroupDetail] = useState<GroupSavingDetail | null>(null);
    const [activityPeriod, setActivityPeriod] = useState<ActivityPeriod>('daily');

    useEffect(() => {
        if (groupId) {
            const data = getGroupSavingDetail(groupId);
            setGroupDetail(data || null);
        }
    }, [groupId]);

    const transactionsForDisplay = useMemo(() => {
        if (user?.isSolo && groupDetail) {
            return groupDetail.transactions.filter(tx => tx.member.id === user.id);
        }
        return groupDetail?.transactions || [];
    }, [user, groupDetail]);

    if (!groupDetail) {
        return <div className="p-8 text-center">Loading group details...</div>;
    }

    const activityDataForChart = groupDetail.activity ? groupDetail.activity[activityPeriod] : [];

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">{groupDetail.name} Overview</h1>
                    <p className="text-gray-500 mt-1">Hi {user ? user.firstName : 'User'}, get your summary of your group's monthly transaction here</p>
                </div>
                <Link 
                    to={`/group-saving/${groupId}/pending-contributions`} 
                    className="bg-secondary hover:bg-secondary-dark text-white font-bold py-2.5 px-5 rounded-lg transition-colors shadow-sm"
                >
                    Pending Contributions
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="md:col-span-2 xl:col-span-2">
                    <ActivitiesChart 
                        data={activityDataForChart}
                        activePeriod={activityPeriod}
                        onPeriodChange={setActivityPeriod}
                    />
                </div>
                <div className="md:col-span-1 xl:col-span-1">
                    <StatisticsChart />
                </div>
                <div className="md:col-span-1 xl:col-span-1">
                    <CardInfo group={groupDetail} />
                </div>
                
                <div className="md:col-span-2 xl:col-span-2">
                    <TransactionHistory transactions={transactionsForDisplay} />
                </div>
                <div className="md:col-span-1 xl:col-span-1">
                    <GoalsBudget goals={groupDetail.memberGoals} />
                </div>
                <div className="md:col-span-1 xl:col-span-1">
                    <InviteCard />
                </div>
            </div>
        </div>
    );
};

export default GroupSavingDetailPage;
