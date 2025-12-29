
import React from 'react';
// FIX: Using namespace import for react-router-dom to handle potential module resolution issues.
import { useParams, Link } from 'react-router-dom';
import { getGroupSavingDetail } from '../services/mockData';
import { GroupSavingDetail, PendingContribution } from '../types';
import { Bell, ChevronLeft } from 'lucide-react';

const PendingContributionCard: React.FC<{ contribution: PendingContribution }> = ({ contribution }) => {
    const handleSendReminder = () => {
        alert(`Reminder sent to ${contribution.member.name}`);
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center">
                <img src={contribution.member.avatar} alt={contribution.member.name} className="w-12 h-12 rounded-full mr-4" />
                <div>
                    <p className="font-bold text-gray-800">{contribution.member.name}</p>
                    <p className="text-sm text-gray-500">Due: {new Date(contribution.dueDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <p className="font-bold text-lg text-red-600">TZS {contribution.amount.toLocaleString()}</p>
                <button
                    onClick={handleSendReminder}
                    className="flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-200 transition-colors"
                >
                    <Bell size={16} />
                    <span>Send Reminder</span>
                </button>
            </div>
        </div>
    );
};

const PendingContributionsPage: React.FC = () => {
    const { groupId } = useParams<{ groupId: string }>();
    const [groupDetail, setGroupDetail] = React.useState<GroupSavingDetail | null>(null);

    React.useEffect(() => {
        if (groupId) {
            const data = getGroupSavingDetail(groupId);
            setGroupDetail(data || null);
        }
    }, [groupId]);

    if (!groupDetail) {
        return <div className="p-8 text-center">Loading pending contributions...</div>;
    }

    return (
        <div className="space-y-6">
             <Link to={`/group-saving/${groupId}`} className="flex items-center text-primary hover:underline mb-4 font-semibold">
                <ChevronLeft size={20} className="mr-1"/>
                Back to Group Overview
            </Link>
            <div className="flex justify-between items-center">
                 <div>
                    <h1 className="text-3xl font-bold text-gray-800">Pending Contributions</h1>
                    <p className="text-gray-500 mt-1">For group: <span className="font-semibold">{groupDetail.name}</span></p>
                </div>
            </div>

            <div className="space-y-4">
                {groupDetail.pendingContributions.length > 0 ? (
                    groupDetail.pendingContributions.map(contribution => (
                        <PendingContributionCard key={contribution.id} contribution={contribution} />
                    ))
                ) : (
                    <div className="text-center py-20 bg-gray-50 rounded-lg">
                        <h3 className="text-xl font-semibold text-gray-700">All contributions are up to date!</h3>
                        <p className="text-gray-500 mt-2">There are no pending contributions for this group.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PendingContributionsPage;
