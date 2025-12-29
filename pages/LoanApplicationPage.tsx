
import React from 'react';
import { Eye } from 'lucide-react';

const loanApplications = [
    { id: 'loan001', purpose: 'Business Expansion', amount: 500000, date: '2025-08-01', status: 'Pending', dueDate: null },
    { id: 'loan002', purpose: 'Emergency Medical', amount: 250000, date: '2025-07-15', status: 'Approved', dueDate: '2025-08-15' },
    { id: 'loan003', purpose: 'Tuk-tuk Purchase', amount: 1200000, date: '2025-06-20', status: 'Approved', dueDate: '2025-07-20' },
    { id: 'loan004', purpose: 'School Fees', amount: 300000, date: '2025-05-10', status: 'Rejected', dueDate: null },
    { id: 'loan005', purpose: 'Farm Equipment', amount: 800000, date: '2025-04-22', status: 'Approved', dueDate: '2025-05-22' },
    { id: 'loan006', purpose: 'Home Renovation', amount: 1500000, date: '2025-04-15', status: 'Pending', dueDate: null },
    { id: 'loan007', purpose: 'Vehicle Repair', amount: 150000, date: '2025-03-01', status: 'Approved', dueDate: '2025-04-01' },
];

const LoanApplicationPage: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-800">Loan Applications</h1>
            <p className="text-gray-500">Manage all your loan applications from here.</p>
            
            <div className="bg-surface p-6 rounded-lg shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                         <thead>
                            <tr className="border-b-2 border-gray-200 text-sm text-gray-600">
                                <th className="py-3 px-4 font-semibold">Purpose</th>
                                <th className="py-3 px-4 font-semibold">Amount</th>
                                <th className="py-3 px-4 font-semibold">Date Applied</th>
                                <th className="py-3 px-4 font-semibold">Due Date</th>
                                <th className="py-3 px-4 font-semibold">Status</th>
                                <th className="py-3 px-4 font-semibold text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loanApplications.map(app => (
                                <tr key={app.id} className="border-b border-gray-100 last:border-b-0 text-sm">
                                    <td className="py-3 px-4 font-medium text-gray-800">{app.purpose}</td>
                                    <td className="py-3 px-4 text-gray-600">TZS {app.amount.toLocaleString()}</td>
                                    <td className="py-3 px-4 text-gray-600">{app.date}</td>
                                    <td className="py-3 px-4 text-gray-600">
                                        {app.status === 'Approved' && app.dueDate ? app.dueDate : 'N/A'}
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                            app.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                            app.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'
                                        }`}>{app.status}</span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <button className="text-gray-400 hover:text-primary p-1 transition-colors" aria-label="View application">
                                            <Eye size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LoanApplicationPage;
