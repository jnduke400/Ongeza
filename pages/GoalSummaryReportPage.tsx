
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ChevronDown, ChevronUp, Download, Search, ChevronLeft, ChevronRight, Activity, TrendingUp, DollarSign, Loader2, Filter, X
} from 'lucide-react';
import { API_BASE_URL } from '../services/apiConfig';
import { interceptedFetch } from '../services/api';
import { GoalSummaryItem } from '../types';

type Summary = GoalSummaryItem;
type SortableKeys = keyof Summary;

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; color: string }> = ({ icon, title, value, color }) => (
    <div className="bg-surface p-6 rounded-2xl shadow-sm flex items-center">
        <div className={`h-12 w-12 rounded-full flex items-center justify-center mr-4 ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const SourceCell: React.FC<{ name: string }> = ({ name }) => {
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

const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const GoalSummaryReportPage = () => {
    const { goalId } = useParams<{ goalId: string }>();
    const [goalName, setGoalName] = useState<string>('');
    const [stats, setStats] = useState({ totalDeposits: 0, totalTransactions: 0, mostFrequentSource: 'N/A' });
    const [summaryItems, setSummaryItems] = useState<GoalSummaryItem[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [isDownloading, setIsDownloading] = useState(false);
    const [error, setError] = useState('');

    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys, direction: 'ascending' | 'descending' }>({ key: 'totalAmount', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [dateFilter, setDateFilter] = useState<{ start: string; end: string } | null>(null);
    
    useEffect(() => {
        const fetchData = async () => {
            if (!goalId) return;
            setLoading(true);
            setError('');
            try {
                // 1. Fetch Goal Details (for name)
                const goalRes = await interceptedFetch(`${API_BASE_URL}/api/v1/goals/${goalId}`);
                const goalData = await goalRes.json();
                if (goalData.success) setGoalName(goalData.data.goalName);

                // Build common params for filtered data
                const dateParams = new URLSearchParams();
                if (dateFilter) {
                    dateParams.append('dateFrom', `${dateFilter.start}T00:00:00`);
                    dateParams.append('dateTo', `${dateFilter.end}T23:59:59`);
                }

                // 2. Fetch Summary Stats
                const statsRes = await interceptedFetch(`${API_BASE_URL}/api/v1/goals/${goalId}/summary?${dateParams.toString()}`);
                const statsData = await statsRes.json();
                if (statsData.success) {
                    setStats({
                        totalDeposits: statsData.data.totalDeposits,
                        totalTransactions: statsData.data.totalTransactions,
                        mostFrequentSource: statsData.data.mostFrequentSource || 'None',
                    });
                }

                // 3. Fetch Transaction Sources
                const sourcesRes = await interceptedFetch(`${API_BASE_URL}/api/v1/goals/${goalId}/transaction-sources?${dateParams.toString()}`);
                const sourcesData = await sourcesRes.json();
                if (sourcesData.success && Array.isArray(sourcesData.data)) {
                    const mappedItems: GoalSummaryItem[] = sourcesData.data.map((item: any) => ({
                        source: item.source,
                        totalAmount: item.totalAmount,
                        transactionCount: item.transactionCount,
                        averageAmount: item.averageAmount,
                        lastTransactionDate: item.lastDeposit,
                    }));
                    setSummaryItems(mappedItems);
                }
            } catch (e) {
                console.error(e);
                setError("Failed to load summary report.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [goalId, dateFilter]);

    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    const processedSummary = useMemo(() => {
        let summaryData = [...summaryItems];
        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            summaryData = summaryData.filter(item => item.source.toLowerCase().includes(lowercasedQuery));
        }
        summaryData.sort((a, b) => {
            const key = sortConfig.key;
            let aValue: string | number | Date = a[key];
            let bValue: string | number | Date = b[key];
            if (key === 'lastTransactionDate') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }
            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
        return summaryData;
    }, [searchQuery, sortConfig, summaryItems]);

    const totalPages = Math.ceil(processedSummary.length / itemsPerPage);
    const paginatedSummary = processedSummary.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
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
    
    const handleDownloadPDF = async () => {
        if (!goalId) return;
        setIsDownloading(true);
        try {
            const params = new URLSearchParams();
            params.append('search', searchQuery || '');
            let apiSortBy = sortConfig.key as string;
            if (apiSortBy === 'lastTransactionDate') apiSortBy = 'lastDeposit';
            params.append('sortBy', apiSortBy);
            params.append('sortDirection', sortConfig.direction === 'ascending' ? 'asc' : 'desc');
            params.append('dateFrom', dateFilter ? `${dateFilter.start}T00:00:00` : '');
            params.append('dateTo', dateFilter ? `${dateFilter.end}T23:59:59` : '');

            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/goals/${goalId}/transaction-sources/download?${params.toString()}`);
            if (!response.ok) throw new Error('Failed to download report from server.');
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const cleanGoalName = goalName ? goalName.replace(/\s+/g, '_') : 'Goal';
            const dateStr = new Date().toISOString().split('T')[0];
            a.download = `Goal_Summary_${cleanGoalName}_${dateStr}.pdf`;
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
    
    if (loading && !stats.totalTransactions) return <div className="p-8 text-center">Loading Summary...</div>;
    if (error) return (
        <div className="space-y-6">
            <Link to={`/goals/${goalId}`} className="flex items-center text-primary hover:underline font-semibold"><ChevronLeft size={20} className="mr-1"/>Back to Goal Details</Link>
            <div className="p-8 text-center text-red-500">{error}</div>
        </div>
    );

    return (
        <>
            <DateFilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} onApply={handleApplyDateFilter} />
            <div className="space-y-6">
                <Link to={`/goals/${goalId}`} className="flex items-center text-primary hover:underline font-semibold"><ChevronLeft size={20} className="mr-1"/>Back to Goal Details</Link>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     <StatCard icon={<DollarSign size={24} className="text-white"/>} title="Total Deposits" value={`TZS ${stats.totalDeposits.toLocaleString()}`} color="bg-green-500" />
                     <StatCard icon={<Activity size={24} className="text-white"/>} title="Total Transactions" value={`${stats.totalTransactions}`} color="bg-blue-500" />
                     <StatCard icon={<TrendingUp size={24} className="text-white"/>} title="Most Frequent Source" value={stats.mostFrequentSource} color="bg-indigo-500" />
                </div>
                 <div className="p-4 sm:p-6 rounded-2xl bg-surface shadow-sm text-on-surface">
                    {/* Header */}
                    <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-800">Goal Summary Report</h1>
                                <p className="text-gray-500 mt-1">Summary for goal: <span className="font-semibold">{goalName}</span></p>
                            </div>
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
                        </div>
                        <div className="flex items-center space-x-3 w-full sm:w-auto">
                            <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search sources..."
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
                                {isDownloading ? <Loader2 size={18} className="animate-spin mr-2" /> : <Download size={18} className="mr-2" />}
                                <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px] text-left text-sm">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="p-4 font-semibold"><SortableTableHeader label="Source" columnKey="source" sortConfig={sortConfig} requestSort={requestSort} /></th>
                                    <th className="p-4 font-semibold"><SortableTableHeader label="Total Amount" columnKey="totalAmount" sortConfig={sortConfig} requestSort={requestSort} /></th>
                                    <th className="p-4 font-semibold"><SortableTableHeader label="Transaction Count" columnKey="transactionCount" sortConfig={sortConfig} requestSort={requestSort} /></th>
                                    <th className="p-4 font-semibold"><SortableTableHeader label="Average Amount" columnKey="averageAmount" sortConfig={sortConfig} requestSort={requestSort} /></th>
                                    <th className="p-4 font-semibold"><SortableTableHeader label="Last Deposit" columnKey="lastTransactionDate" sortConfig={sortConfig} requestSort={requestSort} /></th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedSummary.map(item => (
                                    <tr key={item.source} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                                        <td className="p-4"><SourceCell name={item.source} /></td>
                                        <td className="p-4 font-bold text-gray-800">TZS {item.totalAmount.toLocaleString()}</td>
                                        <td className="p-4 text-gray-500">{item.transactionCount}</td>
                                        <td className="p-4 font-medium text-gray-700">TZS {item.averageAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                        <td className="p-4 text-gray-500">{formatDate(item.lastTransactionDate)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {processedSummary.length === 0 && <div className="text-center py-10 text-gray-500"><p>No summary data found for this goal.</p></div>}
                    </div>

                    {/* Footer */}
                    <div className="flex flex-wrap justify-between items-center mt-6 text-sm text-gray-500 gap-4">
                        <p>Showing {paginatedSummary.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, processedSummary.length)} of {processedSummary.length} entries</p>
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

export default GoalSummaryReportPage;
