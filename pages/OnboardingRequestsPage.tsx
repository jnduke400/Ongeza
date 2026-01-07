import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingRequest, OnboardingStatus, OnboardingType } from '../types';
import { Search, Check, X, Eye, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { API_BASE_URL } from '../services/apiConfig';
import { interceptedFetch } from '../services/api';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 ${className}`}>
        {children}
    </div>
);

// Helper to get gender-specific shadow placeholder
const getShadowPlaceholder = (gender?: string) => {
    const isFemale = gender?.toUpperCase() === 'FEMALE';
    if (isFemale) return 'https://ui-avatars.com/api/?name=F&background=E2E8F0&color=94A3B8&size=150&bold=true';
    return 'https://ui-avatars.com/api/?name=M&background=E2E8F0&color=94A3B8&size=150&bold=true';
};

const OnboardingIllustrationCard: React.FC = () => {
    return (
        <Card className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-full max-w-xs mx-auto">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <linearGradient id="doc-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#A5B4FC" />
                      <stop offset="100%" stopColor="#6366F1" />
                    </linearGradient>
                     <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                      <feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.1"/>
                    </filter>
                  </defs>
                  <circle cx="100" cy="100" r="80" fill="#F3F4F6" />
                  
                  {/* User Profile Icon */}
                  <g transform="translate(40, 70)" filter="url(#shadow)">
                    <circle cx="25" cy="25" r="25" fill="#E0E7FF"/>
                    <circle cx="25" cy="18" r="10" fill="url(#doc-grad)"/>
                    <path d="M10 40 a15,15 0 0,1 30,0" fill="url(#doc-grad)"/>
                  </g>
                  
                  {/* Document */}
                   <g transform="translate(90, 45)" filter="url(#shadow)">
                    <path d="M0 10 C0 4.477 4.477 0 10 0 H50 L80 30 V90 C80 95.523 75.523 100 70 100 H10 C4.477 100 0 95.523 0 90 Z" fill="white" stroke="#E5E7EB" strokeWidth="2"/>
                    <path d="M50 0 V20 C50 25.523 54.477 30 60 30 H80" fill="#F3F4F6"/>
                    <rect x="15" y="45" width="50" height="6" rx="2" fill="#D1D5DB" />
                    <rect x="15" y="60" width="35" height="6" rx="2" fill="#D1D5DB" />
                    <rect x="15" y="75" width="45" height="6" rx="2" fill="#D1D5DB" />
                  </g>
                  
                  {/* Checkmark */}
                  <g transform="translate(130, 120)">
                    <circle cx="15" cy="15" r="15" fill="#10B981" filter="url(#shadow)"/>
                    <path d="M10 15 L14 19 L22 11" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </g>
                </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mt-4">Onboarding Requests</h2>
            <p className="text-gray-500 mt-2 max-w-xs">Review and approve new user applications for Borrower, Saver, and Investor roles.</p>
        </Card>
    );
};

const TypeBadge: React.FC<{ type: OnboardingType }> = ({ type }) => {
    const colorMap: { [key in OnboardingType]: string } = {
        [OnboardingType.Borrower]: 'bg-blue-100 text-blue-700',
        [OnboardingType.Saver]: 'bg-green-100 text-green-700',
        [OnboardingType.Group]: 'bg-purple-100 text-purple-700',
        [OnboardingType.Investor]: 'bg-indigo-100 text-indigo-700',
        [OnboardingType.None]: 'bg-gray-100 text-gray-700',
    };
    return <span className={`px-2.5 py-1 text-xs font-semibold rounded-md ${colorMap[type]}`}>{type}</span>
};

const StatusPill: React.FC<{ status: OnboardingStatus }> = ({ status }) => {
    const styles: { [key in OnboardingStatus]: string } = {
        [OnboardingStatus.Pending]: 'bg-yellow-100 text-yellow-700',
        [OnboardingStatus.Approved]: 'bg-green-100 text-green-700',
        [OnboardingStatus.Rejected]: 'bg-red-100 text-red-700',
    };
    return <span className={`px-3 py-1.5 text-xs font-semibold rounded-md ${styles[status]}`}>{status}</span>;
};

const UserCell: React.FC<{ user: OnboardingRequest['user'] }> = ({ user }) => (
    <div className="flex items-center">
        <img 
            src={getShadowPlaceholder(user.gender)} 
            alt={`${user.firstName} ${user.lastName}`} 
            className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-100 shadow-sm" 
            onError={(e) => {
                (e.target as HTMLImageElement).src = getShadowPlaceholder(user.gender);
            }}
        />
        <div>
            <p className="font-semibold text-gray-800">{`${user.firstName} ${user.lastName}`}</p>
            <p className="text-xs text-gray-500">{user.phone}</p>
        </div>
    </div>
);

const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 7 }) => {
    return (
        <>
            {Array.from({ length: rows }).map((_, index) => (
                <tr key={index} className="border-t border-gray-200 animate-pulse">
                    <td className="p-4">
                        <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                            <div>
                                <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                                <div className="h-3 bg-gray-200 rounded w-20"></div>
                            </div>
                        </div>
                    </td>
                    <td className="p-4"><div className="h-5 bg-gray-200 rounded w-16"></div></td>
                    <td className="p-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                    <td className="p-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                    <td className="p-4"><div className="h-8 bg-gray-200 rounded w-24 mx-auto"></div></td>
                </tr>
            ))}
        </>
    );
};

const ActionModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    action: 'APPROVE' | 'REJECT' | null;
    request: OnboardingRequest | null;
    onConfirm: (comments: string) => void;
    isUpdating: boolean;
}> = ({ isOpen, onClose, action, request, onConfirm, isUpdating }) => {
    const [comments, setComments] = useState('');

    useEffect(() => {
        if (isOpen) setComments('');
    }, [isOpen]);

    if (!isOpen || !action || !request) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                <h3 className={`text-xl font-bold mb-2 ${action === 'APPROVE' ? 'text-green-700' : 'text-red-700'}`}>
                    {action === 'APPROVE' ? 'Approve Request' : 'Reject Request'}
                </h3>
                <p className="text-gray-600 mb-4">
                    Are you sure you want to {action.toLowerCase()} the request for <span className="font-semibold">{request.user.firstName} {request.user.lastName}</span>?
                </p>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comments</label>
                    <textarea 
                        className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-primary focus:border-transparent" 
                        rows={3} 
                        placeholder={action === 'APPROVE' ? "Approved after review" : "Reason for rejection..."}
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                        required
                    ></textarea>
                </div>
                <div className="flex justify-end space-x-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium">Cancel</button>
                    <button 
                        onClick={() => onConfirm(comments)} 
                        disabled={isUpdating}
                        className={`px-4 py-2 text-white rounded-md font-medium flex items-center ${action === 'APPROVE' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} ${isUpdating ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                         {isUpdating ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div> : null}
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

const OnboardingRequestsPage: React.FC = () => {
    const [requests, setRequests] = useState<OnboardingRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<OnboardingType | 'All'>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [selectedAction, setSelectedAction] = useState<'APPROVE' | 'REJECT' | null>(null);
    const [selectedRequest, setSelectedRequest] = useState<OnboardingRequest | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    
    const itemsPerPage = 7;
    const navigate = useNavigate();

    const fetchRequests = async () => {
        setLoading(true);
        setError('');
        try {
            const params = new URLSearchParams({
                page: String(currentPage - 1),
                size: String(itemsPerPage),
                sortBy: 'id',
                sortDir: 'asc'
            });

            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/approval-requests/pending?${params.toString()}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch onboarding requests');
            }

            const data = await response.json();
            
            if (data.content) {
                const mappedRequests: OnboardingRequest[] = data.content.map((item: any) => ({
                    id: String(item.id),
                    user: {
                        firstName: item.entityMetadata.firstName || '',
                        lastName: item.entityMetadata.lastName || '',
                        phone: item.entityMetadata.phoneNumber || item.entityMetadata.mobileWallet || 'N/A',
                        avatar: null, // Force null to use placeholder
                        email: item.entityMetadata.email,
                        gender: item.entityMetadata.gender
                    },
                    type: item.entityType === 'SUBSCRIBER' ? OnboardingType.Saver : OnboardingType.None,
                    submissionDate: item.entityMetadata.termsAcceptedAt || item.createdAt,
                    status: item.status, 
                    canApprove: item.canCurrentUserApprove,
                    details: { ...item.entityMetadata }
                }));
                
                setRequests(mappedRequests);
                setTotalPages(data.totalPages);
                setTotalElements(data.totalElements);
            } else {
                setRequests([]);
            }

        } catch (err: any) {
            console.error("Error fetching requests:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [currentPage]);

    const openActionModal = (req: OnboardingRequest, action: 'APPROVE' | 'REJECT') => {
        setSelectedRequest(req);
        setSelectedAction(action);
        setIsActionModalOpen(true);
    };

    const confirmAction = async (comments: string) => {
        if (!selectedRequest || !selectedAction) return;
        setIsUpdating(true);
        try {
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/approval-requests/${selectedRequest.id}/actions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: selectedAction,
                    comments: comments || (selectedAction === 'APPROVE' ? "Approved" : "Rejected")
                })
            });

            if (!response.ok) {
                throw new Error("Failed to process request");
            }
            
            setRequests(prev => prev.filter(r => r.id !== selectedRequest.id));
            setIsActionModalOpen(false);
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setIsUpdating(false);
        }
    };

    const filteredRequests = useMemo(() => {
        return requests.filter(req => {
            const matchesTab = activeTab === 'All' || req.type === activeTab;
            const matchesSearch = searchQuery === '' || 
                                  `${req.user.firstName} ${req.user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                  req.user.phone.includes(searchQuery);
            return matchesTab && matchesSearch;
        });
    }, [requests, activeTab, searchQuery]);
    
    const formatDate = (isoString: string) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleDateString('en-GB'); // dd/mm/yyyy
    };

    const tabs: (OnboardingType | 'All')[] = ['All', OnboardingType.Borrower, OnboardingType.Saver, OnboardingType.Group, OnboardingType.Investor];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1">
                <OnboardingIllustrationCard />
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                        <div className="flex items-center space-x-1 sm:space-x-2 border-b border-gray-200">
                            {tabs.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => { setActiveTab(tab); }}
                                    className={`px-3 py-2.5 font-semibold transition-colors duration-200 text-sm ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-primary'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                         <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search by name or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary transition"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[700px] text-sm">
                             <thead>
                                <tr className="text-left text-xs text-gray-500 uppercase">
                                    <th className="p-4 font-semibold">Applicant</th>
                                    <th className="p-4 font-semibold">Type</th>
                                    <th className="p-4 font-semibold">Date</th>
                                    <th className="p-4 font-semibold">Status</th>
                                    <th className="p-4 font-semibold text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <TableSkeleton rows={itemsPerPage} />
                                ) : error ? (
                                    <tr><td colSpan={5} className="text-center py-10 text-red-500">Error: {error}</td></tr>
                                ) : filteredRequests.length > 0 ? (
                                    filteredRequests.map(req => (
                                        <tr key={req.id} className="border-t border-gray-200 hover:bg-gray-50">
                                            <td className="p-4"><UserCell user={req.user} /></td>
                                            <td className="p-4"><TypeBadge type={req.type} /></td>
                                            <td className="p-4 text-gray-600">{formatDate(req.submissionDate)}</td>
                                            <td className="p-4"><StatusPill status={req.status} /></td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center space-x-2">
                                                    <button onClick={() => navigate(`/onboarding/requests/${req.id}`)} className="p-2 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors" title="View Details"><Eye size={18}/></button>
                                                    <button 
                                                        onClick={() => openActionModal(req, 'APPROVE')}
                                                        disabled={!req.canApprove || req.status === OnboardingStatus.Approved} 
                                                        className="p-2 rounded-full text-green-500 hover:bg-green-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent" 
                                                        title={req.canApprove ? "Approve" : "Action Unavailable"}
                                                    >
                                                        <Check size={18}/>
                                                    </button>
                                                    <button 
                                                        onClick={() => openActionModal(req, 'REJECT')}
                                                        disabled={!req.canApprove || req.status === OnboardingStatus.Rejected} 
                                                        className="p-2 rounded-full text-red-500 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-transparent" 
                                                        title={req.canApprove ? "Reject" : "Action Unavailable"}
                                                    >
                                                        <X size={18}/>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="text-center py-10 text-gray-500">
                                            <FileText size={40} className="mx-auto mb-2 text-gray-300"/>
                                            <p>No onboarding requests found.</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {!loading && totalPages > 1 && (
                        <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                             <p>Showing <span className="font-semibold text-gray-700">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-semibold text-gray-700">{Math.min(currentPage * itemsPerPage, totalElements)}</span> of <span className="font-semibold text-gray-700">{totalElements}</span> requests</p>
                            <div className="flex items-center space-x-1">
                                <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={16} /></button>
                                 <span className="px-2 font-semibold text-gray-700">{currentPage}</span>
                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={16} /></button>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
            <ActionModal 
                isOpen={isActionModalOpen} 
                onClose={() => setIsActionModalOpen(false)} 
                action={selectedAction}
                request={selectedRequest}
                onConfirm={confirmAction}
                isUpdating={isUpdating}
            />
        </div>
    );
};

export default OnboardingRequestsPage;