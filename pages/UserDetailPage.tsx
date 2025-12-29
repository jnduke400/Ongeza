import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Shield, Bell, MoreVertical, Search, ChevronLeft, ChevronRight, Target, Loader2, CheckCircle, AlertTriangle, DollarSign, Smartphone, Monitor, Tablet, X } from 'lucide-react';
import { UserDetail, UserGoal } from '../types';
import { API_BASE_URL } from '../services/apiConfig';
import { interceptedFetch } from '../services/api';

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

const formatApiString = (str: string | null | undefined): string => {
    if (!str) return '';
    return str
        .replace(/_/g, ' ')
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const getGoalIcon = (iconStr: string | null) => {
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

const SuspendConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    userName: string;
    isSuspending: boolean;
}> = ({ isOpen, onClose, onConfirm, userName, isSuspending }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-50 mb-4">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Suspend Account?</h3>
                    <p className="text-gray-500 mt-2">
                        Are you sure you want to suspend <span className="font-bold text-gray-800">{userName}</span>? This user will immediately lose access to all platform features.
                    </p>
                </div>
                <div className="p-6 bg-gray-50 flex flex-col sm:flex-row gap-3 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        disabled={isSuspending}
                        className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isSuspending}
                        className="flex-1 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-all flex items-center justify-center shadow-lg shadow-red-200 active:scale-95 disabled:bg-red-400"
                    >
                        {isSuspending ? <Loader2 size={20} className="animate-spin" /> : 'Suspend User'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const SuccessModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
}> = ({ isOpen, onClose, title, message }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-50 mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                    <p className="text-gray-500 mt-2">{message}</p>
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="w-full bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary-dark transition-all active:scale-[0.98]"
                    >
                        Great, thanks!
                    </button>
                </div>
            </div>
        </div>
    );
};

const UserInfoCard: React.FC<{ 
    user: UserDetail; 
    totalSuccessfulDeposits: number;
    totalApprovals: number;
    totalGoals: number;
    onActivate: () => void;
    onSuspend: () => void;
    isActivating: boolean;
    isSuspending: boolean;
}> = ({ user, totalSuccessfulDeposits, totalApprovals, totalGoals, onActivate, onSuspend, isActivating, isSuspending }) => {
    const categoryRaw = user.category?.toUpperCase() || '';
    const isSaver = categoryRaw === 'SAVER';
    const isAdmin = categoryRaw === 'ADMIN' || categoryRaw === 'PLATFORM_ADMIN';
    
    const taskValue = isSaver ? totalSuccessfulDeposits : (isAdmin ? totalApprovals : 0);
    const taskLabel = isSaver ? "Deposits Made" : "Tasks Done";
    
    const activityStatus = user.status?.toUpperCase() || '';
    const isActive = activityStatus === 'ACTIVE';
    const isSuspended = activityStatus === 'SUSPENDED';

    return (
        <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="flex-grow">
                <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                        <img src={user.user.avatar} alt={user.user.name} className="w-28 h-28 rounded-full object-cover border-4 border-white shadow-sm" />
                        <span className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-surface ${isActive ? 'bg-green-500' : isSuspended ? 'bg-red-500' : 'bg-gray-400'}`}></span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">{user.user.name}</h2>
                    <div className="flex flex-col items-center gap-1 mt-2">
                        <span className="bg-primary-light/60 text-primary-dark font-semibold px-3 py-1 text-xs rounded-full uppercase tracking-wider">{user.role}</span>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{user.category}</span>
                    </div>
                </div>

                <div className="flex justify-around my-6">
                    <div className="text-center px-2">
                        <p className="text-xl font-bold text-gray-800">{taskValue.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{taskLabel}</p>
                    </div>
                    <div className="text-center px-2 border-l border-gray-100">
                        <p className="text-xl font-bold text-gray-800">{totalGoals}</p>
                        <p className="text-sm text-gray-500">Goals Completed</p>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-6">
                    <h3 className="font-semibold text-lg text-gray-800 mb-3">Details</h3>
                    <ul className="space-y-2 text-sm">
                        {Object.entries(user.details).map(([key, value]) => (
                            <li key={key} className="flex justify-between">
                                <span className="font-medium text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                <span className="text-gray-700 text-right font-medium">{value}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            
            <div className="mt-8 flex space-x-3">
                <button 
                    onClick={onActivate}
                    disabled={isActive || isActivating}
                    className={`flex-1 font-bold py-3 rounded-xl transition-all flex items-center justify-center shadow-sm ${
                        isActive 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 shadow-none' 
                        : 'bg-primary text-white hover:bg-primary-dark active:scale-95'
                    }`}
                >
                    {isActivating ? <Loader2 size={18} className="animate-spin" /> : 'Activate'}
                </button>
                <button 
                    onClick={onSuspend}
                    disabled={isSuspended || isSuspending}
                    className={`flex-1 font-bold py-3 rounded-xl transition-all border flex items-center justify-center ${
                        isSuspended
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                        : 'bg-white text-red-600 border-red-100 hover:bg-red-50 active:scale-95'
                    }`}
                >
                    Suspend
                </button>
            </div>
        </div>
    );
};

const UserInfoCardSkeleton: React.FC = () => (
    <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col animate-pulse h-full">
        <div className="flex-grow">
            <div className="flex flex-col items-center text-center">
                <div className="relative mb-4">
                    <div className="w-28 h-28 rounded-full bg-gray-200"></div>
                </div>
                <div className="h-7 bg-gray-200 rounded w-40 mb-2"></div>
                <div className="h-5 bg-gray-200 rounded-full w-24"></div>
            </div>
            <div className="flex justify-around my-6">
                <div className="text-center">
                    <div className="h-5 bg-gray-200 rounded w-12 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="text-center">
                    <div className="h-5 bg-gray-200 rounded w-12 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
            </div>
            <div className="border-t border-gray-100 pt-6">
                <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
                <ul className="space-y-3 text-sm">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <li key={i} className="flex justify-between">
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
        <div className="mt-8 flex space-x-3">
            <div className="flex-1 h-12 bg-gray-200 rounded-xl"></div>
            <div className="flex-1 h-12 bg-gray-200 rounded-xl"></div>
        </div>
    </div>
);

const GoalsList: React.FC<{ 
    goals: any[]; 
    loading: boolean;
    onSearch: (query: string) => void;
    onEntriesChange: (size: number) => void;
    entriesToShow: number;
    pagination: { totalElements: number; totalPages: number; currentPage: number };
}> = ({ goals, loading, onSearch, onEntriesChange, entriesToShow, pagination }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        onSearch(e.target.value);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            setSelectedRows(goals.map(g => g.id));
        } else {
            setSelectedRows([]);
        }
    };

    const handleSelectRow = (id: number) => {
        setSelectedRows(prev => 
            prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
        );
    };

    return (
         <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                <h3 className="font-bold text-2xl text-gray-800">Goals List</h3>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>Show</span>
                        <select 
                            value={entriesToShow}
                            onChange={(e) => onEntriesChange(Number(e.target.value))}
                            className="bg-white border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                        </select>
                    </div>
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search Goal"
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                        />
                    </div>
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm text-left">
                    <thead>
                        <tr className="border-b border-gray-200 text-[11px] text-gray-400 uppercase tracking-widest font-bold">
                            <th className="pb-4 w-12 text-center">
                                <input 
                                    type="checkbox" 
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                    onChange={handleSelectAll}
                                    checked={goals.length > 0 && selectedRows.length === goals.length}
                                />
                            </th>
                            <th className="pb-4 px-4">GOAL</th>
                            <th className="pb-4 px-4">PROGRESS</th>
                            <th className="pb-4 px-4 text-center">ACTION</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="py-6"><div className="h-4 bg-gray-100 rounded w-4 mx-auto"></div></td>
                                    <td className="py-6"><div className="h-10 bg-gray-100 rounded w-48"></div></td>
                                    <td className="py-6"><div className="h-4 bg-gray-100 rounded w-32"></div></td>
                                    <td className="py-6"><div className="h-8 bg-gray-100 rounded-full w-8 mx-auto"></div></td>
                                </tr>
                            ))
                        ) : goals.length > 0 ? goals.map(goal => (
                            <tr key={goal.id} className="hover:bg-gray-50/50 transition-colors group">
                                <td className="py-4 text-center">
                                    <input 
                                        type="checkbox" 
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                        checked={selectedRows.includes(goal.id)}
                                        onChange={() => handleSelectRow(goal.id)}
                                    />
                                </td>
                                <td className="py-4 px-4">
                                    <div className="flex items-center">
                                        <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center mr-4 flex-shrink-0 text-xl shadow-sm border border-gray-50">
                                            {getGoalIcon(goal.icon)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-[15px] text-gray-800 leading-tight">{goal.goalName}</p>
                                            <p className="text-[13px] text-gray-400 mt-0.5">Target: TZS {goal.targetAmount.toLocaleString()}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="py-4 px-4">
                                     <div className="flex items-center max-w-[200px]">
                                        <div className="flex-1 bg-gray-100 rounded-full h-[8px] mr-4 relative">
                                            <div 
                                                className="bg-primary h-full rounded-full transition-all duration-700 ease-out" 
                                                style={{ width: `${goal.progress}%` }}
                                            ></div>
                                        </div>
                                        <span className="font-semibold text-gray-600 w-10 text-right">{Math.round(goal.progress)}%</span>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <button className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-all">
                                        <MoreVertical size={20} />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan={4} className="py-20 text-center text-gray-400 italic">No goals found for this user.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex flex-wrap justify-between items-center mt-6 pt-6 border-t border-gray-100 gap-4 text-sm text-gray-400 font-medium">
                <p>Showing 1 to {Math.min(entriesToShow, pagination.totalElements)} of {pagination.totalElements} entries</p>
                <div className="flex items-center space-x-1">
                    <button className="p-2 text-gray-300 hover:text-gray-600 transition-colors disabled:opacity-30" disabled>
                        <ChevronLeft size={18} />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center bg-primary text-white text-xs font-bold rounded-lg shadow-sm shadow-primary/20">
                        1
                    </button>
                    <button className="p-2 text-gray-300 hover:text-gray-600 transition-colors disabled:opacity-30" disabled>
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

const SecurityTabContent: React.FC<{ 
    pinSet: boolean; 
    userId: string;
    onPinReset: () => void;
}> = ({ pinSet, userId, onPinReset }) => {
    const [isResetting, setIsResetting] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [devices, setDevices] = useState<DeviceData[]>([]);
    const [loadingDevices, setLoadingDevices] = useState(true);

    useEffect(() => {
        const fetchDevices = async () => {
            setLoadingDevices(true);
            try {
                const response = await interceptedFetch(`${API_BASE_URL}/api/v1/users/${userId}/devices`);
                const data = await response.json();
                if (data.success && data.data && Array.isArray(data.data.content)) {
                    setDevices(data.data.content);
                }
            } catch (error) {
                console.error("Failed to fetch user devices", error);
            } finally {
                setLoadingDevices(false);
            }
        };
        if (userId) {
            fetchDevices();
        }
    }, [userId]);

    const getDeviceIcon = (deviceType: string, os: string) => {
        const lowerType = deviceType.toLowerCase();
        const lowerOs = os.toLowerCase();
        if (lowerType.includes('mobile') || lowerOs.includes('android') || lowerOs.includes('ios')) {
             return <Smartphone size={20} className={lowerOs.includes('android') ? "text-green-500" : "text-gray-600"} />;
        }
        if (lowerType.includes('tablet')) {
            return <Tablet size={20} className="text-purple-500" />;
        }
        return <Monitor size={20} className={lowerOs.includes('windows') ? "text-blue-500" : "text-gray-700"} />;
    };

    const handleResetPinInitiate = () => {
        setIsConfirmModalOpen(true);
    };

    const confirmResetPin = async () => {
        setIsResetting(true);
        try {
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/users/${userId}/reset-pin`, {
                method: 'POST',
            });
            const result = await response.json();
            if (response.ok && result.success) {
                setSuccessMsg(result.data?.message || "The user's security PIN has been reset successfully. They will be prompted to set a new one on their next access.");
                setIsConfirmModalOpen(false);
                setIsSuccessModalOpen(true);
                onPinReset();
            } else {
                throw new Error(result.message || "Failed to initiate PIN reset.");
            }
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Reset PIN Section */}
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center space-x-2 mb-2">
                    <Shield className="text-primary" size={20} />
                    <h3 className="text-lg font-bold text-gray-800">Reset PIN</h3>
                </div>
                <p className="text-sm text-gray-500 mb-6">
                    Manage the security PIN for this specific user. Initiating a reset will trigger a security workflow for the user to configure a new code.
                </p>
                
                <div className="flex items-center justify-between bg-gray-50 p-5 rounded-xl border border-gray-200">
                    <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full shadow-sm ${pinSet ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-500'}`}>
                            {pinSet ? <CheckCircle size={24} /> : <AlertTriangle size={24} />} 
                        </div>
                        <div>
                            <p className="font-bold text-gray-900">PIN Status: {pinSet ? 'Active PIN Configured' : 'No Active PIN'}</p>
                            <p className="text-xs text-gray-500 font-medium">
                                {pinSet ? 'User has an active and secure transaction PIN.' : 'The user has not set up their security PIN yet.'}
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={handleResetPinInitiate}
                        disabled={!pinSet || isResetting}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold shadow-sm transition-all flex items-center ${
                            !pinSet || isResetting 
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-none' 
                            : 'bg-white border border-red-200 text-red-600 hover:bg-red-50 active:scale-95'
                        }`}
                    >
                        {isResetting && <Loader2 size={14} className="animate-spin mr-2" />}
                        Reset PIN
                    </button>
                </div>
            </div>

            {/* Recent devices Section */}
            <div className="bg-surface p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Recent devices</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100 tracking-wider">
                                <th className="pb-3 px-4 font-bold">Browser</th>
                                <th className="pb-3 px-4 font-bold">Device</th>
                                <th className="pb-3 px-4 font-bold">Recent Activity</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loadingDevices ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="py-4 px-4"><div className="h-5 bg-gray-100 rounded w-32"></div></td>
                                        <td className="py-4 px-4"><div className="h-5 bg-gray-100 rounded w-24"></div></td>
                                        <td className="py-4 px-4"><div className="h-5 bg-gray-100 rounded w-40"></div></td>
                                    </tr>
                                ))
                            ) : devices.length > 0 ? (
                                devices.map((device, index) => {
                                    const browserText = `${device.client} on ${device.operatingSystem}`;
                                    const formattedDate = new Date(device.lastActive).toLocaleString('en-US', { 
                                        day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                                    });

                                    return (
                                        <tr key={index} className="hover:bg-gray-50/30 transition-colors">
                                            <td className="py-4 px-4">
                                                <div className="flex items-center">
                                                    {getDeviceIcon(device.deviceType, device.operatingSystem)}
                                                    <span className="ml-3 font-semibold text-gray-700">
                                                        {browserText} {device.currentDevice && <span className="ml-2 text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full font-semibold">Current</span>}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-4 text-gray-600">
                                                <div>{device.deviceType}</div>
                                                {device.ipAddress && <div className="text-xs text-gray-400 mt-0.5">{device.ipAddress}</div>}
                                            </td>
                                            <td className="py-4 px-4 text-gray-500">{formattedDate}</td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={3} className="py-12 text-center text-gray-400 italic">No device history found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Custom PIN Reset Confirmation Modal */}
            {isConfirmModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 animate-in fade-in duration-200" onClick={() => setIsConfirmModalOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-amber-50 mb-4">
                                <Shield className="h-8 w-8 text-amber-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">Reset Security PIN?</h3>
                            <p className="text-gray-500 mt-2">
                                Are you sure you want to initiate a PIN reset for this user? They will be required to set a new 4-digit code upon their next login or sensitive action.
                            </p>
                        </div>
                        <div className="p-6 bg-gray-50 flex flex-col sm:flex-row gap-3 border-t border-gray-100">
                            <button
                                onClick={() => setIsConfirmModalOpen(false)}
                                disabled={isResetting}
                                className="flex-1 bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmResetPin}
                                disabled={isResetting}
                                className="flex-1 bg-amber-600 text-white py-3 rounded-xl font-bold hover:bg-amber-700 transition-all flex items-center justify-center shadow-lg shadow-amber-200 active:scale-95 disabled:bg-amber-400"
                            >
                                {isResetting ? <Loader2 size={20} className="animate-spin" /> : 'Confirm Reset'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            <SuccessModal 
                isOpen={isSuccessModalOpen} 
                onClose={() => setIsSuccessModalOpen(false)} 
                title="PIN Reset Initiated" 
                message={successMsg}
            />
        </div>
    );
};

const PayableLoanTabContent: React.FC = () => {
    return (
        <div className="space-y-6">
            <div className={`bg-surface p-6 rounded-2xl shadow-sm border border-gray-100`}>
                <h3 className="text-lg font-bold text-gray-800 mb-4">Financial Status</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <p className="text-sm font-bold text-gray-700">Active Loan Account</p>
                        <p className="text-xs text-gray-500 mt-1">Status and repayment overview for the borrower.</p>
                        <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                             <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Outstanding</p>
                             <p className="text-2xl font-black text-gray-800 mt-1">TZS 350,000</p>
                             <div className="mt-3 flex items-center text-xs">
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase">On Track</span>
                                <span className="text-gray-400 ml-2 italic">Next due Jan 15, 2026</span>
                             </div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div className="bg-amber-50 border border-amber-100 text-amber-800 p-5 rounded-xl w-full">
                            <div className="flex items-center space-x-3">
                                <AlertTriangle className="text-amber-500" />
                                <p className="font-bold">Repayment Warning</p>
                            </div>
                            <p className="text-sm mt-2 font-medium opacity-80">This user had a delayed payment last month. High risk assessment recommended for future limit increases.</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="text-center py-12 text-gray-400 italic bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-200">
                 Detailed repayment logs and history are being generated...
            </div>
        </div>
    );
};


const UserDetailPage: React.FC = () => {
    const { userId } = useParams<{ userId: string }>();
    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('Goals');
    const [isActivating, setIsActivating] = useState(false);
    const [isSuspending, setIsSuspending] = useState(false);
    const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
    
    // Goals specific state
    const [userGoals, setUserGoals] = useState<any[]>([]);
    const [loadingGoals, setLoadingGoals] = useState(false);
    const [entriesToShow, setEntriesToShow] = useState(20);
    const [pagination, setPagination] = useState({ totalElements: 0, totalPages: 1, currentPage: 0 });

    const [counts, setCounts] = useState({
        totalSuccessfulDeposits: 0,
        totalApprovals: 0,
        totalGoals: 0
    });

    const fetchUserGoals = useCallback(async (searchQuery: string = '') => {
        if (!userId) return;
        setLoadingGoals(true);
        try {
            const params = new URLSearchParams({
                search: searchQuery,
                size: String(entriesToShow),
                page: '0'
            });
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/goals/users/${userId}?${params.toString()}`);
            const result = await response.json();
            
            if (response.ok && result.success && result.data) {
                setUserGoals(result.data.content || []);
                setPagination({
                    totalElements: result.data.totalElements,
                    totalPages: result.data.totalPages,
                    currentPage: result.data.page
                });
            }
        } catch (err) {
            console.error("Failed to fetch user goals", err);
        } finally {
            setLoadingGoals(false);
        }
    }, [userId, entriesToShow]);

    const fetchUserData = async () => {
        if (!userId) {
            setError("User ID is missing.");
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/users/${userId}/admin-profile`);
            const result = await response.json();
            
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to fetch user details.');
            }
            
            const apiUser = result.data.userProfile;
            const roleName = formatApiString(apiUser.roleName);
            
            setCounts({
                totalSuccessfulDeposits: result.data.totalSuccessfulDeposits || 0,
                totalApprovals: result.data.totalApprovals || 0,
                totalGoals: result.data.totalGoals || 0
            });

            const mappedUser: UserDetail = {
                id: String(apiUser.id),
                user: {
                    name: `${apiUser.firstName} ${apiUser.lastName}`,
                    email: apiUser.email,
                    avatar: apiUser.profilePictureUrl ? `${API_BASE_URL}${apiUser.profilePictureUrl}` : `https://i.pravatar.cc/150?u=${apiUser.username}`,
                },
                role: roleName as any,
                category: apiUser.userCategory as any,
                phone: apiUser.phoneNumber || 'N/A',
                status: apiUser.activity as any,
                pinSet: apiUser.pinSet,
                details: {
                    username: apiUser.username,
                    billingEmail: apiUser.email,
                    status: formatApiString(apiUser.activity),
                    role: roleName,
                    contact: apiUser.phoneNumber || 'N/A',
                    taxId: 'TAX-875623',
                    language: apiUser.preferredLanguage === 'sw' ? 'Swahili' : 'English',
                    country: apiUser.address?.country || 'Tanzania',
                },
                stats: {
                    goalsCompleted: result.data.totalGoals || 0,
                    tasksCompleted: String(result.data.totalSuccessfulDeposits || 0),
                },
                goals: [], // Use userGoals state instead
            };
            setUser(mappedUser);
            
            // Trigger goals fetch
            fetchUserGoals();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserData();
    }, [userId]);

    const handleActivate = async () => {
        if (!user) return;
        setIsActivating(true);
        try {
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/users/${userId}/activate`, {
                method: 'PUT'
            });
            const result = await response.json();
            if (response.ok && result.success) {
                alert("User account activated successfully.");
                fetchUserData();
            } else {
                throw new Error(result.message || "Activation request failed.");
            }
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsActivating(false);
        }
    };

    const handleSuspend = () => {
        if (!user) return;
        setIsSuspendModalOpen(true);
    };

    const confirmSuspend = async () => {
        if (!user) return;
        setIsSuspending(true);
        try {
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/users/${userId}/suspend`, {
                method: 'PUT'
            });
            const result = await response.json();
            if (response.ok && result.success) {
                alert("User account suspended.");
                setIsSuspendModalOpen(false);
                fetchUserData();
            } else {
                throw new Error(result.message || "Suspension failed.");
            }
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSuspending(false);
        }
    };

    const TABS = [
        { id: 'Goals', icon: <Target size={18} />, label: 'Goals' },
        { id: 'Security', icon: <Shield size={18} />, label: 'Security' },
        { id: 'Payable Loan', icon: <DollarSign size={18} />, label: 'Financials' },
        { id: 'Notifications', icon: <Bell size={18} />, label: 'Alerts' },
    ];

    const renderContent = () => {
        if (!user) return null;

        switch(activeTab) {
            case 'Goals':
                return (
                    <GoalsList 
                        goals={userGoals} 
                        loading={loadingGoals} 
                        onSearch={(q) => fetchUserGoals(q)}
                        onEntriesChange={(size) => setEntriesToShow(size)}
                        entriesToShow={entriesToShow}
                        pagination={pagination}
                    />
                );
            case 'Security':
                return <SecurityTabContent pinSet={user.pinSet || false} userId={user.id} onPinReset={fetchUserData} />;
            case 'Payable Loan':
                return <PayableLoanTabContent />;
            default:
                return (
                    <div className="p-12 text-center bg-gray-50 rounded-2xl mt-6 border-2 border-dashed border-gray-200">
                        <Bell className="mx-auto text-gray-300 mb-4" size={48} />
                        <h3 className="text-xl font-bold text-gray-700">Detailed logs for {activeTab}</h3>
                        <p className="text-sm text-gray-400 mt-2">Communication history and system alerts will be displayed here.</p>
                    </div>
                );
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1">
                    <UserInfoCardSkeleton />
                </div>
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-surface p-2 rounded-xl shadow-sm border border-gray-100 animate-pulse h-12 w-full"></div>
                    <div className="bg-surface p-8 rounded-2xl shadow-sm border border-gray-100 animate-pulse h-[500px]"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-12 text-center bg-white rounded-2xl shadow-xl border border-red-100 max-w-2xl mx-auto">
                <AlertTriangle size={64} className="mx-auto text-red-500 mb-6" />
                <h2 className="text-3xl font-black text-gray-900">Resource Unavailable</h2>
                <p className="text-red-500 mt-3 font-medium text-lg">{error}</p>
                <Link to="/users/list" className="mt-8 inline-flex items-center px-8 py-3 bg-primary text-white font-black rounded-xl hover:bg-primary-dark transition-all shadow-lg hover:shadow-primary/20">
                    <ChevronLeft size={20} className="mr-2"/> Return to Directory
                </Link>
            </div>
        );
    }

    if (!user) return <div className="p-8 text-center">User record not found.</div>;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-1">
                <UserInfoCard 
                    user={user} 
                    totalSuccessfulDeposits={counts.totalSuccessfulDeposits} 
                    totalApprovals={counts.totalApprovals}
                    totalGoals={counts.totalGoals}
                    onActivate={handleActivate}
                    onSuspend={handleSuspend}
                    isActivating={isActivating}
                    isSuspending={isSuspending}
                />
            </div>
            <div className="lg:col-span-2 space-y-8">
                <div className="bg-surface p-2 rounded-xl shadow-sm border border-gray-100 overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <div className="flex items-center gap-2">
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
                <div className="transition-all duration-300 transform scale-100 opacity-100">
                    {renderContent()}
                </div>
            </div>
            <SuspendConfirmationModal 
                isOpen={isSuspendModalOpen} 
                onClose={() => setIsSuspendModalOpen(false)} 
                onConfirm={confirmSuspend}
                userName={user.user.name}
                isSuspending={isSuspending}
            />
        </div>
    );
};

export default UserDetailPage;