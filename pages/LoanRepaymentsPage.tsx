
import React, { useState, useMemo } from 'react';
import {
    ChevronUp, ChevronDown, SlidersHorizontal, X, Wallet, ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Search, Download, TrendingUp, FileText, MoreVertical
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { mockLoanRepayments } from '../services/mockData';
import { LoanRepayment } from '../types';

type SortableKeys = keyof LoanRepayment;

const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    }).replace(',', '');
};

const StatusPill: React.FC<{ status: LoanRepayment['status'] }> = ({ status }) => {
    const styles: { [key in LoanRepayment['status']]: string } = {
        Pending: 'bg-yellow-100 text-yellow-700',
        Completed: 'bg-green-100 text-green-700',
        Failed: 'bg-red-100 text-red-700',
    };
    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
            {status}
        </span>
    );
};


const SortableTableHeader: React.FC<{
    label: string;
    columnKey: SortableKeys;
    sortConfig: { key: SortableKeys; direction: string };
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
                    <ChevronDown size={14} className={`-mt-1.5 transition-colors ${!isAscending ? 'text-indigo-600' : ''}`} />
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
                    <button onClick={onClose} className="bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-300">Cancel</button>
                    <button onClick={handleApply} className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-indigo-700">Apply</button>
                </div>
            </div>
        </div>
    );
};

const LoanRepaymentsPage: React.FC = () => {
    const [repayments, setRepayments] = useState<LoanRepayment[]>(mockLoanRepayments);
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' }>({ key: 'repaymentDate', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [dateFilter, setDateFilter] = useState<{ start: string; end: string } | null>(null);

    const requestSort = (key: SortableKeys) => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending' }));
        setCurrentPage(1);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setDateFilter(null);
        setCurrentPage(1);
    };
    
    const handleApplyDateFilter = (dates: { start: string; end: string }) => {
        setDateFilter(dates.start && dates.end ? dates : null);
        setCurrentPage(1);
    };

    const processedRepayments = useMemo(() => {
        let filtered = [...repayments];

        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            filtered = filtered.filter(repayment =>
                Object.values(repayment).some(val =>
                    String(val).toLowerCase().includes(lowercasedQuery)
                )
            );
        }
        
        if (dateFilter) {
            const startDate = new Date(dateFilter.start);
            const endDate = new Date(dateFilter.end);
            endDate.setHours(23, 59, 59, 999);

            filtered = filtered.filter(repayment => {
                const repaymentDate = new Date(repayment.repaymentDate);
                return repaymentDate >= startDate && repaymentDate <= endDate;
            });
        }

        filtered.sort((a, b) => {
            const key = sortConfig.key;
            if (a[key] < b[key]) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (a[key] > b[key]) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [repayments, sortConfig, searchQuery, dateFilter]);

    const totalPages = Math.ceil(processedRepayments.length / itemsPerPage);
    const paginatedRepayments = processedRepayments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ["Repayment Date", "Name", "Account", "Payment Reference", "Status", "Amount"];
        const tableRows: (string | number)[][] = [];
    
        processedRepayments.forEach(repayment => {
            const repaymentData = [
                formatDate(repayment.repaymentDate),
                repayment.clientName,
                repayment.accountNumber,
                repayment.paymentReference,
                repayment.status,
                `${repayment.currency} ${repayment.amount.toLocaleString()}`
            ];
            tableRows.push(repaymentData);
        });
    
        doc.text("Loan Repayments Report", 14, 20);
        (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            theme: 'grid',
            headStyles: { fillColor: [16, 185, 129] },
        });
    
        doc.save("Loan_Repayments_Report.pdf");
    };
    
    const handleExportCSV = () => {
        const headers = ["Repayment Date", "Name", "Account", "Payment Reference", "Status", "Amount", "Currency"];
        const csvRows = processedRepayments.map(repayment => 
            [
                `"${formatDate(repayment.repaymentDate)}"`,
                repayment.clientName,
                repayment.accountNumber,
                repayment.paymentReference,
                repayment.status,
                repayment.amount,
                repayment.currency,
            ].join(',')
        );
    
        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "loan_repayments_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6">
            <DateFilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} onApply={handleApplyDateFilter} />
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Loan Repayments Report</h1>
                <p className="text-gray-500 mt-1">This report shows all received loan repayments from clients.</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm">
                 <div className="p-4 flex flex-wrap justify-between items-center gap-4 border-b border-gray-100">
                    <div className="flex items-center space-x-2">
                        <button onClick={() => setIsFilterModalOpen(true)} className="flex items-center space-x-2 px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"><SlidersHorizontal size={14}/><span>Filter</span></button>
                        <button onClick={clearFilters} className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50">Clear</button>
                    </div>
                    <div className="flex items-center flex-wrap gap-2">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search repayments..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm w-48 focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <button onClick={handleExportCSV} className="flex items-center space-x-2 bg-purple-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-purple-700 transition text-sm">
                            <Download size={16} />
                            <span>CSV</span>
                        </button>
                        <button onClick={handleExportCSV} className="flex items-center space-x-2 bg-primary text-white px-3 py-2 rounded-lg font-semibold hover:bg-primary-dark transition text-sm">
                            <TrendingUp size={16} />
                            <span>Excel</span>
                        </button>
                        <button onClick={handleDownloadPDF} className="flex items-center space-x-2 bg-indigo-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition text-sm">
                            <FileText size={16} />
                            <span>Pdf</span>
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="border-b-2 border-gray-100">
                             <tr>
                                <SortableTableHeader label="Repayment Date" columnKey="repaymentDate" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableTableHeader label="Name" columnKey="clientName" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableTableHeader label="Account" columnKey="accountNumber" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableTableHeader label="Payment Reference" columnKey="paymentReference" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableTableHeader label="Status" columnKey="status" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableTableHeader label="Amount" columnKey="amount" sortConfig={sortConfig} requestSort={requestSort} />
                                <th className="p-4 font-normal text-xs uppercase font-semibold text-gray-500">Actions</th>
                            </tr>
                        </thead>
                         <tbody>
                            {paginatedRepayments.map(repayment => (
                                <tr key={repayment.id} className="border-t border-gray-100">
                                    <td className="p-4 text-gray-600">{formatDate(repayment.repaymentDate)}</td>
                                    <td className="p-4 font-medium text-gray-800">{repayment.clientName}</td>
                                    <td className="p-4 text-gray-600">{repayment.accountNumber}</td>
                                    <td className="p-4 font-medium text-gray-800">{repayment.paymentReference}</td>
                                    <td className="p-4"><StatusPill status={repayment.status} /></td>
                                    <td className="p-4 font-medium text-gray-800">{repayment.currency} {repayment.amount.toLocaleString()}</td>
                                    <td className="p-4 text-right">
                                         <button className="text-gray-400 hover:text-gray-600">
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {processedRepayments.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            <p>No loan repayments found matching your criteria.</p>
                        </div>
                    )}
                </div>
                 <div className="flex justify-between items-center p-4 border-t border-gray-100 text-sm">
                    <span className="text-gray-600">
                        Data {paginatedRepayments.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, processedRepayments.length)} of {processedRepayments.length}
                    </span>
                    <div className="flex items-center space-x-1">
                        <button onClick={() => setCurrentPage(1)} disabled={currentPage === 1} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"><ChevronsLeft size={16} /></button>
                        <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"><ChevronLeft size={16} /></button>
                        <button className="px-3 py-1 bg-indigo-600 text-white font-semibold rounded">{currentPage}</button>
                        <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"><ChevronRight size={16} /></button>
                        <button onClick={() => setCurrentPage(totalPages)} disabled={currentPage >= totalPages} className="p-2 rounded hover:bg-gray-100 disabled:opacity-50"><ChevronsRight size={16} /></button>
                        <select 
                            value={itemsPerPage} 
                            onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                            className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoanRepaymentsPage;
