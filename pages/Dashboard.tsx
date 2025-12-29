import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import InvestorDashboard from '../components/dashboards/InvestorDashboard';
import BorrowerDashboard from '../components/dashboards/BorrowerDashboard';
import SaverDashboard from '../components/dashboards/SaverDashboard';

const Dashboard: React.FC = () => {
    const { user } = useAuth();

    switch (user?.role) {
        case UserRole.PlatformAdmin:
            return <AdminDashboard />;
        case UserRole.Investor:
            return <InvestorDashboard />;
        case UserRole.Borrower:
            return <BorrowerDashboard />;
        case UserRole.Saver:
            return <SaverDashboard />;
        case UserRole.GroupAdmin: // Falls through to Saver dashboard
            return <SaverDashboard />;
        default:
            return <div className="p-8">Welcome! Your dashboard is not configured yet.</div>;
    }
};

export default Dashboard;