import React, { useState, useEffect } from 'react';
// FIX: Using namespace import for react-router-dom to handle potential module resolution issues.
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import OnboardingPage from './pages/OnboardingPage';
import SaverOnboardingPage from './pages/SaverOnboardingPage';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import MyWalletPage from './pages/MyWalletPage';
import DashboardLayout from './components/layout/DashboardLayout';
import ActivityPage from './pages/ActivityPage';
import GroupSavingPage from './pages/GroupSavingPage';
import GroupSavingDetailPage from './pages/GroupSavingDetailPage';
import PendingContributionsPage from './pages/PendingContributionsPage';
import ContributionsPage from './pages/ContributionsPage';
// FIX: Added missing import for MyContributionsPage.
import MyContributionsPage from './pages/MyContributionsPage';
import MembersPage from './pages/MembersPage';
import ActivityDetailPage from './pages/ActivityDetailPage';
import MemberDetailPage from './pages/MemberDetailPage';
import GoalsPage from './pages/GoalsPage';
import GoalDetailPage from './pages/GoalDetailPage';
import GoalTransactionDetailsPage from './pages/GoalTransactionDetailsPage';
import GroupTransactionDetailsPage from './pages/GroupTransactionDetailsPage';
import GroupSummaryReportPage from './pages/GroupSummaryReportPage';
import GoalSummaryReportPage from './pages/GoalSummaryReportPage';
import SettingsPage from './pages/SettingsPage';
import ModuleConfigsPage from './pages/ModuleConfigsPage';
import ProfilePage from './pages/ProfilePage';
import UsersPage from './pages/UsersPage';
import UserDetailPage from './pages/UserDetailPage';
import RolesPage from './pages/RolesPage';
import RoleDetailPage from './pages/RoleDetailPage';
import PermissionsPage from './pages/PermissionsPage';
import OnboardingRequestsPage from './pages/OnboardingRequestsPage';
import OnboardingDetailPage from './pages/OnboardingDetailPage';
import DocumentTypesPage from './pages/DocumentTypesPage';
import DocumentGroupsPage from './pages/DocumentGroupsPage';
import ApprovalFlowsPage from './pages/ApprovalFlowsPage';
import ApprovalFlowDetailPage from './pages/ApprovalFlowDetailPage';
import ModulesPage from './pages/ModulesPage';
import DepositsPage from './pages/DepositsPage';
import LoansPage from './pages/LoansPage';
import LoanRepaymentsPage from './pages/LoanRepaymentsPage';
import ApplyPage from './pages/ApplyPage';
import LoanTypesPage from './pages/LoanTypesPage';
import LoanClassificationPage from './pages/LoanClassificationPage';
import LoanDetailsPage from './pages/LoanDetailsPage';
import LoanApplicationFormPage from './pages/LoanApplicationFormPage';
import LoanPackagesPage from './pages/LoanPackagesPage';
import PackageDocumentsPage from './pages/PackageDocumentsPage';
import LoanListPage from './pages/LoanListPage';
import LoanTransactionsPage from './pages/LoanTransactionsPage';
import LoanTransactionDetailPage from './pages/LoanTransactionDetailPage';
import SavingsPage from './pages/SavingsPage';
import WithdrawalsPage from './pages/WithdrawalsPage';
// FIX: Use a named import for FaqPage to match its named export.
import { FaqPage } from './pages/FaqPage';
import ContactPage from './pages/ContactPage';
// FIX: Use a named import for LedgerPage to match its named export.
import { LedgerPage } from './pages/LedgerPage';
import ActivateAccountPage from './pages/ActivateAccountPage';
import PinSetupPage from './pages/PinSetupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ForcePasswordChangePage from './pages/ForcePasswordChangePage';
import ResetPinPage from './pages/ResetPinPage';
import PinVerificationPage from './pages/PinVerificationPage';
import TwoFactorAuthPage from './pages/TwoFactorAuthPage';
import TwoFactorSetupPage from './pages/TwoFactorSetupPage';
import CheckoutPage from './pages/CheckoutPage';
import { UserRole } from './types';
import SessionExpiryModal from './components/common/SessionExpiryModal';
import OnboardingStatusPage from './pages/OnboardingStatusPage';
import MessagesPage from './pages/MessagesPage';

// A wrapper for protected routes
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Handle ONBOARDING status for any user role
  if (user.onboardingStatus === 'ONBOARDING' && location.pathname !== '/onboarding-status') {
      return <Navigate to="/onboarding-status" replace />;
  }

  // Handle NOT_ONBOARDED status for Savers
  if (user.role === UserRole.Saver && user.onboardingStatus === 'NOT_ONBOARDED' && location.pathname !== '/complete-onboarding') {
      return <Navigate to="/complete-onboarding" replace />;
  }
  
  // Prevent ONBOARDED users from accessing onboarding/status pages
  if (user.onboardingStatus === 'ONBOARDED' && (location.pathname === '/complete-onboarding' || location.pathname === '/onboarding-status')) {
      return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

// A wrapper for public routes that redirects if the user is authenticated
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }
    return <>{children}</>;
};

// A component to handle the root route logic
const RootRedirect: React.FC = () => {
    const { user } = useAuth();
    return user ? <Navigate to="/dashboard" replace /> : <LandingPage />;
};

const AppContent: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/onboarding" element={<PublicRoute><OnboardingPage /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/verify-2fa" element={<PublicRoute><TwoFactorAuthPage /></PublicRoute>} />
            <Route path="/activate-account" element={<PublicRoute><ActivateAccountPage /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
            <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
            <Route path="/force-password-change" element={<PublicRoute><ForcePasswordChangePage /></PublicRoute>} />
            <Route path="/reset-pin" element={<PublicRoute><ResetPinPage /></PublicRoute>} />
            <Route path="/verify-pin" element={<PinVerificationPage />} />
            
            {/* Post-login, mandatory onboarding for savers */}
            <Route 
                path="/complete-onboarding" 
                element={
                    <ProtectedRoute>
                        <SaverOnboardingPage />
                    </ProtectedRoute>
                } 
            />

            {/* NEW ROUTE for ONBOARDING status */}
            <Route
                path="/onboarding-status"
                element={
                    <ProtectedRoute>
                        <OnboardingStatusPage />
                    </ProtectedRoute>
                }
            />

            <Route 
                path="/dashboard" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <Dashboard />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/my-wallet" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <MyWalletPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/checkout" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <CheckoutPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/apply" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <ApplyPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/loans/packages" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <LoanPackagesPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/loans/packages/:packageId" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <PackageDocumentsPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/loan-types" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <LoanTypesPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/loan-types/:loanType" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <LoanClassificationPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/loan-types/:loanType/:classificationSlug" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <LoanDetailsPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/loan-application-form/classification/:loanType/:classificationSlug" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <LoanApplicationFormPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
             <Route 
                path="/loan-application-form/package/:packageId" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <LoanApplicationFormPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/activity" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <ActivityPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/goals" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <GoalsPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/goals/:goalId" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <GoalDetailPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/goals/:goalId/transactions" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <GoalTransactionDetailsPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/goals/:goalId/summary" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <GoalSummaryReportPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
             <Route 
                path="/activity/:transactionId" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <ActivityDetailPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
             <Route 
                path="/my-contributions" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <MyContributionsPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
             <Route 
                path="/contributions" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <ContributionsPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/contributions/:contributionId" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <ActivityDetailPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/members" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <MembersPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/members/:memberId" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <MemberDetailPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/group-saving" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <GroupSavingPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/group-saving/:groupId" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <GroupSavingDetailPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/group-saving/:groupId/pending-contributions" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <PendingContributionsPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
             <Route 
                path="/group-saving/:groupId/transactions" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <GroupTransactionDetailsPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/group-saving/:groupId/summary" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <GroupSummaryReportPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
             <Route 
                path="/settings" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <SettingsPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/configurations/module-configs" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <ModuleConfigsPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/profile" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <ProfilePage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
             <Route 
                path="/configurations/document-types" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <DocumentTypesPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/configurations/document-groups" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <DocumentGroupsPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
             <Route 
                path="/configurations/modules" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <ModulesPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/configurations/approval-flows" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <ApprovalFlowsPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/configurations/approval-flows/:flowId" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <ApprovalFlowDetailPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/users/list" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <UsersPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/users/roles" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <RolesPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/users/roles/:roleId" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <RoleDetailPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/users/permissions" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <PermissionsPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/users/:userId" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <UserDetailPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/onboarding/requests" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <OnboardingRequestsPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/onboarding/requests/:requestId" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <OnboardingDetailPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/reports/loan-list" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <LoanListPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/reports/transactions" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <LoanTransactionsPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
             <Route 
                path="/reports/transactions/:transactionId" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <LoanTransactionDetailPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/reports/deposits" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <DepositsPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/reports/loans" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <LoansPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/reports/loan-repayments" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <LoanRepaymentsPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/reports/savings" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <SavingsPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/reports/withdrawals" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <WithdrawalsPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/reports/ledger" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <LedgerPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
             <Route 
                path="/faq" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <FaqPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/contact" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <ContactPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/set-pin" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <PinSetupPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/setup-2fa" 
                element={
                    <ProtectedRoute>
                        <TwoFactorSetupPage />
                    </ProtectedRoute>
                } 
            />
            <Route 
                path="/messages" 
                element={
                    <ProtectedRoute>
                        <DashboardLayout>
                            <MessagesPage />
                        </DashboardLayout>
                    </ProtectedRoute>
                } 
            />
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};


const App: React.FC = () => {
  const [sessionModalState, setSessionModalState] = useState({
    isOpen: false,
    pinSet: false,
    fromPath: '/',
  });

  useEffect(() => {
    const handleSessionExpired = (event: Event) => {
        const customEvent = event as CustomEvent;
        const { pinSet, from } = customEvent.detail;
        setSessionModalState({
            isOpen: true,
            pinSet: pinSet,
            fromPath: from,
        });
    };

    window.addEventListener('sessionExpired', handleSessionExpired);

    return () => {
        window.removeEventListener('sessionExpired', handleSessionExpired);
    };
  }, []);

  return (
    <HashRouter>
        <AuthProvider>
            <AppContent />
            <SessionExpiryModal 
                isOpen={sessionModalState.isOpen}
                pinSet={sessionModalState.pinSet}
                fromPath={sessionModalState.fromPath}
                onClose={() => setSessionModalState(prev => ({ ...prev, isOpen: false }))}
            />
        </AuthProvider>
    </HashRouter>
  );
};

export default App;