import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hourglass, CheckCircle2, ArrowRight, Phone, Mail, Eye, ChevronRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

// StatCard component
const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; bgColor: string; }> = ({ title, value, icon, bgColor }) => (
    <div className={`p-5 rounded-lg shadow-sm ${bgColor} text-white`}>
        <div className="flex justify-between items-center">
            <p className="font-medium">{title}</p>
            <div className="bg-white/20 p-2 rounded-md">
                {icon}
            </div>
        </div>
        <p className="text-5xl font-bold mt-4">{value}</p>
    </div>
);

// ApplyForFundingCard component
const ApplyForFundingCard: React.FC = () => {
    const navigate = useNavigate();
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center">
            <div>
                <h3 className="text-xl font-bold text-gray-800">Apply For Funding Today !</h3>
                <p className="text-sm text-gray-500 mt-1">No Obligations, Credit Check, Or Hidden Costs!</p>
            </div>
            <button onClick={() => navigate('/loan-types')} className="bg-gray-800 text-white font-semibold py-2 px-4 rounded-lg flex items-center space-x-2 hover:bg-gray-900 transition-colors">
                <span>Next</span>
                <ArrowRight size={16} />
            </button>
        </div>
    );
};

// LoanScoreCard component
const LoanScoreCard: React.FC = () => {
    const navigate = useNavigate();
    const score = 78; // Mock data
    const totalTransactions = 287; // Mock data

    const getScoreLabel = (s: number) => {
        if (s > 90) return 'Excellent';
        if (s > 75) return 'Awesome';
        if (s > 50) return 'Good';
        if (s > 25) return 'Fair';
        return 'Needs Improvement';
    };
    
    const scoreLabel = getScoreLabel(score);

    const handleButtonClick = () => {
        if (score < 100) {
            navigate('/my-wallet'); // Placeholder for payment page
        } else {
            navigate('/dashboard'); // Or somewhere else if 100%
        }
    };
    
    // Create data for segmented pie chart to mimic the radial gauge
    const totalSegments = 40;
    const filledSegments = Math.round((score / 100) * totalSegments);
    const chartData = Array.from({ length: totalSegments }, (_, i) => ({
        name: `segment-${i}`,
        value: 1,
        fill: i < filledSegments ? '#826bf4' : '#e5e7eb',
    }));

    const startAngle = 225;
    const endAngle = -45;

    return (
        <div className="bg-surface text-on-surface p-6 rounded-lg shadow-sm h-full flex flex-col justify-between items-center text-center">
            <div>
                <p className="text-gray-500">Your score is</p>
                <p className="text-3xl font-bold">{scoreLabel}</p>
            </div>

            <div className="relative w-48 h-48 my-4">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            dataKey="value"
                            cx="50%"
                            cy="50%"
                            innerRadius="70%"
                            outerRadius="100%"
                            startAngle={startAngle}
                            endAngle={endAngle}
                            paddingAngle={2}
                            stroke="none"
                        >
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-5xl font-bold">{score}</p>
                    <p className="text-sm text-gray-500">Out of 100</p>
                </div>
            </div>

            <div>
                 <p className="text-gray-500">Your score is based on the last</p>
                 <p className="text-xl font-bold">{totalTransactions} Transactions</p>
            </div>
            
             <button
                onClick={handleButtonClick}
                className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg"
            >
                {score < 100 ? 'Make a Payment' : 'View My Account'}
            </button>
        </div>
    );
};

// UnderwriterCard component
const UnderwriterCard: React.FC = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
        <img src="https://i.pravatar.cc/150?u=underwriter" alt="Jonathan Doe" className="w-24 h-24 rounded-full object-cover" />
        <div className="flex-grow text-center md:text-left">
            <h3 className="text-2xl font-bold text-gray-800">Jonathan Doe</h3>
            <p className="text-sm text-gray-500">Underwriter</p>
            <div className="mt-3 space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center md:justify-start space-x-2">
                    <Phone size={16} />
                    <span>012 345 6789</span>
                </div>
                <div className="flex items-center justify-center md:justify-start space-x-2">
                    <Mail size={16} />
                    <span>underwriter@example.com</span>
                </div>
            </div>
        </div>
        <button className="bg-[#ca8a04] text-white font-semibold py-2 px-6 rounded-lg hover:bg-yellow-700 transition-colors mt-4 md:mt-0">
            Contact
        </button>
    </div>
);

// AppliedLoansTable component
const AppliedLoansTable: React.FC = () => {
    const appliedLoans = [
        { id: 'NLCID25001', company: 'ZXC LLC', type: 'Fix & Flip', underwriter: 'Jamie Kentle', affiliate: 'Prestige Glo...', amount: 'N/A', status: 'Approved' },
        { id: 'NLCID25002', company: 'ZXC LLC', type: 'Fix & Flip', underwriter: 'Jamie Kentle', affiliate: 'Prestige Glo...', amount: '$20,000.00', status: 'Approved' },
    ];
    return (
        <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">Applied Loans</h2>
                    <p className="text-sm text-gray-500">Manage Your Loan Applications Effortlessly</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                    <ChevronRight size={20} />
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 text-sm text-gray-600">
                            <th className="py-3 px-4 font-semibold rounded-l-lg">Loan Id</th>
                            <th className="py-3 px-4 font-semibold">Company Name</th>
                            <th className="py-3 px-4 font-semibold">Type</th>
                            <th className="py-3 px-4 font-semibold">Underwriter</th>
                            <th className="py-3 px-4 font-semibold">Affiliate</th>
                            <th className="py-3 px-4 font-semibold">Amount</th>
                            <th className="py-3 px-4 font-semibold">Status</th>
                            <th className="py-3 px-4 font-semibold text-center rounded-r-lg">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appliedLoans.map(loan => (
                            <tr key={loan.id} className="border-b border-gray-100 last:border-b-0 text-sm">
                                <td className="py-3 px-4 font-medium text-gray-800">{loan.id}</td>
                                <td className="py-3 px-4 text-gray-600">{loan.company}</td>
                                <td className="py-3 px-4 text-gray-600">{loan.type}</td>
                                <td className="py-3 px-4 text-gray-600">{loan.underwriter}</td>
                                <td className="py-3 px-4 text-gray-600">{loan.affiliate}</td>
                                <td className="py-3 px-4 text-gray-600">{loan.amount}</td>
                                <td className="py-3 px-4">
                                    <span className="text-green-600 font-semibold">{loan.status}</span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                    <button className="text-gray-400 hover:text-primary p-1 transition-colors">
                                        <Eye size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const ApplyPage: React.FC = () => {
    return (
        <div className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left side */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <StatCard title="Current Loans Pending" value="9" icon={<Hourglass size={20} className="text-white"/>} bgColor="bg-[#ffa063]" />
                        <StatCard title="Total Closed Loans" value="3" icon={<CheckCircle2 size={20} className="text-white"/>} bgColor="bg-accent-green" />
                    </div>
                    <ApplyForFundingCard />
                    <UnderwriterCard />
                </div>
                {/* Right side */}
                <div className="lg:col-span-1 h-full">
                    <LoanScoreCard />
                </div>
            </div>
            <AppliedLoansTable />
        </div>
    );
};

export default ApplyPage;