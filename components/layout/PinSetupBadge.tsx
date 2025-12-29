import React, { useState, useEffect } from 'react';
import { X, Shield } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { useNavigate } from 'react-router-dom';

const PinSetupBadge: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    const [isDismissed, setIsDismissed] = useState(sessionStorage.getItem('pinBadgeDismissed') === 'true'); 

    useEffect(() => {
        const shouldShow = user?.role === UserRole.Saver && user.pinSet === false && !isDismissed;
        
        const timer = setTimeout(() => {
            setIsVisible(shouldShow);
        }, 500);

        return () => clearTimeout(timer);
    }, [user, isDismissed]);

    const handleDismiss = () => {
        setIsVisible(false);
        // After the slide-out animation, permanently dismiss for the session.
        setTimeout(() => {
            setIsDismissed(true);
            sessionStorage.setItem('pinBadgeDismissed', 'true');
        }, 500); 
    };

    if (isDismissed) {
        return null;
    }
    
    const handleSetPin = () => {
        setIsVisible(false);
        setTimeout(() => {
            setIsDismissed(true);
            sessionStorage.setItem('pinBadgeDismissed', 'true');
            navigate('/set-pin');
        }, 500);
    };

    return (
        <div 
            className={`fixed top-28 right-0 z-50 p-4 bg-white rounded-l-lg shadow-lg border border-r-0 border-gray-200 transition-transform duration-500 ease-in-out ${
                isVisible ? 'translate-x-0' : 'translate-x-full'
            }`}
            style={{ maxWidth: '320px' }}
        >
            <button 
                onClick={handleDismiss} 
                className="absolute top-2 right-2 p-1 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                aria-label="Dismiss PIN setup reminder"
            >
                <X size={18} />
            </button>
            <div className="flex items-start space-x-4">
                <div className="bg-amber-100 text-amber-600 p-3 rounded-full mt-1">
                    <Shield size={24} />
                </div>
                <div>
                    <h4 className="font-bold text-gray-800">Enhance Your Security</h4>
                    <p className="text-sm text-gray-600 mt-1">Set up a PIN for quicker and more secure access when your session expires.</p>
                    <button 
                        onClick={handleSetPin}
                        className="mt-3 bg-amber-500 text-white font-semibold py-2 px-4 rounded-lg text-sm hover:bg-amber-600 transition-colors"
                    >
                        Set PIN
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PinSetupBadge;
