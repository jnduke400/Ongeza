
import React, { useState } from 'react';
import { Mail, Phone, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../services/apiConfig';
import { interceptedFetch } from '../services/api';

const ContactPage: React.FC = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        emailAddress: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        // Map HTML ids to state keys
        let key = id;
        if (id === 'full-name') key = 'fullName';
        if (id === 'email-address') key = 'emailAddress';
        
        setFormData(prev => ({ ...prev, [key]: value }));
        
        // Clear errors when user types
        if (error) setError('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        try {
            const response = await interceptedFetch(`${API_BASE_URL}/api/v1/contact-us`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok || (data.hasOwnProperty('success') && data.success === false)) {
                throw new Error(data.message || 'Failed to send message. Please try again.');
            }

            setSuccess(true);
            setFormData({ fullName: '', emailAddress: '', message: '' }); // Clear form
            
            // Auto-hide success message after 5 seconds
            setTimeout(() => setSuccess(false), 5000);

        } catch (err: any) {
            console.error("Contact API Error:", err);
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="max-w-6xl mx-auto">
                <header className="text-center mb-12">
                    <span className="text-sm font-bold tracking-wider uppercase bg-primary-light text-primary-dark px-4 py-2 rounded-lg">Contact Us</span>
                    <h1 className="text-4xl md:text-5xl font-extrabold mt-4 text-gray-900">Let's work together</h1>
                    <p className="text-gray-600 mt-3 max-w-2xl mx-auto">Any question or remark? Just write us a message.</p>
                </header>

                <main className="bg-surface border border-gray-100 shadow-sm p-6 sm:p-8 md:p-12 rounded-2xl grid lg:grid-cols-5 gap-12 items-center">
                    {/* Left side: Image and contact details */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="relative">
                            <div className="absolute -top-6 -left-6 w-32 h-32 -z-10 text-gray-200">
                                <svg width="100%" height="100%" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M128 40 V128 H0 V40 C0 17.9086 17.9086 0 40 0 H88 C110.091 0 128 17.9086 128 40 Z" transform="rotate(180, 64, 64)" stroke="currentColor" strokeWidth="2" strokeDasharray="8 8"/>
                                </svg>
                            </div>
                            <img
                                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop"
                                alt="Team working together"
                                className="rounded-2xl shadow-lg w-full h-auto object-cover"
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between gap-6">
                            <div className="flex items-center space-x-3">
                                <div className="bg-gray-100 p-3 rounded-lg"><Mail size={20} className="text-primary"/></div>
                                <div>
                                    <p className="font-semibold text-gray-800">Email</p>
                                    <a href="mailto:support@pesaflow.com" className="text-sm text-gray-600 hover:text-primary-dark transition-colors">support@pesaflow.com</a>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="bg-gray-100 p-3 rounded-lg"><Phone size={20} className="text-primary"/></div>
                                <div>
                                    <p className="font-semibold text-gray-800">Phone</p>
                                    <a href="tel:+255123456789" className="text-sm text-gray-600 hover:text-primary-dark transition-colors">+255 123 456 789</a>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right side: Form */}
                    <div className="lg:col-span-3">
                        <h2 className="text-3xl font-bold mb-2 text-gray-800">Send a message</h2>
                        <p className="text-gray-600 mb-6">If you would like to discuss anything related to payment, account, licensing, partnerships, or have pre-sales questions, you're at the right place.</p>
                        
                        {success && (
                            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
                                <CheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold">Message sent successfully!</p>
                                    <p className="text-sm mt-1">Thank you for contacting us. We will get back to you shortly.</p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                                <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="font-semibold">Failed to send message</p>
                                    <p className="text-sm mt-1">{error}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid sm:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="full-name" className="block text-sm font-medium mb-1 text-gray-500">Full Name</label>
                                    <input 
                                        type="text" 
                                        id="full-name" 
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="John Doe" 
                                        required
                                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary" 
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email-address" className="block text-sm font-medium mb-1 text-gray-500">Email address</label>
                                    <input 
                                        type="email" 
                                        id="email-address" 
                                        value={formData.emailAddress}
                                        onChange={handleChange}
                                        placeholder="johndoe@gmail.com" 
                                        required
                                        className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary" 
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium mb-1 text-gray-500">Message</label>
                                <textarea 
                                    id="message" 
                                    value={formData.message}
                                    onChange={handleChange}
                                    placeholder="Write your message..." 
                                    rows={5} 
                                    required
                                    className="w-full bg-gray-50 border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary"
                                ></textarea>
                            </div>
                            <div>
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-auto bg-primary text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-primary-dark hover:shadow-xl transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="animate-spin mr-2 h-5 w-5" />
                                            Sending...
                                        </>
                                    ) : (
                                        'Send Inquiry'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ContactPage;
