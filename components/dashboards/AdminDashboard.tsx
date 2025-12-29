
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { 
    Wallet, PiggyBank, Briefcase, CreditCard, MoreVertical, ArrowUpRight, ArrowDownRight,
    ClipboardCheck, Clock, FileSignature, UserCheck, Loader2, AlertCircle, Bell, User, 
    FileText as FileIcon
} from 'lucide-react';
import { interceptedFetch } from '../../services/api';
import { API_BASE_URL } from '../../services/apiConfig';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string;
    createdAt: string;
    read: boolean;
}

interface RecentNotification {
    fullName: string;
    userCategory: string;
    profilePictureUrl: string | null;
    createdAt: string;
}

interface TodoItem {
    id: number;
    requestReason: string;
    assignedAt: string;
    status: string;
}

interface AdminDashboardData {
    totalCollection: number;
    thisWeekCollection: number;
    saverAccounts: number;
    borrowerAccounts: number;
    newClients: number;
    investorAccounts: number;
    approvalProgress: number;
    estimatedDays: number;
    revenueGraphData: {
        date: string;
        currentWeekAmount: number;
        previousWeekAmount: number;
    }[];
    todoList: TodoItem[];
    latestUnreadNotification: Notification | null;
    recentNotifications: RecentNotification[];
}

// Reusable Card component
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-surface p-5 rounded-2xl shadow-sm border border-gray-100 ${className}`}>
        {children}
    </div>
);

// Top row summary cards
const TopStatCard: React.FC<{
    icon: React.ReactNode;
    value: string;
    title: string;
}> = ({ icon, value, title }) => {
    const isCurrency = value.includes('TZS');
    const parts = isCurrency ? value.split(' ') : null;

    return (
        <Card className="flex flex-col h-full">
            <div className="flex justify-between items-center">
                <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                    {icon}
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={20} />
                </button>
            </div>
            <div className="mt-auto pt-4">
                <div className="min-h-[2.5rem]">
                    {isCurrency && parts ? (
                        <div className="flex items-baseline">
                            <span className="text-xl font-bold text-gray-800 mr-1">{parts[0]}</span>
                            <span className="text-2xl font-bold text-gray-800">{parts[1]}</span>
                        </div>
                    ) : (
                        <p className="text-3xl font-bold text-gray-800">{value}</p>
                    )}
                </div>
                <p className="text-sm text-gray-500 mt-1">{title}</p>
            </div>
        </Card>
    );
};

// New Clients / Invoices Overdue cards
const MetricCard: React.FC<{
    title: string;
    value: string;
    percentage: number;
    className?: string;
}> = ({ title, value, percentage, className }) => {
    const isPositive = percentage >= 0;
    return (
        <Card className={`flex flex-col justify-center ${className}`}>
            <p className="text-sm text-gray-500">{title}</p>
            <div className="flex justify-between items-center mt-2">
                <p className="text-4xl font-bold text-gray-800">{value}</p>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                    <span>{Math.abs(percentage)}%</span>
                </div>
            </div>
        </Card>
    );
};

// Revenue Chart
const RevenueChartCard: React.FC<{ graphData: any[] }> = ({ graphData }) => {
    const data = useMemo(() => {
        return graphData.map(item => ({
            name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            lastWeek: item.previousWeekAmount,
            thisWeek: item.currentWeekAmount
        }));
    }, [graphData]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const lastWeekPayload = payload.find((p: any) => p.dataKey === 'lastWeek');
            const thisWeekPayload = payload.find((p: any) => p.dataKey === 'thisWeek');

            return (
                <div className="bg-gray-800 text-white p-3 rounded-lg shadow-lg">
                    <p className="text-xs font-bold mb-2">{label}</p>
                    <div className="space-y-1">
                        {thisWeekPayload && (
                             <p className="text-sm flex items-center">
                                <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: '#7DD3FC' }}></span>
                                <span>This Week: TZS {thisWeekPayload.value.toLocaleString()}</span>
                            </p>
                        )}
                        {lastWeekPayload && (
                            <p className="text-sm flex items-center">
                                <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: '#1F2937' }}></span>
                                <span>Last Week: TZS {lastWeekPayload.value.toLocaleString()}</span>
                            </p>
                        )}
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-800">Revenue</h3>
                <p className="text-sm text-gray-500">Last 7 days VS prior week</p>
            </div>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value / 1000}K`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line 
                            type="monotone" 
                            dataKey="thisWeek" 
                            stroke="#7DD3FC" 
                            strokeWidth={2} 
                            dot={false}
                            activeDot={{ stroke: '#7DD3FC', strokeWidth: 2, fill: 'white', r: 6 }} 
                            name="This Week" 
                        />
                         <Line 
                            type="monotone" 
                            dataKey="lastWeek" 
                            stroke="#1F2937" 
                            strokeWidth={2} 
                            dot={false}
                            activeDot={{ stroke: '#1F2937', strokeWidth: 2, fill: 'white', r: 6 }} 
                            name="Last Week" 
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

// Recent Requests Section
const RecentRequestsCard: React.FC<{ notifications: RecentNotification[] }> = ({ notifications }) => {
    const formatTimestamp = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const yesterday = new Date();
        yesterday.setDate(now.getDate() - 1);

        const isToday = date.toDateString() === now.toDateString();
        const isYesterday = date.toDateString() === yesterday.toDateString();

        const timeString = date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', hour12: true });

        if (isToday) return timeString;
        if (isYesterday) return `Yesterday at ${timeString}`;
        
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ` at ${timeString}`;
    };

    const formatCategory = (category: string) => {
        if (!category) return 'Account';
        return category.charAt(0).toUpperCase() + category.slice(1).toLowerCase() + ' Account';
    };

    return (
        <Card>
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-[#1e293b]">Recent Requests</h3>
                <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical size={20} />
                </button>
            </div>
            <div className="space-y-6">
                {notifications.length > 0 ? (
                    notifications.map((n, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mr-4 flex-shrink-0 overflow-hidden">
                                    {n.profilePictureUrl ? (
                                        <img 
                                            src={`${API_BASE_URL}${n.profilePictureUrl}`} 
                                            alt={n.fullName} 
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/150?u=shadow';
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-slate-300 flex items-center justify-center text-slate-500">
                                            <User size={24} />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-[#1e293b] text-base truncate">{n.fullName}</p>
                                    <p className="text-sm text-slate-500 mt-0.5">{formatCategory(n.userCategory)}</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-400 whitespace-nowrap ml-4">{formatTimestamp(n.createdAt)}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-center py-6 text-gray-500 text-sm italic">No recent requests</p>
                )}
            </div>
        </Card>
    );
};


const FormationStatusCard: React.FC<{ progress: number; estimatedDays: number }> = ({ progress, estimatedDays }) => (
    <div className="bg-gray-800 text-white p-6 rounded-2xl shadow-lg">
        <h3 className="font-bold text-lg">Onboarding Approval</h3>
        <p className="text-sm text-gray-400 mt-1">In progress</p>
        
        <div className="w-full bg-gray-600 rounded-full h-2.5 my-4">
            <div className="bg-white h-2.5 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
        </div>

        <div className="text-center text-sm text-gray-300">
            <p>Estimated processing</p>
            <p className="font-semibold">{estimatedDays} business days</p>
        </div>

        <button className="w-full mt-5 bg-white text-gray-800 font-bold py-2.5 px-4 rounded-lg hover:bg-gray-100 transition-colors">
            View Approvals
        </button>
    </div>
);

const ToDoList: React.FC<{ todos: TodoItem[] }> = ({ todos }) => {
    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        const datePart = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const timePart = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
        return `${datePart} at ${timePart}`;
    };

    const getIcon = (index: number, reason: string) => {
        const lower = reason.toLowerCase();
        if (lower.includes('payroll')) return <ClipboardCheck size={22} strokeWidth={2.2} />;
        if (lower.includes('time off') || lower.includes('request')) return <Clock size={22} strokeWidth={2.2} />;
        if (lower.includes('onboarding') || lower.includes('subscriber')) return <UserCheck size={22} strokeWidth={2.2} />;
        if (lower.includes('resolution') || lower.includes('sign')) return <FileIcon size={22} strokeWidth={2.2} />;
        
        const icons = [
            <ClipboardCheck size={22} strokeWidth={2.2} />,
            <Clock size={22} strokeWidth={2.2} />,
            <FileIcon size={22} strokeWidth={2.2} />,
            <UserCheck size={22} strokeWidth={2.2} />
        ];
        return icons[index % icons.length];
    };

    return (
        <div>
            <h3 className="font-bold text-lg text-gray-800 mb-4">Your to-Do list</h3>
            <div className="space-y-4">
                {todos.length > 0 ? (
                    todos.map((item, index) => (
                        <div key={item.id} className="flex items-center space-x-3">
                            <div className="w-10 h-10 flex items-center justify-center bg-gray-800 text-white rounded-md flex-shrink-0">
                                {getIcon(index, item.requestReason)}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800 text-sm">{item.requestReason}</p>
                                <p className="text-xs text-gray-500">{formatDate(item.assignedAt)}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-sm text-gray-400 italic">No pending tasks</p>
                )}
            </div>
        </div>
    );
};

// Refined LatestAlertCard to match previous design exactly as requested
const LatestAlertCard: React.FC<{ notification: Notification | null }> = ({ notification }) => {
    if (!notification) return null;

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr);
        const datePart = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const timePart = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toUpperCase();
        return `${datePart} at ${timePart}`;
    };

    return (
        <div className="mt-6 bg-gray-800 text-white p-4 rounded-2xl shadow-lg transition-transform hover:scale-[1.02] cursor-pointer">
            <div className="flex items-start">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 mr-3 mt-1 flex-shrink-0"></span>
                <div>
                    <p className="font-bold text-sm">{notification.title}</p>
                    <p className="text-xs text-gray-300 mt-1">{formatDate(notification.createdAt)}</p>
                    <p className="text-xs text-gray-300 mt-2 leading-relaxed">
                        {notification.message}
                    </p>
                </div>
            </div>
        </div>
    );
};


const AdminDashboard: React.FC = () => {
    const [data, setData] = useState<AdminDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboard = async () => {
        try {
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/dashboard/admin`);
            const result = await response.json();
            if (result) {
                setData(result);
            }
        } catch (error) {
            console.error("Failed to fetch admin dashboard:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 space-y-5">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-primary/20 animate-pulse"></div>
                    <div className="absolute inset-0 w-16 h-16 rounded-full border-t-4 border-primary animate-spin"></div>
                </div>
                <p className="text-gray-500 font-bold tracking-tight">Synchronizing platform data...</p>
            </div>
        );
    }

    if (!data) return (
        <div className="p-8 text-center bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-red-500 font-bold">Failed to load dashboard data. Please try again later.</p>
            <button onClick={fetchDashboard} className="mt-4 text-primary font-bold hover:underline">Retry Connection</button>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Left Column (Main Stats & Feed) */}
            <div className="lg:col-span-3 space-y-8">
                {/* Summary Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                    <TopStatCard icon={<Wallet size={20} />} value={`TZS ${data.totalCollection.toLocaleString()}`} title="Total collection" />
                    <TopStatCard icon={<PiggyBank size={20} />} value={String(data.saverAccounts)} title="Number of saver accounts" />
                    <TopStatCard icon={<Briefcase size={20} />} value={String(data.borrowerAccounts)} title="Number of Borrower accounts" />
                    <TopStatCard icon={<CreditCard size={20} />} value={`TZS ${data.thisWeekCollection.toLocaleString()}`} title="This week's collection" />
                </div>

                {/* Secondary Stats & Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 flex flex-col gap-6">
                        <MetricCard title="New clients" value={String(data.newClients)} percentage={0} className="flex-1" />
                        <MetricCard title="Number of Investors" value={String(data.investorAccounts)} percentage={0} className="flex-1" />
                    </div>
                    <div className="lg:col-span-2">
                        <RevenueChartCard graphData={data.revenueGraphData} />
                    </div>
                </div>
                
                {/* Recent Notifications Section */}
                <RecentRequestsCard notifications={data.recentNotifications} />
            </div>

            {/* Right Column (Status & Todo) */}
            <div className="lg:col-span-1 space-y-8">
                <FormationStatusCard progress={data.approvalProgress} estimatedDays={data.estimatedDays} />
                
                {/* Combined To-Do and Alert Section per user's design */}
                <div className="space-y-2">
                    <ToDoList todos={data.todoList} />
                    <LatestAlertCard notification={data.latestUnreadNotification} />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
