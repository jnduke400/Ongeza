
import React from 'react';
// FIX: Using namespace import for react-router-dom to handle potential module resolution issues.
import { useParams } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { mockMembersData } from '../services/mockData';
import { MoreVertical } from 'lucide-react';

const activityData = [
    { name: '01', value: 35 }, { name: '02', value: 18 }, { name: '03', value: 30 },
    { name: '04', value: 35 }, { name: '05', value: 40 }, { name: '06', value: 20 },
    { name: '07', value: 31 }, { name: '08', value: 25 }, { name: '09', value: 22 },
    { name: '10', value: 20 }, { name: '11', value: 44 }, { name: '12', value: 35 },
];

const UserProfileCard: React.FC<{ 
    member: typeof mockMembersData[0];
    onStatusChange: (newStatus: 'Active' | 'Inactive') => void;
}> = ({ member, onStatusChange }) => {
    const designAvatarUrl = 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';

    const handleButtonClick = () => {
        if (member.status === 'Active') {
            if (window.confirm('Are you sure you want to deactivate this member?')) {
                onStatusChange('Inactive');
            }
        } else if (member.status === 'Inactive') {
            onStatusChange('Active');
        }
        // No action for 'Suspended' or other statuses
    };

    const getButtonClass = () => {
        switch (member.status) {
            case 'Active':
                return 'bg-primary hover:bg-primary-dark text-white';
            case 'Inactive':
                return 'bg-rose-500 hover:bg-rose-600 text-white';
            default: // Suspended etc.
                return 'bg-yellow-500 text-white cursor-not-allowed';
        }
    };
    
    const getButtonText = () => {
        if (member.status === 'Active' || member.status === 'Inactive') {
            return member.status;
        }
        return 'Suspended';
    };


    return (
        <div className="bg-surface text-on-surface p-6 rounded-2xl shadow-sm h-full flex flex-col items-center text-center">
             <div className="flex-grow flex flex-col items-center">
                <img
                    src={designAvatarUrl}
                    alt={member.memberName}
                    className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-primary-light"
                />

                <h2 className="text-2xl font-bold text-gray-800">{member.memberName}</h2>
                <p className="text-gray-500 text-md mt-1 mb-4">Senior Manager</p>

                <button 
                    onClick={handleButtonClick}
                    disabled={member.status === 'Suspended'}
                    className={`font-semibold py-2 px-10 rounded-full transition-colors duration-300 mb-6 ${getButtonClass()}`}
                >
                    {getButtonText()}
                </button>
            </div>
            <div className="mt-auto w-full pt-6 border-t border-gray-200 grid grid-cols-3 text-center">
                <div>
                    <p className="text-xl font-bold text-gray-800">150</p>
                    <p className="text-sm text-gray-500">Deposits</p>
                </div>
                <div className="border-l border-gray-200">
                    <p className="text-xl font-bold text-gray-800">140</p>
                    <p className="text-sm text-gray-500">Delays</p>
                </div>
                <div className="border-l border-gray-200">
                    <p className="text-xl font-bold text-gray-800">45</p>
                    <p className="text-sm text-gray-500">Rating</p>
                </div>
            </div>
        </div>
    );
};

const MemberActivityCard: React.FC = () => {
    const [activeTab, setActiveTab] = React.useState('Day');

    return (
        <div className="bg-surface text-on-surface p-6 rounded-2xl shadow-sm h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Member Activity</h2>
                <div className="flex space-x-4">
                    {['Day', 'Month', 'Year'].map(tab => (
                         <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-1 text-sm font-semibold transition-colors duration-300 border-b-2 ${
                                activeTab === tab ? 'text-primary border-primary' : 'text-gray-500 hover:text-gray-700 border-transparent'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>
            <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activityData} margin={{ top: 5, right: 0, left: -25, bottom: 5 }}>
                        <XAxis dataKey="name" tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} axisLine={false} tickLine={false} domain={[15, 45]} ticks={[15, 20, 25, 30, 35, 40, 45]} />
                        <Bar dataKey="value" fill="#F43F5E" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const recentContributionsData = [
  { id: 1, transactionId: 'CON24A1', groupName: 'Family Savings', date: '01 August 2024', status: 'Completed', amount: 50000 },
  { id: 2, transactionId: 'CON24B2', groupName: 'Family Savings', date: '31 July 2024', status: 'Completed', amount: 50000 },
  { id: 3, transactionId: 'CON24C3', groupName: 'Business Start-Up', date: '30 July 2024', status: 'Pending', amount: 75000 },
  { id: 4, transactionId: 'CON24D4', groupName: 'Education Fund', date: '29 July 2024', status: 'Cancelled', amount: 25000 },
  { id: 5, transactionId: 'CON24E5', groupName: 'Family Savings', date: '28 July 2024', status: 'Completed', amount: 50000 },
];

const ContributionStatusPill: React.FC<{ status: string }> = ({ status }) => {
    const styles: { [key: string]: string } = {
        Completed: 'bg-green-100 text-green-700',
        Pending: 'bg-yellow-100 text-yellow-700',
        Cancelled: 'bg-red-100 text-red-700',
    };
    return (
        <span className={`px-3 py-1 text-xs font-semibold rounded-md ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
            {status}
        </span>
    );
};

const RecentContributionsMade: React.FC = () => {
    return (
        <div className="bg-surface text-on-surface p-6 rounded-2xl shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Contributions Made</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-gray-200 text-xs text-gray-500 uppercase">
                            <th className="p-4 font-semibold">Transaction No.</th>
                            <th className="p-4 font-semibold">Group Name</th>
                            <th className="p-4 font-semibold">Date</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold">Amount</th>
                            <th className="p-4 font-semibold"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentContributionsData.map(contribution => (
                            <tr key={contribution.id} className="border-b border-gray-200 last:border-b-0 text-sm hover:bg-gray-50">
                                <td className="p-4 text-gray-700">{contribution.transactionId}</td>
                                <td className="p-4 text-gray-900 font-medium">{contribution.groupName}</td>
                                <td className="p-4 text-gray-700">{contribution.date}</td>
                                <td className="p-4"><ContributionStatusPill status={contribution.status} /></td>
                                <td className="p-4 text-gray-900 font-medium">TZS {contribution.amount.toLocaleString()}</td>
                                <td className="p-4">
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreVertical size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const MemberDetailPage: React.FC = () => {
    const { memberId } = useParams<{ memberId: string }>();
    const [member, setMember] = React.useState<(typeof mockMembersData[0]) | null>(null);

    React.useEffect(() => {
        const foundMember = mockMembersData.find(m => m.memberId === memberId);
        setMember(foundMember || null);
    }, [memberId]);

    const handleStatusChange = (newStatus: 'Active' | 'Inactive') => {
        if (member) {
            setMember({ ...member, status: newStatus as 'Active' | 'Inactive' | 'Suspended' });
            // In a real app, you would also make an API call here to update the backend.
        }
    };

    if (!member) {
        return <div className="p-8 text-center text-gray-600">Member not found.</div>;
    }

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <UserProfileCard member={member} onStatusChange={handleStatusChange} />
                </div>
                <div className="lg:col-span-2">
                    <MemberActivityCard />
                </div>
            </div>
            <RecentContributionsMade />
        </div>
    );
};

export default MemberDetailPage;
