import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLoanTransactionById, mockLoanOverviewData } from '../services/mockData';
import { LoanTransactionReportItem, LoanOverview } from '../types';
import { ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
// FIX: Import ChevronLeft from lucide-react.
import { Download, Phone, MapPin, Mail, Globe, DollarSign, MoreHorizontal, Settings, Droplet, ChevronDown, ChevronLeft } from 'lucide-react';

// Reusable Card component for light theme
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-surface rounded-2xl shadow-sm p-6 ${className}`}>
    {children}
  </div>
);

// InfoCard for contact details, for light theme
const InfoCard: React.FC<{ icon: React.ReactNode; title: string; value: string; }> = ({ icon, title, value }) => (
    <Card className="flex items-start space-x-4">
        <div className="bg-primary-light/50 text-primary-dark p-3 rounded-xl">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="font-bold text-lg text-gray-800 break-all">{value}</p>
        </div>
    </Card>
);

const PieChartCard = () => {
    // Mock data for repayment breakdown of a specific loan.
    // This represents the total paid amount broken down by category.
    const data = [
        { name: 'Loan Payment', value: 50000, color: '#3B82F6' }, // accent-blue
        { name: 'Interest Payment', value: 3500, color: '#FBBF24' }, // accent-yellow
        { name: 'Late fee', value: 1500, color: '#F43F5E' }, // accent-red
    ];
    const total = data.reduce((acc, entry) => acc + entry.value, 0);

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-800">Repayment Breakdown</h3>
                <button className="text-gray-400 hover:text-gray-600">
                    <MoreHorizontal size={20} />
                </button>
            </div>
            <div className="w-full h-48 mb-4">
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius="60%"
                            outerRadius="100%"
                            fill="#8884d8"
                            stroke="none"
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `TZS ${value.toLocaleString()}`} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="space-y-2 text-sm">
                {data.map(entry => (
                    <div key={entry.name} className="flex justify-between items-center">
                        <div className="flex items-center">
                            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
                            <span className="text-gray-600">{entry.name}</span>
                        </div>
                        <span className="font-semibold text-gray-800">TZS {entry.value.toLocaleString()}</span>
                    </div>
                ))}
                 <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                    <span className="font-bold text-gray-800">Total Paid</span>
                    <span className="font-bold text-gray-800">TZS {total.toLocaleString()}</span>
                </div>
            </div>
        </Card>
    );
};

const Toggle: React.FC<{ label: string; checked: boolean; onChange: () => void; }> = ({ label, checked, onChange }) => (
    <div className="flex items-center space-x-2">
        <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" className="sr-only peer" checked={checked} onChange={onChange} />
            <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gray-400"></div>
        </label>
        <span className="text-sm font-medium text-gray-700">{label}</span>
    </div>
);

const CustomActivityTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-2 px-3 rounded-lg shadow-lg border border-gray-100">
                <p className="text-sm font-semibold text-gray-700">{label}</p>
                {payload.map((pld: any) => (
                    <p key={pld.dataKey} className="text-sm" style={{ color: pld.stroke }}>
                        {pld.name}: {pld.value}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};


const ChartActivityCard = () => {
    const [visibleLines, setVisibleLines] = React.useState({
        standingLoan: false,
        loanRepayment: true,
        others: false,
    });

    const handleToggle = (line: keyof typeof visibleLines) => {
        setVisibleLines(prev => ({ ...prev, [line]: !prev[line] }));
    };

    const data = [
        { name: 'Week 01', 'Loan Repayment': 38, 'Standing Loan': 58 },
        { name: 'Week 02', 'Loan Repayment': 25, 'Standing Loan': 38 },
        { name: 'Week 03', 'Loan Repayment': 42, 'Standing Loan': 55 },
        { name: 'Week 04', 'Loan Repayment': 45, 'Standing Loan': 32 },
        { name: 'Week 05', 'Loan Repayment': 25, 'Standing Loan': 58 },
        { name: 'Week 06', 'Loan Repayment': 50, 'Standing Loan': 22 },
        { name: 'Week 07', 'Loan Repayment': 30, 'Standing Loan': 48 },
        { name: 'Week 08', 'Loan Repayment': 50, 'Standing Loan': 35 },
        { name: 'Week 09', 'Loan Repayment': 38, 'Standing Loan': 48 },
        { name: 'Week 10', 'Loan Repayment': 70, 'Standing Loan': 42 },
        { name: 'Week 11', 'Loan Repayment': 35, 'Standing Loan': 55 },
        { name: 'Week 12', 'Loan Repayment': 25, 'Standing Loan': 30 },
        { name: 'Week 13', 'Loan Repayment': 15, 'Standing Loan': 20 },
        { name: 'Week 14', 'Loan Repayment': 22, 'Standing Loan': 15 },
    ];

    return (
        <Card>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <h3 className="font-bold text-lg text-gray-800">Chart Activity</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <Toggle label="Standing Loan" checked={visibleLines.standingLoan} onChange={() => handleToggle('standingLoan')} />
                    <Toggle label="Loan Repayment" checked={visibleLines.loanRepayment} onChange={() => handleToggle('loanRepayment')} />
                    <Toggle label="Others" checked={visibleLines.others} onChange={() => handleToggle('others')} />
                    <div className="relative">
                        <button className="flex items-center space-x-2 text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200">
                            <span>This Month</span>
                            <ChevronDown size={16} />
                        </button>
                    </div>
                </div>
                <div className="flex items-center space-x-1">
                     <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                        <Settings size={20} />
                    </button>
                     <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700">
                        <Droplet size={20} />
                    </button>
                </div>
            </div>
            <div className="w-full h-64">
                <ResponsiveContainer>
                    <AreaChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <defs>
                            <linearGradient id="colorStandingLoan" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorLoanRepayment" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomActivityTooltip />} />
                        {visibleLines.standingLoan && <Area type="monotone" name="Standing Loan" dataKey="Standing Loan" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorStandingLoan)" />}
                        {visibleLines.loanRepayment && <Area type="monotone" name="Loan Repayment" dataKey="Loan Repayment" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorLoanRepayment)" />}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
             <div className="flex justify-center space-x-6 text-sm mt-4">
                <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#3B82F6' }}></span>
                    <span className="text-gray-600">Loan Repayment</span>
                </div>
                 <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#10B981' }}></span>
                    <span className="text-gray-600">Standing Loan</span>
                </div>
            </div>
        </Card>
    );
};


const LoanTransactionDetailPage: React.FC = () => {
    const { transactionId } = useParams<{ transactionId: string }>();
    const [transaction, setTransaction] = useState<LoanTransactionReportItem | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        if (transactionId) {
            const tx = getLoanTransactionById(parseInt(transactionId, 10));
            setTransaction(tx || null);
        }
    }, [transactionId]);
    
    const loanCounts = useMemo(() => {
        const counts: Record<LoanOverview['status'], number> = {
            Approved: 0,
            Pending: 0,
            Overdue: 0,
            Completed: 0,
        };
        mockLoanOverviewData.forEach(loan => {
            counts[loan.status]++;
        });
        return counts;
    }, []);

    const loanForChart = mockLoanOverviewData[0]; // Using a sample loan for progress visualization
    const loanProgress = useMemo(() => {
        if (!loanForChart || loanForChart.amount === 0) return 0;
        const progress = ((loanForChart.amount - loanForChart.outstandingBalance) / loanForChart.amount) * 100;
        return Math.round(progress);
    }, [loanForChart]);

    const pieData = [
        { name: 'Paid Principal', value: loanProgress * 0.8, color: '#f97316' }, // Orange
        { name: 'Paid Interest/Fees', value: loanProgress * 0.2, color: '#ef4444' }, // Red
        { name: 'Remaining', value: 100 - loanProgress, color: '#e5e7eb' }, // Gray
    ];

    if (!transaction) {
        return (
            <div className="p-8 text-center">
                <p>Loading transaction details...</p>
                 <Link to="/reports/transactions" className="mt-4 inline-block text-primary hover:underline">
                    Back to Transactions
                </Link>
            </div>
        );
    }
    
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    return (
        <div className="max-w-screen-2xl mx-auto space-y-6">
            <Link to="/reports/transactions" className="inline-flex items-center text-primary font-semibold hover:underline mb-2">
                <ChevronLeft size={20} className="mr-1"/>
                Back to Transactions
            </Link>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* Left Column */}
                <div className="xl:col-span-1 flex flex-col space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500">Loan Payment</p>
                            <h1 className="text-3xl font-bold text-gray-800 break-all">{`#${transaction.transactionId}`}</h1>
                        </div>
                        <button className="flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-5 rounded-lg transition-colors shadow-sm">
                            <Download size={20} />
                            <span>Download PDF</span>
                        </button>
                    </div>
                    
                    <Card>
                        <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-4">
                                <img src={user?.avatar} alt={user ? `${user.firstName} ${user.lastName}` : 'User'} className="w-16 h-16 rounded-lg object-cover" />
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">{user ? `${user.firstName} ${user.lastName}` : 'User'}</h2>
                                    <p className="text-sm text-gray-500">@{user?.email ? user.email.split('@')[0] : 'username'}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Amount</p>
                                <div className="flex items-center gap-3 mt-1">
                                   <p className="text-2xl font-bold text-gray-800">TZS {transaction.amount.toLocaleString()}</p>
                                   <div className="w-10 h-10 bg-accent-yellow/20 text-accent-yellow rounded-full flex items-center justify-center flex-shrink-0">
                                        <DollarSign size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <InfoCard icon={<Phone size={24} />} title="Telephone" value="+255 688 987 654" />
                        <InfoCard icon={<MapPin size={24} />} title="Address" value="Arusha, Tanzania" />
                        <InfoCard icon={<Mail size={24} />} title="Email" value={user?.email || 'email@example.com'} />
                        <InfoCard icon={<Globe size={24} />} title="Website" value="pesaflow.app" />
                    </div>

                    <Card>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 text-sm">
                            <div><p className="text-gray-500">Payment Method</p><p className="font-semibold mt-1 text-gray-800">{transaction.channelName}</p></div>
                            <div><p className="text-gray-500">Transaction Date</p><p className="font-semibold mt-1 text-gray-800">{formatDate(transaction.date)}</p></div>
                            <div><p className="text-gray-500">Loan Type</p><p className="font-semibold mt-1 text-gray-800">{transaction.loanType}</p></div>
                            <div><p className="text-gray-500">Reference</p><p className="font-semibold mt-1 text-gray-800">{transaction.reference}</p></div>
                        </div>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="xl:col-span-1 flex flex-col space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Card className="relative overflow-hidden bg-sky-50 border border-sky-100">
                             <div className="absolute -top-4 -right-4 w-20 h-20 bg-sky-500/10 rounded-full"></div>
                             <div className="absolute top-4 right-12 w-10 h-10 bg-sky-500/10 rounded-full"></div>
                            <p className="font-semibold text-gray-500">Loan Credited</p>
                            <p className="text-3xl font-bold my-4 text-gray-800">
                                {transaction.paymentType === 'Loan acquisition' ? `TZS ${transaction.amount.toLocaleString()}` : 'TZS 0.00'}
                            </p>
                            <div className="flex justify-between text-xs font-medium text-gray-500">
                                <div><p className="mb-1 opacity-70">LOAN TYPE</p><p className="font-semibold text-gray-700">{transaction.loanType}</p></div>
                                <div><p className="mb-1 opacity-70">REFERENCE</p><p className="font-semibold text-gray-700">{transaction.reference}</p></div>
                            </div>
                        </Card>
                        <Card className="relative overflow-hidden bg-emerald-50 border border-emerald-100">
                             <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full"></div>
                             <div className="absolute top-4 right-12 w-10 h-10 bg-primary/10 rounded-full"></div>
                            <p className="font-semibold text-gray-500">Loan Repayment</p>
                            <p className="text-3xl font-bold my-4 text-gray-800">
                                {transaction.paymentType === 'Loan Payment' ? `TZS ${transaction.amount.toLocaleString()}` : 'TZS 0.00'}
                            </p>
                             <div className="flex justify-between text-xs font-medium text-gray-500">
                                <div><p className="mb-1 opacity-70">LOAN TYPE</p><p className="font-semibold text-gray-700">{transaction.loanType}</p></div>
                                <div><p className="mb-1 opacity-70">REFERENCE</p><p className="font-semibold text-gray-700">{transaction.reference}</p></div>
                            </div>
                        </Card>
                    </div>
                    
                    <Card className="flex-grow flex flex-col">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                            <div className="flex-grow">
                                <h3 className="font-bold text-xl text-gray-800">Specifics</h3>
                                <p className="text-gray-500 mt-4 text-sm leading-relaxed">
                                    The pie chart gives an overview of the current loan's repayment progress.
                                </p>
                                <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                                    The bottom breakdown shows the current status of all your loans.
                                </p>
                            </div>

                            <div className="flex-shrink-0 mx-auto md:mx-0 h-40 w-40 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} dataKey="value" innerRadius="70%" outerRadius="100%" startAngle={90} endAngle={-270} stroke="none">
                                            {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-gray-800">{loanProgress}%</div>
                            </div>
                        </div>
                        
                        <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-6 text-sm">
                            <div className="flex items-center space-x-3">
                                <div className="w-1 h-10 bg-accent-green rounded-full"></div>
                                <div>
                                <p className="font-bold text-lg text-gray-800">{loanCounts.Approved || 0}</p>
                                <p className="text-gray-500">Approved Loans</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-1 h-10 bg-accent-orange rounded-full"></div>
                                <div>
                                <p className="font-bold text-lg text-gray-800">{loanCounts.Pending || 0}</p>
                                <p className="text-gray-500">Pending Loans</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-1 h-10 bg-accent-red rounded-full"></div>
                                <div>
                                <p className="font-bold text-lg text-gray-800">{loanCounts.Overdue || 0}</p>
                                <p className="text-gray-500">Overdue Loans</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-1 h-10 bg-accent-blue rounded-full"></div>
                                <div>
                                <p className="font-bold text-lg text-gray-800">{loanCounts.Completed || 0}</p>
                                <p className="text-gray-500">Completed Loans</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <PieChartCard />
                </div>
                <div className="lg:col-span-2">
                    <ChartActivityCard />
                </div>
            </div>
        </div>
    );
};

export default LoanTransactionDetailPage;
