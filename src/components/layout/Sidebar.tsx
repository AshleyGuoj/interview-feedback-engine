import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Briefcase, 
  Calendar, 
  BarChart3, 
  Archive,
  LogOut,
  PanelLeftClose,
  PanelLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import offermindIcon from '@/assets/offermind-icon.png';

const SIDEBAR_COLLAPSED_KEY = 'sidebar-collapsed';

export function Sidebar() {
  const { t } = useTranslation();
  const [collapsed, setCollapsed] = useState(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return stored === 'true';
  });
  const location = useLocation();
  const { signOut, user } = useAuth();

  // Nav items with translation keys
  const navItems = [
    { to: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
    { to: '/jobs', icon: Briefcase, labelKey: 'nav.jobs' },
    { to: '/timeline', icon: Calendar, labelKey: 'nav.timeline' },
    { to: '/analytics', icon: BarChart3, labelKey: 'nav.analytics' },
    { to: '/archive', icon: Archive, labelKey: 'nav.archive' },
    
  ];

  // Persist collapse state
  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
  }, [collapsed]);

  return (
    <aside
      className={cn(
        'h-screen sticky top-0 border-r border-border bg-card flex flex-col transition-all duration-300',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      {/* Logo & Collapse Toggle */}
      <div className={cn(
        'h-20 flex items-center border-b border-border',
        collapsed ? 'justify-center px-2' : 'justify-between px-3'
      )}>
        <div className={cn('flex items-center', collapsed ? '' : 'gap-1.5')}>
          <img 
            src={offermindIcon} 
            alt="OfferMind" 
            className="h-14 w-14 object-contain shrink-0"
          />
          {!collapsed && (
            <span className="font-bold text-lg text-foreground">OfferMind</span>
          )}
        </div>
        
        {/* Collapse Toggle Button */}
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <PanelLeft className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{t('nav.expandSidebar')}</TooltipContent>
          </Tooltip>
        ) : (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(true)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <PanelLeftClose className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{t('nav.collapseSidebar')}</TooltipContent>
          </Tooltip>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || 
            (item.to !== '/' && location.pathname.startsWith(item.to));
          const label = t(item.labelKey);
          
          const linkContent = (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
                collapsed && 'justify-center px-2'
              )}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.to} delayDuration={0}>
                <TooltipTrigger asChild>
                  {linkContent}
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium">
                  {label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </nav>

      {/* User & Sign Out */}
      <div className="p-2 border-t border-border space-y-1">
        {user && !collapsed && (
          <div className="px-3 py-2 text-xs text-muted-foreground truncate">
            {user.email}
          </div>
        )}

        {/* Language Switcher */}
        <LanguageSwitcher collapsed={collapsed} />
        
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="w-full justify-center text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{t('nav.signOut')}</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={signOut}
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <LogOut className="w-4 h-4" />
            <span className="ml-2">{t('nav.signOut')}</span>
          </Button>
        )}
      </div>
    </aside>
  );
}
