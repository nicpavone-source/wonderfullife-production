import Link from "next/link";

export default function StudioSettingsPage() {
  return (
    <div className="studio-placeholder-page">
      <div className="studio-placeholder-header">
        <span className="studio-placeholder-label">
          WONDERFULLIFE STUDIO
        </span>

        <span className="studio-version">Version 1.0</span>
      </div>

      <h1>Settings</h1>

      <p>
        Configure your WonderfulLife Studio preferences,
        publishing defaults, account settings, and AI options.
      </p>

      <div className="studio-placeholder-card">
        <h2>Studio Settings</h2>

        <p>
          This section is connected to the WonderfulLife Studio
          and ready for configuration tools.
        </p>

        <Link
          href="/studio"
          className="studio-button studio-button--primary"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}