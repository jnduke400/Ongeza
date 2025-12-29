import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Plus, X, ChevronUp, ChevronDown, Edit2, Trash2
} from 'lucide-react';
// FIX: Import ApiApprovalFlow from types.ts
import { ApprovalFlow, ApprovalFlowStep, ApiApprovalStep, ApiApprovalFlow, ApiRole } from '../types';
import { API_BASE_URL } from '../services/apiConfig';
import { interceptedFetch } from '../services/api';

type SortableKeys = keyof ApprovalFlowStep;

const formatApiString = (str: string | null | undefined): string => {
  if (!str) return '';
  return str
    .replace('ROLE_', '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Modal for adding a new step
const AddStepModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAddSuccess: () => void;
    flowId: string;
    existingSteps: ApprovalFlowStep[];
}> = ({ isOpen, onClose, onAddSuccess, flowId, existingSteps }) => {
    const [roleId, setRoleId] = useState('');
    const [order, setOrder] = useState(1);
    const [action, setAction] = useState('APPROVE');
    const [description, setDescription] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    
    const [roles, setRoles] = useState<ApiRole[]>([]);
    const [loadingRoles, setLoadingRoles] = useState(true);

    useEffect(() => {
        if (isOpen) {
            // Reset form
            setRoleId('');
            setOrder(existingSteps.length > 0 ? Math.max(...existingSteps.map(s => s.order)) + 1 : 1);
            setAction('APPROVE');
            setDescription('');
            setError('');
            
            // Fetch roles
            const fetchRoles = async () => {
                setLoadingRoles(true);
                try {
                    const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/roles`);
                    const data = await response.json();
                    if (!response.ok || !data.success || !data.data.content) {
                        throw new Error(data.message || 'Failed to fetch roles');
                    }
                    setRoles(data.data.content);
                } catch (err: any) {
                    setError('Failed to load roles: ' + err.message);
                } finally {
                    setLoadingRoles(false);
                }
            };

            fetchRoles();
        }
    }, [isOpen, existingSteps]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!roleId || isSaving) return;

        setIsSaving(true);
        try {
            const selectedRole = roles.find(r => r.id === Number(roleId));
            const payload = {
                flowId: Number(flowId),
                roleId: Number(roleId),
                actions: [action],
                order: order,
                description: description || `${selectedRole ? formatApiString(selectedRole.name) : 'User'} approval step`,
                enabled: true,
            };

            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/approval-steps`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to create step.');
            }
            
            alert(data.message || 'Approval step created successfully!');
            onAddSuccess();
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
                    <h2 className="text-xl font-semibold text-gray-800">Add a New Step</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            {loadingRoles ? (
                                <div className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500">Loading roles...</div>
                            ) : (
                                <select
                                    id="role"
                                    value={roleId}
                                    onChange={e => setRoleId(e.target.value)}
                                    required
                                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="" disabled>Select a Role</option>
                                    {roles.map(r => <option key={r.id} value={r.id}>{formatApiString(r.name)}</option>)}
                                </select>
                            )}
                        </div>
                        <div>
                            <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                            <input
                                type="number"
                                id="order"
                                value={order}
                                onChange={e => setOrder(Number(e.target.value))}
                                required
                                min="1"
                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                         <div>
                            <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                            <select
                                id="action"
                                value={action}
                                onChange={e => setAction(e.target.value)}
                                required
                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="APPROVE">APPROVE</option>
                                <option value="ACKNOWLEDGE">ACKNOWLEDGE</option>
                                <option value="REJECT">REJECT</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={2}
                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 border-t flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Cancel</button>
                        <button type="submit" disabled={isSaving || loadingRoles} className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-dark disabled:bg-primary-light flex items-center justify-center min-w-[90px] transition-colors">
                            {isSaving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Add Step'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const EditStepModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onUpdateSuccess: () => void;
    step: ApprovalFlowStep | null;
}> = ({ isOpen, onClose, onUpdateSuccess, step }) => {
    const [roleId, setRoleId] = useState<number | string>('');
    const [order, setOrder] = useState(1);
    const [action, setAction] = useState('APPROVE');
    const [description, setDescription] = useState('');
    const [enabled, setEnabled] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    
    const [roles, setRoles] = useState<ApiRole[]>([]);
    const [loadingRoles, setLoadingRoles] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (step && isOpen) {
            setRoleId(step.roleId);
            setOrder(step.order);
            setAction(step.action.split(',')[0]);
            setDescription(step.description || '');
            setEnabled(step.status === 'Active');

            const fetchRoles = async () => {
                setLoadingRoles(true);
                try {
                    const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/roles`);
                    const data = await response.json();
                    if (!response.ok || !data.success || !data.data.content) {
                        throw new Error(data.message || 'Failed to fetch roles');
                    }
                    setRoles(data.data.content);
                } catch (err: any) {
                    setError('Failed to load roles: ' + err.message);
                } finally {
                    setLoadingRoles(false);
                }
            };
            fetchRoles();
        }
    }, [step, isOpen]);

    if (!isOpen || !step) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!roleId || isSaving) return;

        setIsSaving(true);
        try {
            const payload = {
                roleId: Number(roleId),
                actions: [action],
                order: order,
                description: description,
                enabled: enabled,
            };

            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/approval-steps/${step.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Failed to update step.');
            }
            
            alert(data.message || 'Approval step updated successfully!');
            onUpdateSuccess();
            onClose();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Edit Step</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <div>
                            <label htmlFor="edit-role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            {loadingRoles ? (
                                <div className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500">Loading roles...</div>
                            ) : (
                                <select
                                    id="edit-role"
                                    value={roleId}
                                    onChange={e => setRoleId(e.target.value)}
                                    required
                                    className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                                >
                                    <option value="" disabled>Select a Role</option>
                                    {roles.map(r => <option key={r.id} value={r.id}>{formatApiString(r.name)}</option>)}
                                </select>
                            )}
                        </div>
                        <div>
                            <label htmlFor="edit-order" className="block text-sm font-medium text-gray-700 mb-1">Order</label>
                            <input
                                type="number"
                                id="edit-order"
                                value={order}
                                onChange={e => setOrder(Number(e.target.value))}
                                required
                                min="1"
                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                         <div>
                            <label htmlFor="edit-action" className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                            <select
                                id="edit-action"
                                value={action}
                                onChange={e => setAction(e.target.value)}
                                required
                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="APPROVE">APPROVE</option>
                                <option value="ACKNOWLEDGE">ACKNOWLEDGE</option>
                                <option value="REJECT">REJECT</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                            <textarea
                                id="edit-description"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                rows={2}
                                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        </div>
                        <div className="flex items-center">
                            <input
                                id="edit-enabled"
                                type="checkbox"
                                checked={enabled}
                                onChange={e => setEnabled(e.target.checked)}
                                className="h-4 w-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary"
                            />
                            <label htmlFor="edit-enabled" className="ml-2 text-sm text-gray-700">Enabled</label>
                        </div>
                    </div>
                    <div className="p-6 bg-gray-50 border-t flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg font-semibold hover:bg-gray-300 transition-colors">Cancel</button>
                        <button type="submit" disabled={isSaving || loadingRoles} className="bg-primary text-white px-5 py-2.5 rounded-lg font-semibold hover:bg-primary-dark disabled:bg-primary-light flex items-center justify-center min-w-[120px] transition-colors">
                            {isSaving ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : 'Update Step'}
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
            className="p-3 text-left font-semibold text-gray-600 uppercase cursor-pointer"
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

const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
    <>
        {Array.from({ length: rows }).map((_, index) => (
            <tr key={index} className="border-b border-gray-200 animate-pulse">
                <td className="p-3"><div className="h-4 bg-gray-200 rounded w-8"></div></td>
                <td className="p-3"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                <td className="p-3"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                <td className="p-3"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                <td className="p-3"><div className="h-6 w-20 bg-gray-200 rounded-full"></div></td>
                <td className="p-3"><div className="h-8 w-24 bg-gray-200 rounded-md"></div></td>
            </tr>
        ))}
    </>
);


const ApprovalFlowDetailPage: React.FC = () => {
    const { flowId } = useParams<{ flowId: string }>();
    const [flow, setFlow] = useState<ApprovalFlow | null>(null);
    const [steps, setSteps] = useState<ApprovalFlowStep[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingStep, setEditingStep] = useState<ApprovalFlowStep | null>(null);
    const [sortConfig, setSortConfig] = useState<{ key: SortableKeys, direction: 'ascending' | 'descending' }>({ key: 'order', direction: 'ascending' });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);


    useEffect(() => {
        if (!flowId) return;

        const fetchDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                // Fetch flow details first to get the name
                const flowResponse = await interceptedFetch(`${API_BASE_URL}/api/v1/approval-flows/${flowId}`);
                // FIX: Added type annotation for flowData response
                const flowData: { success: boolean; data: ApiApprovalFlow; message?: string } = await flowResponse.json();
                if (!flowResponse.ok || !flowData.success) {
                    throw new Error(flowData.message || 'Failed to fetch approval flow details.');
                }
                const apiFlow: ApiApprovalFlow = flowData.data;
                setFlow({
                    id: apiFlow.id,
                    name: apiFlow.flowName,
                    approvableType: typeof apiFlow.entityType === 'object' ? apiFlow.entityType.displayName : String(apiFlow.entityType),
                    createdAt: new Date(apiFlow.createdAt).toISOString().split('T')[0],
                });

                // Then fetch steps
                const params = new URLSearchParams({
                    flowId: flowId,
                    page: '0',
                    size: '20', // Fetch a reasonable number of steps
                    sortBy: 'stepOrder',
                    sortDirection: 'asc'
                });
                const stepsResponse = await interceptedFetch(`${API_BASE_URL}/api/v1/approval-steps?${params.toString()}`);
                const stepsData = await stepsResponse.json();

                if (!stepsResponse.ok || !stepsData.success || !stepsData.data?.content) {
                     throw new Error(stepsData.message || 'Failed to fetch approval steps.');
                }

                const apiSteps: ApiApprovalStep[] = stepsData.data.content;
                
                if (apiSteps.length === 0) {
                    setSteps([]);
                    setLoading(false);
                    return;
                }

                // Fetch all role names concurrently
                const roleIds = [...new Set(apiSteps.map(step => step.roleId))];
                const rolePromises = roleIds.map(id => 
                    interceptedFetch(`${API_BASE_URL}/api/v1/auth/roles/${id}`).then(res => res.json())
                );
                const roleResults = await Promise.all(rolePromises);

                const roleMap = new Map<number, string>();
                roleResults.forEach(roleResult => {
                    if (roleResult.success && roleResult.data) {
                        roleMap.set(roleResult.data.id, formatApiString(roleResult.data.name));
                    }
                });

                // Map API steps to UI steps
                const uiSteps: ApprovalFlowStep[] = apiSteps.map(apiStep => ({
                    id: String(apiStep.id),
                    flowId: String(apiStep.flowId),
                    roleId: apiStep.roleId,
                    role: roleMap.get(apiStep.roleId) || `Role ID: ${apiStep.roleId}`,
                    order: apiStep.stepOrder,
                    action: apiStep.allowedActions.join(', '),
                    status: apiStep.enabled ? 'Active' : 'Inactive',
                    description: apiStep.description,
                }));
                
                setSteps(uiSteps);

            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [flowId, refreshTrigger]);

    const requestSort = (key: SortableKeys) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedSteps = useMemo(() => {
        let sortableSteps = [...steps];
        sortableSteps.sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0;
        });
        return sortableSteps;
    }, [steps, sortConfig]);

    const handleAddSuccess = () => {
        setRefreshTrigger(k => k + 1);
    };

    const handleEditClick = (step: ApprovalFlowStep) => {
        setEditingStep(step);
        setIsEditModalOpen(true);
    };

    const handleDeleteStep = async (stepToDelete: ApprovalFlowStep) => {
        if (window.confirm(`Are you sure you want to delete step ${stepToDelete.order} for role "${stepToDelete.role}"?`)) {
            try {
                const response = await interceptedFetch(`${API_BASE_URL}/api/v1/approval-steps/${stepToDelete.id}`, {
                    method: 'DELETE',
                });

                const data = await response.json();

                if (!response.ok || data.success === false) {
                    throw new Error(data.message || 'Failed to delete the step.');
                }

                alert(data.message || 'Approval step deleted successfully!');
                setRefreshTrigger(k => k + 1); // Trigger a re-fetch of the steps

            } catch (err: any) {
                console.error("Error deleting step:", err);
                setError(`Deletion failed: ${err.message}`);
            }
        }
    };
    
    if (loading && !flow) {
         return <div className="p-8 text-center">Loading approval flow details...</div>;
    }
    
    if (error) {
        return <div className="p-8 text-center text-red-500">Error: {error}</div>;
    }

    if (!flow) {
        return <div className="p-8 text-center">Approval flow not found.</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap justify-between items-center gap-4">
                 <div>
                    <h1 className="text-2xl font-bold text-gray-800">{flow.name} Approval Flow</h1>
                    <p className="text-gray-500 mt-1">Manage the steps and rules for the {flow.name} approval process.</p>
                </div>
                 <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-primary-dark flex items-center space-x-2 transition-colors"
                >
                    <Plus size={16}/>
                    <span>Add a New Step</span>
                </button>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b-2 border-gray-200">
                                <th className="p-3 text-left font-semibold text-gray-600 uppercase">#</th>
                                <SortableTableHeader label="ROLE" columnKey="role" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableTableHeader label="ORDER" columnKey="order" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableTableHeader label="ACTION" columnKey="action" sortConfig={sortConfig} requestSort={requestSort} />
                                <th className="p-3 text-left font-semibold text-gray-600 uppercase">ACTIVE</th>
                                <th className="p-3 text-left font-semibold text-gray-600 uppercase">ACTIONS</th>
                            </tr>
                        </thead>
                         <tbody>
                            {loading ? <TableSkeleton /> : sortedSteps.map((step, index) => (
                                <tr key={step.id} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50">
                                    <td className="p-3 text-gray-600 font-medium">{index + 1}</td>
                                    <td className="p-3 text-gray-800 font-medium">{step.role}</td>
                                    <td className="p-3 text-gray-600">{step.order}</td>
                                    <td className="p-3 text-gray-600">{step.action}</td>
                                    <td className="p-3">
                                        <button className={`px-4 py-1 text-xs font-semibold rounded-full transition-colors ${step.status === 'Active' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}>
                                            {step.status}
                                        </button>
                                    </td>
                                     <td className="p-3">
                                        <div className="flex items-center space-x-1 text-gray-500">
                                            <button onClick={() => handleEditClick(step)} className="p-2 rounded-full hover:bg-gray-100 hover:text-blue-500 transition-colors"><Edit2 size={18}/></button>
                                            <button onClick={() => handleDeleteStep(step)} className="p-2 rounded-full hover:bg-gray-100 hover:text-red-500 transition-colors"><Trash2 size={18}/></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {!loading && steps.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            <p>No steps found for this approval flow.</p>
                            <p className="mt-2">Click "Add a New Step" to get started.</p>
                        </div>
                    )}
                </div>
            </div>
            
             <AddStepModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onAddSuccess={handleAddSuccess}
                flowId={flowId!}
                existingSteps={steps}
            />
             <EditStepModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onUpdateSuccess={handleAddSuccess}
                step={editingStep}
            />
        </div>
    );
};

export default ApprovalFlowDetailPage;
