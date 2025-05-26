'use client';

import { useState, useEffect, createContext, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Palette,
  Monitor,
  Moon,
  Sun,
  Smartphone,
  Tablet,
  Laptop,
  Eye,
  Type,
  Layout,
  Brush,
  Save,
  RotateCcw,
  Download,
  Upload,
  Zap,
  Settings
} from 'lucide-react';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

interface Typography {
  fontFamily: string;
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
  };
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

interface Spacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  '4xl': string;
}

interface BorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
}

interface ThemeConfig {
  id: string;
  name: string;
  description: string;
  mode: 'light' | 'dark' | 'auto';
  colors: ThemeColors;
  typography: Typography;
  spacing: Spacing;
  borderRadius: BorderRadius;
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  animations: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: string;
  };
  customCSS?: string;
  isDefault?: boolean;
  isActive?: boolean;
}

interface ThemeContextType {
  currentTheme: ThemeConfig;
  availableThemes: ThemeConfig[];
  setTheme: (themeId: string) => void;
  updateTheme: (updates: Partial<ThemeConfig>) => void;
  createTheme: (theme: Omit<ThemeConfig, 'id'>) => void;
  deleteTheme: (themeId: string) => void;
  exportTheme: (themeId: string) => string;
  importTheme: (themeJson: string) => void;
  previewMode: boolean;
  setPreviewMode: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Default theme configurations
const defaultThemes: ThemeConfig[] = [
  {
    id: 'flipkart-default',
    name: 'Flipkart Default',
    description: 'Official Flipkart theme with signature blue colors',
    mode: 'light',
    isDefault: true,
    isActive: true,
    colors: {
      primary: '#2874f0',
      secondary: '#fb641b',
      accent: '#ff6161',
      background: '#ffffff',
      surface: '#f8f9fa',
      text: '#212121',
      textSecondary: '#6c757d',
      border: '#e9ecef',
      error: '#dc3545',
      success: '#28a745',
      warning: '#ffc107',
      info: '#17a2b8'
    },
    typography: {
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
      '4xl': '6rem'
    },
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      full: '9999px'
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
    },
    animations: {
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms'
      },
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },
  {
    id: 'dark-mode',
    name: 'Dark Mode',
    description: 'Dark theme for better night viewing',
    mode: 'dark',
    colors: {
      primary: '#3b82f6',
      secondary: '#f59e0b',
      accent: '#ef4444',
      background: '#111827',
      surface: '#1f2937',
      text: '#f9fafb',
      textSecondary: '#9ca3af',
      border: '#374151',
      error: '#ef4444',
      success: '#10b981',
      warning: '#f59e0b',
      info: '#06b6d4'
    },
    typography: {
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
      '4xl': '6rem'
    },
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      md: '0.375rem',
      lg: '0.5rem',
      xl: '0.75rem',
      '2xl': '1rem',
      full: '9999px'
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.3)',
      md: '0 4px 6px -1px rgb(0 0 0 / 0.3)',
      lg: '0 10px 15px -3px rgb(0 0 0 / 0.3)',
      xl: '0 20px 25px -5px rgb(0 0 0 / 0.3)'
    },
    animations: {
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms'
      },
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
    }
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean and minimal design with subtle colors',
    mode: 'light',
    colors: {
      primary: '#000000',
      secondary: '#6b7280',
      accent: '#ef4444',
      background: '#ffffff',
      surface: '#fafafa',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
      error: '#ef4444',
      success: '#059669',
      warning: '#d97706',
      info: '#0891b2'
    },
    typography: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem'
      },
      fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700
      },
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75
      }
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
      '4xl': '6rem'
    },
    borderRadius: {
      none: '0',
      sm: '0.125rem',
      md: '0.25rem',
      lg: '0.375rem',
      xl: '0.5rem',
      '2xl': '0.75rem',
      full: '9999px'
    },
    shadows: {
      sm: '0 1px 2px 0 rgb(0 0 0 / 0.03)',
      md: '0 2px 4px 0 rgb(0 0 0 / 0.05)',
      lg: '0 4px 6px 0 rgb(0 0 0 / 0.07)',
      xl: '0 8px 15px 0 rgb(0 0 0 / 0.1)'
    },
    animations: {
      duration: {
        fast: '100ms',
        normal: '200ms',
        slow: '400ms'
      },
      easing: 'ease-out'
    }
  }
];

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: string;
}

export function ThemeProvider({ children, initialTheme = 'flipkart-default' }: ThemeProviderProps) {
  const [themes, setThemes] = useState<ThemeConfig[]>(defaultThemes);
  const [currentThemeId, setCurrentThemeId] = useState(initialTheme);
  const [previewMode, setPreviewMode] = useState(false);

  const currentTheme = themes.find(t => t.id === currentThemeId) || themes[0];

  const setTheme = (themeId: string) => {
    setCurrentThemeId(themeId);
    applyTheme(themes.find(t => t.id === themeId) || themes[0]);
  };

  const updateTheme = (updates: Partial<ThemeConfig>) => {
    setThemes(prev => prev.map(theme => 
      theme.id === currentThemeId 
        ? { ...theme, ...updates }
        : theme
    ));
  };

  const createTheme = (newTheme: Omit<ThemeConfig, 'id'>) => {
    const theme = {
      ...newTheme,
      id: `theme-${Date.now()}`
    };
    setThemes(prev => [...prev, theme]);
  };

  const deleteTheme = (themeId: string) => {
    if (themes.find(t => t.id === themeId)?.isDefault) return;
    setThemes(prev => prev.filter(t => t.id !== themeId));
    if (currentThemeId === themeId) {
      setCurrentThemeId(themes[0].id);
    }
  };

  const exportTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    return theme ? JSON.stringify(theme, null, 2) : '';
  };

  const importTheme = (themeJson: string) => {
    try {
      const theme = JSON.parse(themeJson);
      if (theme && typeof theme === 'object') {
        createTheme(theme);
      }
    } catch (error) {
      console.error('Failed to import theme:', error);
    }
  };

  const applyTheme = (theme: ThemeConfig) => {
    const root = document.documentElement;
    
    // Apply CSS custom properties
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    root.style.setProperty('--font-family', theme.typography.fontFamily);
    
    Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
      root.style.setProperty(`--font-size-${key}`, value);
    });

    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--border-radius-${key}`, value);
    });

    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });

    // Apply custom CSS if provided
    if (theme.customCSS) {
      let styleElement = document.getElementById('custom-theme-styles');
      if (!styleElement) {
        styleElement = document.createElement('style');
        styleElement.id = 'custom-theme-styles';
        document.head.appendChild(styleElement);
      }
      styleElement.textContent = theme.customCSS;
    }
  };

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  const contextValue: ThemeContextType = {
    currentTheme,
    availableThemes: themes,
    setTheme,
    updateTheme,
    createTheme,
    deleteTheme,
    exportTheme,
    importTheme,
    previewMode,
    setPreviewMode
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

interface ThemeManagerProps {
  className?: string;
}

export function ThemeManager({ className = '' }: ThemeManagerProps) {
  const {
    currentTheme,
    availableThemes,
    setTheme,
    updateTheme,
    createTheme,
    deleteTheme,
    exportTheme,
    importTheme,
    previewMode,
    setPreviewMode
  } = useTheme();

  const [editingTheme, setEditingTheme] = useState<ThemeConfig | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [importJson, setImportJson] = useState('');

  const handleColorChange = (colorKey: keyof ThemeColors, value: string) => {
    if (editingTheme) {
      setEditingTheme({
        ...editingTheme,
        colors: {
          ...editingTheme.colors,
          [colorKey]: value
        }
      });
    }
  };

  const saveThemeChanges = () => {
    if (editingTheme) {
      updateTheme(editingTheme);
      setEditingTheme(null);
    }
  };

  const resetThemeChanges = () => {
    setEditingTheme(null);
  };

  const renderColorPicker = (colorKey: keyof ThemeColors, label: string) => (
    <div key={colorKey} className="flex items-center justify-between p-3 border rounded-lg">
      <div>
        <Label className="font-medium">{label}</Label>
        <p className="text-sm text-gray-500">{colorKey}</p>
      </div>
      <div className="flex items-center space-x-2">
        <div
          className="w-8 h-8 rounded border border-gray-300"
          style={{ backgroundColor: editingTheme?.colors[colorKey] || currentTheme.colors[colorKey] }}
        />
        <Input
          type="color"
          value={editingTheme?.colors[colorKey] || currentTheme.colors[colorKey]}
          onChange={(e) => handleColorChange(colorKey, e.target.value)}
          className="w-16 h-8 p-0 border-0"
        />
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Palette className="h-5 w-5" />
            <span>Theme Manager</span>
            <Badge variant={previewMode ? "default" : "secondary"}>
              {previewMode ? 'Preview Mode' : 'Live Mode'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="themes" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="themes">Themes</TabsTrigger>
              <TabsTrigger value="customize">Customize</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="import-export">Import/Export</TabsTrigger>
            </TabsList>

            {/* Themes Tab */}
            <TabsContent value="themes" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Available Themes</h3>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Zap className="h-4 w-4 mr-2" />
                  Create New Theme
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableThemes.map((theme) => (
                  <Card 
                    key={theme.id} 
                    className={`cursor-pointer transition-all ${
                      currentTheme.id === theme.id 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setTheme(theme.id)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Theme Preview Colors */}
                        <div className="flex space-x-1 h-12 rounded overflow-hidden">
                          <div 
                            className="flex-1" 
                            style={{ backgroundColor: theme.colors.primary }}
                          />
                          <div 
                            className="flex-1" 
                            style={{ backgroundColor: theme.colors.secondary }}
                          />
                          <div 
                            className="flex-1" 
                            style={{ backgroundColor: theme.colors.accent }}
                          />
                          <div 
                            className="flex-1" 
                            style={{ backgroundColor: theme.colors.background }}
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{theme.name}</h4>
                            {theme.isDefault && (
                              <Badge variant="outline" className="text-xs">Default</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{theme.description}</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            {theme.mode === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                            <span className="text-sm capitalize">{theme.mode}</span>
                          </div>

                          {!theme.isDefault && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteTheme(theme.id);
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Customize Tab */}
            <TabsContent value="customize" className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Customize Current Theme</h3>
                <div className="flex space-x-2">
                  {editingTheme && (
                    <>
                      <Button variant="outline" onClick={resetThemeChanges}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                      </Button>
                      <Button onClick={saveThemeChanges}>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </>
                  )}
                  {!editingTheme && (
                    <Button onClick={() => setEditingTheme({ ...currentTheme })}>
                      <Brush className="h-4 w-4 mr-2" />
                      Start Editing
                    </Button>
                  )}
                </div>
              </div>

              {editingTheme ? (
                <Tabs defaultValue="colors" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="colors">Colors</TabsTrigger>
                    <TabsTrigger value="typography">Typography</TabsTrigger>
                    <TabsTrigger value="spacing">Spacing</TabsTrigger>
                    <TabsTrigger value="effects">Effects</TabsTrigger>
                  </TabsList>

                  <TabsContent value="colors" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {renderColorPicker('primary', 'Primary Color')}
                      {renderColorPicker('secondary', 'Secondary Color')}
                      {renderColorPicker('accent', 'Accent Color')}
                      {renderColorPicker('background', 'Background')}
                      {renderColorPicker('surface', 'Surface')}
                      {renderColorPicker('text', 'Text Color')}
                      {renderColorPicker('textSecondary', 'Secondary Text')}
                      {renderColorPicker('border', 'Border Color')}
                      {renderColorPicker('error', 'Error Color')}
                      {renderColorPicker('success', 'Success Color')}
                      {renderColorPicker('warning', 'Warning Color')}
                      {renderColorPicker('info', 'Info Color')}
                    </div>
                  </TabsContent>

                  <TabsContent value="typography" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label>Font Family</Label>
                        <Input
                          value={editingTheme.typography.fontFamily}
                          onChange={(e) => setEditingTheme({
                            ...editingTheme,
                            typography: {
                              ...editingTheme.typography,
                              fontFamily: e.target.value
                            }
                          })}
                          placeholder="Inter, sans-serif"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="spacing" className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Spacing configuration will be available in the next update.
                    </p>
                  </TabsContent>

                  <TabsContent value="effects" className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Effects and animation configuration will be available in the next update.
                    </p>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-12">
                  <Brush className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Ready to Customize?
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Start editing to customize colors, typography, and more
                  </p>
                  <Button onClick={() => setEditingTheme({ ...currentTheme })}>
                    <Brush className="h-4 w-4 mr-2" />
                    Start Editing
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Preview Tab */}
            <TabsContent value="preview" className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Theme Preview</h3>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={previewMode} 
                      onCheckedChange={setPreviewMode}
                    />
                    <Label>Preview Mode</Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Desktop Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Monitor className="h-4 w-4" />
                      <span>Desktop</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-gray-100 rounded border-2 border-gray-300 overflow-hidden">
                      <div className="w-full h-full bg-white p-2 space-y-2 text-xs">
                        <div className="h-4 bg-blue-500 rounded" />
                        <div className="grid grid-cols-3 gap-1 h-12">
                          <div className="bg-gray-200 rounded" />
                          <div className="bg-gray-200 rounded" />
                          <div className="bg-gray-200 rounded" />
                        </div>
                        <div className="h-2 bg-gray-200 rounded" />
                        <div className="h-2 bg-gray-200 rounded w-3/4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tablet Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Tablet className="h-4 w-4" />
                      <span>Tablet</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-[3/4] bg-gray-100 rounded border-2 border-gray-300 overflow-hidden mx-auto max-w-[200px]">
                      <div className="w-full h-full bg-white p-2 space-y-2 text-xs">
                        <div className="h-3 bg-blue-500 rounded" />
                        <div className="grid grid-cols-2 gap-1 h-8">
                          <div className="bg-gray-200 rounded" />
                          <div className="bg-gray-200 rounded" />
                        </div>
                        <div className="h-1 bg-gray-200 rounded" />
                        <div className="h-1 bg-gray-200 rounded w-2/3" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Mobile Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Smartphone className="h-4 w-4" />
                      <span>Mobile</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-[9/16] bg-gray-100 rounded border-2 border-gray-300 overflow-hidden mx-auto max-w-[120px]">
                      <div className="w-full h-full bg-white p-1 space-y-1 text-xs">
                        <div className="h-2 bg-blue-500 rounded" />
                        <div className="space-y-1">
                          <div className="bg-gray-200 rounded h-4" />
                          <div className="bg-gray-200 rounded h-4" />
                        </div>
                        <div className="h-1 bg-gray-200 rounded" />
                        <div className="h-1 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Import/Export Tab */}
            <TabsContent value="import-export" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Export Theme */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Download className="h-4 w-4" />
                      <span>Export Theme</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Export your current theme configuration to share or backup
                    </p>
                    <Button 
                      onClick={() => {
                        const themeJson = exportTheme(currentTheme.id);
                        navigator.clipboard.writeText(themeJson);
                      }}
                      className="w-full"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Copy Theme to Clipboard
                    </Button>
                  </CardContent>
                </Card>

                {/* Import Theme */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Upload className="h-4 w-4" />
                      <span>Import Theme</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Import a theme configuration from JSON
                    </p>
                    <textarea
                      className="w-full h-32 p-3 border rounded-md text-sm font-mono"
                      placeholder="Paste theme JSON here..."
                      value={importJson}
                      onChange={(e) => setImportJson(e.target.value)}
                    />
                    <Button 
                      onClick={() => {
                        if (importJson) {
                          importTheme(importJson);
                          setImportJson('');
                        }
                      }}
                      disabled={!importJson}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Import Theme
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
