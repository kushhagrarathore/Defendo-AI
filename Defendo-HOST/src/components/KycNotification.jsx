import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';

export default function KycNotification() {
  const [notifications, setNotifications] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Listen for notifications (INSERT) and KYC status changes for the current user
    let channel;
    let notifChannel;
    (async () => {
      const { data } = await supabase.auth.getUser();
      const userId = data?.user?.id;
      if (!userId) return;

      channel = supabase
        .channel('kyc_status_changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'host_kyc',
            filter: `host_id=eq.${userId}`
          },
          async (payload) => {
            if (payload.new.status === 'approved') {
              showNotification({
                type: 'success',
                title: 'KYC Approved! 🎉',
                message: 'Your KYC documents have been approved by our admin team.',
                timestamp: new Date().toISOString()
              });

              // After an approval, check if ALL documents are approved
              const { data: allDocs } = await supabase
                .from('host_kyc')
                .select('status')
                .eq('host_id', userId);
              if (allDocs && allDocs.length > 0) {
                const statuses = allDocs.map(d => d.status);
                const hasRejected = statuses.includes('rejected');
                const hasPendingOrSubmitted = statuses.some(s => s === 'pending' || s === 'submitted');
                const hasApproved = statuses.includes('approved');
                if (!hasRejected && !hasPendingOrSubmitted && hasApproved) {
                  showNotification({
                    type: 'success',
                    title: 'All Documents Approved ✅',
                    message: 'Great news! All your KYC documents are approved. Your account is fully verified.',
                    timestamp: new Date().toISOString()
                  });
                }
              }
            } else if (payload.new.status === 'rejected') {
              showNotification({
                type: 'error',
                title: 'KYC Rejected',
                message: payload.new.rejection_reason || 'Your KYC documents have been rejected. Please review and resubmit.',
                timestamp: new Date().toISOString()
              });
            }
          }
        )
        .subscribe();

      // New: Listen for notifications inserts targeting this host
      notifChannel = supabase
        .channel('host_notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          },
          (payload) => {
            const n = payload.new || {};
            const isSuccess = (n.type || '').includes('verification') && (n.title || '').toLowerCase().includes('verified');
            showNotification({
              type: isSuccess ? 'success' : 'info',
              title: n.title || 'Notification',
              message: n.message || '',
              timestamp: n.created_at || new Date().toISOString()
            });
          }
        )
        .subscribe();
    })();

    return () => {
      if (channel) supabase.removeChannel(channel);
      if (notifChannel) supabase.removeChannel(notifChannel);
    };
  }, []);

  const showNotification = (notification) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { ...notification, id }]);
    setIsVisible(true);
    
    // Auto-hide after 5 seconds
    const to = setTimeout(() => { removeNotification(id) }, 5000)
    return () => clearTimeout(to)
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
    if (notifications.length === 1) {
      setIsVisible(false);
    }
  };

  if (!isVisible || notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`max-w-sm bg-white rounded-lg shadow-lg border-l-4 p-4 ${
              notification.type === 'success' 
                ? 'border-green-500 bg-green-50' 
                : 'border-red-500 bg-red-50'
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✕</span>
                  </div>
                )}
              </div>
              <div className="ml-3 flex-1">
                <h4 className={`text-sm font-medium ${
                  notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                }`}>
                  {notification.title}
                </h4>
                <p className={`text-sm mt-1 ${
                  notification.type === 'success' ? 'text-green-700' : 'text-red-700'
                }`}>
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}


