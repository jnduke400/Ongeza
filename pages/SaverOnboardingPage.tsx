import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, User, DollarSign, ShieldCheck, FileUp, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { tanzaniaRegions, mockRegions } from '../services/mockData';
// FIX: Aliased 'User' interface to 'AuthUser' to resolve conflict with 'User' icon from lucide-react.
import { ApiDocumentType, ApiDocumentGroup, User as AuthUser } from '../types';
import { interceptedFetch } from '../services/api';
import { API_BASE_URL } from '../services/apiConfig';

const Stepper: React.FC<{ currentStep: number }> = ({ currentStep }) => {
    const steps = [
        { number: 1, title: 'Personal Info' },
        { number: 2, title: 'Financial Info' },
        { number: 3, title: 'Compliance' }
    ];

    return (
        <div className="flex justify-center items-center mb-10">
            {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                    <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg transition-colors duration-300 ${currentStep >= step.number ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                            {currentStep > step.number ? <Check size={24} /> : step.number}
                        </div>
                        <p className={`ml-3 font-semibold hidden sm:block ${currentStep >= step.number ? 'text-primary' : 'text-gray-500'}`}>{step.title}</p>
                    </div>
                    {index < steps.length - 1 && <div className={`flex-1 h-1 mx-4 transition-colors duration-300 ${currentStep > step.number ? 'bg-primary' : 'bg-gray-200'}`}></div>}
                </React.Fragment>
            ))}
        </div>
    );
};

const OnboardingSuccess: React.FC<{ user: AuthUser | null; submissionDate: string | null; onLogout: () => void; }> = ({ user, submissionDate, onLogout }) => {
    const fullName = user ? `${user.firstName} ${user.lastName}` : 'User';

    return (
        <div className="text-center py-8">
            <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Application Submitted!</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Thank you, {fullName}. Your onboarding details were submitted on {submissionDate || 'today'}.
                Your application is now under review. This process typically takes 2 to 3 business days.
                You will be notified once your account is fully activated.
            </p>
            <button
                type="button"
                onClick={onLogout}
                className="w-full max-w-sm mx-auto flex justify-center items-center bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-md transition-colors duration-300"
            >
                Go Back to Login
            </button>
        </div>
    );
};


const SaverOnboardingPage: React.FC = () => {
    const [step, setStep] = useState(1);
    const { user, logout, completeOnboarding } = useAuth();
    const navigate = useNavigate();

    // State for all form data
    const [personalData, setPersonalData] = useState({ dob: '', gender: 'MALE', address: '', street: '', city: '', country: 'Tanzania', region: '', district: '' });
    const [districts, setDistricts] = useState<string[]>([]);
    const [kycDocuments, setKycDocuments] = useState<ApiDocumentType[]>([]);
    const [loadingKyc, setLoadingKyc] = useState(true);
    const [files, setFiles] = useState<{ [code: string]: File | null }>({});
    
    const [financialData, setFinancialData] = useState({ mobileWallet: '', nextOfKinFullName: '', nextOfKinPhone: '', nextOfKinRelationship: 'BROTHER' });
    const [savingsPlan, setSavingsPlan] = useState({ auto: false });
    const [autoDeposit, setAutoDeposit] = useState({ amount: '5000', frequency: 'WEEKLY', dayOfWeek: 'FRIDAY', time: '10:00', startDate: '2025-01-01', endDate: '' });
    
    const [termsAccepted, setTermsAccepted] = useState(false);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [submissionDate, setSubmissionDate] = useState<string | null>(null);

    useEffect(() => {
        const fetchKycDocuments = async () => {
            try {
                const response = await interceptedFetch(`${API_BASE_URL}/api/v1/document-groups?search=saver`);
                const data = await response.json();
                if (!response.ok || !data.success) {
                    throw new Error(data.message || 'Failed to fetch KYC documents.');
                }
                const docTypes = data.data.content.map((item: ApiDocumentGroup) => item.documentType);
                setKycDocuments(docTypes);
            } catch (err: any) {
                setError(`Failed to load required documents: ${err.message}`);
            } finally {
                setLoadingKyc(false);
            }
        };
        fetchKycDocuments();
    }, []);

    const handlePersonalDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPersonalData(prev => ({...prev, [name]: value}));
    };

    const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const region = e.target.value;
        setPersonalData(prev => ({...prev, region, district: ''}));
        setDistricts(tanzaniaRegions[region] || []);
    };

    const handleFileChange = (code: string, file: File | null) => {
        setFiles(prev => ({...prev, [code]: file}));
    };
    
    const handleFinancialDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFinancialData(prev => ({...prev, [e.target.name]: e.target.value}));
    };
    
    const handleAutoDepositChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setAutoDeposit(prev => ({ ...prev, [name]: value }));
    };

    const isStep1Valid = useMemo(() => (
        personalData.dob && personalData.street && personalData.city && personalData.region && personalData.district &&
        kycDocuments.length > 0 && kycDocuments.every(doc => doc.code && files[doc.code])
    ), [personalData, kycDocuments, files]);
    
    const isStep2Valid = useMemo(() => {
        if (!financialData.mobileWallet.trim()) return false;
        if (savingsPlan.auto) {
            return autoDeposit.amount && autoDeposit.frequency && autoDeposit.startDate;
        }
        return true;
    }, [savingsPlan, autoDeposit, financialData]);
    
    const isStep3Valid = termsAccepted;

    const isCurrentStepValid = useMemo(() => {
        if (step === 1) return isStep1Valid;
        if (step === 2) return isStep2Valid;
        if (step === 3) return isStep3Valid;
        return false;
    }, [step, isStep1Valid, isStep2Valid, isStep3Valid]);

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isStep3Valid) return;
        setIsSubmitting(true);
        setError('');
        try {
            const formData = new FormData();
            const onboardingData: any = {
                personalInfo: {
                    dateOfBirth: personalData.dob,
                    gender: personalData.gender.toUpperCase(),
                    address: {
                        street: personalData.street,
                        city: personalData.city,
                        region: personalData.region,
                        district: personalData.district,
                        country: personalData.country,
                    }
                },
                financialInfo: { mobileWallet: financialData.mobileWallet },
                termsAccepted: termsAccepted,
            };

            if (financialData.nextOfKinFullName.trim()) {
                onboardingData.financialInfo.nextOfKin = {
                    fullName: financialData.nextOfKinFullName,
                    phoneNumber: financialData.nextOfKinPhone,
                    relationship: financialData.nextOfKinRelationship.toUpperCase()
                };
            }

            if (savingsPlan.auto) {
                onboardingData.financialInfo.savingPlan = {
                    planType: "AUTO",
                    amount: Number(autoDeposit.amount),
                    frequency: autoDeposit.frequency.toUpperCase(),
                    dayOfWeek: autoDeposit.frequency === 'WEEKLY' ? autoDeposit.dayOfWeek.toUpperCase() : undefined,
                    time: (autoDeposit.frequency === 'DAILY' || autoDeposit.frequency === 'WEEKLY') ? autoDeposit.time : undefined,
                    startDate: autoDeposit.startDate,
                    endDate: autoDeposit.endDate || undefined,
                    paymentSource: "MOBILE_MONEY"
                };
            }
            
            formData.append('onboardingData', JSON.stringify(onboardingData));

            for (const doc of kycDocuments) {
                if (doc.code && files[doc.code]) {
                    const formKey = `kycDocument_${doc.code}`;
                    formData.append(formKey, files[doc.code] as File);
                }
            }

            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/auth/onboarding/complete`, { method: 'POST', body: formData });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.message || "Onboarding submission failed.");

            setSubmissionDate(new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' }));
            setStep(4);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const renderStepContent = () => {
        switch (step) {
            case 1:
                return (
                    <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center"><User className="mr-3 text-primary"/>Personal Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium text-gray-700">Date of Birth</label><input type="date" name="dob" value={personalData.dob} onChange={handlePersonalDataChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md"/></div>
                            <div><label className="block text-sm font-medium text-gray-700">Gender</label><select name="gender" value={personalData.gender} onChange={handlePersonalDataChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md"><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option></select></div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium text-gray-700">Street</label><input type="text" name="street" value={personalData.street} onChange={handlePersonalDataChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md"/></div>
                            <div><label className="block text-sm font-medium text-gray-700">City</label><input type="text" name="city" value={personalData.city} onChange={handlePersonalDataChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md"/></div>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Region</label>
                                <select name="region" value={personalData.region} onChange={handleRegionChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md">
                                    <option value="">Select Region</option>
                                    {mockRegions.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">District</label>
                                <select name="district" value={personalData.district} onChange={handlePersonalDataChange} required disabled={!personalData.region} className="mt-1 w-full p-2 border border-gray-300 rounded-md disabled:bg-gray-100">
                                    <option value="">{personalData.region ? 'Select District' : 'Select a region first'}</option>
                                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="pt-4 mt-4 border-t">
                             <h4 className="font-semibold text-gray-700">KYC Documents</h4>
                             <p className="text-xs text-gray-500 mb-3">Please upload the required identification documents.</p>
                             {loadingKyc && <p>Loading document requirements...</p>}
                             <div className="space-y-3">
                                {kycDocuments.map(doc => doc.code && (
                                    <div key={doc.id}>
                                        <label className="font-medium text-gray-700">{doc.name}</label>
                                        <div className="mt-1">
                                             <label htmlFor={`file-${doc.code}`} className="flex items-center justify-center w-full px-4 py-2 text-sm text-gray-600 bg-gray-50 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-100">
                                                <FileUp className="w-5 h-5 mr-2 text-gray-500" />
                                                <span>{files[doc.code]?.name || `Upload ${doc.name}`}</span>
                                                <input id={`file-${doc.code}`} type="file" required className="hidden" onChange={(e) => handleFileChange(doc.code!, e.target.files ? e.target.files[0] : null)} />
                                            </label>
                                        </div>
                                    </div>
                                ))}
                             </div>
                        </div>
                    </div>
                );
            case 2:
                return (
                     <div className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center"><DollarSign className="mr-3 text-primary"/>Financial Information</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Linked Mobile Wallet</label>
                            <input type="tel" placeholder="+255..." name="mobileWallet" value={financialData.mobileWallet} onChange={handleFinancialDataChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
                        </div>
                        <div className="pt-4 mt-4 border-t">
                            <h4 className="font-semibold text-gray-700">Next of Kin (Optional)</h4>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                <div><label className="block text-sm font-medium text-gray-500">Full Name</label><input type="text" name="nextOfKinFullName" value={financialData.nextOfKinFullName} onChange={handleFinancialDataChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/></div>
                                <div><label className="block text-sm font-medium text-gray-500">Phone Number</label><input type="tel" name="nextOfKinPhone" value={financialData.nextOfKinPhone} onChange={handleFinancialDataChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/></div>
                                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-500">Relationship</label>
                                    <select name="nextOfKinRelationship" value={financialData.nextOfKinRelationship} onChange={handleFinancialDataChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md">
                                        <option>BROTHER</option><option>SISTER</option><option>FATHER</option><option>MOTHER</option><option>SPOUSE</option><option>CHILD</option><option>OTHER</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="pt-4 mt-4 border-t">
                            <label className="flex items-center">
                                <input type="checkbox" checked={savingsPlan.auto} onChange={e => setSavingsPlan(p => ({...p, auto: e.target.checked}))} className="h-4 w-4 text-primary rounded focus:ring-primary"/>
                                <span className="ml-2 font-semibold text-gray-700">Setup Auto Deposit / Saving</span>
                            </label>
                        </div>
                        {savingsPlan.auto && (
                            <div className="p-4 border border-gray-200 rounded-lg space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className="block text-sm font-medium text-gray-700">Amount (TZS)</label><input type="number" name="amount" value={autoDeposit.amount} onChange={handleAutoDepositChange} min="100" className="mt-1 w-full p-2 border border-gray-300 rounded-md"/></div>
                                    <div><label className="block text-sm font-medium text-gray-700">Frequency</label><select name="frequency" value={autoDeposit.frequency} onChange={handleAutoDepositChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md"><option>DAILY</option><option>WEEKLY</option><option>BI-WEEKLY</option><option>MONTHLY</option></select></div>
                                    {autoDeposit.frequency === 'WEEKLY' && <div><label className="block text-sm font-medium text-gray-700">Day of Week</label><select name="dayOfWeek" value={autoDeposit.dayOfWeek} onChange={handleAutoDepositChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md"><option>MONDAY</option><option>TUESDAY</option><option>WEDNESDAY</option><option>THURSDAY</option><option>FRIDAY</option><option>SATURDAY</option><option>SUNDAY</option></select></div>}
                                    {(autoDeposit.frequency === 'DAILY' || autoDeposit.frequency === 'WEEKLY') && <div><label className="block text-sm font-medium text-gray-700">Time</label><input type="time" name="time" value={autoDeposit.time} onChange={handleAutoDepositChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/></div>}
                                    <div><label className="block text-sm font-medium text-gray-700">Start Date</label><input type="date" name="startDate" value={autoDeposit.startDate} onChange={handleAutoDepositChange} required className="mt-1 w-full p-2 border border-gray-300 rounded-md"/></div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">End Date (Optional)</label>
                                        <input type="date" name="endDate" value={autoDeposit.endDate} onChange={handleAutoDepositChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md"/>
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">Payment Source</label>
                                        <select name="paymentSource" disabled className="mt-1 w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed">
                                            <option>Mobile Money</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            case 3:
                return (
                     <div className="space-y-4">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center"><ShieldCheck className="mr-3 text-primary"/>Compliance & Security</h3>
                        <div className="p-4 bg-gray-50 rounded-lg border">
                             <label className="flex items-start space-x-3">
                                <input type="checkbox" required checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="h-4 w-4 text-primary rounded focus:ring-primary mt-1"/>
                                <span className="text-sm text-gray-600">I have read, understood, and agree to the <a href="#" className="text-primary font-semibold hover:underline">Terms & Conditions</a> and <a href="#" className="text-primary font-semibold hover:underline">Privacy Policy</a> of PesaFlow.</span>
                            </label>
                        </div>
                         <div className="text-center p-4">
                            <h4 className="font-semibold">Ready to Go!</h4>
                             <p className="text-sm text-gray-500 mt-1">Submit your information for final verification. Your savings features will be activated upon approval.</p>
                        </div>
                    </div>
                );
            case 4:
                return <OnboardingSuccess user={user} submissionDate={submissionDate} onLogout={logout} />;
            default: return null;
        }
    }
    
    return (
        <div className="bg-background min-h-screen py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-3xl w-full mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-extrabold text-gray-900">Complete Your Profile</h1>
                    <p className="mt-2 text-lg text-gray-600">Just a few more steps to unlock your savings potential.</p>
                </div>

                {step < 4 && <Stepper currentStep={step} />}
                
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm" role="alert">{error}</div>}

                <div className="bg-white p-8 rounded-xl shadow-lg">
                    <form onSubmit={handleSubmit}>
                        {renderStepContent()}
                        {step < 4 && (
                            <div className="flex justify-between items-center mt-8 pt-6 border-t">
                                {step > 1 ? (
                                    <button type="button" onClick={prevStep} className="bg-gray-200 text-gray-700 font-semibold py-2 px-6 rounded-lg hover:bg-gray-300 transition-colors">Back</button>
                                ) : <div></div>}
                                
                                {step < 3 ? (
                                    <button type="button" onClick={nextStep} disabled={!isCurrentStepValid} className="bg-primary text-white font-semibold py-2 px-6 rounded-lg hover:bg-primary-dark transition-colors disabled:bg-primary-light disabled:cursor-not-allowed">Next</button>
                                ) : (
                                    <button type="submit" disabled={!isCurrentStepValid || isSubmitting} className="bg-green-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:bg-green-400 disabled:cursor-not-allowed flex items-center">
                                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        {isSubmitting ? 'Submitting...' : 'Submit for Verification'}
                                    </button>
                                )}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default SaverOnboardingPage;
