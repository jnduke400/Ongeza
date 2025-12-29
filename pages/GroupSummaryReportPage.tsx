import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ChevronDown, ChevronUp, Download, Search, ChevronLeft, ChevronRight, Users, TrendingUp, DollarSign
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { getGroupSummaryReport, mockGroupSavings } from '../services/mockData';
import { GroupMemberSummary } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

type Summary = GroupMemberSummary;
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


const MemberCell: React.FC<{ name: string, avatar: string }> = ({ name, avatar }) => {
    return (
        <div className="flex items-center">
            <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover mr-3"/>
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

const MySummaryReport: React.FC<{ group: any; userSummary: GroupMemberSummary }> = ({ group, userSummary }) => {
    
    const handleDownloadMySummaryPDF = () => {
        const doc = new jsPDF();
        doc.text(`My Summary Report for ${group.name}`, 14, 22);
        doc.setFontSize(12);
        doc.text(`Member: ${userSummary.memberName}`, 14, 30);
        
        const summaryData = [
            ['Category', 'Amount (TZS)'],
            ['Total Contributed', userSummary.totalContributed.toLocaleString()],
            ['Total Withdrawn', userSummary.totalWithdrawn.toLocaleString()],
            ['Net Contribution', userSummary.netContribution.toLocaleString()],
            ['Total Transactions', userSummary.transactionCount.toString()],
        ];

        (doc as any).autoTable({
            startY: 40,
            head: [summaryData[0]],
            body: summaryData.slice(1),
            theme: 'grid',
            headStyles: { fillColor: [16, 185, 129] },
        });

        doc.save(`My_Summary_${group.name.replace(' ','_')}.pdf`);
    };

    const chartData = [
        { name: 'Summary', Contributed: userSummary.totalContributed, Withdrawn: userSummary.totalWithdrawn }
    ];

    return (
        <div className="space-y-6">
            <Link to={`/group-saving/${group.id}`} className="flex items-center text-primary hover:underline font-semibold">
                <ChevronLeft size={20} className="mr-1"/>
                Back to Group Overview
            </Link>
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">My Summary Report</h1>
                    <p className="text-gray-500 mt-1">Your personal summary for group: <span className="font-semibold">{group.name}</span></p>
                </div>
                <button 
                    onClick={handleDownloadMySummaryPDF}
                    className="flex items-center space-x-2 bg-primary text-white px-3 sm:px-4 py-2 rounded-lg font-semibold hover:bg-primary-dark transition"
                >
                    <Download size={18} />
                    <span className="hidden sm:inline">Download My Summary</span>
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <StatCard icon={<DollarSign size={24} className="text-white"/>} title="My Total Contributions" value={`TZS ${userSummary.totalContributed.toLocaleString()}`} color="bg-green-500" />
                 <StatCard icon={<ChevronDown size={24} className="text-white"/>} title="My Total Withdrawals" value={`TZS ${userSummary.totalWithdrawn.toLocaleString()}`} color="bg-red-500" />
                 <StatCard icon={<TrendingUp size={24} className="text-white"/>} title="My Net Contribution" value={`TZS ${userSummary.netContribution.toLocaleString()}`} color="bg-indigo-500" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-4 sm:p-6 rounded-2xl bg-surface shadow-sm text-on-surface">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">My Financial Breakdown</h3>
                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-500">Total Contributed</span>
                            <span className="font-bold text-green-600">TZS {userSummary.totalContributed.toLocaleString()}</span>
                        </div>
                         <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-500">Total Withdrawn</span>
                            <span className="font-bold text-red-600">TZS {userSummary.totalWithdrawn.toLocaleString()}</span>
                        </div>
                         <div className="flex justify-between p-3 bg-gray-100 rounded-lg">
                            <span className="font-semibold text-gray-600">Net Contribution</span>
                            <span className="font-extrabold text-gray-800">TZS {userSummary.netContribution.toLocaleString()}</span>
                        </div>
                         <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium text-gray-500">Total Transactions</span>
                            <span className="font-bold text-gray-700">{userSummary.transactionCount}</span>
                        </div>
                    </div>
                </div>
                 <div className="p-4 sm:p-6 rounded-2xl bg-surface shadow-sm text-on-surface">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Contribution vs Withdrawal</h3>
                    <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" barSize={40}>
                                <XAxis type="number" hide />
                                <YAxis type="category" dataKey="name" hide />
                                <Tooltip cursor={{fill: 'rgba(0,0,0,0.02)'}} />
                                <Legend />
                                <Bar dataKey="Contributed" stackId="a" fill="#10B981" radius={[10, 0, 0, 10]} />
                                <Bar dataKey="Withdrawn" stackId="a" fill="#F43F5E" radius={[0, 10, 10, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                 </div>
            </div>
        </div>
    );
};


const GroupSummaryReportPage = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const { user } = useAuth();
    const group = useMemo(() => groupId ? mockGroupSavings.find(g => g.id === groupId) : undefined, [groupId]);
    
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys, direction: 'ascending' | 'descending' }>({ key: 'netContribution', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;
    
    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };
    
    const allSummaryData = useMemo(() => {
        if (!groupId) return [];
        return getGroupSummaryReport(groupId);
    }, [groupId]);

    const mySummary = useMemo(() => {
        if (user?.isSolo) {
            return allSummaryData.find(s => s.memberId === user.id);
        }
        return null;
    }, [allSummaryData, user]);

    const processedSummary = useMemo(() => {
        let summaryData = [...allSummaryData];

        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            summaryData = summaryData.filter(item => 
                item.memberName.toLowerCase().includes(lowercasedQuery)
            );
        }

        summaryData.sort((a, b) => {
            const key = sortConfig.key;
            const aValue = a[key];
            const bValue = b[key];

            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });

        return summaryData;
    }, [searchQuery, sortConfig, allSummaryData]);
    
    const stats = useMemo(() => {
        const totalContributions = processedSummary.reduce((acc, item) => acc + item.totalContributed, 0);
        const totalWithdrawals = processedSummary.reduce((acc, item) => acc + item.totalWithdrawn, 0);
        const netGrowth = totalContributions - totalWithdrawals;
        return {
            totalContributions,
            totalMembers: processedSummary.length,
            netGrowth,
        }
    }, [processedSummary]);

    const totalPages = Math.ceil(processedSummary.length / itemsPerPage);
    const paginatedSummary = processedSummary.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
    
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
        setCurrentPage(1);
    }
    
    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const tableColumn = ["Member Name", "Total Contributed (TZS)", "Total Withdrawn (TZS)", "Net Contribution (TZS)", "Transactions"];
        const tableRows: (string | number)[][] = [];

        processedSummary.forEach(item => {
            const itemData = [
                item.memberName,
                item.totalContributed.toLocaleString(),
                item.totalWithdrawn.toLocaleString(),
                item.netContribution.toLocaleString(),
                item.transactionCount,
            ];
            tableRows.push(itemData);
        });

        const reportTitle = `PesaFlow Group Summary Report - ${group?.name || 'Details'}`;
        const fileName = `PesaFlow_Summary_Report_${group?.name.replace(' ','_')}.pdf`;

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
    
    if (!group) {
        return <div className="p-8 text-center">Group not found.</div>;
    }

    if (user?.isSolo) {
        if (!mySummary) {
            return (
                 <div className="space-y-6">
                    <Link to={`/group-saving/${groupId}`} className="flex items-center text-primary hover:underline font-semibold">
                        <ChevronLeft size={20} className="mr-1"/>
                        Back to Group Overview
                    </Link>
                    <div className="p-8 text-center bg-surface rounded-2xl shadow-sm">
                        <h1 className="text-2xl font-bold text-gray-800">My Summary Report</h1>
                        <p className="text-gray-500 mt-2">You have not made any transactions in this group yet.</p>
                    </div>
                </div>
            )
        }
        return <MySummaryReport group={group} userSummary={mySummary} />;
    }

    return (
        <div className="space-y-6">
            <Link to={`/group-saving/${groupId}`} className="flex items-center text-primary hover:underline font-semibold">
                <ChevronLeft size={20} className="mr-1"/>
                Back to Group Overview
            </Link>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <StatCard icon={<DollarSign size={24} className="text-white"/>} title="Total Contributions" value={`TZS ${stats.totalContributions.toLocaleString()}`} color="bg-green-500" />
                 <StatCard icon={<Users size={24} className="text-white"/>} title="Total Members" value={`${stats.totalMembers}`} color="bg-blue-500" />
                 <StatCard icon={<TrendingUp size={24} className="text-white"/>} title="Net Growth" value={`TZS ${stats.netGrowth.toLocaleString()}`} color="bg-indigo-500" />
            </div>
             <div className="p-4 sm:p-6 rounded-2xl bg-surface shadow-sm text-on-surface">
                {/* Header */}
                <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Member Summary Report</h1>
                        <p className="text-gray-500 mt-1">Summary for group: <span className="font-semibold">{group.name}</span></p>
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
                                <th className="p-4 font-semibold"><SortableTableHeader label="Member" columnKey="memberName" sortConfig={sortConfig} requestSort={requestSort} /></th>
                                <th className="p-4 font-semibold"><SortableTableHeader label="Total Contributed" columnKey="totalContributed" sortConfig={sortConfig} requestSort={requestSort} /></th>
                                <th className="p-4 font-semibold"><SortableTableHeader label="Total Withdrawn" columnKey="totalWithdrawn" sortConfig={sortConfig} requestSort={requestSort} /></th>
                                <th className="p-4 font-semibold"><SortableTableHeader label="Net Contribution" columnKey="netContribution" sortConfig={sortConfig} requestSort={requestSort} /></th>
                                <th className="p-4 font-semibold"><SortableTableHeader label="Transactions" columnKey="transactionCount" sortConfig={sortConfig} requestSort={requestSort} /></th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedSummary.map(item => (
                                <tr key={item.memberId} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                                    <td className="p-4"><MemberCell name={item.memberName} avatar={item.memberAvatar} /></td>
                                    <td className="p-4 font-medium text-green-600">TZS {item.totalContributed.toLocaleString()}</td>
                                    <td className="p-4 font-medium text-red-600">TZS {item.totalWithdrawn.toLocaleString()}</td>
                                    <td className="p-4 font-bold text-gray-800">TZS {item.netContribution.toLocaleString()}</td>
                                    <td className="p-4 text-gray-500">{item.transactionCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {processedSummary.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            <p>No summary data found for this group.</p>
                        </div>
                    )}
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
    );
};

export default GroupSummaryReportPage;