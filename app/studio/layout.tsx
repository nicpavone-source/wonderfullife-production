import type { ReactNode } from "react";

import "../../components/studio/styles/studio.css";
import StudioLayout from "../../components/studio/layout/StudioLayout";

type StudioRootLayoutProps = {
  children: ReactNode;
};

export default function StudioRootLayout({
  children,
}: StudioRootLayoutProps) {
  return <StudioLayout>{children}</StudioLayout>;
}