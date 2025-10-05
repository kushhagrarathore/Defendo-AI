import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [kycRequests, setKycRequests] = useState([]);
  const [groupedByCompany, setGroupedByCompany] = useState({});
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const navigate = useNavigate();

  // Group KYC requests by company
  const groupByCompany = (requests) => {
    const grouped = {};
    requests.forEach(req => {
      const companyName = req.host_profiles?.company_name || req.host_profiles?.full_name || 'Unknown Company';
      const companyId = req.host_profiles?.id || req.host_id;
      
      if (!grouped[companyId]) {
        grouped[companyId] = {
          companyId,
          companyName,
          hostName: req.host_profiles?.full_name || 'N/A',
          email: req.host_profiles?.email || 'N/A',
          documents: [],
          totalDocuments: 0,
          pendingDocuments: 0,
          submittedDocuments: 0
        };
      }
      
      grouped[companyId].documents.push(req);
      grouped[companyId].totalDocuments++;
      
      if (req.status === 'pending') {
        grouped[companyId].pendingDocuments++;
      } else if (req.status === 'submitted') {
        grouped[companyId].submittedDocuments++;
      }
    });
    
    return grouped;
  };

  const getSignedUrl = async (path) => {
    if (!path) return null;
    try {
      console.log("Creating signed URL for path:", path);
      
      // First check if the file exists
      const { data: fileData, error: fileError } = await supabase.storage
        .from("host-kyc-documents")
        .list(path.split('/')[0], {
          search: path.split('/').pop()
        });
      
      if (fileError) {
        console.error("Error checking file existence:", fileError);
        return null;
      }
      
      if (!fileData || fileData.length === 0) {
        console.error("File not found in storage:", path);
        return null;
      }
      
      const { data, error } = await supabase.storage
        .from("host-kyc-documents")
        .createSignedUrl(path, 300); // 5 min
      
      if (error) {
        console.error("Error creating signed URL:", error);
        return null;
      }
      
      console.log("Signed URL created successfully:", data?.signedUrl);
      return data?.signedUrl;
    } catch (error) {
      console.error("Error creating signed URL:", error);
      return null;
    }
  };

  const fetchKyc = async () => {
    setLoading(true);
    try {
      console.log("Fetching KYC requests...");
      
      // First, let's check if we have any KYC records at all
      const { data: allKycData, error: allKycError } = await supabase
        .from("host_kyc")
        .select("*")
        .order("submitted_at", { ascending: false });
      
      console.log("All KYC records:", allKycData);
      console.log("All KYC error:", allKycError);
      
      // Check what statuses exist in the data
      if (allKycData && allKycData.length > 0) {
        const statuses = [...new Set(allKycData.map(record => record.status))];
        console.log("Available statuses in KYC data:", statuses);
      }
      
      // Fetch host KYC documents - check for both pending and submitted status
      const { data: hostKycData, error: hostKycError } = await supabase
        .from("host_kyc")
        .select(`
          *,
          host_profiles!inner(
            id,
            full_name,
            email,
            company_name
          )
        `)
        .in("status", ["pending", "submitted"])
        .order("submitted_at", { ascending: false });

      console.log("Filtered KYC data:", hostKycData);
      console.log("Filtered KYC error:", hostKycError);
      
      // If no data with inner join, try without join to see if it's a join issue
      if (!hostKycData || hostKycData.length === 0) {
        console.log("Trying without inner join...");
        const { data: simpleKycData, error: simpleKycError } = await supabase
          .from("host_kyc")
          .select("*")
          .in("status", ["pending", "submitted"])
          .order("submitted_at", { ascending: false });
        
        console.log("Simple KYC data (no join):", simpleKycData);
        console.log("Simple KYC error:", simpleKycError);
        
        if (simpleKycData && simpleKycData.length > 0) {
          console.log("Join issue detected. Trying with left join...");
          const { data: leftJoinData, error: leftJoinError } = await supabase
            .from("host_kyc")
            .select(`
              *,
              host_profiles(
                id,
                full_name,
                email,
                company_name
              )
            `)
            .in("status", ["pending", "submitted"])
            .order("submitted_at", { ascending: false });
          
          console.log("Left join KYC data:", leftJoinData);
          console.log("Left join KYC error:", leftJoinError);
          
          if (leftJoinData && leftJoinData.length > 0) {
            setKycRequests(leftJoinData);
            return;
          }
        }
      }

      if (hostKycError) {
        console.error("Error fetching host KYC requests:", hostKycError);
        return;
      }

      if (!hostKycData || hostKycData.length === 0) {
        console.log("No KYC requests found");
        setKycRequests([]);
        return;
      }

      console.log("Processing", hostKycData.length, "KYC requests...");
      
      const withUrls = await Promise.all(
        hostKycData.map(async (req) => {
          console.log("Processing request:", req.id, "Document URL:", req.document_url);
          const documentUrl = await getSignedUrl(req.document_url);
          return { ...req, documentUrl };
        })
      );

      console.log("Processed KYC requests with URLs:", withUrls);
      setKycRequests(withUrls);
      
      // Group by company
      const grouped = groupByCompany(withUrls);
      setGroupedByCompany(grouped);
      console.log("Grouped by company:", grouped);
    } catch (error) {
      console.error("Error processing KYC requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (id, status, rejectionReason = null) => {
    setProcessing(id);
    try {
      const updateData = {
        status: status,
        reviewed_at: new Date().toISOString(),
        reviewed_by: (await supabase.auth.getUser()).data.user?.id
      };

      if (rejectionReason) {
        updateData.rejection_reason = rejectionReason;
      }

      const { error } = await supabase
        .from("host_kyc")
        .update(updateData)
        .eq("id", id);

      if (error) {
        console.error("Error updating KYC status:", error);
        return;
      }

      // Remove the processed request from the list
      setKycRequests(prev => prev.filter(req => req.id !== id));
    } catch (error) {
      console.error("Error processing decision:", error);
    } finally {
      setProcessing(null);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin-login");
  };

  useEffect(() => {
    fetchKyc();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[var(--primary-color)]/30 border-t-[var(--primary-color)] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading KYC requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[var(--primary-color)] to-teal-400 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-xl">
                  admin_panel_settings
                </span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
                <p className="text-white/60">KYC Verification Center</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-all duration-300"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total Companies</p>
                <p className="text-3xl font-bold text-white">{Object.keys(groupedByCompany).length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-400 text-xl">
                  business
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Pending Documents</p>
                <p className="text-3xl font-bold text-white">
                  {Object.values(groupedByCompany).reduce((sum, company) => sum + company.pendingDocuments, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-500/10 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-yellow-400 text-xl">
                  pending
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Submitted Documents</p>
                <p className="text-3xl font-bold text-white">
                  {Object.values(groupedByCompany).reduce((sum, company) => sum + company.submittedDocuments, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-green-400 text-xl">
                  check_circle
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-sm">Total Documents</p>
                <p className="text-3xl font-bold text-white">{kycRequests.length}</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-400 text-xl">
                  description
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Company List or Selected Company View */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              {selectedCompany ? `${selectedCompany.companyName} - Documents` : 'Companies with KYC Requests'}
            </h2>
            <div className="flex items-center space-x-3">
              {selectedCompany && (
                <button
                  onClick={() => setSelectedCompany(null)}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 text-white/60 rounded-lg hover:bg-white/10 transition-all duration-300"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  <span>Back to Companies</span>
                </button>
              )}
              <button
                onClick={fetchKyc}
                className="flex items-center space-x-2 px-4 py-2 bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/20 text-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color)]/20 transition-all duration-300"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {kycRequests.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-white/40 text-2xl">
                  check_circle
                </span>
              </div>
              <p className="text-white/60 text-lg">No pending KYC requests</p>
              <p className="text-white/40 text-sm mt-2">All requests have been processed</p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {kycRequests.map((req, index) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Host Info */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary-color)] to-teal-400 rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-white">
                            business
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{req.host_profiles?.full_name || 'N/A'}</h3>
                          <p className="text-white/60">{req.host_profiles?.email}</p>
                          <p className="text-white/40 text-sm">Company: {req.host_profiles?.company_name || 'N/A'}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="material-symbols-outlined text-white/60 text-sm">description</span>
                          <span className="text-white/80 text-sm capitalize">{req.document_type.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="material-symbols-outlined text-white/60 text-sm">schedule</span>
                          <span className="text-white/80 text-sm">
                            Submitted: {new Date(req.submitted_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Document */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-medium">Document</h4>
                        <button
                          onClick={async () => {
                            const newUrl = await getSignedUrl(req.document_url);
                            if (newUrl) {
                              // Update the document URL in the state
                              setKycRequests(prev => 
                                prev.map(item => 
                                  item.id === req.id 
                                    ? { ...item, documentUrl: newUrl }
                                    : item
                                )
                              );
                            }
                          }}
                          className="flex items-center space-x-1 px-3 py-1 bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-all duration-300"
                        >
                          <span className="material-symbols-outlined text-sm">refresh</span>
                          <span>Refresh</span>
                        </button>
                      </div>
                      <div className="space-y-2">
                        <p className="text-white/60 text-sm capitalize">{req.document_type.replace('_', ' ')}</p>
                        {req.documentUrl ? (
                          <div className="space-y-3">
                            <div className="border border-white/10 rounded-lg overflow-hidden">
                              {req.document_type === 'company_registration' || req.document_type === 'pan_card' || req.document_type === 'gst_registration' || req.document_type === 'trade_license' || req.document_type === 'office_address_proof' ? (
                                <iframe
                                  src={req.documentUrl}
                                  title="Document"
                                  className="w-full h-64"
                                  onError={(e) => {
                                    console.error('Error loading document:', e);
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                  }}
                                />
                              ) : (
                                <img
                                  src={req.documentUrl}
                                  alt="Document"
                                  className="w-full h-64 object-cover"
                                  onError={(e) => {
                                    console.error('Error loading document:', e);
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                  }}
                                />
                              )}
                              <div className="hidden w-full h-64 bg-white/5 flex items-center justify-center">
                                <span className="text-white/40 text-sm">Document preview unavailable</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <a
                                href={req.documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 px-3 py-2 bg-[var(--primary-color)]/10 border border-[var(--primary-color)]/20 text-[var(--primary-color)] rounded-lg hover:bg-[var(--primary-color)]/20 transition-all duration-300"
                              >
                                <span className="material-symbols-outlined text-sm">download</span>
                                <span className="text-sm">Download Document</span>
                              </a>
                              <a
                                href={req.documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center space-x-2 px-3 py-2 bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-300"
                              >
                                <span className="material-symbols-outlined text-sm">open_in_new</span>
                                <span className="text-sm">Open in New Tab</span>
                              </a>
                            </div>
                          </div>
                        ) : (
                          <div className="h-64 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center">
                            <span className="text-white/40 text-sm">No document available</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="text-white/60 text-sm">Status:</span>
                        <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-full text-sm">
                          Pending Review
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleDecision(req.id, "approved")}
                          disabled={processing === req.id}
                          className="flex items-center space-x-2 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg hover:bg-green-500/20 transition-all duration-300 disabled:opacity-50"
                        >
                          {processing === req.id ? (
                            <div className="w-4 h-4 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin"></div>
                          ) : (
                            <span className="material-symbols-outlined text-sm">check</span>
                          )}
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => {
                            const reason = prompt("Please provide a reason for rejection (optional):");
                            handleDecision(req.id, "rejected", reason);
                          }}
                          disabled={processing === req.id}
                          className="flex items-center space-x-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-all duration-300 disabled:opacity-50"
                        >
                          {processing === req.id ? (
                            <div className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin"></div>
                          ) : (
                            <span className="material-symbols-outlined text-sm">close</span>
                          )}
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
