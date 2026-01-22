import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    ShieldCheck, TrendingUp, Users, ArrowRight, CheckCircle, 
    ChevronDown, CreditCard, DollarSign, Globe, Zap, Mail,
    ArrowUpRight, PlayCircle, MoreVertical
} from 'lucide-react';

const Logo = () => (
    <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <DollarSign className="text-white" size={18} />
        </div>
        <span className="text-2xl font-bold tracking-tight text-white">Ongeza</span>
    </div>
);

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string; color: string }> = ({ icon, title, description, color }) => (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group">
        <div className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
        <p className="text-gray-500 leading-relaxed mb-6">{description}</p>
        <button className="flex items-center text-sm font-bold text-gray-900 group/link">
            <span>View Details</span>
            <ArrowUpRight size={16} className="ml-1 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
        </button>
    </div>
);

const StatItem: React.FC<{ value: string; label: string }> = ({ value, label }) => (
    <div className="text-center md:text-left">
        <p className="text-5xl md:text-6xl font-black text-gray-900 tracking-tighter mb-4">{value}</p>
        <p className="text-sm font-medium text-gray-500 max-w-[180px] mx-auto md:mx-0 leading-snug">{label}</p>
    </div>
);

const FAQItem: React.FC<{ question: string; answer: string; isOpen: boolean; onClick: () => void }> = ({ question, answer, isOpen, onClick }) => (
    <div className="border-b border-gray-100 last:border-0">
        <button 
            onClick={onClick}
            className="w-full py-6 flex items-center justify-between text-left group"
        >
            <span className={`text-lg font-bold transition-colors ${isOpen ? 'text-primary' : 'text-gray-900 group-hover:text-primary'}`}>{question}</span>
            <div className={`p-1 rounded-full transition-all ${isOpen ? 'bg-primary text-white rotate-180' : 'bg-gray-50 text-gray-400 group-hover:bg-gray-100'}`}>
                <ChevronDown size={20} />
            </div>
        </button>
        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 pb-6' : 'max-h-0'}`}>
            <p className="text-gray-500 leading-relaxed">{answer}</p>
        </div>
    </div>
);

const LandingPage: React.FC = () => {
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    const faqs = [
        {
            question: "What do I need to register for an account?",
            answer: "To register, you need a valid Tanzanian mobile number (in +255 format), your first and last name, and your date of birth. Please note that you must be at least 18 years old to create an account."
        },
        {
            question: "How does the account verification process work?",
            answer: "After you enter your registration details, we will send a 6-digit One-Time Password (OTP) to your mobile number. Once you verify the OTP, your account application is submitted to our administrators for final approval."
        },
        {
            question: "Is there a minimum amount I can save?",
            answer: "Yes, the minimum contribution amount is TZS 100. This makes it easy for everyone to start saving, no matter how small the amount."
        },
        {
            question: "How is interest calculated on my savings?",
            answer: "Interest is calculated on your end-of-day balance and is compounded. The earned interest is posted to your savings account on the last day of each month. We use a tiered rate system, so your interest rate increases as your balance grows."
        }
    ];

    return (
        <div className="bg-white min-h-screen font-sans selection:bg-primary/20 selection:text-primary">
            {/* Dark Hero Section */}
            <div className="relative bg-[#063535] overflow-hidden">
                {/* Grid Overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
                
                {/* Navbar */}
                <header className="relative z-20">
                    <nav className="container mx-auto px-6 py-8 flex justify-between items-center">
                        <Logo />
                        <div className="hidden md:flex items-center space-x-10">
                            {['Products', 'Pricing', 'API for Developer', 'Blog', 'Contact'].map(link => (
                                link === 'Contact' ? (
                                    <Link key={link} to="/contact-us" className="text-sm font-semibold text-white/80 hover:text-white transition-colors">{link}</Link>
                                ) : (
                                    <a key={link} href="#" className="text-sm font-semibold text-white/80 hover:text-white transition-colors">{link}</a>
                                )
                            ))}
                        </div>
                        <div className="flex items-center space-x-4">
                            <Link to="/login" className="text-sm font-bold text-white hover:text-primary transition-colors">Login</Link>
                            <Link to="/onboarding" className="bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-6 rounded-full transition-all active:scale-95 shadow-lg shadow-primary/20">
                                Open Account
                            </Link>
                        </div>
                    </nav>
                </header>

                {/* Hero Content */}
                <main className="container mx-auto px-6 pt-16 pb-64 relative z-10 text-center">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight mb-8">
                            Start micro-savings, achieve your goals, grow community wealth from your digital wallet
                        </h1>
                        <p className="text-white/60 text-lg md:text-xl font-medium max-w-2xl mx-auto mb-12">
                            "Transforming the Future of Finance: Your Gateway to a Seamless FinTech Experience"
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/onboarding" className="w-full sm:w-auto bg-[#eefc54] hover:bg-[#d9e83e] text-black font-black py-4 px-8 rounded-xl transition-all active:scale-95 shadow-xl shadow-yellow-400/10">
                                Generate Your Card
                            </Link>
                            <Link to="/onboarding" className="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-bold py-4 px-8 rounded-xl transition-all border border-white/20 active:scale-95">
                                Open Account
                            </Link>
                        </div>
                    </div>

                    {/* Floating Cards Mockup */}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-[-180px] w-full max-w-5xl px-6 pointer-events-none">
                        <div className="relative h-[400px] flex items-center justify-center">
                            {/* Visual representation of cards using colors from image */}
                            <div className="absolute w-[280px] h-[180px] bg-[#d7f58b] rounded-2xl shadow-2xl rotate-[-15deg] translate-x-[-240px] translate-y-[-20px] p-6 text-left flex flex-col justify-between">
                                <Zap className="text-black" size={24} />
                                <div className="font-mono text-black/40 text-xs">**** 4241</div>
                            </div>
                            <div className="absolute w-[280px] h-[180px] bg-[#91d1c9] rounded-2xl shadow-2xl rotate-[-5deg] translate-x-[-80px] translate-y-[20px] p-6 text-left flex flex-col justify-between">
                                <Globe className="text-black" size={24} />
                                <div className="font-mono text-black/40 text-xs">**** 6289</div>
                            </div>
                            <div className="absolute w-[280px] h-[180px] bg-white rounded-2xl shadow-2xl rotate-[5deg] translate-x-[80px] translate-y-[0px] p-6 text-left flex flex-col justify-between">
                                <CreditCard className="text-primary" size={24} />
                                <div className="font-mono text-gray-400 text-xs">**** 8612</div>
                            </div>
                            <div className="absolute w-[280px] h-[180px] bg-[#f9fc54] rounded-2xl shadow-2xl rotate-[15deg] translate-x-[240px] translate-y-[30px] p-6 text-left flex flex-col justify-between border-l-8 border-black">
                                <Zap className="text-black" size={24} />
                                <div>
                                    <div className="font-mono text-black font-bold text-lg">4241 6289 8612 8946</div>
                                    <div className="font-mono text-black/40 text-xs mt-1">EXP 12/28</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Statistics Section */}
            <section className="bg-[#f9fafb] pt-56 pb-24">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-200">
                        <StatItem value="20K+" label="In 38 countries, we work as one global team to help clients" />
                        <div className="md:px-12 py-12 md:py-0">
                            <StatItem value="72K%" label="We worked with 89% of the Global 500 companies" />
                        </div>
                        <div className="md:pl-12 pt-12 md:pt-0">
                            <StatItem value="86%" label="We worked with 89% of the Global 500 companies" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features / Product Section */}
            <section className="py-32">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col lg:flex-row items-center justify-between mb-24 gap-12">
                        <div className="max-w-xl">
                            <p className="text-primary font-bold uppercase tracking-widest text-sm mb-4">Features</p>
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                                Empowering Your Financing Journey
                            </h2>
                        </div>
                        <p className="text-gray-500 text-lg max-w-md leading-relaxed">
                            Explore our services today and take the step forward a place you can truly call your own.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Featured Feature Card */}
                        <div className="bg-[#f9fcb4] rounded-[40px] p-8 md:p-12 relative overflow-hidden group">
                            <div className="flex justify-between items-start mb-12">
                                <h3 className="text-3xl md:text-4xl font-black text-gray-900 max-w-[200px]">Interest Rate Comparison</h3>
                                <button className="bg-white rounded-full p-4 shadow-xl group-hover:scale-110 transition-transform">
                                    <ArrowUpRight size={24} className="text-gray-900" />
                                </button>
                            </div>
                            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl max-w-[300px]">
                                <img src="https://images.unsplash.com/photo-1580519542036-c47de6196ba5?q=80&w=800&auto=format&fit=crop" alt="Coins and bills" className="w-full h-auto" />
                            </div>
                            <div className="absolute right-[-20px] bottom-[-20px] w-64 h-64 bg-white/30 rounded-full blur-3xl group-hover:bg-white/50 transition-colors"></div>
                        </div>

                        {/* Feature 2 */}
                        <div className="bg-[#f4f7fa] rounded-[40px] p-8 md:p-12 group">
                             <div className="flex justify-between items-start mb-8">
                                <h3 className="text-3xl font-black text-gray-900">Payment Management</h3>
                                <button className="text-gray-400 group-hover:text-primary transition-colors">
                                    <MoreVertical size={24} />
                                </button>
                            </div>
                            <p className="text-gray-500 mb-8 max-w-xs">Easily manage all your business and personal payments in one place.</p>
                            <div className="rounded-3xl overflow-hidden shadow-xl">
                                <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop" alt="Payment management" className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard 
                            color="bg-emerald-50 text-emerald-600"
                            icon={<TrendingUp size={28} />}
                            title="Micro-Savings"
                            description="Start saving with any amount. No minimum balance, no hidden fees. Watch your savings grow."
                        />
                        <FeatureCard 
                            color="bg-blue-50 text-blue-600"
                            icon={<ShieldCheck size={28} />}
                            title="Micro-Lending"
                            description="Access fair and transparent loans for your business or personal needs with quick approval."
                        />
                        <FeatureCard 
                            color="bg-purple-50 text-purple-600"
                            icon={<Users size={28} />}
                            title="Community Investing"
                            description="Become an investor and fund loans for local entrepreneurs. Earn returns while making impact."
                        />
                    </div>
                </div>
            </section>

            {/* Social Proof Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <p className="text-center text-gray-400 font-bold uppercase tracking-[0.2em] text-xs mb-12">More than 5000 companies trust with us</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
                        {['Microsoft', 'Google', 'stripe', 'Entrepreneur', 'Uber', 'Forbes'].map(brand => (
                            <span key={brand} className="text-2xl font-black text-gray-900">{brand}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-32 bg-[#fcfcfc]">
                <div className="container mx-auto px-6 max-w-4xl">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-black text-gray-900 mb-4">You burning question, answered</h2>
                        <p className="text-gray-500 text-lg">If you have a question that isn't answered in our FAQs then please get in touch and let us know.</p>
                    </div>
                    
                    <div className="bg-white rounded-[40px] shadow-xl shadow-gray-200/50 p-8 md:p-12 border border-gray-100">
                        {faqs.map((faq, idx) => (
                            <FAQItem 
                                key={idx}
                                question={faq.question}
                                answer={faq.answer}
                                isOpen={openFaq === idx}
                                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                            />
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
                        <Link to="/all-faqs" className="bg-[#f9fc54] hover:bg-[#eefc54] text-black font-bold py-3 px-8 rounded-xl transition-all">See all FAQs</Link>
                        <Link to="/contact-us" className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 font-bold py-3 px-8 rounded-xl transition-all">Get in touch</Link>
                    </div>
                </div>
            </section>

            {/* Getting Started Section */}
            <section className="py-24 px-6">
                <div className="container mx-auto max-w-6xl">
                    <div className="relative bg-[#063535] rounded-[50px] p-12 md:p-24 text-center overflow-hidden">
                        <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>
                        
                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">it's easy to get started</h2>
                            <p className="text-white/60 text-lg mb-12">Get the app to explore the world of premium cards, get fast and safe transaction to help you find your dream rent</p>
                            
                            <form className="flex flex-col sm:flex-row gap-3 bg-white/10 p-2 rounded-2xl border border-white/10 backdrop-blur-md">
                                <input 
                                    type="email" 
                                    placeholder="Enter your email" 
                                    className="flex-1 bg-transparent px-6 py-4 text-white placeholder:text-white/40 focus:outline-none"
                                />
                                <button className="bg-[#f9fc54] hover:bg-[#eefc54] text-black font-black py-4 px-8 rounded-xl transition-all whitespace-nowrap">
                                    Get Started
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white pt-24 pb-12 border-t border-gray-100">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-20">
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                                    <DollarSign className="text-white" size={18} />
                                </div>
                                <span className="text-2xl font-bold text-gray-900">Ongeza</span>
                            </div>
                            <p className="text-gray-500 max-w-xs mb-8 leading-relaxed">
                                Technology Park, 8-10 Main Queen Street, 08075 Dar es Salaam, Tanzania
                            </p>
                            <a href="mailto:hello@ongeza.co.tz" className="text-gray-900 font-bold hover:text-primary transition-colors">hello@ongeza.co.tz</a>
                            <div className="flex items-center space-x-4 mt-8">
                                {[Users, TrendingUp, Mail, Zap].map((Icon, i) => (
                                    <a key={i} href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:bg-primary hover:text-white transition-all">
                                        <Icon size={18} />
                                    </a>
                                ))}
                            </div>
                        </div>
                        
                        <div>
                            <h4 className="font-black text-gray-900 mb-6 uppercase tracking-widest text-xs">Products</h4>
                            <ul className="space-y-4 text-sm text-gray-500">
                                {['Mass payouts', 'Payment links, plugins', 'Donate', 'Currency exchange', 'Virtual Cards'].map(item => (
                                    <li key={item}><a href="#" className="hover:text-primary transition-colors">{item}</a></li>
                                ))}
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="font-black text-gray-900 mb-6 uppercase tracking-widest text-xs">Management</h4>
                            <ul className="space-y-4 text-sm text-gray-500">
                                {['Multi-currency wallet', 'Crypto wallet', 'Investing', 'Transfers', 'eMAN'].map(item => (
                                    <li key={item}><a href="#" className="hover:text-primary transition-colors">{item}</a></li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-black text-gray-900 mb-6 uppercase tracking-widest text-xs">Solutions</h4>
                            <ul className="space-y-4 text-sm text-gray-500">
                                {['Financial', 'Invest & CEO', 'Revenue Operations', 'Human Resources'].map(item => (
                                    <li key={item}><a href="#" className="hover:text-primary transition-colors">{item}</a></li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="pt-12 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                        <p className="text-gray-400 text-sm font-medium">Copyright 2025 All rights reserved</p>
                        <div className="flex items-center space-x-8 text-sm font-bold text-gray-900">
                            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                            <a href="#" className="hover:text-primary transition-colors">Security</a>
                            <a href="#" className="hover:text-primary transition-colors">Terms</a>
                        </div>
                        <div className="flex items-center space-x-2 text-sm font-bold">
                            <span className="text-gray-400">🇺🇸</span>
                            <span>English</span>
                        </div>
                    </div>

                    {/* Simulation Links Hidden for Clean Look but accessible */}
                    <div className="mt-12 pt-8 border-t border-gray-50 opacity-20 hover:opacity-100 transition-opacity flex justify-center space-x-4">
                        <Link to="/reset-password?token=123456" className="text-[10px] text-gray-400 uppercase tracking-widest hover:text-primary">Simulation: Password Reset</Link>
                        <Link to="/reset-pin?token=4" className="text-[10px] text-gray-400 uppercase tracking-widest hover:text-primary">Simulation: PIN Reset</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;