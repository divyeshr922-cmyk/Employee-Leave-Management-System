import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bell, CheckCircle2, AlertCircle, Info, Clock, Check } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { formatDateTime } from '../../utils/helpers';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRequest?: (requestId: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onSelectRequest
}) => {
  const { currentUser } = useAuth();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useData();

  if (!currentUser) return null;

  const userNotifications = notifications.filter(n => n.userId === currentUser.id);
  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200"
          >
            {/* Drawer Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-sky-100 text-sky-700 rounded-lg">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">Notifications</h2>
                  <p className="text-xs text-slate-500">
                    {unreadCount > 0 ? `${unreadCount} unread update(s)` : 'All caught up'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllNotificationsRead(currentUser.id)}
                    className="text-xs text-sky-600 hover:text-sky-800 font-medium px-2 py-1 hover:bg-sky-50 rounded transition-colors flex items-center gap-1"
                    id="mark-all-read-btn"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200"
                  id="close-notif-drawer-btn"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {userNotifications.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium">No notifications yet</p>
                </div>
              ) : (
                userNotifications.map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markNotificationRead(n.id);
                      if (n.linkId && onSelectRequest) {
                        onSelectRequest(n.linkId);
                        onClose();
                      }
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      n.isRead
                        ? 'bg-white border-slate-100 opacity-80'
                        : 'bg-sky-50/50 border-sky-100 shadow-2xs'
                    } hover:border-sky-300`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {n.type === 'LEAVE_APPROVED' && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                        {n.type === 'LEAVE_REJECTED' && <AlertCircle className="w-5 h-5 text-rose-500" />}
                        {n.type === 'LEAVE_APPLIED' && <Clock className="w-5 h-5 text-sky-500" />}
                        {n.type === 'INFO_REQUESTED' && <Info className="w-5 h-5 text-amber-500" />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-semibold text-slate-900 truncate">{n.title}</h4>
                          {!n.isRead && (
                            <span className="w-2 h-2 rounded-full bg-sky-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                        <span className="text-[11px] text-slate-400 mt-2 block font-mono">
                          {formatDateTime(n.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
