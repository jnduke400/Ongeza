// FIX: Removed self-import of UserRole to resolve declaration conflict.


export enum UserRole {
  Borrower = 'borrower',
  Saver = 'saver',
  GroupAdmin = 'group_admin',
  Investor = 'investor',
  PlatformAdmin = 'platform_admin',
}

export enum OnboardingType {
  None = '',
  Borrower = 'Borrower',
  Saver = 'Saver',
  Group = 'Group',
  Investor = 'Investor',
}

export enum OnboardingStatus {
    Pending = 'PENDING',
    Approved = 'APPROVED',
    Rejected = 'REJECTED',
}

export interface ApprovalAction {
    id: number;
    approvalRequestId: number;
    stepId: number;
    stepOrder: number;
    actorUserId: number;
    action: string;
    comments: string;
    actionTimestamp: string;
}

export interface OnboardingRequest {
  id: string;
  user: {
    firstName: string;
    lastName: string;
    phone: string;
    avatar: string;
    email?: string;
  };
  type: OnboardingType;
  submissionDate: string; // ISO String
  status: OnboardingStatus;
  canApprove?: boolean; // Added for API integration
  onboardingRequestData?: string; // JSON string containing raw data
  actions?: ApprovalAction[]; // History of actions
  details: {
      // Common
      region?: string;
      district?: string;
      documents?: { type: string; url: string }[];
      dateOfBirth?: string;
      gender?: 'Male' | 'Female' | 'Other';
      occupation?: string;
      
      // Borrower
      loanProduct?: LoanProduct;
      
      // Saver (Individual)
      savingGoal?: string;
      targetAmount?: number;
      deadline?: string;

      // Group
      groupName?: string;
      expectedMembers?: number;
      minContribution?: number;
      withdrawalPolicy?: string;
      termsAndConditions?: string;

      // Investor
      investmentAmount?: number;
  };
}

export interface OnboardingDocument {
    id: number;
    documentType: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    contentType: string;
    uploadedAt: string;
    createdAt: string;
}


export enum LoanProduct {
    Personal = 'Personal Emergency Loan',
    Business = 'Business Loan',
    Education = 'Education Loan',
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  avatar: string;
  isSolo?: boolean;
  isOnboarded?: boolean;
  onboardingStatus?: string;
  pinSet?: boolean;
  twoFaSetupRequired?: boolean;
  goalsCount?: number;
  goalAchievementRate?: number;
  loginCount?: number;
  currency?: string;
}

export interface LoanApplication {
  id: string;
  borrowerName: string;
  amount: number;
  purpose: string;
  creditScore: number;
  status: 'Pending' | 'Funded' | 'Rejected';
  fundingProgress: number;
}

export interface SavingsGoal {
    id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    details?: string;
    icon?: string;
    contributionCount?: number;
    daysRemaining?: number;
}

export interface DepositAnalysis {
    period: string;
    amount: number;
    periodStart: string;
    periodEnd: string;
    periodsAgo: number;
}

export interface Transaction {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'deposit' | 'withdrawal' | 'repayment' | 'interest' | 'credit' | 'group_contribution';
    status: 'Completed' | 'Pending' | 'Failed';
}

export interface UpcomingPayment {
    id: string;
    name: string;
    dueDate: string;
    amount: number;
    category: 'rent' | 'utilities' | 'loan';
}

export interface GroupSaving {
    id: string;
    name: string;
    avatar: string;
    currentAmount: number;
    targetAmount: number;
    members: {
        id: string;
        avatar: string;
        name: string;
    }[];
}

export interface GroupTransaction {
    id: string;
    transactionId: string;
    member: {
        id: string;
        name: string;
        avatar: string;
    };
    date: string; // ISO String
    paymentType: 'Contribution' | 'Withdrawal' | 'Fee' | 'Interest';
    amount: number; // Always positive
    type: 'Income' | 'Outcome';
    status: 'Completed' | 'Pending' | 'Failed';
}


export interface ActivityDataPoint {
    name: string;
    Payments: number;
    Transfer: number;
}

export interface MemberGoal {
    id: string;
    name: string;
    icon: string;
    progress: number;
    color: string;
}

export interface PendingContribution {
  id: string;
  member: {
      id: string;
      name: string;
      avatar: string;
  };
  amount: number;
  dueDate: string;
}

export interface GroupSavingDetail extends GroupSaving {
    balance: number;
    transactions: GroupTransaction[];
    activity: {
        daily: ActivityDataPoint[];
        weekly: ActivityDataPoint[];
        monthly: ActivityDataPoint[];
        yearly: ActivityDataPoint[];
    };
    memberGoals: MemberGoal[];
    pendingContributions: PendingContribution[];
}

export interface GoalActivityTransaction {
    id: number;
    transactionId: string;
    date: string;
    description: string;
    amount: number;
    type: 'Income' | 'Outcome';
    source: 'Mobile Money' | 'Card' | 'Bank Transfer' | 'Interest';
    status: 'Completed' | 'Pending' | 'Failed';
    goalId: string;
}

export interface GroupMemberSummary {
  memberId: string;
  memberName: string;
  memberAvatar: string;
  totalContributed: number;
  totalWithdrawn: number;
  netContribution: number;
  transactionCount: number;
}

export interface GoalSummaryItem {
  source: 'Mobile Money' | 'Card' | 'Bank Transfer' | 'Interest';
  totalAmount: number;
  transactionCount: number;
  averageAmount: number;
  lastTransactionDate: string;
}

export interface UserForManagement {
  id: string;
  user: {
    name: string;
    email: string;
    avatar: string;
  };
  role: 'Admin' | 'Manager' | 'User' | 'Maintainer' | 'Author' | 'Investor';
  category: 'Borrower' | 'Saver' | 'Group Admin' | 'Admin' | 'Investor';
  phone: string;
  status: 'Active' | 'Inactive' | 'Pending' | 'Dormant' | 'Suspended' | 'Locked';
  pinSet?: boolean;
}

export interface UserGoal {
  id: string;
  name: string;
  type: string;
  icon: string;
  progress: number;
}

export interface UserDetail extends UserForManagement {
  details: {
    username: string;
    billingEmail: string;
    status: string;
    role: string;
    taxId: string;
    contact: string;
    language: string;
    country: string;
    address?: string;
    state?: string;
    zipCode?: string;
  };
  stats: {
    goalsCompleted: number;
    tasksCompleted: string;
  };
  goals: UserGoal[];
}

export interface Permission {
  id: string;
  name: string;
  assignedTo: string[];
  createdDate: string;
}

export interface DocumentType {
  id: string | number;
  name: string;
  description: string;
  fileTypes: string[];
  isCore?: boolean;
}

export interface DocumentGroup {
  id: string | number;
  name: string;
  documentTypeName: string;
}

export interface ApprovalFlow {
  id: number | string;
  name: string;
  approvableType: string;
  createdAt: string;
  // Fields from API response, optional to not break mocks
  flowName?: string;
  entityType?: EntityType | string;
  active?: boolean;
}

export interface EntityType {
  id: number;
  name: string;
  displayName: string;
  description: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// FIX: Added ApiApprovalFlow interface to be used across pages.
export interface ApiApprovalFlow {
    id: number;
    flowName: string;
    entityType: EntityType;
    active: boolean;
    steps: null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}


export interface ApprovalFlowStep {
  id: string;
  flowId: string;
  roleId: number;
  role: string;
  order: number;
  action: string;
  status: 'Active' | 'Inactive';
  description?: string | null;
}

export interface ApiApprovalStep {
    id: number;
    flowId: number;
    roleId: number;
    allowedActions: string[];
    stepOrder: number;
    description: string | null;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Module {
  id: string;
  name: string;
  description: string;
  mobileApp: boolean;
  type: 'Loan' | 'Saving' | 'Investment' | 'Other';
}

export interface Deposit {
  id: string;
  requestTime: string; // ISO String
  depositorName: string;
  accountNumber: string;
  reference: string;
  phoneNumber: string;
  receiptNumber: string;
  partner: string;
  amount: number;
  currency: string;
}

export interface Loan {
  id: string;
  date: string; // ISO String
  transactionNo: string;
  clientName: string;
  accountNumber: string;
  interestPeriod: string; // e.g., '30 Days'
  interestRate: number; // Percentage
  amount: number;
  currency: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Paid';
  deadline: string; // ISO String
}

export interface LoanRepayment {
  id: string;
  repaymentDate: string; // ISO String
  clientName: string;
  accountNumber: string;
  paymentReference: string;
  status: 'Completed' | 'Pending' | 'Failed';
  amount: number;
  currency: string;
}

export interface LoanOverview {
  id: string; // for React key
  loanId: string;
  amount: number;
  borrowingDate: string; // ISO String
  repaymentDate: string; // ISO String
  outstandingBalance: number;
  status: 'Approved' | 'Pending' | 'Overdue' | 'Completed';
  currency: string;
}

export interface LoanTransactionReportItem {
  id: number;
  transactionId: string;
  date: string; // ISO String
  channelName: string; // e.g. Card, Mobile Money
  amount: number;
  type: 'Income' | 'Outcome';
  paymentType: 'Loan acquisition' | 'Loan Payment' | 'Interest payment' | 'Late fee';
  status: 'Completed' | 'Pending' | 'Cancelled';
  loanType: string;
  reference: string;
}

export interface LedgerEntry {
    id: string;
    transactionId: string;
    date: string;
    description: string;
    amount: number;
    type: 'deposit' | 'withdrawal' | 'repayment' | 'interest' | 'credit' | 'group_contribution';
    status: 'Completed' | 'Pending' | 'Failed';
    beforeBalance: number;
    afterBalance: number;
}

export interface ApiRole {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  permissionCount: number;
  userCount: number;
}

export interface ApiPermission {
  id: number;
  name: string;
  description: string;
  permissionGroup: string;
  roleNames: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiGroup {
  id: number;
  name: string;
  description: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiDocumentType {
  id: number;
  name: string;
  code?: string;
  description: string;
  fileType: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiDocumentGroup {
    id: number;
    group: ApiGroup;
    documentType: ApiDocumentType;
    active: boolean;
    createdAt: string;
    updatedAt: string;
}