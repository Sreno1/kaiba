import { Link, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { PanelLeftOpen, PanelLeftClose, StickyNote, Palette, Sun, Moon, Circle, BookOpen } from 'lucide-react';
import ProjectSelector from '@/features/scratchpad/components/ProjectSelector';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import DocsDashboard from '@/Components/DocsDashboard';

const themes = [
  { key: 'light', label: 'Light', icon: Sun },
  { key: 'dark', label: 'Dark', icon: Moon },
  { key: 'solarized', label: 'Solarized', icon: Circle },
];

export default function AuthenticatedLayout({ header, children, sidebarControls, navControls }) {
    const { tags } = usePage().props;
    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);
    const [showDocsDashboard, setShowDocsDashboard] = useState(false);

    const [theme, setTheme] = useState(() =>
        typeof window !== 'undefined'
            ? localStorage.getItem('theme') || 'light'
            : 'light'
    );

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleThemeChange = (newTheme) => {
        setTheme(newTheme);
    };


    return (
        <div className="min-h-screen bg-background">
            <nav
                className="border-b border-border bg-background text-foreground fixed top-0 h-16 transition-all duration-300 z-40"
                style={{
                    left: sidebarControls && sidebarControls.isLeftOpen ? '256px' : '48px',
                    right: sidebarControls && sidebarControls.isRightOpen ? '256px' : '48px'
                }}
            >
                {/* Left sidebar toggle - fixed to far left */}
                {sidebarControls && (
                    <button
                        onClick={sidebarControls.onLeftToggle}
                        className="fixed left-0 top-0 z-50 h-16 w-12 bg-primary hover:bg-primary/80 text-primary-foreground transition-all duration-300 flex items-center justify-center"
                        title={sidebarControls.isLeftOpen ? "Close Schedule" : "Open Schedule"}
                    >
                        {sidebarControls.isLeftOpen ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeftOpen className="w-5 h-5" />}
                    </button>
                )}

                {/* Right sidebar toggle - fixed to far right */}
                {sidebarControls && (
                    <button
                        onClick={sidebarControls.onRightToggle}
                        className="fixed right-0 top-0 z-50 h-16 w-12 bg-muted hover:bg-muted/80 text-muted-foreground transition-all duration-300 flex items-center justify-center"
                        title={sidebarControls.isRightOpen ? "Close Notes" : "Open Notes"}
                    >
                        <StickyNote className="w-5 h-5" />
                    </button>
                )}

                <div className="w-full h-full px-4 sm:px-6 lg:px-8 transition-all duration-300">
                    <div className="flex h-16 justify-between">
                        <div className="flex items-center flex-1">
                            <div className="flex shrink-0 items-center mr-8">
                                <Link href="/">
                                    <span className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Boldonse, sans-serif' }}>SHAIBA</span>
                                </Link>
                            </div>
                            {/* Navigation Controls */}
                            {navControls && (
                                <div className="hidden lg:flex flex-1 items-center justify-center">
                                    {navControls}
                                </div>
                            )}
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center sm:gap-3">
                            {/* Project Selector */}
                            <ProjectSelector tags={tags} />
                            
                            {/* Theme Selector */}
                            <div className="relative ms-3">
                              
                              <button
                                onClick={() => setShowDocsDashboard(true)}
                                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground rounded-md hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 mr-3"
                            >
                                <BookOpen className="w-5 h-5" />
                                <span className="hidden lg:inline">Docs</span>
                            </button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-foreground rounded-md hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                                        <Palette className="w-5 h-5" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40">
                                        <DropdownMenuLabel>Theme</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {themes.map((themeOption) => {
                                            const IconComponent = themeOption.icon;
                                            return (
                                                <DropdownMenuItem
                                                    key={themeOption.key}
                                                    onClick={() => handleThemeChange(themeOption.key)}
                                                    className={theme === themeOption.key ? 'bg-accent' : ''}
                                                >
                                                    <IconComponent className="w-4 h-4 mr-2" />
                                                    <span>{themeOption.label}</span>
                                                </DropdownMenuItem>
                                            );
                                        })}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition duration-150 ease-in-out hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >

                    <div className="border-t border-border pb-1 pt-4">
                        <div className="mt-3 space-y-1">
                            {/* Docs button for Mobile */}
                            <button
                                onClick={() => setShowDocsDashboard(true)}
                                className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                            >
                                <BookOpen className="w-4 h-4" />
                                Documentation
                            </button>
                            {/* Theme Switcher for Mobile */}
                            <div className="px-4 py-2">
                                <div className="text-sm font-medium text-foreground mb-2 flex items-center">
                                    <Palette className="w-4 h-4 mr-2" />
                                    Theme
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {themes.map((themeOption) => {
                                        const IconComponent = themeOption.icon;
                                        return (
                                            <button
                                                key={themeOption.key}
                                                onClick={() => handleThemeChange(themeOption.key)}
                                                className={`flex flex-col items-center p-2 rounded-md text-xs transition-colors ${
                                                    theme === themeOption.key
                                                        ? 'bg-accent text-accent-foreground'
                                                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                                                }`}
                                            >
                                                <IconComponent className="w-5 h-5 mb-1" />
                                                {themeOption.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main>{children}</main>
            
            <DocsDashboard 
                isOpen={showDocsDashboard} 
                onClose={() => setShowDocsDashboard(false)} 
            />
        </div>
    );
}
