import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

export default function KycStatusCard({ userId }) {
  const [kycStatus, setKycStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKycStatus();
    // Live updates: refresh status when this host's KYC changes
    let channel;
    let profileChannel;
    (async () => {
      if (!userId) return;
      channel = supabase
        .channel('kyc_status_card')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'host_kyc', filter: `provider_id=eq.${userId}` },
          () => fetchKycStatus()
        )
        .subscribe();

      // Also listen for host_profiles.verified updates
      profileChannel = supabase
        .channel('kyc_status_card_profile')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'host_profiles', filter: `id=eq.${userId}` },
          () => fetchKycStatus()
        )
        .subscribe();
    })();

    return () => { if (channel) supabase.removeChannel(channel); if (profileChannel) supabase.removeChannel(profileChannel); };
  }, [userId]);

  const fetchKycStatus = async () => {
    try {
      setLoading(true);
      
      // Get all KYC records for this host
      const { data: kycRecords, error } = await supabase
        .from('host_kyc')
        .select('*')
        .eq('provider_id', userId)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching KYC status:', error);
        return;
      }

      // Fetch company verification flag
      const { data: profile, error: profileError } = await supabase
        .from('host_profiles')
        .select('verified')
        .eq('id', userId)
        .maybeSingle();
      if (profileError) {
        console.error('Error fetching profile verification:', profileError);
      }

      if (kycRecords && kycRecords.length > 0) {
        // Determine overall status
        const statuses = kycRecords.map(record => record.status);
        const hasApproved = statuses.includes('approved');
        const hasRejected = statuses.includes('rejected');
        const hasPending = statuses.includes('pending') || statuses.includes('submitted');
        
        // If admin marked company verified, treat as approved regardless of per-document states
        let overallStatus = 'pending';
        if (profile?.verified) {
          overallStatus = 'approved';
        } else if (hasRejected) {
          overallStatus = 'rejected';
        } else if (hasApproved && !hasPending) {
          overallStatus = 'approved';
        } else if (hasPending) {
          overallStatus = 'pending';
        }

        // If verified by admin, reflect all approved in counts for a clear message
        if (profile?.verified) {
          setKycStatus({
            overallStatus: 'approved',
            totalDocuments: kycRecords.length,
            approvedDocuments: kycRecords.length,
            rejectedDocuments: 0,
            pendingDocuments: 0,
            lastUpdated: new Date().toISOString()
          });
        } else {
          setKycStatus({
            overallStatus,
            totalDocuments: kycRecords.length,
            approvedDocuments: statuses.filter(s => s === 'approved').length,
            rejectedDocuments: statuses.filter(s => s === 'rejected').length,
            pendingDocuments: statuses.filter(s => s === 'pending' || s === 'submitted').length,
            lastUpdated: kycRecords[0]?.reviewed_at || kycRecords[0]?.submitted_at,
            rejectionReason: kycRecords.find(r => r.rejection_reason)?.rejection_reason
          });
        }
      } else {
        // If no KYC rows but profile is verified, still show approved
        if (profile?.verified) {
          setKycStatus({
            overallStatus: 'approved',
            totalDocuments: 0,
            approvedDocuments: 0,
            rejectedDocuments: 0,
            pendingDocuments: 0,
            lastUpdated: new Date().toISOString()
          });
        } else {
          setKycStatus({
            overallStatus: 'not_submitted',
            totalDocuments: 0,
            approvedDocuments: 0,
            rejectedDocuments: 0,
            pendingDocuments: 0
          });
        }
      }
    } catch (error) {
      console.error('Error in fetchKycStatus:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'approved':
        return {
          color: 'green',
          icon: '✓',
          title: 'KYC Approved',
          message: 'Your KYC documents have been approved! You can now access all features.'
        };
      case 'rejected':
        return {
          color: 'red',
          icon: '✕',
          title: 'KYC Rejected',
          message: 'Your KYC documents were rejected. Please review and resubmit.'
        };
      case 'pending':
        return {
          color: 'yellow',
          icon: '⏳',
          title: 'KYC Under Review',
          message: 'Your KYC documents are being reviewed by our admin team.'
        };
      default:
        return {
          color: 'gray',
          icon: '📄',
          title: 'KYC Not Submitted',
          message: 'Please submit your KYC documents to access all features.'
        };
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-white/20 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-white/10 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!kycStatus) return null;

  const config = getStatusConfig(kycStatus.overallStatus);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 ${
        config.color === 'green' ? 'border-green-500/30' :
        config.color === 'red' ? 'border-red-500/30' :
        config.color === 'yellow' ? 'border-yellow-500/30' :
        'border-gray-500/30'
      }`}
    >
      <div className="flex items-center space-x-4">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          config.color === 'green' ? 'bg-green-500/20' :
          config.color === 'red' ? 'bg-red-500/20' :
          config.color === 'yellow' ? 'bg-yellow-500/20' :
          'bg-gray-500/20'
        }`}>
          <span className="text-2xl">{config.icon}</span>
        </div>
        
        <div className="flex-1">
          <h3 className={`text-lg font-semibold ${
            config.color === 'green' ? 'text-green-400' :
            config.color === 'red' ? 'text-red-400' :
            config.color === 'yellow' ? 'text-yellow-400' :
            'text-gray-400'
          }`}>
            {config.title}
          </h3>
          <p className="text-white/60 text-sm mt-1">{config.message}</p>
          
          {kycStatus.rejectionReason && (
            <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded">
              <p className="text-red-400 text-xs">
                <strong>Reason:</strong> {kycStatus.rejectionReason}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Document Statistics */}
      {kycStatus.totalDocuments > 0 && (
        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{kycStatus.totalDocuments}</p>
              <p className="text-white/60 text-xs">Total</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-400">{kycStatus.approvedDocuments}</p>
              <p className="text-white/60 text-xs">Approved</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-400">{kycStatus.rejectedDocuments}</p>
              <p className="text-white/60 text-xs">Rejected</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="mt-4">
        {kycStatus.overallStatus === 'not_submitted' && (
          <button
            onClick={() => window.location.href = '/dashboard/kyc'}
            className="w-full bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/20 text-[var(--primary-color)] rounded-lg py-2 px-4 hover:bg-[var(--primary-color)]/20 transition-all duration-300"
          >
            Submit KYC Documents
          </button>
        )}
        
        {kycStatus.overallStatus === 'rejected' && (
          <button
            onClick={() => window.location.href = '/dashboard/kyc'}
            className="w-full bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg py-2 px-4 hover:bg-red-500/20 transition-all duration-300"
          >
            Resubmit KYC Documents
          </button>
        )}
        
        {kycStatus.overallStatus === 'pending' && (
          <button
            onClick={() => window.location.href = '/dashboard/kyc'}
            className="w-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-lg py-2 px-4 hover:bg-yellow-500/20 transition-all duration-300"
          >
            View KYC Status
          </button>
        )}
      </div>
    </motion.div>
  );
}


