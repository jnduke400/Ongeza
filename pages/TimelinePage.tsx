import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    ChevronLeft, ChevronRight, BarChart2, Loader2, 
    File as FileIconLucide, AlertCircle, History
} from 'lucide-react';
import { API_BASE_URL } from '../services/apiConfig';
import { interceptedFetch } from '../services/api';

interface TimelineActivity {
    id: number;
    activityType: string;
    module: string;
    title: string;
    description: string;
    referenceType: 'GOAL' | 'TRANSACTION' | 'APPROVAL_REQUEST' | 'USER' | 'WALLET' | 'DOCUMENT' | null;
    referenceId: string | number | null;
    metadata: any;
    activityTimestamp: string;
    timelineMarkerColor: 'BLUE' | 'GREEN' | 'RED' | 'YELLOW' | 'GRAY';
    isRead: boolean;
    createdAt: string;
}

const getRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return 'N/A';
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const TimelineItem: React.FC<{ item: TimelineActivity }> = ({ item }) => {
    const navigate = useNavigate();

    const getMarkerColor = (color: string) => {
        switch (color) {
            case 'BLUE': return 'bg-blue-500';
            case 'GREEN': return 'bg-green-500';
            case 'RED': return 'bg-red-500';
            case 'YELLOW': return 'bg-yellow-500';
            case 'GRAY': return 'bg-gray-400';
            default: return 'bg-blue-500';
        }
    };

    const handleHeaderClick = () => {
        if (!item.referenceType || !item.referenceId) return;
        
        switch (item.referenceType) {
            case 'APPROVAL_REQUEST': navigate(`/onboarding/requests/${item.referenceId}`); break;
            case 'USER': navigate(`/users/${item.referenceId}`); break;
            case 'GOAL': navigate(`/goals/${item.referenceId}`); break;
            case 'TRANSACTION': navigate(`/activity/${item.referenceId}`); break;
            default: break;
        }
    };

    return (
        <li className="flex items-start group">
            <div className={`w-6 h-6 rounded-full ${getMarkerColor(item.timelineMarkerColor)} flex-shrink-0 z-10 mr-5 border-4 border-white shadow-sm ring-1 ring-gray-100 transition-transform group-hover:scale-110`}></div>
            <div className="flex-grow pb-10">
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                        <p 
                            onClick={handleHeaderClick}
                            className={`font-bold text-gray-800 text-lg ${item.referenceId ? 'cursor-pointer hover:text-primary transition-colors' : ''}`}
                        >
                            {item.title}
                        </p>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest bg-gray-50 px-2.5 py-1 rounded-full">
                            {getRelativeTime(item.activityTimestamp)}
                        </span>
                    </div>
                    <p className="text-gray-600 leading-relaxed font-medium">{item.description}</p>
                    <div className="mt-4 flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <History size={12} className="mr-1.5" />
                        {item.module} Activity
                    </div>
                </div>
            </div>
        </li>
    );
};

const TimelinePage: React.FC = () => {
    const [activities, setActivities] = useState<TimelineActivity[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const size = 10;

    const fetchTimeline = async (pageNumber: number) => {
        setLoading(true);
        try {
            const res = await interceptedFetch(`${API_BASE_URL}/api/v1/timeline?page=${pageNumber}&size=${size}&sortBy=activityTimestamp&sortDirection=desc`);
            const result = await res.json();
            if (result.success && result.data) {
                // Filter out non-readable activities if any
                const filtered = (result.data.content || []).filter((a: TimelineActivity) => a.referenceType !== 'WALLET');
                setActivities(filtered);
                setTotalPages(result.data.totalPages);
                setTotalElements(result.data.totalElements);
            }
        } catch (error) {
            console.error("Failed to fetch timeline", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTimeline(page);
    }, [page]);

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex flex-wrap justify-between items-end gap-4">
                <div>
                    <Link to="/profile" className="flex items-center text-primary hover:underline font-bold text-sm mb-2 group">
                        <ChevronLeft size={18} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                        Back to Profile
                    </Link>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center">
                        <BarChart2 className="mr-3 text-indigo-500" size={32} />
                        Detailed Activity Log
                    </h1>
                </div>
                <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm text-sm font-bold text-gray-500">
                    Total Actions: <span className="text-primary">{totalElements}</span>
                </div>
            </div>

            <div className="bg-surface rounded-[2.5rem] p-8 sm:p-12 shadow-sm border border-gray-100 min-h-[600px] flex flex-col">
                {loading ? (
                    <div className="flex-1 flex flex-col justify-center items-center py-20 space-y-4">
                        <Loader2 className="animate-spin text-primary" size={48} />
                        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Retrieving Audit Trails...</p>
                    </div>
                ) : activities.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                        <AlertCircle size={64} className="text-gray-100 mb-4" />
                        <h3 className="text-xl font-bold text-gray-800">No activity found</h3>
                        <p className="text-gray-400 mt-2">Historical data for this account is currently unavailable.</p>
                    </div>
                ) : (
                    <>
                        <div className="relative flex-1">
                            <div className="absolute left-[11px] top-2 bottom-0 w-[2px] bg-gray-100"></div>
                            <ul className="space-y-2">
                                {activities.map((item) => (
                                    <TimelineItem key={item.id} item={item} />
                                ))}
                            </ul>
                        </div>

                        <div className="mt-12 pt-8 border-t border-gray-100 flex flex-wrap justify-between items-center gap-6">
                            <p className="text-sm font-bold text-gray-400">
                                Showing <span className="text-gray-900">{page * size + 1}</span> to <span className="text-gray-900">{Math.min((page + 1) * size, totalElements)}</span> of {totalElements} logs
                            </p>
                            
                            <div className="flex items-center space-x-3">
                                <button 
                                    onClick={() => setPage(p => Math.max(0, p - 1))}
                                    disabled={page === 0}
                                    className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                
                                <div className="flex space-x-1">
                                    {Array.from({ length: totalPages }).map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPage(i)}
                                            className={`w-10 h-10 rounded-2xl font-bold text-sm transition-all ${
                                                page === i 
                                                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                                : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                                            }`}
                                        >
                                            {i + 1}
                                        </button>
                                    )).slice(Math.max(0, page - 2), Math.min(totalPages, page + 3))}
                                </div>

                                <button 
                                    onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                    disabled={page >= totalPages - 1}
                                    className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-500 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TimelinePage;