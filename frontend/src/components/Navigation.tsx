import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, TrendingUp, User, LogOut } from "lucide-react";
import { useAuth0 } from "@/lib/auth0";
import { Button } from "@/components/ui/button";

export const Navigation = () => {
  const { logout, isAuthenticated } = useAuth0();
  
  const navItems = [
    { to: "/", label: "Dashboard", icon: LayoutDashboard },
    { to: "/progress", label: "Progress", icon: TrendingUp },
    { to: "/profile", label: "Profile", icon: User },
  ];

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  return (
    <nav className="flex items-center gap-1">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )
            }
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        );
      })}
      {isAuthenticated && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="ml-2 gap-2"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      )}
    </nav>
  );
};
