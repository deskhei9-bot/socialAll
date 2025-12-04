import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  PenSquare,
  Calendar,
  Link2,
  BarChart3,
  FileText,
  Settings,
  ChevronLeft,
  Zap,
  Users,
  Shield,
  X,
} from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const userNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: PenSquare, label: "Create Post", path: "/create" },
  { icon: Calendar, label: "Scheduler", path: "/scheduler" },
  { icon: Link2, label: "Channels", path: "/channels" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: FileText, label: "Templates", path: "/templates" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const adminNavItems = [
  { icon: Shield, label: "Admin Dashboard", path: "/admin" },
  { icon: Users, label: "Manage Users", path: "/admin/users" },
  { icon: BarChart3, label: "System Analytics", path: "/admin/analytics" },
  { icon: Settings, label: "System Settings", path: "/admin/settings" },
];

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { isAdmin } = useUserRole();
  const navItems = isAdmin ? adminNavItems : userNavItems;
  const location = useLocation();

  // Handle nav click on mobile
  const handleNavClick = () => {
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <aside
      className={cn(
        "h-screen bg-sidebar border-r border-border/50 transition-all duration-300 flex flex-col z-50",
        // Desktop: sticky sidebar with collapse
        "hidden lg:flex lg:sticky lg:top-0",
        collapsed ? "lg:w-20" : "lg:w-64",
        // Mobile: fixed overlay sidebar
        mobileOpen && "!flex fixed inset-y-0 left-0 w-72"
      )}
    >
      {/* Logo */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neon-gradient flex items-center justify-center neon-glow flex-shrink-0">
              <Zap className="w-5 h-5 text-primary-foreground" />
            </div>
            {(!collapsed || mobileOpen) && (
              <div className="animate-fade-in">
                <h1 className="font-bold text-lg neon-text">SocialFlow</h1>
                <p className="text-xs text-muted-foreground">
                  {isAdmin ? "Admin Panel" : "Automation Hub"}
                </p>
              </div>
            )}
          </div>
          {/* Mobile close button */}
          {mobileOpen && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onMobileClose}
              className="lg:hidden"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={handleNavClick}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )
            }
          >
            <item.icon className={cn("w-5 h-5 flex-shrink-0", "group-hover:scale-110 transition-transform")} />
            {(!collapsed || mobileOpen) && <span className="font-medium animate-fade-in">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Toggle - Desktop only */}
      <div className="p-4 border-t border-border/50 hidden lg:block">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all"
        >
          <ChevronLeft
            className={cn("w-5 h-5 transition-transform duration-300", collapsed && "rotate-180")}
          />
          {!collapsed && <span className="text-sm">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
