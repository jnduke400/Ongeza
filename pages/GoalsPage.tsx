
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, DollarSign, Search, ChevronUp, ChevronDown, MoreVertical, Trash2, Eye, Plus, X, PieChart as PieChartIcon, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownLeft, Briefcase, BookOpen, HeartPulse, Plane, Home, Gift, TrendingDown, Wallet } from 'lucide-react';
import { SavingsGoal } from '../types';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Line, LineChart, CartesianGrid } from 'recharts';
import { API_BASE_URL } from '../services/apiConfig';
import { interceptedFetch } from '../services/api';
import { QuickSaveModal } from '../components/common/QuickSaveModal';

type SavingsGoalWithProgress = SavingsGoal & { progress: number };
type SortableKeys = 'name' | 'targetAmount' | 'progress';

// Analytics Interfaces
interface MonthlyData {
    month: string;
    amount: number;
}

interface FinancialCategory {
    totalThisYear: number;
    percentageChangeVsLastYear: number;
    monthly: MonthlyData[];
    weekly: {
        thisWeek: number;
        lastWeek: number;
    };
}

interface AnalyticsData {
    currency: string;
    totalSavings: number;
    accomplishment: {
        totalAccomplished: number;
        totalCreated: number;
        percentage: number;
    };
    lastDeposit: {
        amount: number;
        percentageChange: number;
    };
    profileReport: {
        totalIncomeThisYear: number;
        percentageChangeVsLastYear: number;
        yearlyIncomes: { year: number; amount: number }[];
    };
    financialAnalytics: {
        income: FinancialCategory;
        expense: FinancialCategory;
        profit: FinancialCategory;
    };
}

// API Mappings
const GOAL_CATEGORIES = [
    { value: "EDUCATION", label: "Education" },
    { value: "TRAVEL", label: "Travel" },
    { value: "HOUSING", label: "Housing" },
    { value: "VEHICLE", label: "Vehicle" },
    { value: "ELECTRONICS", label: "Electronics" },
    { value: "EMERGENCY_FUND", label: "Emergency Fund" },
    { value: "INVESTMENT", label: "Investment" },
    { value: "WEDDING", label: "Wedding" },
    { value: "MEDICAL", label: "Medical" },
    { value: "BUSINESS", label: "Business" },
    { value: "VACATION", label: "Vacation" },
    { value: "OTHER", label: "Other" }
];

const GOAL_ICONS = [
    { value: "BRIEFCASE", label: "💼" },
    { value: "BOOK", label: "📚" },
    { value: "HEART", label: "❤️" },
    { value: "PLANE", label: "✈️" },
    { value: "HOME", label: "🏠" },
    { value: "GIFT", label: "🎁" }
];

interface NewGoalPayload {
  goalName: string;
  targetAmount: number;
  targetDate: string;
  category: string;
  description: string;
  icon: string;
  privacy: string;
  enableMilestoneNotifications: boolean;
  currency: string;
}

const getIconLabel = (value: string) => {
    const icon = GOAL_ICONS.find(i => i.value === value);
    return icon ? icon.label : '💰'; // Default icon
};

// Helper for dynamic formatting (K, M, B, T)
const formatCompactNumber = (number: number) => {
    return Intl.NumberFormat('en-US', {
        notation: 'compact',
        maximumFractionDigits: 1
    }).format(number);
};

const AddGoalModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAddGoal: (newGoal: SavingsGoal) => void;
}> = ({ isOpen, onClose, onAddGoal }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [selectedIcon, setSelectedIcon] = useState<string>('BRIEFCASE');
    const [error, setError] = useState<string | null>(null);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setSelectedIcon('BRIEFCASE');
            setError(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const minDate = new Date();
    minDate.setMonth(minDate.getMonth() + 1);
    const minDateString = minDate.toISOString().split('T')[0];

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        
        const formData = new FormData(e.currentTarget);
        
        const payload: NewGoalPayload = {
            goalName: formData.get('goalName') as string,
            targetAmount: Number(formData.get('targetAmount')),
            targetDate: formData.get('deadline') as string,
            category: formData.get('category') as string,
            description: formData.get('details') as string,
            icon: selectedIcon,
            privacy: formData.get('privacy') as string,
            enableMilestoneNotifications: formData.get('milestoneNotifications') === 'on',
            currency: 'TZS'
        };

        try {
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/goals`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to create goal');
            }

            // Map the API response to the SavingsGoal type used by the UI
            const apiGoal = result.data;
            const newUiGoal: SavingsGoal = {
                id: String(apiGoal.id),
                name: apiGoal.goalName,
                targetAmount: apiGoal.targetAmount,
                currentAmount: apiGoal.currentAmount || 0,
                deadline: apiGoal.targetDate,
                details: apiGoal.description,
                icon: apiGoal.icon
            };
            
            onAddGoal(newUiGoal);
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'An error occurred while creating the goal.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 bg-primary rounded-t-xl border-b border-primary-dark">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Add New Savings Goal</h2>
                        <button onClick={onClose} className="p-1 rounded-full text-primary-light hover:bg-white/20 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto">
                    {error && (
                        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
                            {error}
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
                            <input name="goalName" type="text" required minLength={3} maxLength={50} placeholder="e.g., Office Trip" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount (TZS)</label>
                            <input name="targetAmount" type="number" min="1000" required placeholder="e.g., 5000" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
                            <input name="deadline" type="date" required min={minDateString} className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Goal Category</label>
                             <select name="category" required className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                                <option value="">Select a category</option>
                                {GOAL_CATEGORIES.map(cat => (
                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Goal Description (Optional)</label>
                            <textarea name="details" rows={3} placeholder="Describe your goal..." className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Goal Icon</label>
                            <div className="flex flex-wrap gap-3 mt-2">
                                {GOAL_ICONS.map(icon => (
                                    <button
                                        type="button"
                                        key={icon.value}
                                        onClick={() => setSelectedIcon(icon.value)}
                                        className={`w-12 h-12 flex items-center justify-center rounded-lg border-2 text-2xl transition-all ${selectedIcon === icon.value ? 'border-primary bg-primary-light/20 scale-110 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                                        title={icon.value}
                                    >
                                        {icon.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Privacy Setting</label>
                            <div className="flex gap-4 mt-2">
                                <label className="flex items-center cursor-pointer">
                                    <input type="radio" name="privacy" value="PRIVATE" defaultChecked className="h-4 w-4 text-primary focus:ring-primary border-gray-300"/>
                                    <span className="ml-2 text-sm text-gray-700">Private</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input type="radio" name="privacy" value="SHARED" className="h-4 w-4 text-primary focus:ring-primary border-gray-300"/>
                                    <span className="ml-2 text-sm text-gray-700">Shared</span>
                                </label>
                            </div>
                        </div>
                         <div className="flex items-center">
                            <label htmlFor="milestoneNotifications" className="flex items-center cursor-pointer select-none">
                                <div className="relative">
                                    <input type="checkbox" id="milestoneNotifications" name="milestoneNotifications" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary-light dark:peer-focus:ring-primary-dark peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </div>
                                <span className="ml-3 text-sm font-medium text-gray-700">Milestone Notifications</span>
                            </label>
                        </div>
                    </div>
                     <div className="pt-6 mt-4 border-t border-gray-200 flex justify-end items-center space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSaving} className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition shadow-sm flex items-center justify-center whitespace-nowrap disabled:bg-primary-light min-w-[100px]">
                             {isSaving ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                'Add Goal'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const SummaryCard: React.FC<{
  title: string;
  value: string;
  subtitle: string;
  percentagePill?: number;
}> = ({ title, value, subtitle, percentagePill }) => {
    const isNegative = percentagePill !== undefined && percentagePill < 0;
  return (
    <div className="flex-1 p-6">
      <p className="text-sm text-gray-500">{title}</p>
      <div className="flex items-center justify-between mt-2">
        <p className="text-xl lg:text-2xl font-bold text-gray-800">{value}</p>
        {percentagePill !== undefined && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold ${isNegative ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            <span>{Math.abs(percentagePill).toFixed(1)}%</span>
            {isNegative ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
          </div>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
    </div>
  );
};

const SortableTableHeader: React.FC<{
    label: string;
    columnKey: SortableKeys;
    sortConfig: { key: SortableKeys; direction: string };
    requestSort: (key: SortableKeys) => void;
    className?: string;
}> = ({ label, columnKey, sortConfig, requestSort, className = '' }) => {
    const isSorted = sortConfig.key === columnKey;
    const isAscending = isSorted && sortConfig.direction === 'ascending';
    const isDescending = isSorted && sortConfig.direction === 'descending';

    return (
        <div
            className={`flex items-center space-x-2 text-gray-500 cursor-pointer hover:text-gray-800 ${className}`}
            onClick={() => requestSort(columnKey)}
            role="button"
            aria-label={`Sort by ${label}`}
        >
            <span>{label}</span>
            <div className="flex flex-col">
                <ChevronUp size={12} className={`-mb-1 transition-colors ${isAscending ? 'text-primary' : 'text-gray-300'}`} />
                <ChevronDown size={12} className={`transition-colors ${isDescending ? 'text-primary' : 'text-gray-300'}`} />
            </div>
        </div>
    );
};

const SavingsGoalsTable: React.FC<{ 
    goals: SavingsGoal[]; 
    setGoals: React.Dispatch<React.SetStateAction<SavingsGoal[]>>;
    onQuickSave: (goal: SavingsGoal) => void;
}> = ({ goals, setGoals, onQuickSave }) => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys, direction: 'ascending' | 'descending' }>({ key: 'progress', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [activeGoalsTab, setActiveGoalsTab] = useState<'Current' | 'Achieved'>('Current');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const itemsPerPage = 5;

    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const handleDelete = async (goalId: string, goalName: string) => {
        if (window.confirm(`Are you sure you want to delete the goal "${goalName}"?`)) {
            setGoals(prevGoals => prevGoals.filter(g => g.id !== goalId));
        }
    };

    const handleAddGoal = (newGoal: SavingsGoal) => {
        setGoals(prevGoals => [newGoal, ...prevGoals]);
    };

    const processedGoals = useMemo(() => {
        let processed: SavingsGoalWithProgress[] = goals.map(g => ({
            ...g,
            progress: g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0
        }));

        if (activeGoalsTab === 'Current') {
            processed = processed.filter(g => g.currentAmount < g.targetAmount);
        } else {
            processed = processed.filter(g => g.currentAmount >= g.targetAmount);
        }

        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            processed = processed.filter(g => g.name.toLowerCase().includes(lowercasedQuery));
        }

        processed.sort((a, b) => {
            if (sortConfig.key) {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });

        return processed;
    }, [searchQuery, sortConfig, goals, activeGoalsTab]);

    const totalPages = Math.ceil(processedGoals.length / itemsPerPage);
    const paginatedGoals = processedGoals.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const progressColors = ['#22D3EE', '#10B981', '#9CA3AF', '#F43F5E', '#F97316'];

    return (
        <>
            <div className="bg-surface p-6 rounded-lg shadow-sm flex-1 flex flex-col">
                <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                    <h3 className="font-bold text-lg text-gray-800">My Savings Goals</h3>
                    <div className="flex items-center space-x-2 sm:space-x-4">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search goals..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full sm:w-40 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary transition"
                            />
                        </div>
                        <div className="flex items-center bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => { setActiveGoalsTab('Current'); setCurrentPage(1); }}
                                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors duration-200 ${
                                    activeGoalsTab === 'Current' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Current
                            </button>
                            <button
                                onClick={() => { setActiveGoalsTab('Achieved'); setCurrentPage(1); }}
                                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors duration-200 ${
                                    activeGoalsTab === 'Achieved' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                Achieved
                            </button>
                        </div>
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-primary text-white p-2.5 rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto -mx-6">
                    <table className="w-full text-sm text-left">
                        <thead className="sticky top-0 bg-surface">
                            <tr className="border-b border-gray-200">
                                <th className="px-6 py-3"><SortableTableHeader label="Goal Name" columnKey="name" sortConfig={sortConfig} requestSort={requestSort} /></th>
                                <th className="px-6 py-3"><SortableTableHeader label="Target Amount" columnKey="targetAmount" sortConfig={sortConfig} requestSort={requestSort} className="justify-start"/></th>
                                <th className="px-6 py-3"><SortableTableHeader label="Progress" columnKey="progress" sortConfig={sortConfig} requestSort={requestSort} /></th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedGoals.map((goal, index) => {
                                const color = progressColors[index % progressColors.length];
                                return (
                                    <tr key={goal.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-800">
                                            <div className="flex items-center">
                                                <span className="text-2xl mr-3">{getIconLabel(goal.icon || '')}</span>
                                                <span>{goal.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-600 text-left">TZS {goal.targetAmount.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-full bg-gray-200 rounded-full h-2 mr-4">
                                                    <div
                                                        className="h-2 rounded-full"
                                                        style={{ width: `${goal.progress}%`, backgroundColor: color }}
                                                    ></div>
                                                </div>
                                                <span className="font-bold text-gray-700 w-10 text-right">{goal.progress.toFixed(0)}%</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => onQuickSave(goal)} 
                                                    className="p-2 rounded-lg text-primary hover:bg-emerald-50 transition-colors"
                                                    title="Deposit"
                                                >
                                                    <Wallet size={18} />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/goals/${goal.id}`)} 
                                                    className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(goal.id, goal.name)} 
                                                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                        <p>Showing <span className="font-semibold text-gray-700">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-gray-700">{Math.min(currentPage * itemsPerPage, processedGoals.length)}</span> of <span className="font-semibold text-gray-700">{processedGoals.length}</span> goals</p>
                        <div className="flex items-center space-x-1">
                            <button onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-primary disabled:opacity-50 disabled:text-gray-400"><ChevronLeft size={18} /></button>
                            <span className="px-2 font-semibold text-gray-700">{currentPage}</span>
                            <button onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage === totalPages} className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-primary disabled:opacity-50 disabled:text-gray-400"><ChevronRight size={18} /></button>
                        </div>
                    </div>
                )}
            </div>
            <AddGoalModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onAddGoal={handleAddGoal} 
            />
        </>
    );
};

const CustomAreaTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-2 px-3 rounded-lg shadow-lg border border-gray-100">
                <p className="text-sm font-semibold text-gray-700">{label}</p>
                <p className="text-sm" style={{ color: payload[0].stroke }}>
                    {`TZS ${payload[0].value.toLocaleString()}`}
                </p>
            </div>
        );
    }
    return null;
};

const ReportsCard: React.FC<{ analytics: AnalyticsData | null }> = ({ analytics }) => {
    type ReportCategory = 'Income' | 'Expenses' | 'Profit';
    const [activeTab, setActiveTab] = useState<ReportCategory>('Profit');
    const currency = analytics?.currency || 'TZS';

    if (!analytics) {
        return (
             <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 p-6 flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const { financialAnalytics, profileReport } = analytics;

    const processFinancialData = (data: FinancialCategory, color: string, title: string, icon: React.ReactNode, bg: string) => {
        const totalWeekly = data.weekly.thisWeek + data.weekly.lastWeek;
        const progress = totalWeekly > 0 ? (data.weekly.thisWeek / totalWeekly) * 100 : (data.weekly.thisWeek > 0 ? 100 : 0);
        
        const diff = data.weekly.thisWeek - data.weekly.lastWeek;
        const comparisonText = diff === 0 
            ? 'Same as last week'
            : `${currency} ${formatCompactNumber(Math.abs(diff))} ${diff > 0 ? 'more' : 'less'} than last week`;

        return {
            title: title,
            value: formatCompactNumber(data.totalThisYear),
            percentage: data.percentageChangeVsLastYear,
            icon: icon,
            iconBg: bg,
            chartData: data.monthly.map(m => ({ name: m.month, value: m.amount })),
            weeklySummary: {
                title: `${title.split(' ')[1]} This Week`,
                value: formatCompactNumber(data.weekly.thisWeek),
                progress: progress,
                comparison: comparisonText,
            },
            chartColor: color,
        };
    };

    const reportData = {
        Income: processFinancialData(financialAnalytics.income, '#10B981', 'Total Income', <ArrowDownLeft className="text-green-600" size={24} />, 'bg-green-100'),
        Expenses: processFinancialData(financialAnalytics.expense, '#F43F5E', 'Total Expenses', <ArrowUpRight className="text-red-600" size={24} />, 'bg-red-100'),
        Profit: processFinancialData(financialAnalytics.profit, '#6366F1', 'Total Profit', <PieChartIcon className="text-indigo-600" size={24} />, 'bg-indigo-100')
    };
    
    const currentData = reportData[activeTab];
    const profileReportData = profileReport.yearlyIncomes.length > 0 
        ? profileReport.yearlyIncomes.map(y => ({ name: y.year.toString(), value: y.amount }))
        : [{ name: new Date().getFullYear().toString(), value: 0 }];

    return (
        <div className="bg-surface rounded-2xl shadow-sm border border-gray-100">
            <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg text-gray-800">Profile Report</h3>
                    <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2.5 py-1 rounded-md">
                        Year {profileReport.yearlyIncomes.length > 0 ? profileReport.yearlyIncomes[0].year : new Date().getFullYear()}
                    </span>
                </div>
                <div className="flex items-end justify-between">
                    <div>
                        <div className={`flex items-center font-semibold text-lg ${profileReport.percentageChangeVsLastYear >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {profileReport.percentageChangeVsLastYear >= 0 ? <TrendingUp size={20} className="mr-1" /> : <TrendingDown size={20} className="mr-1" />}
                            <span>{Math.abs(profileReport.percentageChangeVsLastYear)}%</span>
                        </div>
                        <p className="text-4xl font-bold text-gray-800 mt-1">{currency} {formatCompactNumber(profileReport.totalIncomeThisYear)}</p>
                    </div>
                    <div className="w-1/2 h-20 -mb-4 -mr-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={profileReportData}>
                                <XAxis hide dataKey="name" />
                                <YAxis hide domain={['dataMin - 10000', 'dataMax + 10000']} />
                                <Line type="monotone" dataKey="value" stroke="#F97316" strokeWidth={3} dot={true} activeDot={false}/>
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
            
            <div className="border-t border-gray-100"></div>

            <div className="p-6">
                <div className="flex items-center space-x-2 mb-4 bg-gray-100 p-1 rounded-lg">
                    {(Object.keys(reportData) as ReportCategory[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`flex-1 px-3 py-1.5 text-sm font-semibold rounded-md transition-colors duration-200 ${
                                activeTab === tab ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                 <div className="flex items-start space-x-4 mb-6">
                    <div className={`w-12 h-12 flex items-center justify-center ${currentData.iconBg} rounded-lg`}>{currentData.icon}</div>
                    <div>
                        <p className="text-sm text-gray-500">{currentData.title}</p>
                        <div className="flex items-baseline space-x-2">
                            <p className="text-2xl font-bold text-gray-800">{currency} {currentData.value}</p>
                            <div className={`flex items-center text-sm font-semibold ${currentData.percentage < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {currentData.percentage >= 0 ? <TrendingUp size={14} className="mr-0.5"/> : <TrendingDown size={14} className="mr-0.5"/>}
                                <span>{Math.abs(currentData.percentage)}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={currentData.chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                            <defs>
                                <linearGradient id={`colorGradient-${activeTab}`} x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={currentData.chartColor} stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor={currentData.chartColor} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={false} tickLine={false} />
                            <YAxis hide />
                            <Tooltip content={<CustomAreaTooltip />} cursor={{ stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '3 3' }} />
                            <Area type="monotone" dataKey="value" stroke={currentData.chartColor} strokeWidth={3} fillOpacity={1} fill={`url(#colorGradient-${activeTab})`} dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center">
                    <div className="relative w-16 h-16 flex-shrink-0">
                        <svg className="w-full h-full" viewBox="0 0 36 36">
                            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                            <path className="transform -rotate-90 origin-center" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={currentData.chartColor} strokeWidth="4" strokeDasharray={`${currentData.weeklySummary.progress}, 100`} strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-bold text-gray-800 text-[10px]">{currentData.weeklySummary.value}</div>
                    </div>
                    <div className="ml-4">
                        <p className="font-semibold text-gray-800">{currentData.weeklySummary.title}</p>
                        <p className="text-sm text-gray-500">{currentData.weeklySummary.comparison}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};


const GoalsPage: React.FC = () => {
    const [goals, setGoals] = useState<SavingsGoal[]>([]);
    const [isLoadingGoals, setIsLoadingGoals] = useState(true);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [summaryValues, setSummaryValues] = useState({ totalSavings: 0, accomplishmentValue: 0, accomplishmentTotal: 0, accomplishmentPercentage: 0, lastDepositAmount: 0, lastDepositPercentage: 0, currency: 'TZS' });
    
    // Quick Saving Modal State
    const [isQuickSaveOpen, setIsQuickSaveOpen] = useState(false);
    const [quickSaveGoal, setQuickSaveGoal] = useState<SavingsGoal | undefined>(undefined);

    const handleOpenQuickSave = (goal: SavingsGoal) => {
        setQuickSaveGoal(goal);
        setIsQuickSaveOpen(true);
    };

    useEffect(() => {
        const fetchGoals = async () => {
            setIsLoadingGoals(true);
            try {
                const response = await interceptedFetch(`${API_BASE_URL}/api/v1/goals?sortBy=targetDate&sortDirection=asc&page=0&size=20`);
                if (response.ok) {
                    const result = await response.json();
                    if (result.success && result.data?.content) {
                        const mappedGoals: SavingsGoal[] = result.data.content.map((apiGoal: any) => ({
                            id: String(apiGoal.id),
                            name: apiGoal.goalName,
                            targetAmount: apiGoal.targetAmount,
                            currentAmount: apiGoal.currentAmount || 0,
                            deadline: apiGoal.targetDate,
                            details: apiGoal.description,
                            icon: apiGoal.icon 
                        }));
                        setGoals(mappedGoals);
                    }
                }
            } catch (error) { console.error(error); } finally { setIsLoadingGoals(false); }
        };

        const fetchAnalytics = async () => {
            try {
                const response = await interceptedFetch(`${API_BASE_URL}/api/v1/goals/analytics`);
                const data = await response.json();
                if (response.ok && data.success && data.data) {
                    setAnalytics(data.data);
                    const d = data.data;
                    setSummaryValues({ totalSavings: d.totalSavings, accomplishmentValue: d.accomplishment.totalAccomplished, accomplishmentTotal: d.accomplishment.totalCreated, accomplishmentPercentage: d.accomplishment.percentage, lastDepositAmount: d.lastDeposit.amount, lastDepositPercentage: d.lastDeposit.percentageChange, currency: d.currency });
                }
            } catch (error) { console.error(error); }
        };

        fetchGoals();
        fetchAnalytics();
    }, []);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 flex flex-col gap-8">
                <div className="bg-surface rounded-xl shadow-sm flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-200">
                    <SummaryCard title={`Total Savings (${summaryValues.currency})`} value={summaryValues.totalSavings.toLocaleString()} subtitle="Total balance in your account" />
                    <SummaryCard title="Accomplishment" value={`${summaryValues.accomplishmentValue}`} subtitle={`of ${summaryValues.accomplishmentTotal} created goals`} percentagePill={summaryValues.accomplishmentPercentage} />
                    <SummaryCard title={`Last Deposit (${summaryValues.currency})`} value={summaryValues.lastDepositAmount.toLocaleString()} subtitle="Most recent deposit" percentagePill={summaryValues.lastDepositPercentage} />
                </div>
                {isLoadingGoals ? (
                    <div className="bg-surface p-6 rounded-lg shadow-sm h-64 flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>
                ) : (
                    <SavingsGoalsTable goals={goals} setGoals={setGoals} onQuickSave={handleOpenQuickSave} />
                )}
            </div>
            <div className="lg:col-span-1 space-y-8">
                <ReportsCard analytics={analytics} />
            </div>
            
            <QuickSaveModal 
                isOpen={isQuickSaveOpen} 
                onClose={() => setIsQuickSaveOpen(false)} 
                initialGoal={quickSaveGoal}
            />
        </div>
    );
};

export default GoalsPage;
