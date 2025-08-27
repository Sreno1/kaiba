import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { PanelLeftOpen, PanelLeftClose, StickyNote } from 'lucide-react';

export default function AuthenticatedLayout({ header, children, sidebarControls, navControls }) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="border-b border-gray-100 bg-white w-full fixed">
                {/* Left sidebar toggle - fixed to far left, hidden when sidebar is open */}
                {sidebarControls && !sidebarControls.isLeftOpen && (
                    <button
                        onClick={sidebarControls.onLeftToggle}
                        className="fixed left-0 top-0 z-50 h-16 w-12 bg-blue-500 hover:bg-blue-600 text-white transition-all duration-300 flex items-center justify-center"
                        title="Open Schedule"
                    >
                        <PanelLeftOpen className="w-5 h-5" />
                    </button>
                )}

                {/* Right sidebar toggle - fixed to far right, hidden when sidebar is open */}
                {sidebarControls && !sidebarControls.isRightOpen && (
                    <button
                        onClick={sidebarControls.onRightToggle}
                        className="fixed right-0 top-0 z-50 h-16 w-12 bg-gray-600 hover:bg-gray-700 text-white transition-all duration-300 flex items-center justify-center"
                        title="Open Notes"
                    >
                        <StickyNote className="w-5 h-5" />
                    </button>
                )}

                <div className={`mx-auto max-w-8xl px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
                    sidebarControls
                        ? `${!sidebarControls.isLeftOpen ? 'ml-12' : 'ml-0'} ${!sidebarControls.isRightOpen ? 'mr-12' : 'mr-0'}`
                        : ''
                }`}>
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
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
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
