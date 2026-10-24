import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  GraduationCap,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  User,
  Star,
  Menu,
  X,
  Compass,
} from 'lucide-react';
import Button from '../common/Button';

export const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                Campus<span className="text-brand-600">Geeks</span>
              </span>
              <span className="hidden sm:inline-block ml-1.5 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-brand-50 text-brand-700 rounded-md border border-brand-200/60">
                P2P Hub
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            <Link
              to="/explore"
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isActive('/explore')
                  ? 'text-brand-600 bg-brand-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Compass className="w-4 h-4" />
              Explore Gear
            </Link>

            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  isActive('/dashboard')
                    ? 'text-brand-600 bg-brand-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                My Dashboard
              </Link>
            )}
          </div>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link to="/list-item">
                  <Button variant="campus" size="sm">
                    <PlusCircle className="w-4 h-4" />
                    List an Item
                  </Button>
                </Link>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-2 p-1.5 pl-2.5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all focus:outline-none"
                  >
                    <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="text-xs font-semibold text-slate-800 max-w-[100px] truncate">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <div className="flex items-center gap-0.5 text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded-full text-[11px] font-bold border border-amber-200/60">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{user?.trustScore?.toFixed(1) || '5.0'}</span>
                    </div>
                  </button>

                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {user?.name}
                        </p>
                        <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                        <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-600 bg-slate-50 p-2 rounded-lg">
                          <span className="font-semibold">ID:</span> {user?.collegeId}
                          <span className="text-slate-300">•</span>
                          <span className="truncate">{user?.department}</span>
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-slate-400" />
                          Borrow & Lending Dashboard
                        </Link>
                      </div>

                      <div className="border-t border-slate-100 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Join Campus
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <Link
            to="/explore"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-semibold text-slate-800 hover:bg-slate-50"
          >
            <Compass className="w-5 h-5 text-brand-600" />
            Explore Gear
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-semibold text-slate-800 hover:bg-slate-50"
              >
                <LayoutDashboard className="w-5 h-5 text-brand-600" />
                My Dashboard
              </Link>
              <Link
                to="/list-item"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-base font-semibold text-campus-700 bg-campus-50"
              >
                <PlusCircle className="w-5 h-5 text-campus-600" />
                List an Item
              </Link>
              <div className="pt-2 border-t border-slate-100">
                <div className="px-3 py-2 text-xs text-slate-500">
                  Signed in as <span className="font-bold text-slate-800">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-base font-semibold text-rose-600 hover:bg-rose-50 rounded-xl"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full justify-center">
                  Log In
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full justify-center">
                  Join Campus
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
