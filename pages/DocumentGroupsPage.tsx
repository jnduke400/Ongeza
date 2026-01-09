import React, { useState, useMemo, useEffect } from 'react';
import {
    Search, Plus, Eye, Edit2, Trash2, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { DocumentGroup, ApiGroup, ApiDocumentType } from '../types';
import { API_BASE_URL } from '../services/apiConfig';
import { interceptedFetch } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface MappedDocumentGroup {
    id: number;
    name: string;
    documentTypeName: string;
    groupId: number;
    documentTypeId: number;
}

const AddGroupModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAdd: () => void;
}> = ({ isOpen, onClose, onAdd }) => {
    const [groupId, setGroupId] = useState('');
    const [documentTypeId, setDocumentTypeId] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const [groups, setGroups] = useState<ApiGroup[]>([]);
    const [documentTypes, setDocumentTypes] = useState<ApiDocumentType[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (isOpen) {
            // Reset state
            setGroupId('');
            setDocumentTypeId('');
            setError('');
            setIsSaving(false);
            setLoadingData(true);

            const fetchData = async () => {
                try {
                    const [groupsRes, docTypesRes] = await Promise.all([
                        interceptedFetch(`${API_BASE_URL}/api/v1/groups`),
                        interceptedFetch(`${API_BASE_URL}/api/v1/document-types`)
                    ]);

                    const groupsData = await groupsRes.json();
                    const docTypesData = await docTypesRes.json();

                    if (!groupsRes.ok || !groupsData.success) {
                        throw new Error(groupsData.message || 'Failed to fetch groups.');
                    }
                    if (!docTypesRes.ok || !docTypesData.success) {
                        throw new Error(docTypesData.message || 'Failed to fetch document types.');
                    }

                    setGroups(groupsData.data.content);
                    setDocumentTypes(docTypesData.data.content);

                } catch (err: any) {
                    setError('Could load necessary data: ' + err.message);
                } finally {
                    setLoadingData(false);
                }
            };

            fetchData();
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!groupId || !documentTypeId) {
            setError('Please select both a group and a document type.');
            return;
        }

        setIsSaving(true);
        try {
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/document-groups`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupId: Number(groupId),
                    documentTypeId: Number(documentTypeId),
                }),
            });

            const data = await response.json();
            
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to create document group.');
            }
            alert(data.message || 'Document group created successfully!');
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
                    <h2 className="text-xl font-semibold text-gray-800">Add Group</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
                        <div>
                            <label htmlFor="groupName" className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                            {loadingData ? (
                                <div className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500">Loading...</div>
                            ) : (
                                <select
                                    id="groupName"
                                    value={groupId}
                                    onChange={e => setGroupId(e.target.value)}
                                    required
                                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="" disabled>Select a group</option>
                                    {groups.map(group => <option key={group.id} value={group.id}>{group.name}</option>)}
                                </select>
                            )}
                        </div>
                        <div>
                            <label htmlFor="docTypeName" className="block text-sm font-medium text-gray-700 mb-1">KYC Document Type</label>
                            {loadingData ? (
                                <div className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500">Loading...</div>
                            ) : (
                                <select
                                    id="docTypeName"
                                    value={documentTypeId}
                                    onChange={e => setDocumentTypeId(e.target.value)}
                                    required
                                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="" disabled>Select a document type</option>
                                    {documentTypes.map(doc => <option key={doc.id} value={doc.id}>{doc.name}</option>)}
                                </select>
                            )}
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 border-t flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Cancel</button>
                        <button type="submit" disabled={isSaving || loadingData} className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-dark disabled:bg-primary-light flex items-center justify-center min-w-[90px] transition-colors">
                            {isSaving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Add'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditGroupModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
    group: MappedDocumentGroup | null;
}> = ({ isOpen, onClose, onUpdate, group }) => {
    const [groupId, setGroupId] = useState('');
    const [documentTypeId, setDocumentTypeId] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    const [groups, setGroups] = useState<ApiGroup[]>([]);
    const [documentTypes, setDocumentTypes] = useState<ApiDocumentType[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (isOpen && group) {
            setGroupId(String(group.groupId));
            setDocumentTypeId(String(group.documentTypeId));
            setError('');
            setIsSaving(false);
            setLoadingData(true);

            const fetchData = async () => {
                try {
                    const [groupsRes, docTypesRes] = await Promise.all([
                        interceptedFetch(`${API_BASE_URL}/api/v1/groups`),
                        interceptedFetch(`${API_BASE_URL}/api/v1/document-types`)
                    ]);
                    const groupsData = await groupsRes.json();
                    const docTypesData = await docTypesRes.json();
                    if (!groupsRes.ok || !groupsData.success) throw new Error(groupsData.message || 'Failed to fetch groups.');
                    if (!docTypesRes.ok || !docTypesData.success) throw new Error(docTypesData.message || 'Failed to fetch document types.');
                    setGroups(groupsData.data.content);
                    setDocumentTypes(docTypesData.data.content);
                } catch (err: any) {
                    setError('Could not load necessary data: ' + err.message);
                } finally {
                    setLoadingData(false);
                }
            };
            fetchData();
        }
    }, [isOpen, group]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!groupId || !documentTypeId || !group) {
            setError('Please select both a group and a document type.');
            return;
        }

        setIsSaving(true);
        try {
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/document-groups/${group.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    groupId: Number(groupId),
                    documentTypeId: Number(documentTypeId),
                }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to update document group.');
            }
            alert(data.message || 'Document group updated successfully!');
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
                    <h2 className="text-xl font-semibold text-gray-800">Edit Group</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
                        <div>
                            <label htmlFor="edit-groupName" className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                            {loadingData ? (
                                <div className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500">Loading...</div>
                            ) : (
                                <select
                                    id="edit-groupName"
                                    value={groupId}
                                    onChange={e => setGroupId(e.target.value)}
                                    required
                                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="" disabled>Select a group</option>
                                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            )}
                        </div>
                        <div>
                            <label htmlFor="edit-docTypeName" className="block text-sm font-medium text-gray-700 mb-1">KYC Document Type</label>
                            {loadingData ? (
                                <div className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500">Loading...</div>
                            ) : (
                                <select
                                    id="edit-docTypeName"
                                    value={documentTypeId}
                                    onChange={e => setDocumentTypeId(e.target.value)}
                                    required
                                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="" disabled>Select a document type</option>
                                    {documentTypes.map(doc => <option key={doc.id} value={doc.id}>{doc.name}</option>)}
                                </select>
                            )}
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 border-t flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Cancel</button>
                        <button type="submit" disabled={isSaving || loadingData} className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-dark disabled:bg-primary-light flex items-center justify-center min-w-[100px] transition-colors">
                            {isSaving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Update'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 10 }) => {
    return (
        <>
            {Array.from({ length: rows }).map((_, index) => (
                <tr key={index} className="border-b border-gray-200 animate-pulse">
                    <td className="p-3"><div className="h-4 bg-gray-200 rounded w-8"></div></td>
                    <td className="p-3"><div className="h-4 bg-gray-200 rounded w-1/3"></div></td>
                    <td className="p-3"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="p-3"><div className="flex items-center space-x-1"><div className="h-8 w-8 bg-gray-200 rounded-full"></div><div className="h-8 w-8 bg-gray-200 rounded-full"></div><div className="h-8 w-8 bg-gray-200 rounded-full"></div></div></td>
                </tr>
            ))}
        </>
    );
};


const DocumentGroupsPage: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [documentGroups, setDocumentGroups] = useState<MappedDocumentGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<MappedDocumentGroup | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    const canCreateGroup = useMemo(() => {
        if (!currentUser || !currentUser.permissions || !Array.isArray(currentUser.permissions)) return false;
        return currentUser.permissions.includes('CREATE_DOCUMENT_GROUPS');
    }, [currentUser]);

    const canEditGroup = useMemo(() => {
        if (!currentUser || !currentUser.permissions || !Array.isArray(currentUser.permissions)) return false;
        return currentUser.permissions.includes('EDIT_DOCUMENT_GROUPS');
    }, [currentUser]);

    const canDeleteGroup = useMemo(() => {
        if (!currentUser || !currentUser.permissions || !Array.isArray(currentUser.permissions)) return false;
        return currentUser.permissions.includes('DELETE_DOCUMENT_GROUPS');
    }, [currentUser]);

    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            setCurrentPage(1); // Reset page on new search
        }, 500);
        return () => clearTimeout(timerId);
    }, [searchQuery]);

    useEffect(() => {
        const fetchDocumentGroups = async () => {
            setLoading(true);
            setError(null);
            try {
                const params = new URLSearchParams({
                    search: debouncedSearchQuery,
                    page: String(currentPage - 1),
                    size: String(itemsPerPage),
                    sortBy: 'createdAt',
                    sortDirection: 'desc',
                });

                const response = await interceptedFetch(`${API_BASE_URL}/api/v1/document-groups?${params.toString()}`);
                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.message || 'Failed to fetch document groups.');
                }

                const mappedData: MappedDocumentGroup[] = data.data.content.map((apiGroup: any) => ({
                    id: apiGroup.id,
                    name: apiGroup.group.name,
                    documentTypeName: apiGroup.documentType.name,
                    groupId: apiGroup.group.id,
                    documentTypeId: apiGroup.documentType.id,
                }));

                setDocumentGroups(mappedData);
                setTotalPages(data.data.totalPages);
                setTotalElements(data.data.totalElements);

            } catch (err: any) {
                setError(err.message);
                setDocumentGroups([]);
                setTotalPages(0);
                setTotalElements(0);
            } finally {
                setLoading(false);
            }
        };

        fetchDocumentGroups();
    }, [currentPage, itemsPerPage, debouncedSearchQuery, refreshTrigger]);

    const handleRefresh = () => setRefreshTrigger(k => k + 1);

    const handleEditClick = (group: MappedDocumentGroup) => {
        setEditingGroup(group);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (group: MappedDocumentGroup) => {
        if (window.confirm(`Are you sure you want to delete the group "${group.name} - ${group.documentTypeName}"?`)) {
            try {
                const response = await interceptedFetch(`${API_BASE_URL}/api/v1/document-groups/${group.id}`, {
                    method: 'DELETE',
                });
                const data = await response.json();
                if (!response.ok || !data.success) {
                    throw new Error(data.message || 'Failed to delete group.');
                }
                alert(data.message || 'Group deleted successfully');
                handleRefresh();
            } catch (err: any) {
                alert(`Error: ${err.message}`);
            }
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                 <div>
                    <h1 className="text-2xl font-bold text-gray-800">KYC Document Type Group List</h1>
                     <div className="text-sm breadcrumbs text-gray-500 mt-1">
                        <ul>
                            <li><a>Dashboard</a></li> 
                            <li>KYC Document Type Group List</li>
                        </ul>
                    </div>
                </div>
                 {canCreateGroup && (
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-primary text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-primary-dark flex items-center space-x-2 transition-colors"
                    >
                        <Plus size={16}/>
                        <span>Add Group</span>
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
                    <div className="flex items-center space-x-2">
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
                                <th className="p-3 text-left font-semibold text-gray-600">#</th>
                                <th className="p-3 text-left font-semibold text-gray-600">NAME</th>
                                <th className="p-3 text-left font-semibold text-gray-600">KYC DOCUMENT TYPE NAME</th>
                                <th className="p-3 text-left font-semibold text-gray-600">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <TableSkeleton rows={itemsPerPage} />
                            ) : error ? (
                                <tr><td colSpan={4} className="text-center p-8 text-red-500">Error: {error}</td></tr>
                            ) : documentGroups.length > 0 ? (
                                documentGroups.map((group, index) => (
                                    <tr key={group.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="p-3 text-gray-600 font-medium">{((currentPage - 1) * itemsPerPage) + index + 1}.</td>
                                        <td className="p-3 text-gray-800 font-medium">{group.name}</td>
                                        <td className="p-3 text-gray-600">{group.documentTypeName}</td>
                                        <td className="p-3">
                                            <div className="flex items-center space-x-1 text-gray-500">
                                                <button className="p-2 rounded-full hover:bg-gray-100 hover:text-indigo-500 transition-colors"><Eye size={18}/></button>
                                                {canEditGroup && (
                                                    <button onClick={() => handleEditClick(group)} className="p-2 rounded-full hover:bg-gray-100 hover:text-blue-500 transition-colors"><Edit2 size={18}/></button>
                                                )}
                                                {canDeleteGroup && (
                                                    <button onClick={() => handleDelete(group)} className="p-2 rounded-full hover:bg-gray-100 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={4} className="text-center p-8 text-gray-500">No document groups found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-center mt-6 text-sm">
                    <p className="text-gray-600">
                        Showing {documentGroups.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalElements)} of {totalElements} entries
                    </p>
                    <div className="flex items-center space-x-1">
                        <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 flex items-center"><ChevronLeft size={16} /> <span className="ml-1 hidden sm:inline">Previous</span></button>
                        <span className="px-3 py-1 bg-primary text-white rounded-md font-semibold">{currentPage}</span>
                        <button onClick={() => setCurrentPage(p => + 1)} disabled={currentPage >= totalPages || totalPages === 0} className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 flex items-center"><span className="mr-1 hidden sm:inline">Next</span> <ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>
            <AddGroupModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleRefresh} />
            <EditGroupModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onUpdate={handleRefresh} group={editingGroup} />
        </div>
    );
};

export default DocumentGroupsPage;