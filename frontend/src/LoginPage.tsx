import { useState } from "react";
import { useAuth } from "./context/AuthContext";
import { useLocation } from "wouter";
import { Activity, Brain, Smartphone, ArrowRight, ActivitySquare } from "lucide-react";

export default function LoginPage() {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, loginAsDemo } = useAuth();

  const handleDemoLogin = () => {
    loginAsDemo();
    setLocation("/twin");
  };
  const [, setLocation] = useLocation();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const handleGoogleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setAuthError("");
    try {
      await loginWithGoogle();
      setLocation("/twin");
    } catch (error: any) {
      if (error?.message?.includes("dummy-api-key") || error?.code === "auth/invalid-api-key") {
        setAuthError("Firebase is not configured! Please provide real Firebase config keys in the code/env to test login.");
      } else if (error?.code !== "auth/popup-closed-by-user" && error?.code !== "auth/cancelled-popup-request") {
        setAuthError("Google Login failed: " + error.message);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn || !email || !password) return;
    setIsLoggingIn(true);
    setAuthError("");
    try {
      if (isRegister) {
        await registerWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      setLocation("/twin");
    } catch (error: any) {
      if (error?.message?.includes("dummy-api-key") || error?.code === "auth/invalid-api-key") {
        setAuthError("Firebase is not configured! Please provide real Firebase config keys in the code/env to test login.");
      } else {
        setAuthError(error.message || "Authentication failed.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="relative w-full min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden flex flex-col">
      
      {/* Decorative Subtle Background */}
      <div className="fixed inset-0 pointer-events-none opacity-30 z-0">
        <div className="absolute top-[10%] left-[10%] w-[500px] h-[500px] bg-blue-400/15 blur-[140px] rounded-full" />
        <div className="absolute top-[50%] right-[10%] w-[500px] h-[500px] bg-indigo-400/10 blur-[140px] rounded-full" />
      </div>

      {/* Navigation Bar */}
      <header className="relative z-50 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">PhysioTwin</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#clinical" className="hover:text-blue-600 transition-colors">Clinical Validation</a>
          </nav>
          <button 
            onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })} 
            className="text-sm font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors px-6 py-2.5 rounded-full cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 w-full max-w-7xl mx-auto px-6">
        
        {/* Hero Section */}
        <section className="min-h-[80vh] flex flex-col lg:flex-row items-center justify-between gap-16 py-12 lg:py-16">
          
          <div className="flex-1 space-y-8 text-center lg:text-left mt-8 lg:mt-0">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-widest shadow-2xs">
              <ActivitySquare className="w-3.5 h-3.5" /> Next-Gen Sports Intelligence
            </div>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tight leading-[1.08] text-slate-900">
              The Digital Twin of <br className="hidden lg:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Your Physical Recovery.</span>
            </h1>
            <p className="text-lg lg:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-normal">
              PhysioTwin integrates telemetry from Google Fit, HealthifyMe, and Hevy to build a 3D biomechanical model of your body. Predict injuries, optimize tissue repair, and return to sport faster.
            </p>
            <div className="flex items-center gap-4 justify-center lg:justify-start">
              <button 
                onClick={() => document.getElementById('auth-section')?.scrollIntoView({ behavior: 'smooth' })} 
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/25 cursor-pointer active:scale-[0.98]"
              >
                Start Free Trial <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Authentication Card */}
          <div id="auth-section" className="w-full max-w-md shrink-0">
            <div className="bg-white border border-slate-200/90 p-8 sm:p-10 rounded-3xl shadow-xl shadow-slate-900/5">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-black text-slate-900">{isRegister ? "Create an Account" : "Welcome Back"}</h2>
                <p className="text-sm text-slate-500 mt-2 font-medium">Sync your biomechanical telemetry to continue.</p>
              </div>

              {authError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm p-3.5 rounded-xl mb-6 font-medium">
                  {authError}
                </div>
              )}

              <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4 mb-6">
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-all placeholder:text-slate-400 text-sm"
                  required
                />
                <input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-slate-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 transition-all placeholder:text-slate-400 text-sm"
                  required
                />
                <button 
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-blue-600 text-white font-bold text-base py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-500/25 disabled:opacity-50 mt-2 cursor-pointer active:scale-[0.98]"
                >
                  {isLoggingIn ? "Authenticating..." : isRegister ? "Register Now" : "Sign In"}
                </button>
              </form>

              <div className="flex items-center gap-4 mb-6">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-xs text-slate-400 uppercase tracking-widest font-semibold">or</span>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>

              <button 
                onClick={handleGoogleLogin}
                type="button"
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold text-sm py-3.5 rounded-xl transition-all shadow-xs cursor-pointer active:scale-[0.98]"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                Continue with Google
              </button>

              <button 
                onClick={handleDemoLogin}
                type="button"
                className="w-full mt-3 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-md shadow-emerald-500/20 cursor-pointer active:scale-[0.98]"
              >
                ⚡ Instant Local Demo Sign-In
              </button>

              <div className="mt-8 text-center">
                <button 
                  type="button"
                  onClick={() => setIsRegister(!isRegister)} 
                  className="text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors underline underline-offset-4 cursor-pointer"
                >
                  {isRegister ? "Already have an account? Sign In" : "Need an account? Register"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 border-t border-slate-200/80">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-black tracking-tight text-slate-900 mb-4">Enterprise-Grade Clinical Intelligence</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto font-normal">We don't just track workouts. We analyze the biomechanical impact of every step you take.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xs hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 border border-blue-200 rounded-2xl flex items-center justify-center mb-6">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Universal Integration</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Connects seamlessly with Google Fit, HealthifyMe, Hevy, Oura, and Apple Health. All your data in one master biomechanical brain.
              </p>
            </div>
            
            <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xs hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center mb-6">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">3D Dynamic Risk Modeling</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Watch your digital twin update in real-time. If your training volume outpaces your recovery, we highlight the exact tendons at risk.
              </p>
            </div>

            <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xs hover:border-blue-300 hover:shadow-md transition-all">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 border border-purple-200 rounded-2xl flex items-center justify-center mb-6">
                <Brain className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">Diagnostic Reasoning</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Don't just see numbers. Get deep clinical explanations on why your Force Asymmetry matters and how your protein intake affects collagen synthesis.
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-slate-200 bg-white py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">PT</div>
            <span className="font-bold text-slate-900">PhysioTwin</span>
          </div>
          <div className="text-sm text-slate-500 font-medium">
            © 2026 Novalegions. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm text-slate-500 font-medium">
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
