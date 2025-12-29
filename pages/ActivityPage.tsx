
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronDown, ChevronUp, Download, MoreVertical, Search, ChevronLeft, ChevronRight, XCircle, AlertCircle, Loader2, Filter, X
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { API_BASE_URL } from '../services/apiConfig';
import { interceptedFetch } from '../services/api';

// Defined based on API response
interface ActivityTransaction {
    id: number;
    transactionId: string;
    amount: number;
    transactionType: string; // INCOME or OUTCOME
    paymentType: string;
    channel: string;
    status: string;
    description: string;
    referenceId: string;
    referenceType: string;
    transactionDate: string;
    createdAt: string;
    currency: string;
}

type SortableKeys = keyof ActivityTransaction;

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return `${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
};

const formatString = (str: string) => {
    if (!str) return '';
    return str.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
};

const TypeIcon: React.FC<{ type: string }> = ({ type }) => {
    if (type === 'INCOME') {
        return <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100"><ChevronDown className="text-green-600" size={20} /></div>;
    }
    return <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100"><ChevronUp className="text-red-600" size={20} /></div>;
};

const StatusPill: React.FC<{ status: string }> = ({ status }) => {
    const normalizedStatus = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : '';
    const styles: { [key: string]: string } = {
        Completed: 'bg-green-100 text-green-700',
        Pending: 'bg-yellow-100 text-yellow-700',
        Cancelled: 'bg-red-100 text-red-700',
        Failed: 'bg-red-100 text-red-700',
    };
    return (
        <span className={`px-4 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap ${styles[normalizedStatus] || 'bg-gray-100 text-gray-700'}`}>
            {normalizedStatus}
        </span>
    );
};

const ChannelCell: React.FC<{ name: string }> = ({ name }) => {
    const displayNames: {[key: string]: string} = {
        'MOBILE_MONEY': 'Mobile Money',
        'CARD': 'Card',
        'BANK_TRANSFER': 'Bank Transfer'
    };
    const formattedName = displayNames[name] || formatString(name);
    const initial = formattedName.charAt(0).toUpperCase();
    return (
        <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg mr-3 bg-primary-light flex items-center justify-center font-bold text-primary-dark flex-shrink-0">
                {initial}
            </div>
            <div>
                <p className="font-semibold text-gray-800">{formattedName}</p>
            </div>
        </div>
    );
};

const SortableTableHeader: React.FC<{
    label: string;
    columnKey: SortableKeys;
    sortConfig: { key: string; direction: string };
    requestSort: (key: SortableKeys) => void;
}> = ({ label, columnKey, sortConfig, requestSort }) => {
    const isSorted = sortConfig.key === columnKey;
    const isAscending = isSorted && sortConfig.direction === 'ascending';
    const isDescending = isSorted && sortConfig.direction === 'descending';
    return (
        <div
            className="flex items-center space-x-2 text-gray-500 cursor-pointer hover:text-gray-800"
            onClick={() => requestSort(columnKey)}
            role="button"
            aria-label={`Sort by ${label}`}
        >
            <span>{label}</span>
            <div className="flex flex-col">
                <ChevronUp size={12} className={`-mb-1 transition-colors ${isAscending ? 'text-primary' : ''}`} />
                <ChevronDown size={12} className={`transition-colors ${isDescending ? 'text-primary' : ''}`} />
            </div>
        </div>
    );
};

const DateFilterModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onApply: (dates: { start: string; end: string }) => void;
}> = ({ isOpen, onClose, onApply }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    if (!isOpen) return null;
    const handleApply = () => {
        if (startDate && endDate) {
            onApply({ start: startDate, end: endDate });
            onClose();
        } else {
            alert('Please select both a start and end date.');
        }
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Filter by Date Range</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
                    </div>
                </div>
                <div className="p-6 bg-gray-50 border-t flex justify-end space-x-3">
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
                    <button onClick={handleApply} className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-dark">Apply Filter</button>
                </div>
            </div>
        </div>
    );
};

const ActivityPage = () => {
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys, direction: 'ascending' | 'descending' }>({ key: 'transactionDate', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const headerCheckboxRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [dateFilter, setDateFilter] = useState<{ start: string; end: string } | null>(null);

    // Data states
    const [transactions, setTransactions] = useState<ActivityTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const itemsPerPage = 8;
    
    const tabs = ['All', 'Completed', 'Pending', 'Cancelled', 'Failed'];

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!(event.target as HTMLElement).closest('.menu-container')) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchActivities = async () => {
        setLoading(true);
        try {
            const sortDirection = sortConfig.direction === 'ascending' ? 'asc' : 'desc';
            const params = new URLSearchParams({
                page: String(currentPage - 1),
                size: String(itemsPerPage),
                sortBy: sortConfig.key === 'channel' ? 'channel' : sortConfig.key === 'amount' ? 'amount' : 'transactionDate',
                sortDirection: sortDirection
            });

            if (debouncedSearchQuery) {
                params.append('search', debouncedSearchQuery);
            }

            if (activeTab !== 'All') {
                params.append('status', activeTab.toUpperCase());
            }

            if (dateFilter) {
                params.append('dateFrom', `${dateFilter.start}T00:00:00`);
                params.append('dateTo', `${dateFilter.end}T23:59:59`);
            }

            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/activities?${params.toString()}`);
            const data = await response.json();

            if (response.ok && data.success) {
                setTransactions(data.data.content);
                setTotalPages(data.data.totalPages);
                setTotalElements(data.data.totalElements);
            } else {
                setTransactions([]);
                setTotalPages(0);
                setTotalElements(0);
            }
        } catch (error) {
            console.error("Error fetching activities:", error);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, [currentPage, itemsPerPage, debouncedSearchQuery, activeTab, sortConfig, dateFilter]);

    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    const paginatedIds = useMemo(() => transactions.map(tx => tx.id), [transactions]);
    const areAllOnPageSelected = useMemo(() => paginatedIds.length > 0 && paginatedIds.every(id => selectedRows.includes(id)), [paginatedIds, selectedRows]);
    const areSomeOnPageSelected = useMemo(() => paginatedIds.some(id => selectedRows.includes(id)), [paginatedIds, selectedRows]);
    
    useEffect(() => {
        if (headerCheckboxRef.current) {
            headerCheckboxRef.current.indeterminate = areSomeOnPageSelected && !areAllOnPageSelected;
        }
    }, [areSomeOnPageSelected, areAllOnPageSelected]);

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelectedIds = new Set([...selectedRows, ...paginatedIds]);
            setSelectedRows(Array.from(newSelectedIds));
        } else {
            setSelectedRows(selectedRows.filter(id => !paginatedIds.includes(id)));
        }
    };

    const handleRowSelect = (id: number) => {
        setSelectedRows(prev => {
            if (prev.includes(id)) {
                return prev.filter(rowId => rowId !== id);
            }
            return [...prev, id];
        });
    };

    const handleTabClick = (tab: string) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };
    
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    const handleApplyDateFilter = (dates: { start: string; end: string }) => {
        setDateFilter(dates);
        setCurrentPage(1);
    };

    const handleClearFilter = () => {
        setDateFilter(null);
        setSearchQuery('');
        setCurrentPage(1);
    };
    
    const handleDownloadPDF = async () => {
        setIsDownloading(true);
        try {
            const params = new URLSearchParams();
            params.append('search', searchQuery || "");
            let apiSortBy = sortConfig.key as string;
            if (apiSortBy === 'transactionDate') apiSortBy = 'createdAt';
            params.append('sortBy', apiSortBy);
            params.append('dateFrom', dateFilter ? `${dateFilter.start}T00:00:00` : "");
            params.append('dateTo', dateFilter ? `${dateFilter.end}T23:59:59` : "");

            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/activities/download?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to download report from server.');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Activity_Report_${new Date().toISOString().split('T')[0]}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (e: any) {
            console.error("Download error:", e);
            alert("Error downloading report: " + e.message);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <>
            <DateFilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} onApply={handleApplyDateFilter} />
            <div className="p-4 sm:p-6 rounded-2xl bg-surface shadow-sm text-on-surface">
                {/* Header */}
                <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                        <div className="flex items-center gap-2">
                            <button onClick={() => setIsFilterModalOpen(true)} className="flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-lg font-semibold border border-gray-300 hover:bg-gray-100 transition-colors">
                                <Filter size={16} />
                                <span>Filter</span>
                            </button>
                            {dateFilter && (
                                <button onClick={handleClearFilter} className="flex items-center space-x-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg font-semibold hover:bg-red-200 transition-colors">
                                    <X size={16} />
                                    <span>Clear</span>
                                </button>
                            )}
                        </div>
                        <div className="flex items-center space-x-1 sm:space-x-4 border-b border-gray-200">
                            {tabs.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => handleTabClick(tab)}
                                    className={`px-2 py-3 font-semibold transition-colors duration-200 text-sm sm:text-base ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-primary'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center space-x-3 w-full sm:w-auto">
                        <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary transition"
                            />
                        </div>
                        <button 
                            onClick={handleDownloadPDF}
                            disabled={isDownloading}
                            className="flex items-center space-x-2 bg-primary text-white px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition disabled:bg-primary-light disabled:cursor-not-allowed min-w-[150px] justify-center"
                        >
                            {isDownloading ? (
                                <Loader2 size={18} className="animate-spin mr-2" />
                            ) : (
                                <Download size={18} className="mr-2" />
                            )}
                            <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px] text-left text-sm">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="p-4 w-12">
                                    <input
                                        type="checkbox"
                                        ref={headerCheckboxRef}
                                        checked={areAllOnPageSelected}
                                        onChange={handleSelectAll}
                                        className="bg-surface border-gray-300 rounded text-primary focus:ring-primary"
                                        aria-label="Select all transactions on this page"
                                    />
                                </th>
                                <th className="p-4 font-semibold"><SortableTableHeader label="Transaction ID" columnKey="transactionId" sortConfig={sortConfig} requestSort={requestSort} /></th>
                                <th className="p-4 font-semibold"><SortableTableHeader label="Date" columnKey="transactionDate" sortConfig={sortConfig} requestSort={requestSort} /></th>
                                <th className="p-4 font-semibold"><SortableTableHeader label="Channel" columnKey="channel" sortConfig={sortConfig} requestSort={requestSort} /></th>
                                <th className="p-4 font-semibold"><SortableTableHeader label="Amount" columnKey="amount" sortConfig={sortConfig} requestSort={requestSort} /></th>
                                <th className="p-4 font-semibold"><SortableTableHeader label="Type" columnKey="transactionType" sortConfig={sortConfig} requestSort={requestSort} /></th>
                                <th className="p-4 font-semibold"><SortableTableHeader label="Payment Type" columnKey="paymentType" sortConfig={sortConfig} requestSort={requestSort} /></th>
                                <th className="p-4 font-semibold"><SortableTableHeader label="Status" columnKey="status" sortConfig={sortConfig} requestSort={requestSort} /></th>
                                <th className="p-4 font-semibold"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, idx) => (
                                    <tr key={idx} className="border-b border-gray-200 animate-pulse">
                                        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-4"></div></td>
                                        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                                        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                                        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                                        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                                        <td className="p-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                                        <td className="p-4"></td>
                                    </tr>
                                ))
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="text-center py-10 text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="bg-gray-100 p-4 rounded-full mb-3">
                                                <AlertCircle size={24} className="text-gray-400" />
                                            </div>
                                            <p className="font-semibold text-gray-600">No records found</p>
                                            <p className="text-sm text-gray-400 mt-1">There are no {activeTab === 'All' ? '' : activeTab.toLowerCase()} transactions to display.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map(tx => (
                                <tr key={tx.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.includes(tx.id)}
                                            onChange={() => handleRowSelect(tx.id)}
                                            className="bg-surface border-gray-300 rounded text-primary focus:ring-primary"
                                            aria-label={`Select transaction ${tx.transactionId}`}
                                        />
                                    </td>
                                    <td className="p-4 text-gray-500">{tx.transactionId}</td>
                                    <td className="p-4 text-gray-500">{formatDate(tx.transactionDate)}</td>
                                    <td className="p-4"><ChannelCell name={tx.channel} /></td>
                                    <td className="p-4 font-bold text-gray-800">{tx.currency} {tx.amount.toLocaleString()}</td>
                                    <td className="p-4">
                                        <div className="flex items-center space-x-2">
                                            <TypeIcon type={tx.transactionType} />
                                            <span className="text-gray-800 font-medium">{formatString(tx.transactionType)}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-500">{formatString(tx.paymentType)}</td>
                                    <td className="p-4"><StatusPill status={tx.status} /></td>
                                    <td className="p-4">
                                         <div className="relative menu-container">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(openMenuId === tx.id ? null : tx.id);
                                                }}
                                                className={`p-1 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none transition-shadow ${openMenuId === tx.id ? 'ring-2 ring-blue-400' : ''}`}
                                            >
                                                <MoreVertical size={20} />
                                            </button>
                                            {openMenuId === tx.id && (
                                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-20 p-2 border border-gray-100">
                                                    <ul className="text-sm text-gray-800 font-medium">
                                                        <li>
                                                            <button
                                                                onClick={() => { alert('Cancel clicked'); setOpenMenuId(null); }} 
                                                                className="w-full text-left flex items-center px-3 py-2 hover:bg-gray-100 rounded-md"
                                                            >
                                                                <XCircle size={18} className="text-red-500 mr-3" />
                                                                <span>Cancel Transactions</span>
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button
                                                                onClick={() => { navigate(`/activity/${tx.transactionId}`); setOpenMenuId(null); }}
                                                                className="w-full text-left flex items-center px-3 py-2 hover:bg-gray-100 rounded-md"
                                                            >
                                                                <AlertCircle size={18} className="text-yellow-400 mr-3" />
                                                                <span>View Details</span>
                                                            </button>
                                                        </li>
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>

                {/* Footer */}
                <div className="flex flex-wrap justify-between items-center mt-6 text-sm text-gray-500 gap-4">
                    <p>Showing {transactions.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalElements)} of {totalElements} entries</p>
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-primary disabled:opacity-50 disabled:text-gray-400"><ChevronLeft size={18} /></button>
                        <span className="px-2 font-semibold text-gray-700">Page {currentPage} of {totalPages > 0 ? totalPages : 1}</span>
                        <button onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage === totalPages || totalPages === 0} className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-primary disabled:opacity-50 disabled:text-gray-400"><ChevronRight size={18} /></button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ActivityPage;
