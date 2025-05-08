import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';

interface SidebarProps {
    isMobileOpen: boolean;
    onCloseMobile: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onCloseMobile }) => {
    const logout = useAuthStore(state => state.logout); 
    const user = useAuthStore(state => state.user); 
    const isAdmin = user?.isAdmin;
    const [isMainNavOpen, setIsMainNavOpen] = React.useState(true);
    const [isSettingsNavOpen, setIsSettingsNavOpen] = React.useState(false);

    const renderAdminLink = () => (
        <Link 
            to="/admin" 
            className="block py-2 px-2 hover:bg-gray-700 rounded transition-colors duration-150"
            onClick={onCloseMobile} // Close sidebar on link click on mobile
        >
            Admin
        </Link>
    );

    const renderMainNavigationLinks = () => (
        <>
            <Link to="/employees" className="block py-2 px-2 hover:bg-gray-700 rounded transition-colors duration-150" onClick={onCloseMobile}>Employees</Link>
            <Link to="/departments" className="block py-2 px-2 hover:bg-gray-700 rounded transition-colors duration-150" onClick={onCloseMobile}>Departments</Link>
            <Link to="/jobtitles" className="block py-2 px-2 hover:bg-gray-700 rounded transition-colors duration-150" onClick={onCloseMobile}>Job Titles</Link>
            <Link to="/trainings" className="block py-2 px-2 hover:bg-gray-700 rounded transition-colors duration-150" onClick={onCloseMobile}>Trainings</Link>
            <Link to="/benefits" className="block py-2 px-2 hover:bg-gray-700 rounded transition-colors duration-150" onClick={onCloseMobile}>Benefits</Link>
        </>
    );

    const renderSettingsNavigationLinks = () => (
        <>
            <Link to="/employment-statuses" className="block py-2 px-2 hover:bg-gray-700 rounded transition-colors duration-150" onClick={onCloseMobile}>Employment Statuses</Link>
            <Link to="/leave-types" className="block py-2 px-2 hover:bg-gray-700 rounded transition-colors duration-150" onClick={onCloseMobile}>Leave Types</Link>
        </>
    );

    return (
        <div 
            className={`bg-gray-800 text-white w-64 h-screen p-4 fixed top-0 left-0 flex flex-col z-30 transform transition-transform duration-300 ease-in-out 
                        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} 
                        md:translate-x-0 md:sticky md:z-auto`} // Sticky for desktop layout
        >
            <div className="flex justify-between items-center mb-6">
                <div className="text-2xl font-bold">
                    <Link to="/" onClick={onCloseMobile}>HR Management System</Link>
                </div>
                <button 
                    onClick={onCloseMobile} 
                    className="md:hidden p-1 text-gray-300 hover:text-white focus:outline-none"
                    aria-label="Close sidebar"
                >
                    {/* Simple X icon */}
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            <nav className="flex-grow space-y-2 overflow-y-auto">
                {isAdmin ? (
                    renderAdminLink()
                ) : (
                    <>
                        <div>
                            <button
                                onClick={() => setIsMainNavOpen(!isMainNavOpen)}
                                className="w-full text-left py-2 px-1 mb-1 hover:bg-gray-700 rounded flex justify-between items-center focus:outline-none transition-colors duration-150"
                                aria-expanded={isMainNavOpen}
                                aria-controls="main-nav-drawer"
                            >
                                Main Navigation
                                <span>{isMainNavOpen ? '▲' : '▼'}</span>
                            </button>
                            {isMainNavOpen && (
                                <div id="main-nav-drawer" className="pl-2 space-y-1">
                                    {renderMainNavigationLinks()}
                                </div>
                            )}
                        </div>

                        <div>
                            <button
                                onClick={() => setIsSettingsNavOpen(!isSettingsNavOpen)}
                                className="w-full text-left py-2 px-1 mb-1 hover:bg-gray-700 rounded flex justify-between items-center focus:outline-none transition-colors duration-150"
                                aria-expanded={isSettingsNavOpen}
                                aria-controls="settings-nav-drawer"
                            >
                                Settings & Types
                                <span>{isSettingsNavOpen ? '▲' : '▼'}</span>
                            </button>
                            {isSettingsNavOpen && (
                                <div id="settings-nav-drawer" className="pl-2 space-y-1">
                                    {renderSettingsNavigationLinks()}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </nav>

            <div className="mt-auto pt-4 border-t border-gray-700">
                <button
                    onClick={() => {
                        logout();
                        onCloseMobile();
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-150"
                >
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar; 