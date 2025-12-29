
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { loanClassificationsData } from './LoanClassificationPage';
import { tanzaniaRegions, mockRegions, loanPackagesData, loanPackagesDetails } from '../services/mockData';

const FormField: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className }) => (
    <div className={className}>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {children}
    </div>
);

const LoanApplicationFormPage: React.FC = () => {
    const { loanType, classificationSlug, packageId } = useParams<{ loanType?: string; classificationSlug?: string; packageId?: string }>();

    const [selectedRegion, setSelectedRegion] = useState('');
    const [districts, setDistricts] = useState<string[]>([]);

    const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const region = e.target.value;
        setSelectedRegion(region);
        setDistricts(tanzaniaRegions[region] || []);
        const form = e.target.form;
        if(form){
            const districtSelect = form.elements.namedItem('district') as HTMLSelectElement;
            if(districtSelect) {
                districtSelect.value = '';
            }
        }
    };

    const { loanTitle, requiredDocs, backUrl } = useMemo(() => {
        let title = 'Loan';
        let docs: (string | { category: string; docs: string[] })[] = [];
        let url = '/apply';

        if (loanType && classificationSlug) {
            const loanCategory = loanClassificationsData[loanType];
            const classificationDetails = loanCategory?.classifications.find((c: any) => c.slug === classificationSlug);
            if (classificationDetails) {
                title = classificationDetails.title;
                docs = classificationDetails.details?.requiredDocuments || [];
                url = `/loan-types/${loanType}/${classificationSlug}`;
            }
        } else if (packageId) {
            const packageInfo = loanPackagesData.find(p => p.slug === packageId);
            const packageDetails = loanPackagesDetails[packageId];
            if (packageInfo && packageDetails) {
                title = `${packageInfo.title} Package`;
                docs = Object.entries(packageDetails.requiredDocuments).map(([category, docList]) => ({
                    category,
                    docs: docList as string[]
                }));
                url = `/loans/packages/${packageId}`;
            }
        }

        return { loanTitle: title, requiredDocs: docs, backUrl: url };
    }, [loanType, classificationSlug, packageId]);


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        alert('Loan application submitted successfully!');
        // Handle form submission logic here
    };

    const inputClasses = "w-full px-4 py-3 bg-white text-on-surface border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary placeholder-gray-400";
    const selectClasses = `${inputClasses} appearance-none bg-no-repeat bg-[right_1rem_center] bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2020%2020%22%20fill%3D%22%239ca3af%22%3E%3Cpath%20fill-rule%3D%22evenodd%22%20d%3D%22M5.293%207.293a1%201%200%200%201%201.414%200L10%2010.586l3.293-3.293a1%201%200%201%201%201.414%201.414l-4%204a1%201%200%200%201-1.414%200l-4-4a1%201%200%200%201%200-1.414z%22%20clip-rule%3D%22evenodd%22%2F%3E%3C%2Fsvg%3E')]`;
    const fileInputClasses = "w-full text-sm text-gray-500 bg-white rounded-md border border-gray-300 file:mr-4 file:py-3 file:px-5 file:rounded-l-md file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer";
    const disabledInputClasses = `${inputClasses} bg-gray-100 cursor-not-allowed`;

    return (
        <div className="space-y-6">
             <Link to={backUrl} className="flex items-center text-primary hover:underline font-semibold text-sm mb-2 inline-flex">
                <ChevronLeft size={18} className="mr-1"/>
                Back to Details
            </Link>
            <div>
                <h1 className="text-3xl font-bold text-gray-800">Loan Application</h1>
                <p className="text-gray-500 mt-1">Please complete the application neatly & included all information, documentation, identification required</p>
            </div>

            <div className="bg-surface p-8 rounded-lg shadow-sm">
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <FormField label="Full Name">
                            <input type="text" placeholder="e.g. Abu Bin Ishtiyak" required className={inputClasses} />
                        </FormField>

                        <FormField label="Date of Birth">
                            <input type="date" required className={inputClasses} />
                        </FormField>

                        <FormField label="Area / Location">
                            <input type="text" placeholder="e.g. H-165, Mohakhali DOHS" required className={inputClasses} />
                        </FormField>
                        
                        <FormField label="Region">
                            <select required className={selectClasses} name="region" onChange={handleRegionChange}>
                                <option value="">Select Region</option>
                                {mockRegions.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </FormField>

                        <FormField label="Country">
                            <input type="text" value="Tanzania" readOnly disabled className={disabledInputClasses} />
                        </FormField>

                        <FormField label="District">
                            <select required name="district" className={`${selectClasses} disabled:bg-gray-100 disabled:cursor-not-allowed`} disabled={!selectedRegion}>
                                <option value="">{selectedRegion ? 'Select District' : 'Select a region first'}</option>
                                {districts.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </FormField>

                        <FormField label="Phone Number">
                            <input type="tel" placeholder="e.g. +255..." required className={inputClasses} />
                        </FormField>

                        <FormField label="Email">
                            <input type="email" placeholder="e.g. admin@gmail.com" required className={inputClasses} />
                        </FormField>

                        <FormField label="Profession">
                            <input type="text" placeholder="e.g. Business" required className={inputClasses} />
                        </FormField>

                        <FormField label="What Type of Loan do you need?">
                            <select required value={loanTitle} disabled className={disabledInputClasses}>
                                <option>{loanTitle}</option>
                            </select>
                        </FormField>

                        <FormField label="Monthly income from other sources (if any)">
                            <select required defaultValue="Others" className={selectClasses}>
                                <option>Others</option>
                                <option>Salary</option>
                                <option>Business Profit</option>
                                <option>None</option>
                            </select>
                        </FormField>

                        <FormField label="Requested Loan Amount">
                            <input type="number" placeholder="e.g. 50000" required className={inputClasses} />
                        </FormField>

                        <FormField label="Tenure of your loan(Years)">
                            <input type="number" placeholder="e.g. 4" required className={inputClasses} />
                        </FormField>

                        <FormField label="Do you have any existing loan?">
                            <select required defaultValue="Yes" className={selectClasses}>
                                <option>Yes</option>
                                <option>No</option>
                            </select>
                        </FormField>
                        
                        {requiredDocs.length > 0 && (
                            <div className="md:col-span-2">
                                <FormField label="Required Documents">
                                    <div className="space-y-4 p-4 border border-gray-200 rounded-md mt-1">
                                        {requiredDocs.map((doc, index) => {
                                            if (typeof doc === 'string') {
                                                // Handling for classification documents (simple array)
                                                return (
                                                    <div key={doc}>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">{doc}</label>
                                                        <input type="file" required className={fileInputClasses} />
                                                    </div>
                                                );
                                            } else {
                                                // Handling for package documents (object of arrays)
                                                return (
                                                    <div key={doc.category}>
                                                        <h4 className="text-md font-semibold text-gray-800 mb-2">{doc.category}</h4>
                                                        <div className="space-y-3 pl-4">
                                                            {doc.docs.map(docName => (
                                                                <div key={docName}>
                                                                    <label className="block text-sm font-medium text-gray-700 mb-1">{docName}</label>
                                                                    <input type="file" required className={fileInputClasses} />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        })}
                                    </div>
                                </FormField>
                            </div>
                        )}
                    </div>

                    <div className="mt-6">
                        <div className="flex items-center">
                            <input
                                id="terms"
                                name="terms"
                                type="checkbox"
                                required
                                className="h-4 w-4 text-accent-blue focus:ring-accent-blue border-gray-300 rounded"
                            />
                            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                                I do hereby admit that all the above information that I have input is true & correct. If any of the above information figured out false or incorrect, I understand & agree that my loan application will be rejected. I agree to share my information follow the company policy as required.
                            </label>
                        </div>
                    </div>

                    <div className="mt-8">
                        <button
                            type="submit"
                            className="bg-accent-blue hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-md transition-colors"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoanApplicationFormPage;
