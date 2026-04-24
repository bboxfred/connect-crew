import { AppSidebar } from "@/components/app-sidebar";
import { GensparkPanelProvider } from "@/components/genspark-side-panel";
import { ViewModeProvider } from "@/components/view-mode-provider";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewModeProvider>
      <GensparkPanelProvider>
        <div className="flex flex-1 min-h-screen">
          <AppSidebar />
          <main className="flex-1 min-w-0 p-6 md:p-10 lg:p-12 pb-24 lg:pb-12 bg-[var(--background)] paper-grain">
            {children}
          </main>
        </div>
      </GensparkPanelProvider>
    </ViewModeProvider>
  );
}
