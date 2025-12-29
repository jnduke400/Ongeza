
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    MoreVertical, Search, ChevronLeft, ChevronRight, Calendar, ChevronUp, ChevronDown, FileText, Download, X
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { mockLoanOverviewData } from '../services/mockData';
import { LoanOverview } from '../types';

type SortableKeys = keyof LoanOverview;

const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
};

const StatusPill: React.FC<{ status: LoanOverview['status'] }> = ({ status }) => {
    const styles: { [key in LoanOverview['status']]: string } = {
        Approved: 'bg-green-100 text-green-700',
        Pending: 'bg-yellow-100 text-yellow-700',
        Overdue: 'bg-red-100 text-red-700',
        Completed: 'bg-purple-100 text-purple-700',
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
                    <ChevronUp size={14} className={`-mb-1.5 transition-colors ${isAscending ? 'text-indigo-600' : 'text-gray-400'}`} />
                    <ChevronDown size={14} className={`-mt-1.5 transition-colors ${!isAscending ? 'text-indigo-600' : 'text-gray-400'}`} />
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Filter by Borrowing Date</h2>
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

const LoanListPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'All' | LoanOverview['status']>('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys, direction: 'ascending' | 'descending' }>({ key: 'borrowingDate', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [isDateFilterOpen, setIsDateFilterOpen] = useState(false);
    const [dateFilter, setDateFilter] = useState<{ start: string; end: string } | null>(null);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const headerCheckboxRef = useRef<HTMLInputElement>(null);
    const exportMenuRef = useRef<HTMLDivElement>(null);
    const itemsPerPage = 6;
    const navigate = useNavigate();

    const tabs: ('All' | LoanOverview['status'])[] = ['All', 'Approved', 'Pending', 'Overdue', 'Completed'];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!(event.target as HTMLElement).closest('.menu-container')) {
                setOpenMenuId(null);
            }
            if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
                setIsExportMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const requestSort = (key: SortableKeys) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
        }));
        setCurrentPage(1);
    };
    
    const handleApplyDateFilter = (dates: { start: string; end: string }) => {
        setDateFilter(dates.start && dates.end ? dates : null);
        setCurrentPage(1);
    };

    const clearFilters = () => {
        setSearchQuery('');
        setDateFilter(null);
    };

    const processedLoans = useMemo(() => {
        let loans = [...mockLoanOverviewData];

        if (activeTab !== 'All') {
            loans = loans.filter(loan => loan.status === activeTab);
        }

        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            loans = loans.filter(loan => 
                Object.values(loan).some(value => 
                    String(value).toLowerCase().includes(lowercasedQuery)
                )
            );
        }
        
        if (dateFilter) {
            const startDate = new Date(dateFilter.start);
            const endDate = new Date(dateFilter.end);
            endDate.setHours(23, 59, 59, 999);

            loans = loans.filter(loan => {
                const borrowingDate = new Date(loan.borrowingDate);
                return borrowingDate >= startDate && borrowingDate <= endDate;
            });
        }

        loans.sort((a, b) => {
            const key = sortConfig.key;
            let aValue: any = a[key];
            let bValue: any = b[key];
            if (key === 'repaymentDate' || key === 'borrowingDate') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }
            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });

        return loans;
    }, [activeTab, searchQuery, sortConfig, dateFilter]);

    const totalPages = Math.ceil(processedLoans.length / itemsPerPage);
    const paginatedLoans = processedLoans.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const paginatedIds = useMemo(() => paginatedLoans.map(l => l.id), [paginatedLoans]);
    const areAllOnPageSelected = useMemo(() => paginatedIds.length > 0 && paginatedIds.every(id => selectedRows.includes(id)), [paginatedIds, selectedRows]);
    const areSomeOnPageSelected = useMemo(() => paginatedIds.some(id => selectedRows.includes(id)), [paginatedIds, selectedRows]);
    
    useEffect(() => {
        if (headerCheckboxRef.current) {
            headerCheckboxRef.current.indeterminate = areSomeOnPageSelected && !areAllOnPageSelected;
        }
    }, [areSomeOnPageSelected, areAllOnPageSelected]);

    const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.checked) {
            setSelectedRows(prev => Array.from(new Set([...prev, ...paginatedIds])));
        } else {
            setSelectedRows(prev => prev.filter(id => !paginatedIds.includes(id)));
        }
    };

    const handleRowSelect = (id: string) => {
        setSelectedRows(prev => prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]);
    };

    const handleTabClick = (tab: 'All' | LoanOverview['status']) => {
        setActiveTab(tab);
        setCurrentPage(1);
    };

    const getPaginationItems = () => {
        if (totalPages <= 5) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        const pages: (string | number)[] = [1];
        if (currentPage > 3) pages.push('...');
        if (currentPage > 2) pages.push(currentPage - 1);
        if (currentPage > 1 && currentPage < totalPages) pages.push(currentPage);
        if (currentPage < totalPages - 1) pages.push(currentPage + 1);
        if (currentPage < totalPages - 2) pages.push('...');
        pages.push(totalPages);
        return [...new Set(pages)];
    };
    
    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ["Loan ID", "Amount", "Borrowing Date", "Repayment Date", "Outstanding Balance", "Status"];
        const tableRows: (string | number)[][] = [];

        processedLoans.forEach(loan => {
            const loanData = [
                loan.loanId,
                `${loan.currency} ${loan.amount.toLocaleString()}`,
                formatDate(loan.borrowingDate),
                formatDate(loan.repaymentDate),
                `${loan.currency} ${loan.outstandingBalance.toLocaleString()}`,
                loan.status
            ];
            tableRows.push(loanData);
        });

        doc.text("Loan List Report", 14, 20);
        (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            theme: 'striped',
            headStyles: { fillColor: [79, 70, 229] }, // indigo-600
        });

        doc.save("Loan_List_Report.pdf");
    };
    
    const handleExportCSV = () => {
        const headers = ["Loan ID", "Amount", "Currency", "Borrowing Date", "Repayment Date", "Outstanding Balance", "Status"];
        const csvRows = processedLoans.map(loan => 
            [
                loan.loanId,
                loan.amount,
                loan.currency,
                `"${loan.borrowingDate}"`,
                `"${loan.repaymentDate}"`,
                loan.outstandingBalance,
                loan.status
            ].join(',')
        );
    
        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "loan_list_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <div className="space-y-6">
            <DateFilterModal isOpen={isDateFilterOpen} onClose={() => setIsDateFilterOpen(false)} onApply={handleApplyDateFilter} />
            <div>
                <h1 className="text-2xl font-bold text-gray-800">Loan List Report</h1>
                <p className="text-gray-500 mt-1">An overview of all borrower loan activities and statuses.</p>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-2 bg-gray-100 p-1 rounded-full w-full sm:w-auto">
                {tabs.map(tab => (
                    <button
                        key={tab}
                        onClick={() => handleTabClick(tab)}
                        className={`px-4 py-2 font-semibold transition-colors duration-200 text-sm rounded-full ${activeTab === tab ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab} Loans
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 flex flex-wrap justify-between items-center gap-4 border-b border-gray-100">
                    <h2 className="text-lg font-bold text-gray-800">Loan overview</h2>
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm w-48 focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                        <button onClick={() => setIsDateFilterOpen(true)} className="flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50"><Calendar size={16}/><span>Select Dates</span></button>
                        {(searchQuery || dateFilter) && (
                            <button onClick={clearFilters} className="px-3 py-2 border border-gray-200 rounded-md text-sm font-medium text-red-600 hover:bg-red-50">Clear</button>
                        )}
                        <div className="relative" ref={exportMenuRef}>
                            <button onClick={() => setIsExportMenuOpen(prev => !prev)} className="p-2 border border-gray-200 rounded-md text-gray-500 hover:bg-gray-50"><MoreVertical size={16}/></button>
                            {isExportMenuOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-20 p-2 border border-gray-100 text-left">
                                    <ul className="text-sm text-gray-800 font-medium">
                                        <li>
                                            <button onClick={handleDownloadPDF} className="w-full text-left flex items-center px-3 py-2 hover:bg-gray-100 rounded-md"><FileText size={16} className="mr-2"/>Export PDF</button>
                                        </li>
                                        <li>
                                            <button onClick={handleExportCSV} className="w-full text-left flex items-center px-3 py-2 hover:bg-gray-100 rounded-md"><Download size={16} className="mr-2"/>Export CSV</button>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                             <tr className="border-b-2 border-gray-100 bg-gray-50/50">
                                <th className="p-4 w-12"><input type="checkbox" ref={headerCheckboxRef} checked={areAllOnPageSelected} onChange={handleSelectAll} className="rounded" /></th>
                                <SortableTableHeader label="Loan ID" columnKey="loanId" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableTableHeader label="Amount" columnKey="amount" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableTableHeader label="Borrowing Date" columnKey="borrowingDate" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableTableHeader label="Repayment Date" columnKey="repaymentDate" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableTableHeader label="Outstanding Balance" columnKey="outstandingBalance" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableTableHeader label="Status" columnKey="status" sortConfig={sortConfig} requestSort={requestSort} />
                                <th className="p-4 text-xs uppercase font-semibold text-gray-500">Action</th>
                            </tr>
                        </thead>
                         <tbody>
                            {paginatedLoans.map(loan => (
                                <tr key={loan.id} className="border-t border-gray-100">
                                    <td className="p-4"><input type="checkbox" checked={selectedRows.includes(loan.id)} onChange={() => handleRowSelect(loan.id)} className="rounded"/></td>
                                    <td className="p-4 font-medium text-gray-800">{loan.loanId}</td>
                                    <td className="p-4 text-gray-600">{loan.currency} {loan.amount.toLocaleString()}</td>
                                    <td className="p-4 text-gray-600">{formatDate(loan.borrowingDate)}</td>
                                    <td className="p-4 text-gray-600">{formatDate(loan.repaymentDate)}</td>
                                    <td className="p-4 text-gray-600">{loan.currency} {loan.outstandingBalance.toLocaleString()}</td>
                                    <td className="p-4"><StatusPill status={loan.status} /></td>
                                    <td className="p-4 text-center">
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-between items-center p-4 border-t border-gray-100 text-sm">
                    <span className="text-gray-600">
                        Page {currentPage} of {totalPages}
                    </span>
                    <div className="flex items-center space-x-1">
                        <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 flex items-center"><ChevronLeft size={16} /> <span className="ml-1 hidden sm:inline">Previous</span></button>
                        {getPaginationItems().map((page, index) =>
                            typeof page === 'number' ? (
                                <button key={index} onClick={() => setCurrentPage(page)} className={`px-3 py-1 rounded-md ${currentPage === page ? 'bg-primary text-white font-semibold' : 'hover:bg-gray-100'}`}>{page}</button>
                            ) : (
                                <span key={index} className="px-3 py-1">...</span>
                            )
                        )}
                        <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages} className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 flex items-center"><span className="mr-1 hidden sm:inline">Next</span> <ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoanListPage;
