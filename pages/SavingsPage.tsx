
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronDown, ChevronUp, Download, MoreVertical, Search, ChevronLeft, ChevronRight, XCircle, AlertCircle, Filter, X, Loader2
} from 'lucide-react';
import { API_BASE_URL } from '../services/apiConfig';
import { interceptedFetch } from '../services/api';

// Interface matching the API response
interface SavingsTransaction {
    transactionId: string;
    date: string;
    formattedDate: string;
    channel: string;
    channelCode: string;
    amount: number;
    type: string;
    paymentType: string;
    status: string;
}

type SortableKeys = keyof SavingsTransaction;

// Reusable components
const TypeIcon: React.FC<{ type: string }> = ({ type }) => {
    // API returns 'Income' or 'Outcome' (or similar variants)
    const isIncome = type?.toLowerCase() === 'income';
    
    if (isIncome) {
        return <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100"><ChevronDown className="text-green-600" size={20} /></div>;
    }
    return <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100"><ChevronUp className="text-red-600" size={20} /></div>;
};

const StatusPill: React.FC<{ status: string }> = ({ status }) => {
    const styles: { [key: string]: string } = {
        Completed: 'bg-green-100 text-green-700',
        Pending: 'bg-yellow-100 text-yellow-700',
        Cancelled: 'bg-red-100 text-red-700',
        Failed: 'bg-red-100 text-red-700',
    };
    // Normalize status case for matching
    const normalizedStatus = status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : '';
    
    return (
        <span className={`px-4 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap ${styles[normalizedStatus] || 'bg-gray-100 text-gray-700'}`}>
            {normalizedStatus}
        </span>
    );
};

const ChannelCell: React.FC<{ name: string }> = ({ name }) => {
    const initial = name ? name.charAt(0).toUpperCase() : '?';
    return (
        <div className="flex items-center">
            <div className="w-10 h-10 rounded-lg mr-3 bg-primary-light flex items-center justify-center font-bold text-primary-dark flex-shrink-0">
                {initial}
            </div>
            <div>
                <p className="font-semibold text-gray-800">{name}</p>
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


const SavingsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    // Default sort by date (mapped to createdAt in API)
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys, direction: 'ascending' | 'descending' }>({ key: 'date', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const headerCheckboxRef = useRef<HTMLInputElement>(null);
    const itemsPerPage = 20; 
    const tabs = ['All', 'Completed', 'Pending', 'Cancelled', 'Failed'];
    const navigate = useNavigate();
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [dateFilter, setDateFilter] = useState<{ start: string; end: string } | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // API Data state
    const [transactions, setTransactions] = useState<SavingsTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Debounce Search
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
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchSavingsTransactions = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            
            // Pagination
            params.append('page', String(currentPage - 1));
            params.append('size', String(itemsPerPage));

            // Sorting
            const sortDirection = sortConfig.direction === 'ascending' ? 'asc' : 'desc';
            
            // Map table column 'date' or 'formattedDate' to API field 'createdAt'
            let sortKey = sortConfig.key;
            if (sortKey === 'formattedDate' || sortKey === 'date') {
                sortKey = 'createdAt' as any;
            }
            
            params.append('sortBy', sortKey);
            params.append('sortDirection', sortDirection);

            // Search - pass empty string if no search (not null)
            params.append('search', debouncedSearchQuery || '');

            // Status Filter
            if (activeTab !== 'All') {
                params.append('status', activeTab.toUpperCase());
            }

            // Date Filter - convert to ISO DateTime with start/end of day
            if (dateFilter) {
                params.append('dateFrom', `${dateFilter.start}T00:00:00`);
                params.append('dateTo', `${dateFilter.end}T23:59:59`);
            }

            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/reports/savings?${params.toString()}`);
            const data = await response.json();

            if (response.ok && data.content) {
                setTransactions(data.content);
                setTotalPages(data.totalPages);
                setTotalElements(data.totalElements);
            } else {
                setTransactions([]);
                setTotalPages(0);
                setTotalElements(0);
            }
        } catch (error) {
            console.error("Error fetching savings report:", error);
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSavingsTransactions();
    }, [currentPage, itemsPerPage, sortConfig, debouncedSearchQuery, dateFilter, activeTab]);


    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
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

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            const newSelectedIds = new Set([...selectedRows, ...transactions.map(t => t.transactionId)]);
            setSelectedRows(Array.from(newSelectedIds));
        } else {
            const currentIds = transactions.map(t => t.transactionId);
            setSelectedRows(selectedRows.filter(id => !currentIds.includes(id)));
        }
    };

    const handleRowSelect = (id: string) => {
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
    }
    
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    }
    
    const handleDownloadPDF = async () => {
        setIsDownloading(true);
        try {
            const params = new URLSearchParams();

            // Sorting
            const sortDirection = sortConfig.direction === 'ascending' ? 'asc' : 'desc';
            let sortKey = sortConfig.key;
            if (sortKey === 'formattedDate' || sortKey === 'date') {
                sortKey = 'createdAt' as any;
            }
            params.append('sortBy', sortKey);
            params.append('sortDirection', sortDirection);

            // Search
            params.append('search', debouncedSearchQuery || '');

            // Status Filter
            if (activeTab !== 'All') {
                params.append('status', activeTab.toUpperCase());
            }

            // Date Filter - Pass values only if selected, else empty string as requested
            params.append('dateFrom', dateFilter ? `${dateFilter.start}T00:00:00` : '');
            params.append('dateTo', dateFilter ? `${dateFilter.end}T23:59:59` : '');

            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/reports/savings/download?${params.toString()}`);
            
            if (!response.ok) {
                 throw new Error('Failed to download report');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Savings_Report_${new Date().toISOString().split('T')[0]}.pdf`; 
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (error) {
            console.error("Error downloading PDF:", error);
            alert("Failed to download PDF. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };

    // Calculate selection state for current page
    const currentIds = transactions.map(t => t.transactionId);
    const areAllOnPageSelected = currentIds.length > 0 && currentIds.every(id => selectedRows.includes(id));
    const areSomeOnPageSelected = currentIds.some(id => selectedRows.includes(id));
    
    useEffect(() => {
        if (headerCheckboxRef.current) {
            headerCheckboxRef.current.indeterminate = areSomeOnPageSelected && !areAllOnPageSelected;
        }
    }, [areSomeOnPageSelected, areAllOnPageSelected]);


    return (
        <>
            <DateFilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} onApply={handleApplyDateFilter} />
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Savings Report</h1>
                    <p className="text-gray-500 mt-2">A detailed report of all your savings activities, including deposits and interest earned.</p>
                </div>
                
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
                                placeholder="Search savings..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary transition"
                            />
                        </div>
                        <button 
                            onClick={handleDownloadPDF}
                            disabled={isDownloading}
                            className="flex items-center space-x-2 bg-primary text-white px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition disabled:bg-primary-light disabled:cursor-not-allowed"
                        >
                            {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                            <span className="hidden sm:inline">{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
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
                                <th className="p-4 font-semibold"><SortableTableHeader label="Date" columnKey="formattedDate" sortConfig={sortConfig} requestSort={requestSort} /></th>
                                <th className="p-4 font-semibold"><SortableTableHeader label="Channel" columnKey="channel" sortConfig={sortConfig} requestSort={requestSort} /></th>
                                <th className="p-4 font-semibold"><SortableTableHeader label="Amount" columnKey="amount" sortConfig={sortConfig} requestSort={requestSort} /></th>
                                <th className="p-4 font-semibold"><SortableTableHeader label="Type" columnKey="type" sortConfig={sortConfig} requestSort={requestSort} /></th>
                                <th className="p-4 font-semibold"><SortableTableHeader label="Payment Type" columnKey="paymentType" sortConfig={sortConfig} requestSort={requestSort} /></th>
                                <th className="p-4 font-semibold"><SortableTableHeader label="Status" columnKey="status" sortConfig={sortConfig} requestSort={requestSort} /></th>
                                <th className="p-4 font-semibold"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <tr key={index} className="border-b border-gray-200 animate-pulse">
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
                            ) : transactions.map(tx => (
                                <tr key={tx.transactionId} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedRows.includes(tx.transactionId)}
                                            onChange={() => handleRowSelect(tx.transactionId)}
                                            className="bg-surface border-gray-300 rounded text-primary focus:ring-primary"
                                            aria-label={`Select transaction ${tx.transactionId}`}
                                        />
                                    </td>
                                    <td className="p-4 text-gray-500">{tx.transactionId}</td>
                                    <td className="p-4 text-gray-500">{tx.formattedDate}</td>
                                    <td className="p-4"><ChannelCell name={tx.channel} /></td>
                                    <td className="p-4 font-bold text-gray-800">TZS {tx.amount.toLocaleString()}</td>
                                    <td className="p-4">
                                        <div className="flex items-center space-x-2">
                                            <TypeIcon type={tx.type} />
                                            <span className="text-gray-800 font-medium">{tx.type}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-500">{tx.paymentType}</td>
                                    <td className="p-4"><StatusPill status={tx.status} /></td>
                                    <td className="p-4">
                                        <div className="relative menu-container">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setOpenMenuId(openMenuId === tx.transactionId ? null : tx.transactionId);
                                                }}
                                                className={`p-1 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none transition-shadow ${openMenuId === tx.transactionId ? 'ring-2 ring-blue-400' : ''}`}
                                                aria-haspopup="true"
                                                aria-expanded={openMenuId === tx.transactionId}
                                            >
                                                <MoreVertical size={20} />
                                            </button>
                                            {openMenuId === tx.transactionId && (
                                                <div 
                                                    className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-20 p-2 border border-gray-100"
                                                    role="menu"
                                                >
                                                    <ul className="text-sm text-gray-800 font-medium">
                                                        <li>
                                                            <button
                                                                onClick={() => { alert('Cancel clicked'); setOpenMenuId(null); }} 
                                                                className="w-full text-left flex items-center px-3 py-2 hover:bg-gray-100 rounded-md"
                                                                role="menuitem"
                                                            >
                                                                <XCircle size={18} className="text-red-500 mr-3" />
                                                                <span>Cancel Transaction</span>
                                                            </button>
                                                        </li>
                                                        <li>
                                                            <button
                                                                onClick={() => { navigate(`/activity/${tx.transactionId}`); setOpenMenuId(null); }}
                                                                className="w-full text-left flex items-center px-3 py-2 hover:bg-gray-100 rounded-md"
                                                                role="menuitem"
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
                            ))}
                        </tbody>
                    </table>
                    {!loading && transactions.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            <p>No savings transactions found.</p>
                        </div>
                    )}
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
            </div>
        </>
    );
};

export default SavingsPage;
