import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { PanelLeftOpen, PanelLeftClose, StickyNote } from 'lucide-react';
import ThemeToggle from '../Components/ThemeToggle';

export default function AuthenticatedLayout({ header, children, sidebarControls, navControls }) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    // Sidebar width (Tailwind: w-64 = 16rem = 256px)
    const SIDEBAR_WIDTH = '64'; // Tailwind unit (w-64)
    const leftOffset = sidebarControls && sidebarControls.isLeftOpen ? `ml-${SIDEBAR_WIDTH}` : 'ml-0';
    const rightOffset = sidebarControls && sidebarControls.isRightOpen ? `mr-${SIDEBAR_WIDTH}` : 'mr-0';

    return (
        <div className="min-h-screen bg-background">
            <nav
                className={`border-b border-gray-100 bg-background text-foreground w-full fixed flex items-center justify-between px-4 transition-all duration-300 z-40 ${leftOffset} ${rightOffset}`}
            >
                {/* Left sidebar toggle - fixed to far left, hidden when sidebar is open */}
                {sidebarControls && !sidebarControls.isLeftOpen && (
                    <button
                        onClick={sidebarControls.onLeftToggle}
                        className="fixed left-0 top-0 z-50 h-16 w-12 bg-primary hover:bg-primary/80 text-white transition-all duration-300 flex items-center justify-center"
                        title="Open Schedule"
                    >
                        <PanelLeftOpen className="w-5 h-5" />
                    </button>
                )}

                {/* Right sidebar toggle - fixed to far right, hidden when sidebar is open */}
                {sidebarControls && !sidebarControls.isRightOpen && (
                    <button
                        onClick={sidebarControls.onRightToggle}
                        className="fixed right-0 top-0 z-50 h-16 w-12 bg-muted hover:bg-muted/80 text-white transition-all duration-300 flex items-center justify-center"
                        title="Open Notes"
                    >
                        <StickyNote className="w-5 h-5" />
                    </button>
                )}

                <div className="mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 transition-all duration-300">
                    <div className="flex h-16 justify-between">
                        <div className="flex items-center flex-1">
                            <div className="flex shrink-0 items-center mr-8">
                                <Link href="/">
                                    <span className="text-2xl font-bold text-gray-800" style={{ fontFamily: 'Boldonse, sans-serif' }}>KAIBA</span>
                                </Link>
                            </div>
                            {/* Navigation Controls */}
                            {navControls && (
                                <div className="hidden lg:flex flex-1 items-center justify-center">
                                    {navControls}
                                </div>
                            )}
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <NavLink
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                >
                                    Log Out
                                </NavLink>
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

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            <main>{children}</main>
        </div>
    );
}
