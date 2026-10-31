import { useState } from 'react';
import { useLocation } from 'wouter';
import { Dna, Target, Zap, ShieldCheck, Rocket, User, Activity, Leaf, Stethoscope, AlertTriangle, Check } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Your Baseline', icon: <Dna className="w-5 h-5" />, desc: 'Tell us about your body' },
  { id: 2, title: 'Goals', icon: <Target className="w-5 h-5" />, desc: 'What do you want to achieve?' },
  { id: 3, title: 'Twin Mode', icon: <Zap className="w-5 h-5" />, desc: 'How should your twin think?' },
  { id: 4, title: 'Consent', icon: <ShieldCheck className="w-5 h-5" />, desc: 'Review before we begin' },
  { id: 5, title: 'Initialize', icon: <Rocket className="w-5 h-5" />, desc: 'Boot your digital twin' },
];

const GOALS = ['General Tracking', 'Athletic Performance', 'Rehab & Recovery', 'Healthy Aging'];
const MODES = [
  { id: 'General Human', icon: <User className="w-6 h-6" />, desc: 'Everyday health & movement awareness' },
  { id: 'Athlete', icon: <Activity className="w-6 h-6" />, desc: 'Performance optimization & peak tracking' },
  { id: 'Elder', icon: <Leaf className="w-6 h-6" />, desc: 'Fall prevention & mobility preservation' },
  { id: 'Caregiver/Professional', icon: <Stethoscope className="w-6 h-6" />, desc: 'Multi-patient monitoring & reporting' },
];

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedMode, setSelectedMode] = useState('');
  const [consented, setConsented] = useState(false);
  const [, setLocation] = useLocation();

  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));
  const toggleGoal = (g: string) => setSelectedGoals(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden bg-slate-50 text-slate-900 font-sans">
      {/* Decorative background */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-blue-300/20 blur-[130px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-black text-white shadow-sm shadow-blue-500/25">PT</div>
            <span className="font-black text-lg tracking-tight text-slate-900">PhysioTwin</span>
          </div>
          <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Step {step} of {STEPS.length}</div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-2 mb-3">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center flex-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-300 ${
                  step > s.id ? 'bg-blue-600 text-white shadow-xs' :
                  step === s.id ? 'bg-blue-50 border-2 border-blue-600 text-blue-700' :
                  'bg-white border border-slate-200 text-slate-400'
                }`}>
                  {step > s.id ? <Check className="w-4 h-4" /> : s.id}
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 mx-2 rounded-full overflow-hidden bg-slate-200">
                    <div className="h-full bg-blue-600 transition-all duration-500"
                      style={{ width: step > s.id ? '100%' : '0%' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-4 flex items-center justify-center gap-2">
            <span className="flex items-center gap-2 text-sm font-bold text-slate-900">{STEPS[step-1].icon} {STEPS[step-1].title}</span>
            <span className="text-slate-500 text-xs hidden md:inline">— {STEPS[step-1].desc}</span>
          </div>
        </div>

        {/* Card */}
        <div className="card bg-white border border-slate-200/90 shadow-xl p-8 rounded-3xl animate-fade-in-up">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-black text-slate-900">Your Physical Baseline</h2>
              <p className="text-slate-500 text-sm">Help your twin understand your body's context. All fields optional.</p>
              <div className="space-y-3">
                <input type="number" placeholder="Age" className="input" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="number" placeholder="Height (cm)" className="input" />
                  <input type="number" placeholder="Weight (kg)" className="input" />
                </div>
                <select className="input appearance-none cursor-pointer">
                  <option value="">Biological Sex (Optional)</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Prefer not to say</option>
                </select>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-black text-slate-900">What Are Your Goals?</h2>
              <p className="text-slate-500 text-sm">Select all that apply. Your twin will adapt its analysis lens accordingly.</p>
              <div className="space-y-3">
                {GOALS.map(goal => (
                  <button
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between cursor-pointer ${
                      selectedGoals.includes(goal)
                        ? 'border-blue-600 bg-blue-50/60 text-slate-900 shadow-xs'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-semibold text-sm">{goal}</span>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                      selectedGoals.includes(goal) ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                    }`}>
                      {selectedGoals.includes(goal) && <Check className="w-3 h-3 text-white" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-black text-slate-900">Select Twin Mode</h2>
              <p className="text-slate-500 text-sm">This defines how your digital twin interprets and weights your metrics.</p>
              <div className="space-y-3">
                {MODES.map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => setSelectedMode(mode.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                      selectedMode === mode.id
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className={selectedMode === mode.id ? 'text-blue-600' : 'text-slate-500'}>{mode.icon}</span>
                      <div>
                        <div className={`font-bold text-sm ${selectedMode === mode.id ? 'text-blue-900' : 'text-slate-900'}`}>{mode.id}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{mode.desc}</div>
                      </div>
                      <div className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedMode === mode.id ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                      }`}>
                        {selectedMode === mode.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-2xl font-black text-slate-900">Consent & Safety</h2>
              <div className="space-y-3 p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
                <div className="flex gap-3.5">
                  <AlertTriangle className="text-amber-600 w-5 h-5 shrink-0 mt-0.5" />
                  <div className="text-xs text-slate-700 space-y-2 leading-relaxed">
                    <p><strong className="text-slate-900">Not a medical device.</strong> PhysioTwin provides screening signals and biomechanical estimates — not clinical diagnoses.</p>
                    <p><strong className="text-slate-900">Simulated sensors.</strong> Wearable metrics are simulated until hardware sensors are connected.</p>
                    <p><strong className="text-slate-900">On-device AI.</strong> Your camera feed is analyzed in real-time in your browser and never uploaded.</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setConsented(!consented)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                  consented ? 'border-emerald-600 bg-emerald-50 text-emerald-950 shadow-xs' : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  consented ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                }`}>
                  {consented && <Check className="text-white w-3.5 h-3.5 font-bold" />}
                </div>
                <span className="text-xs font-semibold">I understand and accept the PhysioTwin testing protocol.</span>
              </button>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto shadow-sm">
                <Rocket className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">You're Ready to Boot</h2>
                <p className="text-slate-500 text-sm mt-1 max-w-sm mx-auto">Your physical digital twin baseline is calibrated and ready to initialize.</p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Selected Mode</span>
                  <span className="font-bold text-slate-900">{selectedMode || "General Human"}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Primary Goals</span>
                  <span className="font-bold text-slate-900">{selectedGoals.join(", ") || "General Tracking"}</span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
            {step > 1 ? (
              <button onClick={prevStep} className="btn btn-secondary text-xs py-2.5 px-5">Back</button>
            ) : <div />}

            {step < 5 ? (
              <button 
                onClick={nextStep} 
                disabled={step === 4 && !consented}
                className="btn btn-primary text-xs py-2.5 px-6 shadow-md shadow-blue-500/25 disabled:opacity-40"
              >
                Continue →
              </button>
            ) : (
              <button 
                onClick={() => setLocation('/twin')}
                className="btn btn-primary text-xs py-2.5 px-8 shadow-md shadow-blue-500/25"
              >
                Launch Twin →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
