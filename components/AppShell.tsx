"use client";

import { AppBreadcrumbs } from "@/components/AppBreadcrumbs";
import { AppSidebar } from "@/components/AppSidebar";
import { AstryxProviders } from "@/components/AstryxProviders";
import { ModelChat } from "@/components/ModelChat";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AstryxProviders>
      <TooltipProvider delay={0}>
        <SidebarProvider defaultOpen>
          <AppSidebar />
          <SidebarInset className="flex h-dvh min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background pb-[env(safe-area-inset-bottom)]">
            <AppBreadcrumbs />
            <div className="flex min-h-0 flex-1 flex-col overflow-x-hidden overflow-y-auto overscroll-y-contain pb-24">
              {children}
            </div>
            <ModelChat />
          </SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </AstryxProviders>
  );
}
