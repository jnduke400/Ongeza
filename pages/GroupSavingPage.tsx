

import React, { useState, useMemo } from 'react';
// FIX: Using namespace import for react-router-dom to handle potential module resolution issues.
import { Link } from 'react-router-dom';
import { Plus, Users, MoreVertical } from 'lucide-react';
import { mockGroupSavings, getGroupsForUser } from '../services/mockData';
import { GroupSaving } from '../types';
import { useAuth } from '../contexts/AuthContext';

const GroupCard: React.FC<{ group: GroupSaving }> = ({ group }) => {
    const progress = (group.currentAmount / group.targetAmount) * 100;
    const formatCurrency = (amount: number) => {
        if (amount >= 1000000) {
            return `TZS ${(amount / 1000000).toFixed(1)}M`;
        }
        return `TZS ${amount.toLocaleString()}`;
    }

    return (
        <div className="bg-surface rounded-2xl shadow-sm p-6 flex flex-col justify-between hover:shadow-lg transition-shadow duration-300">
            <div>
                {/* Card Header */}
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                        <img src={group.avatar} alt={group.name} className="w-12 h-12 rounded-full object-cover" />
                        <div>
                            <h3 className="font-bold text-lg text-gray-800">{group.name}</h3>
                            <div className="flex items-center text-sm text-gray-500">
                                <Users size={14} className="mr-1.5" />
                                <span>{group.members.length} Members</span>
                            </div>
                        </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 p-1">
                        <MoreVertical size={20} />
                    </button>
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-2 mb-6">
                    <div className="flex justify-between text-sm font-medium text-gray-600">
                        <span>Progress</span>
                        <span>{progress.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                    <div className="flex justify-between text-sm font-semibold text-gray-800">
                        <span>{formatCurrency(group.currentAmount)}</span>
                        <span className="text-gray-500">{formatCurrency(group.targetAmount)}</span>
                    </div>
                </div>
            </div>

            {/* Card Footer */}
            <div className="flex justify-between items-center mt-auto">
                <div className="flex -space-x-2">
                    {group.members.slice(0, 5).map(member => (
                        <img key={member.id} src={member.avatar} alt="member" className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                    ))}
                    {group.members.length > 5 && (
                         <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600 border-2 border-white">
                            +{group.members.length - 5}
                        </div>
                    )}
                </div>
                <Link to={`/group-saving/${group.id}`} className="bg-primary-light/50 text-primary-dark font-semibold text-sm py-2 px-4 rounded-lg hover:bg-primary-light transition-colors">
                    View Details
                </Link>
            </div>
        </div>
    );
};

const GroupSavingPage: React.FC = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('My Groups');
    const tabs = ['My Groups', 'Explore'];

    const groupsToDisplay = useMemo(() => {
        if (user?.isSolo) {
            return getGroupsForUser(user.id);
        }
        return mockGroupSavings;
    }, [user]);

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Group Saving</h1>
                    <p className="text-gray-500 mt-1">Manage your group savings, invite members, and track your goals.</p>
                </div>
                {!user?.isSolo && (
                    <button className="flex items-center space-x-2 bg-primary text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-primary-dark transition-colors shadow-sm">
                        <Plus size={20} />
                        <span>Create Group</span>
                    </button>
                )}
            </div>
            
            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                activeTab === tab
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
                {activeTab === 'My Groups' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {groupsToDisplay.map(group => (
                            <GroupCard key={group.id} group={group} />
                        ))}
                    </div>
                )}
                {activeTab === 'Explore' && (
                    <div className="text-center py-20 bg-gray-50 rounded-lg">
                        <h3 className="text-xl font-semibold text-gray-700">Explore Public Groups</h3>
                        <p className="text-gray-500 mt-2">This feature is coming soon! Discover and join public savings groups.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default GroupSavingPage;
