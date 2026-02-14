/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { logout } from "@/redux/reducers/userSlice";
import { AppDispatch, RootState } from "@/redux/store";
import { AnimatePresence, motion } from "framer-motion";
import {
  BoxesIcon,
  CalendarDays,
  Castle,
  Clock,
  CreditCardIcon,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  Menu,
  Package,
  PersonStanding,
  Receipt,
  ShoppingBag,
  Store,
  Users,
  Wallet,
  Warehouse,
  X,
  FileText,
  Shield,
} from "lucide-react";

import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import RouteWrapper from "./RouteWrapper";
import { useRouter } from "next/navigation";
import { Role, useRoles } from "@/hooks/users/useRoles";

// ==================== Type Definitions ====================
interface SubNavItem {
  name: string;
  icon: any;
  href: string;
  onClick?: () => void;
  roles?: Role[]; // Add roles to control visibility
}

interface NavItem {
  name: string;
  icon: any;
  href?: string;
  items?: SubNavItem[];
  isActive?: boolean;
  roles?: Role[]; // Add roles to control visibility
}

// ==================== Animation Variants ====================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24,
    },
  },
};

const mobileMenuVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

const dropdownVariants = {
  hidden: { opacity: 0, height: 0 },
  visible: {
    opacity: 1,
    height: "auto",
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.2 },
  },
};

// ==================== Navbar Component ====================
const Navbar = () => {
  // ========== State Management ==========
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const router = useRouter();
  // ========== Refs ==========
  const menuRef = useRef<HTMLDivElement>(null);

  // ========== Redux ==========
  const dispatch = useDispatch<AppDispatch>();
  const roles = useSelector(
    (state: RootState) => state.user.user.user?.roles || []
  );

  // ========== Navigation Data ==========
  const navItems: NavItem[] = [
    {
      name: "الرئيسية",
      icon: LayoutDashboard,
      roles: [
        Role.ADMIN,
        Role.MANAGER,
        Role.TreasuryManager,
        Role.ShiftManager,
      ], // Only ShiftManager and Admin can access main pages
      items: [
        {
          name: "دفتر اليومية",
          icon: CalendarDays,
          href: "/",
          roles: [
            Role.ADMIN,
            Role.MANAGER,
            Role.TreasuryManager,
            Role.ShiftManager,
          ],
        },
        {
          name: "الصفحة الادارية",
          icon: LayoutDashboard,
          href: "/manager",
          roles: [Role.ADMIN, Role.MANAGER, Role.TreasuryManager],
        },
      ],
    },
    {
      name: "المالية",
      icon: Castle,
      roles: [Role.ADMIN, Role.MANAGER, Role.TreasuryManager], // Only Admin and Manager can access financial pages
      items: [
        {
          name: "الخزينة",
          icon: Castle,
          href: "/case",
          roles: [Role.ADMIN, Role.MANAGER, Role.TreasuryManager],
        },
        {
          name: "السلف",
          icon: CreditCardIcon,
          href: "/advances",
          roles: [Role.ADMIN, Role.MANAGER, Role.TreasuryManager],
        },
        {
          name: "الديون",
          icon: Wallet,
          href: "/debts",
          roles: [Role.ADMIN, Role.MANAGER, Role.TreasuryManager],
        },
        {
          name: "الفواتير",
          icon: Receipt,
          href: "/invoices",
          roles: [Role.ADMIN, Role.MANAGER, Role.TreasuryManager],
        },
      ],
    },
    {
      name: "المستودع",
      icon: Warehouse,
      roles: [Role.ADMIN, Role.MANAGER, Role.TreasuryManager, Role.TrayManager], // Only TrayManager and Admin can access warehouse
      items: [
        {
          name: "المواد",
          icon: Package,
          href: "/materials",
          roles: [Role.ADMIN, Role.MANAGER, Role.TreasuryManager],
        },
        {
          name: "الفوارغ",
          icon: BoxesIcon,
          href: "/trays",
          roles: [
            Role.ADMIN,
            Role.MANAGER,
            Role.TreasuryManager,
            Role.TrayManager,
          ],
        },
        {
          name: "المستودع",
          icon: Warehouse,
          href: "/warehouse",
          roles: [Role.ADMIN, Role.MANAGER, Role.TreasuryManager],
        },
      ],
    },
    {
      name: "التقارير",
      icon: FileText,
      href: "/reports",
      roles: [Role.ADMIN, Role.MANAGER, Role.TreasuryManager], // Only Admin, Manager, and TreasuryManager can access reports
    },
    {
      name: "سجل المراقبة",
      icon: Shield,
      href: "/audit-logs",
      roles: [Role.SUPER_ADMIN], // Only SUPER_ADMIN can access audit logs
    },
    {
      name: "إدارة",
      icon: Store,
      roles: [
        Role.ADMIN,
        Role.MANAGER,
        Role.TreasuryManager,
        Role.ShiftManager,
        Role.TrayManager,
      ], // Only Admin can access management
      items: [
        {
          name: "الطلبيات",
          icon: ShoppingBag,
          href: "/orders",
          roles: [Role.ADMIN, Role.MANAGER],
        },
        {
          name: "الموظفين",
          icon: Users,
          href: "/employees",
          roles: [Role.ADMIN, Role.MANAGER, Role.TreasuryManager],
        },
        {
          name: "الورديات",
          icon: Clock,
          href: "/shifts",
          roles: [Role.ADMIN, Role.MANAGER, Role.TreasuryManager],
        },
        {
          name: "الزبائن",
          icon: PersonStanding,
          href: "/customers",
          roles: [Role.ADMIN, Role.MANAGER, Role.TreasuryManager],
        },
        {
          name: "تسجيل الخروج",
          icon: LogOut,
          href: "/login",
          onClick: handleLogout,
          roles: [
            Role.ADMIN,
            Role.MANAGER,
            Role.ShiftManager,
            Role.TrayManager,
            Role.TreasuryManager,
          ], // Everyone can log out
        },
      ],
    },
  ];
  const { hasRole } = useRoles();

  useEffect(() => {
    // Don't redirect SUPER_ADMIN
    if (hasRole(Role.TrayManager) && !roles.includes(Role.SUPER_ADMIN)) {
      router.replace("/trays");
      localStorage.setItem("new_page", "/trays");
    }
  }, [hasRole, router, roles]);

  // ========== Event Handlers ==========
  // Handle logout
  function handleLogout() {
    dispatch(logout());
    handleNavigation();
  }

  // Close mobile menu on navigation
  function handleNavigation() {
    if (isMobile) {
      setIsOpen(false);
    }
  }

  // Toggle mobile menu dropdown
  function toggleExpand(itemName: string) {
    setExpandedItem(expandedItem === itemName ? null : itemName);
  }

  // Helper function to check if an item is visible based on user roles
  const isItemVisible = (item: NavItem | SubNavItem) => {
    // SUPER_ADMIN can see everything
    if (roles.includes(Role.SUPER_ADMIN)) return true;

    // If no roles specified, item is visible to all
    if (!item.roles) return true;

    // Check if user has any of the required roles
    return item.roles.some((role) => roles.includes(role));
  };

  // Filter nav items based on user roles
  const filteredNavItems = navItems
    .filter(
      (item) =>
        isItemVisible(item) &&
        (!item.items || item.items.some((subItem) => isItemVisible(subItem)))
    )
    .map((item) => ({
      ...item,
      items: item.items ? item.items.filter(isItemVisible) : undefined,
    }));

  // ========== Effects ==========
  // Check if we're on mobile on mount and window resize
  useEffect(() => {
    function checkIfMobile() {
      setIsMobile(window.innerWidth < 768);
    }

    // Initial check and add listener
    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);

    // Close mobile menu on larger screens
    function handleResize() {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkIfMobile);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // ========== Render Components ==========
  // Desktop dropdown item
  function renderDesktopDropdownItem(item: NavItem) {
  return (
    <div
      className="relative group"
      onMouseEnter={() => setActiveMenu(item.name)}
      onMouseLeave={() => setActiveMenu(null)}
    >
      <div className="flex items-center px-3 py-2 text-gray-300 hover:text-white transition-colors gap-2 group cursor-pointer">
        <item.icon className="h-4 w-4 opacity-80 group-hover:opacity-100 transition-opacity text-blue-400" />
        <span className="group-hover:text-blue-400 transition-colors">
          {item.name}
        </span>
      </div>

      <AnimatePresence>
        {activeMenu === item.name && item.items && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full right-0 mt-2 w-[240px] bg-gray-900/95 rounded-xl border border-gray-800 shadow-xl backdrop-blur-lg z-[9999]"
          >
            <div className="p-4 space-y-2">
              {item.items.map((subItem) => (
                <RouteWrapper
                  key={subItem.name}
                  href={subItem.href}
                  onClick={subItem.onClick || handleNavigation}
                >
                  <motion.div
                    whileHover={{ x: 4 }}
                    className="flex items-center px-3 py-3 rounded-lg text-gray-300 hover:bg-gray-800/50 hover:text-blue-400 transition-all gap-3"
                  >
                    <subItem.icon className="h-5 w-5 text-blue-400" />
                    <span className="font-medium">{subItem.name}</span>
                  </motion.div>
                </RouteWrapper>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-400/50 scale-x-0 group-hover:scale-x-100 transition-transform origin-right" />
    </div>
  );
}


  // Desktop single link item
  function renderDesktopLinkItem(item: NavItem) {
    return (
      <RouteWrapper href={item.href!} onClick={handleNavigation}>
        <div className="flex items-center px-3 py-2 text-gray-300 hover:text-white transition-colors gap-2 group">
          <item.icon className="h-4 w-4 opacity-80 group-hover:opacity-100 transition-opacity text-blue-400" />
          <span className="group-hover:text-blue-400 transition-colors">
            {item.name}
          </span>
        </div>
      </RouteWrapper>
    );
  }

  // Mobile dropdown item
  function renderMobileDropdownItem(item: NavItem) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => toggleExpand(item.name)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800/50 hover:text-blue-400 transition-all gap-2"
        >
          <div className="flex items-center gap-2">
            <item.icon className="h-4 w-4 text-blue-400" />
            <span>{item.name}</span>
          </div>
          <div className="text-gray-400">
            {expandedItem === item.name ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </div>
        </button>

        <AnimatePresence>
          {expandedItem === item.name && item.items && (
            <motion.div
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="overflow-hidden"
            >
              <div className="pl-4 space-y-1 border-r-2 border-blue-400/20 mx-2 py-1">
                {item.items.map((subItem) => (
                  <RouteWrapper
                    key={subItem.name}
                    href={subItem.href}
                    onClick={subItem.onClick || handleNavigation}
                  >
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="flex items-center px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800/50 hover:text-blue-400 transition-all gap-2"
                    >
                      <subItem.icon className="h-4 w-4 text-blue-400" />
                      <span>{subItem.name}</span>
                    </motion.div>
                  </RouteWrapper>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Mobile single link item
  function renderMobileLinkItem(item: NavItem) {
    return (
      <RouteWrapper href={item.href!} onClick={handleNavigation}>
        <motion.div
          whileHover={{ x: 4 }}
          className="flex items-center px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800/50 hover:text-blue-400 transition-all gap-2"
        >
          <item.icon className="h-4 w-4 text-blue-400" />
          <span>{item.name}</span>
        </motion.div>
      </RouteWrapper>
    );
  }

  // Render appropriate nav item based on type
  function renderNavItem(item: NavItem, isMobile: boolean) {
    if (isMobile) {
      return item.items
        ? renderMobileDropdownItem(item)
        : renderMobileLinkItem(item);
    } else {
      return item.items
        ? renderDesktopDropdownItem(item)
        : renderDesktopLinkItem(item);
    }
  }

  // ========== Main Component Return ==========
  return (
    <nav className="sticky w-full top-0 z-50" dir="rtl">
      <div className="bg-navbar-bg backdrop-blur-md border-b border-navbar-border">
        {/* Container for max width */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Main navbar layout */}
          <div className="flex justify-between h-16">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center order-1 md:order-2 z-50"
            >
              <span className="text-xl font-bold text-primary">SweetLab</span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center justify-between flex-1 order-2 md:order-1">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex gap-8"
              >
                {filteredNavItems.map((item) => (
                  <motion.div
                    key={item.name}
                    variants={itemVariants}
                    className="relative group"
                  >
                    {renderNavItem(item, false)}
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden order-3 md:order-3">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="rounded-lg p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 focus:outline-none transition-colors"
                aria-label="Toggle Menu"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="md:hidden fixed inset-0 backdrop-blur-sm z-40"
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Mobile Menu Content */}
              <div className="pt-16 pb-6 px-4 h-50 overflow-y-auto no-scrollbar z-40 bg-navbar-bg">
                <motion.div
                  className="space-y-2"
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredNavItems.map((item) => (
                    <motion.div
                      key={item.name}
                      variants={itemVariants}
                      className="border-b border-gray-800 pb-2 last:border-0"
                    >
                      {renderNavItem(item, true)}
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
