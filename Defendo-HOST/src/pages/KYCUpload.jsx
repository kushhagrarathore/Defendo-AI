import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function KYCUpload() {
  const { user, hostProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);
  const [documents, setDocuments] = useState({
    company_registration: null,
    pan_card: null,
    gst_registration: null,
    trade_license: null,
    office_address_proof: null
  });
  const [uploadedDocuments, setUploadedDocuments] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Check existing KYC status
  useEffect(() => {
    if (user && hostProfile) {
      fetchKYCStatus();
    }
  }, [user, hostProfile]);

  const fetchKYCStatus = async () => {
    try {
      const { data, error } = await supabase
        .from("host_kyc")
        .select("*")
        .eq("provider_id", user.id)
        .order("submitted_at", { ascending: false });

      if (error) {
        console.error("Error fetching KYC status:", error);
        return;
      }

      if (data && data.length > 0) {
        setKycStatus(data[0]);
        
        // Track uploaded documents
        const uploaded = {};
        data.forEach(doc => {
          uploaded[doc.document_type] = {
            id: doc.id,
            status: doc.status,
            url: doc.document_url,
            submitted_at: doc.submitted_at
          };
        });
        setUploadedDocuments(uploaded);
      }
    } catch (error) {
      console.error("Error fetching KYC status:", error);
    }
  };

  const handleFileUpload = async (file, documentType) => {
    if (!file) return;

    setUploading(true);
    try {
      // Debug: Check user authentication
      const { data: { user: currentUser }, error: userError } = await supabase.auth.getUser();
      if (userError || !currentUser) {
        throw new Error('User not authenticated');
      }
      console.log('Uploading for user:', currentUser.id);

      // Debug: Check bucket access
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        console.error('Error listing buckets:', bucketsError);
      } else {
        console.log('Available buckets:', buckets.map(b => b.id));
      }

      // Upload file to Supabase storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${documentType}_${Date.now()}.${fileExt}`;
      
      console.log('Uploading file:', fileName, 'to bucket: host-kyc-documents');
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('host-kyc-documents')
        .upload(fileName, file, { upsert: true });

      if (uploadError) {
        console.error('Upload error details:', uploadError);
        throw uploadError;
      }

      // Insert record into host_kyc table
      const { error: insertError } = await supabase
        .from("host_kyc")
        .insert([{
          provider_id: user.id,
          document_type: documentType,
          document_url: uploadData.path,
          status: 'pending'
        }]);

      if (insertError) {
        throw insertError;
      }

      // Update local state
      setDocuments(prev => ({
        ...prev,
        [documentType]: file
      }));

      // Update uploaded documents tracking
      setUploadedDocuments(prev => ({
        ...prev,
        [documentType]: {
          id: Date.now(), // Temporary ID
          status: 'pending',
          url: uploadData.path,
          submitted_at: new Date().toISOString()
        }
      }));

      setSuccess(`Document uploaded successfully!`);
      setTimeout(() => setSuccess(null), 3000);

      // Refresh KYC status
      await fetchKYCStatus();

    } catch (error) {
      console.error("Error uploading document:", error);
      alert("Error uploading document. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Check if all required documents are uploaded
  const getRequiredDocuments = () => [
    'company_registration',
    'pan_card'
  ];

  const isAllRequiredDocumentsUploaded = () => {
    const required = getRequiredDocuments();
    return required.every(docType => uploadedDocuments[docType]);
  };

  const getDocumentStatus = (documentType) => {
    const doc = uploadedDocuments[documentType];
    if (!doc) return { status: 'not_uploaded', text: 'Not uploaded' };
    
    const statusConfig = {
      pending: { status: 'pending', text: 'Pending Review', color: 'text-yellow-400' },
      approved: { status: 'approved', text: 'Approved', color: 'text-green-400' },
      rejected: { status: 'rejected', text: 'Rejected', color: 'text-red-400' }
    };
    
    return statusConfig[doc.status] || statusConfig.pending;
  };

  const handleSubmitKYC = async () => {
    if (!isAllRequiredDocumentsUploaded()) {
      setError('Please upload all required documents before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setShowConfirmModal(false);

    try {
      // Update all pending documents to submitted status in database
      const pendingDocs = Object.entries(uploadedDocuments)
        .filter(([_, doc]) => doc.status === 'pending')
        .map(([docType, doc]) => docType);

      if (pendingDocs.length > 0) {
        const { error: updateError } = await supabase
          .from('host_kyc')
          .update({ 
            status: 'submitted',
            submitted_at: new Date().toISOString()
          })
          .in('document_type', pendingDocs)
          .eq('provider_id', user.id);

        if (updateError) {
          throw updateError;
        }
      }

      setSuccess('KYC documents submitted successfully! Our admin team will review them within 1-3 business days. You will be notified once the verification is complete.');
      setTimeout(() => {
        setSuccess(null);
        navigate('/dashboard');
      }, 5000);

    } catch (error) {
      console.error('Error submitting KYC:', error);
      setError('Failed to submit documents. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(true);
  };

  const handleCancelSubmit = () => {
    setShowConfirmModal(false);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: "bg-yellow-500/10 border-yellow-500/20 text-yellow-400", text: "Pending Review" },
      approved: { color: "bg-green-500/10 border-green-500/20 text-green-400", text: "Approved" },
      rejected: { color: "bg-red-500/10 border-red-500/20 text-red-400", text: "Rejected" }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (!user || !hostProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#f8fbff] via-white to-[#fdfdff] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8fbff] via-white to-[#fdfdff] text-slate-900">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-emerald-600 text-xl">
                  verified_user
                </span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
                  KYC Verification
                </h1>
                <p className="text-sm text-slate-500">
                  Upload and submit your company documents for verification.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Current Status */}
        {kycStatus && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)] p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Current KYC Status
              </h2>
              {getStatusBadge(kycStatus.status)}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Document Type:</span>
                <span className="text-slate-900 ml-2 capitalize">
                  {kycStatus.document_type.replace("_", " ")}
                </span>
              </div>
              <div>
                <span className="text-slate-500">Submitted:</span>
                <span className="text-slate-900 ml-2">
                  {new Date(kycStatus.submitted_at).toLocaleDateString()}
                </span>
              </div>
              {kycStatus.reviewed_at && (
                <div>
                  <span className="text-slate-500">Reviewed:</span>
                  <span className="text-slate-900 ml-2">
                    {new Date(kycStatus.reviewed_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              {kycStatus.rejection_reason && (
                <div className="md:col-span-2">
                  <span className="text-slate-500">Rejection Reason:</span>
                  <span className="text-rose-600 ml-2">
                    {kycStatus.rejection_reason}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Upload Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl border border-slate-200 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.08)] p-8"
        >
          <h2 className="text-2xl font-semibold text-slate-900 mb-3">
            Upload Documents
          </h2>
          <p className="text-sm text-slate-500 mb-8">
            Please upload the required documents for KYC verification. Our admin
            team will manually review and update your status.
          </p>

          <div className="space-y-6">
            {/* Company Registration Certificate */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-800">
                  Company Registration Certificate (Required)
                  <span className="text-rose-500 ml-1">*</span>
                </label>
                {uploadedDocuments.company_registration && (
                  <span className={`text-xs font-medium ${getDocumentStatus('company_registration').color}`}>
                    {getDocumentStatus('company_registration').text}
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-xs">
                Upload ROC / MSME / GST Registration certificate proving the
                legal existence of your company.
              </p>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileUpload(e.target.files[0], 'company_registration')}
                disabled={uploading}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600 disabled:opacity-60"
              />
            </div>

            {/* PAN Card */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-800">
                  PAN Card of the Company (Required)
                  <span className="text-rose-500 ml-1">*</span>
                </label>
                {uploadedDocuments.pan_card && (
                  <span className={`text-xs font-medium ${getDocumentStatus('pan_card').color}`}>
                    {getDocumentStatus('pan_card').text}
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-xs">
                Upload your company's PAN card for tax identification and
                compliance.
              </p>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileUpload(e.target.files[0], 'pan_card')}
                disabled={uploading}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600 disabled:opacity-60"
              />
            </div>

            {/* GST Registration */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-800">
                  GST Registration (If Applicable)
                </label>
                {uploadedDocuments.gst_registration && (
                  <span className={`text-xs font-medium ${getDocumentStatus('gst_registration').color}`}>
                    {getDocumentStatus('gst_registration').text}
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-xs">
                Upload GST registration certificate to verify legal tax
                compliance for operations.
              </p>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileUpload(e.target.files[0], 'gst_registration')}
                disabled={uploading}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600 disabled:opacity-60"
              />
            </div>

            {/* Trade License */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-800">
                  Trade License / Security Agency License (Required)
                  <span className="text-rose-500 ml-1">*</span>
                </label>
                {uploadedDocuments.trade_license && (
                  <span className={`text-xs font-medium ${getDocumentStatus('trade_license').color}`}>
                    {getDocumentStatus('trade_license').text}
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-xs">
                Upload your trade license or security agency license (mandatory
                for running a security agency in most states).
              </p>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileUpload(e.target.files[0], 'trade_license')}
                disabled={uploading}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600 disabled:opacity-60"
              />
            </div>

            {/* Office Address Proof */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-800">
                  Proof of Office Address (Required)
                  <span className="text-rose-500 ml-1">*</span>
                </label>
                {uploadedDocuments.office_address_proof && (
                  <span className={`text-xs font-medium ${getDocumentStatus('office_address_proof').color}`}>
                    {getDocumentStatus('office_address_proof').text}
                  </span>
                )}
              </div>
              <p className="text-slate-500 text-xs">
                Upload utility bill, rent agreement, or lease document proving
                your office address.
              </p>
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => handleFileUpload(e.target.files[0], 'office_address_proof')}
                disabled={uploading}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-emerald-500 file:text-white hover:file:bg-emerald-600 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Upload Status */}
          {uploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 p-4 rounded-xl border border-emerald-100 bg-emerald-50/70"
            >
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-emerald-300/60 border-t-emerald-500 rounded-full animate-spin"></div>
                <span className="text-sm text-emerald-700 font-medium">
                  Uploading document...
                </span>
              </div>
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-xl border border-emerald-100 bg-emerald-50/70"
            >
              <div className="flex items-center space-x-3">
                <span className="material-symbols-outlined text-emerald-600 text-xl">
                  check_circle
                </span>
                <span className="text-sm text-emerald-700 font-medium">
                  {success}
                </span>
              </div>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 rounded-xl border border-rose-100 bg-rose-50/70"
            >
              <div className="flex items-center space-x-3">
                <span className="material-symbols-outlined text-rose-600 text-xl">
                  error
                </span>
                <span className="text-sm text-rose-700 font-medium">
                  {error}
                </span>
              </div>
            </motion.div>
          )}

          {/* Document Progress */}
          <div className="mt-8 p-6 rounded-xl border border-slate-200 bg-slate-50/60">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">
              Document Progress
            </h3>
            <div className="space-y-3">
              {getRequiredDocuments().map((docType) => {
                const doc = uploadedDocuments[docType];
                const isUploaded = !!doc;
                const status = getDocumentStatus(docType);
                
                return (
                  <div key={docType} className="flex items-center justify-between">
                    <span className="text-sm text-slate-800 capitalize">
                      {docType.replace('_', ' ')}
                    </span>
                    <div className="flex items-center space-x-2">
                      {isUploaded ? (
                        <span className={`text-xs font-medium ${status.color}`}>
                          {status.text}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Not uploaded
                        </span>
                      )}
                      <span className={`w-3 h-3 rounded-full ${
                        isUploaded ? 'bg-emerald-500' : 'bg-slate-300'
                      }`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8"
          >
            <button
              onClick={isAllRequiredDocumentsUploaded() ? handleConfirmSubmit : undefined}
              disabled={!isAllRequiredDocumentsUploaded() || submitting}
              className="w-full bg-emerald-500 text-white font-semibold py-4 px-6 rounded-xl hover:bg-emerald-600 transform hover:scale-[1.01] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none shadow-[0_12px_30px_rgba(16,185,129,0.35)]"
            >
              {submitting ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  <span>Submitting KYC Documents...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <span className="material-symbols-outlined">verified_user</span>
                  <span>Submit for Admin Verification</span>
                </div>
              )}
            </button>
            <p className="text-center text-slate-500 text-xs mt-3">
              {isAllRequiredDocumentsUploaded() 
                ? "All required documents uploaded. Click to submit for manual admin verification."
                : "Upload Company Registration Certificate and PAN Card to enable submission."
              }
            </p>
          </motion.div>

          {/* Info Box */}
          <div className="mt-8 p-6 rounded-xl border border-sky-100 bg-sky-50/80">
            <div className="flex items-start space-x-3">
              <span className="material-symbols-outlined text-sky-600 text-xl">
                info
              </span>
              <div>
                <h3 className="text-sm font-semibold text-sky-900 mb-2">
                  Important Information
                </h3>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li>• Documents should be clear and readable.</li>
                  <li>• Accepted formats: JPG, PNG, PDF.</li>
                  <li>• Maximum file size: 10MB per document.</li>
                  <li>• Manual verification by admin team takes 1-3 business days.</li>
                  <li>• You'll receive email notification once verification is complete.</li>
                  <li>• Check your dashboard for real-time status updates.</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={handleCancelSubmit}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white border border-slate-200 rounded-2xl p-8 max-w-md w-full mx-4 shadow-[0_18px_55px_rgba(15,23,42,0.18)]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-50 border border-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-amber-500 text-2xl">
                    warning
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  Confirm Submission
                </h3>
                
                <p className="text-sm text-slate-600 mb-8">
                  Are you sure you want to submit these documents for admin
                  review? Our team will manually verify your documents and
                  notify you of the result.
              </p>
                
                <div className="flex space-x-4">
                  <button
                    onClick={handleCancelSubmit}
                    className="flex-1 px-6 py-3 bg-slate-50 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmitKYC}
                    disabled={submitting}
                    className="flex-1 px-6 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {submitting ? "Submitting..." : "Yes, Submit"}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
