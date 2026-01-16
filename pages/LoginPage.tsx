import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircleDollarSign, Eye, EyeOff, Facebook, Twitter, Github } from 'lucide-react';

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path>
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path>
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path>
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.574l6.19,5.238C39.712,34.464,44,28.7,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
    </svg>
);

const DotPattern = () => (
    <div className="absolute w-48 h-48 -z-10">
        <div className="grid grid-cols-6 gap-4">
            {Array.from({ length: 36 }).map((_, i) => (
                <div key={i} className="w-2 h-2 bg-gray-200 rounded-full"></div>
            ))}
        </div>
    </div>
);

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(username, password);
    
    setLoading(false);

    if (result.mustChangePasswordRedirect) {
        navigate('/force-password-change');
        return;
    }

    if (result.twoFaRedirect) {
        // Navigation is handled by AuthContext, so we just stop processing here.
        return;
    }

    if (!result.success) {
        if (result.code === '106') { // DORMANT
            navigate('/activate-account', { state: { message: result.message } });
            return;
        }
        setError(result.message);
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50 flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute -top-16 -right-16"><DotPattern /></div>
        <div className="absolute -bottom-16 -left-16"><DotPattern /></div>

        <div className="relative z-10 w-full max-w-md bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100">
            <div className="text-center mb-8">
                <div className="flex justify-center items-center gap-2 mb-4">
                    <CircleDollarSign size={32} className="text-primary" />
                    <h1 className="text-3xl font-bold text-primary">Ongeza</h1>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">Welcome to Ongeza! 👋</h2>
                <p className="text-gray-500 mt-2">Please sign-in to your account and start the adventure</p>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6 text-sm" role="alert">
                    <span className="block sm:inline">{error}</span>
                </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email or Username</label>
                    <input
                        type="text"
                        autoComplete="username"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                        placeholder="Enter your email or username"
                    />
                </div>
                <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
                        placeholder="············"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-gray-400 hover:text-gray-600">
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
                <div className="flex items-center justify-between text-sm">
                    <label className="flex items-center">
                        <input type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                        <span className="ml-2 text-gray-600">Remember Me</span>
                    </label>
                    <Link to="/forgot-password" className="font-medium text-primary hover:text-primary-dark">
                        Forgot Password?
                    </Link>
                </div>
                <div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-primary-light"
                    >
                         {loading ? 'Signing in...' : 'Login'}
                    </button>
                </div>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
                New on our platform?{' '}
                <Link to="/onboarding" className="font-medium text-primary hover:text-primary-dark">
                    Create an account
                </Link>
            </p>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or</span>
                </div>
            </div>

            <div className="flex justify-center space-x-4">
                <a href="#" className="p-2 border border-gray-300 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                    <Facebook size={20} />
                </a>
                 <a href="#" className="p-2 border border-gray-300 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                    <Twitter size={20} />
                </a>
                 <a href="#" className="p-2 border border-gray-300 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                    <Github size={20} />
                </a>
                 <a href="#" className="p-2 border border-gray-300 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                    <GoogleIcon />
                </a>
            </div>
        </div>
    </div>
  );
};

export default LoginPage;