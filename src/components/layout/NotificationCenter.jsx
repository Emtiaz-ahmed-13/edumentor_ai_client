import { useAuth } from "@clerk/clerk-react";
import {
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Info,
  Loader2,
  Trash2,
  Clock,
  Zap,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { Link } from "react-router";
import notificationService from "../../api/notification.service";

export default function NotificationCenter() {
  const { getToken, isLoaded } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const fetchNotifications = async () => {
    if (!isLoaded) return;
    try {
      const token = await getToken();
      if (!token) return;
      
      const response = await notificationService.getNotifications(token);
      if (response.success) {
        setNotifications(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh every 5 minutes
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isLoaded]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const token = await getToken();
      const response = await notificationService.markAsRead(id, token);
      if (response.success) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "REVISION":
        return <Zap className="w-4 h-4 text-amber-500" />;
      case "GOAL":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl transition-all ${
          isOpen 
            ? "bg-primary text-white shadow-lg shadow-primary/20 scale-110" 
            : "bg-zinc-50 dark:bg-zinc-800 text-zinc-500 hover:text-primary hover:bg-primary/5"
        }`}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white ring-2 ring-white dark:ring-zinc-950 animate-bounce">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 max-h-[480px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl shadow-zinc-200/50 dark:shadow-black/50 overflow-hidden flex flex-col z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/20">
            <h3 className="text-sm font-black tracking-tight text-zinc-900 dark:text-white">Neural Reminders</h3>
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">{unreadCount} Unread</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <div className="bg-zinc-50 dark:bg-zinc-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-300">
                  <Clock className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">No active alerts</p>
                <p className="text-[11px] text-zinc-400 mt-1 px-8">We'll notify you when it's time to study.</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleMarkAsRead(n._id)}
                  className={`group relative p-4 rounded-2xl transition-all cursor-pointer border ${
                    n.isRead 
                      ? "bg-transparent border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-800/50" 
                      : "bg-primary/5 border-primary/10 hover:bg-primary/10"
                  }`}
                >
                  <div className="flex gap-4">
                    <div className={`mt-1 h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                      n.isRead ? "bg-zinc-100 dark:bg-zinc-800" : "bg-white dark:bg-zinc-900 shadow-sm"
                    }`}>
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className={`text-[11px] font-black leading-tight ${n.isRead ? 'text-zinc-500' : 'text-zinc-900 dark:text-white'}`}>
                          {n.title}
                        </h4>
                        {!n.isRead && <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                      </div>
                      <p className={`text-[10px] mt-1 leading-relaxed ${n.isRead ? 'text-zinc-400' : 'text-zinc-600 dark:text-zinc-400 font-medium'}`}>
                        {n.message}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                         <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                         {n.link && (
                           <Link
                             to={n.link}
                             className="text-[9px] font-black uppercase tracking-widest text-primary flex items-center gap-1 hover:underline"
                           >
                             Details <ChevronRight className="w-2.5 h-2.5" />
                           </Link>
                         )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-zinc-50/50 dark:bg-zinc-950/20 border-t border-zinc-100 dark:border-zinc-800 text-center">
            <button 
              onClick={() => setIsOpen(false)}
              className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-primary transition-colors"
            >
              Close Center
            </button>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.1); border-radius: 20px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.2); }
      `}</style>
    </div>
  );
}
