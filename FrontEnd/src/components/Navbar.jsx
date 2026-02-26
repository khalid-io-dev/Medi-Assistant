import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Menu, X, LogOut, MessageSquare, History, BarChart2, Users, Home } from 'lucide-react';
import { useState } from 'react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navLinks = [
        { name: 'Accueil', href: '/', icon: Home, show: true },
        // User specific
        { name: 'Chat', href: '/chat', icon: MessageSquare, show: user?.role === 'USER' },
        { name: 'Historique', href: '/history', icon: History, show: user?.role === 'USER' },
        // Admin specific
        { name: 'Statistiques', href: '/admin/stats', icon: BarChart2, show: user?.role === 'ADMIN' },
        { name: 'Historique Global', href: '/admin/history', icon: History, show: user?.role === 'ADMIN' },
        { name: 'Utilisateurs', href: '/admin/users', icon: Users, show: user?.role === 'ADMIN' },
    ];

    return (
        <nav className="bg-light-background dark:bg-dark-background border-b border-light-primary/20 dark:border-dark-primary/20 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            {/* <span className="text-2xl font-heading font-bold text-light-primary dark:text-dark-primary">
                                CliniQ
                            </span> */}

                            <img src="/logo.png" alt="logo" className="h-14 md:h-20 w-auto object-contain"/>
                        </Link>
                    </div>

                    {/* Desktop menu */}
                    <div className="hidden md:flex items-center space-x-4">
                        {navLinks.filter(link => link.show).map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-light-text dark:text-dark-text hover:text-light-primary dark:hover:text-dark-primary transition-colors"
                            >
                                <link.icon className="w-4 h-4 mr-2" />
                                {link.name}
                            </Link>
                        ))}

                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="flex items-center px-4 py-2 bg-light-error/10 text-light-error hover:bg-light-error hover:text-white rounded-lg transition-all"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Déconnexion
                            </button>
                        ) : (
                            <div className="flex items-center space-x-2">
                                <Link to="/login" className="px-4 py-2 text-light-text dark:text-dark-text hover:text-light-primary border border-transparent hover:border-light-primary rounded-lg transition-all">
                                    Connexion
                                </Link>
                                <Link to="/register" className="px-4 py-2 bg-light-primary text-white hover:bg-light-accent rounded-lg transition-all">
                                    Inscription
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-light-text dark:text-dark-text hover:text-light-primary focus:outline-none"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {isOpen && (
                <div className="md:hidden bg-light-background dark:bg-dark-background border-b border-light-primary/20 dark:border-dark-primary/20">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {navLinks.filter(link => link.show).map((link) => (
                            <Link
                                key={link.name}
                                to={link.href}
                                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-light-text dark:text-dark-text hover:bg-light-primary/10"
                                onClick={() => setIsOpen(false)}
                            >
                                <link.icon className="w-5 h-5 mr-3" />
                                {link.name}
                            </Link>
                        ))}
                        {user ? (
                            <button
                                onClick={handleLogout}
                                className="w-full text-left flex items-center px-3 py-2 rounded-md text-base font-medium text-light-error hover:bg-light-error/10"
                            >
                                <LogOut className="w-5 h-5 mr-3" />
                                Déconnexion
                            </button>
                        ) : (
                            <div className="flex flex-col space-y-2 p-3">
                                <Link to="/login" className="text-center px-4 py-2 border border-light-primary text-light-primary rounded-lg" onClick={() => setIsOpen(false)}>
                                    Connexion
                                </Link>
                                <Link to="/register" className="text-center px-4 py-2 bg-light-primary text-white rounded-lg" onClick={() => setIsOpen(false)}>
                                    Inscription
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
