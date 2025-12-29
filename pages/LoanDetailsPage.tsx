
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ListChecks, UserCheck, ArrowLeft } from 'lucide-react';
import { loanClassificationsData } from './LoanClassificationPage';

const LoanDetailsPage: React.FC = () => {
    const { loanType, classificationSlug } = useParams<{ loanType: string; classificationSlug: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'features' | 'eligibility'>('features');

    const loanCategory = loanType ? loanClassificationsData[loanType] : null;
    const classificationDetails = loanCategory?.classifications.find((c: any) => c.slug === classificationSlug);

    if (!classificationDetails) {
        return (
            <div className="text-center p-8">
                <h2 className="text-2xl font-bold">Loan Details Not Found</h2>
                <button onClick={() => navigate('/loan-types')} className="mt-6 bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors">
                    Back to Loan Types
                </button>
            </div>
        );
    }

    const { title, details } = classificationDetails;

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-on-surface">{title} Details</h1>
                    <p className="text-gray-500 mt-2">Here is the list of your features & eligibility</p>
                </div>
                <button onClick={() => navigate(`/loan-types/${loanType}`)} className="flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-lg font-semibold border border-gray-200 hover:bg-gray-100 transition-colors">
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>
            </div>

            <div className="bg-surface rounded-xl shadow-sm p-8 border border-gray-100">
                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('features')}
                            className={`flex items-center space-x-2 whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-base transition-colors ${
                                activeTab === 'features'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <ListChecks size={20} />
                            <span>Features</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('eligibility')}
                            className={`flex items-center space-x-2 whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-base transition-colors ${
                                activeTab === 'eligibility'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <UserCheck size={20} />
                            <span>Eligibility</span>
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'features' && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-on-surface">{details.features[0]}</h3>
                            <ul className="space-y-2 text-gray-500 list-disc list-inside">
                                {details.features.slice(1).map((feature: string, index: number) => (
                                    <li key={index}>{feature}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {activeTab === 'eligibility' && (
                         <div className="space-y-4">
                            <h3 className="text-xl font-bold text-on-surface">{details.eligibility[0]}</h3>
                            <ul className="space-y-2 text-gray-500 list-disc list-inside">
                                {details.eligibility.slice(1).map((item: string, index: number) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                <div className="mt-8">
                     <button onClick={() => navigate(`/loan-application-form/classification/${loanType}/${classificationSlug}`)} className="bg-accent-blue hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                        Apply Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoanDetailsPage;
