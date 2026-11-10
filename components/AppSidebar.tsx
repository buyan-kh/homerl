"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  GraduationCap,
  LayoutGrid,
  PencilLine,
  RotateCcw,
} from "lucide-react";
import { ProfileAccountDialogs } from "@/components/ProfileAccountDialogs";
import { StudyProgressBar } from "@/components/StudyProgressBar";
import { ProfileMenu } from "@/components/ui/profile-menu";
import { VStack } from "@astryxdesign/core/Layout";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { getCourse, listCourses } from "@/lib/decks";
import { deckStats } from "@/lib/scheduler";
import { clearMemory, loadMemory } from "@/lib/storage";

const PROFILE_NAME_KEY = "homerl-profile-name";
const PROFILE_EMAIL_KEY = "homerl-profile-email";

function pathActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const [name, setName] = useState("homeRL student");
  const [email, setEmail] = useState("Progress saved in this browser");
  const [cardsLearned, setCardsLearned] = useState(0);
  const [cardsTotal, setCardsTotal] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const cs166 = getCourse("cs166");
  const courses = useMemo(() => listCourses(), []);

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  useEffect(() => {
    try {
      const storedName = localStorage.getItem(PROFILE_NAME_KEY);
      const storedEmail = localStorage.getItem(PROFILE_EMAIL_KEY);
      if (storedName) setName(storedName);
      if (storedEmail) setEmail(storedEmail);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!cs166) return;
    const sections = cs166.sections;
    let learnedTotal = 0;
    let cardTotal = 0;

    for (const section of sections) {
      const memory = loadMemory(section.slug);
      const stats = deckStats(section.questions, memory);
      cardTotal += stats.total;
      learnedTotal += stats.learned;
    }

    setCardsLearned(learnedTotal);
    setCardsTotal(cardTotal);
  }, [cs166]);

  function saveProfile(nextName: string, nextEmail: string) {
    setName(nextName);
    setEmail(nextEmail);
    try {
      localStorage.setItem(PROFILE_NAME_KEY, nextName);
      localStorage.setItem(PROFILE_EMAIL_KEY, nextEmail);
    } catch {
      // ignore
    }
  }

  function resetAllProgress() {
    for (const course of courses) {
      for (const section of course.sections) {
        clearMemory(section.slug);
      }
    }
    router.refresh();
  }

  return (
    <>
      <Sidebar collapsible="icon" variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" render={<Link href="/" />}>
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <GraduationCap className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">homeRL</span>
                  <span className="truncate text-xs text-sidebar-foreground/70">Reinforcement drills</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent>
          <ScrollArea className="h-full">
            <SidebarGroup>
              <SidebarGroupLabel>Navigate</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={pathActive(pathname, "/")}
                      tooltip="All classes"
                      render={<Link href="/" />}
                    >
                      <LayoutGrid />
                      <span>All classes</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {courses.map((course) => (
              <SidebarGroup key={course.slug}>
                <SidebarGroupLabel>{course.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={pathActive(pathname, `/${course.slug}`)}
                        tooltip={course.title}
                        render={<Link href={`/${course.slug}`} />}
                      >
                        <BookOpen />
                        <span>{course.title}</span>
                      </SidebarMenuButton>
                      {course.sections.length > 0 ? (
                        <SidebarMenuSub>
                          {course.sections.map((section) => {
                            const href = `/${section.slug}`;
                            return (
                              <SidebarMenuSubItem key={section.slug}>
                                <SidebarMenuSubButton
                                  isActive={pathname === href}
                                  render={<Link href={href} />}
                                >
                                  <span className="flex min-w-0 items-center gap-1.5">
                                    <span className="truncate">{section.title}</span>
                                    {section.kind === "book" ? (
                                      <span className="shrink-0 rounded-sm bg-sidebar-accent px-1 py-0.5 text-[10px] font-medium uppercase tracking-wide text-sidebar-foreground/70">
                                        Book
                                      </span>
                                    ) : null}
                                  </span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      ) : null}
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </ScrollArea>
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter className="p-2">
          <VStack gap={2} width="100%">
            {cardsTotal > 0 ? (
              <StudyProgressBar
                label="Study progress"
                learned={cardsLearned}
                total={cardsTotal}
                style={{ width: "100%" }}
              />
            ) : null}
            <div className="w-full min-w-0 [&_.ui-pm]:max-w-none [&_.ui-pm]:rounded-xl [&_.ui-pm]:bg-transparent [&_.ui-pm]:p-0 [&_.ui-pm__card]:border-sidebar-border [&_.ui-pm__card]:bg-sidebar [&_.ui-pm__card]:shadow-none">
              <ProfileMenu
                name={name}
                email={email}
                items={[
                {
                  id: "profile",
                  label: "Edit profile",
                  icon: <PencilLine className="size-4" strokeWidth={1.5} />,
                  onSelect: () => setEditOpen(true),
                },
                {
                  id: "reset",
                  label: "Reset all progress",
                  icon: <RotateCcw className="size-4" strokeWidth={1.5} />,
                  onSelect: () => setResetOpen(true),
                },
              ]}
                className="w-full"
              />
            </div>
          </VStack>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>

      <ProfileAccountDialogs
        editOpen={editOpen}
        onEditOpenChange={setEditOpen}
        name={name}
        email={email}
        onSaveProfile={saveProfile}
        resetOpen={resetOpen}
        onResetOpenChange={setResetOpen}
        onConfirmReset={resetAllProgress}
      />
    </>
  );
}
