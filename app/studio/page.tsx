import AIComposer from "../../components/studio/dashboard/AIComposer";
import DashboardHero from "../../components/studio/dashboard/DashboardHero";
import QuickCreate from "../../components/studio/dashboard/QuickCreate";
import RecentContent from "../../components/studio/dashboard/RecentContent";
import StatsPanel from "../../components/studio/dashboard/StatsPanel";

export default function StudioDashboardPage() {
  return (
    <div className="studio-dashboard-page">
      <DashboardHero />

      <AIComposer />

      <QuickCreate />

      <div className="studio-dashboard-page__lower">
        <RecentContent />

        <div className="studio-dashboard-page__side">
          <StatsPanel />
        </div>
      </div>
    </div>
  );
}