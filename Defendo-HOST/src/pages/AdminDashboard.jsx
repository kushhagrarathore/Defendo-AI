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
          submittedDocuments: 0,
          approvedDocuments: 0,
          rejectedDocuments: 0
        };
      }
      
      grouped[companyId].documents.push(req);
      grouped[companyId].totalDocuments++;
      
      if (req.status === 'pending') {
        grouped[companyId].pendingDocuments++;
      } else if (req.status === 'submitted') {
        grouped[companyId].submittedDocuments++;
      } else if (req.status === 'approved') {
        grouped[companyId].approvedDocuments++;
      } else if (req.status === 'rejected') {
        grouped[companyId].rejectedDocuments++;
      }
    });
    
    return grouped;
  };

  const getSignedUrl = async (path) => {
    if (!path) return null;
    try {
      console.log("Creating signed URL for path:", path);
      
      // First check if the file exists
      const { data: files, error: listError } = await supabase.storage
        .from('host-kyc-documents')
        .list(path.split('/').slice(0, -1).join('/'), {
          search: path.split('/').pop()
        });

      if (listError) {
        console.error("Error listing files:", listError);
        return null;
      }

      if (!files || files.length === 0) {
        console.log("File not found in storage");
        return null;
      }

      const { data, error } = await supabase.storage
        .from('host-kyc-documents')
        .createSignedUrl(path, 3600); // 1 hour expiry

      if (error) {
        console.error("Error creating signed URL:", error);
        return null;
      }

      console.log("Signed URL created successfully:", data.signedUrl);
      return data.signedUrl;
    } catch (error) {
      console.error("Error in getSignedUrl:", error);
      return null;
    }
  };

  const fetchKyc = async () => {
    try {
      setLoading(true);
      console.log("Fetching KYC requests...");
      
      // First, let's get all KYC records to see what we have
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
      
      // Fetch host KYC documents - include all major statuses
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
        .in("status", ["pending", "submitted", "approved", "rejected"])
        .order("submitted_at", { ascending: false });

      console.log("Filtered KYC data:", hostKycData);
      console.log("Filtered KYC error:", hostKycError);
      
      // If no data with inner join, try without join to see if it's a join issue
      if (!hostKycData || hostKycData.length === 0) {
        console.log("Trying without inner join...");
        const { data: simpleKycData, error: simpleKycError } = await supabase
          .from("host_kyc")
          .select("*")
          .in("status", ["pending", "submitted", "approved", "rejected"])
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
            .in("status", ["pending", "submitted", "approved", "rejected"])
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

      // Process each request to get signed URLs
      const withUrls = await Promise.all(
        hostKycData.map(async (req) => {
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

  const handleDecision = async (id, decision, reason = null) => {
    try {
      setProcessing(id);
      console.log(`Processing ${decision} for KYC request ${id}`);

      const { error } = await supabase
        .from("host_kyc")
        .update({
          status: decision,
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason || null,
        })
        .eq("id", id);

      if (error) {
        console.error(`Error ${decision} KYC request:`, error);
        alert(`Failed to ${decision} request: ${error.message}`);
        return;
      }

      console.log(`Successfully ${decision} KYC request ${id}`);

      // Optimistically update local state for immediate UI feedback
      setKycRequests(prev => prev.map(item => item.id === id ? { ...item, status: decision, reviewed_at: new Date().toISOString(), rejection_reason: decision === 'rejected' ? (reason || null) : null } : item));
      setGroupedByCompany(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(companyId => {
          updated[companyId] = {
            ...updated[companyId],
            documents: updated[companyId].documents.map(doc => doc.id === id ? { ...doc, status: decision, reviewed_at: new Date().toISOString(), rejection_reason: decision === 'rejected' ? (reason || null) : null } : doc)
          };
        });
        return updated;
      });

      // Update the currently selected company's documents immediately
      setSelectedCompany(prev => prev ? {
        ...prev,
        documents: prev.documents.map(doc => doc.id === id ? { ...doc, status: decision, reviewed_at: new Date().toISOString(), rejection_reason: decision === 'rejected' ? (reason || null) : null } : doc)
      } : prev);

      alert(`Request ${decision} successfully!`);

      // Refresh the data in background
      fetchKyc();
    } catch (error) {
      console.error(`Error in handleDecision:`, error);
      alert(`Error processing request: ${error.message}`);
    } finally {
      setProcessing(null);
    }
  };

  useEffect(() => {
    fetchKyc();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--primary-color)]/30 border-t-[var(--primary-color)] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60 text-lg">Loading KYC requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
              <p className="text-white/60 mt-1">KYC Document Verification</p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center space-x-2 px-4 py-2 bg-white/5 border border-white/10 text-white/60 rounded-lg hover:bg-white/10 transition-all duration-300"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Back to Dashboard</span>
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

          {Object.keys(groupedByCompany).length === 0 ? (
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
          ) : selectedCompany ? (
            // Show documents for selected company
            <div className="space-y-4">
              {selectedCompany.documents.map((req, index) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Document Info */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary-color)] to-teal-400 rounded-full flex items-center justify-center">
                          <span className="material-symbols-outlined text-white">
                            description
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white capitalize">
                            {req.document_type.replace('_', ' ')}
                          </h3>
                          <p className="text-white/60">Document Type</p>
                          <p className="text-white/40 text-sm">
                            Submitted: {new Date(req.submitted_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Document Preview */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-white font-medium">Document Preview</h4>
                        <button
                          onClick={async () => {
                            const newUrl = await getSignedUrl(req.document_url);
                            if (newUrl) {
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
                        {req.documentUrl ? (
                          <div className="space-y-3">
                            <div className="relative border border-white/10 rounded-lg overflow-hidden">
                              {/* Status badge overlay */}
                              <div className={`absolute top-2 left-2 z-10 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border
                                ${req.status === 'approved' ? 'bg-green-500/10 border-green-500/20 text-green-300' : ''}
                                ${req.status === 'rejected' ? 'bg-red-500/10 border-red-500/20 text-red-300' : ''}
                                ${req.status === 'pending' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300' : ''}
                                ${req.status === 'submitted' ? 'bg-blue-500/10 border-blue-500/20 text-blue-300' : ''}
                              `}>
                                {req.status === 'approved' ? 'Approved' :
                                 req.status === 'rejected' ? 'Rejected' :
                                 req.status === 'pending' ? 'Pending' :
                                 req.status === 'submitted' ? 'Submitted' : req.status}
                              </div>
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
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          req.status === 'pending' ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400' :
                          req.status === 'submitted' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' :
                          req.status === 'approved' ? 'bg-green-500/10 border border-green-500/20 text-green-400' :
                          req.status === 'rejected' ? 'bg-red-500/10 border border-red-500/20 text-red-400' :
                          'bg-gray-500/10 border border-gray-500/20 text-gray-400'
                        }`}>
                          {req.status === 'pending' ? 'Pending Review' : 
                           req.status === 'submitted' ? 'Submitted' :
                           req.status === 'approved' ? 'Approved' :
                           req.status === 'rejected' ? 'Rejected' : req.status}
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
            </div>
          ) : (
            // Show company list
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.values(groupedByCompany).map((company, index) => (
                <motion.div
                  key={company.companyId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedCompany(company)}
                  className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-lg cursor-pointer hover:bg-white/10 hover:border-[var(--primary-color)]/30 transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[var(--primary-color)] to-teal-400 rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-white">
                        business
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white group-hover:text-[var(--primary-color)] transition-colors">
                        {company.companyName}
                      </h3>
                      <p className="text-white/60 text-sm">{company.hostName}</p>
                      <p className="text-white/40 text-xs">{company.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">Total Documents:</span>
                      <span className="text-white font-semibold">{company.totalDocuments}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">Pending:</span>
                      <span className="text-yellow-400 font-semibold">{company.pendingDocuments}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">Submitted:</span>
                      <span className="text-blue-400 font-semibold">{company.submittedDocuments}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-white/60 text-sm">Click to view documents</span>
                      <span className="material-symbols-outlined text-white/40 group-hover:text-[var(--primary-color)] transition-colors">
                        arrow_forward
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


