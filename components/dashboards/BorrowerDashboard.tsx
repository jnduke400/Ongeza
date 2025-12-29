import React from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { Hourglass, CheckCircle2, ChevronRight, Eye } from 'lucide-react';

// Mock Data
const avgLoanData = [
    { name: 'Apr', value: 25000 },
    { name: 'May', value: 95000 },
    { name: 'Jun', value: 18000 },
    { name: 'Jul', value: 50000 },
    { name: 'Aug', value: 85000 },
    { name: 'Sep', value: 65000 },
    { name: 'Oct', value: 105000 },
];

const barColors: { [key: string]: string } = {
    'Apr': '#c69521',
    'May': '#f4e399',
    'Jun': '#f3e497',
    'Jul': '#7b4820',
    'Aug': '#f3e296',
    'Sep': '#c69521',
    'Oct': '#f4e399',
};


const recentMessages = [
    { id: 1, name: 'Jonathan Doe', app: '#1019', text: 'Your loan application has been received and is now under review.', time: '1 hour ago', avatar: 'https://i.pravatar.cc/150?u=jonathan' },
    { id: 2, name: 'PesaFlow Support', app: '#1019', text: 'We need one more document to proceed. Please upload your recent bank statement.', time: '3 hours ago', avatar: 'https://placehold.co/100x100/10B981/FFFFFF/png?text=P' },
    { id: 3, name: 'John Doe', app: '#1017', text: 'Congratulations! Your loan for business expansion has been approved.', time: '1 day ago', avatar: 'https://i.pravatar.cc/150?u=john2' },
    { id: 4, name: 'System Notification', app: '#1017', text: 'A payment of TZS 50,000 is due on 2025-09-01 for your loan.', time: '2 days ago', avatar: 'https://placehold.co/100x100/3B82F6/FFFFFF/png?text=S' },
];

const loanApplications = [
    { id: 'loan001', purpose: 'Business Expansion', amount: 500000, date: '2025-08-01', status: 'Pending', dueDate: null },
    { id: 'loan002', purpose: 'Emergency Medical', amount: 250000, date: '2025-07-15', status: 'Approved', dueDate: '2025-08-15' },
    { id: 'loan003', purpose: 'Tuk-tuk Purchase', amount: 1200000, date: '2025-06-20', status: 'Approved', dueDate: '2025-07-20' },
    { id: 'loan004', purpose: 'School Fees', amount: 300000, date: '2025-05-10', status: 'Rejected', dueDate: null },
];


// Custom Tooltip for the bar chart
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="flex flex-col items-center pointer-events-none">
                <div className="bg-gray-900 text-white px-3 py-1.5 rounded-md shadow-lg">
                    <p className="text-sm font-bold">{`${(payload[0].value / 1000).toFixed(0)}k`}</p>
                </div>
                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-gray-900" />
            </div>
        );
    }
    return null;
};

// Components
const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; bgColor: string; }> = ({ title, value, icon, bgColor }) => (
    <div className={`p-5 rounded-lg shadow-sm ${bgColor} text-white flex flex-col justify-between`}>
        <div className="flex justify-between items-center">
            <p className="font-medium">{title}</p>
            <div className="bg-white/20 p-2 rounded-md">
                {icon}
            </div>
        </div>
        <p className="text-5xl font-bold mt-2">{value}</p>
    </div>
);

const BorrowerDashboard: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

            {/* Main Grid for Stats, Chart, and Messages */}
            <div className="grid grid-cols-1 lg:grid-cols-3 auto-rows-min gap-6">
                
                {/* Pending Applications */}
                <div className="lg:col-span-1">
                    <StatCard 
                        title="Pending Applications" 
                        value="17" 
                        icon={<Hourglass size={20} className="text-white" />} 
                        bgColor="bg-[#ffa063]" 
                    />
                </div>

                {/* Approved Loans */}
                <div className="lg:col-span-1">
                    <StatCard 
                        title="Approved Loans" 
                        value="4" 
                        icon={<CheckCircle2 size={20} className="text-white" />} 
                        bgColor="bg-accent-green" 
                    />
                </div>

                {/* Recent Messages - spans two rows */}
                <div className="lg:col-span-1 lg:row-span-2">
                    <div className="bg-surface p-6 rounded-lg shadow-sm h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4 flex-shrink-0">
                            <h2 className="text-xl font-bold text-gray-800">Recent Messages</h2>
                            <button className="text-gray-400 hover:text-gray-600">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                        <div className="divide-y divide-gray-200 overflow-y-auto pr-2 flex-grow -mx-6">
                            {recentMessages.slice(0, 4).map(msg => (
                                <div key={msg.id} className="px-6 py-4">
                                    <div className="flex items-start space-x-3">
                                        <img src={msg.avatar} alt={msg.name} className="w-10 h-10 rounded-full flex-shrink-0" />
                                        <div className="flex-grow min-w-0">
                                            <div className="flex justify-between items-baseline">
                                                <p className="font-semibold text-sm text-gray-800 truncate">{msg.name}</p>
                                                <p className="text-xs text-gray-400 flex-shrink-0 ml-2">{msg.time}</p>
                                            </div>
                                            <p className="text-xs text-gray-500">Application {msg.app}</p>
                                        </div>
                                    </div>
                                    <p className="text-base text-gray-700 mt-2">
                                        {msg.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Total Amount & Chart Card */}
                <div className="lg:col-span-2">
                    <div className="bg-surface p-6 rounded-lg shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold text-gray-800">Avg Loan Amount</h2>
                            <p className="text-4xl font-extrabold text-gray-800">$56,250</p>
                        </div>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={avgLoanData} margin={{ top: 30, right: 10, left: -25, bottom: 5 }}>
                                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                                    <YAxis 
                                        tickFormatter={(value) => `$${value/1000}K`} 
                                        tick={{ fontSize: 12, fill: '#6B7280' }} 
                                        axisLine={false} 
                                        tickLine={false}
                                        domain={[0, 110000]}
                                        ticks={[0, 20000, 50000, 70000, 100000]}
                                    />
                                    <Tooltip
                                        content={<CustomTooltip />}
                                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                        offset={20}
                                        position={{ y: 20 }}
                                    />
                                    <Bar dataKey="value">
                                        {avgLoanData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={barColors[entry.name] || '#FBBF24'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Loan Applications Table */}
            <div className="bg-surface p-6 rounded-lg shadow-sm">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Loan Applications</h2>
                        <p className="text-sm text-gray-500">Manage Your Loan Applications Effortlessly</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                        <ChevronRight size={20} />
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                         <thead>
                            <tr className="border-b-2 border-gray-200 text-sm text-gray-600">
                                <th className="py-3 px-4 font-semibold">Purpose</th>
                                <th className="py-3 px-4 font-semibold">Amount</th>
                                <th className="py-3 px-4 font-semibold">Date Applied</th>
                                <th className="py-3 px-4 font-semibold">Due Date</th>
                                <th className="py-3 px-4 font-semibold">Status</th>
                                <th className="py-3 px-4 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loanApplications.map(app => (
                                <tr key={app.id} className="border-b border-gray-100 last:border-b-0 text-sm">
                                    <td className="py-3 px-4 font-medium text-gray-800">{app.purpose}</td>
                                    <td className="py-3 px-4 text-gray-600">TZS {app.amount.toLocaleString()}</td>
                                    <td className="py-3 px-4 text-gray-600">{app.date}</td>
                                    <td className="py-3 px-4 text-gray-600">
                                        {app.status === 'Approved' && app.dueDate ? app.dueDate : 'N/A'}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            app.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                            app.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>{app.status}</span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <button className="text-gray-400 hover:text-primary p-1 transition-colors" aria-label="View application">
                                            <Eye size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BorrowerDashboard;