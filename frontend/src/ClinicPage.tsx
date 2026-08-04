import React from "react";
import { Sidebar } from "./components/Sidebar";
import { Building, FileText, Send, UserCheck, Calendar, Shield, Share2 } from "lucide-react";

export default function ClinicPage() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen text-foreground md:overflow-hidden pb-[72px] md:pb-0 bg-background">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2">
              <Building className="w-6 h-6 text-primary" /> Clinic Portal
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Manage data sharing with your healthcare providers.</p>
          </div>
          <button className="btn-primary flex items-center gap-2 px-4 py-2">
            <Share2 className="w-4 h-4" /> Share Access
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Active Providers */}
          <div className="card space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary" /> Authorized Providers
            </h3>
            <p className="text-sm text-muted-foreground">The following providers currently have read-only access to your Digital Twin data.</p>
            
            <div className="space-y-3 mt-4">
              <div className="border border-border rounded-lg p-4 flex items-center justify-between bg-card/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-sm">
                    dr
                  </div>
                  <div>
                    <div className="font-semibold">Dr. Robert Chen, MD</div>
                    <div className="text-xs text-muted-foreground">Orthopedic Surgeon • Apex Sports Medicine</div>
                  </div>
                </div>
                <button className="text-xs font-semibold text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded transition-colors">
                  Revoke
                </button>
              </div>

              <div className="border border-border rounded-lg p-4 flex items-center justify-between bg-card/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-sm">
                    pt
                  </div>
                  <div>
                    <div className="font-semibold">Sarah Jenkins, DPT</div>
                    <div className="text-xs text-muted-foreground">Physical Therapist • Kinetic Rehab</div>
                  </div>
                </div>
                <button className="text-xs font-semibold text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded transition-colors">
                  Revoke
                </button>
              </div>
            </div>
          </div>

          {/* Provider Notes & Reports */}
          <div className="space-y-6">
            <div className="card space-y-4">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Clinical Reports
              </h3>
              <p className="text-sm text-muted-foreground">Generate comprehensive PDF reports of your biomechanical data for insurance or external doctors.</p>
              
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button className="border border-border hover:border-primary/50 bg-secondary/20 hover:bg-primary/5 p-4 rounded-xl text-left transition-colors">
                  <FileText className="w-6 h-6 text-primary mb-2" />
                  <div className="font-semibold text-sm">Post-Op Summary</div>
                  <div className="text-xs text-muted-foreground mt-1">Last 30 Days</div>
                </button>
                <button className="border border-border hover:border-primary/50 bg-secondary/20 hover:bg-primary/5 p-4 rounded-xl text-left transition-colors">
                  <FileText className="w-6 h-6 text-primary mb-2" />
                  <div className="font-semibold text-sm">Full Biomechanical Audit</div>
                  <div className="text-xs text-muted-foreground mt-1">All Time</div>
                </button>
              </div>
            </div>

            <div className="card bg-secondary/10 border-primary/20">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm">HIPAA Compliant Sharing</div>
                  <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Your data is end-to-end encrypted. Providers can only view your data when explicitly authorized. You can revoke access at any time.
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
