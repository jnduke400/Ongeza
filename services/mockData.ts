



import { User, UserRole, LoanApplication, SavingsGoal, Transaction, UpcomingPayment, GroupSaving, GroupSavingDetail, PendingContribution, GoalActivityTransaction, ActivityDataPoint, GroupTransaction, GroupMemberSummary, GoalSummaryItem, UserForManagement, UserDetail, UserGoal, Permission, OnboardingRequest, OnboardingType, OnboardingStatus, LoanProduct, DocumentType, DocumentGroup, ApprovalFlow, ApprovalFlowStep, Module, Deposit, Loan, LoanRepayment, LoanOverview, LoanTransactionReportItem, LedgerEntry } from '../types';

export const mockAdmin: User = {
  id: 'admin01',
  firstName: 'Admin',
  lastName: 'User',
  email: 'admin@pesaflow.com',
  role: UserRole.PlatformAdmin,
  avatar: 'https://i.pravatar.cc/150?u=admin01',
  isOnboarded: true,
};

export const mockInvestor: User = {
  id: 'investor01',
  firstName: 'Amina',
  lastName: 'Chande',
  email: 'amina.c@email.com',
  role: UserRole.Investor,
  avatar: 'https://i.pravatar.cc/150?u=investor01',
  isOnboarded: true,
};

export const mockBorrower: User = {
  id: 'borrower01',
  firstName: 'Juma',
  lastName: 'Hassan',
  email: 'juma.h@email.com',
  role: UserRole.Borrower,
  avatar: 'https://i.pravatar.cc/150?u=borrower01',
  isOnboarded: true,
};

export const mockSaver: User = {
  id: 'saver01',
  firstName: 'Piko',
  lastName: 'Khamis',
  email: 'fatma.k@email.com',
  role: UserRole.Saver,
  avatar: 'https://i.pravatar.cc/150?u=saver01',
  isSolo: true,
  isOnboarded: false,
};

export const mockGroupAdmin: User = {
  id: 'groupadmin01',
  firstName: 'Asha',
  lastName: 'Juma',
  email: 'asha.j@email.com',
  role: UserRole.GroupAdmin,
  avatar: 'https://i.pravatar.cc/150?u=groupadmin01',
  isSolo: false,
  isOnboarded: true,
};


export const mockLoanApplications: LoanApplication[] = [
  { id: 'loan001', borrowerName: 'John Doe', amount: 500000, purpose: 'Small Business Inventory', creditScore: 720, status: 'Pending', fundingProgress: 40 },
  { id: 'loan002', borrowerName: 'Jane Smith', amount: 250000, purpose: 'Emergency Medical Bills', creditScore: 680, status: 'Pending', fundingProgress: 80 },
  { id: 'loan003', borrowerName: 'Peter Jones', amount: 1200000, purpose: 'Tuk-tuk Purchase', creditScore: 750, status: 'Funded', fundingProgress: 100 },
  { id: 'loan004', borrowerName: 'Mary Williams', amount: 300000, purpose: 'School Fees', creditScore: 650, status: 'Rejected', fundingProgress: 10 },
  { id: 'loan005', borrowerName: 'David Brown', amount: 800000, purpose: 'Farm Equipment Repair', creditScore: 710, status: 'Pending', fundingProgress: 65 },
];

export const mockOnboardingRequests: OnboardingRequest[] = [
  {
    id: 'obr001',
    user: { firstName: 'Amani', lastName: 'Mwamba', phone: '0712 345 678', avatar: 'https://i.pravatar.cc/150?u=obr001' },
    type: OnboardingType.Borrower,
    submissionDate: '2025-08-04T10:30:00Z',
    status: OnboardingStatus.Pending,
    details: { 
      loanProduct: LoanProduct.Business, 
      region: 'Dar es Salaam', 
      district: 'Kinondoni',
      documents: [{ type: 'National ID', url: '/mock-docs/national_id.pdf' }]
    },
  },
  {
    id: 'obr010',
    user: { 
      firstName: 'Amani', 
      lastName: 'Mpya', 
      phone: '+255799887766', 
      avatar: 'https://i.pravatar.cc/150?u=obr010',
      email: 'amani.mpya@example.com' 
    },
    type: OnboardingType.Saver,
    submissionDate: new Date().toISOString(),
    status: OnboardingStatus.Pending,
    details: {},
  },
  {
    id: 'obr009',
    user: { firstName: 'Zawadi', lastName: 'Kipusa', phone: '0719 876 543', avatar: 'https://i.pravatar.cc/150?u=obr009' },
    type: OnboardingType.Saver,
    submissionDate: new Date().toISOString(),
    status: OnboardingStatus.Pending,
    details: {
        region: 'Dar es Salaam',
        district: 'Kinondoni',
        documents: [
            { type: 'National ID', url: '/mock-docs/new_saver_id.pdf' },
            { type: 'Voter\'s ID', url: '/mock-docs/new_saver_voter_id.pdf' }
        ],
        dateOfBirth: '1995-05-15',
        gender: 'Female',
        occupation: 'Software Developer'
    }
  },
  {
    id: 'obr002',
    user: { firstName: 'Baraka', lastName: 'Suleiman', phone: '0755 123 456', avatar: 'https://i.pravatar.cc/150?u=obr002' },
    type: OnboardingType.Saver,
    submissionDate: '2025-08-04T09:15:00Z',
    status: OnboardingStatus.Pending,
    details: { 
      region: 'Arusha', 
      district: 'Arusha City',
      documents: [{ type: 'Passport', url: '/mock-docs/passport.pdf' }],
      savingGoal: 'Buy a new laptop',
      targetAmount: 2500000,
      deadline: '2026-12-31'
    },
  },
  {
    id: 'obr003',
    user: { firstName: 'Cheche', lastName: 'Makame', phone: '0688 987 654', avatar: 'https://i.pravatar.cc/150?u=obr003' },
    type: OnboardingType.Investor,
    submissionDate: '2025-08-03T18:00:00Z',
    status: OnboardingStatus.Approved,
    details: { 
      investmentAmount: 5000000, 
      region: 'Mwanza', 
      district: 'Ilemela',
      documents: [
        { type: 'Driver\'s License', url: '/mock-docs/license.pdf' },
        { type: 'Bank Statement', url: '/mock-docs/bank_statement.pdf' },
        { type: 'Debt Clearance', url: '/mock-docs/debt_clearance.pdf' }
      ]
    },
  },
  {
    id: 'obr004',
    user: { firstName: 'Dalila', lastName: 'Hamisi', phone: '0711 223 344', avatar: 'https://i.pravatar.cc/150?u=obr004' },
    type: OnboardingType.Group,
    submissionDate: '2025-08-03T15:20:00Z',
    status: OnboardingStatus.Pending,
    details: { 
      groupName: 'Mshikamano VICOBA', 
      region: 'Dodoma', 
      district: 'Dodoma Urban',
      expectedMembers: 20,
      minContribution: 10000,
      withdrawalPolicy: 'Withdrawals are only permitted once a month with group admin approval.',
      termsAndConditions: 'All members must contribute by the 5th of each month.'
    },
  },
  {
    id: 'obr005',
    user: { firstName: 'Elias', lastName: 'Nchimbi', phone: '0765 445 566', avatar: 'https://i.pravatar.cc/150?u=obr005' },
    type: OnboardingType.Borrower,
    submissionDate: '2025-08-02T11:45:00Z',
    status: OnboardingStatus.Rejected,
    details: { 
        loanProduct: LoanProduct.Personal, 
        region: 'Mbeya', 
        district: 'Mbeya',
        documents: [{ type: 'National ID', url: '/mock-docs/national_id_2.pdf' }]
    },
  },
  {
    id: 'obr006',
    user: { firstName: 'Farida', lastName: 'Bakari', phone: '0655 778 899', avatar: 'https://i.pravatar.cc/150?u=obr006' },
    type: OnboardingType.Saver,
    submissionDate: '2025-08-02T09:00:00Z',
    status: OnboardingStatus.Approved,
    details: { 
        region: 'Zanzibar', 
        district: 'Mjini',
        documents: [{ type: 'Passport', url: '/mock-docs/passport_2.pdf' }],
        savingGoal: 'Emergency Fund',
        targetAmount: 1000000,
        deadline: '2027-01-01'
    },
  },
  {
    id: 'obr007',
    user: { firstName: 'Ghasia', lastName: 'Juma', phone: '0788 112 233', avatar: 'https://i.pravatar.cc/150?u=obr007' },
    type: OnboardingType.Investor,
    submissionDate: '2025-08-01T14:10:00Z',
    status: OnboardingStatus.Pending,
    details: { 
        investmentAmount: 10000000, 
        region: 'Kilimanjaro', 
        district: 'Moshi Urban',
        documents: [
            { type: 'Driver\'s License', url: '/mock-docs/license_2.pdf'},
            { type: 'Bank Statement', url: '/mock-docs/bank_statement_2.pdf' }
        ]
    },
  },
  {
    id: 'obr008',
    user: { firstName: 'Hassan', lastName: 'Mohamed', phone: '0713 445 566', avatar: 'https://i.pravatar.cc/150?u=obr008' },
    type: OnboardingType.Borrower,
    submissionDate: '2025-08-01T12:05:00Z',
    status: OnboardingStatus.Pending,
    details: { 
        loanProduct: LoanProduct.Education, 
        region: 'Morogoro', 
        district: 'Morogoro',
        documents: [{ type: 'National ID', url: '/mock-docs/national_id_3.pdf' }]
    },
  }
];

export const getOnboardingRequestById = (id: string): OnboardingRequest | undefined => {
    return mockOnboardingRequests.find(req => req.id === id);
};

export const mockSavingsGoals: SavingsGoal[] = [
    { id: 'sg01', name: 'User Experience Design', targetAmount: 1000, currentAmount: 720, deadline: '2025-12-31', details: '120 Tasks' },
    { id: 'sg02', name: 'Basic fundamentals', targetAmount: 1000, currentAmount: 480, deadline: '2026-06-30', details: '32 Tasks' },
    { id: 'sg03', name: 'React Native components', targetAmount: 1000, currentAmount: 150, deadline: '2026-12-31', details: '182 Tasks' },
    { id: 'sg04', name: 'Basic of music theory', targetAmount: 1000, currentAmount: 240, deadline: '2025-08-31', details: '56 Tasks' },
    { id: 'sg05', name: 'Boats', targetAmount: 1000, currentAmount: 800, deadline: '2027-12-31', details: '70 Tasks' },
    { id: 'sg06', name: 'New Laptop', targetAmount: 2500, currentAmount: 2500, deadline: '2025-07-31', details: '200 Tasks' },
];

export const mockTransactions: Transaction[] = [
    {id: 't01', date: '2025-08-03T10:00:00Z', description: 'Mobile Money Deposit', amount: 25000, type: 'deposit', status: 'Completed' },
    {id: 't05', date: '2025-08-02T14:00:00Z', description: 'Loan Credit', amount: 150000, type: 'credit', status: 'Completed' },
    {id: 't02', date: '2025-08-01T23:59:00Z', description: 'Interest Accrued', amount: 1250, type: 'interest', status: 'Completed' },
    {id: 't06', date: '2025-07-30T12:00:00Z', description: 'VICOBA Group Contribution', amount: 5000, type: 'group_contribution', status: 'Completed' },
    {id: 't03', date: '2025-07-28T09:00:00Z', description: 'Weekly Savings', amount: 10000, type: 'deposit', status: 'Completed' },
    {id: 't04', date: '2025-07-25T15:00:00Z', description: 'ATM Withdrawal', amount: -50000, type: 'withdrawal', status: 'Completed' },
    {id: 't07', date: '2025-07-22T11:00:00Z', description: 'Online Purchase', amount: -15000, type: 'withdrawal', status: 'Pending' },
    {id: 't08', date: '2025-07-20T10:00:00Z', description: 'Failed Deposit', amount: 20000, type: 'deposit', status: 'Failed' },
];

export const mockLedgerData: LedgerEntry[] = (() => {
    const sortedTransactions = [...mockTransactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let currentBalance = 100000; // Starting balance
    const ledger: LedgerEntry[] = [];

    sortedTransactions.forEach(tx => {
        const beforeBalance = currentBalance;
        let afterBalance = currentBalance;

        // Only completed transactions affect the balance
        if (tx.status === 'Completed') {
            afterBalance += tx.amount;
        }

        ledger.push({
            id: tx.id,
            transactionId: `LEDGER-${tx.id.toUpperCase()}`,
            date: tx.date,
            description: tx.description,
            amount: tx.amount,
            type: tx.type,
            status: tx.status,
            beforeBalance: beforeBalance,
            afterBalance: afterBalance
        });
        
        currentBalance = afterBalance;
    });

    return ledger.reverse(); // Show most recent first
})();

export const mockUpcomingPayments: UpcomingPayment[] = [
    { id: 'pay1', name: 'House Rent', dueDate: 'Due: 2025-09-01', amount: 350000, category: 'rent' },
    { id: 'pay2', name: 'Water Bill', dueDate: 'Due: 2025-09-05', amount: 25000, category: 'utilities' },
    { id: 'pay3', name: 'Electricity Bill', dueDate: 'Due: 2025-09-10', amount: 45000, category: 'utilities' },
];

export const mockInvestorPortfolio = {
    totalInvested: 1500000,
    activeInvestments: 3,
    interestEarned: 125000,
    repayments: [
        { loanId: 'loan003', borrowerName: 'Peter Jones', amount: 55000, date: '2025-08-01', status: 'Paid' },
        { loanId: 'loan001', borrowerName: 'John Doe', amount: 25000, date: '2025-09-01', status: 'Upcoming' },
    ]
}

export const mockBorrowerLoan = {
    loanAmount: 750000,
    amountRepaid: 150000,
    nextPaymentDate: '2025-09-01',
    nextPaymentAmount: 50000,
    interestRate: '15%',
};

export const tanzaniaRegions: { [key: string]: string[] } = {
  'Arusha': ['Arusha City', 'Arusha Rural', 'Karatu', 'Longido', 'Meru', 'Monduli', 'Ngorongoro'],
  'Dar es Salaam': ['Ilala', 'Kinondoni', 'Temeke', 'Kigamboni', 'Ubungo'],
  'Dodoma': ['Bahi', 'Chamwino', 'Chemba', 'Dodoma Urban', 'Kondoa', 'Kongwa', 'Mpwapwa'],
  'Geita': ['Bukombe', 'Chato', 'Geita', 'Mbogwe', 'Nyang\'hwale'],
  'Iringa': ['Iringa Urban', 'Iringa Rural', 'Kilolo', 'Mufindi'],
  'Kagera': ['Biharamulo', 'Bukoba Urban', 'Bukoba Rural', 'Karagwe', 'Kyerwa', 'Missenyi', 'Muleba', 'Ngara'],
  'Katavi': ['Mlele', 'Mpanda', 'Tanganyika'],
  'Kigoma': ['Buhigwe', 'Kakonko', 'Kasulu', 'Kibondo', 'Kigoma', 'Uvinza'],
  'Kilimanjaro': ['Hai', 'Moshi Urban', 'Moshi Rural', 'Mwanga', 'Rombo', 'Same', 'Siha'],
  'Lindi': ['Kilwa', 'Lindi', 'Liwale', 'Nachingwea', 'Ruangwa'],
  'Manyara': ['Babati', 'Hanang', 'Kiteto', 'Mbulu', 'Simanjiro'],
  'Mara': ['Bunda', 'Butiama', 'Musoma', 'Rorya', 'Serengeti', 'Tarime'],
  'Mbeya': ['Busokelo', 'Chunya', 'Kyela', 'Mbarali', 'Mbeya', 'Rungwe'],
  'Morogoro': ['Gairo', 'Kilombero', 'Kilosa', 'Morogoro', 'Mvomero', 'Ulanga'],
  'Mtwara': ['Masasi', 'Mtwara', 'Nanyumbu', 'Newala', 'Tandahimba'],
  'Mwanza': ['Ilemela', 'Kwimba', 'Magu', 'Misungwi', 'Nyamagana', 'Sengerema', 'Ukerewe'],
  'Njombe': ['Ludewa', 'Makambako', 'Makete', 'Njombe', 'Wanging\'ombe'],
  'Pwani': ['Bagamoyo', 'Kibaha', 'Kisarawe', 'Mafia', 'Mkuranga', 'Rufiji'],
  'Rukwa': ['Kalambo', 'Nkasi', 'Sumbawanga'],
  'Ruvuma': ['Mbinga', 'Namtumbo', 'Nyasa', 'Songea', 'Tunduru'],
  'Shinyanga': ['Kahama', 'Kishapu', 'Shinyanga'],
  'Simiyu': ['Bariadi', 'Busega', 'Itilima', 'Maswa', 'Meatu'],
  'Singida': ['Ikungi', 'Iramba', 'Manyoni', 'Mkalama', 'Singida'],
  'Songwe': ['Ileje', 'Mbozi', 'Momba', 'Songwe'],
  'Tabora': ['Igunga', 'Kaliua', 'Nzega', 'Sikonge', 'Tabora', 'Urambo', 'Uyui'],
  'Tanga': ['Handeni', 'Kilindi', 'Korogwe', 'Lushoto', 'Mkinga', 'Muheza', 'Pangani', 'Tanga City']
};

export const mockRegions = Object.keys(tanzaniaRegions);


export const mockGroupSavings: GroupSaving[] = [
    {
        id: 'gs01',
        name: 'Family Savings',
        avatar: 'https://placehold.co/100x100/10B981/FFFFFF/png?text=FS',
        currentAmount: 1200000,
        targetAmount: 2000000,
        members: [
            { id: 'saver01', avatar: 'https://i.pravatar.cc/150?u=saver01', name: 'Piko Khamis' },
            { id: 'u2', avatar: 'https://i.pravatar.cc/150?u=member2', name: 'Fiza Sahara' },
            { id: 'u3', avatar: 'https://i.pravatar.cc/150?u=member3', name: 'Her Sumalakabra' },
            { id: 'u4', avatar: 'https://i.pravatar.cc/150?u=member4', name: 'Ardias Elga' },
        ],
    },
    {
        id: 'gs02',
        name: 'Business Start-Up',
        avatar: 'https://placehold.co/100x100/0EA5E9/FFFFFF/png?text=BS',
        currentAmount: 3500000,
        targetAmount: 10000000,
        members: [
            { id: 'u5', avatar: 'https://i.pravatar.cc/150?u=member5', name: 'Member 5' },
            { id: 'u6', avatar: 'https://i.pravatar.cc/150?u=member6', name: 'Member 6' },
            { id: 'u7', avatar: 'https://i.pravatar.cc/150?u=member7', name: 'Member 7' },
        ],
    },
    {
        id: 'gs03',
        name: 'Holiday Fund',
        avatar: 'https://placehold.co/100x100/F59E0B/FFFFFF/png?text=HF',
        currentAmount: 450000,
        targetAmount: 500000,
        members: [
            { id: 'u8', avatar: 'https://i.pravatar.cc/150?u=member8', name: 'Member 8' },
            { id: 'u9', avatar: 'https://i.pravatar.cc/150?u=member9', name: 'Member 9' },
            { id: 'u10', avatar: 'https://i.pravatar.cc/150?u=member10', name: 'Member 10' },
            { id: 'u11', avatar: 'https://i.pravatar.cc/150?u=member11', name: 'Member 11' },
            { id: 'u12', avatar: 'https://i.pravatar.cc/150?u=member12', name: 'Member 12' },
        ],
    },
    {
        id: 'gs04',
        name: 'Education Fund',
        avatar: 'https://placehold.co/100x100/8B5CF6/FFFFFF/png?text=EF',
        currentAmount: 800000,
        targetAmount: 1500000,
        members: [
            { id: 'saver01', avatar: 'https://i.pravatar.cc/150?u=saver01', name: 'Piko Khamis' },
            { id: 'u14', avatar: 'https://i.pravatar.cc/150?u=member14', name: 'Member 14' },
        ],
    }
];

export const mockPendingContributions: PendingContribution[] = [
    {
        id: 'pc1',
        member: { id: 'u2', avatar: 'https://i.pravatar.cc/150?u=member2', name: 'Fiza Sahara' },
        amount: 50000,
        dueDate: '2025-08-15'
    },
    {
        id: 'pc2',
        member: { id: 'u4', avatar: 'https://i.pravatar.cc/150?u=member4', name: 'Ardias Elga' },
        amount: 50000,
        dueDate: '2025-08-15'
    },
     {
        id: 'pc3',
        member: { id: 'u3', avatar: 'https://i.pravatar.cc/150?u=member3', name: 'Her Sumalakabra' },
        amount: 25000,
        dueDate: '2025-08-20'
    }
];

const dailyActivity: ActivityDataPoint[] = [
    { name: 'Sun', Payments: 1800, Transfer: 1400 },
    { name: 'Mon', Payments: 2900, Transfer: 2200 },
    { name: 'Tue', Payments: 2800, Transfer: 2400 },
    { name: 'Wed', Payments: 2740, Transfer: 3100 },
    { name: 'Thu', Payments: 4800, Transfer: 2600 },
    { name: 'Fri', Payments: 4500, Transfer: 2800 },
    { name: 'Sat', Payments: 4000, Transfer: 3200 },
];

const weeklyActivity: ActivityDataPoint[] = [
    { name: 'W1', Payments: 12500, Transfer: 8000 },
    { name: 'W2', Payments: 15000, Transfer: 11500 },
    { name: 'W3', Payments: 13500, Transfer: 9500 },
    { name: 'W4', Payments: 18000, Transfer: 14000 },
];

const monthlyActivity: ActivityDataPoint[] = [
    { name: 'Jan', Payments: 50000, Transfer: 35000 },
    { name: 'Feb', Payments: 62000, Transfer: 42000 },
    { name: 'Mar', Payments: 55000, Transfer: 48000 },
    { name: 'Apr', Payments: 75000, Transfer: 60000 },
    { name: 'May', Payments: 70000, Transfer: 55000 },
    { name: 'Jun', Payments: 80000, Transfer: 65000 },
    { name: 'Jul', Payments: 78000, Transfer: 62000 },
];

const yearlyActivity: ActivityDataPoint[] = [
    { name: '2022', Payments: 650000, Transfer: 450000 },
    { name: '2023', Payments: 750000, Transfer: 580000 },
    { name: '2024', Payments: 820000, Transfer: 680000 },
    { name: '2025', Payments: 450000, Transfer: 320000 }, // Assuming mid-year
];

export const getCurrentYearDate = (daysAgo: number, _time: string) => {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString(); // Use ISO string for easier date parsing
};


const mockGroupTransactions: GroupTransaction[] = [
    { id: 'gt1', transactionId: 'GRP-TZN-001', member: mockGroupSavings[0].members[0], date: getCurrentYearDate(1, '10:45 AM'), amount: 50000, type: 'Income', paymentType: 'Contribution', status: 'Completed' },
    { id: 'gt2', transactionId: 'GRP-TZN-002', member: mockGroupSavings[0].members[1], date: getCurrentYearDate(2, '11:00 AM'), amount: 50000, type: 'Income', paymentType: 'Contribution', status: 'Completed' },
    { id: 'gt3', transactionId: 'GRP-TZN-003', member: mockGroupSavings[0].members[2], date: getCurrentYearDate(3, '09:30 AM'), amount: 50000, type: 'Income', paymentType: 'Contribution', status: 'Completed' },
    { id: 'gt4', transactionId: 'GRP-TZN-004', member: mockGroupSavings[0].members[3], date: getCurrentYearDate(4, '02:15 PM'), amount: 50000, type: 'Income', paymentType: 'Contribution', status: 'Completed' },
    { id: 'gt5', transactionId: 'GRP-TZN-005', member: mockGroupSavings[0].members[0], date: getCurrentYearDate(5, '04:00 PM'), amount: 25000, type: 'Outcome', paymentType: 'Withdrawal', status: 'Completed' },
    { id: 'gt6', transactionId: 'GRP-TZN-006', member: mockGroupSavings[0].members[1], date: getCurrentYearDate(6, '08:00 AM'), amount: 50000, type: 'Income', paymentType: 'Contribution', status: 'Pending' },
    { id: 'gt7', transactionId: 'GRP-TZN-007', member: mockGroupSavings[0].members[2], date: getCurrentYearDate(8, '01:00 PM'), amount: 1000, type: 'Outcome', paymentType: 'Fee', status: 'Completed' },
    { id: 'gt8', transactionId: 'GRP-TZN-008', member: { id: 'group', name: 'Group Interest', avatar: '' }, date: getCurrentYearDate(9, '11:59 PM'), amount: 1250, type: 'Income', paymentType: 'Interest', status: 'Completed' },
    { id: 'gt9', transactionId: 'GRP-TZN-009', member: mockGroupSavings[0].members[3], date: getCurrentYearDate(10, '10:00 AM'), amount: 50000, type: 'Income', paymentType: 'Contribution', status: 'Failed' },
    { id: 'gt10', transactionId: 'GRP-TZN-010', member: mockGroupSavings[0].members[0], date: getCurrentYearDate(12, '11:30 AM'), amount: 50000, type: 'Income', paymentType: 'Contribution', status: 'Completed' },
    { id: 'gt11', transactionId: 'GRP-TZN-011', member: mockGroupSavings[0].members[1], date: getCurrentYearDate(14, '03:00 PM'), amount: 15000, type: 'Outcome', paymentType: 'Withdrawal', status: 'Completed' },
    { id: 'gt12', transactionId: 'GRP-TZN-012', member: mockGroupSavings[0].members[2], date: getCurrentYearDate(15, '09:00 AM'), amount: 50000, type: 'Income', paymentType: 'Contribution', status: 'Completed' },
];

export const getGroupTransactions = (groupId: string): GroupTransaction[] => {
    // In a real app, this would filter by groupId. For this mock, we return the same set for any group.
    return mockGroupTransactions;
};


const familySavingsDetail: GroupSavingDetail = {
    ...mockGroupSavings[0],
    balance: 82683.98,
    activity: {
        daily: dailyActivity,
        weekly: weeklyActivity,
        monthly: monthlyActivity,
        yearly: yearlyActivity,
    },
    transactions: mockGroupTransactions.slice(0, 4), // Show first 4 transactions on detail page
    memberGoals: [
        { id: 'mg1', name: 'Travel', icon: '✈️', progress: 38, color: '#f87171' },
        { id: 'mg2', name: 'Ticket BTS', icon: '🎟️', progress: 69, color: '#34d399' },
        { id: 'mg3', name: 'Music', icon: '🎵', progress: 82, color: '#60a5fa' },
    ],
    pendingContributions: mockPendingContributions,
};

const allGroupDetails: { [key: string]: GroupSavingDetail } = {
    'gs01': familySavingsDetail,
    // We can create mock details for other groups here if needed
};

export const getGroupSavingDetail = (id: string): GroupSavingDetail | undefined => {
    // If we only have mock data for one group, we can return it regardless of ID,
    // or return a generic version for others.
    if (allGroupDetails[id]) {
        return allGroupDetails[id];
    }
    // Fallback for other groups
    const baseGroup = mockGroupSavings.find(g => g.id === id);
    if (!baseGroup) return undefined;
    
    return {
        ...baseGroup,
        balance: baseGroup.currentAmount,
        activity: familySavingsDetail.activity, // Use generic data
        transactions: familySavingsDetail.transactions,
        memberGoals: familySavingsDetail.memberGoals,
        pendingContributions: familySavingsDetail.pendingContributions,
    };
};

export const getGroupSummaryReport = (groupId: string): GroupMemberSummary[] => {
    const transactions = getGroupTransactions(groupId);
    const summaryMap: { [memberId: string]: GroupMemberSummary } = {};

    transactions.forEach(tx => {
        // Ignore group-level transactions like interest for member summaries
        if (tx.member.id === 'group') return;

        if (!summaryMap[tx.member.id]) {
            summaryMap[tx.member.id] = {
                memberId: tx.member.id,
                memberName: tx.member.name,
                memberAvatar: tx.member.avatar,
                totalContributed: 0,
                totalWithdrawn: 0,
                netContribution: 0,
                transactionCount: 0,
            };
        }

        const memberSummary = summaryMap[tx.member.id];
        memberSummary.transactionCount += 1;

        if (tx.type === 'Income' && tx.paymentType === 'Contribution') {
            memberSummary.totalContributed += tx.amount;
        } else if (tx.type === 'Outcome' && tx.paymentType === 'Withdrawal') {
            memberSummary.totalWithdrawn += tx.amount;
        }
        
        memberSummary.netContribution = memberSummary.totalContributed - memberSummary.totalWithdrawn;
    });

    return Object.values(summaryMap);
};


export const mockActivityData = [
    { id: 1, transactionId: 'TZN202408A1', date: getCurrentYearDate(1, '08:22 AM'), channelName: 'Card', amount: 150000, type: 'Income', paymentType: 'Loan acquisition', status: 'Completed' },
    { id: 2, transactionId: 'TZN202408B2', date: getCurrentYearDate(2, '09:45 AM'), channelName: 'Mobile Money', amount: 25000, type: 'Income', paymentType: 'Saving', status: 'Pending' },
    { id: 3, transactionId: 'TZN202408C3', date: getCurrentYearDate(3, '11:10 AM'), channelName: 'Card', amount: 50000, type: 'Outcome', paymentType: 'Loan Payment', status: 'Completed' },
    { id: 4, transactionId: 'TZN202407D4', date: getCurrentYearDate(5, '02:00 PM'), channelName: 'Mobile Money', amount: 5000, type: 'Income', paymentType: 'Interest acquisition', status: 'Completed' },
    { id: 5, transactionId: 'TZN202407E5', date: getCurrentYearDate(7, '04:30 PM'), channelName: 'Card', amount: 10000, type: 'Income', paymentType: 'Reward acquisition', status: 'Cancelled' },
    { id: 6, transactionId: 'TZN202407F6', date: getCurrentYearDate(8, '10:05 AM'), channelName: 'Mobile Money', amount: 75000, type: 'Income', paymentType: 'Saving', status: 'Cancelled' },
    { id: 7, transactionId: 'TZN202406G7', date: getCurrentYearDate(10, '08:00 AM'), channelName: 'Card', amount: 20000, type: 'Outcome', paymentType: 'Loan Payment', status: 'Completed' },
    { id: 8, transactionId: 'TZN202406H8', date: getCurrentYearDate(12, '01:55 PM'), channelName: 'Mobile Money', amount: 15000, type: 'Income', paymentType: 'Saving', status: 'Completed' },
    { id: 9, transactionId: 'TZN202406I9', date: getCurrentYearDate(15, '06:18 PM'), channelName: 'Card', amount: 45000, type: 'Outcome', paymentType: 'Loan Payment', status: 'Pending' },
    { id: 10, transactionId: 'TZN202406I10', date: getCurrentYearDate(20, '06:18 PM'), channelName: 'Card', amount: 22000, type: 'Income', paymentType: 'Saving', status: 'Completed' },
    { id: 11, transactionId: 'TZN202406I11', date: getCurrentYearDate(25, '06:18 PM'), channelName: 'Mobile Money', amount: 30000, type: 'Outcome', paymentType: 'Loan Payment', status: 'Completed' },
];

export const mockContributionsData = [
  { id: 1, contributionId: 'CON202408A1', date: getCurrentYearDate(1, '09:00 AM'), memberName: 'Piko Khamis', groupName: 'Family Savings', amount: 50000, type: 'Income', contributionType: 'Monthly Contribution', status: 'Completed' },
  { id: 2, contributionId: 'CON202408B2', date: getCurrentYearDate(1, '09:05 AM'), memberName: 'Fiza Sahara', groupName: 'Family Savings', amount: 50000, type: 'Income', contributionType: 'Monthly Contribution', status: 'Completed' },
  { id: 3, contributionId: 'CON202408C3', date: getCurrentYearDate(2, '10:15 AM'), memberName: 'Her Sumalakabra', groupName: 'Business Start-Up', amount: 50000, type: 'Income', contributionType: 'Monthly Contribution', status: 'Pending' },
  { id: 4, contributionId: 'CON202407D4', date: getCurrentYearDate(5, '03:00 PM'), memberName: 'Ardias Elga', groupName: 'Holiday Fund', amount: 51000, type: 'Income', contributionType: 'Contribution + Late Fee', status: 'Completed' },
  { id: 5, contributionId: 'CON202407E5', date: getCurrentYearDate(7, '11:00 AM'), memberName: 'Piko Khamis', groupName: 'Family Savings', amount: 50000, type: 'Income', contributionType: 'Monthly Contribution', status: 'Completed' },
  { id: 6, contributionId: 'CON202407F6', date: getCurrentYearDate(8, '04:50 PM'), memberName: 'Fiza Sahara', groupName: 'Family Savings', amount: 25000, type: 'Income', contributionType: 'Extra Contribution', status: 'Completed' },
  { id: 7, contributionId: 'CON202406G7', date: getCurrentYearDate(10, '09:30 AM'), memberName: 'Her Sumalakabra', groupName: 'Business Start-Up', amount: 100000, type: 'Outcome', contributionType: 'Withdrawal Share', status: 'Completed' },
  { id: 8, contributionId: 'CON202406H8', date: getCurrentYearDate(12, '02:00 PM'), memberName: 'Ardias Elga', groupName: 'Holiday Fund', amount: 50000, type: 'Income', contributionType: 'Monthly Contribution', status: 'Completed' },
  { id: 9, contributionId: 'CON202406I9', date: getCurrentYearDate(15, '05:00 PM'), memberName: 'Piko Khamis', groupName: 'Education Fund', amount: 50000, type: 'Income', contributionType: 'Monthly Contribution', status: 'Cancelled' },
  { id: 10, contributionId: 'CON202406J10', date: getCurrentYearDate(20, '10:00 AM'), memberName: 'Fiza Sahara', groupName: 'Family Savings', amount: 50000, type: 'Income', contributionType: 'Monthly Contribution', status: 'Completed' },
  { id: 11, contributionId: 'CON202406K11', date: getCurrentYearDate(25, '11:20 AM'), memberName: 'Her Sumalakabra', groupName: 'Business Start-Up', amount: 50000, type: 'Income', contributionType: 'Monthly Contribution', status: 'Pending' },
];

export const mockMembersData = [
  { id: 1, memberId: 'MEM24A1', joinDate: getCurrentYearDate(10, '09:00 AM'), memberName: 'Sigit Senugroho', groupName: 'Family Savings', totalContribution: 250000, status: 'Active' },
  { id: 2, memberId: 'MEM24A2', joinDate: getCurrentYearDate(10, '09:00 AM'), memberName: 'Fiza Sahara', groupName: 'Family Savings', totalContribution: 275000, status: 'Active' },
  { id: 3, memberId: 'MEM24A3', joinDate: getCurrentYearDate(15, '10:15 AM'), memberName: 'Her Sumalakabra', groupName: 'Business Start-Up', totalContribution: 150000, status: 'Active' },
  { id: 4, memberId: 'MEM24A4', joinDate: getCurrentYearDate(20, '03:00 PM'), memberName: 'Ardias Elga', groupName: 'Holiday Fund', totalContribution: 101000, status: 'Suspended' },
  { id: 5, memberId: 'MEM24A5', joinDate: getCurrentYearDate(25, '11:00 AM'), memberName: 'Member 5', groupName: 'Business Start-Up', totalContribution: 150000, status: 'Active' },
  { id: 6, memberId: 'MEM24A6', joinDate: getCurrentYearDate(30, '04:50 PM'), memberName: 'Member 6', groupName: 'Holiday Fund', totalContribution: 100000, status: 'Active' },
  { id: 7, memberId: 'MEM24A7', joinDate: getCurrentYearDate(35, '09:30 AM'), memberName: 'Member 7', groupName: 'Education Fund', totalContribution: 50000, status: 'Inactive' },
  { id: 8, memberId: 'MEM24A8', joinDate: getCurrentYearDate(40, '02:00 PM'), memberName: 'Member 8', groupName: 'Holiday Fund', totalContribution: 100000, status: 'Active' },
  { id: 9, memberId: 'MEM24A9', joinDate: getCurrentYearDate(45, '05:00 PM'), memberName: 'Member 9', groupName: 'Education Fund', totalContribution: 50000, status: 'Active' },
  { id: 10, memberId: 'MEM24A10', joinDate: getCurrentYearDate(50, '10:00 AM'), memberName: 'Member 10', groupName: 'Family Savings', totalContribution: 200000, status: 'Active' },
  { id: 11, memberId: 'MEM24A11', joinDate: getCurrentYearDate(55, '11:20 AM'), memberName: 'Member 11', groupName: 'Business Start-Up', totalContribution: 100000, status: 'Inactive' },
];

export const mockGoalActivityData: GoalActivityTransaction[] = [
    // Data for goal 'sg01'
    { id: 1, goalId: 'sg01', transactionId: 'G-DEP-001', date: getCurrentYearDate(5, '10:00 AM'), description: 'Weekly Savings Deposit', amount: 50000, type: 'Income', source: 'Mobile Money', status: 'Completed' },
    { id: 2, goalId: 'sg01', transactionId: 'G-DEP-002', date: getCurrentYearDate(12, '10:00 AM'), description: 'Weekly Savings Deposit', amount: 50000, type: 'Income', source: 'Mobile Money', status: 'Completed' },
    { id: 3, goalId: 'sg01', transactionId: 'G-INT-001', date: getCurrentYearDate(15, '11:30 PM'), description: 'Monthly Interest', amount: 1200, type: 'Income', source: 'Interest', status: 'Completed' },
    { id: 4, goalId: 'sg01', transactionId: 'G-DEP-003', date: getCurrentYearDate(19, '10:00 AM'), description: 'Weekly Savings Deposit', amount: 50000, type: 'Income', source: 'Card', status: 'Completed' },
    { id: 5, goalId: 'sg01', transactionId: 'G-DEP-004', date: getCurrentYearDate(26, '10:00 AM'), description: 'Weekly Savings Deposit', amount: 50000, type: 'Income', source: 'Mobile Money', status: 'Pending' },
    { id: 12, goalId: 'sg01', transactionId: 'G-DEP-011', date: getCurrentYearDate(33, '10:00 AM'), description: 'Weekly Savings Deposit', amount: 25000, type: 'Income', source: 'Card', status: 'Failed' },

    // Data for goal 'sg02'
    { id: 6, goalId: 'sg02', transactionId: 'G-DEP-005', date: getCurrentYearDate(8, '09:00 AM'), description: 'Initial Deposit', amount: 100000, type: 'Income', source: 'Bank Transfer', status: 'Completed' },
    { id: 7, goalId: 'sg02', transactionId: 'G-DEP-006', date: getCurrentYearDate(22, '09:00 AM'), description: 'Extra Deposit', amount: 25000, type: 'Income', source: 'Card', status: 'Completed' },
    
    // Data for goal 'sg03'
    { id: 8, goalId: 'sg03', transactionId: 'G-DEP-007', date: getCurrentYearDate(2, '03:00 PM'), description: 'Top up', amount: 15000, type: 'Income', source: 'Mobile Money', status: 'Completed' },
    
    // Data for goal 'sg04'
    { id: 9, goalId: 'sg04', transactionId: 'G-DEP-008', date: getCurrentYearDate(10, '08:00 AM'), description: 'Contribution from friend', amount: 40000, type: 'Income', source: 'Mobile Money', status: 'Completed' },
    { id: 10, goalId: 'sg04', transactionId: 'G-DEP-009', date: getCurrentYearDate(30, '08:00 AM'), description: 'Weekly Deposit', amount: 10000, type: 'Income', source: 'Card', status: 'Pending' },
    
    // Data for goal 'sg05'
    { id: 11, goalId: 'sg05', transactionId: 'G-DEP-010', date: getCurrentYearDate(1, '01:00 PM'), description: 'Monthly Savings', amount: 200000, type: 'Income', source: 'Bank Transfer', status: 'Completed' },
];

export const getGoalActivityData = (goalId: string): GoalActivityTransaction[] => {
    return mockGoalActivityData.filter(tx => tx.goalId === goalId);
};

export const getGoalSummaryReport = (goalId: string): GoalSummaryItem[] => {
    const transactions = getGoalActivityData(goalId);
    const summaryMap: { [source: string]: { totalAmount: number; transactionCount: number; dates: string[] } } = {};

    transactions.forEach(tx => {
        if (tx.type !== 'Income') return; // Only summarize deposits/income

        if (!summaryMap[tx.source]) {
            summaryMap[tx.source] = {
                totalAmount: 0,
                transactionCount: 0,
                dates: [],
            };
        }

        const sourceSummary = summaryMap[tx.source];
        sourceSummary.totalAmount += tx.amount;
        sourceSummary.transactionCount += 1;
        sourceSummary.dates.push(tx.date);
    });

    return Object.entries(summaryMap).map(([source, data]) => {
        const lastDate = data.dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0];
        return {
            source: source as GoalSummaryItem['source'],
            totalAmount: data.totalAmount,
            transactionCount: data.transactionCount,
            averageAmount: data.transactionCount > 0 ? data.totalAmount / data.transactionCount : 0,
            lastTransactionDate: lastDate,
        };
    });
};

export const isUserInAnyGroup = (userId: string): boolean => {
  return mockGroupSavings.some(group => group.members.some(member => member.id === userId));
};

export const getGroupsForUser = (userId: string): GroupSaving[] => {
    return mockGroupSavings.filter(group => group.members.some(member => member.id === userId));
};

export const mockManagementUsers: UserForManagement[] = [
    { id: 'usr001', user: { name: 'Beverlie Krabbe', email: 'bkrabbe1d@home.pl', avatar: 'https://i.pravatar.cc/150?u=usr001' }, role: 'Manager', category: 'Saver', phone: '0712 345 678', status: 'Active', pinSet: true },
    { id: 'usr002', user: { name: 'Paulie Durber', email: 'pdurber1c@gov.uk', avatar: 'https://i.pravatar.cc/150?u=usr002' }, role: 'User', category: 'Borrower', phone: '0755 123 456', status: 'Inactive', pinSet: false },
    { id: 'usr003', user: { name: 'Onfre Wind', email: 'owind1b@yandex.ru', avatar: 'https://i.pravatar.cc/150?u=usr003' }, role: 'Admin', category: 'Admin', phone: '0688 987 654', status: 'Pending', pinSet: true },
    { id: 'usr004', user: { name: 'Karena Courtliff', email: 'kcourtliff1a@bbc.co.uk', avatar: 'https://i.pravatar.cc/150?u=usr004' }, role: 'Admin', category: 'Admin', phone: '0711 223 344', status: 'Active', pinSet: false },
    { id: 'usr005', user: { name: 'Norris Gudahy', email: 'ngudahy19@prnewswire.com', avatar: 'https://i.pravatar.cc/150?u=usr005' }, role: 'User', category: 'Borrower', phone: '0765 445 566', status: 'Active', pinSet: true },
    { id: 'usr006', user: { name: 'Corabella Dunnet', email: 'cdunnet18@sogou.com', avatar: 'https://i.pravatar.cc/150?u=usr006' }, role: 'Manager', category: 'Group Admin', phone: '0655 778 899', status: 'Pending', pinSet: false },
    { id: 'usr007', user: { name: 'Tracey Kording', email: 'tkording17@globo.com', avatar: 'https://i.pravatar.cc/150?u=usr007' }, role: 'User', category: 'Saver', phone: '0788 112 233', status: 'Active', pinSet: true },
    { id: 'usr008', user: { name: 'Suki Richings', email: 'srichings16@reverbnation.com', avatar: 'https://i.pravatar.cc/150?u=usr008' }, role: 'Admin', category: 'Admin', phone: '0713 445 566', status: 'Inactive', pinSet: false },
    { id: 'usr009', user: { name: 'Jarvis Lyburn', email: 'jlyburn15@wp.com', avatar: 'https://i.pravatar.cc/150?u=usr009' }, role: 'User', category: 'Investor', phone: '0656 778 899', status: 'Active', pinSet: true },
    { id: 'usr010', user: { name: 'Gratia Limbourne', email: 'glimbourne14@slashdot.org', avatar: 'https://i.pravatar.cc/150?u=usr010' }, role: 'Manager', category: 'Saver', phone: '0789 112 233', status: 'Pending', pinSet: false },
];

export const getManagementUsers = (): UserForManagement[] => {
    return mockManagementUsers;
};

const mockUserGoals: UserGoal[] = [
  { id: 'proj1', name: 'BGC eCommerce App', type: 'React Project', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg', progress: 78 },
  { id: 'proj2', name: 'Falcon Logo Design', type: 'Figma Project', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg', progress: 25 },
  { id: 'proj3', name: 'Dashboard Design', type: 'Vuejs Project', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vuejs/vuejs-original.svg', progress: 62 },
  { id: 'proj4', name: 'Foodista mobile app', type: 'Xamarin Project', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/xamarin/xamarin-original.svg', progress: 8 },
  { id: 'proj5', name: 'Dojo Email App', type: 'Python Project', icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg', progress: 51 },
];

export const getUserDetailById = (userId: string): UserDetail | undefined => {
    const baseUser = mockManagementUsers.find(u => u.id === userId);
    if (!baseUser) return undefined;

    return {
        ...baseUser,
        details: {
            username: baseUser.user.name.replace(' ', '').toLowerCase(),
            billingEmail: baseUser.user.email,
            status: baseUser.status,
            role: baseUser.role,
            taxId: `TAX-${Math.floor(Math.random() * 9000) + 1000}`,
            contact: baseUser.phone,
            language: 'English',
            country: 'Tanzania',
        },
        stats: {
            goalsCompleted: 568,
            tasksCompleted: '1.23k',
        },
        goals: mockUserGoals,
    };
};

export const mockRoles = [
  { name: 'Administrator', userCount: 4, avatars: ['https://i.pravatar.cc/150?u=admin1', 'https://i.pravatar.cc/150?u=admin2', 'https://i.pravatar.cc/150?u=admin3', 'https://i.pravatar.cc/150?u=admin4'] },
  { name: 'Manager', userCount: 7, avatars: ['https://i.pravatar.cc/150?u=man1', 'https://i.pravatar.cc/150?u=man2', 'https://i.pravatar.cc/150?u=man3'], more: 4 },
  { name: 'Users', userCount: 5, avatars: ['https://i.pravatar.cc/150?u=user1', 'https://i.pravatar.cc/150?u=user2', 'https://i.pravatar.cc/150?u=user3'], more: 2 },
  { name: 'Support', userCount: 6, avatars: ['https://i.pravatar.cc/150?u=sup1', 'https://i.pravatar.cc/150?u=sup2', 'https://i.pravatar.cc/150?u=sup3'], more: 3 },
  { name: 'Restricted User', userCount: 10, avatars: ['https://i.pravatar.cc/150?u=res1', 'https://i.pravatar.cc/150?u=res2', 'https://i.pravatar.cc/150?u=res3'], more: 7 },
];

export const mockUsersWithRoles = [
  { id: '1', user: { name: 'Beverlie Krabbe', email: 'bkrabbe1d@home.pl', avatar: 'https://i.pravatar.cc/150?u=usr001' }, role: 'Manager', plan: 'Company', billing: 'Manual-Cash', status: 'Active' },
  { id: '2', user: { name: 'Paulie Durber', email: 'pdurber1c@gov.uk', avatar: 'https://i.pravatar.cc/150?u=usr002' }, role: 'User', plan: 'Team', billing: 'Manual-PayPal', status: 'Inactive' },
  { id: '3', user: { name: 'Onfre Wind', email: 'owind1b@yandex.ru', avatar: 'https://i.pravatar.cc/150?u=usr003' }, role: 'Admin', plan: 'Basic', billing: 'Manual-PayPal', status: 'Pending' },
  { id: '4', user: { name: 'Karena Courtliff', email: 'kcourtliff1a@bbc.co.uk', avatar: 'https://i.pravatar.cc/150?u=usr004' }, role: 'Admin', plan: 'Basic', billing: 'Manual-Credit Card', status: 'Active' },
  { id: '5', user: { name: 'Saunder Offner', email: 'soffner19@mac.com', avatar: 'https://i.pravatar.cc/150?u=usr005' }, role: 'Maintainer', plan: 'Enterprise', billing: 'Manual-Credit Card', status: 'Pending' },
  { id: '6', user: { name: 'Corrie Perot', email: 'cperot@goo.ne.jp', avatar: 'https://i.pravatar.cc/150?u=usr006' }, role: 'User', plan: 'Team', billing: 'Manual-Credit Card', status: 'Pending' },
  { id: '7', user: { name: 'Vladamir Koschek', email: 'vkoschek17@abc.net.au', avatar: 'https://i.pravatar.cc/150?u=usr007' }, role: 'Author', plan: 'Team', billing: 'Manual-Credit Card', status: 'Active' },
  { id: '8', user: { name: 'Micaela McAnirlan', email: 'mmcnirlan16@hc360.com', avatar: 'https://i.pravatar.cc/150?u=usr008' }, role: 'Admin', plan: 'Basic', billing: 'Auto Debit', status: 'Inactive' },
];

export const mockPermissions: Permission[] = [
  { id: 'perm1', name: 'Management', assignedTo: ['Administrator'], createdDate: '2021-04-14T20:43:00Z' },
  { id: 'perm2', name: 'Manage Billing & Roles', assignedTo: ['Administrator'], createdDate: '2021-09-16T17:20:00Z' },
  { id: 'perm3', name: 'Add & Remove Users', assignedTo: ['Administrator', 'Manager'], createdDate: '2021-10-14T10:20:00Z' },
  { id: 'perm4', name: 'Project Planning', assignedTo: ['Administrator', 'Users', 'Support'], createdDate: '2021-10-14T10:20:00Z' },
  { id: 'perm5', name: 'Manage Email Sequences', assignedTo: ['Administrator', 'Users', 'Support'], createdDate: '2021-08-23T14:00:00Z' },
  { id: 'perm6', name: 'Client Communication', assignedTo: ['Administrator', 'Manager'], createdDate: '2021-04-15T11:30:00Z' },
  { id: 'perm7', name: 'Only View', assignedTo: ['Administrator', 'Restricted User'], createdDate: '2021-12-04T20:15:00Z' },
  { id: 'perm8', name: 'Financial Management', assignedTo: ['Administrator', 'Manager'], createdDate: '2021-02-25T10:30:00Z' },
  { id: 'perm9', name: 'Manage Others\' Tasks', assignedTo: ['Administrator', 'Support'], createdDate: '2021-11-04T11:45:00Z' },
  { id: 'perm10', name: 'System Configuration', assignedTo: ['Administrator'], createdDate: '2022-01-10T09:00:00Z' },
  { id: 'perm11', name: 'API Access Control', assignedTo: ['Administrator'], createdDate: '2022-02-01T15:00:00Z' },
  { id: 'perm12', name: 'Content Moderation', assignedTo: ['Manager', 'Support'], createdDate: '2022-03-05T12:00:00Z' },
];

export const mockDocumentTypes: DocumentType[] = [
  { id: 'dt01', name: 'Contract', description: 'Agreement Contract', fileTypes: [], isCore: true },
  { id: 'dt02', name: 'Business License', description: 'Business License', fileTypes: [], isCore: true },
  { id: 'dt03', name: 'EWURA Certificate', description: 'EWURA Certificate', fileTypes: [], isCore: true },
  { id: 'dt04', name: 'BRELA Certificate', description: 'BRELA Certificate', fileTypes: [], isCore: true },
  { id: 'dt05', name: 'LATRA Certificate', description: 'LATRA Certificate', fileTypes: [], isCore: true },
  { id: 'dt06', name: 'National ID', description: 'Tanzanian National ID Card (NIDA)', fileTypes: [], isCore: true },
  { id: 'dt07', name: 'Local Government Letter', description: 'A letter from local Government', fileTypes: [], isCore: false },
  { id: 'dt08', name: 'Vehicle Card', description: 'Original Car/Vehicle Card', fileTypes: [], isCore: false },
  { id: 'dt09', name: 'Bank Statement', description: 'Bank or Mobile transaction Statement', fileTypes: [], isCore: false },
  { id: 'dt10', name: 'Tax Clearance', description: 'Tax Clearance Documents', fileTypes: [], isCore: false },
  { id: 'dt11', name: 'Memorandum of Understanding', description: 'Memorandum of Understanding (MOU)', fileTypes: [], isCore: false },
  { id: 'dt12', name: 'Commitment Letter', description: 'Commitment Letter', fileTypes: [], isCore: false },
  { id: 'dt13', name: 'Voter\'s ID', description: 'Tanzanian Voter\'s Registration Card', fileTypes: [], isCore: true },
  { id: 'dt14', name: 'Passport', description: 'Valid Tanzanian or other Passport', fileTypes: [], isCore: true },
  { id: 'dt15', name: 'Driver\'s License', description: 'Valid Tanzanian Driver\'s License', fileTypes: [], isCore: true },
];

export const mockDocumentGroupNames = ['vendor', 'client_personal', 'client_cooporate', 'guarantor', 'saver'];

export const mockDocumentGroups: DocumentGroup[] = [
  { id: 'dg01', name: 'vendor', documentTypeName: 'Contract' },
  { id: 'dg02', name: 'vendor', documentTypeName: 'Business License' },
  { id: 'dg03', name: 'vendor', documentTypeName: 'EWURA Certificate' },
  { id: 'dg04', name: 'vendor', documentTypeName: 'BRELA Certificate' },
  { id: 'dg05', name: 'client_personal', documentTypeName: 'Local Government Letter' },
  { id: 'dg06', name: 'client_personal', documentTypeName: 'Vehicle Card' },
  { id: 'dg07', name: 'client_personal', documentTypeName: 'Bank Statement' },
  { id: 'dg08', name: 'client_cooporate', documentTypeName: 'LATRA Certificate' },
  { id: 'dg09', name: 'client_cooporate', documentTypeName: 'Business License' },
  { id: 'dg10', name: 'client_cooporate', documentTypeName: 'BRELA Certificate' },
  { id: 'dg11', name: 'client_cooporate', documentTypeName: 'Tax Clearance' },
  { id: 'dg12', name: 'client_cooporate', documentTypeName: 'Memorandum of Understanding' },
  { id: 'dg13', name: 'guarantor', documentTypeName: 'Local Government Letter' },
  { id: 'dg14', name: 'guarantor', documentTypeName: 'Commitment Letter' },
  { id: 'dg15', name: 'guarantor', documentTypeName: 'National ID' },
  { id: 'dg16', name: 'client_cooporate', documentTypeName: 'Business License' },
  { id: 'dg17', name: 'client_cooporate', documentTypeName: 'BRELA Certificate' },
  { id: 'dg18', name: 'saver', documentTypeName: 'National ID' },
  { id: 'dg19', name: 'saver', documentTypeName: 'Voter\'s ID' },
  { id: 'dg20', name: 'saver', documentTypeName: 'Passport' },
  { id: 'dg21', name: 'saver', documentTypeName: 'Driver\'s License' },
];

export const mockApprovalFlows: ApprovalFlow[] = [
  { id: 'af-user-reg', name: 'User Registration', approvableType: 'App\\Models\\User', createdAt: '2025-09-24' },
  { id: 'af-emergency-wd', name: 'Emergency Withdrawal', approvableType: 'App\\Models\\Withdrawal', createdAt: '2025-09-24' },
  { id: 'af-status-change', name: 'Account Status Change', approvableType: 'App\\Models\\UserStatus', createdAt: '2025-09-24' },
  { id: 'af-reversal', name: 'Transaction Reversal', approvableType: 'App\\Models\\Transaction', createdAt: '2025-09-24' },
  { id: 'af-balance-adj', name: 'Account Balance Adjustment', approvableType: 'App\\Models\\Account', createdAt: '2025-09-24' },
  { id: 'af-sys-config', name: 'System Configuration Change', approvableType: 'App\\Models\\Configuration', createdAt: '2025-09-24' },
];

// FIX: Added missing roleId property to each mock approval flow step.
export const mockApprovalFlowSteps: ApprovalFlowStep[] = [
  // Steps for 'User Registration' (af-user-reg)
  { id: 'afs01', flowId: 'af-user-reg', roleId: 1, role: 'Support', order: 1, action: 'VERIFY', status: 'Active' },
  { id: 'afs02', flowId: 'af-user-reg', roleId: 2, role: 'Compliance Officer', order: 2, action: 'APPROVE', status: 'Active' },

  // Steps for 'Emergency Withdrawal' (af-emergency-wd)
  { id: 'afs03', flowId: 'af-emergency-wd', roleId: 3, role: 'Support', order: 1, action: 'VERIFY', status: 'Active' },
  { id: 'afs04', flowId: 'af-emergency-wd', roleId: 4, role: 'Administrator', order: 2, action: 'APPROVE', status: 'Active' },
  
  // Steps for 'Account Status Change' (af-status-change)
  { id: 'afs05', flowId: 'af-status-change', roleId: 5, role: 'Support', order: 1, action: 'ACKNOWLEDGE', status: 'Active' },
  { id: 'afs06', flowId: 'af-status-change', roleId: 6, role: 'Super Administrator', order: 2, action: 'APPROVE', status: 'Active' },

  // Steps for 'Transaction Reversal' (af-reversal)
  { id: 'afs07', flowId: 'af-reversal', roleId: 7, role: 'Support', order: 1, action: 'VERIFY', status: 'Active' },
  { id: 'afs08', flowId: 'af-reversal', roleId: 8, role: 'Technical Lead', order: 2, action: 'APPROVE', status: 'Active' },

  // Steps for 'Account Balance Adjustment' (af-balance-adj)
  { id: 'afs09', flowId: 'af-balance-adj', roleId: 9, role: 'Administrator', order: 1, action: 'VERIFY', status: 'Active' },
  { id: 'afs10', flowId: 'af-balance-adj', roleId: 10, role: 'Super Administrator', order: 2, action: 'APPROVE', status: 'Active' },

  // Steps for 'System Configuration Change' (af-sys-config)
  { id: 'afs11', flowId: 'af-sys-config', roleId: 11, role: 'Product Owner', order: 1, action: 'VERIFY', status: 'Active' },
  { id: 'afs12', flowId: 'af-sys-config', roleId: 12, role: 'Technical Lead', order: 2, action: 'APPROVE', status: 'Active' },
];

export const mockApprovalRoles: string[] = [
    'Admin',
    'Administrator',
    'Director',
    'Manager',
    'Finance Officer',
    'Head of Finance',
    'Accountant',
    'Credit Officer',
    'Credit Manager',
    'Support',
    'Restricted User',
    'Compliance Officer',
    'Super Administrator',
    'Technical Lead',
    'Product Owner',
    'Project Sponsor'
];


export const getApprovalFlowById = (id: string): ApprovalFlow | undefined => {
    return mockApprovalFlows.find(flow => flow.id === id);
};

export const getApprovalFlowSteps = (flowId: string): ApprovalFlowStep[] => {
    return mockApprovalFlowSteps.filter(step => step.flowId === flowId);
};

export const mockModules: Module[] = [
  { id: 'mod01', name: 'Loan Product', description: 'Manage loan products offered to borrowers.', mobileApp: true, type: 'Loan' },
  { id: 'mod02', name: 'Investment Product', description: 'Configure investment opportunities for platform investors.', mobileApp: false, type: 'Investment' },
  { id: 'mod03', name: 'Personal Savings Product', description: 'Set up parameters for individual savings accounts.', mobileApp: true, type: 'Saving' },
  { id: 'mod04', name: 'Group Savings Product', description: 'Define rules and features for VICOBA group savings.', mobileApp: true, type: 'Saving' },
];

export const mockDeposits: Deposit[] = [
  { id: 'dep001', requestTime: '2025-06-21T11:42:06Z', depositorName: 'Juma Hassan', accountNumber: 'ACCT001', reference: 'REF001', phoneNumber: '255712345678', receiptNumber: 'REC001', partner: 'Vodacom M-Pesa', amount: 50000, currency: 'TZS' },
  { id: 'dep002', requestTime: '2025-06-22T09:15:30Z', depositorName: 'Amina Chande', accountNumber: 'ACCT002', reference: 'REF002', phoneNumber: '255788123456', receiptNumber: 'REC002', partner: 'Tigo Pesa', amount: 75000, currency: 'TZS' },
  { id: 'dep003', requestTime: '2025-06-23T14:00:00Z', depositorName: 'Piko Khamis', accountNumber: 'ACCT003', reference: 'REF003', phoneNumber: '255655987654', receiptNumber: 'REC003', partner: 'Airtel Money', amount: 30000, currency: 'TZS' },
  { id: 'dep004', requestTime: '2025-06-24T10:05:15Z', depositorName: 'Asha Juma', accountNumber: 'ACCT004', reference: 'REF004', phoneNumber: '255713456789', receiptNumber: 'REC004', partner: 'Vodacom M-Pesa', amount: 120000, currency: 'TZS' },
  { id: 'dep005', requestTime: '2025-06-25T16:30:45Z', depositorName: 'John Doe', accountNumber: 'ACCT005', reference: 'REF005', phoneNumber: '255755654321', receiptNumber: 'REC005', partner: 'Tigo Pesa', amount: 25000, currency: 'TZS' },
  { id: 'dep006', requestTime: '2025-06-26T08:00:00Z', depositorName: 'Jane Smith', accountNumber: 'ACCT006', reference: 'REF006', phoneNumber: '255688789012', receiptNumber: 'REC006', partner: 'Airtel Money', amount: 95000, currency: 'TZS' },
  { id: 'dep007', requestTime: '2025-06-27T12:12:12Z', depositorName: 'Peter Jones', accountNumber: 'ACCT007', reference: 'REF007', phoneNumber: '255718901234', receiptNumber: 'REC007', partner: 'Vodacom M-Pesa', amount: 5000, currency: 'TZS' },
  { id: 'dep008', requestTime: '2025-06-28T18:45:00Z', depositorName: 'Mary Williams', accountNumber: 'ACCT008', reference: 'REF008', phoneNumber: '255767890123', receiptNumber: 'REC008', partner: 'Tigo Pesa', amount: 150000, currency: 'TZS' },
  { id: 'dep009', requestTime: '2025-06-29T09:30:00Z', depositorName: 'David Brown', accountNumber: 'ACCT009', reference: 'REF009', phoneNumber: '255655123456', receiptNumber: 'REC009', partner: 'Airtel Money', amount: 45000, currency: 'TZS' },
  { id: 'dep010', requestTime: '2025-06-30T11:00:00Z', depositorName: 'Amani Mwamba', accountNumber: 'ACCT010', reference: 'REF010', phoneNumber: '255711234567', receiptNumber: 'REC010', partner: 'Vodacom M-Pesa', amount: 80000, currency: 'TZS' },
  { id: 'dep011', requestTime: '2025-07-01T15:20:30Z', depositorName: 'Baraka Suleiman', accountNumber: 'ACCT011', reference: 'REF011', phoneNumber: '255789012345', receiptNumber: 'REC011', partner: 'Tigo Pesa', amount: 65000, currency: 'TZS' },
];

export const mockLoans: Loan[] = [
  { id: 'ln001', date: '2025-07-01T10:00:00Z', transactionNo: 'TRN001', clientName: 'Juma Hassan', accountNumber: 'LN-001', interestPeriod: '30 Days', interestRate: 15, amount: 500000, currency: 'TZS', status: 'Approved', deadline: '2025-07-31T10:00:00Z' },
  { id: 'ln002', date: '2025-07-02T11:30:00Z', transactionNo: 'TRN002', clientName: 'Amina Chande', accountNumber: 'LN-002', interestPeriod: '60 Days', interestRate: 12, amount: 1200000, currency: 'TZS', status: 'Pending', deadline: '2025-09-01T11:30:00Z' },
  { id: 'ln003', date: '2025-07-03T09:15:00Z', transactionNo: 'TRN003', clientName: 'Piko Khamis', accountNumber: 'LN-003', interestPeriod: '90 Days', interestRate: 10, amount: 2500000, currency: 'TZS', status: 'Paid', deadline: '2025-10-01T09:15:00Z' },
  { id: 'ln004', date: '2025-07-04T14:00:00Z', transactionNo: 'TRN004', clientName: 'Asha Juma', accountNumber: 'LN-004', interestPeriod: '30 Days', interestRate: 18, amount: 300000, currency: 'TZS', status: 'Rejected', deadline: '2025-08-03T14:00:00Z' },
  { id: 'ln005', date: '2025-07-05T16:45:00Z', transactionNo: 'TRN005', clientName: 'John Doe', accountNumber: 'LN-005', interestPeriod: '45 Days', interestRate: 14, amount: 750000, currency: 'TZS', status: 'Approved', deadline: '2025-08-19T16:45:00Z' },
  { id: 'ln006', date: '2025-07-06T08:00:00Z', transactionNo: 'TRN006', clientName: 'Jane Smith', accountNumber: 'LN-006', interestPeriod: '120 Days', interestRate: 9, amount: 5000000, currency: 'TZS', status: 'Pending', deadline: '2025-11-03T08:00:00Z' },
  { id: 'ln007', date: '2025-07-07T12:20:00Z', transactionNo: 'TRN007', clientName: 'Peter Jones', accountNumber: 'LN-007', interestPeriod: '30 Days', interestRate: 16, amount: 450000, currency: 'TZS', status: 'Paid', deadline: '2025-08-06T12:20:00Z' },
  { id: 'ln008', date: '2025-07-08T15:00:00Z', transactionNo: 'TRN008', clientName: 'Mary Williams', accountNumber: 'LN-008', interestPeriod: '60 Days', interestRate: 13, amount: 900000, currency: 'TZS', status: 'Approved', deadline: '2025-09-06T15:00:00Z' },
  { id: 'ln009', date: '2025-07-09T09:00:00Z', transactionNo: 'TRN009', clientName: 'David Brown', accountNumber: 'LN-009', interestPeriod: '15 Days', interestRate: 20, amount: 150000, currency: 'TZS', status: 'Rejected', deadline: '2025-07-24T09:00:00Z' },
  { id: 'ln010', date: '2025-07-10T11:00:00Z', transactionNo: 'TRN010', clientName: 'Amani Mwamba', accountNumber: 'LN-010', interestPeriod: '90 Days', interestRate: 11, amount: 3000000, currency: 'TZS', status: 'Pending', deadline: '2025-10-08T11:00:00Z' },
  { id: 'ln011', date: '2025-07-11T13:30:00Z', transactionNo: 'TRN011', clientName: 'Baraka Suleiman', accountNumber: 'LN-011', interestPeriod: '30 Days', interestRate: 17, amount: 600000, currency: 'TZS', status: 'Approved', deadline: '2025-08-10T13:30:00Z' },
];

export const mockLoanRepayments: LoanRepayment[] = [
    { id: 'lr001', repaymentDate: '2025-07-31T10:00:00Z', clientName: 'Juma Hassan', accountNumber: 'LN-001', paymentReference: 'PAYREF001', status: 'Completed', amount: 57500, currency: 'TZS' },
    { id: 'lr002', repaymentDate: '2025-08-01T09:15:00Z', clientName: 'Piko Khamis', accountNumber: 'LN-003', paymentReference: 'PAYREF002', status: 'Completed', amount: 275000, currency: 'TZS' },
    { id: 'lr003', repaymentDate: '2025-08-19T16:45:00Z', clientName: 'John Doe', accountNumber: 'LN-005', paymentReference: 'PAYREF003', status: 'Pending', amount: 84000, currency: 'TZS' },
    { id: 'lr004', repaymentDate: '2025-08-06T12:20:00Z', clientName: 'Peter Jones', accountNumber: 'LN-007', paymentReference: 'PAYREF004', status: 'Completed', amount: 48500, currency: 'TZS' },
    { id: 'lr005', repaymentDate: '2025-09-06T15:00:00Z', clientName: 'Mary Williams', accountNumber: 'LN-008', paymentReference: 'PAYREF005', status: 'Pending', amount: 105000, currency: 'TZS' },
    { id: 'lr006', repaymentDate: '2025-08-10T13:30:00Z', clientName: 'Baraka Suleiman', accountNumber: 'LN-011', paymentReference: 'PAYREF006', status: 'Pending', amount: 69000, currency: 'TZS' },
    { id: 'lr007', repaymentDate: '2025-07-15T10:00:00Z', clientName: 'Juma Hassan', accountNumber: 'LN-001', paymentReference: 'PAYREF007', status: 'Failed', amount: 57500, currency: 'TZS' },
    { id: 'lr008', repaymentDate: '2025-09-01T09:15:00Z', clientName: 'Piko Khamis', accountNumber: 'LN-003', paymentReference: 'PAYREF008', status: 'Pending', amount: 275000, currency: 'TZS' },
];

export const loanPackagesData = [
  {
    title: 'Standard',
    slug: 'standard',
    subtitle: 'Enjoy entry level of loan.',
    interest: '2.25%',
    interestType: 'Monthly Interest',
    amount: '1000 USD',
    details: [
      { label: 'Min Amount', value: '1000 USD' },
      { label: 'EMI Type', value: 'Monthly' },
      { label: 'Loan Tenure', value: 'Max 1 year' },
      { label: 'Interest Rates', value: 'Competitive' },
    ],
  },
  {
    title: 'Pro',
    slug: 'pro',
    subtitle: 'Enjoy entry level of loan.',
    interest: '0.75%',
    interestType: 'Weekly Interest',
    amount: '2500 USD',
    details: [
      { label: 'Min Amount', value: '2500 USD' },
      { label: 'EMI Type', value: 'Weekly' },
      { label: 'Loan Tenure', value: 'Max 2 years' },
      { label: 'Interest Rates', value: 'Competitive' },
    ],
  },
  {
    title: 'Platinum',
    slug: 'platinum',
    subtitle: 'Enjoy entry level of loan.',
    interest: '5%',
    interestType: 'Monthly Interest',
    amount: '5000 USD',
    details: [
      { label: 'Min Amount', value: '5000 USD' },
      { label: 'EMI Type', value: 'Monthly' },
      { label: 'Loan Tenure', value: 'Max 5 years' },
      { label: 'Interest Rates', value: 'Competitive' },
    ],
  },
];

// FIX: Added missing loanPackagesDetails mock data.
export const loanPackagesDetails: { [key: string]: any } = {
  standard: {
    eligibility: [
      {
        title: 'Eligibility Criteria',
        content: [
          'Must be a resident of Tanzania.',
          'Minimum age of 21 years.',
          'Stable income source (salaried or self-employed).',
          'Good credit history.',
        ],
      },
      {
        title: 'Income Proof',
        subTabs: [
          {
            title: 'For Salaried',
            content: [
              'Latest 3 months salary slips.',
              'Bank statement for the last 6 months showing salary credit.',
              'Employment letter.',
            ],
          },
          {
            title: 'For Self-Employed',
            content: [
              'Business registration documents.',
              'Bank statement for the last 12 months.',
              'Audited financials for the last 2 years.',
            ],
          },
        ],
      },
    ],
    howToUse: [
      'Purchase of consumer durables.',
      'Funding for education.',
      'Medical emergencies.',
      'Home renovation or repairs.',
      'Debt consolidation.',
    ],
    requiredDocuments: {
      'Proof of Identity': ['National ID Card', 'Passport', 'Driver\'s License'],
      'Proof of Address': ['Utility Bill (not older than 3 months)', 'Bank Statement', 'Rental Agreement'],
      'Proof of Income': ['Salary Slips', 'Bank Statements', 'Business Financials'],
    },
  },
  pro: {
    eligibility: [
      {
        title: 'Eligibility Criteria',
        content: [
          'All criteria from the Standard package.',
          'Minimum monthly income of TZS 1,000,000.',
          'Minimum 2 years of continuous employment or 3 years in business.',
        ],
      },
      {
        title: 'Credit Score',
        content: [
            'A credit score of 680 or higher is preferred.',
            'Applicants with lower scores may be considered with a guarantor.'
        ]
      }
    ],
    howToUse: [
      'Small business expansion.',
      'Purchase of equipment or machinery.',
      'Funding for short-term working capital needs.',
      'Larger personal projects like weddings or travel.',
    ],
    requiredDocuments: {
      'Standard Documents': ['All documents from Standard package'],
      'For Businesses': ['Business Plan', 'Cash Flow Projections', 'Tax Clearance Certificate'],
      'For Salaried': ['Employment Contract', 'Letter of Introduction from Employer'],
    },
  },
  platinum: {
    eligibility: [
      {
        title: 'Eligibility Criteria',
        content: [
          'All criteria from the Pro package.',
          'Minimum monthly income of TZS 3,000,000.',
          'Proven track record of successful loan repayments.',
          'Property ownership is a plus.',
        ],
      },
      {
        title: 'Business Requirements',
        content: [
            'Business must be operational for at least 5 years.',
            'Must provide audited financials for the last 3 years.'
        ]
      }
    ],
    howToUse: [
      'Significant business investments.',
      'Real estate acquisition.',
      'Large-scale projects.',
      'Major life events.',
    ],
    requiredDocuments: {
        'Pro Documents': ['All documents from Pro package'],
        'Additional Documents': ['Collateral documents (if applicable)', 'Audited Financial Statements (3 years)', 'Company Profile'],
    },
  },
};

export const mockLoanOverviewData: LoanOverview[] = [
  { id: 'lo001', loanId: '#203456', amount: 100000, borrowingDate: '2025-01-05T00:00:00Z', repaymentDate: '2025-02-05T00:00:00Z', outstandingBalance: 50000, status: 'Approved', currency: 'TZS' },
  { id: 'lo002', loanId: '#203457', amount: 300000, borrowingDate: '2025-02-04T00:00:00Z', repaymentDate: '2025-03-06T00:00:00Z', outstandingBalance: 200000, status: 'Pending', currency: 'TZS' },
  { id: 'lo003', loanId: '#203458', amount: 400000, borrowingDate: '2025-02-04T00:00:00Z', repaymentDate: '2025-03-06T00:00:00Z', outstandingBalance: 200000, status: 'Overdue', currency: 'TZS' },
  { id: 'lo004', loanId: '#203459', amount: 500000, borrowingDate: '2025-02-04T00:00:00Z', repaymentDate: '2025-03-06T00:00:00Z', outstandingBalance: 200000, status: 'Completed', currency: 'TZS' },
  { id: 'lo005', loanId: '#203460', amount: 700000, borrowingDate: '2025-02-04T00:00:00Z', repaymentDate: '2025-03-06T00:00:00Z', outstandingBalance: 250000, status: 'Overdue', currency: 'TZS' },
  { id: 'lo006', loanId: '#203461', amount: 800000, borrowingDate: '2025-02-04T00:00:00Z', repaymentDate: '2025-03-06T00:00:00Z', outstandingBalance: 300000, status: 'Approved', currency: 'TZS' },
  { id: 'lo007', loanId: '#203462', amount: 150000, borrowingDate: '2025-03-10T00:00:00Z', repaymentDate: '2025-04-10T00:00:00Z', outstandingBalance: 100000, status: 'Pending', currency: 'TZS' },
  { id: 'lo008', loanId: '#203463', amount: 250000, borrowingDate: '2024-12-20T00:00:00Z', repaymentDate: '2025-01-20T00:00:00Z', outstandingBalance: 0, status: 'Completed', currency: 'TZS' },
  { id: 'lo009', loanId: '#203464', amount: 600000, borrowingDate: '2025-02-13T00:00:00Z', repaymentDate: '2025-03-15T00:00:00Z', outstandingBalance: 450000, status: 'Approved', currency: 'TZS' },
  { id: 'lo010', loanId: '#203465', amount: 900000, borrowingDate: '2025-01-28T00:00:00Z', repaymentDate: '2025-02-28T00:00:00Z', outstandingBalance: 800000, status: 'Overdue', currency: 'TZS' },
  { id: 'lo011', loanId: '#203466', amount: 50000, borrowingDate: '2025-04-01T00:00:00Z', repaymentDate: '2025-05-01T00:00:00Z', outstandingBalance: 10000, status: 'Approved', currency: 'TZS' },
  { id: 'lo012', loanId: '#203467', amount: 1200000, borrowingDate: '2025-05-18T00:00:00Z', repaymentDate: '2025-06-18T00:00:00Z', outstandingBalance: 1100000, status: 'Pending', currency: 'TZS' },
  { id: 'lo013', loanId: '#203468', amount: 350000, borrowingDate: '2025-01-29T00:00:00Z', repaymentDate: '2025-03-01T00:00:00Z', outstandingBalance: 50000, status: 'Overdue', currency: 'TZS' },
  { id: 'lo014', loanId: '#203469', amount: 750000, borrowingDate: '2024-11-25T00:00:00Z', repaymentDate: '2024-12-25T00:00:00Z', outstandingBalance: 0, status: 'Completed', currency: 'TZS' },
  { id: 'lo015', loanId: '#203470', amount: 450000, borrowingDate: '2025-03-22T00:00:00Z', repaymentDate: '2025-04-22T00:00:00Z', outstandingBalance: 400000, status: 'Approved', currency: 'TZS' },
];

// FIX: Changed 'amount' values from strings to numbers to match the LoanTransactionReportItem interface.
export const mockLoanTransactionsData: LoanTransactionReportItem[] = [
    { id: 1, transactionId: 'LTXN001', date: getCurrentYearDate(1, '08:22 AM'), channelName: 'Card', amount: 50000, type: 'Outcome', paymentType: 'Loan Payment', status: 'Completed', loanType: 'SME Term Loan', reference: 'REF-SME-001' },
    { id: 2, transactionId: 'LTXN002', date: getCurrentYearDate(5, '02:00 PM'), channelName: 'Mobile Money', amount: 150000, type: 'Income', paymentType: 'Loan acquisition', status: 'Completed', loanType: 'Apartment Purchase Loan', reference: 'REF-HOME-001' },
    { id: 3, transactionId: 'LTXN003', date: getCurrentYearDate(10, '08:00 AM'), channelName: 'Card', amount: 50000, type: 'Outcome', paymentType: 'Loan Payment', status: 'Pending', loanType: 'Apartment Purchase Loan', reference: 'REF-HOME-001' },
    { id: 4, transactionId: 'LTXN004', date: getCurrentYearDate(15, '06:18 PM'), channelName: 'Mobile Money', amount: 2500, type: 'Outcome', paymentType: 'Late fee', status: 'Completed', loanType: 'SME Term Loan', reference: 'REF-SME-001' },
    { id: 5, transactionId: 'LTXN005', date: getCurrentYearDate(20, '06:18 PM'), channelName: 'Card', amount: 12500, type: 'Outcome', paymentType: 'Interest payment', status: 'Completed', loanType: 'Apartment Purchase Loan', reference: 'REF-HOME-001' },
    { id: 6, transactionId: 'LTXN006', date: getCurrentYearDate(25, '06:18 PM'), channelName: 'Mobile Money', amount: 50000, type: 'Outcome', paymentType: 'Loan Payment', status: 'Cancelled', loanType: 'Standard Package', reference: 'REF-PKG-STD-01' },
    { id: 7, transactionId: 'LTXN007', date: getCurrentYearDate(30, '09:45 AM'), channelName: 'Card', amount: 50000, type: 'Outcome', paymentType: 'Loan Payment', status: 'Completed', loanType: 'SME Term Loan', reference: 'REF-SME-001' },
    { id: 8, transactionId: 'LTXN008', date: getCurrentYearDate(32, '11:10 AM'), channelName: 'Mobile Money', amount: 12500, type: 'Outcome', paymentType: 'Interest payment', status: 'Pending', loanType: 'SME Term Loan', reference: 'REF-SME-001' },
    { id: 9, transactionId: 'LTXN009', date: getCurrentYearDate(35, '04:30 PM'), channelName: 'Card', amount: 45000, type: 'Outcome', paymentType: 'Loan Payment', status: 'Completed', loanType: 'Pro Package', reference: 'REF-PKG-PRO-01' },
    { id: 10, transactionId: 'LTXN010', date: getCurrentYearDate(40, '10:05 AM'), channelName: 'Mobile Money', amount: 2500, type: 'Outcome', paymentType: 'Late fee', status: 'Cancelled', loanType: 'Pro Package', reference: 'REF-PKG-PRO-01' },
];

// FIX: Using loose equality to handle potential type mismatches between string from URL params and number in mock data.
export const getLoanTransactionById = (id: number): LoanTransactionReportItem | undefined => {
    // eslint-disable-next-line
    return mockLoanTransactionsData.find(tx => tx.id == id);
};