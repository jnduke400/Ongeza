import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// FIX: Replaced Buildings and Bank with valid lucide-react icons (Building2 and Landmark).
import { ArrowLeft, ArrowRight, Building2, Home, ShieldCheck, Construction, FileText, Briefcase, Factory, Truck, Receipt, Wrench, Landmark, CalendarDays, Rocket, Users, TrendingUp } from 'lucide-react';

export const loanClassificationsData: { [key: string]: any } = {
    'home-loan': {
        title: 'Home Loan',
        classifications: [
            {
                icon: <Building2 size={32} className="text-blue-500" />,
                title: 'Apartment Purchase Loan',
                slug: 'apartment-purchase-loan',
                features: [
                    'Loan Tenure: Up to 25 years loan term',
                    'Loan Amount: Up to 80% of the apartment price including Registration costs',
                ],
                details: {
                    features: [
                        'Our service is designed to support your various needs including:',
                        'Loan tenure: Up to 15 yrs.',
                        'Full/partial early payment option of the loan amount before the expiry.',
                        'Auto-renewal facility [with or without interest amount]',
                        'Customers can take a loan to purchase an apartment without incurring registration costs.',
                        'Financing up to 70% of the property including registration costs.',
                        'Renewal facility [with or without interest amount]',
                        'Purchase an apartment without incurring registration costs.',
                    ],
                    eligibility: [
                        'Eligibility requirements include:',
                        'Minimum age of 21 years.',
                        'Must be a resident of Tanzania.',
                        'Stable income source with proof of employment or business ownership.',
                        'Good credit history with no defaults.',
                        'Valid national identification.',
                    ],
                    requiredDocuments: ['National ID', 'Proof of Income', 'Sale Agreement']
                }
            },
            {
                icon: <Home size={32} className="text-blue-500" />,
                title: 'Home Equity Loan',
                slug: 'home-equity-loan',
                features: [
                    'Loan tenure: Up to 15 yrs.',
                    'Full/partial early payment option of the loan amount before the expiry.',
                ],
                 details: {
                    features: [
                        'Our service is designed to support your various needs including:',
                        'Loan tenure: Up to 15 yrs.',
                        'Full/partial early payment option of the loan amount before the expiry.',
                        'Auto-renewal facility [with or without interest amount]',
                        'Customers can take a loan to purchase an apartment without incurring registration costs.',
                    ],
                    eligibility: [
                        'Eligibility requirements include:',
                        'Must own a property in Tanzania.',
                        'Property must have clear title and be free of encumbrances.',
                        'Proof of income to support repayment.',
                    ],
                    requiredDocuments: ['National ID', 'Property Title Deed', 'Latest Utility Bill']
                }
            },
            {
                icon: <ShieldCheck size={32} className="text-blue-500" />,
                title: 'Home Loan Shield',
                slug: 'home-loan-shield',
                features: [
                    'Tenor option: Minimum of 3 months to any',
                    'Auto-renewal facility [with or without interest amount]',
                ],
                 details: {
                    features: [
                        'Our service is designed to support your various needs including:',
                        'Tenor option: Minimum of 3 months to any',
                        'Auto-renewal facility [with or without interest amount]',
                        'Covers outstanding loan amount in case of unforeseen events.',
                    ],
                    eligibility: [
                        'Eligibility requirements include:',
                        'Available to all home loan applicants.',
                        'Subject to terms and conditions of the insurance provider.',
                    ],
                    requiredDocuments: ['Loan Agreement', 'Insurance Application Form']
                }
            },
            {
                icon: <Construction size={32} className="text-blue-500" />,
                title: 'Construction Loan',
                slug: 'construction-loan',
                features: [
                    'Customers can take a loan to purchase an apartment without incurring registration costs.',
                ],
                 details: {
                    features: [
                        'Our service is designed to support your various needs including:',
                        'Disbursement in tranches based on construction progress.',
                        'Interest-only payments during construction period.',
                        'Convertible to a regular home loan upon completion.',
                    ],
                    eligibility: [
                        'Eligibility requirements include:',
                        'Approved building plans and permits.',
                        'Qualified contractor and project timeline.',
                        'Proof of land ownership.',
                    ],
                    requiredDocuments: ['Land Title Deed', 'Approved Building Plans', 'Contractor Agreement']
                }
            },
            {
                icon: <FileText size={32} className="text-blue-500" />,
                title: 'House Purchase Loan',
                slug: 'house-purchase-loan',
                features: [
                    'Loan Tenure: Up to 25 years loan term',
                    'Full/partial early payment option of the loan amount before expiry.',
                ],
                 details: {
                    features: [
                        'Our service is designed to support your various needs including:',
                        'Loan Tenure: Up to 25 years loan term',
                        'Full/partial early payment option of the loan amount before expiry.',
                        'Financing for both new and resale properties.',
                    ],
                    eligibility: [
                        'Eligibility requirements include:',
                        'Minimum age of 21 years.',
                        'Stable income source.',
                        'Good credit history.',
                    ],
                    requiredDocuments: ['National ID', 'Employment Letter', 'Bank Statements (6 months)']
                }
            },
            {
                icon: <Building2 size={32} className="text-blue-500" />,
                title: 'Commercial space purchase loan',
                slug: 'commercial-space-purchase-loan',
                features: [
                    'Financing up to 70% of the property including registration costs.',
                    'Maximum Loan tenure is 10 years',
                ],
                 details: {
                    features: [
                        'Our service is designed to support your various needs including:',
                        'Financing up to 70% of the property including registration costs.',
                        'Maximum Loan tenure is 10 years',
                        'Suitable for offices, shops, and other commercial properties.',
                    ],
                    eligibility: [
                        'Eligibility requirements include:',
                        'Registered business with a proven track record.',
                        'Positive cash flow and profitability.',
                        'Collateral may be required.',
                    ],
                    requiredDocuments: ['Business Registration', 'Company Bank Statements', 'Purchase Agreement']
                }
            },
        ],
    },
    'sme-loan': {
        title: 'SME Loan',
        classifications: [
            {
                icon: <Briefcase size={32} className="text-blue-500" />,
                title: 'SME Term Loan',
                slug: 'sme-term-loan',
                features: [
                    'Flexible repayment tenure up to 5 years.',
                    'Competitive interest rates.',
                ],
                details: {
                    features: ['Feature A for SME Term Loan', 'Feature B for SME Term Loan'],
                    eligibility: ['Eligibility A for SME Term Loan', 'Eligibility B for SME Term Loan'],
                    requiredDocuments: ['Business License', 'Tax Clearance Certificate', 'Audited Financials (2 years)']
                }
            },
            {
                icon: <Factory size={32} className="text-blue-500" />,
                title: 'Working Capital Loan',
                slug: 'working-capital-loan',
                features: [
                    'Short-term loan to manage daily operations.',
                    'Revolving credit facility available.',
                ],
                details: {
                    features: ['Feature A for Working Capital', 'Feature B for Working Capital'],
                    eligibility: ['Eligibility A for Working Capital', 'Eligibility B for Working Capital'],
                    requiredDocuments: ['Business Registration', 'Cash Flow Projections', 'Bank Statements (12 months)']
                }
            },
            {
                icon: <Truck size={32} className="text-blue-500" />,
                title: 'Commercial Vehicle Finance',
                slug: 'commercial-vehicle-finance',
                features: [
                    'Financing for new and used commercial vehicles.',
                    'Up to 90% of vehicle value financed.',
                ],
                details: {
                    features: ['Feature A for Vehicle Finance', 'Feature B for Vehicle Finance'],
                    eligibility: ['Eligibility A for Vehicle Finance', 'Eligibility B for Vehicle Finance'],
                    requiredDocuments: ['Pro-forma Invoice', 'Driver\'s License', 'Business Permit']
                }
            },
            {
                icon: <Receipt size={32} className="text-blue-500" />,
                title: 'Invoice Financing',
                slug: 'invoice-financing',
                features: [
                    'Get cash advance against your unpaid invoices.',
                    'Improve your cash flow instantly.',
                ],
                details: {
                    features: ['Feature A for Invoice Financing', 'Feature B for Invoice Financing'],
                    eligibility: ['Eligibility A for Invoice Financing', 'Eligibility B for Invoice Financing'],
                    requiredDocuments: ['Copies of Unpaid Invoices', 'Customer Contracts', 'Accounts Receivable Aging Report']
                }
            },
            {
                icon: <Wrench size={32} className="text-blue-500" />,
                title: 'Equipment Loan',
                slug: 'equipment-loan',
                features: [
                    'Finance machinery and equipment purchase.',
                    'Loan tenure aligned with equipment life.',
                ],
                details: {
                    features: ['Feature A for Equipment Loan', 'Feature B for Equipment Loan'],
                    eligibility: ['Eligibility A for Equipment Loan', 'Eligibility B for Equipment Loan'],
                    requiredDocuments: ['Equipment Quotation', 'Supplier Information', 'Business Plan']
                }
            },
            {
                icon: <Landmark size={32} className="text-blue-500" />,
                title: 'Business Overdraft',
                slug: 'business-overdraft',
                features: [
                    'Access extra funds from your current account.',
                    'Pay interest only on the amount used.',
                ],
                details: {
                    features: ['Feature A for Business Overdraft', 'Feature B for Business Overdraft'],
                    eligibility: ['Eligibility A for Business Overdraft', 'Eligibility B for Business Overdraft'],
                    requiredDocuments: ['Business Current Account Statements', 'Financial Statements']
                }
            },
        ],
    },
    'corporate-loan': {
        title: 'Corporate Loan',
        classifications: [
            {
                icon: <Landmark size={32} className="text-blue-500" />,
                title: 'Flexible Term Loan',
                slug: 'flexible-term-loan',
                features: [
                    'Long-term financing for major corporate projects.',
                    'Customizable repayment structures.',
                ],
                details: {
                    features: ['Feature A for Flexible Term', 'Feature B for Flexible Term'],
                    eligibility: ['Eligibility A for Flexible Term', 'Eligibility B for Flexible Term'],
                    requiredDocuments: ['Company Profile', 'Audited Financials (3 years)', 'Project Proposal']
                }
            },
            {
                icon: <CalendarDays size={32} className="text-blue-500" />,
                title: 'Day Term Deposit',
                slug: 'day-term-deposit',
                features: [
                    'Short-term investment for surplus funds.',
                    'Earn interest on a daily basis.',
                ],
                details: {
                    features: ['Feature A for Day Term', 'Feature B for Day Term'],
                    eligibility: ['Eligibility A for Day Term', 'Eligibility B for Day Term'],
                    requiredDocuments: ['Board Resolution', 'Company Registration Documents']
                }
            },
            {
                icon: <Rocket size={32} className="text-blue-500" />,
                title: 'Project Finance',
                slug: 'project-finance',
                features: [
                    'Financing for large-scale infrastructure projects.',
                    'Non-recourse or limited recourse loans.',
                ],
                details: {
                    features: ['Feature A for Project Finance', 'Feature B for Project Finance'],
                    eligibility: ['Eligibility A for Project Finance', 'Eligibility B for Project Finance'],
                    requiredDocuments: ['Feasibility Study', 'Environmental Impact Assessment', 'Shareholder Agreements']
                }
            },
             {
                icon: <Users size={32} className="text-blue-500" />,
                title: 'Syndicated Loan',
                slug: 'syndicated-loan',
                features: [
                    'Large loans provided by a group of lenders.',
                    'Single loan agreement for convenience.',
                ],
                details: {
                    features: ['Feature A for Syndicated Loan', 'Feature B for Syndicated Loan'],
                    eligibility: ['Eligibility A for Syndicated Loan', 'Eligibility B for Syndicated Loan'],
                    requiredDocuments: ['Information Memorandum', 'Financial Model', 'Legal Due Diligence Report']
                }
            },
             {
                icon: <FileText size={32} className="text-blue-500" />,
                title: 'Letter of Credit',
                slug: 'letter-of-credit',
                features: [
                    'Guarantee of payment for trade transactions.',
                    'Facilitates international trade.',
                ],
                details: {
                    features: ['Feature A for Letter of Credit', 'Feature B for Letter of Credit'],
                    eligibility: ['Eligibility A for Letter of Credit', 'Eligibility B for Letter of Credit'],
                    requiredDocuments: ['Pro-forma Invoice', 'Import/Export License', 'Shipping Documents']
                }
            },
             {
                icon: <TrendingUp size={32} className="text-blue-500" />,
                title: 'Earner Deposit',
                slug: 'earner-deposit',
                features: [
                    'High-yield deposit account for corporate savings.',
                    'Tiered interest rates based on balance.',
                ],
                details: {
                    features: ['Feature A for Earner Deposit', 'Feature B for Earner Deposit'],
                    eligibility: ['Eligibility A for Earner Deposit', 'Eligibility B for Earner Deposit'],
                    requiredDocuments: ['Company Registration', 'Board Resolution']
                }
            },
        ],
    },
};

const LoanClassificationCard: React.FC<{ data: any }> = ({ data }) => {
    const navigate = useNavigate();
    const { loanType } = useParams<{ loanType: string }>();

    return (
        <div className="bg-surface rounded-xl shadow-sm p-8 flex flex-col h-full border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="bg-blue-100 p-4 rounded-lg w-max mb-6">
                {data.icon}
            </div>
            <h3 className="text-xl font-bold text-on-surface mb-4">{data.title}</h3>
            <ul className="space-y-2 text-gray-500 list-disc list-inside mb-8 flex-grow text-sm">
                {data.features.map((feature: string, index: number) => (
                    <li key={index}>{feature}</li>
                ))}
            </ul>
            <div className="flex justify-end mt-auto">
                <button 
                    onClick={() => navigate(`/loan-types/${loanType}/${data.slug}`)}
                    className="w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                    <ArrowRight size={24} />
                </button>
            </div>
        </div>
    );
};

const LoanClassificationPage: React.FC = () => {
    const { loanType } = useParams<{ loanType: string }>();
    const navigate = useNavigate();
    
    const data = loanType ? loanClassificationsData[loanType] : null;

    if (!data) {
        return (
            <div className="text-center p-8">
                <h2 className="text-2xl font-bold">Loan Type Not Found</h2>
                <p className="text-gray-500 mt-2">The requested loan type does not exist.</p>
                <button onClick={() => navigate('/loan-types')} className="mt-6 bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors">
                    Back to Loan Types
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <h1 className="text-4xl font-bold text-on-surface">
                    {data.title} / <span style={{color: '#3b82f6'}}>Classification</span>
                </h1>
                <button onClick={() => navigate('/loan-types')} className="flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-lg font-semibold border border-gray-200 hover:bg-gray-100 transition-colors">
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {data.classifications.map((classification: any, index: number) => (
                    <LoanClassificationCard key={index} data={classification} />
                ))}
            </div>
        </div>
    );
};

export default LoanClassificationPage;