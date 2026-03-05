import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Briefcase, 
  Calendar, 
  BarChart3, 
  Archive,
  Clock,
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

  const navItems = [
    { to: '/', icon: LayoutDashboard, labelKey: 'nav.dashboard' },
    { to: '/jobs', icon: Briefcase, labelKey: 'nav.jobs' },
    { to: '/time-tracker', icon: Clock, labelKey: 'nav.timeTracker' },
    { to: '/analytics', icon: BarChart3, labelKey: 'nav.analytics' },
    { to: '/archive', icon: Archive, labelKey: 'nav.archive' },
    { to: '/timeline', icon: Calendar, labelKey: 'nav.timeline' },
  ];

  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
  }, [collapsed]);

  return (
    <aside
      className={cn(
        'h-screen sticky top-0 bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300',
        collapsed ? 'w-[60px]' : 'w-[220px]'
      )}
    >
      {/* Logo & Toggle */}
      <div className={cn(
        'h-16 flex items-center border-b border-sidebar-border',
        collapsed ? 'justify-center px-2' : 'justify-between px-4'
      )}>
        <div className={cn('flex items-center', collapsed ? '' : 'gap-2')}>
          <div className="w-8 h-8 shrink-0 overflow-hidden rounded-lg">
            <img 
              src={offermindIcon} 
              alt="OfferMind" 
              className="w-full h-full object-cover scale-[1.6]"
            />
          </div>
          {!collapsed && (
            <span className="font-semibold text-[15px] tracking-[-0.01em] text-sidebar-accent-foreground">
              OfferMind
            </span>
          )}
        </div>
        
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(false)}
                className="h-7 w-7 text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
              >
                <PanelLeft className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">{t('nav.expandSidebar')}</TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(true)}
            className="h-7 w-7 text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
          >
            <PanelLeftClose className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || 
            (item.to !== '/' && location.pathname.startsWith(item.to));
          const label = t(item.labelKey);
          
          const linkContent = (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-2.5 px-3 py-3 rounded-lg transition-all',
                isActive
                  ? 'bg-primary/10 text-primary text-[14px] font-semibold'
                  : 'text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent/60 text-[13px] font-medium',
                collapsed && 'justify-center px-2'
              )}
            >
              <item.icon className={cn(
                'w-5 h-5 shrink-0',
                isActive ? 'text-primary' : 'text-sidebar-foreground'
              )} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.to} delayDuration={0}>
                <TooltipTrigger asChild>
                  {linkContent}
                </TooltipTrigger>
                <TooltipContent side="right" className="font-medium text-[12px]">
                  {label}
                </TooltipContent>
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </nav>

      {/* User & Sign Out */}
      <div className="p-2 border-t border-sidebar-border space-y-1">
        {user && !collapsed && (
          <div className="px-3 py-1.5 text-[11px] text-sidebar-foreground/70 truncate">
            {user.email}
          </div>
        )}

        <LanguageSwitcher collapsed={collapsed} />
        
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                onClick={signOut}
                className="w-full justify-center text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent"
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
            className="w-full justify-start text-sidebar-foreground hover:text-sidebar-accent-foreground hover:bg-sidebar-accent text-[13px]"
          >
            <LogOut className="w-4 h-4" />
            <span className="ml-2">{t('nav.signOut')}</span>
          </Button>
        )}
      </div>
    </aside>
  );
}
