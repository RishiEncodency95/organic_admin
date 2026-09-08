"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import RequireAdminAuth from "@/components/auth/RequireAdminAuth";
import Sidebar from "@/components/layout/Sidebar";
import Topbar from "@/components/layout/Topbar";
import AdminFooter from "@/components/layout/AdminFooter";
import AdminSocialRail from "@/components/layout/AdminSocialRail";
import contentScale from "./AdminContentScale.module.css";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();
  const useCompactReadableScale = pathname !== "/" && !pathname.startsWith("/pages");

  return (
    <RequireAdminAuth>
      <div className="flex h-screen overflow-hidden relative bg-slate-50">
        {/* Premium Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -left-[10%] h-[50%] w-[50%] rounded-full bg-orange-400/10 blur-[120px]" />
          <div className="absolute top-[20%] -right-[10%] h-[60%] w-[50%] rounded-full bg-blue-500/10 blur-[120px]" />
          <div className="absolute -bottom-[20%] left-[20%] h-[50%] w-[50%] rounded-full bg-teal-400/10 blur-[100px]" />
          {/* Subtle grid pattern for texture */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        </div>

        {/* Desktop sidebar */}
        <div className="hidden lg:block relative z-10">
          <Sidebar />
        </div>

        {/* Mobile sidebar drawer */}
        {mobileNavOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileNavOpen(false)} />
            <div className="absolute inset-y-0 left-0">
              <Sidebar onNavigate={() => setMobileNavOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col relative z-10">
          <Topbar onMenuClick={() => setMobileNavOpen(true)} />
          <main className={`min-h-0 flex-1 overflow-y-auto pl-1.5 pr-1.5 pb-1.5 pt-1 lg:pl-1.5 lg:pr-1.5 lg:pb-1.5 lg:pt-1 ${useCompactReadableScale ? contentScale.adminContent : ""}`}>{children}</main>
          <AdminFooter />
        </div>
        <AdminSocialRail />
      </div>
    </RequireAdminAuth>
  );
}
