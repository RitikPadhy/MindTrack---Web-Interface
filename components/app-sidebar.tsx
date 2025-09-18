"use client"

import { LayoutDashboard, Home, ChevronUp, Zap, ChevronDown, Clock, User2, CheckCircle, Puzzle } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarFooter,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import React from "react";

import Link from "next/link"

const items = [
    {
      title: "Home Page",
      url: "/",
      icon: Home,
    },
    {
      title: "Schedule Tasks",
      url: "scheduleTasks",
      icon: Clock,
    },
    {
      title: "Track Progress",
      url: "trackProgress",
      icon: CheckCircle,
    },
    {
      title: "Achievements",
      url: "automationTracker",
      icon: Zap,
    },
    {
      title: "Weekly Feedback",
      url: "weeklyFeedback",
      icon: Puzzle,
    },
    {
      title: "Reading Materials",
      url: "reading",
      icon: LayoutDashboard,
    },
  ]

  interface AppSidebarProps {
    setShowSettings: (open: boolean) => void;
    userEmail: string | null;
  }

export function AppSidebar({ setShowSettings, userEmail }: AppSidebarProps) {
  

  return (
    <div>
      <Sidebar className="border-none">
        <SidebarContent className="flex flex-col justify-between h-full overflow-y-auto scrollbar-hide">
          <SidebarGroup>
            <SidebarGroupLabel className="md:text-2xl lg:text-3xl xl:text-4xl 2xl:text-4xl font-semibold text-gray-700 tracking-wide mb-6 xl:mb-10 2xl:mb-14 mx-6 mt-6">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                MindTrack
              </Link>
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="">
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url} className="flex items-center gap-3 px-3 py-3 xl:py-5 2xl:py-6 rounded-md mx-2 hover:bg-none">
                        <item.icon className="w-5 h-5 pointer-events-none" />
                        <span className="md:text-sm lg:text-base xl:text-lg 2xl:text-xl text-gray-600 font-semibold hover:text-gray-500">
                          {item.title}
                        </span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarFooter className="p-4">
            <a
              onClick={() => setShowSettings(true)} 
              className="flex items-center justify-between gap-4 rounded-xl bg-white px-4 py-3 shadow-sm transition-opacity hover:opacity-80 focus:outline-none focus:ring-0
                        xl:px-1 xl:py-2 2xl:px-4 2xl:py-3 cursor-pointer"
            >
              {/* Left section: icon + centered email */}
              <div className="flex items-center gap-4 flex-1">
                <div className="rounded-lg bg-white p-2">
                  <User2 className="h-5 w-5 text-gray-700" />
                </div>
                <div className="flex-1 flex justify-center">
                  <span
                    className="truncate font-medium text-gray-700
                              md:text-sm
                              lg:text-base
                              xl:text-lg
                              2xl:text-lg"
                    title={userEmail?.split("@")[0] || ""}
                  >
                    {userEmail?.split("@")[0] || ""}
                  </span>
                </div>
              </div>

              {/* Right section: arrows */}
              <span className="flex flex-col items-center justify-center">
                <ChevronUp className="h-3 w-3 text-gray-500" />
                <ChevronDown className="h-3 w-3 -mt-1 text-gray-500" />
              </span>
            </a>
          </SidebarFooter>
        </SidebarContent>
      </Sidebar>
    </div>
  );
}