import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import NotitiePaneel from "@/components/NotitiePaneel";
import { LocatieProvider } from "@/lib/LocatieContext";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <LocatieProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <main className="flex-1 p-8 bg-[#f8f8f8]">
            {children}
          </main>
          <NotitiePaneel />
        </div>
      </div>
    </LocatieProvider>
  );
}
