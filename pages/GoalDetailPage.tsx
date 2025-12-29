import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { SavingsGoal, DepositAnalysis } from '../types';
import { ArrowLeft, PiggyBank, Percent, Calendar, TrendingUp, MoreVertical, ChevronRight, TrendingDown } from 'lucide-react';
import { RadialBarChart, RadialBar, ResponsiveContainer, PolarAngleAxis, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LabelList } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../services/apiConfig';
import { interceptedFetch } from '../services/api';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 ${className}`}>
        {children}
    </div>
);

const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string | number;
    unit?: string;
    unitPosition?: 'before' | 'after';
    iconBgColor: string;
    valueColor: string;
}> = ({ icon, title, value, unit, unitPosition = 'after', iconBgColor, valueColor }) => (
    <Card className="flex flex-col justify-between min-h-[150px]">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBgColor} shadow-sm`}>
            {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<any>, { size: 24 }) : icon}
        </div>
        <div className="mt-4">
            <p className="text-gray-500 text-sm font-semibold leading-none mb-2">{title}</p>
            <div className="flex items-baseline flex-wrap gap-x-1">
                 {unit && unitPosition === 'before' && <span className={`text-xs font-bold ${valueColor} opacity-70`}>{unit}</span>}
                <span className={`text-2xl font-black ${valueColor} tracking-tight`}>{value}</span>
                {unit && unitPosition === 'after' && <span className={`text-xs font-bold ${valueColor} opacity-70`}>{unit}</span>}
            </div>
        </div>
    </Card>
);

const WeeklyDepositAnalysisCard: React.FC<{ goalId?: string; data: DepositAnalysis[] }> = ({ goalId, data }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
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

  // Colors based on recency: This Week (Purple) -> Older (Orange)
  const COLORS = ['#8b5cf6', '#06b6d4', '#4b5563', '#10b981', '#ef4444', '#f59e0b'];

  // Prepare data: limited to 6 items
  const displayData = data.slice(0, 6);

  // Legend Data: Preserves API order (usually This Week first), assigns colors
  const legendData = displayData.map((item, index) => ({
      ...item,
      color: COLORS[index % COLORS.length]
  }));

  // Chart Data: Reversed so "This Week" (index 0) is at the bottom of the list when rendered vertically
  // Indices are assigned 1 to N, where 1 is the top item (oldest)
  const chartData = [...legendData].reverse().map((item, index) => ({
      ...item,
      chartIndex: index + 1
  }));

  const CustomBarLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    if (!value) return null;
    return (
      <text 
        x={x + 10} 
        y={y + height / 2} 
        fill="white" 
        fontSize={12} 
        fontWeight="600" 
        dominantBaseline="middle"
        style={{ pointerEvents: 'none' }}
      >
        {value}
      </text>
    );
  };
  
  const CustomBarTooltip = ({ active, payload }: any) => {
      if (active && payload && payload.length) {
          const data = payload[0].payload;
          return (
              <div className="bg-white p-2 px-3 rounded-lg shadow-lg border border-gray-100 z-50">
                  <p className="text-sm font-bold text-gray-800">{data.period}</p>
                  <p className="text-sm text-primary font-medium">
                      {`TZS ${data.amount.toLocaleString()}`}
                  </p>
              </div>
          );
      }
      return null;
  };

  return (
    <Card className="text-on-surface h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg text-gray-800">Weekly Deposit Analysis</h3>
        <div className="relative" ref={menuRef}>
          <button onClick={() => setIsMenuOpen(prev => !prev)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">
            <MoreVertical size={20} />
          </button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-20 p-2 border border-gray-100 text-left">
              <ul className="text-sm text-gray-800 font-medium">
                <li>
                  <button
                    onClick={() => { if(goalId) navigate(`/goals/${goalId}/transactions`); setIsMenuOpen(false); }}
                    className="w-full text-left flex items-center px-3 py-2 hover:bg-gray-100 rounded-md"
                  >
                    View Transaction details
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => { if(goalId) navigate(`/goals/${goalId}/summary`); setIsMenuOpen(false); }}
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
      
      <div className="flex flex-col lg:flex-row gap-8 flex-grow">
          {/* Chart Section */}
          <div className="flex-1 min-h-[300px] lg:min-h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={chartData}
                  margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
                  barCategoryGap={10}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                  <XAxis 
                    type="number"
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 11 }}
                    tickFormatter={(value) => `TZS ${value / 1000}k`}
                  />
                  <YAxis
                    type="category"
                    dataKey="chartIndex"
                    axisLine={false} 
                    tickLine={false}
                    width={20}
                    tick={{ fill: '#6B7280', fontSize: 12 }}
                  />
                  <Tooltip cursor={{fill: 'transparent'}} content={<CustomBarTooltip />} />
                  <Bar dataKey="amount" radius={[0, 20, 20, 0]} barSize={32}>
                     <LabelList dataKey="period" content={<CustomBarLabel />} />
                     {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
          </div>

          {/* Legend / Details Section */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 content-center">
              {legendData.map((item) => (
                  <div key={item.period} className="flex flex-col">
                      <div className="flex items-center mb-1">
                          <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                          <span className="text-sm text-gray-500 font-medium">{item.period}</span>
                      </div>
                      <p className="text-xl font-bold text-gray-800 ml-4.5">TZS {item.amount.toLocaleString()}</p>
                  </div>
              ))}
          </div>
      </div>
    </Card>
  );
};

const CircularProgress: React.FC<{ percentage: number; color: string; size?: number; strokeWidth?: number; }> = ({ percentage, color, size = 48, strokeWidth = 5 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg className="transform -rotate-90" width={size} height={size}>
                <circle
                    className="text-gray-200"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
                <circle
                    stroke={color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    fill="transparent"
                    r={radius}
                    cx={size / 2}
                    cy={size / 2}
                />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-800">
                {`${Math.round(percentage)}%`}
            </span>
        </div>
    );
};

const OtherGoalProgressCard: React.FC<{ currentGoalId?: string }> = ({ currentGoalId }) => {
    const [otherGoals, setOtherGoals] = useState<SavingsGoal[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOtherGoals = async () => {
            setLoading(true);
            try {
                const response = await interceptedFetch(`${API_BASE_URL}/api/v1/goals?sortBy=targetDate&sortDirection=asc&page=0&size=20`);
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data?.content) {
                        const allGoals = result.data.content.map((g: any) => ({
                            id: String(g.id),
                            name: g.goalName,
                            targetAmount: g.targetAmount,
                            currentAmount: g.currentAmount || 0,
                            deadline: g.targetDate,
                            icon: g.icon,
                            contributionCount: g.contributionCount || 0, // Assuming API provides this or defaulted
                            progress: g.progress || 0
                        }));
                        // Filter out current goal
                        const filtered = allGoals.filter((g: SavingsGoal) => g.id !== currentGoalId);
                        setOtherGoals(filtered.slice(0, 4)); // Show top 4
                    }
                }
            } catch (err) {
                console.error("Failed to fetch other goals", err);
            } finally {
                setLoading(false);
            }
        };

        if (currentGoalId) {
            fetchOtherGoals();
        }
    }, [currentGoalId]);

    const colors = ['#3B82F6', '#10B981', '#F43F5E', '#22D3EE']; // blue, green, red, cyan

    return (
        <Card className="text-on-surface h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg text-gray-800">Other Goal progress</h3>
                <button className="text-gray-400 hover:text-gray-600"><MoreVertical size={20} /></button>
            </div>
            {loading ? (
                <div className="text-center py-4">Loading...</div>
            ) : otherGoals.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No other goals found.</div>
            ) : (
                <div className="space-y-3 flex-grow">
                    {otherGoals.map((goal, index) => {
                        // Use progress from API or calculate it
                        const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
                        return (
                            <Link to={`/goals/${goal.id}`} key={goal.id} className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex-shrink-0 mr-4">
                                    <CircularProgress percentage={progress} color={colors[index % colors.length]} />
                                </div>
                                <div className="flex-grow">
                                    <p className="font-semibold text-gray-800">{goal.name}</p>
                                    <p className="text-sm text-gray-500">
                                        {goal.contributionCount !== undefined ? `${goal.contributionCount} Contributions` : `Target: TZS ${goal.targetAmount.toLocaleString()}`}
                                    </p>
                                </div>
                                <div className="bg-gray-100 p-2 rounded-md hover:bg-gray-200">
                                    <ChevronRight size={20} className="text-gray-500" />
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </Card>
    );
};

const SavingsProgressCard: React.FC<{ 
    currentWeekAmount: number; 
    lastWeekAmount: number;
    targetAmount: number; 
}> = ({ currentWeekAmount, lastWeekAmount, targetAmount }) => {
    
    // % value in circle chart: (This Week Amount / Goal Target Amount) * 100
    const progressPercent = targetAmount > 0 ? (currentWeekAmount / targetAmount) * 100 : 0;
    const radialData = [{ name: 'progress', value: Math.min(progressPercent, 100) }]; // Cap at 100 for visual sanity
    
    // Trend Calculation: ((ThisWeek - LastWeek) / LastWeek) * 100
    let trendPercent = 0;
    if (lastWeekAmount > 0) {
        trendPercent = ((currentWeekAmount - lastWeekAmount) / lastWeekAmount) * 100;
    } else if (currentWeekAmount > 0) {
        trendPercent = 100; // 0 to something is 100% growth conceptually for this UI
    } else {
        trendPercent = 0;
    }
    
    const isPositive = trendPercent >= 0;

    return (
        <Card className="h-full">
            <h2 className="text-xl font-bold text-gray-800">Savings Progress</h2>
            <p className="text-gray-500 text-sm">Weekly Report</p>
            
            <div className="flex items-center mt-4">
                <div className="w-28 h-28 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadialBarChart 
                            innerRadius="70%" 
                            outerRadius="100%" 
                            data={radialData} 
                            startAngle={90} 
                            endAngle={-270}
                            barSize={10}
                        >
                            <PolarAngleAxis
                                type="number"
                                domain={[0, 100]}
                                angleAxisId={0}
                                tick={false}
                            />
                            <RadialBar 
                                background={{ fill: '#F3F4F6' }}
                                dataKey="value" 
                                cornerRadius="50%" 
                                angleAxisId={0}
                                fill="#10B981"
                            />
                        </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-base font-bold text-gray-700">{progressPercent.toFixed(1)}%</span>
                        <span className="text-[10px] text-gray-500">of Target</span>
                    </div>
                </div>
                <div className="ml-6">
                    <p className="text-xl font-bold text-gray-700">{`TZS ${currentWeekAmount.toLocaleString()}`}</p>
                    <div className={`flex items-center mt-2 px-3 py-1 rounded-full text-sm font-semibold ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {isPositive ? <TrendingUp size={16} className="mr-1"/> : <TrendingDown size={16} className="mr-1" />}
                        <span>{isPositive ? '+' : ''}{trendPercent.toFixed(1)}%</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};


const GoalDetailPage: React.FC = () => {
    const { goalId } = useParams<{ goalId: string }>();
    const { user } = useAuth();
    const [goal, setGoal] = useState<SavingsGoal | null>(null);
    const [depositAnalysis, setDepositAnalysis] = useState<DepositAnalysis[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!goalId) return;

        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                // 1. Fetch Goal Details
                const goalRes = await interceptedFetch(`${API_BASE_URL}/api/v1/goals/${goalId}`);
                const goalData = await goalRes.json();
                if (!goalRes.ok || !goalData.success) throw new Error(goalData.message || 'Failed to fetch goal');
                
                const g = goalData.data;
                const mappedGoal: SavingsGoal = {
                    id: String(g.id),
                    name: g.goalName,
                    targetAmount: g.targetAmount,
                    currentAmount: g.currentAmount,
                    // progress: g.progress, // We can recalculate or use API
                    deadline: g.targetDate,
                    daysRemaining: g.daysRemaining,
                    details: g.description,
                    icon: g.icon
                };
                setGoal(mappedGoal);

                // 2. Fetch Deposit Analysis (Limit 6 for chart)
                const analysisRes = await interceptedFetch(`${API_BASE_URL}/api/v1/goals/${goalId}/deposit-analysis?period=WEEKLY&limit=6`);
                const analysisData = await analysisRes.json();
                if (!analysisRes.ok || !analysisData.success) throw new Error(analysisData.message || 'Failed to fetch analysis');
                
                setDepositAnalysis(analysisData.data || []);

            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [goalId]);

    if (loading) {
        return <div className="p-8 text-center">Loading goal details...</div>;
    }

    if (error || !goal) {
        return (
            <div>
                <Link to="/goals" className="text-primary hover:underline mb-4 inline-flex items-center">
                    <ArrowLeft size={16} className="mr-1" /> Back to Goals
                </Link>
                <div className="p-8 text-center text-red-500">Error: {error || 'Goal not found.'}</div>
            </div>
        );
    }
    
    // Calculations for SavingsProgressCard
    // API returns analysis sorted by periodsAgo (0 = This Week, 1 = Last Week, etc.)
    const thisWeekEntry = depositAnalysis.find(d => d.periodsAgo === 0);
    const lastWeekEntry = depositAnalysis.find(d => d.periodsAgo === 1);
    
    const currentWeekAmount = thisWeekEntry ? thisWeekEntry.amount : 0;
    const lastWeekAmount = lastWeekEntry ? lastWeekEntry.amount : 0;

    // Overall Progress (from Goal Details API)
    const overallProgress = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main content left */}
                <div className="lg:col-span-2 space-y-8">
                     <div>
                        <Link to="/goals" className="text-primary hover:underline mb-2 inline-flex items-center text-sm font-semibold">
                            <ArrowLeft size={16} className="mr-1" /> Back to Goals
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-800 mt-2">{user ? `${user.firstName}'s ${goal.name} Goal!` : `${goal.name} Goal!`}</h1>
                        <p className="text-gray-500 mt-2 max-w-lg">Your progress this week is Awesome. let's keep it up and get a lot of points reward!</p>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                       <StatCard 
                           icon={<PiggyBank size={32} className="text-white" />} 
                           title="Amount Saved" 
                           value={goal.currentAmount.toLocaleString()}
                           unit="TZS"
                           unitPosition="before"
                           iconBgColor="bg-indigo-500"
                           valueColor="text-indigo-600"
                        />
                       <StatCard 
                           icon={<Percent size={32} className="text-white" />} 
                           title="Progress" 
                           value={overallProgress}
                           unit="%"
                           unitPosition="after"
                           iconBgColor="bg-cyan-500"
                           valueColor="text-cyan-600"
                        />
                       <StatCard 
                           icon={<Calendar size={32} className="text-white" />} 
                           title="Time Remaining" 
                           value={goal.daysRemaining !== undefined ? goal.daysRemaining : 'N/A'}
                           unit="days"
                           unitPosition="after"
                           iconBgColor="bg-amber-500"
                           valueColor="text-amber-600"
                        />
                    </div>
                </div>
                
                 {/* Right sidebar */}
                <div className="lg:col-span-1">
                    <SavingsProgressCard 
                        currentWeekAmount={currentWeekAmount}
                        lastWeekAmount={lastWeekAmount}
                        targetAmount={goal.targetAmount}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <WeeklyDepositAnalysisCard goalId={goal.id} data={depositAnalysis} />
                </div>
                <div className="lg:col-span-1">
                    <OtherGoalProgressCard currentGoalId={goal.id} />
                </div>
            </div>
        </div>
    );
};

export default GoalDetailPage;