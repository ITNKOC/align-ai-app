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
  User,
  UserCircle,
} from "lucide-react";
import { getSession, logout } from "@/actions/auth-actions";
import {
  dropdownMenu,
  navbarEnter,
  navLinkHover,
  logoHover,
  navButtonGlow,
  dropdownItemVariants,
  bottomNavItem,
} from "@/lib/animations";
import { ThemeToggle } from "./theme-toggle";

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
      <motion.nav
        className="navbar"
        variants={navbarEnter}
        initial="initial"
        animate="animate"
      >
        <div className="container-app">
          <div className="navbar-inner">
            {/* Logo */}
            <Link href={user ? "/dashboard" : "/"}>
              <motion.div
                className="flex items-center gap-2.5"
                {...logoHover}
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold text-foreground hidden sm:block">
                  Align.ai
                </span>
              </motion.div>
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <ThemeToggle />

              {!isLoading && (
                user ? (
                  <>
                    {/* Desktop nav links */}
                    <div className="hidden md:flex items-center gap-1 ml-2">
                      <Link href="/dashboard">
                        <motion.button
                          className={`btn-ghost ${
                            isActive("/dashboard")
                              ? "text-foreground bg-primary/10"
                              : ""
                          }`}
                          {...navLinkHover}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </motion.button>
                      </Link>
                      <Link href="/upload">
                        <motion.button
                          className="btn-primary py-2 px-3"
                          {...navButtonGlow}
                        >
                          <Plus className="w-4 h-4" />
                          Nouvelle
                        </motion.button>
                      </Link>
                    </div>

                    {/* User menu */}
                    <div className="relative ml-2">
                      <motion.button
                        onClick={() => setShowMenu(!showMenu)}
                        className="flex items-center gap-2 p-1.5 rounded-lg
                          hover:bg-primary/5 transition-colors duration-200
                          border border-transparent hover:border-primary/10"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="avatar avatar-sm">
                          {user.fullName.charAt(0).toUpperCase()}
                        </div>
                        <span className="hidden sm:block text-sm text-muted-foreground max-w-[100px] truncate">
                          {user.fullName.split(" ")[0]}
                        </span>
                        <motion.div
                          animate={{ rotate: showMenu ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </motion.div>
                      </motion.button>

                      <AnimatePresence>
                        {showMenu && (
                          <>
                            <motion.div
                              className="fixed inset-0 z-40"
                              onClick={() => setShowMenu(false)}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                            />
                            <motion.div
                              variants={dropdownMenu}
                              initial="initial"
                              animate="animate"
                              exit="exit"
                              className="dropdown-menu z-50"
                            >
                              <div className="px-3 py-2.5 border-b border-border">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {user.fullName}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                  {user.email}
                                </p>
                              </div>
                              <motion.div
                                variants={dropdownItemVariants}
                                initial="initial"
                                animate="animate"
                                custom={0}
                              >
                                <Link
                                  href="/profile"
                                  onClick={() => setShowMenu(false)}
                                  className="dropdown-item"
                                >
                                  <UserCircle className="w-4 h-4" />
                                  Mon Profil
                                </Link>
                              </motion.div>
                              <motion.div
                                variants={dropdownItemVariants}
                                initial="initial"
                                animate="animate"
                                custom={1}
                              >
                                <button
                                  onClick={handleLogout}
                                  className="dropdown-item text-red-500 hover:text-red-400 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  <LogOut className="w-4 h-4" />
                                  Se deconnecter
                                </button>
                              </motion.div>
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link href="/login">
                      <motion.button
                        className="btn-ghost"
                        {...navLinkHover}
                      >
                        Connexion
                      </motion.button>
                    </Link>
                    <Link href="/register">
                      <motion.button
                        className="btn-primary py-2 px-4"
                        {...navButtonGlow}
                      >
                        S&apos;inscrire
                      </motion.button>
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Bottom Navigation - Only for logged in users */}
      {user && (
        <motion.div
          className="bottom-nav"
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <Link href="/dashboard">
            <motion.div
              className={`bottom-nav-item ${isActive("/dashboard") ? "active" : ""}`}
              {...bottomNavItem}
            >
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </motion.div>
          </Link>
          <Link href="/upload">
            <motion.div
              className={`bottom-nav-item ${
                pathname.startsWith("/upload") ||
                pathname.startsWith("/analyze") ||
                pathname.startsWith("/chat") ||
                pathname.startsWith("/generate")
                  ? "active"
                  : ""
              }`}
              {...bottomNavItem}
            >
              <Plus className="w-5 h-5" />
              <span>Nouveau</span>
            </motion.div>
          </Link>
          <Link href="/profile">
            <motion.div
              className={`bottom-nav-item ${isActive("/profile") ? "active" : ""}`}
              {...bottomNavItem}
            >
              <User className="w-5 h-5" />
              <span>Profil</span>
            </motion.div>
          </Link>
        </motion.div>
      )}
    </>
  );
}
