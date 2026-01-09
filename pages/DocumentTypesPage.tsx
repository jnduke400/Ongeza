import React, { useState, useMemo, useEffect } from 'react';
import {
    Search, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { DocumentType } from '../types';
import { API_BASE_URL } from '../services/apiConfig';
import { interceptedFetch } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const FILE_TYPE_OPTIONS = ['ANY', 'PDF', 'DOCUMENT', 'SPREADSHEET'];

const AddDocumentTypeModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAdd: () => void;
}> = ({ isOpen, onClose, onAdd }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [fileType, setFileType] = useState('ANY');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName('');
            setDescription('');
            setFileType('ANY');
            setIsSaving(false);
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || isSaving) return;
        setIsSaving(true);
        setError('');
        
        try {
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/document-types`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim(),
                    fileType: fileType,
                }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to add document type.');
            }
            onAdd();
            onClose();
        } catch(err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Add New Document Type</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={3}
                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label htmlFor="fileType" className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
                            <select
                                id="fileType"
                                value={fileType}
                                onChange={e => setFileType(e.target.value)}
                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                {FILE_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 border-t flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Cancel</button>
                        <button type="submit" disabled={isSaving} className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-dark disabled:bg-primary-light flex items-center justify-center min-w-[90px] transition-colors">
                            {isSaving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Add'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditDocumentTypeModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
    documentType: DocumentType | null;
}> = ({ isOpen, onClose, onUpdate, documentType }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [fileType, setFileType] = useState('ANY');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (documentType) {
            setName(documentType.name);
            setDescription(documentType.description);
            setFileType(documentType.fileTypes[0] || 'ANY');
            setError('');
            setIsSaving(false);
        }
    }, [documentType, isOpen]);

    if (!isOpen || !documentType) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || isSaving) return;
        setIsSaving(true);
        setError('');
        
        try {
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/document-types/${documentType.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    description: description.trim(),
                    fileType: fileType,
                }),
            });
            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to update document type.');
            }
            onUpdate();
            onClose();
        } catch(err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Edit Document Type</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <div>
                            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                id="edit-name"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                id="edit-description"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={3}
                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label htmlFor="edit-fileType" className="block text-sm font-medium text-gray-700 mb-1">File Type</label>
                            <select
                                id="edit-fileType"
                                value={fileType}
                                onChange={e => setFileType(e.target.value)}
                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                {FILE_TYPE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 border-t flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Cancel</button>
                        <button type="submit" disabled={isSaving} className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-dark disabled:bg-primary-light flex items-center justify-center min-w-[100px] transition-colors">
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
                    <td className="p-3"><div className="h-4 bg-gray-200 rounded w-1/2"></div></td>
                    <td className="p-3"><div className="h-4 bg-gray-200 rounded w-3/4"></div></td>
                    <td className="p-3"><div className="h-4 bg-gray-200 rounded w-1/3"></div></td>
                    <td className="p-3"><div className="flex items-center space-x-1"><div className="h-8 w-8 bg-gray-200 rounded-full"></div><div className="h-8 w-8 bg-gray-200 rounded-full"></div></div></td>
                </tr>
            ))}
        </>
    );
};

const DocumentTypesPage: React.FC = () => {
    const { user: currentUser } = useAuth();
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
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
    const [editingDocument, setEditingDocument] = useState<DocumentType | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const canCreateType = useMemo(() => {
        if (!currentUser || !currentUser.permissions || !Array.isArray(currentUser.permissions)) return false;
        return currentUser.permissions.includes('CREATE_DOCUMENT_TYPES');
    }, [currentUser]);

    const canEditType = useMemo(() => {
        if (!currentUser || !currentUser.permissions || !Array.isArray(currentUser.permissions)) return false;
        return currentUser.permissions.includes('EDIT_DOCUMENT_TYPES');
    }, [currentUser]);

    const canDeleteType = useMemo(() => {
        if (!currentUser || !currentUser.permissions || !Array.isArray(currentUser.permissions)) return false;
        return currentUser.permissions.includes('DELETE_DOCUMENT_TYPES');
    }, [currentUser]);

    useEffect(() => {
        const timerId = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
            setCurrentPage(1); // Reset page on new search
        }, 500);
        return () => clearTimeout(timerId);
    }, [searchQuery]);

    useEffect(() => {
        const fetchDocumentTypes = async () => {
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

                const response = await interceptedFetch(`${API_BASE_URL}/api/v1/document-types?${params.toString()}`);
                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.message || 'Failed to fetch document types.');
                }

                const mappedData = data.data.content.map((apiDoc: any) => ({
                    id: apiDoc.id,
                    name: apiDoc.name,
                    description: apiDoc.description,
                    fileTypes: apiDoc.fileType ? [apiDoc.fileType] : [],
                    isCore: apiDoc.active,
                }));

                setDocumentTypes(mappedData);
                setTotalPages(data.data.totalPages);
                setTotalElements(data.data.totalElements);
            } catch (err: any) {
                setError(err.message);
                setDocumentTypes([]);
                setTotalPages(0);
                setTotalElements(0);
            } finally {
                setLoading(false);
            }
        };

        fetchDocumentTypes();
    }, [currentPage, itemsPerPage, debouncedSearchQuery, refreshKey]);

    const handleRefresh = () => setRefreshKey(k => k + 1);

    const handleEditClick = (doc: DocumentType) => {
        setEditingDocument(doc);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (id: string | number, name: string) => {
        if (window.confirm(`Are you sure you want to delete the document type "${name}"? This action cannot be undone.`)) {
            try {
                const response = await interceptedFetch(`${API_BASE_URL}/api/v1/document-types/${id}`, {
                    method: 'DELETE',
                });
                const data = await response.json();
                if (!response.ok || !data.success) {
                    throw new Error(data.message || 'Failed to delete document type.');
                }
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
                    <h1 className="text-2xl font-bold text-gray-800">KYC Document Type List</h1>
                    <p className="text-gray-500 mt-1">Manage the types of documents required for Know Your Customer (KYC) verification.</p>
                </div>
                {canCreateType && (
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-primary text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-primary-dark flex items-center space-x-2 transition-colors"
                    >
                        <Plus size={16}/>
                        <span>Add New</span>
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
                                <th className="p-3 text-left font-semibold text-gray-600">NAME</th>
                                <th className="p-3 text-left font-semibold text-gray-600">DESCRIPTION</th>
                                <th className="p-3 text-left font-semibold text-gray-600">FILE TYPES</th>
                                <th className="p-3 text-left font-semibold text-gray-600">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <TableSkeleton rows={itemsPerPage} />
                            ) : error ? (
                                <tr><td colSpan={4} className="text-center p-8 text-red-500">Error: {error}</td></tr>
                            ) : documentTypes.length > 0 ? (
                                documentTypes.map(doc => (
                                    <tr key={doc.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="p-3 text-gray-800 font-medium">{doc.name}</td>
                                        <td className="p-3 text-gray-600">{doc.description}</td>
                                        <td className="p-3 text-gray-600">
                                            {doc.fileTypes.length > 0 ? doc.fileTypes.join(', ') : 'Any'}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex items-center space-x-1 text-gray-500">
                                                {canEditType && (
                                                    <button onClick={() => handleEditClick(doc)} className="p-2 rounded-full hover:bg-gray-100 hover:text-blue-500 transition-colors"><Edit2 size={18}/></button>
                                                )}
                                                {canDeleteType && (
                                                    <button onClick={() => handleDelete(doc.id, doc.name)} className="p-2 rounded-full hover:bg-gray-100 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={4} className="text-center p-8 text-gray-500">No document types found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-center mt-6 text-sm">
                    <p className="text-gray-600">
                        Showing {documentTypes.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, totalElements)} of {totalElements} entries
                    </p>
                    <div className="flex items-center space-x-1">
                        <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 flex items-center"><ChevronLeft size={16} /> <span className="ml-1 hidden sm:inline">Previous</span></button>
                        <span className="px-3 py-1 bg-primary text-white rounded-md font-semibold">{currentPage}</span>
                        <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages || totalPages === 0} className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 flex items-center"><span className="mr-1 hidden sm:inline">Next</span> <ChevronRight size={16} /></button>
                    </div>
                </div>
            </div>
            <AddDocumentTypeModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={handleRefresh} />
            <EditDocumentTypeModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} onUpdate={handleRefresh} documentType={editingDocument} />
        </div>
    );
};

export default DocumentTypesPage;