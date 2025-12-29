import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    X, Loader2, Target, CheckCircle2, Lock, Search, ChevronDown
} from 'lucide-react';
import { API_BASE_URL } from '../../services/apiConfig';
import { interceptedFetch } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { SavingsGoal } from '../../types';

// Helper to map icon strings to emojis
const getGoalIcon = (iconStr: string | null | undefined) => {
    switch (iconStr?.toUpperCase()) {
        case 'PLANE': return '✈️';
        case 'HOME': return '🏠';
        case 'BRIEFCASE': return '💼';
        case 'BOOK': return '📚';
        case 'HEART': return '❤️';
        case 'GIFT': return '🎁';
        case 'VACATION': return '🏖️';
        default: return '💰';
    }
};

// Main QuickSaveModal Component
export const QuickSaveModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void;
    initialGoal?: SavingsGoal;
}> = ({ isOpen, onClose, initialGoal }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [goals, setGoals] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedGoal, setSelectedGoal] = useState<any | null>(null);
    const [amount, setAmount] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const amountInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            if (initialGoal) {
                setSelectedGoal(initialGoal);
                setLoading(false);
            } else {
                const fetchGoals = async () => {
                    setLoading(true);
                    try {
                        const response = await interceptedFetch(`${API_BASE_URL}/api/v1/goals?sortBy=targetDate&sortDirection=asc&page=0&size=20&search=`);
                        const result = await response.json();
                        if (result.success) setGoals(result.data.content || []);
                    } catch (error) {
                        console.error("Failed to fetch goals", error);
                    } finally {
                        setLoading(false);
                    }
                };
                fetchGoals();
            }
            setTimeout(() => amountInputRef.current?.focus(), 100);
        } else {
            setSearchQuery('');
            setSelectedGoal(null);
            setAmount('');
            setIsDropdownOpen(false);
        }
    }, [isOpen, initialGoal]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredGoals = useMemo(() => goals.filter(g => (g.goalName || g.name).toLowerCase().includes(searchQuery.toLowerCase())), [goals, searchQuery]);
    const isGoalComplete = useMemo(() => selectedGoal ? selectedGoal.currentAmount >= selectedGoal.targetAmount : false, [selectedGoal]);
    const progressPercent = useMemo(() => selectedGoal ? Math.round((selectedGoal.currentAmount / selectedGoal.targetAmount) * 100) : 0, [selectedGoal]);

    if (!isOpen) return null;

    const handleCreateOrder = () => {
        if (!selectedGoal || !amount || isGoalComplete) return;
        
        // Navigate to the separate CheckoutPage
        navigate('/checkout', { 
            state: { 
                amount: amount.replace(/,/g, ''), 
                selectedGoal 
            } 
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col p-8 sm:p-10 border border-gray-100">
                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Quick Saving</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 active:scale-90 transition-all"><X size={24} /></button>
                </div>

                <div className="space-y-8">
                    <div className="flex flex-col items-center justify-center relative">
                        <div className="flex items-center w-full relative">
                            <span className="text-3xl font-bold text-gray-200 absolute left-0 select-none uppercase">{user?.currency || 'TZS'}</span>
                            <input 
                                ref={amountInputRef}
                                type="text"
                                inputMode="numeric"
                                value={amount ? parseFloat(amount).toLocaleString('en-US') : ''}
                                onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="0"
                                disabled={isGoalComplete}
                                className={`w-full text-center text-5xl font-bold text-gray-900 focus:outline-none placeholder:text-gray-100 bg-transparent px-8 ${isGoalComplete ? 'opacity-30 cursor-not-allowed' : ''}`}
                            />
                        </div>
                        {isGoalComplete && (
                            <div className="mt-4 flex items-center space-x-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 shadow-sm">
                                <CheckCircle2 size={16} />
                                <span className="text-[11px] font-bold uppercase tracking-wider">Goal achieved!</span>
                            </div>
                        )}
                    </div>

                    <div className="relative" ref={dropdownRef}>
                        <div 
                            onClick={() => !initialGoal && setIsDropdownOpen(!isDropdownOpen)}
                            className={`w-full bg-white border border-gray-100 rounded-[20px] p-4 flex items-center justify-between shadow-sm transition-all duration-300 ${initialGoal ? 'cursor-default' : 'cursor-pointer hover:border-gray-200 hover:shadow-md'}`}
                        >
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                                    {selectedGoal ? getGoalIcon(selectedGoal.icon) : <Target size={24} />}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[10px] font-bold text-gray-400 leading-none mb-1.5 uppercase tracking-widest">Target goal</p>
                                    <p className={`text-base font-bold truncate ${selectedGoal ? 'text-gray-900' : 'text-gray-200'}`}>
                                        {selectedGoal ? (selectedGoal.goalName || selectedGoal.name) : 'Select Goal...'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                {selectedGoal && (
                                    <span className="text-xs font-bold text-gray-400">{progressPercent}%</span>
                                )}
                                {!initialGoal && (
                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-gray-100 transition-colors">
                                        <ChevronDown size={18} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-indigo-500' : ''}`} />
                                    </div>
                                )}
                            </div>
                        </div>

                        {isDropdownOpen && !initialGoal && (
                            <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-50 rounded-[24px] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-3 duration-300">
                                <div className="p-3 border-b border-gray-50 flex items-center bg-gray-50/30">
                                    <div className="w-full relative">
                                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input 
                                            type="text" 
                                            placeholder="Search goals..." 
                                            autoFocus
                                            value={searchQuery} 
                                            onChange={(e) => setSearchQuery(e.target.value)} 
                                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-100 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold" 
                                        />
                                    </div>
                                </div>
                                <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                    {loading ? (
                                        <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-indigo-600" size={24} /></div>
                                    ) : filteredGoals.length > 0 ? (
                                        filteredGoals.map(goal => {
                                            const progress = goal.targetAmount > 0 ? Math.round((goal.currentAmount / goal.targetAmount) * 100) : 0;
                                            return (
                                                <div 
                                                    key={goal.id} 
                                                    onClick={() => { setSelectedGoal(goal); setIsDropdownOpen(false); }} 
                                                    className="px-5 py-4 hover:bg-indigo-50/50 cursor-pointer flex items-center justify-between border-b border-gray-50 last:border-0 transition-all group/item"
                                                >
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl shadow-sm group-hover/item:scale-105 transition-transform">
                                                            {getGoalIcon(goal.icon)}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="font-bold text-gray-900 text-sm leading-tight truncate">{goal.goalName || goal.name}</p>
                                                            <p className="text-[10px] text-gray-400 mt-1 font-bold">Progress: {progress}%</p>
                                                        </div>
                                                    </div>
                                                    {selectedGoal?.id === goal.id && <div className="w-6 h-6 rounded-full border-2 border-indigo-600 flex items-center justify-center bg-indigo-50"><div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div></div>}
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="p-10 text-center text-gray-300 font-bold text-xs uppercase tracking-widest">No goals found</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-10 space-y-6">
                    <button 
                        onClick={handleCreateOrder} 
                        disabled={!selectedGoal || !amount || loading || isGoalComplete} 
                        className={`w-full font-bold py-4 rounded-[20px] shadow-xl transition-all active:scale-[0.97] text-base ${isGoalComplete ? 'bg-emerald-100 text-emerald-600 shadow-emerald-50 cursor-default' : 'bg-gray-100 text-gray-300 disabled:bg-gray-50 disabled:text-gray-200 disabled:shadow-none hover:bg-indigo-600 hover:text-white shadow-indigo-100/50'}`}
                    >
                        {isGoalComplete ? "Goal complete" : "Create order"}
                    </button>
                    <div className="flex items-center justify-center space-x-2 text-gray-400 text-xs font-medium">
                        <Lock size={14} />
                        <span>Highly secured and encrypted by PesaFlow Bank</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
