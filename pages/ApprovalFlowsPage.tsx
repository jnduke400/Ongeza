import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Search, Plus, Eye, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Edit2, Trash2, X
} from 'lucide-react';
// FIX: Import ApiApprovalFlow from types
import { EntityType, ApiApprovalFlow } from '../types';
import { API_BASE_URL } from '../services/apiConfig';
import { interceptedFetch } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Local interface to hold the required data for the table and modals
interface MappedApprovalFlow {
  id: number;
  name: string;
  approvableType: string;
  createdAt: string;
  entityTypeId: number;
}

type SortableKeys = 'name' | 'approvableType' | 'createdAt' | 'id';


const AddApprovalFlowModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAdd: () => void;
}> = ({ isOpen, onClose, onAdd }) => {
    const [flowName, setFlowName] = useState('');
    const [entityTypeId, setEntityTypeId] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const [entityTypes, setEntityTypes] = useState<EntityType[]>([]);
    const [loadingEntityTypes, setLoadingEntityTypes] = useState(true);

    useEffect(() => {
        if (isOpen) {
            setFlowName('');
            setEntityTypeId('');
            setError('');
            setIsSaving(false);
            setLoadingEntityTypes(true);

            const fetchEntityTypes = async () => {
                try {
                    const response = await interceptedFetch(`${API_BASE_URL}/api/v1/entity-types/active`);
                    const data = await response.json();
                    if (!response.ok || !data.success || !Array.isArray(data.data)) {
                        throw new Error(data.message || 'Failed to fetch approvable types.');
                    }
                    setEntityTypes(data.data);
                } catch (err: any) {
                    setError('Could not load approvable types. ' + err.message);
                } finally {
                    setLoadingEntityTypes(false);
                }
            };

            fetchEntityTypes();
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!flowName.trim() || !entityTypeId) {
            setError('Please fill out all fields.');
            return;
        }

        setIsSaving(true);
        try {
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/approval-flows`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    flowName: flowName.trim(),
                    entityTypeId: Number(entityTypeId),
                }),
            });

            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to create approval flow.');
            }
            alert(data.message || 'Approval flow created successfully!');
            onAdd();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Add a New Flow</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                id="name"
                                value={flowName}
                                onChange={e => setFlowName(e.target.value)}
                                required
                                placeholder="e.g. User Approval Flow"
                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label htmlFor="approvableType" className="block text-sm font-medium text-gray-700 mb-1">Approvable Type</label>
                            {loadingEntityTypes ? (
                                <div className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500">Loading...</div>
                            ) : (
                                <select
                                    id="approvableType"
                                    value={entityTypeId}
                                    onChange={e => setEntityTypeId(e.target.value)}
                                    required
                                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="" disabled>Select a type</option>
                                    {entityTypes.map(type => (
                                        <option key={type.id} value={type.id}>{type.displayName}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 border-t flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Cancel</button>
                        <button type="submit" disabled={isSaving || loadingEntityTypes} className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-dark disabled:bg-primary-light flex items-center justify-center min-w-[90px] transition-colors">
                            {isSaving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Add'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditApprovalFlowModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
    flow: MappedApprovalFlow | null;
}> = ({ isOpen, onClose, onUpdate, flow }) => {
    const [flowName, setFlowName] = useState('');
    const [entityTypeId, setEntityTypeId] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [entityTypes, setEntityTypes] = useState<EntityType[]>([]);
    const [loadingEntityTypes, setLoadingEntityTypes] = useState(true);

    useEffect(() => {
        if (isOpen && flow) {
            setFlowName(flow.name);
            setEntityTypeId(String(flow.entityTypeId));
            setError('');
            setIsSaving(false);
            setLoadingEntityTypes(true);

            const fetchEntityTypes = async () => {
                try {
                    const response = await interceptedFetch(`${API_BASE_URL}/api/v1/entity-types/active`);
                    const data = await response.json();
                    if (!response.ok || !data.success || !Array.isArray(data.data)) {
                        throw new Error(data.message || 'Failed to fetch approvable types.');
                    }
                    setEntityTypes(data.data);
                } catch (err: any) {
                    setError('Could not load approvable types. ' + err.message);
                } finally {
                    setLoadingEntityTypes(false);
                }
            };

            fetchEntityTypes();
        }
    }, [isOpen, flow]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!flowName.trim() || !entityTypeId || !flow) {
            setError('Please fill out all fields.');
            return;
        }

        setIsSaving(true);
        try {
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/approval-flows/${flow.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    flowName: flowName.trim(),
                    entityTypeId: Number(entityTypeId),
                }),
            });

            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to update approval flow.');
            }
            alert(data.message || 'Approval flow updated successfully!');
            onUpdate();
            onClose();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Edit Approval Flow</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
                        <div>
                            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                id="edit-name"
                                value={flowName}
                                onChange={e => setFlowName(e.target.value)}
                                required
                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label htmlFor="edit-approvableType" className="block text-sm font-medium text-gray-700 mb-1">Approvable Type</label>
                            {loadingEntityTypes ? (
                                <div className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500">Loading...</div>
                            ) : (
                                <select
                                    id="edit-approvableType"
                                    value={entityTypeId}
                                    onChange={e => setEntityTypeId(e.target.value)}
                                    required
                                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="" disabled>Select a type</option>
                                    {entityTypes.map(type => (
                                        <option key={type.id} value={type.id}>{type.displayName}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 border-t flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Cancel</button>
                        <button type="submit" disabled={isSaving || loadingEntityTypes} className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-dark disabled:bg-primary-light flex items-center justify-center min-w-[90px] transition-colors">
                            {isSaving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Update'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const SortableTableHeader: React.FC<{
    label: string;
    columnKey: SortableKeys;
    sortConfig: { key: SortableKeys; direction: string };
    requestSort: (key: SortableKeys) => void;
}> = ({ label, columnKey, sortConfig, requestSort }) => {
    const isSorted = sortConfig.key === columnKey;
    const isAscending = isSorted && sortConfig.direction === 'ascending';
    const isDescending = isSorted && sortConfig.direction === 'descending';

    return (
        <th 
            className="p-3 text-left font-semibold text-gray-600 cursor-pointer"
            onClick={() => requestSort(columnKey)}
        >
            <div className="flex items-center space-x-1">
                <span>{label}</span>
                <div className="flex flex-col">
                    <ChevronUp size={12} className={`-mb-1 transition-colors ${isAscending ? 'text-primary' : 'text-gray-400'}`} />
                    <ChevronDown size={12} className={`transition-colors ${isDescending ? 'text-primary' : 'text-gray-400'}`} />
                </div>
            </div>
        </th>
    );
};

const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 10 }) => {
    return (
        <>
            {Array.from({ length: rows }).map((_, index) => (
                <tr key={index} className="border-b border-gray-200 animate-pulse">
                    <td className="p-3"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                    <td className="p-3"><div className="h-4 bg-gray-200 rounded w-2/3"></div></td>
                    <td className="p-3"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="p-3"><div className="flex items-center space-x-1"><div className="h-8 w-8 bg-gray-200 rounded-full"></div><div className="h-8 w-8 bg-gray-200 rounded-full"></div><div className="h-8 w-8 bg-gray-200 rounded-full"></div></div></td>
                </tr>
            ))}
        </>
    );
};

const ApprovalFlowsPage: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [approvalFlows, setApprovalFlows] = useState<MappedApprovalFlow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [paginationData, setPaginationData] = useState({ totalPages: 0, totalElements: 0 });

    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys, direction: 'ascending' | 'descending' }>({ key: 'createdAt', direction: 'ascending' });
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingFlow, setEditingFlow] = useState<MappedApprovalFlow | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const canCreateFlow = useMemo(() => {
        if (!currentUser || !currentUser.permissions || !Array.isArray(currentUser.permissions)) return false;
        return currentUser.permissions.includes('CREATE_APPROVAL_FLOW');
    }, [currentUser]);

    const canEditFlow = useMemo(() => {
        if (!currentUser || !currentUser.permissions || !Array.isArray(currentUser.permissions)) return false;
        return currentUser.permissions.includes('EDIT_APPROVAL_FLOW');
    }, [currentUser]);

    const canDeleteFlow = useMemo(() => {
        if (!currentUser || !currentUser.permissions || !Array.isArray(currentUser.permissions)) return false;
        return currentUser.permissions.includes('DELETE_APPROVAL_FLOW');
    }, [currentUser]);

    const canViewFlow = useMemo(() => {
        if (!currentUser || !currentUser.permissions || !Array.isArray(currentUser.permissions)) return false;
        return currentUser.permissions.includes('VIEW_APPROVAL_FLOW');
    }, [currentUser]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);
    
    useEffect(() => {
        const fetchFlows = async () => {
            setLoading(true);
            setError(null);
            try {
                const sortDirection = sortConfig.direction === 'ascending' ? 'asc' : 'desc';
                
                const sortKeyMap: { [key in SortableKeys]?: string } = {
                    name: 'flowName',
                    approvableType: 'entityType',
                    createdAt: 'createdAt',
                    id: 'id'
                };
                const sortBy = sortKeyMap[sortConfig.key] || 'createdAt';

                const params = new URLSearchParams({
                    search: debouncedSearchQuery,
                    page: String(currentPage - 1),
                    size: String(itemsPerPage),
                    sortBy: sortBy,
                    sortDirection: sortDirection,
                });

                const response = await interceptedFetch(`${API_BASE_URL}/api/v1/approval-flows?${params.toString()}`);
                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.message || 'Failed to fetch approval flows.');
                }
                
                const mappedFlows: MappedApprovalFlow[] = data.data.content.map((apiFlow: ApiApprovalFlow) => ({
                    id: apiFlow.id,
                    name: apiFlow.flowName,
                    approvableType: apiFlow.entityType.displayName,
                    createdAt: new Date(apiFlow.createdAt).toISOString().split('T')[0],
                    entityTypeId: apiFlow.entityType.id,
                }));

                setApprovalFlows(mappedFlows);
                setPaginationData({
                    totalPages: data.data.totalPages,
                    totalElements: data.data.totalElements,
                });

            } catch (err: any) {
                setError(err.message);
                setApprovalFlows([]);
                setPaginationData({ totalPages: 0, totalElements: 0 });
            } finally {
                setLoading(false);
            }
        };

        fetchFlows();
    }, [currentPage, itemsPerPage, sortConfig, debouncedSearchQuery, refreshTrigger]);

    const requestSort = (key: SortableKeys) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
        }));
    };

    const handleDelete = async (id: number, name: string) => {
        if (window.confirm(`Are you sure you want to delete the flow "${name}"? This action cannot be undone.`)) {
             try {
                const response = await interceptedFetch(`${API_BASE_URL}/api/v1/approval-flows/${id}`, {
                    method: 'DELETE'
                });
                const data = await response.json();
                if (!response.ok || !data.success) {
                    throw new Error(data.message || 'Failed to delete flow.');
                }
                alert(data.message || 'Flow deleted successfully.');
                setRefreshTrigger(k => k + 1);
            } catch (err: any) {
                 alert(`Error: ${err.message}`);
            }
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                 <div>
                    <h1 className="text-2xl font-bold text-gray-800">Request Approval Flows</h1>
                    <p className="text-gray-500 mt-1">This page is supposed to facilitate approval process based on user role.</p>
                </div>
                 {canCreateFlow && (
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-primary text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-primary-dark flex items-center space-x-2 transition-colors"
                    >
                        <Plus size={16}/>
                        <span>Add a New Flow</span>
                    </button>
                 )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
                 <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>Show</span>
                        <select 
                            value={itemsPerPage} 
                            onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                            className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            <option value={10}>10</option>
                            <option value={15}>15</option>
                            <option value={25}>25</option>
                        </select>
                    </div>
                    <div className="flex items-center space-x-2 flex-wrap gap-2">
                         <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm w-48 focus:outline-none focus:ring-1 focus:ring-primary"
                            />
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b-2 border-gray-200">
                                <SortableTableHeader label="NAME" columnKey="name" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableTableHeader label="APPROVABLE TYPE" columnKey="approvableType" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableTableHeader label="CREATED AT" columnKey="createdAt" sortConfig={sortConfig} requestSort={requestSort} />
                                <th className="p-3 text-left font-semibold text-gray-600">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <TableSkeleton rows={itemsPerPage} />
                            ) : error ? (
                                <tr><td colSpan={4} className="text-center p-8 text-red-500">Error: {error}</td></tr>
                            ) : approvalFlows.length > 0 ? (
                                approvalFlows.map((flow) => (
                                    <tr key={flow.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="p-3 text-gray-800 font-medium">{flow.name}</td>
                                        <td className="p-3 text-gray-600">{flow.approvableType}</td>
                                        <td className="p-3 text-gray-600">{flow.createdAt}</td>
                                        <td className="p-3">
                                            <div className="flex items-center space-x-1 text-gray-500">
                                                {canViewFlow && (
                                                    <Link to={`/configurations/approval-flows/${flow.id}`} className="p-2 rounded-full hover:bg-gray-100 hover:text-primary transition-colors"><Eye size={18}/></Link>
                                                )}
                                                {canEditFlow && (
                                                    <button onClick={() => { setEditingFlow(flow); setIsEditModalOpen(true); }} className="p-2 rounded-full hover:bg-gray-100 hover:text-blue-500 transition-colors"><Edit2 size={18}/></button>
                                                )}
                                                {canDeleteFlow && (
                                                    <button onClick={() => handleDelete(flow.id, flow.name)} className="p-2 rounded-full hover:bg-gray-100 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={4} className="text-center p-8 text-gray-500">No approval flows found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-center mt-6 text-sm">
                    <p className="text-gray-600">
                        {/* FIX: Using paginationData.totalElements instead of totalElements */}
                        Showing {approvalFlows.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, paginationData.totalElements)} of {paginationData.totalElements} entries
                    </p>
                    <div className="flex items-center space-x-1">
                        <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 flex items-center"><ChevronLeft size={16} /> <span className="ml-1 hidden sm:inline">Previous</span></button>
                        <span className="px-3 py-1 bg-primary text-white rounded-md font-semibold">{currentPage}</span>
                        <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage === paginationData.totalPages || paginationData.totalPages === 0} className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 flex items-center"><span className="mr-1 hidden sm:inline">Next</span> <ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>
            <AddApprovalFlowModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={() => setRefreshTrigger(k => k + 1)} />
            <EditApprovalFlowModal 
                isOpen={isEditModalOpen} 
                onClose={() => setIsEditModalOpen(false)} 
                onUpdate={() => setRefreshTrigger(k => k + 1)}
                flow={editingFlow}
            />
        </div>
    );
};

export default ApprovalFlowsPage;