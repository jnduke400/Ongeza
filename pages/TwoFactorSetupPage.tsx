import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

const TwoFactorSetupPage: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center bg-surface rounded-2xl shadow-sm border border-gray-100 text-center p-8">
            <ShieldCheck size={64} className="text-primary mb-6" />
            <h1 className="text-3xl font-bold text-gray-800">Two-Factor Authentication Setup</h1>
            <p className="text-gray-500 mt-4 max-w-md">
                This feature is under construction. The full 2FA setup process will be available here soon.
            </p>
             <p className="text-gray-500 mt-2 max-w-md">
                For now, you can manage your password and other security settings on your profile page.
            </p>
            <div className="mt-8 flex items-center space-x-4">
                 <Link
                    to="/dashboard"
                    className="text-primary font-semibold hover:underline flex items-center justify-center"
                >
                    <ArrowLeft size={18} className="mr-1" />
                    Back to Dashboard
                </Link>
                <Link
                    to="/profile"
                    className="bg-primary text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:bg-primary-dark transition-all duration-300"
                >
                    Go to Security Settings
                </Link>
            </div>
        </div>
    );
};

export default TwoFactorSetupPage;
