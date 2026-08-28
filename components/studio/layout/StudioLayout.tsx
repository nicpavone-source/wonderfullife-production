import type { ReactNode } from "react";

import StudioHeader from "./StudioHeader";
import StudioSidebar from "./StudioSidebar";

type StudioLayoutProps = {
  children: ReactNode;
};

export default function StudioLayout({
  children,
}: StudioLayoutProps) {
  return (
    <div className="studio-shell">
      <StudioHeader />

      <div className="studio-shell__body">
        <StudioSidebar />

        <main className="studio-shell__main">
          <div className="studio-shell__content">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}