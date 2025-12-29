
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Store, FileText, ArrowRight } from 'lucide-react';

const loanTypesData = [
    {
        icon: <Home size={40} className="text-blue-500" />,
        title: 'Home Loan',
        slug: 'home-loan',
        features: [
            'Apartment purchase loan',
            'Home equity loan',
            'Construction loan',
        ],
    },
    {
        icon: <Store size={40} className="text-blue-500" />,
        title: 'SME Loan',
        slug: 'sme-loan',
        features: [
            'SME term loan',
            'Working capital loan',
            'Commercial vehicle finance',
        ],
    },
    {
        icon: <FileText size={40} className="text-blue-500" />,
        title: 'Corporate Loan',
        slug: 'corporate-loan',
        features: [
            'Flexible term loan',
            'Day term deposit',
            'Earner deposit',
        ],
    },
];

const LoanTypeCard: React.FC<{ data: typeof loanTypesData[0] }> = ({ data }) => {
    const navigate = useNavigate();
    return (
        <div className="bg-surface rounded-xl shadow-sm p-8 flex flex-col h-full border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="bg-blue-100 p-4 rounded-lg w-max mb-6">
                {data.icon}
            </div>
            <h3 className="text-2xl font-bold text-on-surface mb-4">{data.title}</h3>
            <ul className="space-y-2 text-gray-500 list-disc list-inside mb-8 flex-grow">
                {data.features.map((feature, index) => (
                    <li key={index}>{feature}</li>
                ))}
            </ul>
            <div className="flex justify-end mt-auto">
                <button onClick={() => navigate(`/loan-types/${data.slug}`)} className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                    <ArrowRight size={24} />
                </button>
            </div>
        </div>
    );
};

const LoanTypesPage: React.FC = () => {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold text-on-surface">Types of Loan</h1>
                <p className="text-gray-500 mt-2">Here is the list of loan properties</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {loanTypesData.map((loanType) => (
                    <LoanTypeCard key={loanType.title} data={loanType} />
                ))}
            </div>
        </div>
    );
};

export default LoanTypesPage;
