
import React from 'react';
// FIX: Using namespace import for react-router-dom to handle potential module resolution issues.
import { useParams } from 'react-router-dom';
import { ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Download, Phone, MapPin, Mail, Globe, DollarSign, MoreHorizontal, Settings, Droplet, ChevronDown } from 'lucide-react';

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
    const data = [
        { name: 'Pink', value: 45, color: '#EC4899' },
        { name: 'Blue', value: 35, color: '#22D3EE' },
        { name: 'Yellow', value: 20, color: '#FBBF24' },
    ];

    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-800">Pie Chart</h3>
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
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 text-sm">
                <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#EC4899' }}></span>
                    <span className="text-gray-600">Pink</span>
                </div>
                <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#FBBF24' }}></span>
                    <span className="text-gray-600">Yellow</span>
                </div>
                <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#22D3EE' }}></span>
                    <span className="text-gray-600">Blue</span>
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
        spendings: false,
        savings: true,
        others: false,
    });

    const handleToggle = (line: keyof typeof visibleLines) => {
        setVisibleLines(prev => ({ ...prev, [line]: !prev[line] }));
    };

    const data = [
        { name: 'Week 01', Savings: 38, Spendings: 58 },
        { name: 'Week 02', Savings: 25, Spendings: 38 },
        { name: 'Week 03', Savings: 42, Spendings: 55 },
        { name: 'Week 04', Savings: 45, Spendings: 32 },
        { name: 'Week 05', Savings: 25, Spendings: 58 },
        { name: 'Week 06', Savings: 50, Spendings: 22 },
        { name: 'Week 07', Savings: 30, Spendings: 48 },
        { name: 'Week 08', Savings: 50, Spendings: 35 },
        { name: 'Week 09', Savings: 38, Spendings: 48 },
        { name: 'Week 10', Savings: 70, Spendings: 42 },
        { name: 'Week 11', Savings: 35, Spendings: 55 },
        { name: 'Week 12', Savings: 25, Spendings: 30 },
        { name: 'Week 13', Savings: 15, Spendings: 20 },
        { name: 'Week 14', Savings: 22, Spendings: 15 },
    ];

    return (
        <Card>
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
                <h3 className="font-bold text-lg text-gray-800">Chart Activity</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <Toggle label="Spendings" checked={visibleLines.spendings} onChange={() => handleToggle('spendings')} />
                    <Toggle label="Savings" checked={visibleLines.savings} onChange={() => handleToggle('savings')} />
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
                            <linearGradient id="colorSpendings" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomActivityTooltip />} />
                        {visibleLines.spendings && <Area type="monotone" dataKey="Spendings" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorSpendings)" />}
                        {visibleLines.savings && <Area type="monotone" dataKey="Savings" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorSavings)" />}
                    </AreaChart>
                </ResponsiveContainer>
            </div>
             <div className="flex justify-center space-x-6 text-sm mt-4">
                <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#3B82F6' }}></span>
                    <span className="text-gray-600">Savings</span>
                </div>
                 <div className="flex items-center">
                    <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: '#10B981' }}></span>
                    <span className="text-gray-600">Spendings</span>
                </div>
            </div>
        </Card>
    );
};


const ActivityDetailPage: React.FC = () => {
    const { transactionId, contributionId } = useParams();
    const id = transactionId || contributionId;

    return (
        <div className="max-w-screen-2xl mx-auto space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* Left Column */}
                <div className="xl:col-span-1 flex flex-col space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm text-gray-500">ID Payment</p>
                            <h1 className="text-3xl font-bold text-gray-800 break-all">{id ? `#${id}` : 'Details'}</h1>
                        </div>
                        <button className="flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-5 rounded-lg transition-colors shadow-sm">
                            <Download size={20} />
                            <span>Download PDF</span>
                        </button>
                    </div>
                    
                    <Card>
                        <div className="flex justify-between items-start">
                            <div className="flex items-center space-x-4">
                                <img src="https://i.pravatar.cc/150?u=thomasKuhn" alt="Thomas Khun" className="w-16 h-16 rounded-lg object-cover" />
                                <div>
                                    <h2 className="text-xl font-bold text-gray-800">Thomas Khun</h2>
                                    <p className="text-sm text-gray-500">@thomaskhuncoro</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-500">Amount</p>
                                <div className="flex items-center gap-3 mt-1">
                                   <p className="text-2xl font-bold text-gray-800">TZS 776</p>
                                   <div className="w-10 h-10 bg-accent-yellow/20 text-accent-yellow rounded-full flex items-center justify-center flex-shrink-0">
                                        <DollarSign size={20} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <InfoCard icon={<Phone size={24} />} title="Telephone" value="+12 345 5662 66" />
                        <InfoCard icon={<MapPin size={24} />} title="Address" value="774 Ora Brooks London" />
                        <InfoCard icon={<Mail size={24} />} title="Email" value="demo@mail.com" />
                        <InfoCard icon={<Globe size={24} />} title="Website" value="demo@mail.com" />
                    </div>

                    <Card>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-4 text-sm">
                            <div><p className="text-gray-500">Payment Method</p><p className="font-semibold mt-1 text-gray-800">MasterCard 404</p></div>
                            <div><p className="text-gray-500">Invoice Date</p><p className="font-semibold mt-1 text-gray-800">April 29, 2020</p></div>
                            <div><p className="text-gray-500">Due Date</p><p className="font-semibold mt-1 text-gray-800">June 5, 2020</p></div>
                            <div><p className="text-gray-500">Date Paid</p><p className="font-semibold mt-1 text-gray-800">June 4, 2020</p></div>
                        </div>
                    </Card>
                </div>

                {/* Right Column */}
                <div className="xl:col-span-1 flex flex-col space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <Card className="relative overflow-hidden bg-sky-50 border border-sky-100">
                             <div className="absolute -top-4 -right-4 w-20 h-20 bg-sky-500/10 rounded-full"></div>
                             <div className="absolute top-4 right-12 w-10 h-10 bg-sky-500/10 rounded-full"></div>
                            <p className="font-semibold text-gray-500">Main Balance</p>
                            <p className="text-3xl font-bold my-4 text-gray-800">TZS 824,571.93</p>
                            <div className="flex justify-between text-xs font-medium text-gray-500">
                                <div><p className="mb-1 opacity-70">VALID THRU</p><p className="font-semibold text-gray-700">08/21</p></div>
                                <div><p className="mb-1 opacity-70">CARD HOLDER</p><p className="font-semibold text-gray-700">Adam Jackson</p></div>
                            </div>
                        </Card>
                        <Card className="relative overflow-hidden bg-emerald-50 border border-emerald-100">
                             <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full"></div>
                             <div className="absolute top-4 right-12 w-10 h-10 bg-primary/10 rounded-full"></div>
                            <p className="font-semibold text-gray-500">Secondary Balance</p>
                            <p className="text-3xl font-bold my-4 text-gray-800">TZS 523.56</p>
                            <div className="flex justify-between text-xs font-medium text-gray-500">
                                <div><p className="mb-1 opacity-70">VALID THRU</p><p className="font-semibold text-gray-700">08/21</p></div>
                                <div><p className="mb-1 opacity-70">CARD HOLDER</p><p className="font-semibold text-gray-700">Adam Jackson</p></div>
                            </div>
                        </Card>
                    </div>
                    
                    <Card className="flex-grow flex flex-col">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                            <div className="flex-grow">
                                <h3 className="font-bold text-xl text-gray-800">Specifics</h3>
                                <p className="text-gray-500 mt-4 text-sm leading-relaxed">
                                    This section gives you more details on your account
                                </p>
                                <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                                    The pie chart gives you an overview of the impact of this transaction on your goals
                                </p>
                                <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                                    The bottom breakdown shows the count of transactions as per categories.
                                </p>
                            </div>

                            <div className="flex-shrink-0 mx-auto md:mx-0 h-40 w-40 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={[{value: 35}, {value:45}, {value:20}]} dataKey="value" innerRadius="70%" outerRadius="100%" startAngle={90} endAngle={-270} stroke="none">
                                            <Cell fill="#ef4444" />
                                            <Cell fill="#f97316" />
                                            <Cell fill="#e5e7eb" />
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex items-center justify-center text-3xl font-bold text-gray-800">35%</div>
                            </div>
                        </div>
                        
                        <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-6 text-sm">
                            <div className="flex items-center space-x-3">
                                <div className="w-1 h-10 bg-accent-cyan rounded-full"></div>
                                <div>
                                <p className="font-bold text-lg text-gray-800">63,876</p>
                                <p className="text-gray-500">Success Count</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-1 h-10 bg-accent-green rounded-full"></div>
                                <div>
                                <p className="font-bold text-lg text-gray-800">TZS 97,125</p>
                                <p className="text-gray-500">Savings & Interests</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-1 h-10 bg-accent-red rounded-full"></div>
                                <div>
                                <p className="font-bold text-lg text-gray-800">TZS 872,335</p>
                                <p className="text-gray-500">Rewards & Loans</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-1 h-10 bg-accent-orange rounded-full"></div>
                                <div>
                                <p className="font-bold text-lg text-gray-800">21,224</p>
                                <p className="text-gray-500">Pending Count</p>
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

export default ActivityDetailPage;
