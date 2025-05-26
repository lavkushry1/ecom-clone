'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/theme-context';

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Handle mounting to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent render on server
  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className={`w-9 h-9 ${className}`}>
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const getCurrentIcon = () => {
    if (theme === 'dark') return <Moon className="h-4 w-4" />;
    if (theme === 'light') return <Sun className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const themeOptions = [
    {
      value: 'light',
      label: 'Light',
      icon: <Sun className="h-4 w-4" />
    },
    {
      value: 'dark',
      label: 'Dark', 
      icon: <Moon className="h-4 w-4" />
    },
    {
      value: 'system',
      label: 'System',
      icon: <Monitor className="h-4 w-4" />
    }
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`w-9 h-9 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${className}`}
          aria-label="Toggle theme"
        >
          {getCurrentIcon()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        {themeOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => setTheme(option.value as any)}
            className={`flex items-center gap-2 cursor-pointer ${
              theme === option.value ? 'bg-gray-100 dark:bg-gray-800' : ''
            }`}
          >
            {option.icon}
            <span>{option.label}</span>
            {theme === option.value && (
              <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
