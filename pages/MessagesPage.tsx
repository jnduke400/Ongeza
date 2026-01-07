import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
    Search, Mail, Send, Star, Trash2, 
    RefreshCcw, MoreVertical, Plus, ChevronLeft, 
    ChevronRight, Archive, Paperclip, X, Loader2,
    RotateCcw, Bold, Italic, Underline, Strikethrough, 
    AlignLeft, AlignCenter, AlignRight, AlignJustify, Minus, AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL } from '../services/apiConfig';
import { interceptedFetch } from '../services/api';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: string; // ACCOUNT, TRANSACTION, GOAL, SUPPORT
    read: boolean;
    starred: boolean;
    createdAt: string;
    readAt: string | null;
    senderId: number | null;
    senderEmail: string | null;
    senderFullName: string | null;
}

interface Message {
    id: string;
    sender: string;
    email: string;
    avatar: string | null;
    subject: string;
    snippet: string;
    body: string;
    date: string;
    fullDate: string;
    isStarred: boolean;
    read: boolean;
    labels: { color: string; name: string }[];
    attachments?: { name: string; size: string }[];
    isSystem: boolean;
}

const getLabelForType = (type: string) => {
    const t = type?.toUpperCase();
    switch (t) {
        case 'ACCOUNT':
            return { color: 'bg-red-500', name: 'Account' };
        case 'TRANSACTION':
            return { color: 'bg-blue-500', name: 'Transaction' };
        case 'GOAL':
            return { color: 'bg-green-500', name: 'Goal' };
        case 'SUPPORT':
            return { color: 'bg-amber-500', name: 'Support' };
        default:
            return { color: 'bg-gray-500', name: 'System' };
    }
};

const formatNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatFullNotificationDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    const parts = date.toDateString().split(' ');
    return `${parts[0]} ${parts[1]} ${parts[2]} ${parts[3]}`;
};

const ConfirmDeleteModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
    title: string;
    message: string;
    confirmButtonText?: string;
}> = ({ isOpen, onClose, onConfirm, isLoading, title, message, confirmButtonText = 'Confirm Delete' }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/50 z-[150] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-6">
                        <AlertCircle size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-500 font-medium leading-relaxed">{message}</p>
                </div>
                <div className="px-8 pb-8 flex space-x-3">
                    <button 
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl shadow-lg shadow-red-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center"
                    >
                        {isLoading ? <Loader2 size={20} className="animate-spin" /> : confirmButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ComposeModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    if (!isOpen) return null;

    const handleSend = async () => {
        if (!title.trim() || !message.trim()) {
            alert("Please fill in both subject and message.");
            return;
        }

        setIsSending(true);
        try {
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/support/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    message: message.trim(),
                }),
            });

            const result = await response.json();

            if (result.success) {
                alert(result.message || "Message sent successfully");
                setTitle('');
                setMessage('');
                onClose();
            } else {
                throw new Error(result.message || "Failed to send message");
            }
        } catch (error: any) {
            console.error("Failed to send message:", error);
            alert(error.message || "An error occurred while sending the message.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="fixed bottom-0 right-8 w-[500px] bg-white rounded-t-xl shadow-2xl border border-gray-200 z-[100] animate-in slide-in-from-bottom duration-300">
            <div className="flex items-center justify-between px-4 py-3 bg-[#3a3747] text-white rounded-t-xl">
                <span className="font-semibold text-sm">Compose Mail</span>
                <div className="flex items-center space-x-3">
                    <button className="hover:text-gray-300 transition-colors"><Minus size={18} /></button>
                    <button onClick={onClose} className="hover:text-gray-300 transition-colors"><X size={18} /></button>
                </div>
            </div>
            <div className="divide-y divide-gray-100">
                <div className="px-4 py-2 flex items-center">
                    <span className="text-gray-500 text-sm w-12 shrink-0">To:</span>
                    <input type="text" value="system.admin@pesaflow.com" readOnly className="flex-1 border-none focus:ring-0 text-sm py-1 bg-transparent text-gray-800 font-medium cursor-not-allowed" />
                    <button className="text-gray-400 text-xs font-semibold hover:text-gray-600">Cc | Bcc</button>
                </div>
                <div className="px-4 py-2 flex items-center">
                    <span className="text-gray-500 text-sm w-16 shrink-0">Subject:</span>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Map to title" className="flex-1 border-none focus:ring-0 text-sm py-1 text-gray-800" />
                </div>
            </div>
            <div className="px-4 py-2 flex items-center space-x-4 border-b border-gray-100 text-gray-400">
                <button className="hover:text-gray-600"><Bold size={16} /></button>
                <button className="hover:text-gray-600"><Underline size={16} /></button>
                <button className="hover:text-gray-600"><Italic size={16} /></button>
                <button className="hover:text-gray-600"><Strikethrough size={16} /></button>
                <div className="h-4 w-[1px] bg-gray-200"></div>
                <button className="hover:text-gray-600"><AlignLeft size={16} /></button>
                <button className="hover:text-gray-600"><AlignCenter size={16} /></button>
                <button className="hover:text-gray-600"><AlignRight size={16} /></button>
                <button className="hover:text-gray-600"><AlignJustify size={16} /></button>
            </div>
            <div className="p-4">
                <textarea placeholder="Message" value={message} onChange={(e) => setMessage(e.target.value)} className="w-full h-48 border-none focus:ring-0 text-sm resize-none p-0 placeholder-gray-400 text-gray-800"></textarea>
            </div>
            <div className="px-4 py-3 flex items-center justify-between bg-white border-t border-gray-50">
                <div className="flex items-center space-x-4">
                    <button onClick={handleSend} disabled={isSending} className="bg-primary hover:bg-primary-dark text-white px-5 py-2 rounded-lg text-sm font-bold flex items-center space-x-2 transition-colors disabled:opacity-70">
                        {isSending ? <Loader2 size={14} className="animate-spin" /> : <><span>Send</span><Send size={14} className="rotate-45 -mt-0.5" /></>}
                    </button>
                    <button className="text-gray-400 hover:text-gray-600"><Paperclip size={20} /></button>
                </div>
                <div className="flex items-center space-x-3 text-gray-400">
                    <button className="hover:text-gray-600"><MoreVertical size={20} /></button>
                    <button className="hover:text-red-500"><Trash2 size={20} /></button>
                </div>
            </div>
        </div>
    );
};

const MessageDetail: React.FC<{ 
    message: Message; 
    onBack: () => void; 
    onToggleStar: (id: string, starred: boolean) => void;
    onDelete: (id: string) => void;
    onRestore?: (id: string) => void;
    isTrash: boolean;
}> = ({ message, onBack, onToggleStar, onDelete, onRestore, isTrash }) => {
    return (
        <div className="flex flex-col h-full bg-white animate-in slide-in-from-right duration-300">
            <div className="h-16 border-b border-gray-100 flex items-center px-6 justify-between shrink-0 bg-white">
                <div className="flex items-center space-x-4">
                    <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800 truncate max-w-md">{message.subject}</h2>
                    <div className="flex space-x-2">
                        {message.labels.map((label, idx) => (
                            <span key={idx} className={`${label.color} text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider`}>
                                {label.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
            <div className="h-14 border-b border-gray-100 flex items-center justify-between px-6 bg-white shrink-0">
                <div className="flex items-center space-x-1">
                    <button onClick={() => onDelete(message.id)} className="p-2.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={18} /></button>
                    {isTrash && onRestore && (
                        <button onClick={() => onRestore(message.id)} className="p-2.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-primary transition-colors" title="Restore"><RotateCcw size={18} /></button>
                    )}
                </div>
                <div className="flex items-center space-x-1">
                    <button onClick={() => onToggleStar(message.id, message.isStarred)} className={`p-2.5 hover:bg-gray-100 rounded-md ${message.isStarred ? 'text-yellow-400' : 'text-gray-400'}`}>
                        <Star size={20} fill={message.isStarred ? "currentColor" : "none"} />
                    </button>
                    <button className="p-2.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors"><MoreVertical size={20} /></button>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-8 bg-white">
                <div className="flex justify-between items-start mb-10">
                    <div className="flex items-center space-x-4">
                        {/* FIX: Using standardized shadow image for MessageDetail */}
                        <img 
                            src={message.avatar || 'https://i.pravatar.cc/150?u=shadow'} 
                            alt={message.sender} 
                            className="w-14 h-14 rounded-full object-cover shadow-sm border border-gray-100" 
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/150?u=shadow';
                            }}
                        />
                        <div>
                            <h3 className="text-xl font-bold text-gray-800">{message.sender}</h3>
                            <p className="text-sm text-gray-500 font-medium">Email: {message.email || 'N/A'}</p>
                        </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-400">{message.fullDate}</span>
                </div>
                <div className="mb-12">
                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap font-medium text-lg">{message.body}</p>
                </div>
            </div>
        </div>
    );
};

const MessagesPage: React.FC = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [trashCount, setTrashCount] = useState<number>(0);
    const [starredCount, setStarredCount] = useState<number>(0);
    const [activeFolder, setActiveFolder] = useState('Inbox');
    const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isComposeOpen, setIsComposeOpen] = useState(false);
    
    // State for bulk selection
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isProcessingBulk, setIsProcessingBulk] = useState(false);

    // State for custom confirmation modal
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);

    const selectedMessage = useMemo(() => {
        if (!selectedMessageId) return null;
        return messages.find(m => m.id === selectedMessageId) || null;
    }, [selectedMessageId, messages]);

    const fetchCounts = async () => {
        try {
            const [unreadRes, trashRes, starredRes] = await Promise.all([
                interceptedFetch(`${API_BASE_URL}/api/v1/notifications/unread-count`),
                interceptedFetch(`${API_BASE_URL}/api/v1/notifications/trash?page=0&size=1`),
                interceptedFetch(`${API_BASE_URL}/api/v1/notifications?starred=true&page=0&size=1`)
            ]);
            const [unreadResult, trashResult, starredResult] = await Promise.all([unreadRes.json(), trashRes.json(), starredRes.json()]);
            if (unreadResult.success) setUnreadCount(unreadResult.data);
            if (trashResult.success) setTrashCount(trashResult.data.totalElements);
            if (starredResult.success) setStarredCount(starredResult.data.totalElements);
        } catch (error) { console.error("Failed to fetch counts:", error); }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        setSelectedIds([]); 
        try {
            let url = `${API_BASE_URL}/api/v1/notifications`;
            if (activeFolder === 'Trash') {
                url = `${API_BASE_URL}/api/v1/notifications/trash`;
            } else if (activeFolder === 'Sent') {
                url = `${API_BASE_URL}/api/v1/notifications/sent`;
            }

            const params = new URLSearchParams({ page: '0', size: '50', sort: 'createdAt,desc' });
            if (activeFolder === 'Starred') params.append('starred', 'true');
            if (searchQuery) params.append('search', searchQuery);

            const response = await interceptedFetch(`${url}?${params.toString()}`);
            const result = await response.json();
            if (result.success && result.data?.content) {
                const mapped: Message[] = result.data.content.map((n: Notification) => {
                    let senderName = "System Agent";
                    let senderEmail = "system.admin@pesaflow.com";
                    // FIX: Default avatar to shadow silhouette
                    let senderAvatar = 'https://i.pravatar.cc/150?u=shadow';
                    let isSystem = true;
                    if (n.senderId !== null) {
                        senderName = n.senderFullName || "Unknown User";
                        senderEmail = n.senderEmail || "N/A";
                        senderAvatar = `${API_BASE_URL}/api/v1/auth/users/${n.senderId}/profile-picture`;
                        isSystem = false;
                    } else if (n.senderFullName !== null) {
                        senderName = n.senderFullName;
                        senderEmail = n.senderEmail || "N/A";
                        senderAvatar = "https://i.pravatar.cc/150?u=shadow";
                        isSystem = false;
                    }
                    return {
                        id: String(n.id),
                        sender: senderName,
                        email: senderEmail,
                        avatar: senderAvatar,
                        subject: n.title,
                        snippet: n.message.length > 80 ? n.message.substring(0, 80) + '...' : n.message,
                        body: n.message,
                        date: formatNotificationDate(n.createdAt),
                        fullDate: formatFullNotificationDate(n.createdAt),
                        isStarred: n.starred,
                        read: n.read,
                        labels: [getLabelForType(n.type)],
                        isSystem: isSystem
                    };
                });
                setMessages(mapped);
            } else { setMessages([]); }
        } catch (error) { console.error("Failed to fetch notifications:", error); } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchNotifications();
        fetchCounts();
    }, [activeFolder, searchQuery]);

    const handleMessageClick = async (message: Message) => {
        setSelectedMessageId(message.id);
        if (!message.read) {
            try {
                await interceptedFetch(`${API_BASE_URL}/api/v1/notifications/${message.id}/read`, { method: 'PATCH' });
                setMessages(prev => prev.map(m => m.id === message.id ? { ...m, read: true } : m));
                fetchCounts();
            } catch (err) { console.error(err); }
        }
    };

    const toggleStar = async (id: string, starred: boolean) => {
        const action = starred ? 'unstar' : 'star';
        try {
            await interceptedFetch(`${API_BASE_URL}/api/v1/notifications/${id}/${action}`, { method: 'PATCH' });
            setMessages(prev => prev.map(m => m.id === id ? { ...m, isStarred: !starred } : m));
            fetchCounts();
        } catch (err) { console.error(err); }
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) setSelectedIds(messages.map(m => m.id));
        else setSelectedIds([]);
    };

    const handleToggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]);
    };

    const handleBulkDeleteInitiate = () => {
        if (selectedIds.length === 0) return;
        setPendingDeleteIds(selectedIds);
        setIsConfirmOpen(true);
    };

    const handleIndividualDeleteInitiate = (id: string) => {
        setPendingDeleteIds([id]);
        setIsConfirmOpen(true);
    };

    const confirmDeletion = async () => {
        setIsProcessingBulk(true);
        try {
            // Determine the API endpoint based on whether we are in the Trash folder
            const isTrash = activeFolder === 'Trash';
            
            await Promise.all(pendingDeleteIds.map(id => {
                const endpoint = isTrash 
                    ? `${API_BASE_URL}/api/v1/notifications/${id}/hard` 
                    : `${API_BASE_URL}/api/v1/notifications/${id}`;
                    
                return interceptedFetch(endpoint, { method: 'DELETE' });
            }));

            fetchNotifications(); 
            fetchCounts();
            if (pendingDeleteIds.includes(selectedMessageId || '')) setSelectedMessageId(null);
            setIsConfirmOpen(false);
            setPendingDeleteIds([]);
        } catch (error) { 
            alert("Some items could not be deleted."); 
        } finally { 
            setIsProcessingBulk(false); 
            setSelectedIds([]); 
        }
    };

    const handleBulkRestore = async () => {
        if (selectedIds.length === 0) return;
        setIsProcessingBulk(true);
        try {
            await Promise.all(selectedIds.map(id => interceptedFetch(`${API_BASE_URL}/api/v1/notifications/${id}/restore`, { method: 'PATCH' })));
            fetchNotifications(); fetchCounts();
        } catch (error) { console.error("Bulk restore failed", error); } finally { setIsProcessingBulk(false); setSelectedIds([]); }
    };

    const folders = [
        { name: 'Inbox', icon: <Mail size={18} />, count: unreadCount },
        { name: 'Sent', icon: <Send size={18} /> },
        { name: 'Starred', icon: <Star size={18} />, count: starredCount },
        { name: 'Trash', icon: <Trash2 size={18} />, count: trashCount }
    ];

    const deleteModalTitle = activeFolder === 'Trash' ? 'Permanently Delete?' : 'Delete Notification?';
    const deleteModalMessage = activeFolder === 'Trash' 
        ? `Are you sure you want to permanently delete ${pendingDeleteIds.length > 1 ? `${pendingDeleteIds.length} messages` : 'this message'}? This action cannot be undone.`
        : `Are you sure you want to delete ${pendingDeleteIds.length > 1 ? `${pendingDeleteIds.length} messages` : 'this message'}? This action will move them to the trash folder.`;

    return (
        <div className="flex h-[calc(100vh-140px)] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative text-on-surface">
            <div className="w-64 border-r border-gray-100 flex flex-col bg-gray-50/30">
                <div className="p-5">
                    <button onClick={() => setIsComposeOpen(true)} className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center space-x-2 transition-all">
                        <Plus size={20} /><span>Compose</span>
                    </button>
                </div>
                <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
                    {folders.map(folder => (
                        <button key={folder.name} onClick={() => { setActiveFolder(folder.name); setSelectedMessageId(null); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${activeFolder === folder.name ? 'bg-emerald-50 text-emerald-700' : 'text-gray-500 hover:bg-emerald-50/50 hover:text-emerald-600'}`}>
                            <div className="flex items-center space-x-3">{folder.icon}<span>{folder.name}</span></div>
                            {folder.count !== undefined && folder.count > 0 && <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-bold">{folder.count}</span>}
                        </button>
                    ))}
                    <div className="pt-8 pb-4 px-4 text-xs font-bold text-gray-400 uppercase tracking-widest">Labels</div>
                    {['Account', 'Transaction', 'Goal', 'Support'].map(label => (
                        <button key={label} className="w-full flex items-center px-4 py-3 rounded-lg text-sm font-semibold text-gray-500 hover:bg-emerald-50/50 hover:text-emerald-600 transition-colors">
                             <span className={`w-3 h-3 rounded-full mr-3 ${getLabelForType(label).color}`}></span>{label}
                        </button>
                    ))}
                </nav>
            </div>

            <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
                {selectedMessageId && selectedMessage ? (
                    <MessageDetail 
                        message={selectedMessage} 
                        onBack={() => setSelectedMessageId(null)} 
                        onToggleStar={toggleStar} 
                        onDelete={handleIndividualDeleteInitiate} 
                        onRestore={async (id) => {
                            await interceptedFetch(`${API_BASE_URL}/api/v1/notifications/${id}/restore`, { method: 'PATCH' });
                            setSelectedMessageId(null);
                            fetchNotifications();
                            fetchCounts();
                        }} 
                        isTrash={activeFolder === 'Trash'} 
                    />
                ) : (
                    <>
                        <div className="h-16 border-b border-gray-100 flex items-center px-6 shrink-0 bg-white">
                            <Search className="text-gray-400 mr-4" size={20} />
                            <input type="text" placeholder="Search mail" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-gray-700" />
                        </div>
                        <div className="h-14 border-b border-gray-100 flex items-center px-6 justify-between shrink-0 bg-white">
                             <div className="flex items-center space-x-4">
                                <input type="checkbox" className="rounded text-emerald-600 focus:ring-emerald-500 border-gray-300" checked={messages.length > 0 && selectedIds.length === messages.length} onChange={handleSelectAll} />
                                {selectedIds.length > 0 && (
                                    <div className="flex items-center space-x-2 animate-in fade-in zoom-in duration-200">
                                        <button onClick={handleBulkDeleteInitiate} disabled={isProcessingBulk} className="p-2 hover:bg-red-50 rounded-md text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50" title="Delete"><Trash2 size={18}/></button>
                                        <button onClick={handleBulkRestore} disabled={isProcessingBulk} className="p-2 hover:bg-emerald-50 rounded-md text-gray-500 hover:text-primary transition-colors disabled:opacity-50" title="Restore"><RotateCcw size={18}/></button>
                                    </div>
                                )}
                                <button className="p-2 hover:bg-gray-50 rounded-md text-gray-500 transition-colors"><MoreVertical size={18}/></button>
                             </div>
                             <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1 text-gray-400">
                                    <button onClick={fetchNotifications} className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Refresh"><RefreshCcw size={18} /></button>
                                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors"><MoreVertical size={18} /></button>
                                </div>
                                <div className="flex items-center space-x-3 text-gray-400">
                                    <span className="text-sm font-medium">1-50 of {messages.length}</span>
                                    <div className="flex space-x-1">
                                        <button className="p-1 hover:bg-emerald-50 rounded transition-colors"><ChevronLeft size={18}/></button>
                                        <button className="p-1 hover:bg-emerald-50 rounded transition-colors"><ChevronRight size={18}/></button>
                                    </div>
                                </div>
                             </div>
                        </div>
                        <div className="flex-1 overflow-y-auto bg-white">
                            {loading ? (
                                <div className="flex justify-center items-center h-full"><Loader2 className="animate-spin text-primary" size={32} /></div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center p-10">
                                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4"><Mail className="text-gray-300" size={40} /></div>
                                    <h3 className="text-xl font-bold text-gray-800">No mail found</h3>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {messages.map(msg => (
                                        <div key={msg.id} onClick={() => handleMessageClick(msg)} className={`flex items-center px-6 py-4 cursor-pointer hover:bg-emerald-50/20 transition-colors group ${!msg.read ? 'bg-emerald-50/30' : ''}`}>
                                            <div className="flex items-center space-x-4 shrink-0">
                                                <input type="checkbox" className="rounded text-emerald-600 focus:ring-emerald-500 border-gray-300" checked={selectedIds.includes(msg.id)} onClick={e => e.stopPropagation()} onChange={() => handleToggleSelect(msg.id)} />
                                                <button onClick={(e) => { e.stopPropagation(); toggleStar(msg.id, msg.isStarred); }} className={`${msg.isStarred ? 'text-yellow-400' : 'text-gray-300 group-hover:text-emerald-400'} transition-colors`}>
                                                    <Star size={18} fill={msg.isStarred ? "currentColor" : "none"} />
                                                </button>
                                                {/* FIX: Using standardized shadow image for Message List */}
                                                <img 
                                                    src={msg.avatar || 'https://i.pravatar.cc/150?u=shadow'} 
                                                    alt={msg.sender} 
                                                    className="w-10 h-10 rounded-full object-cover shadow-sm border border-gray-50"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://i.pravatar.cc/150?u=shadow';
                                                    }}
                                                />
                                            </div>
                                            <div className="ml-6 min-w-0 flex-1 flex items-center">
                                                <span className={`w-40 shrink-0 text-sm ${!msg.read ? 'font-bold text-gray-900' : 'text-gray-700'}`}>{msg.sender}</span>
                                                <div className="flex-1 min-w-0 md:ml-4">
                                                    <div className="flex items-center space-x-2">
                                                        <p className={`text-sm truncate ${!msg.read ? 'font-bold text-gray-900' : 'text-gray-700'}`}>{msg.subject}</p>
                                                        <span className="text-gray-400 font-normal"> - </span>
                                                        <p className="text-sm text-gray-500 truncate font-normal">{msg.snippet}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ml-4 shrink-0 flex items-center space-x-4">
                                                <div className="flex items-center space-x-1.5">
                                                    {msg.labels.map((label, idx) => (
                                                        <div key={idx} className={`w-2 h-2 rounded-full ${label.color}`} title={label.name}></div>
                                                    ))}
                                                </div>
                                                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={(e) => { e.stopPropagation(); handleIndividualDeleteInitiate(msg.id); }} className="p-1 text-gray-400 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                                                    <button onClick={(e) => e.stopPropagation()} className="p-1 text-gray-400 hover:text-emerald-600 transition-colors"><Archive size={16}/></button>
                                                </div>
                                                <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">{msg.date}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
            
            <ConfirmDeleteModal 
                isOpen={isConfirmOpen}
                onClose={() => { setIsConfirmOpen(false); setPendingDeleteIds([]); }}
                onConfirm={confirmDeletion}
                isLoading={isProcessingBulk}
                title={deleteModalTitle}
                message={deleteModalMessage}
                confirmButtonText={activeFolder === 'Trash' ? 'Permanently Delete' : 'Confirm Delete'}
            />

            <ComposeModal isOpen={isComposeOpen} onClose={() => setIsComposeOpen(false)} />
        </div>
    );
};

export default MessagesPage;