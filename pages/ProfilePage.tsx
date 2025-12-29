import React, { useState, useEffect, useRef } from 'react';
import {
    Shield, Eye, EyeOff, Edit2, UserPlus, X, Monitor, Smartphone, Tablet,
    Palette, MapPin, Calendar, User, UserCircle2, CheckCircle, Crown, Flag, Languages, Phone, Mail, MessageSquare,
    BarChart2, FileText as FileIcon, Check, Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { User as UserType } from '../types';
import { API_BASE_URL } from '../services/apiConfig';
import { interceptedFetch } from '../services/api';
import { useLocation } from 'react-router-dom';

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
    address: {
        country: string;
        region: string;
        district: string;
        street: string;
        postalCode: string;
    };
}

// --- 2FA Modal Component START ---
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
// --- 2FA Modal Component END ---


// --- Skeleton components START ---
const ProfileHeaderSkeleton: React.FC = () => (
    <div className="animate-pulse">
        <div className="h-48 w-full rounded-2xl bg-gray-200"></div>
        <div className="bg-surface rounded-2xl p-6 relative -mt-16 mx-4 border border-gray-100 shadow-sm">
            <div className="flex flex-col md:flex-row items-center md:items-end">
                <div className="relative -mt-20 mb-4 md:mb-0">
                    <div className="w-36 h-36 rounded-2xl bg-gray-200 border-4 border-surface"></div>
                </div>
                <div className="md:ml-6 text-center md:text-left flex-grow">
                    <div className="h-9 bg-gray-200 rounded w-48 mx-auto md:mx-0"></div>
                    <div className="flex flex-wrap justify-center md:justify-start items-center space-x-4 mt-3">
                        <div className="h-5 bg-gray-200 rounded w-32"></div>
                        <div className="h-5 bg-gray-200 rounded w-24"></div>
                        <div className="h-5 bg-gray-200 rounded w-36"></div>
                    </div>
                </div>
                <div className="mt-4 md:mt-0">
                    <div className="h-10 bg-gray-200 rounded-lg w-36"></div>
                </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200 flex items-center space-x-2">
                <div className="h-10 bg-gray-200 rounded-lg w-24"></div>
                <div className="h-10 bg-gray-200 rounded-lg w-28"></div>
            </div>
        </div>
    </div>
);

const AboutCardSkeleton: React.FC = () => (
    <div className="bg-surface text-on-surface p-6 rounded-2xl h-full border border-gray-100 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center">
                    <div className="w-5 h-5 bg-gray-200 rounded-full mr-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
            ))}
        </div>

        <div className="h-4 bg-gray-200 rounded w-1/4 mt-8 mb-6"></div>
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center">
                    <div className="w-5 h-5 bg-gray-200 rounded-full mr-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
            ))}
        </div>
        
        <div className="h-4 bg-gray-200 rounded w-1/4 mt-8 mb-6"></div>
        <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                </div>
            ))}
        </div>
    </div>
);

const ActivityTimelineSkeleton: React.FC = () => (
     <div className="bg-surface text-on-surface p-6 rounded-2xl h-full border border-gray-100 animate-pulse">
        <div className="flex items-center mb-6">
            <div className="w-5 h-5 bg-gray-200 rounded mr-3"></div>
            <div className="h-5 bg-gray-200 rounded w-1/3"></div>
        </div>
        <div className="relative">
            <div className="absolute left-2.5 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            <div className="space-y-8">
                {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-start">
                        <div className="w-5 h-5 bg-gray-200 rounded-full flex-shrink-0 z-10 mr-4"></div>
                        <div className="flex-grow">
                            <div className="flex justify-between items-center">
                                <div className="h-5 bg-gray-200 rounded w-1/2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                            </div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mt-2"></div>
                            <div className="h-10 bg-gray-200 rounded-lg mt-3"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const ProfilePageSkeleton: React.FC = () => (
    <div className="bg-background text-on-surface">
        <ProfileHeaderSkeleton />
        <div className="px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1"><AboutCardSkeleton /></div>
            <div className="lg:col-span-2"><ActivityTimelineSkeleton /></div>
        </div>
    </div>
);
// --- Skeleton components END ---


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

const formatPhoneNumber = (phone: string): string => {
    if (!phone) return 'N/A';
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('255') && cleaned.length === 12) {
        return `+${cleaned.substring(0, 3)} ${cleaned.substring(3, 6)} ${cleaned.substring(6, 9)} ${cleaned.substring(9, 12)}`;
    }
    return `+${phone}`;
};

const TabButton: React.FC<{
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-sm font-semibold ${
                isActive
                    ? 'bg-primary text-white shadow-md'
                    : 'text-gray-500 hover:bg-gray-100'
            }`}
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
        { icon: <Phone size={20} />, label: 'Contact', value: profileData.phoneNumber ? formatPhoneNumber(profileData.phoneNumber) : 'N/A' },
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

interface SecurityTabContentProps {
    logout: () => Promise<void>;
    profileData: ProfileApiResponse;
}

const SecurityTabContent: React.FC<SecurityTabContentProps> = ({ logout, profileData }) => {
    const { user, update2FASetupStatus } = useAuth();
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

    // New state for 2FA phone number
    const [isEditing2FA, setIsEditing2FA] = useState(false);
    const [twoFaPhoneNumber, setTwoFaPhoneNumber] = useState('');
    const [initialTwoFaPhoneNumber, setInitialTwoFaPhoneNumber] = useState('');
    const [twoFaLoading, setTwoFaLoading] = useState(false);
    const [twoFaError, setTwoFaError] = useState('');
    const [twoFaSuccess, setTwoFaSuccess] = useState('');

    useEffect(() => {
        // Favor tfaPhoneNumber from API
        const initialPhone = profileData.tfaPhoneNumber || profileData.phoneNumber || '';
        setTwoFaPhoneNumber(initialPhone);
        setInitialTwoFaPhoneNumber(initialPhone);
    }, [profileData.tfaPhoneNumber, profileData.phoneNumber]);
    
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
                body: JSON.stringify({ phoneNumber: twoFaPhoneNumber.replace(/\D/g, '') }),
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
                // Case 1: 2FA is required
                setChallengeId(data.data.challengeId);
                setSuccessMessage(data.data.message || "Two-factor verification required.");
                setIs2FAModalOpen(true);
            } else {
                // Case 2: 2FA is not required, password changed successfully
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
                                    onChange={(e) => setTwoFaPhoneNumber(e.target.value)}
                                    className="flex-grow px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="+255..."
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


const ProfilePage: React.FC = () => {
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
                    element.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2', 'transition-shadow', 'duration-1000', 'ease-in-out', 'rounded-2xl');
                    setTimeout(() => {
                        element.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2', 'transition-shadow', 'duration-1000', 'ease-in-out', 'rounded-2xl');
                    }, 2500);
                }
            }, 100);
        }
    }, [location]);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            setLoading(true);
            setError(null);
            try {
                // Assuming a /users/profile endpoint for the current user
                const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/users/me`);
                const data = await response.json();
                if (!response.ok || !data.success) {
                    throw new Error(data.message || 'Failed to fetch profile data.');
                }
                setProfileData(data.data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);

    if (loading) {
        return <ProfilePageSkeleton />;
    }

    if (error || !user || !profileData) {
        return <div className="p-8 text-center text-red-500">Error: {error || 'Could not load profile.'}</div>;
    }

    const formattedRole = formatApiString(profileData.roleName);
    const headerDetails = {
        location: profileData.address?.region || 'Tanzania',
        joinDate: new Date(profileData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        title: formattedRole,
    };
    
    const TABS = [
        { id: 'Profile', icon: <User size={18} />, label: 'Profile' },
        { id: 'Security', icon: <Shield size={18} />, label: 'Security' },
    ];

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
            case 'Security':
                return (
                     <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-1">
                            <AboutCard user={user} profileData={profileData} />
                        </div>
                        <div className="lg:col-span-2">
                            <SecurityTabContent logout={logout} profileData={profileData} />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-background text-on-surface">
            {/* Banner */}
            <div className="h-48 w-full rounded-2xl bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-300"></div>

            {/* Profile Info Section */}
            <div className="bg-surface text-on-surface rounded-2xl p-6 relative -mt-16 mx-4 border border-gray-100 shadow-sm">
                <div className="flex flex-col md:flex-row items-center md:items-end">
                    {/* Profile Picture */}
                    <div className="relative -mt-20 mb-4 md:mb-0">
                        <img
                            src={user.avatar}
                            alt={`${profileData.firstName} ${profileData.lastName}`}
                            className="w-36 h-36 rounded-2xl object-cover border-4 border-surface"
                        />
                         <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-600 rounded-full border-2 border-surface flex items-center justify-center">
                            <div className="w-4 h-4 bg-purple-400 rounded-full"></div>
                        </div>
                    </div>

                    {/* User Details */}
                    <div className="md:ml-6 text-center md:text-left flex-grow">
                        <h1 className="text-3xl font-bold text-gray-800">{`${profileData.firstName} ${profileData.lastName}`}</h1>
                        <div className="flex flex-wrap justify-center md:justify-start items-center space-x-4 text-gray-500 mt-2">
                            <div className="flex items-center space-x-1.5">
                                <Palette size={16} />
                                <span>{headerDetails.title}</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <MapPin size={16} />
                                <span>{headerDetails.location}</span>
                            </div>
                            <div className="flex items-center space-x-1.5">
                                <Calendar size={16} />
                                <span>Joined {headerDetails.joinDate}</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <div className="mt-4 md:mt-0">
                        <button className="bg-primary hover:bg-primary-dark text-white font-semibold py-2 px-5 rounded-lg flex items-center space-x-2 transition-colors">
                           <Check size={18}/>
                           <span>Connected</span>
                        </button>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="mt-6 pt-6 border-t border-gray-200 flex items-center space-x-2">
                   {TABS.map(tab => (
                       <TabButton
                           key={tab.id}
                           icon={tab.icon}
                           label={tab.label}
                           isActive={activeTab === tab.id}
                           onClick={() => setActiveTab(tab.id)}
                       />
                   ))}
                </div>
            </div>
            
             {/* Tab Content */}
            <div className="px-4">
                {renderContent()}
            </div>
        </div>
    );
};

export default ProfilePage;