import React, { useState, useMemo } from 'react';
// FIX: Using namespace import for react-router-dom to handle potential module resolution issues.
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { 
    CircleDollarSign,
    Home,
    Wallet,
    Activity,
    Target,
    BarChart3,
    MessageSquare,
    User,
    HelpCircle,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Users,
    Shield,
    ClipboardList,
    Briefcase,
    FileText,
    Mail
} from 'lucide-react';

// For simple, non-collapsible navigation links
interface NavItem {
    href: string;
    icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
    label: string;
}

// For collapsible navigation items
interface CollapsibleNavItem {
    isCollapsible: true;
    label: string;
    icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
    children: { href: string; label: string; }[];
}


const NavLink: React.FC<{ item: NavItem, isCollapsed: boolean }> = ({ item, isCollapsed }) => {
    const location = useLocation();
    const isActive = location.pathname === item.href;

    return (
        <Link
            to={item.href}
            className={`relative flex items-center px-4 py-2.5 rounded-lg transition-colors duration-200 group ${
                isActive
                    ? 'bg-emerald-50 text-primary font-semibold'
                    : 'text-gray-500 hover:bg-gray-100 hover:text-primary'
            }`}
        >
            {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 bg-primary rounded-r-full"></div>}
            {React.cloneElement(item.icon, { className: 'flex-shrink-0' })}
            {!isCollapsed && <span className="ml-4">{item.label}</span>}
            {isCollapsed && (
                <span className="absolute left-full ml-4 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 z-10">
                    {item.label}
                </span>
            )}
        </Link>
    );
}

const CollapsibleMenu: React.FC<{ item: CollapsibleNavItem, isCollapsed: boolean }> = ({ item, isCollapsed }) => {
    const location = useLocation();
    const isParentActive = item.children.some(child => location.pathname.startsWith(child.href));
    const [isOpen, setIsOpen] = useState(isParentActive);

    if (isCollapsed) {
        return (
            <div className="relative flex items-center px-4 py-2.5 rounded-lg text-gray-500 group cursor-pointer">
                {React.cloneElement(item.icon, { className: 'flex-shrink-0' })}
                <span className="absolute left-full ml-4 w-max px-2 py-1 bg-gray-800 text-white text-xs rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 z-10">
                    {item.label}
                </span>
            </div>
        );
    }

    return (
        <div>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors duration-200 group ${
                    isParentActive ? 'text-primary font-semibold bg-emerald-50' : 'text-gray-500 hover:bg-gray-100 hover:text-primary'
                }`}
            >
                <div className="flex items-center">
                    {React.cloneElement(item.icon, { className: 'flex-shrink-0' })}
                    <span className="ml-4">{item.label}</span>
                </div>
                <ChevronRight size={16} className={`transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
            </button>
            {isOpen && (
                <div className="mt-1 space-y-1">
                    {item.children.map(child => {
                        const isActive = location.pathname.startsWith(child.href);
                        return (
                            <Link
                                key={child.label}
                                to={child.href}
                                className={`relative flex items-center pl-12 pr-4 py-2 rounded-lg text-sm transition-colors duration-200 group ${
                                    isActive ? 'text-primary font-semibold' : 'text-gray-500 hover:text-primary'
                                }`}
                            >
                                {isActive && <div className="absolute left-6 top-1/2 -translate-y-1/2 h-1.5 w-1.5 bg-primary rounded-full"></div>}
                                {child.label}
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};


const Sidebar: React.FC<{
    isCollapsed: boolean;
    setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ isCollapsed, setIsCollapsed }) => {
    const { user, logout } = useAuth();
    const isMobile = window.innerWidth < 1024;

    const generalNavItems: (NavItem | CollapsibleNavItem)[] = [
        { href: '/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
        { href: '/my-wallet', icon: <Wallet size={20} />, label: 'My Wallet' },
        { href: '/activity', icon: <Activity size={20} />, label: 'Activity' },
        { href: '/goals', icon: <Target size={20} />, label: 'Goals' },
        {
            isCollapsible: true,
            label: 'Groups',
            icon: <Users size={20} />,
            children: [
                { href: '/group-saving', label: 'Group Saving' },
                { href: '/my-contributions', label: 'My Contributions' },
                { href: '/contributions', label: 'Contributions' },
                { href: '/members', label: 'Members' },
            ],
        },
        { href: '/messages', icon: <MessageSquare size={20} />, label: 'Message' },
    ];
    
    const navItemsToRender = useMemo(() => {
        const baseItems = [...generalNavItems];

        if (user?.role === UserRole.PlatformAdmin) {
            // Filter out items not relevant for admin
            let adminItems = baseItems.filter(item => 
                'href' in item && item.label !== 'Goals' && 
                item.label !== 'My Wallet' &&
                item.label !== 'Groups'
            );
            
            const dashboardIndex = adminItems.findIndex(item => 'href' in item && item.label === 'Dashboard');
            
            // Check permissions for admin specific links
            const canViewUsers = user?.permissions?.includes('VIEW_USERS');
            const canOnboardUsers = user?.permissions?.includes('ONBOARD_USER');
            
            // Roles page is hidden if user has no VIEW_ROLES/MANAGE_ROLES OR if they have no CREATE_PERMISSION/EDIT_PERMISSION
            const hasRolesViewPerm = user?.permissions?.includes('VIEW_ROLES') || user?.permissions?.includes('MANAGE_ROLES');
            const hasPermsManagePerm = user?.permissions?.includes('CREATE_PERMISSION') || user?.permissions?.includes('EDIT_PERMISSION');
            const canViewRoles = hasRolesViewPerm && hasPermsManagePerm;
            const canViewPermissions = user?.permissions?.includes('VIEW_PERMISSIONS');

            const itemsToAdd: (NavItem | CollapsibleNavItem)[] = [];

            // Add 'Users' link if permitted
            if (canViewUsers) {
                itemsToAdd.push({
                    href: '/users/list',
                    icon: <Users size={20} />,
                    label: 'Users'
                });
            }

            // Add Roles & Perms based on permissions
            const rolesPermsChildren = [];
            if (canViewRoles) {
                rolesPermsChildren.push({ href: '/users/roles', label: 'Roles' });
            }
            if (canViewPermissions) {
                rolesPermsChildren.push({ href: '/users/permissions', label: 'Permissions' });
            }

            if (rolesPermsChildren.length > 0) {
                itemsToAdd.push({
                    isCollapsible: true,
                    label: 'Roles & Perms',
                    icon: <Shield size={20} />,
                    children: rolesPermsChildren
                });
            }
            
            // Add 'Onboarding' link if permitted
            if (canOnboardUsers) {
                itemsToAdd.push({
                    href: '/onboarding/requests',
                    icon: <ClipboardList size={20} />,
                    label: 'Onboarding'
                });
            }

            // Add Reports menu
            const reportsChildren = [];
            if (user?.permissions?.includes('VIEW_DEPOSITS_REPORT')) {
                reportsChildren.push({ href: '/reports/deposits', label: 'Deposits' });
            }
            reportsChildren.push({ href: '/reports/loans', label: 'Loans' });
            reportsChildren.push({ href: '/reports/loan-repayments', label: 'Loan Repayments' });
            if (user?.permissions?.includes('VIEW_TRANSACTIONS_REPORT')) {
                reportsChildren.push({ href: '/reports/transactions', label: 'Transactions' });
            }
            reportsChildren.push({ href: '/reports/investments', label: 'Investments' });

            if (reportsChildren.length > 0) {
                itemsToAdd.push({
                    isCollapsible: true,
                    label: 'Reports',
                    icon: <BarChart3 size={20} />,
                    children: reportsChildren
                });
            }

            if (dashboardIndex !== -1) {
                // Insert permitted links right after 'Dashboard'
                adminItems.splice(dashboardIndex + 1, 0, ...itemsToAdd);
            } else {
                // Fallback if dashboard isn't found
                adminItems.unshift(...itemsToAdd);
            }
            
            return adminItems;
        }

        if (user?.role === UserRole.Borrower) {
            // Filter out menus not relevant for borrowers (Wallet, Activity, Goals, Groups).
            const borrowerItems = baseItems.filter(item => !['My Wallet', 'Activity', 'Goals', 'Groups'].includes(item.label));
            
            // Create the new 'Loans' collapsible menu.
            const loansMenu: CollapsibleNavItem = {
                isCollapsible: true,
                label: 'Loans',
                icon: <Briefcase size={20} />,
                children: [
                    { href: '/apply', label: 'Application' },
                    { href: '/loans/packages', label: 'Packages' },
                ],
            };
            
            const reportsMenu: CollapsibleNavItem = {
                isCollapsible: true,
                label: 'Reports',
                icon: <BarChart3 size={20} />,
                children: [
                    { href: '/reports/loan-list', label: 'Loan List' },
                    { href: '/reports/transactions', label: 'Transactions' },
                ],
            };
            
            // Add the 'Loans' and 'Reports' menus after 'Dashboard'.
            const dashboardIndex = borrowerItems.findIndex(item => 'href' in item && item.href === '/dashboard');
            if (dashboardIndex !== -1) {
                borrowerItems.splice(dashboardIndex + 1, 0, loansMenu, reportsMenu);
            }
            
            return borrowerItems;
        }
        
        if (user?.role === UserRole.Saver || user?.role === UserRole.GroupAdmin) {
            let saverItems = [...baseItems];
            const groupsIndex = saverItems.findIndex(item => 'isCollapsible' in item && item.label === 'Groups');

            const reportsMenu: CollapsibleNavItem = {
                isCollapsible: true,
                label: 'Reports',
                icon: <BarChart3 size={20} />,
                children: [
                    { href: '/reports/savings', label: 'Savings' },
                    { href: '/reports/withdrawals', label: 'Withdrawals' },
                    { href: '/reports/ledger', label: 'Ledger' },
                ],
            };

            if (groupsIndex !== -1) {
                saverItems.splice(groupsIndex + 1, 0, reportsMenu);
            } else {
                // Fallback if Groups menu isn't found
                saverItems.push(reportsMenu);
            }
            
            if (user.isSolo) {
                // Adjust Groups menu for solo savers
                saverItems = saverItems.map(item => {
                    if ('isCollapsible' in item && item.label === 'Groups') {
                        return {
                            ...item,
                            children: [
                                { href: '/group-saving', label: 'Group Saving' },
                                { href: '/my-contributions', label: 'My Contributions' },
                            ]
                        };
                    }
                    return item;
                });
            }
            
            return saverItems;
        }
        
        // For other users (Investor)
        return baseItems;
    }, [user]);
    
    const otherNavItemsToRender = useMemo(() => {
        const items: (NavItem | CollapsibleNavItem)[] = [];

        if (user?.role === UserRole.Saver || user?.role === UserRole.GroupAdmin) {
            items.push({
                isCollapsible: true,
                label: 'Help & Support',
                icon: <HelpCircle size={20} />,
                children: [
                    { href: '/faq', label: 'FAQ' },
                    { href: '/contact', label: 'Contact Us' }
                ]
            });
        } else {
            items.push({ href: '#', label: 'Help Support', icon: <HelpCircle size={20}/> });
        }
        
        if (user?.role === UserRole.PlatformAdmin) {
            items.push({ href: '/profile', icon: <User size={20} />, label: 'Profile' });
            
            const configChildren = [];
            
            if (user?.permissions?.includes('MODULE_CONFIGURATIONS')) {
                configChildren.push({ href: '/configurations/module-configs', label: 'Module Configs' });
            }

            configChildren.push({ href: '/configurations/modules', label: 'Modules' });

            if (user?.permissions?.includes('VIEW_DOCUMENT_TYPES')) {
                configChildren.push({ href: '/configurations/document-types', label: 'Document Types' });
            }

            if (user?.permissions?.includes('VIEW_DOCUMENT_GROUPS')) {
                configChildren.push({ href: '/configurations/document-groups', label: 'Document Groups' });
            }

            if (user?.permissions?.includes('VIEW_APPROVAL_FLOW')) {
                configChildren.push({ href: '/configurations/approval-flows', label: 'Approval Flows' });
            }

            items.push({
                isCollapsible: true,
                label: 'Configurations',
                icon: <Settings size={20} />,
                children: configChildren,
            });
        } else {
            items.push({ href: '/settings', icon: <Settings size={20} />, label: 'Settings' });
        }
        
        return items;
    }, [user]);

    const sidebarClasses = `
        fixed inset-y-0 left-0 z-30 flex flex-col bg-white border-r border-gray-200 transition-all duration-300
        ${isCollapsed ? 'w-20' : 'w-64'}
        ${isMobile && !isCollapsed ? 'shadow-xl' : ''}
    `;

    return (
        <div className={sidebarClasses}>
             <button 
                onClick={() => setIsCollapsed(prev => !prev)}
                className="absolute -right-4 top-20 z-10 bg-white border-2 border-gray-200 rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
                aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
                {isCollapsed ? <ChevronRight size={16} className="text-gray-600" /> : <ChevronLeft size={16} className="text-gray-600" />}
            </button>
            <div className={`flex items-center h-20 px-6 ${isCollapsed ? 'justify-center' : ''}`}>
                <CircleDollarSign size={32} className="text-primary flex-shrink-0" />
                {!isCollapsed && <h1 className="text-2xl font-bold text-primary ml-2 whitespace-nowrap">PesaFlow</h1>}
            </div>
            
            <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
                {!isCollapsed && <h2 className="px-4 mb-2 text-sm font-semibold text-gray-400">General</h2>}
                {navItemsToRender.map(item => {
                    if ('isCollapsible' in item) {
                        return <CollapsibleMenu key={item.label} item={item} isCollapsed={isCollapsed} />;
                    }
                    return <NavLink key={item.label} item={item} isCollapsed={isCollapsed} />;
                })}
                
                {!isCollapsed && <div className="pt-4"><h2 className="px-4 mb-2 text-sm font-semibold text-gray-400">Other</h2></div>}
                {otherNavItemsToRender.map(item => {
                    if ('isCollapsible' in item) {
                        return <CollapsibleMenu key={item.label} item={item} isCollapsed={isCollapsed} />;
                    }
                    return <NavLink key={item.label} item={item} isCollapsed={isCollapsed} />;
                })}
            </nav>

            <div className="px-4 py-6 border-t border-gray-200">
                <button 
                    onClick={logout} 
                    className={`w-full flex items-center px-4 py-2.5 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors duration-200 ${isCollapsed ? 'justify-center' : ''}`}
                >
                    <LogOut size={20} />
                    {!isCollapsed && <span className="ml-4 font-medium">Log Out</span>}
                </button>
            </div>
        </div>
    );
};

export default Sidebar;