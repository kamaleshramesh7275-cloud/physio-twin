import React, { useState, useRef } from "react";
import { Sidebar } from "./components/Sidebar";
import { Building, FileText, UserCheck, Shield, Share2, UploadCloud, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import { api } from "./api";
import { Link } from "wouter";

export default function ClinicPage() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [finding, setFinding] = useState<any>(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setFinding(null);
      setError("");
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;
    setIsUploading(true);
    setError("");
    try {
      const result = await api.uploadMedicalReport(user.uid, file);
      setFinding(result.finding);
      setFile(null);
    } catch (err: any) {
      setError("Failed to process medical report. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen text-foreground md:overflow-hidden pb-[72px] md:pb-0 bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2 text-slate-900">
              <Building className="w-6 h-6 text-blue-600" /> Clinic &amp; Medical Portal
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Manage data sharing and import external medical records.</p>
          </div>
          <button className="btn btn-primary flex items-center gap-2 px-4 py-2 text-xs">
            <Share2 className="w-4 h-4" /> Share Access
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          <div className="space-y-6">
            {/* Upload Medical Report */}
            <div className="card space-y-4 shadow-sm">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-blue-600" /> AI Report Analysis
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">Upload your MRI reports, X-Rays, or doctor's notes. Our AI will extract diagnoses and update your Digital Twin risk profile automatically.</p>
              
              {!finding ? (
                <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 transition-colors rounded-2xl p-8 text-center bg-slate-50/50">
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*,.pdf"
                  />
                  {!file ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <button onClick={() => fileInputRef.current?.click()} className="text-blue-600 font-bold hover:underline cursor-pointer">Click to upload</button>
                        <span className="text-slate-500 text-sm ml-1 font-medium">or drag and drop</span>
                      </div>
                      <p className="text-xs text-slate-400">PDF, JPG, PNG (max. 10MB)</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="font-semibold text-sm bg-blue-50 text-blue-800 border border-blue-200 px-4 py-2 rounded-full">
                        {file.name}
                      </div>
                      <div className="flex gap-2 w-full">
                        <button onClick={() => setFile(null)} className="btn btn-secondary flex-1" disabled={isUploading}>Cancel</button>
                        <button onClick={handleUpload} className="btn btn-primary flex-1 flex items-center justify-center gap-2" disabled={isUploading}>
                          {isUploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing AI...</> : 'Analyze Report'}
                        </button>
                      </div>
                    </div>
                  )}
                  {error && <div className="text-rose-600 text-sm mt-4 font-semibold">{error}</div>}
                </div>
              ) : (
                <div className="border border-emerald-200 bg-emerald-50/80 rounded-2xl p-6 anim-fade shadow-xs">
                  <div className="flex items-center gap-3 mb-4">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <h4 className="font-bold text-emerald-800 text-base">Clinical Extraction Complete</h4>
                  </div>
                  <div className="space-y-3 mb-6 text-slate-800">
                    <div className="flex justify-between items-center pb-2 border-b border-emerald-200/60">
                      <span className="text-sm text-slate-600">Detected Condition</span>
                      <span className="font-bold text-sm text-slate-900">{finding.condition}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-emerald-200/60">
                      <span className="text-sm text-slate-600">Affected Zone</span>
                      <span className="font-bold text-sm capitalize text-slate-900">{finding.zone.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b border-emerald-200/60">
                      <span className="text-sm text-slate-600">Assessed Risk Severity</span>
                      <span className="font-bold text-sm text-rose-700">{finding.severity}%</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-sm text-slate-600 block mb-1">Clinical Recommendation</span>
                      <span className="font-medium text-xs leading-relaxed text-slate-800">{finding.recommendation}</span>
                    </div>
                  </div>
                  <Link href="/twin" className="btn btn-primary w-full text-center block">View Updated Twin</Link>
                </div>
              )}
            </div>

            {/* Active Providers */}
            <div className="card space-y-4 shadow-sm">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-blue-600" /> Authorized Care Providers
              </h3>
              <p className="text-sm text-slate-500">The following clinicians currently have read-only access to your Digital Twin telemetry.</p>
              
              <div className="space-y-3 mt-4">
                <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between bg-white shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs">
                      DR
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">Dr. Robert Chen, MD</div>
                      <div className="text-xs text-slate-500">Orthopedic Surgeon • Apex Sports Medicine</div>
                    </div>
                  </div>
                  <button className="text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                    Revoke
                  </button>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 flex items-center justify-between bg-white shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center font-bold text-xs">
                      PT
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">Sarah Jenkins, DPT</div>
                      <div className="text-xs text-slate-500">Physical Therapist • Kinetic Rehab</div>
                    </div>
                  </div>
                  <button className="text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer">
                    Revoke
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Provider Notes & Reports */}
          <div className="space-y-6">
            <div className="card space-y-4 shadow-sm">
              <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" /> Exportable Clinical Audits
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">Generate comprehensive biometric audit reports of your progress for insurance or treating physicians.</p>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button className="border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/40 p-4 rounded-2xl text-left transition-all cursor-pointer shadow-2xs">
                  <FileText className="w-6 h-6 text-blue-600 mb-2" />
                  <div className="font-bold text-sm text-slate-900">Post-Op Summary</div>
                  <div className="text-xs text-slate-500 mt-1">Last 30 Days</div>
                </button>
                <button className="border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/40 p-4 rounded-2xl text-left transition-all cursor-pointer shadow-2xs">
                  <FileText className="w-6 h-6 text-blue-600 mb-2" />
                  <div className="font-bold text-sm text-slate-900">Full Biomechanical Audit</div>
                  <div className="text-xs text-slate-500 mt-1">All Time</div>
                </button>
              </div>
            </div>

            <div className="card bg-blue-50/50 border-blue-200/70 shadow-xs">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-sm text-blue-900">HIPAA Compliant Sharing</div>
                  <div className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Your telemetry data is end-to-end encrypted. Care providers can only view your data when explicitly granted credentials. Access can be revoked instantly at any time.
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
