
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserCheck, HelpCircle, FileText, Plus, Minus, ChevronRight } from 'lucide-react';
import { loanPackagesDetails } from '../services/mockData';

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
    <div className={`bg-surface rounded-xl shadow-sm p-8 border border-gray-100 ${className}`}>
        {children}
    </div>
);

const AccordionItem: React.FC<{
    item: any;
    isOpen: boolean;
    onToggle: () => void;
}> = ({ item, isOpen, onToggle }) => {
    const [activeSubTab, setActiveSubTab] = useState(0);

    return (
        <div className="border-b border-gray-200">
            <button
                onClick={onToggle}
                className="w-full flex justify-between items-center py-4 text-left"
            >
                <h4 className="text-lg font-semibold text-on-surface">{item.title}</h4>
                {isOpen ? <Minus size={20} className="text-gray-500" /> : <Plus size={20} className="text-gray-500" />}
            </button>
            {isOpen && (
                <div className="pb-4">
                    {item.subTabs ? (
                        <div>
                            <div className="flex space-x-4 border-b border-gray-200 mb-4">
                                {item.subTabs.map((subTab: any, index: number) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveSubTab(index)}
                                        className={`py-2 px-1 text-sm font-semibold transition-colors ${
                                            activeSubTab === index
                                                ? 'text-blue-600 border-b-2 border-blue-600'
                                                : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    >
                                        {subTab.title}
                                    </button>
                                ))}
                            </div>
                            <ul className="space-y-2 text-gray-500 list-disc list-inside">
                                {item.subTabs[activeSubTab].content.map((point: string, i: number) => (
                                    <li key={i}>{point}</li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <ul className="space-y-2 text-gray-500 list-disc list-inside">
                            {item.content.map((point: string, i: number) => (
                                <li key={i}>{point}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

const PackageDocumentsPage: React.FC = () => {
    const { packageId } = useParams<{ packageId: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('eligibility');
    const [openAccordion, setOpenAccordion] = useState(0);

    const details = packageId ? loanPackagesDetails[packageId] : null;

    if (!details) {
        return <div className="p-8 text-center">Package details not found.</div>;
    }

    const handleAccordionToggle = (index: number) => {
        setOpenAccordion(openAccordion === index ? -1 : index);
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-on-surface">Package Documents</h1>
            </div>

            <Card>
                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
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
                        <button
                            onClick={() => setActiveTab('howToUse')}
                            className={`flex items-center space-x-2 whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-base transition-colors ${
                                activeTab === 'howToUse'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <HelpCircle size={20} />
                            <span>How can I use this loan</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('requiredDocuments')}
                            className={`flex items-center space-x-2 whitespace-nowrap py-4 px-1 border-b-2 font-semibold text-base transition-colors ${
                                activeTab === 'requiredDocuments'
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            <FileText size={20} />
                            <span>Required documents</span>
                        </button>
                    </nav>
                </div>

                {/* Tab Content */}
                <div>
                    {activeTab === 'eligibility' && (
                        <div>
                            <p className="text-gray-500 mb-4">You can apply for this loan right now if you meet the following criteria:</p>
                            <div>
                                {details.eligibility.map((item: any, index: number) => (
                                    <AccordionItem
                                        key={index}
                                        item={item}
                                        isOpen={openAccordion === index}
                                        onToggle={() => handleAccordionToggle(index)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                    {activeTab === 'howToUse' && (
                        <div className="space-y-4">
                            <ul className="space-y-2 text-gray-500 list-disc list-inside">
                                {details.howToUse.map((item: string, index: number) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {activeTab === 'requiredDocuments' && (
                        <div className="space-y-6">
                            {Object.entries(details.requiredDocuments).map(([category, docs]) => (
                                <div key={category}>
                                    <h4 className="text-lg font-semibold text-on-surface mb-2">{category}</h4>
                                    <ul className="space-y-2 text-gray-500 list-disc list-inside">
                                        {(docs as string[]).map((doc: string, index: number) => (
                                            <li key={index}>{doc}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-8 flex space-x-4">
                     <button onClick={() => navigate(`/loan-application-form/package/${packageId}`)} className="bg-accent-blue hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                        Apply Now
                    </button>
                     {activeTab === 'requiredDocuments' && (
                        <button className="bg-white text-accent-blue font-semibold py-3 px-6 rounded-lg border border-accent-blue hover:bg-sky-100 transition-colors">
                           Download
                       </button>
                     )}
                </div>
            </Card>
        </div>
    );
};

export default PackageDocumentsPage;
