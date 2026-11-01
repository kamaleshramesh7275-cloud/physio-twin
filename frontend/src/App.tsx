import { useState, useEffect } from 'react'
import { Link, Route, Switch, useLocation } from "wouter";

import Onboarding from "./Onboarding";
import CaptureEngine from "./CaptureEngine";
import Dashboard from "./Dashboard";
import DemoDashboard from "./DemoDashboard";
import { NutritionRecovery } from "./NutritionRecovery";
import { WorkoutStrain } from "./WorkoutStrain";

import { Camera, Brain, Target, Shield, ArrowRight } from "lucide-react";
import { AvatarProvider } from "./AvatarContext";

import LandingPage from "./LandingPage";

import { HistoryPage, TimelinePage, InsightsPage } from "./DummyPages";
import TwinPage from "./TwinPage";
import LeaderboardPage from "./LeaderboardPage";
import SettingsPage from "./SettingsPage";
import ProgramsPage from "./ProgramsPage";
import AnalyticsPage from "./AnalyticsPage";
import CommunityPage from "./CommunityPage";
import ClinicPage from "./ClinicPage";
import MedicationPage from "./MedicationPage";
import VitalsPage from "./VitalsPage";
import MentalReadinessPage from "./MentalReadinessPage";
import WikiPage from "./WikiPage";
import AchievementsPage from "./AchievementsPage";
import PublicReviewPage from "./PublicReviewPage";
import CoachPortalPage from "./CoachPortalPage";
import SimulatorPage from "./SimulatorPage";
import LoginPage from "./LoginPage";
import { AuthProvider, useAuth } from "./context/AuthContext";

function ProtectedRoute({ component: Component, ...rest }: any) {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [user, loading, setLocation]);

  if (loading || !user) return <div className="h-screen flex items-center justify-center bg-black text-white">Loading...</div>;

  return <Component {...rest} />;
}

function AppContent() {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (location === '/' && !loading && user) {
      setLocation("/dashboard");
    }
  }, [location, user, loading, setLocation]);

  return (
    <AvatarProvider>
      <div className="min-h-screen bg-background text-foreground">
        <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/login" component={LoginPage} />
        <Route path="/register" component={LoginPage} />
        <Route path="/onboarding" component={Onboarding} />
        <Route path="/capture" component={CaptureEngine} />
        <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
        <Route path="/demo" component={DemoDashboard} />
        <Route path="/review" component={PublicReviewPage} />
        <Route path="/review/:id" component={PublicReviewPage} />
        <Route path="/coach" component={CoachPortalPage} />
        
        {/* Protected Routes */}
        <Route path="/twin"><ProtectedRoute component={TwinPage} /></Route>
        <Route path="/simulator"><ProtectedRoute component={SimulatorPage} /></Route>
        <Route path="/exercises"><ProtectedRoute component={ProgramsPage} /></Route>
        <Route path="/medical-history"><ProtectedRoute component={TimelinePage} /></Route>
        <Route path="/history"><ProtectedRoute component={TwinPage} /></Route>
        <Route path="/projection"><ProtectedRoute component={TwinPage} /></Route>
        <Route path="/leaderboard"><ProtectedRoute component={LeaderboardPage} /></Route>
        <Route path="/nutrition-recovery"><ProtectedRoute component={NutritionRecovery} /></Route>
        <Route path="/muscular-strain"><ProtectedRoute component={WorkoutStrain} /></Route>
        <Route path="/timeline"><ProtectedRoute component={TimelinePage} /></Route>
        <Route path="/insights"><ProtectedRoute component={InsightsPage} /></Route>
        <Route path="/settings"><ProtectedRoute component={SettingsPage} /></Route>
        <Route path="/programs"><ProtectedRoute component={ProgramsPage} /></Route>
        <Route path="/analytics"><ProtectedRoute component={AnalyticsPage} /></Route>
        <Route path="/community"><ProtectedRoute component={CommunityPage} /></Route>
        <Route path="/clinic"><ProtectedRoute component={ClinicPage} /></Route>
        <Route path="/meds"><ProtectedRoute component={MedicationPage} /></Route>
        <Route path="/vitals"><ProtectedRoute component={VitalsPage} /></Route>
        <Route path="/readiness"><ProtectedRoute component={MentalReadinessPage} /></Route>
        <Route path="/wiki"><ProtectedRoute component={WikiPage} /></Route>
        <Route path="/achievements"><ProtectedRoute component={AchievementsPage} /></Route>

        <Route>
          <div className="min-h-screen flex items-center justify-center flex-col gap-4">
            <div className="text-6xl font-black text-gradient">404</div>
            <div className="text-muted-foreground">Page not found</div>
            <Link href="/" className="btn btn-primary mt-4">Go Home</Link>
          </div>
        </Route>
        </Switch>
      </div>
    </AvatarProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
