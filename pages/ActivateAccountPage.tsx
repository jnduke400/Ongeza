import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, ChevronLeft } from 'lucide-react';

const ActivateAccountPage: React.FC = () => {
    const location = useLocation();
    const message = location.state?.message || "Your account is dormant. Please follow the steps below to reactivate it.";

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-xl w-full bg-white p-8 sm:p-12 rounded-2xl shadow-lg border border-gray-100 text-center">
                <ShieldAlert size={56} className="mx-auto text-amber-500 mb-6" />
                <h1 className="text-3xl font-bold text-gray-800">Account Activation Required</h1>
                <p className="text-gray-600 mt-4 mb-8">{message}</p>
                
                <div className="bg-gray-100 p-6 rounded-lg text-left space-y-4 border border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-700">To reactivate your account:</h2>
                    <p className="text-sm text-gray-600">This feature is currently under development. In the meantime, please contact our support team for assistance with account reactivation.</p>
                    <p className="text-sm text-gray-600">
                        <strong>Contact Support:</strong> <a href="mailto:support@pesaflow.com" className="text-primary font-medium hover:underline">support@pesaflow.com</a>
                    </p>
                </div>

                <div className="mt-8">
                    <Link
                        to="/login"
                        className="text-primary font-semibold hover:underline flex items-center justify-center"
                    >
                        <ChevronLeft size={18} className="mr-1" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ActivateAccountPage;
