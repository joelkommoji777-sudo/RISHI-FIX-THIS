import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home, 
  User, 
  FileText, 
  GraduationCap, 
  Mail, 
  History,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [resumeData, setResumeData] = useState<any>(null);
  const [professorHistory, setProfessorHistory] = useState<any[]>([]);
  const [totalProfessorsFound, setTotalProfessorsFound] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    // Load resume data and professor history from localStorage
    const savedResumeData = localStorage.getItem('extractedResumeData');
    const savedHistory = localStorage.getItem('professorHistory');
    
    if (savedResumeData) {
      setResumeData(JSON.parse(savedResumeData));
    }
    
    if (savedHistory) {
      const history = JSON.parse(savedHistory);
      setProfessorHistory(history);
      // Calculate total professors found across all searches
      const total = history.reduce((sum: number, search: any) => sum + (search.totalFound || 0), 0);
      setTotalProfessorsFound(total);
    }
  }, []);

  const navigationItems = [
    {
      name: "Home",
      path: "/",
      icon: Home,
      description: "Welcome page"
    },
    {
      name: "Onboarding",
      path: "/onboarding/personal-info",
      icon: User,
      description: "Complete your profile",
      badge: !resumeData ? "Required" : "Done"
    },
    {
      name: "Professor Match",
      path: "/professor-match",
      icon: GraduationCap,
      description: "Find research professors",
      disabled: !resumeData
    },
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: FileText,
      description: "View your profile & data",
      disabled: !resumeData
    },
    {
      name: "Search History",
      path: "/history",
      icon: History,
      description: "Previous searches",
      disabled: professorHistory.length === 0,
      badge: professorHistory.length > 0 ? professorHistory.length.toString() : null
    },
    {
      name: "Email Settings",
      path: "/email-settings",
      icon: Mail,
      description: "Configure email"
    }
  ];

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Overlay */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${isCollapsed ? 'w-16' : 'w-64'} bg-background border-r border-border h-screen fixed left-0 top-0 z-50 overflow-y-auto transition-all duration-500 ease-in-out shadow-lg`}>
        <div className="p-6">
          {/* Header with Toggle */}
          <div className="flex items-center justify-between mb-8">
            {!isCollapsed && (
              <div>
                <h2 className="text-2xl font-bold text-foreground">Professor Matcher</h2>
                <p className="text-sm text-muted-foreground">Research Opportunity Finder</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="ml-auto transition-all duration-200 hover:bg-accent hover:text-accent-foreground"
            >
              {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
            </Button>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.name}
                  variant={isActive(item.path) ? "default" : "ghost"}
                  className={`w-full justify-start h-auto p-3 transition-all duration-200 hover:bg-accent hover:text-accent-foreground ${
                    item.disabled ? "opacity-50 cursor-not-allowed" : ""
                  } ${isCollapsed ? "px-3" : ""} ${
                    isActive(item.path) ? "bg-primary text-primary-foreground shadow-sm" : ""
                  }`}
                  onClick={() => !item.disabled && navigate(item.path)}
                  disabled={item.disabled}
                  title={isCollapsed ? item.name : undefined}
                >
                  <div className="flex items-center w-full">
                    <Icon className="w-5 h-5 mr-3" />
                    {!isCollapsed && (
                      <>
                        <div className="flex-1 text-left">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-muted-foreground">{item.description}</div>
                        </div>
                        {item.badge && (
                          <Badge variant={item.badge === "Required" ? "destructive" : "secondary"} className="ml-2">
                            {item.badge}
                          </Badge>
                        )}
                      </>
                    )}
                  </div>
                </Button>
              );
            })}
          </nav>

          {/* User Info */}
          {resumeData && !isCollapsed && (
            <Card className="mt-8 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {resumeData.personal_info?.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {resumeData.personal_info?.email || "user@example.com"}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Quick Stats */}
          {resumeData && !isCollapsed && (
            <Card className="mt-4 p-4">
              <h4 className="text-sm font-medium mb-2">Quick Stats</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>Resume: ✅ Processed</div>
                <div>Professors Found: {totalProfessorsFound}</div>
                <div>Profile: 100% Complete</div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;