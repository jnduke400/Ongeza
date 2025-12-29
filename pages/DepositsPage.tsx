
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
    ChevronUp, ChevronDown, SlidersHorizontal, X, Wallet, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Search, Download, TrendingUp, FileText, Loader2, XCircle
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { API_BASE_URL } from '../services/apiConfig';
import { interceptedFetch } from '../services/api';

// Interface matching the backend API response
interface Deposit {
    requestTime: string;
    formattedRequestTime: string;
    name: string;
    accountNumber: string;
    reference: string;
    phoneNumber: string | null;
    receiptNumber: string;
    channel: string;
    amount: number;
    currency?: string; // Optional since not in sample but usually present
}

type SortableKeys = 'requestTime' | 'name' | 'accountNumber' | 'reference' | 'phoneNumber' | 'receiptNumber' | 'channel' | 'amount';

const SortableTableHeader: React.FC<{
    label: string;
    columnKey: SortableKeys;
    sortConfig: { key: string; direction: string };
    requestSort: (key: SortableKeys) => void;
    className?: string;
}> = ({ label, columnKey, sortConfig, requestSort, className = '' }) => {
    const isSorted = sortConfig.key === columnKey;
    const isAscending = isSorted && sortConfig.direction === 'ascending';
    
    return (
        <th 
            className={`p-4 font-normal cursor-pointer whitespace-nowrap ${className}`}
            onClick={() => requestSort(columnKey)}
        >
            <div className="flex items-center space-x-1 text-gray-500 hover:text-gray-800">
                 <span className="uppercase text-xs font-semibold">{label}</span>
                 <div className="flex flex-col">
                    <ChevronUp size={14} className={`-mb-1.5 transition-colors ${isAscending ? 'text-indigo-600' : ''}`} />
                    <ChevronDown size={14} className={`-mt-1.5 transition-colors ${isSorted && !isAscending ? 'text-indigo-600' : ''}`} />
                </div>
            </div>
        </th>
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
        onApply({ start: startDate, end: endDate });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Filter by Date</h2>
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
                    <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
                    <button onClick={handleApply} className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-700">Apply</button>
                </div>
            </div>
        </div>
    );
};

const DepositsPage: React.FC = () => {
    const [deposits, setDeposits] = useState<Deposit[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadingFormat, setDownloadingFormat] = useState<'pdf' | 'csv' | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' }>({ key: 'createdAt', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(20);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [dateFilter, setDateFilter] = useState<{ start: string; end: string } | null>(null);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchDeposits = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            
            // Requirements: pass empty string not null
            params.append('search', debouncedSearch || '');
            
            // Format dates as ISO with time as requested
            params.append('dateFrom', dateFilter?.start ? `${dateFilter.start}T00:00:00` : '');
            params.append('dateTo', dateFilter?.end ? `${dateFilter.end}T23:59:59` : '');
            
            // Map UI sort keys to API sort keys
            let apiSortBy = sortConfig.key;
            if (apiSortBy === 'requestTime') apiSortBy = 'createdAt';
            
            params.append('sortBy', apiSortBy);
            params.append('sortDirection', sortConfig.direction === 'ascending' ? 'asc' : 'desc');
            params.append('page', String(currentPage - 1));
            params.append('size', String(itemsPerPage));

            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/reports/deposits?${params.toString()}`);
            const data = await response.json();

            if (response.ok) {
                setDeposits(data.content || []);
                setTotalPages(data.totalPages || 0);
                setTotalElements(data.totalElements || 0);
            } else {
                throw new Error(data.message || 'Failed to fetch deposits report.');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch, dateFilter, sortConfig, currentPage, itemsPerPage]);

    useEffect(() => {
        fetchDeposits();
    }, [fetchDeposits]);

    const requestSort = (key: SortableKeys) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
        }));
        setCurrentPage(1);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setDebouncedSearch('');
        setDateFilter(null);
        setCurrentPage(1);
    };
    
    const handleApplyDateFilter = (dates: { start: string; end: string }) => {
        setDateFilter(dates.start && dates.end ? dates : null);
        setCurrentPage(1);
    };

    const handleExport = async (format: 'pdf' | 'csv') => {
        setDownloadingFormat(format);
        try {
            const params = new URLSearchParams();
            params.append('format', format);
            params.append('search', debouncedSearch || '');
            params.append('dateFrom', dateFilter?.start ? `${dateFilter.start}T00:00:00` : '');
            params.append('dateTo', dateFilter?.end ? `${dateFilter.end}T23:59:59` : '');
            
            let apiSortBy = sortConfig.key;
            if (apiSortBy === 'requestTime') apiSortBy = 'createdAt';
            params.append('sortBy', apiSortBy);

            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/reports/deposits/export?${params.toString()}`);
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to export report');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Deposits_Report_${new Date().toISOString().split('T')[0]}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (err: any) {
            console.error("Export error:", err);
            alert("Export failed: " + err.message);
        } finally {
            setDownloadingFormat(null);
        }
    };

    return (
        <div className="space-y-6">
            <DateFilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} onApply={handleApplyDateFilter} />
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Deposits Report</h1>
                <p className="text-gray-500 mt-1">This report shows all customer deposit transactions from various payment partners.</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                 <div className="p-4 flex flex-wrap justify-between items-center gap-4 border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setIsFilterModalOpen(true)} className="flex items-center space-x-2 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
                            <SlidersHorizontal size={14}/>
                            <span>Filter</span>
                        </button>
                        {(debouncedSearch || dateFilter) && (
                            <button onClick={clearFilters} className="px-3 py-1.5 border border-red-200 text-red-600 rounded-md text-sm font-medium hover:bg-red-50 transition-colors flex items-center space-x-1">
                                <X size={14}/>
                                <span>Clear</span>
                            </button>
                        )}
                    </div>
                    <div className="flex items-center flex-wrap gap-2">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search deposits..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm w-48 focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <button 
                            onClick={() => handleExport('csv')} 
                            disabled={downloadingFormat !== null}
                            className="flex items-center space-x-2 bg-primary text-white px-3 py-2 rounded-lg font-semibold hover:bg-primary-dark transition text-sm shadow-sm disabled:opacity-70"
                        >
                            {downloadingFormat === 'csv' ? <Loader2 size={16} className="animate-spin" /> : <TrendingUp size={16} />}
                            <span>Export CSV</span>
                        </button>
                        <button 
                            onClick={() => handleExport('pdf')} 
                            disabled={downloadingFormat !== null}
                            className="flex items-center space-x-2 bg-indigo-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition text-sm shadow-sm disabled:opacity-70"
                        >
                            {downloadingFormat === 'pdf' ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                            <span>Download PDF</span>
                        </button>
                    </div>
                </div>
                
                <div className="overflow-x-auto min-h-[400px] relative">
                    {loading && (
                        <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center">
                            <div className="flex flex-col items-center space-y-2">
                                <Loader2 className="animate-spin text-primary" size={32} />
                                <span className="text-sm font-medium text-gray-500 tracking-wide uppercase">Syncing Records...</span>
                            </div>
                        </div>
                    )}
                    
                    <table className="w-full text-sm">
                        <thead className="border-b-2 border-gray-100 bg-gray-50/50">
                             <tr>
                                <SortableTableHeader label="Request Time" columnKey="requestTime" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableTableHeader label="Name" columnKey="name" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableTableHeader label="Account" columnKey="accountNumber" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableTableHeader label="Reference" columnKey="reference" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableTableHeader label="Phone Number" columnKey="phoneNumber" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableTableHeader label="Receipt Number" columnKey="receiptNumber" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableTableHeader label="Channel" columnKey="channel" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableTableHeader label="Amount" columnKey="amount" sortConfig={sortConfig} requestSort={requestSort} />
                                <th className="p-4"></th>
                            </tr>
                        </thead>
                         <tbody>
                            {deposits.length > 0 ? (
                                deposits.map((deposit, idx) => (
                                    <tr key={`${deposit.receiptNumber}-${idx}`} className="border-t border-gray-100 hover:bg-gray-50/80 transition-colors">
                                        <td className="p-4 text-gray-600 whitespace-nowrap">{deposit.formattedRequestTime}</td>
                                        <td className="p-4 font-medium text-gray-800">{deposit.name}</td>
                                        <td className="p-4 text-gray-600">{deposit.accountNumber}</td>
                                        <td className="p-4 font-medium text-gray-800">{deposit.reference}</td>
                                        <td className="p-4 text-gray-600">{deposit.phoneNumber || 'N/A'}</td>
                                        <td className="p-4 text-gray-600 font-mono text-xs">{deposit.receiptNumber}</td>
                                        <td className="p-4">
                                            <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-semibold uppercase">{deposit.channel}</span>
                                        </td>
                                        <td className="p-4 font-bold text-gray-900">TZS {deposit.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="p-4 text-right">
                                            <button className="text-gray-400 hover:text-indigo-600 p-1.5 rounded-full hover:bg-indigo-50 transition-all">
                                                <Wallet size={18}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : !loading && (
                                <tr>
                                    <td colSpan={9} className="text-center py-20 text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="bg-gray-100 p-4 rounded-full mb-3">
                                                <XCircle size={32} className="text-gray-400" />
                                            </div>
                                            <p className="font-semibold text-gray-600">No records found matching your criteria.</p>
                                            <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search query.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                 <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-100 text-sm gap-4">
                    <span className="text-gray-600 font-medium">
                        Showing {totalElements > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalElements)} of {totalElements} entries
                    </span>
                    <div className="flex items-center space-x-1">
                        <button 
                            onClick={() => setCurrentPage(1)} 
                            disabled={currentPage === 1 || loading} 
                            className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"
                        >
                            <ChevronsLeft size={18} />
                        </button>
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                            disabled={currentPage === 1 || loading} 
                            className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        
                        <div className="flex items-center px-4 font-bold text-gray-800">
                            Page {currentPage} of {totalPages || 1}
                        </div>

                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                            disabled={currentPage >= totalPages || loading} 
                            className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"
                        >
                            <ChevronRight size={18} />
                        </button>
                        <button 
                            onClick={() => setCurrentPage(totalPages)} 
                            disabled={currentPage >= totalPages || loading} 
                            className="p-2 rounded hover:bg-gray-100 disabled:opacity-30 transition-colors"
                        >
                            <ChevronsRight size={18} />
                        </button>
                        
                        <div className="ml-4 flex items-center space-x-2">
                            <span className="text-gray-500">Rows:</span>
                            <select 
                                value={itemsPerPage} 
                                onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary bg-white font-medium"
                                disabled={loading}
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepositsPage;
