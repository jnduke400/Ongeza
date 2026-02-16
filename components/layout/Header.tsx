import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Bell, Search, Mail, Loader2, ShieldCheck, Menu } from 'lucide-react';
import { UserRole } from '../../types';
import { API_BASE_URL } from '../../services/apiConfig';
import { interceptedFetch } from '../../services/api';

interface HeaderProps {
  onMenuToggle: () => void;
  isMobile?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMobile }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  const showPinNotification = user?.role === UserRole.Saver && user.pinSet === false;

  const fetchNotifications = useCallback(async () => {
    // Only fetch if we have a user, a token, and a network connection
    const token = localStorage.getItem('accessToken');
    if (!user || !token || !navigator.onLine) return;

    try {
      setLoading(true);
      // Fetch latest notifications
      const res = await interceptedFetch(`${API_BASE_URL}/api/v1/notifications?page=0&size=5&sort=createdAt,desc`);
      
      if (!res.ok) return; // Exit quietly on server errors in polling
      
      const result = await res.json();
      if (result.success && result.data) {
        setNotifications(result.data.content || []);
      }

      // Fetch unread count
      const countRes = await interceptedFetch(`${API_BASE_URL}/api/v1/notifications/unread-count`);
      if (countRes.ok) {
        const countResult = await countRes.json();
        if (countResult.success) {
          setUnreadCount(countResult.data);
        }
      }
    } catch (error) {
      // Catch network errors silenty to prevent intrusive console errors
      console.debug("Notification sync temporarily unavailable");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll every 60 seconds for new notifications
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [user, fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (id?: number) => {
    setIsNotificationOpen(false);
    navigate('/messages');
  };

  if (!user) return null;

  // Helper to format role name to Title Case (e.g., 'platform_admin' -> 'Platform Admin')
  const formatRole = (role: string) => {
    return role
      .replace(/_/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Logic for dynamic greeting based on time of day and loginCount
  const getGreeting = () => {
    const hour = new Date().getHours();
    let timeGreeting = "Good evening"; 
    if (hour >= 5 && hour < 12) {
      timeGreeting = "Good morning";
    } else if (hour >= 12 && hour < 17) {
      timeGreeting = "Good afternoon";
    }

    // Check loginCount from user profile API mapped in AuthContext
    // If loginCount is exactly 0, do not append "welcome back"
    if (user.loginCount === 0) {
      return `${timeGreeting}, ${user.firstName}!`;
    }
    
    // Returning user (loginCount > 0)
    return `${timeGreeting} and welcome back, ${user.firstName}!`;
  };

  // Combine real notifications with the static PIN reminder if applicable
  const displayUnreadCount = unreadCount + (showPinNotification ? 1 : 0);

  return (
    <header className="flex items-center justify-between h-20 px-6 bg-background">
      <div className="flex items-center">
        {isMobile && (
          <button 
            onClick={onMenuToggle}
            className="p-2 mr-3 -ml-2 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors"
            aria-label="Toggle mobile menu"
          >
            <Menu size={24} />
          </button>
        )}
        <h1 className="text-xl sm:text-2xl font-bold text-on-surface truncate max-w-[200px] sm:max-w-none">
          {getGreeting()}
        </h1>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-5">
        <button className="p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors">
          <Search size={22} />
        </button>
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setIsNotificationOpen(prev => !prev)}
            className="relative p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors"
          >
            <Bell size={22} />
            {displayUnreadCount > 0 && (
              <span className="absolute top-0 right-0 flex items-center justify-center h-5 min-w-[20px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold border-2 border-background">
                {displayUnreadCount > 9 ? '9+' : displayUnreadCount}
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-3 w-72 sm:w-80 bg-white rounded-xl shadow-2xl z-50 border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-4 flex justify-between items-center border-b border-gray-50 bg-gray-50/30">
                <h3 className="font-bold text-gray-800">Notification</h3>
                <div className="flex items-center space-x-3">
                  {displayUnreadCount > 0 && (
                    <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                      {displayUnreadCount} New
                    </span>
                  )}
                  <button onClick={() => navigate('/messages')} className="text-gray-400 hover:text-primary transition-colors">
                    <Mail size={18}/>
                  </button>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto custom-scrollbar">
                {loading && notifications.length === 0 ? (
                  <div className="py-12 flex justify-center">
                    <Loader2 size={24} className="animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    {/* PIN Setup Notification */}
                    {showPinNotification && (
                      <div 
                        onClick={() => { setIsNotificationOpen(false); navigate('/set-pin'); }}
                        className="px-4 py-4 hover:bg-gray-50 border-b border-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start space-x-3">
                          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 text-amber-600">
                            <ShieldCheck size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-800 text-sm">Set up your PIN 🛡️</p>
                            <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">Enhance your security and access your account faster.</p>
                            <p className="text-[10px] text-gray-400 mt-1">Just now</p>
                          </div>
                          <span className="w-2.5 h-2.5 bg-primary rounded-full mt-1.5 flex-shrink-0"></span>
                        </div>
                      </div>
                    )}

                    {/* Real Notifications */}
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div 
                          key={n.id}
                          onClick={() => handleNotificationClick(n.id)}
                          className={`px-4 py-4 hover:bg-gray-50 border-b border-gray-50 cursor-pointer transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-indigo-600 font-bold text-sm">
                              {n.title.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${!n.read ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                                {n.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                                {n.message}
                              </p>
                              <p className="text-[10px] text-gray-400 mt-1">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {!n.read && (
                              <span className="w-2 h-2 bg-indigo-500 rounded-full mt-2 flex-shrink-0"></span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : !showPinNotification && (
                      <div className="px-4 py-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Bell size={24} className="text-gray-300" />
                        </div>
                        <p className="text-gray-500 text-sm font-medium">You have no new notifications.</p>
                      </div>
                    )}
                  </>
                )}
              </div>
              
              <div className="p-3 border-t border-gray-50 text-center bg-gray-50/30">
                <button 
                  onClick={() => { setIsNotificationOpen(false); navigate('/messages'); }}
                  className="text-sm font-bold text-primary hover:text-primary-dark transition-colors"
                >
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3 border-l border-gray-200 pl-3 sm:pl-5">
          <img className="h-9 w-9 sm:h-10 sm:h-10 rounded-full object-cover shadow-sm ring-2 ring-white" src={user.avatar} alt="User avatar" />
          <div className="hidden md:block">
            <p className="font-bold text-sm text-gray-800 leading-tight">{user.firstName} {user.lastName}</p>
            <p className="text-[11px] text-gray-400 tracking-wider mt-0.5">{formatRole(user.role)}</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;