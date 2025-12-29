import React, { useState } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { Calendar, ChevronDown, Filter } from 'lucide-react';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-dark-card rounded-2xl p-6 border border-dark-border ${className}`}>
        {children}
    </div>
);

const TrendChart = () => {
    const data = [
        { name: '29 Oct 2024', high: 12500, low: 7500 },
        { name: '30 Oct 2024', high: 15000, low: 9000 },
        { name: '31 Oct 2024', high: 19000, low: 11000, value: 5674 },
        { name: '1 Nov 2024', high: 14000, low: 8500 },
        { name: '2 Nov 2024', high: 12000, low: 9500 },
        { name: '3 Nov 2024', high: 13000, low: 7000 },
        { name: '4 Nov 2024', high: 16000, low: 10000 },
        { name: '5 Nov 2024', high: 14500, low: 9000 },
        { name: '6 Nov 2024', high: 11000, low: 6500 },
    ];

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-gray-800 text-white p-2 rounded-md shadow-lg text-sm">
                    <p className="font-bold">{label}</p>
                    <p style={{ color: '#8A6DFF' }}>High: {payload[0].value.toLocaleString()}</p>
                    <p style={{ color: '#D4FF41' }}>Low: {payload[1].value.toLocaleString()}</p>
                </div>
            );
        }
        return null;
    };
    
    const CustomActiveDot = (props: any) => {
        const { cx, cy, payload } = props;
        if (payload.value) {
            return (
                <g>
                    <circle cx={cx} cy={cy} r={6} fill="#D4FF41" stroke="white" strokeWidth={2} />
                    <foreignObject x={cx - 35} y={cy - 50} width="70" height="40">
                        <div className="bg-accent-lime text-black font-bold text-sm text-center py-1 px-2 rounded-md shadow-lg">
                            {payload.value.toLocaleString()}
                        </div>
                    </foreignObject>
                </g>
            );
        }
        return <circle cx={cx} cy={cy} r={5} fill={props.stroke} />;
    };


    return (
        <div className="h-80 relative">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#8A8A93', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(value) => `${value / 1000}K`} tick={{ fill: '#8A8A93', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="high" stroke="#8A6DFF" strokeWidth={2} dot={false} activeDot={{ r: 5 }} />
                    <Line type="monotone" dataKey="low" stroke="#D4FF41" strokeWidth={2} dot={false} activeDot={<CustomActiveDot />} />
                </LineChart>
            </ResponsiveContainer>
             <div className="absolute top-4 right-[28%] bg-dark-card p-4 rounded-xl shadow-2xl border border-dark-border w-40 text-center">
                <span className="text-accent-purple text-2xl font-bold">✨</span>
                <p className="text-dark-text-secondary text-sm">Bonus</p>
                <p className="text-5xl font-bold text-white">5X</p>
            </div>
        </div>
    );
};

const RiskFoundCard = () => {
    const donutData = [{ name: 'High', value: 70 }, { name: 'Low', value: 30 }];
    const donutColors = ['#8A6DFF', '#D4FF41'];

    const barData = [
        { name: '1', value: 22500, total: 25000, color: '#8A6DFF' },
        { name: '2', value: 14000, total: 25000, color: '#8A6DFF' },
        { name: '3', value: 9500,  total: 25000, color: '#D4FF41' },
        { name: '4', value: 17500, total: 25000, color: '#8A6DFF' },
        { name: '5', value: 20000, total: 25000, color: '#8A6DFF' },
        { name: '6', value: 13500, total: 25000, color: '#D4FF41' },
        { name: '7', value: 15000, total: 25000, color: '#8A6DFF' },
        { name: '8', value: 10000, total: 25000, color: '#D4FF41' },
    ];
    
    const CustomBarWithBackground = (props: any) => {
        const { x, y, width, height, payload } = props;
        const valueHeight = (payload.value / 25000) * height;
        const valueY = y + (height - valueHeight);
        const radius = 8;
        const clipId = `clip-${x}-${y}`;

        return (
            <g>
                <defs>
                    <clipPath id={clipId}>
                        <rect x={x} y={y} width={width} height={height} rx={radius} ry={radius} />
                    </clipPath>
                </defs>
                <rect x={x} y={y} width={width} height={height} fill="#2a2a38" rx={radius} ry={radius} />
                { valueHeight > 0 && <rect x={x} y={valueY} width={width} height={valueHeight} fill={payload.color} clipPath={`url(#${clipId})`} /> }
            </g>
        );
    };


    return (
        <Card>
            <div className="flex flex-wrap justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Risk founds and top risk type</h3>
                <div className="flex items-center space-x-2 text-sm">
                    <button className="bg-accent-purple text-white px-3 py-1.5 rounded-lg">Results</button>
                    <button className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg">Assets Scanned</button>
                    <button className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg">Checks Reformed</button>
                </div>
            </div>
            <div className="flex flex-wrap items-center -mx-4">
                <div className="w-full md:w-1/3 p-4">
                    <div className="relative h-48 w-48 mx-auto">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={donutData} dataKey="value" cx="50%" cy="50%" innerRadius="70%" outerRadius="100%" stroke="none">
                                    {donutData.map((entry, index) => <Cell key={`cell-${index}`} fill={donutColors[index % donutColors.length]} />)}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <svg width="60" height="60" viewBox="0 0 24 24" className="text-accent-purple">
                               <defs>
                                    <linearGradient id="lightningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" style={{stopColor: '#A78BFA', stopOpacity: 1}} />
                                    <stop offset="100%" style={{stopColor: '#6D28D9', stopOpacity: 1}} />
                                    </linearGradient>
                                </defs>
                                <path fill="url(#lightningGradient)" d="M7 21q-.825 0-1.412-.587T5 19V9.525q0-.525.225-.987t.6-.788l8-6.5q.425-.35.95-.413t1.025.163q.5.225.813.637T17 3.5v6h2.5q.95 0 1.488.738T21.3 12l-7.2 10.325q-.45.65-1.225.838T11.2 23q-.6-.2-1-.725t-.3-1.1L11 16H7v5Z" />
                            </svg>
                        </div>
                    </div>
                </div>
                 <div className="w-full md:w-1/3 p-4 flex flex-col justify-center">
                    <div className="flex items-center space-x-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-accent-purple"></div><span>High</span>
                        <div className="w-2 h-2 rounded-full bg-accent-lime ml-4"></div><span>Low</span>
                    </div>
                    <div className="my-4">
                        <p className="text-dark-text-secondary text-sm">Total Assets</p>
                        <div className="flex items-baseline justify-between">
                            <span className="text-3xl font-bold">57,985.07</span>
                            <span className="text-xs font-semibold bg-accent-lime/20 text-accent-lime px-2 py-0.5 rounded-full">0.14% &gt;</span>
                        </div>
                    </div>
                    <div className="pt-4 border-t border-dark-border">
                        <p className="text-dark-text-secondary text-sm">Vulnerable Assets</p>
                         <div className="flex items-baseline justify-between">
                            <span className="text-3xl font-bold">28,374.12</span>
                            <span className="text-xs font-semibold bg-accent-purple/20 text-accent-purple px-2 py-0.5 rounded-full">0.91% &gt;</span>
                        </div>
                    </div>
                </div>
                <div className="w-full md:w-1/3 p-4 flex flex-col">
                    <div className="flex justify-end items-center mb-4 text-sm text-dark-text-secondary">
                        <span>29 Oct - 11 Nov</span>
                        <Calendar size={16} className="ml-2" />
                    </div>
                    <div className="flex-grow h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }} barCategoryGap="20%">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" vertical={false} />
                                <XAxis dataKey="name" hide />
                                <YAxis 
                                    domain={[0, 25000]} 
                                    axisLine={false} 
                                    tickLine={false}
                                    ticks={[5000, 10000, 15000, 20000, 25000]}
                                    tick={{ fill: '#8A8A93', fontSize: 12 }}
                                    tickFormatter={(value) => `${value / 1000}K`}
                                />
                                <Bar dataKey="total" shape={<CustomBarWithBackground />} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </Card>
    );
};

const RiskVulnerabilitiesCard = () => {
    const data = [
        { level: 'Low', title: 'Git Director Exposure', source: 'Source code & Cerdentinals', assets: 158, type: 'Vulnerable Assets', trend: 'down' },
        { level: 'High', title: 'SSL Certigicate Exposure', source: 'Source code & Cerdentinals', assets: 214, type: 'Vulnerable Assets', trend: 'up' },
    ];
    return (
        <Card>
            <h3 className="text-xl font-bold mb-4">Risk vulnerabilities</h3>
            <div className="space-y-2">
                {data.map((item, index) => (
                    <div key={index} className="bg-white/5 p-4 rounded-lg grid grid-cols-5 items-center gap-4">
                        <div className="col-span-1">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${item.level === 'High' ? 'bg-accent-purple/20 text-accent-purple' : 'bg-accent-lime/20 text-accent-lime'}`}>{item.level}</span>
                        </div>
                        <p className="col-span-1 font-semibold">{item.title}</p>
                        <p className="col-span-1 text-dark-text-secondary">{item.source}</p>
                        <p className="col-span-1 text-dark-text-secondary">{item.assets} {item.type}</p>
                        <div className="col-span-1 flex justify-end">
                            <ChevronDown size={20} className={`transform ${item.trend === 'up' ? 'rotate-180' : ''}`} />
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const ParticipantsCard = () => (
    <Card>
        <h3 className="text-xl font-bold">Participants</h3>
        <p className="text-dark-text-secondary mt-1">Onboarding: How to transform new singnups into successful users</p>
        <div className="flex items-center mt-4">
            <div className="flex -space-x-3">
                {['user1','user2','user3','user4'].map(u => (
                    <img key={u} src={`https://i.pravatar.cc/150?u=${u}`} alt="participant" className="w-10 h-10 rounded-full border-2 border-dark-card" />
                ))}
                 <div className="w-10 h-10 rounded-full bg-accent-purple flex items-center justify-center text-xs font-semibold border-2 border-dark-card">
                    +25
                </div>
            </div>
        </div>
    </Card>
);

const LastActionsCard = () => {
    const actions = [
        { color: 'text-accent-purple', text: 'Scan for <span class="font-bold text-white">apple.com</span> has been completed', time: '3h Ago' },
        { color: 'text-accent-purple', text: 'Scan for <span class="font-bold text-white">dribbble.com/nikitinteam</span> has been completed', time: '1 Day Ago' },
        { color: 'text-accent-lime', text: 'Scan for <span class="font-bold text-white">nikitinteam.com</span> has been completed', time: '30 Oct 2020' },
        { color: 'text-dark-text-secondary', text: 'Permissions for user <span class="font-bold text-white">Alex</span> updated', time: '30 Oct 2020' },
    ];
    return (
        <Card>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Last actions</h3>
                <button className="text-dark-text-secondary hover:text-white"><Filter size={20} /></button>
            </div>
            <div className="space-y-4">
                {actions.map((action, index) => (
                    <div key={index} className="flex items-start space-x-3">
                        <div className={`mt-1 w-3 h-3 rounded-full border-2 ${action.color.replace('text-', 'border-')} flex-shrink-0`}>
                            <div className={`w-1 h-1 rounded-full m-px ${action.color.replace('text-','bg-')}`}></div>
                        </div>
                        <div>
                            <p className="text-dark-text-secondary" dangerouslySetInnerHTML={{ __html: action.text }}></p>
                            <p className="text-xs text-dark-text-secondary mt-1">{action.time}</p>
                        </div>
                    </div>
                ))}
            </div>
            <button className="w-full mt-6 bg-white/10 text-center py-2.5 rounded-lg hover:bg-white/20 transition-colors">
                Show all actions
            </button>
        </Card>
    );
};

const WavingHand = () => (
    <div className="flex justify-end pr-4">
        <img src="https://static.vecteezy.com/system/resources/previews/010/870/948/original/3d-hand-waving-png.png" alt="Waving hand illustration" className="w-48 h-auto" />
    </div>
);


const InvestorDashboard: React.FC = () => {
    const [activeTrend, setActiveTrend] = useState('High');
    return (
         <div className="bg-dark-bg text-dark-text-primary p-0 -m-8 font-sans">
            <div className="grid grid-cols-1 xl:grid-cols-3 auto-rows-min gap-6">
                
                {/* Top Left Card - Trend */}
                <div className="xl:col-span-2">
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Trend</h3>
                            <div className="flex items-center space-x-1 bg-white/5 p-1 rounded-lg">
                                {['High', 'Medium', 'Low'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setActiveTrend(t)}
                                        className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${activeTrend === t ? 'bg-accent-purple text-white' : 'text-dark-text-secondary hover:text-white'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <TrendChart />
                    </Card>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6 xl:col-span-1 xl:row-span-2">
                    <ParticipantsCard />
                    <LastActionsCard />
                    <WavingHand />
                </div>
                
                {/* Mid Left Card - Risk Found */}
                <div className="xl:col-span-2">
                    <RiskFoundCard />
                </div>

                {/* Bottom Left Card - Risk Vulnerabilities */}
                <div className="xl:col-span-2">
                    <RiskVulnerabilitiesCard />
                </div>

            </div>
        </div>
    );
};

export default InvestorDashboard;