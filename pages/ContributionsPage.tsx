
import React, { useState, useMemo, useRef, useEffect } from 'react';
// FIX: Using namespace import for react-router-dom to handle potential module resolution issues.
import { useNavigate } from 'react-router-dom';
import {
    ChevronDown, ChevronUp, Download, MoreVertical, Search, ChevronLeft, ChevronRight, XCircle, AlertCircle,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { mockContributionsData } from '../services/mockData';

type Contribution = typeof mockContributionsData[0];
type SortableKeys = keyof Contribution;

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
};


const TypeIcon: React.FC<{ type: 'Income' | 'Outcome' }> = ({ type }) => {
    if (type === 'Income') {
        return <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-100"><ChevronDown className="text-green-600" size={20} /></div>;
    }
    return <div className="w-8 h-8 flex items-center justify-center rounded-full bg-red-100"><ChevronUp className="text-red-600" size={20} /></div>;
};

const StatusPill: React.FC<{ status: string }> = ({ status }) => {
    const styles: { [key: string]: string } = {
        Completed: 'bg-green-100 text-green-700',
        Pending: 'bg-yellow-100 text-yellow-700',
        Cancelled: 'bg-red-100 text-red-700',
    };
    return (
        <span className={`px-4 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
            {status}
        </span>
    );
};


const MemberCell: React.FC<{ name: string }> = ({ name }) => {
    const initial = name.charAt(0).toUpperCase();
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


const ContributionsPage = () => {
    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys, direction: 'ascending' | 'descending' }>({ key: 'date', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const headerCheckboxRef = useRef<HTMLInputElement>(null);
    const itemsPerPage = 8;
    const tabs = ['All', 'Completed', 'Pending', 'Cancelled'];
    const navigate = useNavigate();

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

    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    const processedContributions = useMemo(() => {
        let contributions = [...mockContributionsData];

        if (activeTab !== 'All') {
            contributions = contributions.filter(tx => tx.status === activeTab);
        }

        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            contributions = contributions.filter(tx => 
                Object.values(tx).some(value => 
                    String(value).toLowerCase().includes(lowercasedQuery)
                )
            );
        }

        contributions.sort((a, b) => {
            const key = sortConfig.key;
            let aValue: string | number | Date = a[key];
            let bValue: string | number | Date = b[key];

            if (key === 'date') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });

        return contributions;
    }, [activeTab, searchQuery, sortConfig]);

    const totalPages = Math.ceil(processedContributions.length / itemsPerPage);
    const paginatedContributions = processedContributions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const paginatedIds = useMemo(() => paginatedContributions.map(tx => tx.id), [paginatedContributions]);
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
    }
    
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
        setCurrentPage(1);
    }
    
    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ["Contribution ID", "Date", "Member", "Group Name", "Amount", "Type", "Contribution Type", "Status"];
        const tableRows: (string | number)[][] = [];

        processedContributions.forEach(tx => {
            const txData = [
                tx.contributionId,
                formatDate(tx.date),
                tx.memberName,
                tx.groupName,
                `TZS ${tx.amount.toLocaleString()}`,
                tx.type,
                tx.contributionType,
                tx.status,
            ];
            tableRows.push(txData);
        });

        const reportTitle = `PesaFlow Contributions Report - ${activeTab} Contributions`;
        const fileName = `PesaFlow_Contributions_Report_${activeTab}.pdf`;

        doc.text(reportTitle, 14, 20);
        (doc as any).autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 30,
            theme: 'grid',
            headStyles: { fillColor: [16, 185, 129] }, // #10B981
        });

        doc.save(fileName);
    };

    return (
        <div className="p-4 sm:p-6 rounded-2xl bg-surface shadow-sm text-on-surface">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
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
                <div className="flex items-center space-x-3 w-full sm:w-auto">
                    <div className="relative flex-grow sm:flex-grow-0 sm:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search size={18} className="text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search contributions..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-primary focus:border-primary transition"
                        />
                    </div>
                    <button 
                        onClick={handleDownloadPDF}
                        className="flex items-center space-x-2 bg-primary text-white px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition"
                    >
                        <Download size={18} />
                        <span className="hidden sm:inline">Download PDF</span>
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
                                    aria-label="Select all contributions on this page"
                                />
                            </th>
                            <th className="p-4 font-semibold"><SortableTableHeader label="Contribution ID" columnKey="contributionId" sortConfig={sortConfig} requestSort={requestSort} /></th>
                            <th className="p-4 font-semibold"><SortableTableHeader label="Date" columnKey="date" sortConfig={sortConfig} requestSort={requestSort} /></th>
                            <th className="p-4 font-semibold"><SortableTableHeader label="Member" columnKey="memberName" sortConfig={sortConfig} requestSort={requestSort} /></th>
                            <th className="p-4 font-semibold"><SortableTableHeader label="Group Name" columnKey="groupName" sortConfig={sortConfig} requestSort={requestSort} /></th>
                            <th className="p-4 font-semibold"><SortableTableHeader label="Amount" columnKey="amount" sortConfig={sortConfig} requestSort={requestSort} /></th>
                            <th className="p-4 font-semibold"><SortableTableHeader label="Type" columnKey="type" sortConfig={sortConfig} requestSort={requestSort} /></th>
                            <th className="p-4 font-semibold"><SortableTableHeader label="Contribution Type" columnKey="contributionType" sortConfig={sortConfig} requestSort={requestSort} /></th>
                            <th className="p-4 font-semibold"><SortableTableHeader label="Status" columnKey="status" sortConfig={sortConfig} requestSort={requestSort} /></th>
                            <th className="p-4 font-semibold"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedContributions.map(tx => (
                            <tr key={tx.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                                <td className="p-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedRows.includes(tx.id)}
                                        onChange={() => handleRowSelect(tx.id)}
                                        className="bg-surface border-gray-300 rounded text-primary focus:ring-primary"
                                        aria-label={`Select contribution ${tx.contributionId}`}
                                    />
                                </td>
                                <td className="p-4 text-gray-500">{tx.contributionId}</td>
                                <td className="p-4 text-gray-500">{formatDate(tx.date)}</td>
                                <td className="p-4"><MemberCell name={tx.memberName} /></td>
                                <td className="p-4 text-gray-500">{tx.groupName}</td>
                                <td className="p-4 font-bold text-gray-800">TZS {tx.amount.toLocaleString()}</td>
                                <td className="p-4">
                                    <div className="flex items-center space-x-2">
                                        <TypeIcon type={tx.type as 'Income' | 'Outcome'} />
                                        <span className="text-gray-800 font-medium">{tx.type}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-500">{tx.contributionType}</td>
                                <td className="p-4"><StatusPill status={tx.status} /></td>
                                <td className="p-4">
                                    <div className="relative menu-container">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setOpenMenuId(openMenuId === tx.id ? null : tx.id);
                                            }}
                                            className={`p-1 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none transition-shadow ${openMenuId === tx.id ? 'ring-2 ring-blue-400' : ''}`}
                                            aria-haspopup="true"
                                            aria-expanded={openMenuId === tx.id}
                                        >
                                            <MoreVertical size={20} />
                                        </button>
                                        {openMenuId === tx.id && (
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
                                                            <span>Cancel Contribution</span>
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button
                                                            onClick={() => { navigate(`/contributions/${tx.contributionId}`); setOpenMenuId(null); }}
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
                 {processedContributions.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        <p>No contributions found.</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="flex flex-wrap justify-between items-center mt-6 text-sm text-gray-500 gap-4">
                <p>Showing {paginatedContributions.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, processedContributions.length)} of {processedContributions.length} entries</p>
                <div className="flex items-center space-x-2">
                    <button onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-primary disabled:opacity-50 disabled:text-gray-400"><ChevronLeft size={18} /></button>
                    <span className="px-2 font-semibold text-gray-700">Page {currentPage} of {totalPages > 0 ? totalPages : 1}</span>
                    <button onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage === totalPages || totalPages === 0} className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-primary disabled:opacity-50 disabled:text-gray-400"><ChevronRight size={18} /></button>
                </div>
            </div>
        </div>
    );
};

export default ContributionsPage;
