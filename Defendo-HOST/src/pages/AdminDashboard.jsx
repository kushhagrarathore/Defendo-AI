import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [kycRequests, setKycRequests] = useState([]);
  const [groupedByCompany, setGroupedByCompany] = useState({});
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [documentTypeFilter, setDocumentTypeFilter] = useState("all");
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [documentToReject, setDocumentToReject] = useState(null);
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

  // Filtered companies based on search and filters
  const filteredCompanies = useMemo(() => {
    let companies = Object.values(groupedByCompany);
    
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      companies = companies.filter(company => 
        company.companyName.toLowerCase().includes(query) ||
        company.hostName.toLowerCase().includes(query) ||
        company.email.toLowerCase().includes(query)
      );
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      companies = companies.filter(company => {
        if (statusFilter === 'pending') return company.pendingDocuments > 0;
        if (statusFilter === 'submitted') return company.submittedDocuments > 0;
        if (statusFilter === 'approved') return company.approvedDocuments > 0;
        if (statusFilter === 'rejected') return company.rejectedDocuments > 0;
        return true;
      });
    }
    
    return companies;
  }, [groupedByCompany, searchQuery, statusFilter]);

  // Filtered documents for selected company
  const filteredDocuments = useMemo(() => {
    if (!selectedCompany) return [];
    
    let docs = selectedCompany.documents;
    
    if (documentTypeFilter !== 'all') {
      docs = docs.filter(doc => doc.document_type === documentTypeFilter);
    }
    
    if (statusFilter !== 'all') {
      docs = docs.filter(doc => doc.status === statusFilter);
    }
    
    return docs;
  }, [selectedCompany, documentTypeFilter, statusFilter]);

  const getSignedUrl = async (path) => {
    if (!path) return null;
    try {
      const { data, error } = await supabase.storage
        .from('host-kyc-documents')
        .createSignedUrl(path, 3600);
      
      if (error) {
        console.error("Error creating signed URL:", error);
        return null;
      }
      
      return data.signedUrl;
    } catch (error) {
      console.error("Error in getSignedUrl:", error);
      return null;
    }
  };

  const fetchKyc = async () => {
    try {
      setLoading(true);
      
      const { data: hostKycData, error: hostKycError } = await supabase
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

      if (hostKycError) {
        console.error("Error fetching host KYC requests:", hostKycError);
        return;
      }

      if (!hostKycData || hostKycData.length === 0) {
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

      setKycRequests(withUrls);
      
      // Group by company
      const grouped = groupByCompany(withUrls);
      setGroupedByCompany(grouped);
    } catch (error) {
      console.error("Error processing KYC requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (id, decision, reason = null) => {
    try {
      setProcessing(id);

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

      // Optimistically update local state
      setKycRequests(prev => prev.map(item => 
        item.id === id 
          ? { ...item, status: decision, reviewed_at: new Date().toISOString(), rejection_reason: decision === 'rejected' ? (reason || null) : null }
          : item
      ));
      
      setGroupedByCompany(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(companyId => {
          updated[companyId] = {
            ...updated[companyId],
            documents: updated[companyId].documents.map(doc => 
              doc.id === id 
                ? { ...doc, status: decision, reviewed_at: new Date().toISOString(), rejection_reason: decision === 'rejected' ? (reason || null) : null }
                : doc
            )
          };
        });
        return updated;
      });

      setSelectedCompany(prev => prev ? {
        ...prev,
        documents: prev.documents.map(doc => 
          doc.id === id 
            ? { ...doc, status: decision, reviewed_at: new Date().toISOString(), rejection_reason: decision === 'rejected' ? (reason || null) : null }
            : doc
        )
      } : prev);

      // Refresh the data
      fetchKyc();
    } catch (error) {
      console.error(`Error in handleDecision:`, error);
      alert(`Error processing request: ${error.message}`);
    } finally {
      setProcessing(null);
      setShowRejectModal(false);
      setRejectReason("");
      setDocumentToReject(null);
    }
  };

  const openRejectModal = (doc) => {
    setDocumentToReject(doc);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = () => {
    if (documentToReject) {
      handleDecision(documentToReject.id, "rejected", rejectReason);
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const companies = Object.values(groupedByCompany);
    return {
      totalCompanies: companies.length,
      pendingDocuments: companies.reduce((sum, c) => sum + c.pendingDocuments, 0),
      submittedDocuments: companies.reduce((sum, c) => sum + c.submittedDocuments, 0),
      approvedDocuments: companies.reduce((sum, c) => sum + c.approvedDocuments, 0),
      rejectedDocuments: companies.reduce((sum, c) => sum + c.rejectedDocuments, 0),
      totalDocuments: kycRequests.length
    };
  }, [groupedByCompany, kycRequests.length]);

  useEffect(() => {
    fetchKyc();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8fbff] via-white to-[#fdfdff] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--primary-color)]/30 border-t-[var(--primary-color)] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading KYC requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fbff] via-white to-[#fdfdff]">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-extrabold bg-gradient-to-r from-slate-900 via-slate-800 to-[var(--primary-color)] bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <p className="text-slate-600 mt-1">KYC Document Verification & Management</p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 shadow-sm"
            >
              <span className="material-symbols-outlined text-lg">arrow_back</span>
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Total Companies</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalCompanies}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600 text-2xl">business</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pendingDocuments}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-yellow-600 text-2xl">pending</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Submitted</p>
                <p className="text-3xl font-bold text-blue-600">{stats.submittedDocuments}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-600 text-2xl">upload_file</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Approved</p>
                <p className="text-3xl font-bold text-green-600">{stats.approvedDocuments}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-green-600 text-2xl">check_circle</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium mb-1">Total Documents</p>
                <p className="text-3xl font-bold text-slate-900">{stats.totalDocuments}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-600 text-2xl">description</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search companies, names, or emails..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 focus:border-[var(--primary-color)] transition-all"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 focus:border-[var(--primary-color)] transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
            {selectedCompany && (
              <select
                value={documentTypeFilter}
                onChange={(e) => setDocumentTypeFilter(e.target.value)}
                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)]/20 focus:border-[var(--primary-color)] transition-all"
              >
                <option value="all">All Document Types</option>
                <option value="company_registration">Company Registration</option>
                <option value="pan_card">PAN Card</option>
                <option value="gst_registration">GST Registration</option>
                <option value="trade_license">Trade License</option>
                <option value="office_address_proof">Office Address Proof</option>
              </select>
            )}
            <button
              onClick={fetchKyc}
              className="px-6 py-3 bg-gradient-to-r from-[var(--primary-color)] to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-300/40 transition-all duration-300 flex items-center gap-2"
            >
              <span className="material-symbols-outlined">refresh</span>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Company List or Selected Company View */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">
              {selectedCompany ? `${selectedCompany.companyName} - Documents` : 'Companies with KYC Requests'}
            </h2>
            {selectedCompany && (
              <button
                onClick={() => {
                  setSelectedCompany(null);
                  setDocumentTypeFilter("all");
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
              >
                <span className="material-symbols-outlined">arrow_back</span>
                <span>Back to Companies</span>
              </button>
            )}
          </div>

          {Object.keys(groupedByCompany).length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-white rounded-2xl border border-slate-200"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-green-600 text-4xl">check_circle</span>
              </div>
              <p className="text-slate-600 text-lg font-semibold mb-2">No pending KYC requests</p>
              <p className="text-slate-400 text-sm">All requests have been processed</p>
            </motion.div>
          ) : selectedCompany ? (
            // Show documents for selected company
            <div className="space-y-4">
              {filteredDocuments.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
                  <p className="text-slate-600">No documents match the current filters</p>
                </div>
              ) : (
                filteredDocuments.map((req, index) => (
                  <motion.div
                    key={req.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl transition-all"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Document Info */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-gradient-to-br from-[var(--primary-color)] to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="material-symbols-outlined text-white text-2xl">description</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-slate-900 capitalize">
                              {req.document_type.replace(/_/g, ' ')}
                            </h3>
                            <p className="text-slate-600 text-sm">Document Type</p>
                            <p className="text-slate-400 text-xs mt-1">
                              Submitted: {new Date(req.submitted_at).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            req.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                            req.status === 'approved' ? 'bg-green-100 text-green-700' :
                            req.status === 'rejected' ? 'bg-red-100 text-red-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            {req.status === 'pending' ? 'Pending Review' : 
                             req.status === 'submitted' ? 'Submitted' :
                             req.status === 'approved' ? 'Approved' :
                             req.status === 'rejected' ? 'Rejected' : req.status}
                          </span>
                          {req.reviewed_at && (
                            <span className="text-xs text-slate-400">
                              Reviewed: {new Date(req.reviewed_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {req.rejection_reason && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-xs font-semibold text-red-700 mb-1">Rejection Reason:</p>
                            <p className="text-sm text-red-600">{req.rejection_reason}</p>
                          </div>
                        )}
                      </div>

                      {/* Document Preview */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-slate-900 font-semibold">Document Preview</h4>
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
                                setSelectedCompany(prev => prev ? {
                                  ...prev,
                                  documents: prev.documents.map(doc => 
                                    doc.id === req.id 
                                      ? { ...doc, documentUrl: newUrl }
                                      : doc
                                  )
                                } : prev);
                              }
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all text-sm"
                          >
                            <span className="material-symbols-outlined text-sm">refresh</span>
                            <span>Refresh</span>
                          </button>
                        </div>
                        <div className="space-y-3">
                          {req.documentUrl ? (
                            <div className="space-y-3">
                              <div 
                                className="relative border-2 border-slate-200 rounded-xl overflow-hidden cursor-pointer hover:border-[var(--primary-color)] transition-all group"
                                onClick={() => setSelectedDocument(req)}
                              >
                                <div className={`absolute top-3 left-3 z-10 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                  req.status === 'approved' ? 'bg-green-500 text-white' :
                                  req.status === 'rejected' ? 'bg-red-500 text-white' :
                                  req.status === 'pending' ? 'bg-yellow-500 text-white' :
                                  'bg-blue-500 text-white'
                                }`}>
                                  {req.status}
                                </div>
                                {req.document_type === 'company_registration' || req.document_type === 'pan_card' || req.document_type === 'gst_registration' || req.document_type === 'trade_license' || req.document_type === 'office_address_proof' ? (
                                  <iframe
                                    src={req.documentUrl}
                                    title="Document"
                                    className="w-full h-64"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'block';
                                    }}
                                  />
                                ) : (
                                  <img
                                    src={req.documentUrl}
                                    alt="Document"
                                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'block';
                                    }}
                                  />
                                )}
                                <div className="hidden w-full h-64 bg-slate-100 flex items-center justify-center">
                                  <span className="text-slate-400 text-sm">Document preview unavailable</span>
                                </div>
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                  <span className="material-symbols-outlined text-white/0 group-hover:text-white/80 transition-colors text-3xl">
                                    zoom_in
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <a
                                  href={req.documentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[var(--primary-color)] to-emerald-500 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-300/40 transition-all"
                                >
                                  <span className="material-symbols-outlined text-lg">download</span>
                                  <span>Download</span>
                                </a>
                                <a
                                  href={req.documentUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                                >
                                  <span className="material-symbols-outlined text-lg">open_in_new</span>
                                  <span>Open</span>
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div className="h-64 bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center">
                              <span className="text-slate-400 text-sm">No document available</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    {req.status !== 'approved' && req.status !== 'rejected' && (
                      <div className="mt-6 pt-6 border-t border-slate-200">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => handleDecision(req.id, "approved")}
                            disabled={processing === req.id}
                            className="flex items-center gap-2 px-6 py-2.5 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processing === req.id ? (
                              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                              <span className="material-symbols-outlined">check</span>
                            )}
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => openRejectModal(req)}
                            disabled={processing === req.id}
                            className="flex items-center gap-2 px-6 py-2.5 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <span className="material-symbols-outlined">close</span>
                            <span>Reject</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          ) : (
            // Show company list
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCompanies.length === 0 ? (
                <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-200">
                  <p className="text-slate-600">No companies match your search criteria</p>
                </div>
              ) : (
                filteredCompanies.map((company, index) => (
                  <motion.div
                    key={company.companyId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedCompany(company)}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-lg hover:shadow-xl cursor-pointer hover:border-[var(--primary-color)] transition-all duration-300 group"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-[var(--primary-color)] to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="material-symbols-outlined text-white text-2xl">business</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-[var(--primary-color)] transition-colors truncate">
                          {company.companyName}
                        </h3>
                        <p className="text-slate-600 text-sm truncate">{company.hostName}</p>
                        <p className="text-slate-400 text-xs truncate">{company.email}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="text-slate-600 text-xs mb-1">Total</p>
                        <p className="text-xl font-bold text-slate-900">{company.totalDocuments}</p>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <p className="text-yellow-700 text-xs mb-1">Pending</p>
                        <p className="text-xl font-bold text-yellow-600">{company.pendingDocuments}</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-blue-700 text-xs mb-1">Submitted</p>
                        <p className="text-xl font-bold text-blue-600">{company.submittedDocuments}</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-green-700 text-xs mb-1">Approved</p>
                        <p className="text-xl font-bold text-green-600">{company.approvedDocuments}</p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-slate-600 text-sm">Click to view documents</span>
                      <span className="material-symbols-outlined text-slate-400 group-hover:text-[var(--primary-color)] transition-colors">
                        arrow_forward
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Document Modal */}
      <AnimatePresence>
        {selectedDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
            onClick={() => setSelectedDocument(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            >
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 capitalize">
                  {selectedDocument.document_type.replace(/_/g, ' ')}
                </h3>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-slate-600">close</span>
                </button>
              </div>
              <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
                {selectedDocument.documentUrl ? (
                  selectedDocument.document_type === 'company_registration' || selectedDocument.document_type === 'pan_card' || selectedDocument.document_type === 'gst_registration' || selectedDocument.document_type === 'trade_license' || selectedDocument.document_type === 'office_address_proof' ? (
                    <iframe
                      src={selectedDocument.documentUrl}
                      title="Document"
                      className="w-full h-[70vh] border border-slate-200 rounded-lg"
                    />
                  ) : (
                    <img
                      src={selectedDocument.documentUrl}
                      alt="Document"
                      className="w-full h-auto rounded-lg"
                    />
                  )
                ) : (
                  <div className="h-64 bg-slate-100 flex items-center justify-center rounded-lg">
                    <span className="text-slate-400">Document not available</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => {
              setShowRejectModal(false);
              setRejectReason("");
              setDocumentToReject(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-4">Reject Document</h3>
              <p className="text-slate-600 mb-4">
                Are you sure you want to reject this document? You can provide an optional reason below.
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Rejection reason (optional)..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all mb-4 resize-none"
                rows={4}
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={handleRejectConfirm}
                  className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 hover:shadow-lg transition-all"
                >
                  Confirm Rejection
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason("");
                    setDocumentToReject(null);
                  }}
                  className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
