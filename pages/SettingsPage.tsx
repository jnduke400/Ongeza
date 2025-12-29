
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

const AboutCard: React.FC<{ user: UserType, profileData: ProfileApiResponse }> = ({ user, profileData }) => {
    const formattedRole = formatApiString(profileData.roleName);

    const aboutItems = [
        { icon: <UserCircle2 size={20} />, label: 'Full Name', value: `${profileData.firstName} ${profileData.lastName}` },
        { icon: <CheckCircle size={20} />, label: 'Status', value: formatApiString(profileData.activity) },
        { icon: <Crown size={20} />, label: 'Role', value: formattedRole },
        { icon: <Flag size={20} />, label: 'Country', value: profileData.address?.country || 'N/A' },
        { icon: <Languages size={20} />, label: 'Language', value: profileData.preferredLanguage === 'sw' ? 'Swahili' : 'English' },
    ];
    const contactItems = [
        { icon: <Phone size={20} />, label: 'Contact', value: profileData.phoneNumber ? `${profileData.phoneNumber}` : 'N/A' },
        { icon: <MessageSquare size={20} />, label: 'Skype', value: 'admin.pesaflow' },
        { icon: <Mail size={20} />, label: 'Email', value: profileData.email },
    ];
    const teamItems = [
        { name: 'Backend Developer', members: 126 },
        { name: 'VueJS Developer', members: 98 },
    ];

    return (
        <div className="bg-surface text-on-surface p-6 rounded-2xl h-full border border-gray-100">
            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">About</h3>
            <ul className="space-y-3">
                {aboutItems.map(item => (
                    <li key={item.label} className="flex items-center">
                        <div className="text-primary mr-3">{item.icon}</div>
                        <span className="font-semibold text-gray-500 mr-2">{item.label}:</span>
                        <span className="capitalize text-gray-800">{item.value}</span>
                    </li>
                ))}
            </ul>

            <h3 className="text-sm font-semibold text-gray-500 uppercase mt-6 mb-4">Contacts</h3>
            <ul className="space-y-3">
                {contactItems.map(item => (
                    <li key={item.label} className="flex items-center">
                        <div className="text-primary mr-3">{item.icon}</div>
                        <span className="font-semibold text-gray-500 mr-2">{item.label}:</span>
                        <span className="text-gray-800">{item.value}</span>
                    </li>
                ))}
            </ul>

            <h3 className="text-sm font-semibold text-gray-500 uppercase mt-6 mb-4">Teams</h3>
            <ul className="space-y-3">
                {teamItems.map(team => (
                    <li key={team.name} className="flex items-center justify-between text-sm">
                        <span className="text-primary font-semibold">{team.name}</span>
                        <span className="bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded">{team.members} Members</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

const ActivityTimelineCard: React.FC = () => {
    const timelineItems = [
        { color: 'bg-blue-500', title: '12 Invoices have been paid', description: 'Invoices have been paid to the company.', attachment: { name: 'invoice.pdf' }, time: '12 min ago' },
        { color: 'bg-green-500', title: 'Client Meeting', description: 'Project meeting with john @10:15am', person: { name: 'Lester McCarthy (Client)', role: 'CEO of ThemeSelection', avatar: 'https://i.pravatar.cc/150?u=lester' }, time: '45 min ago' },
        { color: 'bg-cyan-500', title: 'Create a new project for client', description: '6 team members in a project', team: [ { avatar: 'https://i.pravatar.cc/150?u=team1' }, { avatar: 'https://i.pravatar.cc/150?u=team2' }, { avatar: 'https://i.pravatar.cc/150?u=team3' } ], time: '2 Day Ago' }
    ];

    return (
        <div className="bg-surface text-on-surface p-6 rounded-2xl h-full border border-gray-100">
            <div className="flex items-center mb-6">
                <BarChart2 size={20} className="text-gray-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-800">Activity Timeline</h3>
            </div>
            <div className="relative">
                <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                <ul className="space-y-8">
                    {timelineItems.map((item, index) => (
                        <li key={index} className="flex items-start">
                            <div className={`w-5 h-5 rounded-full ${item.color} flex-shrink-0 z-10 mr-4 border-4 border-surface`}></div>
                            <div className="flex-grow">
                                <div className="flex justify-between items-center">
                                    <p className="font-semibold text-gray-800">{item.title}</p>
                                    <span className="text-xs text-gray-500">{item.time}</span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                                {item.attachment && <div className="mt-3 flex items-center bg-gray-100 p-2 rounded-lg border border-gray-200"><FileIcon size={24} className="text-red-500 mr-3 flex-shrink-0" /><span className="text-sm font-medium text-gray-700">{item.attachment.name}</span></div>}
                                {item.person && <div className="mt-3 flex items-center"><img src={item.person.avatar} alt={item.person.name} className="w-8 h-8 rounded-full mr-3" /><div><p className="text-sm font-semibold text-gray-800">{item.person.name}</p><p className="text-xs text-gray-500">{item.person.role}</p></div></div>}
                                {item.team && <div className="mt-3 flex items-center"><div className="flex -space-x-2">{item.team.map((member, i) => <img key={i} src={member.avatar} alt="team member" className="w-8 h-8 rounded-full border-2 border-surface" />)}</div><div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 border-2 border-surface -ml-2">+3</div></div>}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

const EditTabContent: React.FC<{ user: UserType; profileData: ProfileApiResponse; onCancel: () => void; onSaveSuccess: () => void }> = ({ user, profileData, onCancel, onSaveSuccess }) => {
    const [profileImage, setProfileImage] = useState<string | null>(user.avatar);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        organization: profileData.organization || 'Themesselection',
        phone: profileData.phoneNumber || '',
        address: profileData.address?.street || '',
        state: profileData.address?.region || '',
        zipCode: profileData.address?.postalCode || '',
        country: profileData.address?.country || 'Tanzania',
        language: profileData.preferredLanguage || 'en',
        timezone: profileData.timezone || '(GMT-11:00) International Date Line West',
        currency: profileData.currency || 'USD',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) {
                alert('File size should not exceed 2MB.');
                return;
            }
            const reader = new FileReader();
            reader.onload = (event) => {
                setProfileImage(event.target?.result as string);
            };
            reader.readAsDataURL(file);
            setSelectedFile(file);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);

        try {
            if (selectedFile) {
                const imageFormData = new FormData();
                imageFormData.append('file', selectedFile);
                setIsUploadingImage(true);
                const imageResponse = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/users/me/profile-picture`, {
                    method: 'POST',
                    body: imageFormData,
                });
                const imageResult = await imageResponse.json();
                setIsUploadingImage(false);

                if (!imageResponse.ok || !imageResult.success) {
                    throw new Error(imageResult.message || 'Failed to upload profile picture.');
                }
            }

            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phoneNumber: formData.phone,
                organization: formData.organization,
                timezone: formData.timezone,
                currency: formData.currency,
                preferredLanguage: formData.language,
                dateOfBirth: profileData.dateOfBirth, 
                gender: profileData.gender,
                address: {
                    street: formData.address,
                    city: profileData.address?.city || 'New York',
                    region: formData.state,
                    country: formData.country,
                    postalCode: formData.zipCode
                }
            };

            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/users/me`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to update profile.');
            }

            alert('Changes saved successfully!');
            onSaveSuccess();
            onCancel(); 
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
            setIsUploadingImage(false);
        }
    };

    const countries = ['USA', 'Tanzania', 'UK', 'Canada', 'Australia'];
    const languages = [
        { label: 'English', value: 'en' },
        { label: 'Swahili', value: 'sw' }
    ];
    const timezones = ['(GMT-11:00) International Date Line West', '(GMT-08:00) Pacific Time (US & Canada)', '(GMT-05:00) Eastern Time (US & Canada)', '(GMT+03:00) Nairobi'];
    const currencies = ['USD', 'TZS', 'EUR', 'GBP'];

    return (
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 text-on-surface">
            {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 border-b border-gray-200 pb-6 mb-6">
                    <div className="relative">
                        <img src={profileImage || user.avatar} alt="Profile" className="w-24 h-24 rounded-lg object-cover"/>
                        {isUploadingImage && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                                <Loader2 className="animate-spin text-white" size={24} />
                            </div>
                        )}
                    </div>
                    <div className="flex-grow text-center sm:text-left">
                        <div className="flex items-center justify-center sm:justify-start space-x-3">
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm">Upload New Photo</button>
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/jpeg, image/png, image/gif" className="hidden" />
                            <button type="button" onClick={() => { setProfileImage(user.avatar); setSelectedFile(null); }} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg transition-colors text-sm">Reset</button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Allowed JPG, GIF or PNG. Max size of 2MB</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                    <div>
                        <label className="font-medium text-gray-700">First Name</label>
                        <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                        <label className="font-medium text-gray-700">Last Name</label>
                        <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                     <div>
                        <label className="font-medium text-gray-700">E-mail</label>
                        <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                     <div>
                        <label className="font-medium text-gray-700">Organization</label>
                        <input type="text" name="organization" value={formData.organization} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                     <div>
                        <label className="font-medium text-gray-700">Phone Number</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                     <div>
                        <label className="font-medium text-gray-700">Address</label>
                        <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                        <label className="font-medium text-gray-700">State</label>
                        <input type="text" name="state" value={formData.state} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                        <label className="font-medium text-gray-700">Zip Code</label>
                        <input type="text" name="zipCode" value={formData.zipCode} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                     <div>
                        <label className="font-medium text-gray-700">Country</label>
                        <select name="country" value={formData.country} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                            {countries.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="font-medium text-gray-700">Language</label>
                        <select name="language" value={formData.language} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                             {languages.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700">Timezone</label>
                        <select name="timezone" value={formData.timezone} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                            {timezones.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="font-medium text-gray-700">Currency</label>
                        <select name="currency" value={formData.currency} onChange={handleInputChange} className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                             {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                <div className="mt-6 flex items-center space-x-3">
                    <button type="submit" disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-5 rounded-lg transition-colors flex items-center disabled:bg-indigo-400">
                        {isSaving && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                        Save Changes
                    </button>
                    <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-5 rounded-lg transition-colors">Cancel</button>
                </div>
            </form>
        </div>
    );
};

const GoalsTabContent: React.FC<{ profileData: ProfileApiResponse | null }> = ({ profileData }) => {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [analytics, setAnalytics] = useState<GoalSettingsAnalytics | null>(null);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Initial state matching API structure
    const [schedule, setSchedule] = useState<{
        amount: number;
        frequency: 'DAILY' | 'WEEKLY' | 'BI_WEEKLY' | 'MONTHLY';
        dayOfWeek: string;
        timeOfDay: string;
        dayOfMonth: number;
        startDate: string;
        endDate: string;
        paymentSource: string;
    }>({
        amount: 5000,
        frequency: 'WEEKLY',
        dayOfWeek: 'FRIDAY',
        timeOfDay: '10:00',
        dayOfMonth: 15,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        paymentSource: 'MOBILE_MONEY',
    });

    // Options for dropdowns
    const FREQUENCY_OPTIONS = [
        { label: 'Daily', value: 'DAILY' },
        { label: 'Weekly', value: 'WEEKLY' },
        { label: 'Bi-Weekly', value: 'BI_WEEKLY' },
        { label: 'Monthly', value: 'MONTHLY' }
    ];

    const PAYMENT_SOURCE_OPTIONS = [
        { label: 'Mobile Money (Default)', value: 'MOBILE_MONEY' },
        { label: 'Card', value: 'CARD' }
    ];

    const DAYS_OF_WEEK = [
        { label: 'Monday', value: 'MONDAY' },
        { label: 'Tuesday', value: 'TUESDAY' },
        { label: 'Wednesday', value: 'WEDNESDAY' },
        { label: 'Thursday', value: 'THURSDAY' },
        { label: 'Friday', value: 'FRIDAY' },
        { label: 'Saturday', value: 'SATURDAY' },
        { label: 'Sunday', value: 'SUNDAY' }
    ];

    useEffect(() => {
        const fetchAnalyticsAndSettings = async () => {
            setLoading(true);
            try {
                // Fetch existing settings to populate view and edit form
                const settingsResponse = await interceptedFetch(`${API_BASE_URL}/api/v1/settings/automatic-contribution`);
                const settingsData = await settingsResponse.json();

                // Fetch analytics for "My Goals" card
                const analyticsResponse = await interceptedFetch(`${API_BASE_URL}/api/v1/goals/settings/analytics`);
                const analyticsData = await analyticsResponse.json();

                if (analyticsData.success) {
                    setAnalytics(analyticsData.data);
                }

                if (settingsData.success && settingsData.data) {
                    const data = settingsData.data;

                    const normalizeValue = (options: { label: string, value: string }[], incomingValue: string) => {
                        if (!incomingValue) return options[0].value;
                        const incoming = String(incomingValue).trim().toLowerCase();
                        const valueMatch = options.find(opt => opt.value.toLowerCase() === incoming);
                        if (valueMatch) return valueMatch.value;
                        const labelMatch = options.find(opt => opt.label.toLowerCase() === incoming);
                        if (labelMatch) return labelMatch.value;
                        if (incoming.includes('bi') && incoming.includes('weekly')) {
                            const biWeekly = options.find(opt => opt.value === 'BI_WEEKLY');
                            if (biWeekly) return biWeekly.value;
                        }
                        return options[0].value;
                    };

                    setSchedule({
                        amount: data.amount,
                        frequency: normalizeValue(FREQUENCY_OPTIONS, data.frequency) as any,
                        dayOfWeek: normalizeValue(DAYS_OF_WEEK, data.dayOfWeek || 'FRIDAY'),
                        timeOfDay: data.timeOfDay || '10:00',
                        dayOfMonth: data.dayOfMonth || 15,
                        startDate: data.startDate,
                        endDate: data.endDate || '',
                        paymentSource: normalizeValue(PAYMENT_SOURCE_OPTIONS, data.paymentSource)
                    });
                }
            } catch (e) {
                console.error("Error fetching goal settings", e);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalyticsAndSettings();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setSchedule(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        
        try {
            const payload = {
                amount: Number(schedule.amount),
                frequency: schedule.frequency,
                dayOfWeek: schedule.frequency === 'WEEKLY' ? schedule.dayOfWeek : null,
                dayOfMonth: schedule.frequency === 'MONTHLY' ? Number(schedule.dayOfMonth) : null,
                timeOfDay: (schedule.frequency === 'DAILY' || schedule.frequency === 'WEEKLY') ? schedule.timeOfDay : null,
                startDate: schedule.startDate,
                endDate: schedule.endDate || null,
                paymentSource: schedule.paymentSource
            };

            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/settings/automatic-contribution`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to update settings');
            }

            alert('Automated savings schedule updated!');
            setIsEditing(false);
            
            if (analytics) {
                setAnalytics({
                    ...analytics,
                    automatedContribution: {
                        ...analytics.automatedContribution!,
                        ...payload,
                        id: analytics.automatedContribution?.id || 0,
                        isActive: true
                    }
                });
            }

        } catch (error: any) {
            console.error("Update failed", error);
            alert(`Error: ${error.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    const renderFrequencyDetails = () => {
        const time = schedule.timeOfDay ? schedule.timeOfDay.substring(0, 5) : '';
        
        switch (schedule.frequency) {
            case 'DAILY': return `Every day at ${time}`;
            case 'WEEKLY': 
                const dayLabel = DAYS_OF_WEEK.find(d => d.value === schedule.dayOfWeek)?.label || schedule.dayOfWeek;
                return `Every ${dayLabel} at ${time}`;
            case 'BI_WEEKLY': return `Every 2 weeks`;
            case 'MONTHLY': return `On the ${schedule.dayOfMonth}th of each month`;
            default: return '';
        }
    };
    
    if (loading) {
        return <div className="p-8 text-center"><Loader2 className="animate-spin inline-block mr-2" /> Loading goal settings...</div>;
    }

    const currency = profileData?.currency || 'TZS';
    const formattedStartDate = new Date(schedule.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const formattedEndDate = schedule.endDate ? new Date(schedule.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : null;
    const paymentSourceLabel = PAYMENT_SOURCE_OPTIONS.find(opt => opt.value === schedule.paymentSource)?.label || schedule.paymentSource;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 space-y-6">
                 <div className="bg-surface text-on-surface p-6 rounded-2xl h-full border border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">My Goals</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-500">Active Goals</span>
                            <span className="font-bold text-gray-800">{analytics?.activeGoals || 0} / {analytics?.totalGoals || 0}</span>
                        </div>
                         <div className="flex justify-between items-center">
                            <span className="text-gray-500">Total Progress</span>
                            <span className="font-bold text-gray-800">{analytics?.progressPercentage || 0}%</span>
                        </div>
                        <button 
                            onClick={() => navigate('/goals')}
                            className="w-full mt-4 bg-primary text-white font-semibold py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            View All Goals
                        </button>
                    </div>
                </div>
            </div>
            <div className="md:col-span-2">
                 <div className="bg-surface text-on-surface p-6 rounded-2xl h-full border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-900">Automated Savings Contributions</h3>
                        {!isEditing && (
                            <button onClick={() => setIsEditing(true)} className="flex items-center space-x-2 text-primary font-semibold text-sm hover:text-primary-dark">
                                <Edit size={16} />
                                <span>Edit Schedule</span>
                            </button>
                        )}
                    </div>
                    {isEditing ? (
                        <form onSubmit={handleSave} className="space-y-4">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Amount ({currency})</label>
                                    <input type="number" name="amount" value={schedule.amount} onChange={handleInputChange} min="100" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Frequency</label>
                                    <select name="frequency" value={schedule.frequency} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                                        {FREQUENCY_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                </div>
                                {schedule.frequency === 'WEEKLY' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Day of Week</label>
                                        <select name="dayOfWeek" value={schedule.dayOfWeek} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                                            {DAYS_OF_WEEK.map(day => <option key={day.value} value={day.value}>{day.label}</option>)}
                                        </select>
                                    </div>
                                )}
                                {(schedule.frequency === 'DAILY' || schedule.frequency === 'WEEKLY') && (
                                     <div>
                                        <label className="block text-sm font-medium text-gray-700">Time</label>
                                        <input type="time" name="timeOfDay" value={schedule.timeOfDay} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                                    </div>
                                )}
                                 {schedule.frequency === 'MONTHLY' && (
                                     <div>
                                        <label className="block text-sm font-medium text-gray-700">Day of Month</label>
                                        <input type="number" name="dayOfMonth" value={schedule.dayOfMonth} onChange={handleInputChange} min="1" max="31" className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                                    <input type="date" name="startDate" value={schedule.startDate} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                                </div>
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
                                    <input type="date" name="endDate" value={schedule.endDate} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                                </div>
                                 <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Payment Source</label>
                                    <select name="paymentSource" value={schedule.paymentSource} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-transparent">{PAYMENT_SOURCE_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select>
                                </div>
                           </div>
                           <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 mt-4">
                                <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300">Cancel</button>
                                <button type="submit" disabled={isSaving} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark flex items-center">
                                    {isSaving && <Loader2 className="animate-spin mr-2 h-4 w-4" />}
                                    Save Changes
                                </button>
                           </div>
                        </form>
                    ) : (
                        <div className="space-y-4 text-gray-700">
                            <div className="flex items-center text-lg">
                                <DollarSign size={20} className="text-gray-500 mr-3"/>
                                <span className="font-bold text-gray-800">{currency} {schedule.amount.toLocaleString()}</span>
                            </div>
                             <div className="flex items-center">
                                <Clock size={18} className="text-gray-500 mr-3"/>
                                <span className="text-gray-600 capitalize">{renderFrequencyDetails()}</span>
                            </div>
                             <div className="flex items-center">
                                <Calendar size={18} className="text-gray-500 mr-3"/>
                                <span className="text-gray-600">Starts on {formattedStartDate}</span>
                                {formattedEndDate && <span className="text-gray-600 ml-1">, ends on {formattedEndDate}</span>}
                            </div>
                            <div className="flex items-center">
                                <CreditCard size={18} className="text-gray-500 mr-3"/>
                                <span className="text-gray-600">{paymentSourceLabel}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const TwoFactorAuthModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    challengeId: string;
    onSuccess: () => void;
}> = ({ isOpen, onClose, challengeId, onSuccess }) => {
    const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (isOpen) {
            setOtp(Array(6).fill(''));
            setError('');
            inputsRef.current[0]?.focus();
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const { value } = e.target;
        if (/^[0-9]$/.test(value) || value === '') {
            const newOtp = [...otp];
            newOtp[index] = value;
            setOtp(newOtp);
            if (value && index < 5) {
                inputsRef.current[index + 1]?.focus();
            }
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
            inputsRef.current[index - 1]?.focus();
        } else if (e.key === 'Backspace' && otp[index] !== '') {
            const newOtp = [...otp];
            newOtp[index] = '';
            setOtp(newOtp);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasteData.length === 6) {
            setOtp(pasteData.split(''));
            inputsRef.current[5]?.focus();
        }
    };

    const handleVerify = async () => {
        const fullOtp = otp.join('');
        if (fullOtp.length !== 6) {
            setError('Please enter a 6-digit code.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/confirm-change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ challengeId, otp: fullOtp }),
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Invalid OTP code.');
            }
            
            onSuccess();

        } catch (err: any) {
            setError(err.message);
            setOtp(Array(6).fill(''));
            inputsRef.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (otp.join('').length === 6) {
            handleVerify();
        }
    }, [otp]);


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 text-center border-b">
                    <h2 className="text-xl font-bold text-gray-800">Two-Factor Authentication</h2>
                    <p className="text-gray-500 mt-2 text-sm">A 6-digit verification code has been sent. Please enter it below.</p>
                </div>
                <div className="p-8">
                    <div className="flex justify-center gap-2 mb-4" onPaste={handlePaste}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { if(el) inputsRef.current[index] = el; }}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={digit}
                                onChange={e => handleChange(e, index)}
                                onKeyDown={e => handleKeyDown(e, index)}
                                className="w-12 h-14 text-center text-2xl font-semibold bg-gray-50 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition"
                            />
                        ))}
                    </div>
                    {error && <p className="text-red-500 text-sm text-center mt-4">{error}</p>}
                    <div className="mt-6 flex justify-center space-x-3">
                         <button onClick={onClose} className="bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
                        <button onClick={handleVerify} disabled={loading} className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-dark disabled:bg-primary/70 flex items-center justify-center min-w-[100px]">
                            {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Verify'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SaverSecurityTabContent: React.FC<{
    logout: () => Promise<void>;
    profileData: ProfileApiResponse;
}> = ({ logout, profileData }) => {
    const { user, update2FASetupStatus } = useAuth();
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
    const [challengeId, setChallengeId] = useState<string | null>(null);

    const [isEditing2FA, setIsEditing2FA] = useState(false);
    const [twoFaPhoneNumber, setTwoFaPhoneNumber] = useState('');
    const [initialTwoFaPhoneNumber, setInitialTwoFaPhoneNumber] = useState('');
    const [twoFaLoading, setTwoFaLoading] = useState(false);
    const [twoFaError, setTwoFaError] = useState('');
    const [twoFaSuccess, setTwoFaSuccess] = useState('');

    const [devices, setDevices] = useState<DeviceData[]>([]);

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await interceptedFetch(`${API_BASE_URL}/api/v1/devices`);
                const data = await response.json();
                if (data.success && data.data && Array.isArray(data.data.content)) {
                    setDevices(data.data.content);
                }
            } catch (error) {
                console.error("Failed to fetch devices", error);
            }
        };
        fetchDevices();
    }, []);

    const getDeviceIcon = (deviceType: string, os: string) => {
        const lowerType = deviceType.toLowerCase();
        const lowerOs = os.toLowerCase();
        if (lowerType.includes('mobile') || lowerOs.includes('android') || lowerOs.includes('ios')) {
             return <Smartphone size={20} className={lowerOs.includes('android') ? "text-green-500" : "text-gray-600"} />;
        }
        if (lowerType.includes('tablet')) {
            return <Tablet size={20} className="text-purple-500" />;
        }
        // Default to Monitor/Desktop/Laptop
        return <Monitor size={20} className={lowerOs.includes('windows') ? "text-blue-500" : "text-gray-700"} />;
    };

    useEffect(() => {
        const initialPhone = profileData.tfaPhoneNumber || '';
        setTwoFaPhoneNumber(initialPhone);
        setInitialTwoFaPhoneNumber(initialPhone);
    }, [profileData.phoneNumber]);
    
    const handleEdit2FA = () => {
        setIsEditing2FA(true);
        setTwoFaSuccess('');
        setTwoFaError('');
    };

    const handleCancel2FA = () => {
        setIsEditing2FA(false);
        setTwoFaPhoneNumber(initialTwoFaPhoneNumber);
        setTwoFaError('');
    };

    const handleSave2FA = async () => {
        if (!twoFaPhoneNumber.trim()) {
            setTwoFaError('Phone number cannot be empty.');
            return;
        }
        setTwoFaLoading(true);
        setTwoFaError('');
        setTwoFaSuccess('');
        try {
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/users/two-factor`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tfaPhoneNumber: twoFaPhoneNumber.replace(/\D/g, '') }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to update phone number.');
            }
            setTwoFaSuccess(data.message || 'Phone number updated successfully.');
            setInitialTwoFaPhoneNumber(twoFaPhoneNumber);
            setIsEditing2FA(false);
            if (user?.twoFaSetupRequired) {
                update2FASetupStatus(true);
            }
        } catch (err: any) {
            setTwoFaError(err.message);
        } finally {
            setLoading(false);
            setTwoFaLoading(false);
        }
    };


    const validatePassword = (password: string): boolean => {
        const hasUpperCase = /[A-Z]/.test(password);
        const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
        const hasMinLength = password.length >= 8;
        return hasUpperCase && hasSymbol && hasMinLength;
    };

    const handle2FASuccess = () => {
        setIs2FAModalOpen(false);
        setSuccessMessage("Password changed successfully. Please login again.");
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
            logout();
        }, 3000);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match.");
            return;
        }

        if (!validatePassword(newPassword)) {
            setError("Password must be at least 8 characters long, and include an uppercase letter and a symbol.");
            return;
        }

        setLoading(true);
        try {
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to change password.');
            }

            if (data.data?.challengeId) {
                setChallengeId(data.data.challengeId);
                setSuccessMessage(data.data.message || "Two-factor verification required.");
                setIs2FAModalOpen(true);
            } else {
                setSuccessMessage(data.data.message || "Password changed successfully. You will be logged out shortly.");
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                
                setTimeout(() => {
                    logout();
                }, 3000);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="space-y-6">
                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
                    <form onSubmit={handleSubmit}>
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Change Password</h3>
                        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
                        {successMessage && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">{successMessage}</div>}
                        <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-800 p-4 rounded-r-lg mb-6 flex justify-between items-start">
                            <div>
                                <p className="font-bold">Ensure that these requirements are met</p>
                                <p className="text-sm mt-1">Minimum 8 characters long, uppercase & symbol</p>
                            </div>
                            <button type="button" className="text-amber-800 hover:text-amber-900 -mt-1 -mr-1">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div className="relative">
                                <label className="text-sm font-medium text-gray-700">Current Password</label>
                                <input 
                                    type={showCurrentPassword ? 'text' : 'password'}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="············"
                                    required
                                />
                                <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
                                    {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative">
                                    <label className="text-sm font-medium text-gray-700">New Password</label>
                                    <input
                                        type={showNewPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="············"
                                        required
                                    />
                                    <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">{showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                                </div>
                                <div className="relative">
                                    <label className="text-sm font-medium text-gray-700">Confirm Password</label>
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                        placeholder="············"
                                        required
                                    />
                                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                                </div>
                            </div>
                        </div>
                        <button type="submit" disabled={loading} className="mt-6 bg-primary text-white font-semibold py-2 px-5 rounded-lg hover:bg-primary-dark transition-colors disabled:bg-primary-light">
                            {loading ? 'Saving...' : 'Change Password'}
                        </button>
                    </form>
                </div>

                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">Transaction PIN</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-4">
                        A 4-digit PIN used to quickly resume your session if it expires or authorize sensitive transactions.
                    </p>
                    
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className={`p-2 rounded-full ${profileData.pinSet ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                {profileData.pinSet ? <CheckCircle size={20} /> : <AlertTriangle size={20} />} 
                            </div>
                            <div>
                                <p className="font-semibold text-gray-800">Status: {profileData.pinSet ? 'Active' : 'Not Set'}</p>
                                <p className="text-xs text-gray-500">
                                    {profileData.pinSet ? 'Your PIN is set and secure.' : 'Set up a PIN to protect your account.'}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => navigate('/set-pin')} 
                            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 shadow-sm transition-colors"
                        >
                            {profileData.pinSet ? 'Change PIN' : 'Set PIN'}
                        </button>
                    </div>
                </div>

                <div id="two-factor-setup" className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800">Two-steps verification</h3>
                    <p className="text-sm text-gray-500 mt-1 mb-4">Keep your account secure with authentication step.</p>
                    
                    {twoFaError && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{twoFaError}</div>}
                    {twoFaSuccess && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4 text-sm">{twoFaSuccess}</div>}

                    {user?.twoFaSetupRequired ? (
                        <>
                            <label className="text-sm font-semibold text-gray-700">SMS</label>
                            <div className="flex items-center mt-1 space-x-2">
                                <input 
                                    type="text" 
                                    value={twoFaPhoneNumber}
                                    readOnly
                                    className="flex-grow px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                                />
                                <button type="button" onClick={handleSave2FA} disabled={twoFaLoading} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:bg-primary-light">
                                    {twoFaLoading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <label className="text-sm font-semibold text-gray-700">SMS</label>
                            <div className="flex items-center mt-1 space-x-2">
                                <input type="text" value={twoFaPhoneNumber} onChange={(e) => setTwoFaPhoneNumber(e.target.value)} disabled={!isEditing2FA} className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:text-gray-500" placeholder="+255..." />
                                {isEditing2FA ? (
                                    <>
                                        <button type="button" onClick={handleSave2FA} disabled={twoFaLoading} className="px-4 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-colors disabled:bg-primary-light">
                                            {twoFaLoading ? 'Saving...' : 'Save'}
                                        </button>
                                        <button type="button" onClick={handleCancel2FA} className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors">
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <button type="button" onClick={handleEdit2FA} className="px-3 py-2 border border-gray-300 rounded-lg text-gray-500 hover:bg-gray-100">
                                        <Edit2 size={20} />
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                    <p className="text-sm text-gray-500 mt-3">Two-factor authentication adds an additional layer of security to your account. <a href="#" className="text-primary font-semibold">Learn more.</a></p>
                </div>

                <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Recent devices</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs text-gray-500 uppercase border-b border-gray-200">
                                    <th className="py-3 px-4 font-semibold">Browser</th>
                                    <th className="py-3 px-4 font-semibold">Device</th>
                                    <th className="py-3 px-4 font-semibold">Recent Activity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {devices.map((device, index) => {
                                    const browserText = `${device.client} on ${device.operatingSystem}`;
                                    const formattedDate = new Date(device.lastActive).toLocaleString('en-US', { 
                                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                                    });

                                    return (
                                        <tr key={index} className="border-b border-gray-200 last:border-b-0">
                                            <td className="py-3 px-4">
                                                <div className="flex items-center">
                                                    {getDeviceIcon(device.deviceType, device.operatingSystem)}
                                                    <span className="ml-3 font-medium text-gray-700">
                                                        {browserText} {device.currentDevice && <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full font-semibold">Current</span>}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">
                                                <div>{device.deviceType}</div>
                                                {device.ipAddress && <div className="text-xs text-gray-400 mt-0.5">{device.ipAddress}</div>}
                                            </td>
                                            <td className="py-3 px-4 text-gray-600">{formattedDate}</td>
                                        </tr>
                                    );
                                })}
                                {devices.length === 0 && (
                                     <tr>
                                        <td colSpan={3} className="py-6 text-center text-gray-500">No recent devices found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            {challengeId && (
                <TwoFactorAuthModal
                    isOpen={is2FAModalOpen}
                    onClose={() => setIs2FAModalOpen(false)}
                    challengeId={challengeId}
                    onSuccess={handle2FASuccess}
                />
            )}
        </>
    );
};

interface NotificationSettingItem {
    push: boolean;
    email: boolean;
    sms: boolean;
}

interface NotificationSettings {
    account: NotificationSettingItem;
    goal: NotificationSettingItem;
    transaction: NotificationSettingItem;
    quietHours: { start: string; end: string } | null;
    language: { name: string; value: string };
}

type CategoryKey = 'account' | 'goal' | 'transaction';
type MethodKey = 'push' | 'email' | 'sms';

const NotificationSettings: React.FC = () => {
    const [settings, setSettings] = useState<NotificationSettings>({
        account: { push: false, email: false, sms: false },
        goal: { push: false, email: false, sms: false },
        transaction: { push: false, email: false, sms: false },
        quietHours: null,
        language: { name: 'English', value: 'en' },
    });
    
    const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
    const [tempQuietHours, setTempQuietHours] = useState({ start: '22:00', end: '07:00' });
    
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSettings = async () => {
            setLoading(true);
            try {
                const response = await interceptedFetch(`${API_BASE_URL}/api/v1/settings/notifications`);
                const result = await response.json();
                
                if (result.success && result.data) {
                    const data = result.data;
                    if (data.quietHours) {
                        setQuietHoursEnabled(true);
                        setTempQuietHours({
                            start: data.quietHours.start.substring(0, 5),
                            end: data.quietHours.end.substring(0, 5)
                        });
                    } else {
                        setQuietHoursEnabled(false);
                    }
                    setSettings(data);
                }
            } catch (err) {
                console.error("Failed to fetch notification settings", err);
                setError("Failed to load settings.");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleCategoryChange = (category: CategoryKey, method: MethodKey, value: boolean) => {
        setSettings(prev => ({
            ...prev,
            [category]: { ...prev[category], [method]: value }
        }));
    };

    const handleLanguageChange = (value: string) => {
        const name = value === 'sw' ? 'Swahili' : 'English';
        setSettings(prev => ({ ...prev, language: { name, value } }));
    };

    const handleQuietHoursToggle = (checked: boolean) => {
        setQuietHoursEnabled(checked);
        if (checked) {
            setSettings(prev => ({ ...prev, quietHours: { ...tempQuietHours } }));
        } else {
            setSettings(prev => ({ ...prev, quietHours: null }));
        }
    };

    const handleQuietHoursTimeChange = (field: 'start' | 'end', value: string) => {
        setTempQuietHours(prev => {
            const newTemp = { ...prev, [field]: value };
            if (quietHoursEnabled) {
                setSettings(curr => ({ ...curr, quietHours: { ...newTemp } }));
            }
            return newTemp;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError(null);
        try {
            const payload = {
                ...settings,
                quietHours: quietHoursEnabled ? {
                    start: tempQuietHours.start.length === 5 ? `${tempQuietHours.start}:00` : tempQuietHours.start,
                    end: tempQuietHours.end.length === 5 ? `${tempQuietHours.end}:00` : tempQuietHours.end,
                } : null
            };
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/settings/notifications`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const result = await response.json();
            if (response.ok && result.success) {
                alert('Notification settings updated successfully');
            } else {
                throw new Error(result.message || 'Failed to update settings');
            }
        } catch (err: any) {
            console.error("Update failed", err);
            alert(err.message || 'An error occurred while saving settings.');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary" size={32} /></div>;
    }

    const categories: { key: CategoryKey; label: string }[] = [
        { key: 'account', label: 'Account Notifications' },
        { key: 'goal', label: 'Goals Notifications' },
        { key: 'transaction', label: 'Transactions Notifications' },
    ];
    const methods: MethodKey[] = ['push', 'email', 'sms'];

    return (
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 text-on-surface">
            <h3 className="text-xl font-bold text-gray-800 mb-6">Notification Settings</h3>
            <form onSubmit={handleSubmit}>
                <div className="space-y-8">
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-4">By Category</h4>
                        <div className="space-y-4">
                            {categories.map((cat) => (
                                <div key={cat.key} className="p-4 border border-gray-200 rounded-lg bg-gray-50/50">
                                    <p className="font-medium text-gray-800 capitalize mb-3">{cat.label}</p>
                                    <div className="flex flex-wrap gap-x-6 gap-y-2">
                                        {methods.map(method => (
                                            <label key={`${cat.key}-${method}`} className="flex items-center space-x-2 text-sm cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    checked={(settings[cat.key] as NotificationSettingItem)[method]} 
                                                    onChange={(e) => handleCategoryChange(cat.key, method, e.target.checked)} 
                                                    className="h-4 w-4 text-primary rounded focus:ring-primary border-gray-300"
                                                />
                                                <span className="uppercase text-xs font-medium text-gray-600">{method}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-semibold text-gray-700 mb-4">General Settings</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Language</label>
                                <select 
                                    value={settings.language.value} 
                                    onChange={e => handleLanguageChange(e.target.value)} 
                                    className="w-full mt-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                >
                                    <option value="en">English</option>
                                    <option value="sw">Swahili</option>
                                </select>
                            </div>
                            <div className="space-y-4">
                                <label className="flex items-center cursor-pointer select-none">
                                    <div className="relative">
                                        <input type="checkbox" checked={quietHoursEnabled} onChange={e => handleQuietHoursToggle(e.target.checked)} className="sr-only peer" />
                                        <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-primary/20 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </div>
                                    <span className="ml-3 text-sm font-medium text-gray-700">Quiet Hours</span>
                                </label>
                                {quietHoursEnabled && (
                                    <div className="flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-500 mb-1">From</label>
                                            <input type="time" value={tempQuietHours.start} onChange={e => handleQuietHoursTimeChange('start', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs text-gray-500 mb-1">To</label>
                                            <input type="time" value={tempQuietHours.end} onChange={e => handleQuietHoursTimeChange('end', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"/>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                    <button type="submit" disabled={isSaving} className="bg-primary text-white font-semibold py-2 px-6 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-70 flex items-center">
                        {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
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

const SaverSettingsPage: React.FC = () => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState('Profile');
    const { user, logout } = useAuth();
    const [profileData, setProfileData] = useState<ProfileApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (location.hash === '#two-factor-setup') {
            setActiveTab('Security');
            setTimeout(() => {
                const element = document.getElementById('two-factor-setup');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }
    }, [location]);

    const fetchProfile = async () => {
        if (!user) { setLoading(false); return; }
        setLoading(true); setError(null);
        try {
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/users/me`);
            const data = await response.json();
            if (!response.ok || !data.success) throw new Error(data.message || 'Failed to fetch profile data.');
            setProfileData(data.data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [user]);
    
    const TABS = [
        { id: 'Profile', icon: <User size={18} />, label: 'Profile' },
        { id: 'Edit', icon: <Edit size={18} />, label: 'Edit' },
        { id: 'Goals', icon: <Target size={18} />, label: 'Goals' },
        { id: 'Payments', icon: <CreditCard size={18} />, label: 'Payments' },
        { id: 'Security', icon: <Shield size={18} />, label: 'Security' },
        { id: 'Notifications', icon: <Bell size={18} />, label: 'Notifications' },
    ];
    
    if (!user) return <div className="p-8 text-center">Loading user profile...</div>;

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-primary" /></div>;
    if (error || !profileData) return <div className="p-8 text-center text-red-500">Error: {error || 'Could not load profile settings.'}</div>;

    const formattedRole = user.role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    const headerDetails = { 
        location: profileData.address?.region || 'Tanzania', 
        joinDate: new Date(profileData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }), 
        title: formattedRole 
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'Profile':
                return (
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <AboutCard user={user} profileData={profileData} />
                        </div>
                        <div className="lg:col-span-2">
                            <ActivityTimelineCard />
                        </div>
                    </div>
                );
            case 'Edit':
                return (
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <AboutCard user={user} profileData={profileData} />
                        </div>
                        <div className="lg:col-span-2">
                            <EditTabContent user={user} profileData={profileData} onCancel={() => setActiveTab('Profile')} onSaveSuccess={fetchProfile} />
                        </div>
                    </div>
                );
            case 'Goals': return <div className="mt-8"><GoalsTabContent profileData={profileData} /></div>;
            case 'Payments': return <div className="mt-8"><PaymentsTabContent onNavigateToTab={setActiveTab} /></div>;
            case 'Security':
                return (
                    <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <AboutCard user={user} profileData={profileData} />
                        </div>
                        <div className="lg:col-span-2">
                            <SaverSecurityTabContent logout={logout} profileData={profileData} />
                        </div>
                    </div>
                );
            case 'Notifications': return <div className="mt-8"><NotificationSettings /></div>;
            default: return <div className="p-8 text-center">Content not found</div>;
        }
    };

    return (
        <div className="bg-background text-on-surface">
            <div className="h-48 w-full rounded-2xl bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-300"></div>
            <div className="bg-surface text-on-surface rounded-2xl p-6 relative -mt-16 mx-4 border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row items-center md:items-end">
                    <div className="relative -mt-20 mb-4 md:mb-0">
                        <img src={user.avatar} alt={`${user.firstName} ${user.lastName}`} className="w-36 h-36 rounded-2xl object-cover border-4 border-surface"/>
                         <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-600 rounded-full border-2 border-surface flex items-center justify-center">
                            <div className="w-4 h-4 bg-purple-400 rounded-full"></div>
                        </div>
                    </div>
                    <div className="md:ml-6 text-center md:text-left flex-grow">
                        <h1 className="text-3xl font-bold text-gray-800">{`${user.firstName} ${user.lastName}`}</h1>
                        <div className="flex flex-wrap justify-center md:justify-start items-center space-x-4 text-gray-500 mt-2">
                            <div className="flex items-center space-x-1.5"><Palette size={16} /><span>{headerDetails.title}</span></div>
                            <div className="flex items-center space-x-1.5"><MapPin size={16} /><span>{headerDetails.location}</span></div>
                            <div className="flex items-center space-x-1.5"><Calendar size={16} /><span>Joined {headerDetails.joinDate}</span></div>
                        </div>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <button className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-5 rounded-lg flex items-center space-x-2 transition-colors">
                           <Check size={18}/><span>Connected</span>
                        </button>
                    </div>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200 flex items-center space-x-2 overflow-x-auto">
                   {TABS.map(tab => (<TabButton key={tab.id} icon={tab.icon} label={tab.label} isActive={activeTab === tab.id} onClick={() => setActiveTab(tab.id)}/>))}
                </div>
            </div>
            <div className="px-4">
                {renderContent()}
            </div>
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

const SettingsPage: React.FC = () => {
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
    
    if (user.role === UserRole.Saver || user.role === UserRole.GroupAdmin) {
        return <SaverSettingsPage />;
    }
	
	if (user.role === UserRole.PlatformAdmin) {
        return <AdminSettingsPage currency={profileData?.currency || 'TZS'} />;
    }    
    
    return null;
};

export default SettingsPage;
