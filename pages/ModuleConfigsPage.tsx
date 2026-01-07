
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    Shield, Eye, EyeOff, Edit2, UserPlus, X, Briefcase, PiggyBank, TrendingUp, Settings, Plus, Trash2, UserCheck,
    Palette, MapPin, Calendar, User, Target, Check, UserCircle2, CheckCircle, Crown, Flag, Languages, Phone, 
    Mail, MessageSquare, BarChart2, FileText as FileIcon, Edit, DollarSign, Clock, Bell, BookOpen, HeartPulse, Plane, Home, Gift,
    Monitor, Smartphone, Tablet, CreditCard, Search, ChevronUp, ChevronDown, PieChart as PieChartIcon, ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownLeft, Upload, Loader2, Lock, AlertTriangle, Laptop
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole, User as UserType } from '../types';
import { interceptedFetch } from '../services/api';
import { API_BASE_URL } from '../services/apiConfig';

interface ProfileApiResponse {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
	tfaPhoneNumber: string;
    status: string;
    userCategory: string;
    activity: string;
    roleName: string;
    roleId: number;
    createdAt: string;
    updatedAt: string;
    lastLogin: string | null;
    pinSet: boolean;
    preferredLanguage: string;
    organization?: string;
    timezone?: string;
    currency?: string;
    dateOfBirth?: string;
    gender?: string;
    profilePictureUrl?: string;
    address: {
        country: string;
        region: string;
        district: string;
        city?: string;
        street: string;
        postalCode: string;
    };
}

interface DeviceData {
    id: number;
    client: string;
    operatingSystem: string;
    deviceType: string;
    location: string;
    ipAddress: string;
    lastActive: string;
    currentDevice: boolean;
}

interface AutomatedContribution {
    id: number;
    amount: number;
    frequency: 'DAILY' | 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY';
    dayOfWeek?: string | null;
    dayOfMonth?: number | null;
    timeOfDay?: string | null;
    startDate: string;
    endDate?: string | null;
    paymentSource: string;
    isActive: boolean;
}

interface GoalSettingsAnalytics {
    activeGoals: number;
    totalGoals: number;
    totalSaved: number;
    totalTarget: number;
    progressPercentage: number;
    automatedContribution: AutomatedContribution | null;
}

interface InterestTier {
    id?: number;
    minBalance: number;
    maxBalance: number | null | typeof Infinity;
    ratePercentage: number;
    effectiveDate: string;
    isActive: boolean;
    description: string;
    createdAt?: string;
    updatedAt?: string;
    deletedAt?: string | null;
}

interface SavingsConfiguration {
    id: number;
    minDepositAmount: number;
    maxActiveGoalsPerSaver: number;
    isRoundUpEnabled: boolean;
    roundUpNearestUnit: number;
    isEmergencyWithdrawalEnabled: boolean;
    emergencyWithdrawalRequiresApproval: boolean;
    emergencyWithdrawalRequiresJustification: boolean;
    instantWithdrawalDailyLimit: number;
    scheduledWithdrawalNoticeHours: number;
    instantWithdrawalFeePercent: number;
    instantMinFee: number;
    scheduledWithdrawalFeePercent: number;
    scheduledMinFee: number;
    emergencyWithdrawalFeePercent: number;
    emergencyMinFee: number;
    isFreeScheduledWithdrawalEnabled: boolean;
    isDailyInterestAccrualEnabled: boolean;
    isCompoundInterestEnabled: boolean;
    is360DayYearBasisEnabled: boolean;
    minBalanceForInterest: number;
    interestPostingFrequency: string;
    isInterestStatementEnabled: boolean;
    isTaxDeductionApplicable: boolean;
    withholdingTaxPercentage: number;
    requiredKycDocumentTypeIds: number[];
    alternativeKycDocumentTypeIds: number[];
    interestTiers: InterestTier[];
    updatedAt: string;
}

interface ApiDocumentType {
    id: number;
    name: string;
    code: string;
    description: string;
    fileType: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}

const formatApiString = (str: string | null | undefined): string => {
  if (!str) return '';
  return str
    .replace('ROLE_', '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const TabButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
    isDisabled?: boolean;
}> = ({ icon, label, isActive, onClick, isDisabled = false }) => {
    return (
        <button
            onClick={onClick}
            disabled={isDisabled}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-semibold ${
                isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-500 hover:bg-gray-100'
            } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    );
};

const CardComponent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 ${className}`}>
        {children}
    </div>
);

const PaymentCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={`bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 ${className}`}>
        {children}
    </div>
);

const PaymentsTabContent: React.FC<{ onNavigateToTab: (tabId: string) => void }> = ({ onNavigateToTab }) => {
     return (
        <div className="space-y-6">
            <PaymentCard>
                <h3 className="text-xl font-bold text-gray-800 mb-4">Overall Goal Progress</h3>
                 <div className="text-center py-8 text-gray-500">Feature coming soon.</div>
            </PaymentCard>
        </div>
    );
};


const ConfigurationIllustrationCard: React.FC = () => {
    return (
        <CardComponent className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-full max-w-xs mx-auto">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="gear-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#7DD3FC" />
                      <stop offset="100%" stopColor="#0EA5E9" />
                    </linearGradient>
                    <linearGradient id="slider-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#6EE7B7" />
                      <stop offset="100%" stopColor="#10B981" />
                    </linearGradient>
                    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.1"/>
                    </filter>
                  </defs>

                  <circle cx="100" cy="100" r="80" fill="#F9FAFB" />
                  <circle cx="100" cy="100" r="70" fill="#FFFFFF" stroke="#F3F4F6" strokeWidth="2"/>

                  <g transform="translate(85 115) rotate(10)" filter="url(#shadow)">
                    <path fill="url(#gear-grad)" d="M0-40 l6,10 h-12 l6-10 M34.6-20 l10,-6 v12 l-10-6 M34.6,20 l10,6 v-12 l-10,6 M0,40 l-6-10 h12 l-6,10 M-34.6,20 l-10,6 v-12 l-10,6 M-34.6-20 l-10-6 v12 l-10-6 Z" />
                    <circle cx="0" cy="0" r="30" fill="url(#gear-grad)"/>
                    <circle cx="0" cy="0" r="12" fill="white"/>
                  </g>
                  
                  <g transform="translate(135 75) rotate(-25)" filter="url(#shadow)">
                    <path fill="#A5B4FC" d="M0-25 l4,6 h-8 l4-6 M21.6-12.5 l6-4 v8 l-6-4 M21.6,12.5 l6,4 v-8 l-6,4 M0,25 l-4-6 h8 l-4,6 M-21.6,12.5 l-6,4 v-8 l-6,4 M-21.6-12.5 l-6-4 v8 l-6-4 Z" />
                    <circle cx="0" cy="0" r="18" fill="#A5B4FC"/>
                    <circle cx="0" cy="0" r="8" fill="white"/>
                  </g>

                  <g transform="translate(40, 50)" filter="url(#shadow)">
                    <rect x="0" y="0" width="80" height="40" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="1.5"/>
                    <rect x="10" y="16" width="60" height="8" rx="4" fill="#E5E7EB"/>
                    <circle cx="30" cy="20" r="7" fill="url(#slider-grad)" stroke="white" strokeWidth="2"/>
                  </g>
                </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mt-4">System Configurations</h2>
            <p className="text-gray-500 mt-2 max-w-xs">Manage financial products, security settings, and platform parameters from one central place.</p>
        </CardComponent>
    );
};

const FormField: React.FC<{ label: string; children: React.ReactNode; }> = ({ label, children }) => (
    <div>
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1">{children}</div>
    </div>
);

const LoanProductSettings: React.FC = () => (
    <div className="space-y-6">
        <CardComponent>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Loan Categories & Terms</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Loan Categories">
                    <input type="text" placeholder="e.g., Personal, Business" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </FormField>
                <FormField label="Interest Rates (%)">
                    <input type="number" placeholder="15" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </FormField>
                <FormField label="Loan Amounts (TZS)">
                    <div className="flex space-x-2">
                        <input type="number" placeholder="Min" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                        <input type="number" placeholder="Max" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                </FormField>
                <FormField label="Loan Tenures (Months)">
                     <div className="flex space-x-2">
                        <input type="number" placeholder="Min" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                        <input type="number" placeholder="Max" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                </FormField>
                <div className="md:col-span-2">
                    <FormField label="Repayment Terms">
                        <textarea rows={3} placeholder="Define repayment schedule and terms..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </FormField>
                </div>
            </div>
        </CardComponent>

        <CardComponent>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Fees, Requirements & Scoring</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Penalty for Late Payments (%)">
                    <input type="number" placeholder="5" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </FormField>
                <FormField label="Required Documents">
                    <div className="space-y-2 mt-2">
                        <div className="flex items-center"><input type="checkbox" className="h-4 w-4 rounded text-primary focus:ring-primary" id="doc_id" /><label htmlFor="doc_id" className="ml-2 text-sm">ID</label></div>
                        <div className="flex items-center"><input type="checkbox" className="h-4 w-4 rounded text-primary focus:ring-primary" id="doc_permit" /><label htmlFor="doc_permit" className="ml-2 text-sm">Business Permits</label></div>
                    </div>
                </FormField>
                 <FormField label="Credit Scoring Rules">
                    <div className="space-y-2 mt-2">
                        <div className="flex items-center"><input type="checkbox" className="h-4 w-4 rounded text-primary focus:ring-primary" id="score_digital" /><label htmlFor="score_digital" className="ml-2 text-sm">Digital Footprints</label></div>
                        <div className="flex items-center"><input type="checkbox" className="h-4 w-4 rounded text-primary focus:ring-primary" id="score_mobile" /><label htmlFor="score_mobile" className="ml-2 text-sm">Mobile Payment Data</label></div>
                        <div className="flex items-center"><input type="checkbox" className="h-4 w-4 rounded text-primary focus:ring-primary" id="score_savings" /><label htmlFor="score_savings" className="ml-2 text-sm">Savings Behavior</label></div>
                    </div>
                </FormField>
            </div>
        </CardComponent>
        <button className="mt-6 bg-primary text-white font-semibold py-2 px-5 rounded-lg hover:bg-primary-dark transition-colors">Save Changes</button>
    </div>
);

const SavingsProductSettings: React.FC<{ currency: string }> = ({ currency }) => {
    const [config, setConfig] = useState<SavingsConfiguration | null>(null);
    const [allDocumentTypes, setAllDocumentTypes] = useState<ApiDocumentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Tier management state
    const [interestTiers, setInterestTiers] = useState<InterestTier[]>([]);

    useEffect(() => {
        const fetchSavingsData = async () => {
            setLoading(true);
            try {
                const [configRes, docsRes, tiersRes] = await Promise.all([
                    interceptedFetch(`${API_BASE_URL}/api/v1/savings/configuration`),
                    interceptedFetch(`${API_BASE_URL}/api/v1/document-types`),
                    interceptedFetch(`${API_BASE_URL}/api/v1/interest/configs`)
                ]);
                
                const configData = await configRes.json();
                const docsData = await docsRes.json();
                const tiersData = await tiersRes.json();
                
                if (configData.success) {
                    setConfig(configData.data);
                }
                
                if (docsData.success) {
                    setAllDocumentTypes(docsData.data.content || docsData.data || []);
                }

                if (tiersData.success && Array.isArray(tiersData.data)) {
                    const mappedTiers = tiersData.data.map((tier: any) => ({
                        ...tier,
                        // Case: When maxBalance is null from API, pass as Infinity to UI
                        maxBalance: tier.maxBalance === null ? Infinity : tier.maxBalance
                    }));
                    setInterestTiers(mappedTiers);
                }
            } catch (err) {
                console.error("Failed to load savings configuration", err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchSavingsData();
    }, []);

    const handleConfigChange = (field: keyof SavingsConfiguration, value: any) => {
        if (!config) return;
        setConfig({ ...config, [field]: value });
    };

    const handleSave = async () => {
        if (!config) return;
        setIsSaving(true);
        try {
            const payload = {
                ...config,
                // Case: When maxBalance is Infinity in state, pass as null to backend
                interestTiers: interestTiers.map(tier => ({
                    ...tier,
                    maxBalance: tier.maxBalance === Infinity ? null : tier.maxBalance
                }))
            };

            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/savings/configuration`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (result.success) {
                alert('Configuration updated successfully!');
            } else {
                throw new Error(result.message || 'Update failed');
            }
        } catch (err: any) {
            alert('Error: ' + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleKycId = (id: number, field: 'requiredKycDocumentTypeIds' | 'alternativeKycDocumentTypeIds') => {
        if (!config) return;
        const currentIds = [...config[field]];
        const index = currentIds.indexOf(id);
        if (index > -1) {
            currentIds.splice(index, 1);
        } else {
            currentIds.push(id);
        }
        handleConfigChange(field, currentIds);
    };

    const handleTierChange = (index: number, field: keyof InterestTier, value: any) => {
        const newTiers = [...interestTiers];
        let finalValue = value;

        if (field === 'minBalance' || field === 'maxBalance' || field === 'ratePercentage') {
             if (value === 'Infinity' || value === '') {
                 finalValue = Infinity;
             } else {
                 finalValue = Number(value);
             }
        }
        
        newTiers[index] = { 
            ...newTiers[index], 
            [field]: finalValue
        };
        
        // Logical flow for range ordering: update the next tier's minBalance automatically
        if (field === 'maxBalance' && index < newTiers.length - 1 && isFinite(finalValue as number)) {
            newTiers[index + 1] = { ...newTiers[index + 1], minBalance: (finalValue as number) + 1 };
        }
        setInterestTiers(newTiers);
    };

    const addTier = () => {
        setInterestTiers(prev => {
            const newTiers = [...prev];
            const lastTier = newTiers.length > 0 ? newTiers[newTiers.length - 1] : null;
            
            // If the current last tier has maxBalance Infinity, we must give it a numeric range first
            if (lastTier && lastTier.maxBalance === Infinity) {
                // Preceding figure calculation: set a sensible gap
                lastTier.maxBalance = lastTier.minBalance + 50000;
            }

            const newFrom = lastTier ? Number(lastTier.maxBalance) + 1 : 0;
            const newTo = Infinity; // New last tier is always Infinity

            const newTier: InterestTier = {
                minBalance: newFrom,
                maxBalance: newTo,
                ratePercentage: lastTier ? lastTier.ratePercentage : 0,
                effectiveDate: new Date().toISOString().split('T')[0],
                isActive: true,
                description: `Tier ${newTiers.length + 1} Savings Rate`
            };

            newTiers.push(newTier);
            return newTiers;
        });
    };

    const removeTier = (index: number) => {
        setInterestTiers(prev => {
            const newTiers = prev.filter((_, i) => i !== index);
            // Ensure the last tier in the new list is set to Infinity
            if (newTiers.length > 0) {
                newTiers[newTiers.length - 1].maxBalance = Infinity;
            }
            return newTiers;
        });
    };

    if (loading) {
        return (
            <div className="p-12 flex flex-col items-center justify-center text-gray-500">
                <Loader2 className="animate-spin mb-4" size={48} />
                <p>Loading configuration...</p>
            </div>
        );
    }

    if (!config) return <div className="p-12 text-center text-red-500">Failed to load configuration.</div>;

    return (
        <div className="space-y-6">
            <CardComponent>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Core Savings Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField label={`Minimum Deposit (${currency})`}>
                        <input 
                            type="number" 
                            value={config.minDepositAmount} 
                            onChange={e => handleConfigChange('minDepositAmount', Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                        />
                    </FormField>
                    <FormField label="Maximum Active Goals per Saver">
                        <input 
                            type="number" 
                            value={config.maxActiveGoalsPerSaver} 
                            onChange={e => handleConfigChange('maxActiveGoalsPerSaver', Number(e.target.value))}
                            min="1" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                        />
                    </FormField>
                    <div className="md:col-span-2">
                        <FormField label="Round-up Savings Rules">
                            <div className="flex items-center space-x-4 mt-2">
                                <div className="flex items-center">
                                    <input 
                                        type="checkbox" 
                                        checked={config.isRoundUpEnabled} 
                                        onChange={e => handleConfigChange('isRoundUpEnabled', e.target.checked)}
                                        className="h-4 w-4 rounded text-primary focus:ring-primary" 
                                        id="roundup_enable" 
                                    />
                                    <label htmlFor="roundup_enable" className="ml-2 text-sm">Enable Round-up</label>
                                </div>
                                <input 
                                    type="number" 
                                    value={config.roundUpNearestUnit}
                                    onChange={e => handleConfigChange('roundUpNearestUnit', Number(e.target.value))}
                                    disabled={!config.isRoundUpEnabled}
                                    placeholder={`Round to nearest ${currency}`} 
                                    className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100" 
                                />
                            </div>
                        </FormField>
                    </div>
                </div>
            </CardComponent>

            <CardComponent>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Interest Rate Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <FormField label="Calculation Method">
                        <div className="space-y-2 mt-2">
                            <div className="flex items-center">
                                <input 
                                    type="checkbox" 
                                    checked={config.isDailyInterestAccrualEnabled} 
                                    onChange={e => handleConfigChange('isDailyInterestAccrualEnabled', e.target.checked)}
                                    className="h-4 w-4 rounded text-primary focus:ring-primary" 
                                    id="daily_accrual" 
                                />
                                <label htmlFor="daily_accrual" className="ml-2 text-sm">Daily interest accrual on end-of-day balance</label>
                            </div>
                            <div className="flex items-center">
                                <input 
                                    type="checkbox" 
                                    checked={config.isCompoundInterestEnabled} 
                                    onChange={e => handleConfigChange('isCompoundInterestEnabled', e.target.checked)}
                                    className="h-4 w-4 rounded text-primary focus:ring-primary" 
                                    id="compound_interest" 
                                />
                                <label htmlFor="compound_interest" className="ml-2 text-sm">Compound interest calculation</label>
                            </div>
                            <div className="flex items-center">
                                <input 
                                    type="checkbox" 
                                    checked={config.is360DayYearBasisEnabled} 
                                    onChange={e => handleConfigChange('is360DayYearBasisEnabled', e.target.checked)}
                                    className="h-4 w-4 rounded text-primary focus:ring-primary" 
                                    id="360_day" 
                                />
                                <label htmlFor="360_day" className="ml-2 text-sm">360-day year basis</label>
                            </div>
                        </div>
                    </FormField>

                    <FormField label="Interest Application">
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500">Minimum Balance for Interest ({currency})</label>
                                <input 
                                    type="number" 
                                    value={config.minBalanceForInterest} 
                                    onChange={e => handleConfigChange('minBalanceForInterest', Number(e.target.value))}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                                />
                            </div>
                            <FormField label="Interest Posting">
                                <select 
                                    value={config.interestPostingFrequency} 
                                    onChange={e => handleConfigChange('interestPostingFrequency', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="MONTHLY">Monthly (last day of month)</option>
                                    <option value="QUARTERLY">Quarterly</option>
                                    <option value="ANNUALLY">Annually</option>
                                </select>
                            </FormField>
                            <div className="flex items-center pt-2">
                                <input 
                                    type="checkbox" 
                                    checked={config.isInterestStatementEnabled} 
                                    onChange={e => handleConfigChange('isInterestStatementEnabled', e.target.checked)}
                                    className="h-4 w-4 rounded text-primary focus:ring-primary" 
                                    id="gen_statement" 
                                />
                                <label htmlFor="gen_statement" className="ml-2 text-sm">Generate interest statement</label>
                            </div>
                            <div className="flex items-center">
                                <input 
                                    type="checkbox" 
                                    checked={config.isTaxDeductionApplicable} 
                                    onChange={e => handleConfigChange('isTaxDeductionApplicable', e.target.checked)}
                                    className="h-4 w-4 rounded text-primary focus:ring-primary" 
                                    id="tax_deduction" 
                                />
                                <label htmlFor="tax_deduction" className="ml-2 text-sm">Tax deduction applicable</label>
                            </div>
                             {config.isTaxDeductionApplicable && (
                                <div className="flex items-center space-x-2">
                                    <input 
                                        type="number" 
                                        value={config.withholdingTaxPercentage} 
                                        onChange={e => handleConfigChange('withholdingTaxPercentage', Number(e.target.value))}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" 
                                    />
                                    <span className="text-gray-600">% withholding tax</span>
                                </div>
                            )}
                        </div>
                    </FormField>
                </div>
                
                <div className="border-t border-gray-100 my-6"></div>

                <div>
                    <h4 className="text-md font-semibold text-gray-700 mb-4">Tiered Rate Structure</h4>
                    <div className="space-y-3">
                        {interestTiers.map((tier, index) => (
                            <div key={index} className="grid grid-cols-1 sm:grid-cols-[1fr,1fr,auto] gap-x-4 gap-y-2 items-center">
                                <div className="flex items-center space-x-2">
                                    <label className="text-sm text-gray-500 whitespace-nowrap">From {currency}</label>
                                    <input
                                        type="number"
                                        value={tier.minBalance}
                                        onChange={(e) => handleTierChange(index, 'minBalance', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary disabled:bg-gray-100"
                                        disabled={index > 0} // Min balance is usually set by previous row's max balance
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <label className="text-sm text-gray-500 whitespace-nowrap">To {currency}</label>
                                    <input
                                        type="text"
                                        value={tier.maxBalance === Infinity || tier.maxBalance === null ? 'Infinity' : tier.maxBalance}
                                        onChange={(e) => handleTierChange(index, 'maxBalance', e.target.value)}
                                        disabled={tier.maxBalance === Infinity}
                                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary ${tier.maxBalance === Infinity ? 'bg-gray-100 font-semibold cursor-not-allowed text-primary-dark' : 'bg-white'}`}
                                    />
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="number"
                                        step="0.0001"
                                        value={tier.ratePercentage}
                                        onChange={(e) => handleTierChange(index, 'ratePercentage', e.target.value)}
                                        className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                    <span className="text-gray-500">%</span>
                                    <button
                                        type="button"
                                        onClick={() => removeTier(index)}
                                        className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed p-2"
                                        disabled={interestTiers.length <= 1}
                                        title="Remove Tier"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={addTier}
                        className="mt-4 flex items-center space-x-2 text-primary font-semibold text-sm hover:text-primary-dark"
                    >
                        <Plus size={16}/>
                        <span>Add Tier</span>
                    </button>
                </div>
            </CardComponent>

            <CardComponent>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Withdrawal Configuration</h3>
                <div className="space-y-6">
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-2">General Withdrawal Settings</h4>
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <input 
                                    type="checkbox" 
                                    checked={config.isEmergencyWithdrawalEnabled} 
                                    onChange={e => handleConfigChange('isEmergencyWithdrawalEnabled', e.target.checked)}
                                    id="emergency_enabled" className="h-4 w-4 rounded text-primary focus:ring-primary" 
                                />
                                <label htmlFor="emergency_enabled" className="ml-2 text-sm">Enable Emergency Withdrawals</label>
                            </div>
                            <div className="flex items-center">
                                <input 
                                    type="checkbox" 
                                    checked={config.emergencyWithdrawalRequiresApproval} 
                                    onChange={e => handleConfigChange('emergencyWithdrawalRequiresApproval', e.target.checked)}
                                    id="emergency_approval" className="h-4 w-4 rounded text-primary focus:ring-primary" 
                                />
                                <label htmlFor="emergency_approval" className="ml-2 text-sm">Emergency Withdrawals Require Special Approval</label>
                            </div>
                            <div className="flex items-center">
                                <input 
                                    type="checkbox" 
                                    checked={config.emergencyWithdrawalRequiresJustification} 
                                    onChange={e => handleConfigChange('emergencyWithdrawalRequiresJustification', e.target.checked)}
                                    id="emergency_justification" className="h-4 w-4 rounded text-primary focus:ring-primary" 
                                />
                                <label htmlFor="emergency_justification" className="ml-2 text-sm">Emergency Withdrawals Require Justification</label>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Limits & Timings</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField label={`Instant Withdrawal Daily Limit (${currency})`}>
                                <input 
                                    type="number" 
                                    value={config.instantWithdrawalDailyLimit} 
                                    onChange={e => handleConfigChange('instantWithdrawalDailyLimit', Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </FormField>
                            <FormField label="Scheduled Withdrawal Advance Notice (hours)">
                                <input 
                                    type="number" 
                                    value={config.scheduledWithdrawalNoticeHours} 
                                    onChange={e => handleConfigChange('scheduledWithdrawalNoticeHours', Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                />
                            </FormField>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Fee Structure</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <FormField label="Instant Withdrawal Fee (%)">
                                <input 
                                    type="number" step="0.1" 
                                    value={config.instantWithdrawalFeePercent} 
                                    onChange={e => handleConfigChange('instantWithdrawalFeePercent', Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </FormField>
                            <FormField label={`Instant - Minimum Fee (${currency})`}>
                                <input 
                                    type="number" 
                                    value={config.instantMinFee} 
                                    onChange={e => handleConfigChange('instantMinFee', Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </FormField>
                            <div></div>
                            <FormField label="Scheduled Withdrawal Fee (%)">
                                <input 
                                    type="number" step="0.1" 
                                    value={config.scheduledWithdrawalFeePercent} 
                                    onChange={e => handleConfigChange('scheduledWithdrawalFeePercent', Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </FormField>
                            <FormField label={`Scheduled - Minimum Fee (${currency})`}>
                                <input 
                                    type="number" 
                                    value={config.scheduledMinFee} 
                                    onChange={e => handleConfigChange('scheduledMinFee', Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </FormField>
                            <div></div>
                             <FormField label="Emergency Withdrawal Fee (%)">
                                <input 
                                    type="number" step="0.1" 
                                    value={config.emergencyWithdrawalFeePercent} 
                                    onChange={e => handleConfigChange('emergencyWithdrawalFeePercent', Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </FormField>
                            <FormField label={`Emergency - Minimum Fee (${currency})`}>
                                <input 
                                    type="number" 
                                    value={config.emergencyMinFee} 
                                    onChange={e => handleConfigChange('emergencyMinFee', Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                />
                            </FormField>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-2">Free Withdrawals</h4>
                         <div className="flex items-center">
                            <input 
                                type="checkbox" 
                                checked={config.isFreeScheduledWithdrawalEnabled} 
                                onChange={e => handleConfigChange('isFreeScheduledWithdrawalEnabled', e.target.checked)}
                                id="free_withdrawal_enabled" className="h-4 w-4 rounded text-primary focus:ring-primary" 
                            />
                            <label htmlFor="free_withdrawal_enabled" className="ml-2 text-sm">Enable free scheduled withdrawal once per month</label>
                        </div>
                    </div>
                </div>
            </CardComponent>

             <CardComponent>
                <h3 className="text-lg font-bold text-gray-800 mb-4">KYC Document Requirements (FR-UM-003)</h3>
                <p className="text-sm text-gray-500 mb-6">Configure the required and alternative documents for user identity verification during onboarding.</p>

                <div className="space-y-8">
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-4">Required Documents</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {allDocumentTypes.map(doc => {
                                const isAlternativeChecked = config.alternativeKycDocumentTypeIds.includes(doc.id);
                                return (
                                    <div key={doc.id} className={`flex items-center p-3 border rounded-lg transition-colors ${isAlternativeChecked ? 'bg-gray-100 border-gray-200 opacity-60' : 'bg-gray-50 border-gray-200'}`}>
                                        <input 
                                            type="checkbox" 
                                            id={`req-${doc.id}`}
                                            checked={config.requiredKycDocumentTypeIds.includes(doc.id)}
                                            onChange={() => handleToggleKycId(doc.id, 'requiredKycDocumentTypeIds')}
                                            disabled={isAlternativeChecked}
                                            className={`h-4 w-4 rounded text-primary focus:ring-primary ${isAlternativeChecked ? 'cursor-not-allowed' : 'cursor-pointer'}`} 
                                        />
                                        <label htmlFor={`req-${doc.id}`} className={`ml-3 text-sm font-medium ${isAlternativeChecked ? 'text-gray-400 cursor-not-allowed' : 'text-gray-800 cursor-pointer'}`}>{doc.name}</label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold text-gray-700 mb-4">Alternative Documents</h4>
                        <p className="text-xs text-gray-500 mb-3">Documents accepted if the required ones are not available.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {allDocumentTypes.map(doc => {
                                const isRequiredChecked = config.requiredKycDocumentTypeIds.includes(doc.id);
                                return (
                                    <div key={doc.id} className={`flex items-center p-3 border rounded-lg transition-colors ${isRequiredChecked ? 'bg-gray-100 border-gray-200 opacity-60' : 'border-gray-200'}`}>
                                        <input 
                                            type="checkbox" 
                                            id={`alt-${doc.id}`}
                                            checked={config.alternativeKycDocumentTypeIds.includes(doc.id)}
                                            onChange={() => handleToggleKycId(doc.id, 'alternativeKycDocumentTypeIds')}
                                            disabled={isRequiredChecked}
                                            className={`h-4 w-4 rounded text-primary focus:ring-primary ${isRequiredChecked ? 'cursor-not-allowed' : 'cursor-pointer'}`} 
                                        />
                                        <label htmlFor={`alt-${doc.id}`} className={`ml-3 text-sm ${isRequiredChecked ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 cursor-pointer'}`}>{doc.name}</label>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </CardComponent>
            
            <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="mt-6 bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-primary-dark transition-all shadow-lg flex items-center justify-center disabled:opacity-50 min-w-[200px]"
            >
                {isSaving ? <Loader2 size={20} className="animate-spin mr-2"/> : null}
                Save Configuration
            </button>
        </div>
    );
};

const InvestorProductSettings: React.FC = () => (
    <div className="space-y-6">
        <CardComponent>
             <h3 className="text-lg font-bold text-gray-800 mb-4">Funding & Investment Rules</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Interest Rate Limits (%)">
                     <div className="flex space-x-2">
                        <input type="number" placeholder="Min" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                        <input type="number" placeholder="Max" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                </FormField>
                <FormField label="Repayment Period Limits (Months)">
                     <div className="flex space-x-2">
                        <input type="number" placeholder="Min" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                        <input type="number" placeholder="Max" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                </FormField>
                <div className="md:col-span-2">
                    <FormField label="Funding Bidding Rules">
                        <div className="flex items-center mt-2"><input type="checkbox" className="h-4 w-4 rounded text-primary focus:ring-primary" id="reject_unfunded" /><label htmlFor="reject_unfunded" className="ml-2 text-sm">Reject loan if total bids do not reach 100%</label></div>
                    </FormField>
                </div>
             </div>
        </CardComponent>
         <CardComponent>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Fees & Compliance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField label="Platform Fees (%)">
                    <input type="number" placeholder="e.g., 1.5" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                </FormField>
                 <FormField label="KYC Verification Requirements">
                    <div className="space-y-2 mt-2">
                        <div className="flex items-center"><input type="checkbox" className="h-4 w-4 rounded text-primary focus:ring-primary" id="kyc_id" /><label htmlFor="kyc_id" className="ml-2 text-sm">ID Verification</label></div>
                        <div className="flex items-center"><input type="checkbox" className="h-4 w-4 rounded text-primary focus:ring-primary" id="kyc_address" /><label htmlFor="kyc_address" className="ml-2 text-sm">Address Verification</label></div>
                    </div>
                </FormField>
            </div>
        </CardComponent>
        <button className="mt-6 bg-primary text-white font-semibold py-2 px-5 rounded-lg hover:bg-primary-dark transition-colors">Save Changes</button>
    </div>
);


const AdminSecurityTabContent: React.FC = () => {
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    return (
        <div className="space-y-6">
            <CardComponent>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Change Password</h3>
                <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-800 p-4 rounded-r-lg mb-6 flex justify-between items-start">
                    <div>
                        <p className="font-bold">Ensure that these requirements are met</p>
                        <p className="text-sm mt-1">Minimum 8 characters long, uppercase & symbol</p>
                    </div>
                    <button className="text-amber-800 hover:text-amber-900 -mt-1 -mr-1">
                        <X size={20} />
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                        <label className="text-sm font-medium text-gray-700">New Password</label>
                        <input 
                            type={showNewPassword ? 'text' : 'password'}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="············"
                        />
                        <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
                            {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                    <div className="relative">
                        <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="············"
                        />
                         <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
                            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>
                </div>
                <button className="mt-6 bg-primary text-white font-semibold py-2 px-5 rounded-lg hover:bg-primary-dark transition-colors">
                    Change Password
                </button>
            </CardComponent>
            
            <CardComponent>
                <h3 className="text-lg font-bold text-gray-800">Two-steps verification</h3>
                <p className="text-sm text-gray-500 mt-1 mb-4">Keep your account secure with authentication step.</p>
                <label className="text-sm font-semibold text-gray-700">SMS</label>
                <div className="flex items-center mt-1">
                    <input 
                        type="text"
                        defaultValue="+1(968) 819-2547"
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button className="px-3 py-2 border-t border-b border-gray-300 text-gray-500 hover:bg-gray-100 transition-colors"><Edit2 size={20} /></button>
                    <button className="px-3 py-2 border border-gray-300 rounded-r-lg text-gray-500 hover:bg-gray-100 transition-colors"><UserPlus size={20} /></button>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                    Two-factor authentication adds an additional layer of security to your account by requiring more than just a password to log in. <a href="#" className="text-primary font-semibold hover:underline">Learn more.</a>
                </p>
            </CardComponent>
        </div>
    );
};

const AdminSettingsPage: React.FC<{ currency: string }> = ({ currency }) => {
    const [activeTab, setActiveTab] = useState('Savings Products');
    
    const tabs = [
        { id: 'Loan Products', icon: <Briefcase size={18} /> },
        { id: 'Savings Products', icon: <PiggyBank size={18} /> },
        { id: 'Investor Products', icon: <TrendingUp size={18} /> },
        { id: 'Security', icon: <Shield size={18} /> },
    ];
    
    const renderContent = () => {
        switch (activeTab) {
            case 'Loan Products':
                return <LoanProductSettings />;
            case 'Savings Products':
                return <SavingsProductSettings currency={currency} />;
            case 'Investor Products':
                return <InvestorProductSettings />;
            case 'Security':
                return <AdminSecurityTabContent />;
            default:
                return null;
        }
    };
    
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1">
                <ConfigurationIllustrationCard />
            </div>
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-surface p-2 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex flex-wrap items-center gap-2">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-semibold ${
                                    activeTab === tab.id
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'text-gray-500 hover:bg-gray-100'
                                }`}
                            >
                                {tab.icon}
                                <span>{tab.id}</span>
                            </button>
                        ))}
                    </div>
                </div>
                {renderContent()}
            </div>
        </div>
    );
};

const ModuleConfigsPage: React.FC = () => {
    const { user, logout } = useAuth();
    const [profileData, setProfileData] = useState<ProfileApiResponse | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) return;
            try {
                const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/users/me`);
                const data = await response.json();
                if (data.success) setProfileData(data.data);
            } catch (e) { console.error(e); }
        };
        fetchProfile();
    }, [user]);

    if (!user) return <div className="text-center p-8">Loading...</div>;
  
	
	if (user.role === UserRole.PlatformAdmin) {
        return <AdminSettingsPage currency={profileData?.currency || 'TZS'} />;
    }    
    
    return null;
};

export default ModuleConfigsPage;
