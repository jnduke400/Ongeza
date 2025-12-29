import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

interface SessionExpiryModalProps {
    isOpen: boolean;
    pinSet: boolean;
    fromPath: string;
    onClose: () => void;
}

const SessionExpiryModal: React.FC<SessionExpiryModalProps> = ({ isOpen, pinSet, fromPath, onClose }) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const config = {
        title: 'Session Expired',
        message: pinSet
            ? 'Your session has expired for security reasons. Please verify your PIN to continue.'
            : "Your session has expired. For enhanced security, please set up a PIN to quickly regain access next time.",
        buttonText: pinSet ? 'Verify PIN' : 'Setup PIN',
        destination: pinSet ? '/verify-pin' : '/set-pin',
    };
    
    const handleAction = () => {
        const stateToPass = { from: fromPath, fromSessionExpiry: true };
        sessionStorage.setItem('redirectAfterPin', JSON.stringify(stateToPass));

        navigate(config.destination);
        onClose();
    };

    // We don't want the modal to close when clicking the overlay
    const stopPropagation = (e: React.MouseEvent) => e.stopPropagation();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 text-center" onClick={stopPropagation}>
                <ShieldAlert size={48} className="mx-auto text-amber-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800">{config.title}</h2>
                <p className="text-gray-600 my-4">{config.message}</p>
                <button
                    onClick={handleAction}
                    className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-dark transition-colors"
                >
                    {config.buttonText}
                </button>
            </div>
        </div>
    );
};

export default SessionExpiryModal;