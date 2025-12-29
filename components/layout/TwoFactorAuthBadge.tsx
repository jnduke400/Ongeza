import React, { useState, useEffect } from 'react';
import { X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../../types';

const TwoFactorAuthBadge: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(sessionStorage.getItem('2faBadgeDismissed') === 'true'); 

    useEffect(() => {
        const shouldShow = user?.twoFaSetupRequired === true && !isDismissed;
        
        const timer = setTimeout(() => {
            setIsVisible(shouldShow);
        }, 500); // Delay to allow other UI elements to settle

        return () => clearTimeout(timer);
    }, [user, isDismissed]);

    const handleDismiss = () => {
        setIsVisible(false);
        // After the slide-out animation, permanently dismiss for the session.
        setTimeout(() => {
            setIsDismissed(true);
            sessionStorage.setItem('2faBadgeDismissed', 'true');
        }, 500); 
    };

    if (isDismissed) {
        return null;
    }
    
    const handleSetup2FA = () => {
        setIsVisible(false);
        setTimeout(() => {
            setIsDismissed(true);
            sessionStorage.setItem('2faBadgeDismissed', 'true');
            if (user?.role === UserRole.PlatformAdmin) {
                navigate('/profile#two-factor-setup');
            } else {
                navigate('/settings#two-factor-setup');
            }
        }, 500);
    };

    return (
        <div 
            className={`fixed top-56 right-0 z-50 p-4 bg-white rounded-l-lg shadow-lg border border-r-0 border-gray-200 transition-transform duration-500 ease-in-out ${
                isVisible ? 'translate-x-0' : 'translate-x-full'
            }`}
            style={{ maxWidth: '320px' }}
        >
            <button 
                onClick={handleDismiss} 
                className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label="Dismiss 2FA setup reminder"
            >
                <X size={18} />
            </button>
            <div className="flex items-start space-x-4">
                <div className="bg-blue-100 text-blue-600 p-3 rounded-full mt-1">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-gray-800">Secure Your Account</h4>
                    <p className="text-sm text-gray-600 mt-1">Enable Two-Factor Authentication (2FA) for an extra layer of security.</p>
                    <button 
                        onClick={handleSetup2FA}
                        className="mt-3 bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-blue-600 transition-colors"
                    >
                        Setup 2FA
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TwoFactorAuthBadge;