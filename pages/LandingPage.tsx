import React from 'react';
// FIX: Using namespace import for react-router-dom to handle potential module resolution issues.
import { Link } from 'react-router-dom';
import { ShieldCheck, TrendingUp, Users, ArrowRight } from 'lucide-react';

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300">
    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-primary-light text-primary-dark mb-4">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
    <p className="text-gray-600">{description}</p>
  </div>
);

const LandingPage: React.FC = () => {
  return (
    <div className="bg-background min-h-screen text-on-surface">
      {/* Header */}
      <header className="bg-surface shadow-sm">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">PesaFlow</div>
          <div>
            <Link to="/login" className="text-gray-600 hover:text-primary mr-4">Log In</Link>
            <Link to="/onboarding" className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-full transition-colors duration-300">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
          Financial Growth for Everyone in Tanzania.
        </h1>
        <h2 className="text-xl font-bold text-primary mt-2">PesaFlow Micro-Lending & Savings</h2>
        <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
          Securely save, access fair loans, and invest in your community's future. PesaFlow makes managing your money simple, accessible, and rewarding.
        </p>
        <Link to="/onboarding" className="mt-8 inline-flex items-center bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-full text-lg transition-colors duration-300 shadow-lg">
          Join PesaFlow Today <ArrowRight className="ml-2 h-5 w-5" />
        </Link>
      </main>

      {/* Features Section */}
      <section className="bg-sky-100 py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How PesaFlow Empowers You</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<TrendingUp size={24} />}
              title="Micro-Savings"
              description="Start saving with any amount. No minimum balance, no hidden fees. Watch your savings grow with competitive interest."
            />
            <FeatureCard
              icon={<ShieldCheck size={24} />}
              title="Micro-Lending"
              description="Access fair and transparent loans for your business or personal needs. Quick approval process using alternative credit scoring."
            />
            <FeatureCard
              icon={<Users size={24} />}
              title="Community Investing"
              description="Become an investor and fund loans for local entrepreneurs. Earn returns while making a positive impact in your community."
            />
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20">
          <div className="container mx-auto px-6">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Simple Steps to Financial Freedom</h2>
              <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
                  <div className="text-center max-w-xs">
                      <div className="bg-secondary-light text-secondary-dark rounded-full h-16 w-16 flex items-center justify-center mx-auto text-2xl font-bold">1</div>
                      <h3 className="text-xl font-semibold mt-4 mb-2">Create Account</h3>
                      <p className="text-gray-600">Choose your path - Saver, Borrower, or Investor - and complete our simple onboarding.</p>
                  </div>
                   <div className="text-2xl text-gray-300 hidden md:block">&rarr;</div>
                  <div className="text-center max-w-xs">
                      <div className="bg-secondary-light text-secondary-dark rounded-full h-16 w-16 flex items-center justify-center mx-auto text-2xl font-bold">2</div>
                      <h3 className="text-xl font-semibold mt-4 mb-2">Get Verified</h3>
                      <p className="text-gray-600">Our secure KYC process ensures a safe platform for everyone. Approval is fast and easy.</p>
                  </div>
                   <div className="text-2xl text-gray-300 hidden md:block">&rarr;</div>
                  <div className="text-center max-w-xs">
                      <div className="bg-secondary-light text-secondary-dark rounded-full h-16 w-16 flex items-center justify-center mx-auto text-2xl font-bold">3</div>
                      <h3 className="text-xl font-semibold mt-4 mb-2">Start Transacting</h3>
                      <p className="text-gray-600">Deposit savings, apply for loans, or fund opportunities directly from your dashboard.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <div className="text-2xl font-bold text-primary mb-4">PesaFlow</div>
              <p className="text-gray-400 max-w-sm">Empowering Tanzanian entrepreneurs and individuals through accessible and affordable micro-financial services.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/login" className="hover:text-primary">Login</Link></li>
                <li><Link to="/onboarding" className="hover:text-primary">Register</Link></li>
                <li><Link to="/faq" className="hover:text-primary">FAQs</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/terms" className="hover:text-primary hover:underline">Terms of Service</Link></li>
                <li><Link to="/privacy" className="hover:text-primary hover:underline">Privacy Policy</Link></li>
                <li><Link to="/contact" className="hover:text-primary">Contact Us</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">&copy; 2025 PesaFlow. All rights reserved.</p>
            <div className="flex items-center space-x-4">
              <Link to="/reset-password?token=123456" className="text-xs text-gray-600 hover:text-gray-400 border border-gray-700 px-3 py-1 rounded transition-colors">
                Simulation: Password Reset
              </Link>
              <Link to="/reset-pin?token=4" className="text-xs text-gray-600 hover:text-gray-400 border border-gray-700 px-3 py-1 rounded transition-colors">
                Simulation: PIN Reset (Token 4)
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;