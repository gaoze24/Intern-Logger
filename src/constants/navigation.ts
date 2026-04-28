import {
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  Columns3,
  FileText,
  LayoutDashboard,
  Mail,
  Settings,
  Users,
  CheckSquare2,
} from "lucide-react";

export const NAV_ITEMS = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Applications", href: "/applications", icon: BriefcaseBusiness },
  { title: "Kanban", href: "/kanban", icon: Columns3 },
  { title: "Calendar", href: "/calendar", icon: CalendarDays },
  { title: "Tasks", href: "/tasks", icon: CheckSquare2 },
  { title: "Contacts", href: "/contacts", icon: Users },
  { title: "Documents", href: "/documents", icon: FileText },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Email Templates", href: "/email-templates", icon: Mail },
  { title: "Settings", href: "/settings", icon: Settings },
] as const;
