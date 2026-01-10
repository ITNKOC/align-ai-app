"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  LayoutDashboard,
  Plus,
  LogOut,
  ChevronDown,
  Home,
  FileText,
  User,
  UserCircle,
} from "lucide-react";
import { getSession, logout } from "@/actions/auth-actions";
import { dropdownMenu } from "@/lib/animations";

interface AppNavbarProps {
  showAuth?: boolean;
}

export function AppNavbar({ showAuth = true }: AppNavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<{ fullName: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (showAuth) {
      checkAuth();
    } else {
      setIsLoading(false);
    }
  }, [showAuth]);

  const checkAuth = async () => {
    const session = await getSession();
    if (session) {
      setUser({ fullName: session.fullName, email: session.email });
    }
    setIsLoading(false);
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setShowMenu(false);
    router.push("/");
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      {/* Top Navigation */}
      <nav className="navbar">
        <div className="container-app">
          <div className="navbar-inner">
            {/* Logo */}
            <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white hidden sm:block">Align.ai</span>
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {!isLoading && (
                user ? (
                  <>
                    {/* Desktop nav links */}
                    <div className="hidden md:flex items-center gap-1">
                      <Link href="/dashboard">
                        <button className={`btn-ghost ${isActive("/dashboard") ? "text-white bg-white/5" : ""}`}>
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </button>
                      </Link>
                      <Link href="/upload">
                        <button className="btn-primary py-2 px-3">
                          <Plus className="w-4 h-4" />
                          Nouvelle
                        </button>
                      </Link>
                    </div>

                    {/* User menu */}
                    <div className="relative ml-2">
                      <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                      >
                        <div className="avatar avatar-sm">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <span className="hidden sm:block text-sm text-white/70 max-w-[100px] truncate">
                          {user.fullName.split(" ")[0]}
                        </span>
                        <ChevronDown className="w-4 h-4 text-white/40" />
                      </button>

                      <AnimatePresence>
                        {showMenu && (
                          <>
                            <div
                              className="fixed inset-0 z-40"
                              onClick={() => setShowMenu(false)}
                            />
                            <motion.div
                              variants={dropdownMenu}
                              initial="initial"
                              animate="animate"
                              exit="exit"
                              className="dropdown-menu z-50"
                            >
                              <div className="px-3 py-2.5 border-b border-white/10">
                                <p className="text-sm font-medium text-white truncate">
                                  {user.fullName}
                                </p>
                                <p className="text-xs text-white/50 truncate">
                                  {user.email}
                                </p>
                              </div>
                              <Link
                                href="/profile"
                                onClick={() => setShowMenu(false)}
                                className="dropdown-item"
                              >
                                <UserCircle className="w-4 h-4" />
                                Mon Profil
                              </Link>
                              <button
                                onClick={handleLogout}
                                className="dropdown-item text-red-400 hover:text-red-300"
                              >
                                <LogOut className="w-4 h-4" />
                                Se deconnecter
                              </button>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link href="/login">
                      <button className="btn-ghost">Connexion</button>
                    </Link>
                    <Link href="/register">
                      <button className="btn-primary py-2 px-4">S&apos;inscrire</button>
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Bottom Navigation - Only for logged in users */}
      {user && (
        <div className="bottom-nav">
          <Link href="/dashboard" className={`bottom-nav-item ${isActive("/dashboard") ? "active" : ""}`}>
            <LayoutDashboard className="w-5 h-5" />
            <span>Dashboard</span>
          </Link>
          <Link href="/upload" className={`bottom-nav-item ${pathname.startsWith("/upload") || pathname.startsWith("/analyze") || pathname.startsWith("/chat") || pathname.startsWith("/generate") ? "active" : ""}`}>
            <Plus className="w-5 h-5" />
            <span>Nouveau</span>
          </Link>
          <Link href="/profile" className={`bottom-nav-item ${isActive("/profile") ? "active" : ""}`}>
            <User className="w-5 h-5" />
            <span>Profil</span>
          </Link>
        </div>
      )}
    </>
  );
}
