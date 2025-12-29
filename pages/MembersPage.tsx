
import React, { useState, useMemo, useRef, useEffect } from 'react';
// FIX: Using namespace import for react-router-dom to handle potential module resolution issues.
import { useNavigate } from 'react-router-dom';
import {
    ChevronDown, ChevronUp, Download, MoreVertical, Search, ChevronLeft, ChevronRight, Plus, X, Trash2, User,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { mockMembersData, mockRegions, mockGroupSavings, tanzaniaRegions } from '../services/mockData';
import { useAuth } from '../contexts/AuthContext';

type Member = typeof mockMembersData[0];
type SortableKeys = keyof Member;
type NewMemberData = {
    firstName: string;
    lastName: string;
    groupName: string;
};

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}, ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
};

const StatusPill: React.FC<{ status: string }> = ({ status }) => {
    const styles: { [key: string]: string } = {
        Active: 'bg-green-100 text-green-700',
        Inactive: 'bg-gray-100 text-gray-700',
        Suspended: 'bg-yellow-100 text-yellow-700',
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

const CreateMemberModal: React.FC<{ isOpen: boolean; onClose: () => void; onAddMember: (data: NewMemberData) => void; }> = ({ isOpen, onClose, onAddMember }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState('');
    const [districts, setDistricts] = useState<string[]>([]);

    if (!isOpen) return null;
    
    const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const region = e.target.value;
        setSelectedRegion(region);
        setDistricts(tanzaniaRegions[region] || []);
        // Reset district selection when region changes
        const form = e.target.form;
        if (form) {
            const districtSelect = form.elements.namedItem('district') as HTMLSelectElement;
            if (districtSelect) {
                districtSelect.value = '';
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        
        const formData = new FormData(e.currentTarget);
        const newMemberData: NewMemberData = {
            firstName: formData.get('firstName') as string,
            lastName: formData.get('lastName') as string,
            groupName: formData.get('groupName') as string,
        };

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        onAddMember(newMemberData);
        setIsSaving(false);
        onClose();
    };

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-6 border-b border-primary-dark sticky top-0 bg-primary z-10 rounded-t-xl">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold text-white">Create New Member</h2>
                        <button onClick={onClose} className="p-1 rounded-full text-primary-light hover:bg-white/20 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                </div>
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                            <input name="firstName" type="text" required className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Second Name <span className="text-gray-400">(Optional)</span></label>
                            <input name="secondName" type="text" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                            <input name="lastName" type="text" required className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input name="phone" type="tel" required className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                            <select name="region" required onChange={handleRegionChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                                <option value="">Select Region</option>
                                {mockRegions.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                            <select name="district" required disabled={!selectedRegion} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary disabled:bg-gray-100">
                                 <option value="">{selectedRegion ? 'Select District' : 'Select a region first'}</option>
                                 {districts.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <textarea name="address" rows={2} required className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input name="email" type="email" required className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">ID Type</label>
                            <select name="idType" required className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                                <option>National Id</option>
                                <option>Driving License</option>
                                <option>Voter Id</option>
                                <option>None</option>
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                            <select name="groupName" required className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                                <option value="">Select Group</option>
                                {mockGroupSavings.map(g => <option key={g.id} value={g.name}>{g.name}</option>)}
                            </select>
                        </div>
                    </div>
                     <div className="pt-6 mt-6 border-t border-gray-200 flex justify-end items-center space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSaving} className="bg-primary text-white px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition shadow-sm flex items-center justify-center whitespace-nowrap disabled:bg-primary-light">
                             {isSaving ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                    <span>Saving...</span>
                                </>
                            ) : (
                                'Create Member'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const MembersPage = () => {
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [members, setMembers] = useState(mockMembersData);
    const [mainActiveTab, setMainActiveTab] = useState('Members');
    const [activeFilterTab, setActiveFilterTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys, direction: 'ascending' | 'descending' }>({ key: 'joinDate', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedRows, setSelectedRows] = useState<number[]>([]);
    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const headerCheckboxRef = useRef<HTMLInputElement>(null);
    const itemsPerPage = 8;
    const navigate = useNavigate();
    
    const mainTabs = ['Members', 'Member Requests'];
    const filterTabs = ['All', 'Active', 'Inactive', 'Suspended'];

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

    const handleAddMember = (data: NewMemberData) => {
        const newId = Math.max(...members.map(m => m.id), 0) + 1;
        const newMember: Member = {
            id: newId,
            memberId: `MEM24A${newId}`,
            joinDate: new Date().toISOString(),
            memberName: `${data.firstName} ${data.lastName}`,
            groupName: data.groupName,
            totalContribution: 0,
            status: 'Active',
        };
        setMembers(prev => [newMember, ...prev]);
    };

    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    const processedMembers = useMemo(() => {
        let filteredMembers = [...members];

        if (activeFilterTab !== 'All') {
            filteredMembers = filteredMembers.filter(member => member.status === activeFilterTab);
        }

        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            filteredMembers = filteredMembers.filter(member => 
                Object.values(member).some(value => 
                    String(value).toLowerCase().includes(lowercasedQuery)
                )
            );
        }

        filteredMembers.sort((a, b) => {
            const key = sortConfig.key;
            let aValue: string | number | Date = a[key];
            let bValue: string | number | Date = b[key];

            if (key === 'joinDate') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }

            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });

        return filteredMembers;
    }, [activeFilterTab, searchQuery, sortConfig, members]);

    const totalPages = Math.ceil(processedMembers.length / itemsPerPage);
    const paginatedMembers = processedMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const paginatedIds = useMemo(() => paginatedMembers.map(tx => tx.id), [paginatedMembers]);
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

    const handleFilterTabClick = (tab: string) => {
        setActiveFilterTab(tab);
        setCurrentPage(1);
    }
    
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
        setCurrentPage(1);
    }
    
    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ["Member ID", "Join Date", "Member Name", "Group Name", "Total Contribution", "Status"];
        const tableRows: (string | number)[][] = [];

        processedMembers.forEach(member => {
            const memberData = [
                member.memberId,
                formatDate(member.joinDate),
                member.memberName,
                member.groupName,
                `TZS ${member.totalContribution.toLocaleString()}`,
                member.status,
            ];
            tableRows.push(memberData);
        });

        const reportTitle = `PesaFlow Members Report - ${activeFilterTab}`;
        const fileName = `PesaFlow_Members_Report_${activeFilterTab}.pdf`;

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
        <>
            <div className="space-y-8">
                {/* Page Header */}
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Members Management</h1>
                        <p className="text-gray-500 mt-1">Manage your group members and review join requests.</p>
                    </div>
                    {!user?.isSolo && (
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="flex items-center space-x-2 bg-primary text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition-colors shadow-sm">
                            <Plus size={20} />
                            <span>Create Member</span>
                        </button>
                    )}
                </div>

                {/* Main Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        {mainTabs.map(tab => (
                            <button
                                key={tab}
                                onClick={() => setMainActiveTab(tab)}
                                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                    mainActiveTab === tab
                                        ? 'border-primary text-primary'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                <div>
                    {mainActiveTab === 'Members' && (
                        <div className="p-4 sm:p-6 rounded-2xl bg-surface shadow-sm text-on-surface">
                            {/* Header */}
                            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                                <div className="flex items-center space-x-1 sm:space-x-4 border-b border-gray-200">
                                    {filterTabs.map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => handleFilterTabClick(tab)}
                                            className={`px-2 py-3 font-semibold transition-colors duration-200 text-sm sm:text-base ${activeFilterTab === tab ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-primary'}`}
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
                                            placeholder="Search members..."
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
                                                    aria-label="Select all members on this page"
                                                />
                                            </th>
                                            <th className="p-4 font-semibold"><SortableTableHeader label="Member ID" columnKey="memberId" sortConfig={sortConfig} requestSort={requestSort} /></th>
                                            <th className="p-4 font-semibold"><SortableTableHeader label="Join Date" columnKey="joinDate" sortConfig={sortConfig} requestSort={requestSort} /></th>
                                            <th className="p-4 font-semibold"><SortableTableHeader label="Member Name" columnKey="memberName" sortConfig={sortConfig} requestSort={requestSort} /></th>
                                            <th className="p-4 font-semibold"><SortableTableHeader label="Group Name" columnKey="groupName" sortConfig={sortConfig} requestSort={requestSort} /></th>
                                            <th className="p-4 font-semibold"><SortableTableHeader label="Total Contribution" columnKey="totalContribution" sortConfig={sortConfig} requestSort={requestSort} /></th>
                                            <th className="p-4 font-semibold"><SortableTableHeader label="Status" columnKey="status" sortConfig={sortConfig} requestSort={requestSort} /></th>
                                            <th className="p-4 font-semibold"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedMembers.map(member => (
                                            <tr key={member.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                                                <td className="p-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedRows.includes(member.id)}
                                                        onChange={() => handleRowSelect(member.id)}
                                                        className="bg-surface border-gray-300 rounded text-primary focus:ring-primary"
                                                        aria-label={`Select member ${member.memberId}`}
                                                    />
                                                </td>
                                                <td className="p-4 text-gray-500">{member.memberId}</td>
                                                <td className="p-4 text-gray-500">{formatDate(member.joinDate)}</td>
                                                <td className="p-4"><MemberCell name={member.memberName} /></td>
                                                <td className="p-4 text-gray-500">{member.groupName}</td>
                                                <td className="p-4 font-bold text-gray-800">TZS {member.totalContribution.toLocaleString()}</td>
                                                <td className="p-4"><StatusPill status={member.status} /></td>
                                                <td className="p-4">
                                                    <div className="relative menu-container">
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenMenuId(openMenuId === member.id ? null : member.id);
                                                            }}
                                                            className={`p-1 rounded-full text-gray-400 hover:text-gray-600 focus:outline-none transition-shadow ${openMenuId === member.id ? 'ring-2 ring-blue-400' : ''}`}
                                                            aria-haspopup="true"
                                                            aria-expanded={openMenuId === member.id}
                                                        >
                                                            <MoreVertical size={20} />
                                                        </button>
                                                        {openMenuId === member.id && (
                                                            <div 
                                                                className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl z-20 p-2 border border-gray-100"
                                                                role="menu"
                                                            >
                                                                <ul className="text-sm text-gray-800 font-medium">
                                                                    <li>
                                                                        <button
                                                                            onClick={() => {
                                                                                if (confirm(`Are you sure you want to remove ${member.memberName}? This action cannot be undone.`)) {
                                                                                    setMembers(prev => prev.filter(m => m.id !== member.id));
                                                                                }
                                                                                setOpenMenuId(null);
                                                                            }} 
                                                                            className="w-full text-left flex items-center px-3 py-2 hover:bg-gray-100 rounded-md"
                                                                            role="menuitem"
                                                                        >
                                                                            <Trash2 size={18} className="text-red-500 mr-3" />
                                                                            <span>Remove Member</span>
                                                                        </button>
                                                                    </li>
                                                                    <li>
                                                                        <button
                                                                            onClick={() => {
                                                                                navigate(`/members/${member.memberId}`);
                                                                                setOpenMenuId(null);
                                                                            }}
                                                                            className="w-full text-left flex items-center px-3 py-2 hover:bg-gray-100 rounded-md"
                                                                            role="menuitem"
                                                                        >
                                                                            <User size={18} className="text-blue-500 mr-3" />
                                                                            <span>View Member Details</span>
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
                                {processedMembers.length === 0 && (
                                    <div className="text-center py-10 text-gray-500">
                                        <p>No members found.</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex flex-wrap justify-between items-center mt-6 text-sm text-gray-500 gap-4">
                                <p>Showing {paginatedMembers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to {Math.min(currentPage * itemsPerPage, processedMembers.length)} of {processedMembers.length} entries</p>
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 1} className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-primary disabled:opacity-50 disabled:text-gray-400"><ChevronLeft size={18} /></button>
                                    <span className="px-2 font-semibold text-gray-700">Page {currentPage} of {totalPages > 0 ? totalPages : 1}</span>
                                    <button onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage === totalPages || totalPages === 0} className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 text-primary disabled:opacity-50 disabled:text-gray-400"><ChevronRight size={18} /></button>
                                </div>
                            </div>
                        </div>
                    )}
                    {mainActiveTab === 'Member Requests' && (
                        <div className="text-center py-20 bg-gray-50 rounded-lg">
                            <h3 className="text-xl font-semibold text-gray-700">Member Join Requests</h3>
                            <p className="text-gray-500 mt-2">Requests from new users to join your groups will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
            <CreateMemberModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAddMember={handleAddMember} />
        </>
    );
};

export default MembersPage;
