import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const OnboardingIllustration = () => (
    <svg viewBox="0 0 400 300" className="w-full max-w-sm mx-auto drop-shadow-lg mb-8">
        {/* Floating shapes */}
        <polygon points="50,50 70,30 90,50 70,70" fill="#FBBF24" opacity="0.8" />
        <path d="M 300 40 L 320 70 L 280 70 Z" fill="#F43F5E" opacity="0.8" />
        <circle cx="80" cy="150" r="12" fill="#7DD3FC" opacity="0.8" />
        <circle cx="330" cy="160" r="8" fill="#6EE7B7" opacity="0.8" />
        <circle cx="40" cy="220" r="5" fill="#A5B4FC" opacity="0.8" />
        <polygon points="340,200 350,220 330,220" fill="#FBBF24" opacity="0.8" />

        {/* Person */}
        <g transform="translate(100, 50)">
            {/* Shadow */}
            <ellipse cx="100" cy="245" rx="70" ry="8" fill="#000" opacity="0.05" />

            {/* Legs */}
            <path d="M 40 230 C 60 190, 140 190, 160 230 Q 100 260, 40 230" fill="#22D3EE" />
            
            {/* Feet */}
            <g>
                <ellipse cx="50" cy="230" rx="20" ry="10" fill="#F43F5E" transform="rotate(-15 50 230)" />
                <path d="M40 230 l 5 5 l 5 -5 M 45 230 l 5 5 l 5 -5 M 50 230 l 5 5 l 5 -5" stroke="white" strokeWidth="1" fill="none" />
            </g>
            <g>
                <ellipse cx="150" cy="230" rx="20" ry="10" fill="#F43F5E" transform="rotate(15 150 230)" />
                <path d="M140 230 l 5 5 l 5 -5 M 145 230 l 5 5 l 5 -5 M 150 230 l 5 5 l 5 -5" stroke="white" strokeWidth="1" fill="none" />
            </g>

            {/* Torso & Arms */}
            <path d="M 70 220 C 30 200, 30 120, 75 120" stroke="#8A6DFF" strokeWidth="20" fill="none" strokeLinecap="round" />
            <path d="M 130 220 C 170 200, 170 120, 125 120" stroke="#8A6DFF" strokeWidth="20" fill="none" strokeLinecap="round" />
            <path d="M 70 220 Q 100 160, 130 220 L 120 230 L 80 230 Z" fill="#FBBF24" />

            {/* Hands */}
            <circle cx="75" cy="120" r="10" fill="#FDE68A" />
            <circle cx="125" cy="120" r="10" fill="#FDE68A" />
            
            {/* Head and Hair */}
            <g>
                <path d="M 70 80 C 70 40, 130 40, 130 80 V 100 C 130 100, 110 110, 100 110 C 90 110, 70 100, 70 100 Z" fill="#1F2937" />
                <circle cx="100" cy="100" r="35" fill="#FDE68A" />
                <path d="M 90 105 Q 95 100, 100 105" stroke="#4B5563" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M 100 105 Q 105 100, 110 105" stroke="#4B5563" strokeWidth="2" fill="none" strokeLinecap="round" />
                <path d="M 90 120 Q 100 125, 110 120" stroke="#4B5563" strokeWidth="2" fill="none" strokeLinecap="round" />
            </g>
        </g>
    </svg>
);


const OnboardingStatusPage: React.FC = () => {
    const { logout } = useAuth();
    
    return (
        <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-4 text-center">
            <div className="max-w-xl">
                <OnboardingIllustration />
                <h1 className="text-3xl font-bold text-gray-800">Onboarding in Progress! 🧘‍♀️</h1>
                <p className="text-gray-600 mt-4 max-w-lg mx-auto">
                    Thank you for submitting your details. We're currently reviewing your application. This process usually takes 2 to 3 business days. We'll notify you once your account is fully activated.
                </p>
                <button
                    onClick={logout}
                    className="mt-8 bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-full transition-colors duration-300 shadow-md hover:shadow-lg"
                >
                    Back to Login
                </button>
            </div>
        </div>
    );
};

export default OnboardingStatusPage;
