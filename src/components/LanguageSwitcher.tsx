import { Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { setLanguage } from '@/lib/i18n';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  collapsed?: boolean;
}

export function LanguageSwitcher({ collapsed = false }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language;

  const toggleLanguage = () => {
    const newLang = currentLang === 'en' ? 'zh' : 'en';
    setLanguage(newLang);
  };

  const buttonContent = (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className={cn(
        'text-muted-foreground hover:text-foreground transition-colors',
        collapsed ? 'w-full justify-center' : 'w-full justify-start gap-2'
      )}
    >
      <Languages className="w-4 h-4 shrink-0" />
      {!collapsed && (
        <span className="text-sm">
          {currentLang === 'en' ? '中文' : 'English'}
        </span>
      )}
    </Button>
  );

  if (collapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          {buttonContent}
        </TooltipTrigger>
        <TooltipContent side="right">
          {currentLang === 'en' ? '切换到中文' : 'Switch to English'}
        </TooltipContent>
      </Tooltip>
    );
  }

  return buttonContent;
}
