"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { AppNavbar } from "./app-navbar";

interface LayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
  showAuth?: boolean;
  className?: string;
  containerClassName?: string;
  fullWidth?: boolean;
  noPadding?: boolean;
}

/**
 * Responsive layout wrapper component
 * Provides consistent spacing, navbar, and responsive container
 *
 * @example
 * // Standard page with navbar
 * <Layout>
 *   <YourContent />
 * </Layout>
 *
 * // Full-width content (no container max-width)
 * <Layout fullWidth>
 *   <YourContent />
 * </Layout>
 *
 * // No navbar (for auth pages)
 * <Layout showNavbar={false}>
 *   <YourContent />
 * </Layout>
 */
export function Layout({
  children,
  showNavbar = true,
  showAuth = true,
  className,
  containerClassName,
  fullWidth = false,
  noPadding = false,
}: LayoutProps) {
  return (
    <div
      className={cn(
        "min-h-screen",
        // Bottom padding for mobile nav (when logged in)
        showNavbar && "pb-20 md:pb-0",
        className
      )}
    >
      {showNavbar && <AppNavbar showAuth={showAuth} />}

      <main
        className={cn(
          !fullWidth && "container-app",
          !noPadding && "py-4 md:py-6 lg:py-8",
          containerClassName
        )}
      >
        {children}
      </main>
    </div>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

/**
 * Responsive page header component
 * Provides consistent header styling across pages
 */
export function PageHeader({
  title,
  description,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 mb-6 md:mb-8",
        "md:flex-row md:items-center md:justify-between",
        className
      )}
    >
      <div>
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white">
          {title}
        </h1>
        {description && (
          <p className="text-sm md:text-base text-white/60 mt-1">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3 flex-shrink-0">{children}</div>
      )}
    </div>
  );
}

interface ResponsiveGridProps {
  children: ReactNode;
  cols?: 1 | 2 | 3 | 4;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Responsive grid component
 * Automatically adjusts columns based on screen size
 *
 * @example
 * <ResponsiveGrid cols={3}>
 *   <Card />
 *   <Card />
 *   <Card />
 * </ResponsiveGrid>
 */
export function ResponsiveGrid({
  children,
  cols = 2,
  gap = "md",
  className,
}: ResponsiveGridProps) {
  const colsClass = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }[cols];

  const gapClass = {
    sm: "gap-2 md:gap-3",
    md: "gap-3 md:gap-4",
    lg: "gap-4 md:gap-6",
  }[gap];

  return (
    <div className={cn("grid", colsClass, gapClass, className)}>{children}</div>
  );
}

interface ResponsiveStackProps {
  children: ReactNode;
  direction?: "vertical" | "horizontal";
  gap?: "sm" | "md" | "lg";
  className?: string;
  reverse?: boolean;
}

/**
 * Responsive stack component
 * Vertical on mobile, optionally horizontal on larger screens
 *
 * @example
 * // Vertical stack (default)
 * <ResponsiveStack>
 *   <Item />
 *   <Item />
 * </ResponsiveStack>
 *
 * // Horizontal on md+
 * <ResponsiveStack direction="horizontal">
 *   <Item />
 *   <Item />
 * </ResponsiveStack>
 */
export function ResponsiveStack({
  children,
  direction = "vertical",
  gap = "md",
  className,
  reverse = false,
}: ResponsiveStackProps) {
  const directionClass =
    direction === "horizontal"
      ? reverse
        ? "flex-col md:flex-row-reverse"
        : "flex-col md:flex-row"
      : reverse
        ? "flex-col-reverse"
        : "flex-col";

  const gapClass = {
    sm: "gap-2 md:gap-3",
    md: "gap-3 md:gap-4",
    lg: "gap-4 md:gap-6",
  }[gap];

  return (
    <div className={cn("flex", directionClass, gapClass, className)}>
      {children}
    </div>
  );
}

/**
 * Touch-friendly button wrapper
 * Ensures minimum 44x44px touch target
 */
export function TouchTarget({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-h-[44px] min-w-[44px] flex items-center justify-center",
        className
      )}
    >
      {children}
    </div>
  );
}
