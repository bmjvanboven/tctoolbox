import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import NotitiePaneel from "@/components/NotitiePaneel";
import { LocatieProvider } from "@/lib/LocatieContext";
import { SidebarProvider } from "@/lib/SidebarContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <LocatieProvider>
      <SidebarProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />

          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
            {/* Topbar: sticky bovenaan */}
            <div className="shrink-0">
              <TopBar />
            </div>
            {/* Scrollbare content */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#f8f8f8] mt-14 md:mt-0">
              {children}
            </main>
            <NotitiePaneel />
          </div>
        </div>
      </SidebarProvider>
    </LocatieProvider>
  );
}
