import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronDown, ChevronUp, Search, Plus, Eye, Edit2, Trash2, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { mockModules } from '../services/mockData';
import { Module } from '../types';

type SortableKeys = keyof Module;

// Modal for adding a new module
const AddModuleModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAddModule: (data: Omit<Module, 'id'>) => Promise<void>;
}> = ({ isOpen, onClose, onAddModule }) => {
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        
        const formData = new FormData(e.currentTarget);
        const newModuleData: Omit<Module, 'id'> = {
            name: formData.get('name') as string,
            description: formData.get('description') as string,
            type: formData.get('type') as 'Loan' | 'Saving' | 'Investment' | 'Other',
            mobileApp: formData.has('mobileApp'),
        };
        
        await onAddModule(newModuleData);
        setIsSaving(false);
        onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Add New Module</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                required
                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                id="description"
                                name="description"
                                required
                                rows={3}
                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                id="type"
                                name="type"
                                required
                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="Loan">Loan</option>
                                <option value="Saving">Saving</option>
                                <option value="Investment">Investment</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="flex items-center">
                            <input
                                id="mobileApp"
                                name="mobileApp"
                                type="checkbox"
                                className="h-4 w-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary" />
                            <label htmlFor="mobileApp" className="ml-2 text-sm text-gray-700">Available on Mobile App</label>
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 border-t flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Cancel</button>
                        <button type="submit" disabled={isSaving} className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-dark disabled:bg-primary-light flex items-center justify-center min-w-[120px] transition-colors">
                            {isSaving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Add Module'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Modal for editing an existing module
const EditModuleModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onUpdateModule: (data: Module) => Promise<void>;
    module: Module | null;
}> = ({ isOpen, onClose, onUpdateModule, module }) => {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState<Omit<Module, 'id'>>({
        name: module?.name || '',
        description: module?.description || '',
        type: module?.type || 'Loan',
        mobileApp: module?.mobileApp || false,
    });

    useEffect(() => {
        if (module) {
            setFormData({
                name: module.name,
                description: module.description,
                type: module.type,
                mobileApp: module.mobileApp,
            });
        }
    }, [module]);

    if (!isOpen || !module) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        await onUpdateModule({ ...module, ...formData });
        setIsSaving(false);
        onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Edit Module</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                id="edit-name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                id="edit-description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows={3}
                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label htmlFor="edit-type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select
                                id="edit-type"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                required
                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="Loan">Loan</option>
                                <option value="Saving">Saving</option>
                                <option value="Investment">Investment</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="flex items-center">
                            <input
                                id="edit-mobileApp"
                                name="mobileApp"
                                type="checkbox"
                                checked={formData.mobileApp}
                                onChange={handleChange}
                                className="h-4 w-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary" />
                            <label htmlFor="edit-mobileApp" className="ml-2 text-sm text-gray-700">Available on Mobile App</label>
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 border-t flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Cancel</button>
                        <button type="submit" disabled={isSaving} className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-dark disabled:bg-primary-light flex items-center justify-center min-w-[140px] transition-colors">
                            {isSaving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Update Module'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const MobileAppBadge: React.FC<{ available: boolean }> = ({ available }) => {
    return available ? (
        <span className="bg-emerald-100 text-emerald-700 px-3 py-1 text-xs font-semibold rounded-md">
            Yes
        </span>
    ) : (
        <span className="bg-gray-100 text-gray-700 px-3 py-1 text-xs font-semibold rounded-md">
            No
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
            className={`p-4 font-semibold cursor-pointer whitespace-nowrap ${className}`}
            onClick={() => requestSort(columnKey)}
        >
            <div className="flex items-center space-x-1 text-gray-500 hover:text-gray-800">
                 <span>{label}</span>
                 <div className="flex flex-col">
                    <ChevronUp size={14} className={`-mb-1.5 transition-colors ${isAscending ? 'text-indigo-600' : ''}`} />
                    <ChevronDown size={14} className={`-mt-1.5 transition-colors ${!isAscending ? 'text-indigo-600' : ''}`} />
                </div>
            </div>
        </th>
    );
};

const ModulesPage: React.FC = () => {
    const [modules, setModules] = useState<Module[]>(mockModules);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys; direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const navigate = useNavigate();

    const requestSort = (key: SortableKeys) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
        }));
        setCurrentPage(1);
    };
    
    const handleAddModule = async (data: Omit<Module, 'id'>) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newModule: Module = {
            id: `mod${Date.now()}`,
            ...data
        };
        setModules(prev => [newModule, ...prev]);
    };

    const handleEditClick = (module: Module) => {
        setEditingModule(module);
        setIsEditModalOpen(true);
    };

    const handleUpdateModule = async (updatedModule: Module) => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setModules(prev => prev.map(m => m.id === updatedModule.id ? updatedModule : m));
    };

    const processedModules = useMemo(() => {
        let filteredModules = [...modules];

        if (searchQuery) {
            const lowercasedQuery = searchQuery.toLowerCase();
            filteredModules = filteredModules.filter(m => 
                m.name.toLowerCase().includes(lowercasedQuery) ||
                m.description.toLowerCase().includes(lowercasedQuery) ||
                m.type.toLowerCase().includes(lowercasedQuery)
            );
        }

        filteredModules.sort((a, b) => {
            const key = sortConfig.key;
            if (a[key] < b[key]) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (a[key] > b[key]) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });

        return filteredModules;
    }, [searchQuery, sortConfig, modules]);

    const totalPages = Math.ceil(processedModules.length / itemsPerPage);
    const paginatedModules = processedModules.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <>
            <div className="space-y-6">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Financial Module Management</h1>
                        <p className="text-gray-500 mt-1">Configure the financial products and services available on the platform.</p>
                    </div>
                    <button 
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-primary text-white px-4 py-2.5 rounded-lg font-semibold text-sm hover:bg-primary-dark flex items-center space-x-2 transition-colors shadow-sm"
                    >
                        <Plus size={18}/>
                        <span>Add Module</span>
                    </button>
                </div>

                <div className="bg-surface p-6 rounded-lg shadow-sm border border-gray-100">
                    <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <span>Show</span>
                            <select 
                                value={itemsPerPage} 
                                onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                className="border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                            </select>
                            <span>entries</span>
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
                                <tr className="border-b-2 border-gray-200 bg-gray-50 text-xs text-gray-500 uppercase">
                                    <SortableTableHeader label="Name" columnKey="name" sortConfig={sortConfig} requestSort={requestSort} />
                                    <SortableTableHeader label="Description" columnKey="description" sortConfig={sortConfig} requestSort={requestSort} />
                                    <SortableTableHeader label="Mobile App" columnKey="mobileApp" sortConfig={sortConfig} requestSort={requestSort} />
                                    <SortableTableHeader label="Type" columnKey="type" sortConfig={sortConfig} requestSort={requestSort} />
                                    <th className="p-4 font-semibold text-gray-500">ACTIONS</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedModules.map(module => (
                                    <tr key={module.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="p-4 font-medium text-gray-800">{module.name}</td>
                                        <td className="p-4 text-gray-600">{module.description}</td>
                                        <td className="p-4"><MobileAppBadge available={module.mobileApp} /></td>
                                        <td className="p-4 text-gray-600">{module.type}</td>
                                        <td className="p-4">
                                            <div className="flex items-center space-x-1 text-gray-500">
                                                <button onClick={() => alert(`Viewing ${module.name}`)} className="p-2 rounded-full hover:bg-gray-100 hover:text-primary transition-colors"><Eye size={18}/></button>
                                                <button onClick={() => handleEditClick(module)} className="p-2 rounded-full hover:bg-gray-100 hover:text-blue-500 transition-colors"><Edit2 size={18}/></button>
                                                <button onClick={() => alert(`Deleting ${module.name}`)} className="p-2 rounded-full hover:bg-gray-100 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {processedModules.length === 0 && (
                            <div className="text-center py-10 text-gray-500">
                                <p>No modules found.</p>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-between items-center mt-6 text-sm">
                        <p className="text-gray-600">
                            Showing {paginatedModules.length > 0 ? ((currentPage - 1) * itemsPerPage) + 1 : 0} to {Math.min(currentPage * itemsPerPage, processedModules.length)} of {processedModules.length} entries
                        </p>
                        <div className="flex items-center space-x-1">
                            <button onClick={() => setCurrentPage(p => p - 1)} disabled={currentPage === 1} className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 flex items-center"><ChevronLeft size={16} /> <span className="ml-1 hidden sm:inline">Previous</span></button>
                            <span className="px-3 py-1 bg-primary text-white rounded-md font-semibold">{currentPage}</span>
                            <button onClick={() => setCurrentPage(p => p + 1)} disabled={currentPage >= totalPages || totalPages === 0} className="px-3 py-1 border border-gray-300 rounded-md hover:bg-gray-100 disabled:opacity-50 flex items-center"><span className="mr-1 hidden sm:inline">Next</span> <ChevronRight size={16} /></button>
                        </div>
                    </div>
                </div>
            </div>
            <AddModuleModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onAddModule={handleAddModule} 
            />
             <EditModuleModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onUpdateModule={handleUpdateModule}
                module={editingModule}
            />
        </>
    );
};

export default ModulesPage;
