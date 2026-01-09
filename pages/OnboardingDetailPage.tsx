import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { OnboardingRequest, OnboardingStatus, OnboardingType, OnboardingDocument, LoanProduct, ApprovalAction } from '../types';
import { 
    Check, X, FileText, User, Phone, MapPin, Building, DollarSign, Briefcase, PiggyBank, Users, TrendingUp, ChevronLeft, Image, Download
} from 'lucide-react';
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

const ActivityTimeline: React.FC<{ actions: ApprovalAction[] }> = ({ actions }) => {
    if (!actions || actions.length === 0) {
        return <OnboardingIllustrationCard />;
    }

    return (
        <Card className="h-full">
             <div className="flex items-center mb-6">
                <FileText size={20} className="text-gray-500 mr-3" />
                <h3 className="text-lg font-semibold text-gray-800">Activity Timeline</h3>
            </div>
            <div className="relative pl-2">
                 <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                 <ul className="space-y-8">
                    {actions.map((action) => {
                        const isApproved = action.action === 'APPROVE';
                        const colorClass = isApproved ? 'bg-green-500' : 'bg-red-500';
                        const date = new Date(action.actionTimestamp).toLocaleString('en-US', {
                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        });

                        return (
                            <li key={action.id} className="relative pl-8">
                                <div className={`absolute left-2.5 top-1.5 w-3 h-3 rounded-full ${colorClass} -ml-1.5 border-2 border-white shadow-sm z-10`}></div>
                                <div className="flex flex-col">
                                    <div className="flex justify-between items-start">
                                         <p className="font-semibold text-gray-800 text-sm">
                                            {action.action} by User #{action.actorUserId}
                                        </p>
                                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">{date}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded-md border border-gray-100">
                                        {action.comments || "No comments provided."}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                 </ul>
            </div>
        </Card>
    );
};


const DetailRow: React.FC<{ icon: React.ReactNode; label: string; value: string | number | undefined }> = ({ icon, label, value }) => (
    <div className="flex items-start space-x-3 py-2 border-b border-gray-100 last:border-b-0">
        <div className="text-gray-400 mt-1 flex-shrink-0 w-5 h-5">{icon}</div>
        <div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className="font-semibold text-gray-800 break-words">{value || 'N/A'}</p>
        </div>
    </div>
);

const DocumentItem: React.FC<{
    doc: OnboardingDocument;
    onView: (doc: OnboardingDocument) => void;
}> = ({ doc, onView }) => {
    
    const getIcon = () => {
        if (doc.contentType === 'application/pdf') return <FileText size={32} className="text-red-500 mt-2" />;
        if (doc.contentType.startsWith('image/')) return <Image size={32} className="text-blue-500 mt-2" />;
        return <FileText size={32} className="text-gray-400 mt-2" />;
    };

    const fileTypeLabel = doc.contentType === 'application/pdf' ? 'PDF' : 'IMAGE';
    const badgeColor = doc.contentType === 'application/pdf' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700';

    return (
        <div>
            <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200 hover:shadow-md transition-shadow">
                <div className="w-20 h-24 bg-white rounded-md shadow-sm mx-auto flex flex-col justify-center items-center border border-gray-100">
                    <div className={`px-2 py-0.5 ${badgeColor} text-xs font-bold rounded mb-1`}>{fileTypeLabel}</div>
                    {getIcon()}
                </div>
                <p className="font-bold text-gray-800 mt-3 truncate text-sm" title={doc.fileName}>{doc.fileName}</p>
                 <p className="text-xs text-gray-500 mt-1">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
            </div>
            <div className="mt-2 text-center">
                <button 
                    onClick={() => onView(doc)} 
                    className="text-primary text-sm font-semibold hover:underline flex items-center justify-center w-full py-2"
                >
                    <Download size={14} className="mr-1"/> View Document
                </button>
            </div>
        </div>
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


const OnboardingDetailPage: React.FC = () => {
    const { requestId } = useParams<{ requestId: string }>();
    const navigate = useNavigate();
    const [request, setRequest] = useState<OnboardingRequest | null>(null);
    const [documents, setDocuments] = useState<OnboardingDocument[]>([]);
    
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [selectedAction, setSelectedAction] = useState<'APPROVE' | 'REJECT' | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDetails = async () => {
        if (!requestId) return;
        setLoading(true);
        setError('');
        try {
            const reqResponse = await interceptedFetch(`${API_BASE_URL}/api/v1/approval-requests/${requestId}`);
            if (!reqResponse.ok) {
                throw new Error("Failed to fetch details.");
            }

            const data = await reqResponse.json();
            const item = data.data || data; // Handle wrapper if exists
            const mappedRequest: OnboardingRequest = {
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
                status: item.status as OnboardingStatus,
                canApprove: item.canCurrentUserApprove,
                onboardingRequestData: item.onboardingRequestData,
                details: { ...item.entityMetadata },
                actions: item.actions // Map actions for timeline
            };
            setRequest(mappedRequest);

            // Fetch Documents
            const docResponse = await interceptedFetch(`${API_BASE_URL}/api/v1/approval-requests/${requestId}/documents`);
            if (docResponse.ok) {
                const docData = await docResponse.json();
                if (Array.isArray(docData)) {
                    setDocuments(docData);
                } else if (docData.data && Array.isArray(docData.data)) {
                        setDocuments(docData.data);
                }
            }

        } catch (err: any) {
            console.error("Error fetching details:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDetails();
    }, [requestId]);
    
    const openActionModal = (action: 'APPROVE' | 'REJECT') => {
        setSelectedAction(action);
        setIsActionModalOpen(true);
    };

    const confirmAction = async (comments: string) => {
        if (!request || !selectedAction) return;
        setIsUpdating(true);
        try {
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/approval-requests/${request.id}/actions`, {
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
            
            alert(`Application ${selectedAction.toLowerCase()} successfully!`);
            setIsActionModalOpen(false);
            fetchDetails(); // Refresh to show new status and timeline

        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDownloadDocument = async (doc: OnboardingDocument) => {
        try {
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/approval-requests/${requestId}/documents/${doc.id}/download`);
            if (!response.ok) throw new Error('Failed to download document');
            
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error(err);
            alert("Error downloading document.");
        }
    };

    const renderApplicationDetails = (req: OnboardingRequest, address?: any) => {
        return (
            <>
                <DetailRow icon={<Briefcase size={20} />} label="Role" value={req.type} />
                {req.type === OnboardingType.Borrower && <DetailRow icon={<Briefcase size={20} />} label="Loan Product" value={req.details.loanProduct} />}
                {req.type === OnboardingType.Saver && (
                     <>
                        <DetailRow icon={<PiggyBank size={20} />} label="Saving Goal" value={req.details.savingGoal || 'General Savings'} />
                        <DetailRow icon={<DollarSign size={20} />} label="Target Amount" value={`TZS ${req.details.targetAmount?.toLocaleString() || '0'}`} />
                    </>
                )}
                 {req.type === OnboardingType.Group && (
                    <>
                        <DetailRow icon={<Building size={20} />} label="Group Name" value={req.details.groupName} />
                        <DetailRow icon={<Users size={20} />} label="Expected Members" value={req.details.expectedMembers} />
                    </>
                )}
                {req.type === OnboardingType.Investor && <DetailRow icon={<TrendingUp size={20} />} label="Investment Amount" value={`TZS ${req.details.investmentAmount?.toLocaleString()}`} />}
                
                {/* Parsed Address Details */}
                {address && (
                    <>
                         <div className="py-3 border-b border-gray-100 mt-2 mb-1">
                            <p className="text-sm font-bold text-gray-700 uppercase tracking-wider">Address Details</p>
                        </div>
                        <DetailRow icon={<MapPin size={20} />} label="Street" value={address.street} />
                        <DetailRow icon={<MapPin size={20} />} label="City" value={address.city} />
                        <DetailRow icon={<MapPin size={20} />} label="District" value={address.district} />
                        <DetailRow icon={<MapPin size={20} />} label="Region" value={address.region} />
                        <DetailRow icon={<MapPin size={20} />} label="Country" value={address.country} />
                    </>
                )}
            </>
        );
    };

    if (loading) {
        return <div className="p-8 text-center">Loading request details...</div>;
    }
    
    if (error && !request) {
        return <div className="p-8 text-center text-red-500">Error: {error}</div>;
    }

    if (!request) {
        return <div className="p-8 text-center">Request not found.</div>;
    }

    // Parse raw data for address
    let parsedAddress = null;
    try {
        if (request.onboardingRequestData) {
            const parsed = JSON.parse(request.onboardingRequestData);
            parsedAddress = parsed.personalInfo?.address;
        }
    } catch (e) {
        console.error("Error parsing onboarding data", e);
    }

    // Combine top-level details if parsing failed or for display fallback
    const displayAddress = parsedAddress || {
        region: request.details.region,
        district: request.details.district
    };

    return (
        <div className="space-y-6">
            <Link to="/onboarding/requests" className="flex items-center text-primary hover:underline font-semibold text-sm">
                <ChevronLeft size={18} className="mr-1"/>
                Back to Approval Request List
            </Link>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-1">
                     <ActivityTimeline actions={request.actions || []} />
                </div>
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                        {/* Left Details Card */}
                        <Card className="md:col-span-3">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Applicant Information</h3>
                            <div className="space-y-2">
                                <div className="flex items-center mb-6">
                                    <img 
                                        src={getShadowPlaceholder(request.details.gender)} 
                                        alt="Profile Placeholder" 
                                        className="w-20 h-20 rounded-full object-cover mr-4 border-2 border-gray-100 shadow-sm" 
                                    />
                                    <div>
                                        <h4 className="text-lg font-bold text-gray-900">{request.user.firstName} {request.user.lastName}</h4>
                                        <p className="text-sm text-gray-500 uppercase font-black tracking-widest">{request.type}</p>
                                    </div>
                                </div>
                               <DetailRow icon={<User size={20} />} label="Full Name" value={`${request.user.firstName} ${request.user.lastName}`} />
                               <DetailRow icon={<Phone size={20} />} label="Phone Number" value={request.user.phone} />
                               <DetailRow icon={<User size={20} />} label="Email" value={request.user.email} />
                               {renderApplicationDetails(request, displayAddress)}
                            </div>
                        </Card>

                        {/* Right Documents Card */}
                        <Card className="md:col-span-2">
                             <h3 className="text-xl font-bold text-gray-800 mb-4">Submitted Documents</h3>
                            <div className="space-y-4">
                                {documents.length > 0 ? (
                                    documents.map((doc) => (
                                        <DocumentItem 
                                            key={doc.id} 
                                            doc={doc} 
                                            onView={handleDownloadDocument} 
                                        />
                                    ))
                                ) : (
                                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                        <p className="text-gray-500 text-sm">No documents submitted.</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>

                    <div className="flex items-center justify-end space-x-4">
                        <button
                            onClick={() => openActionModal('REJECT')}
                            disabled={!request.canApprove || request.status !== OnboardingStatus.Pending}
                            className="flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed w-32"
                            title={!request.canApprove ? "You do not have permission to reject this request" : ""}
                        >
                             <X size={20}/><span>Reject</span>
                        </button>
                         <button
                            onClick={() => openActionModal('APPROVE')}
                            disabled={!request.canApprove || request.status !== OnboardingStatus.Pending}
                            className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed w-32"
                            title={!request.canApprove ? "You do not have permission to approve this request" : ""}
                        >
                            <Check size={20}/><span>Approve</span>
                        </button>
                    </div>
                </div>
            </div>
            <ActionModal 
                isOpen={isActionModalOpen} 
                onClose={() => setIsActionModalOpen(false)} 
                action={selectedAction}
                request={request}
                onConfirm={confirmAction}
                isUpdating={isUpdating}
            />
        </div>
    );
};

export default OnboardingDetailPage;