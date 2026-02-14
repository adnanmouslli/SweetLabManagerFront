"use client";
import { useRoles, Role } from "@/hooks/users/useRoles";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "@/components/common/PageSpinner";

export default function EmployeesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { hasAnyRole, } = useRoles();

  // Check if user has permission to access this page
  useEffect(() => {
    // SUPER_ADMIN can access everything, so we check it first
    if (!hasAnyRole([Role.SUPER_ADMIN, Role.ADMIN, Role.MANAGER, Role.TreasuryManager])) {
      router.replace("/");
    }
  }, [hasAnyRole, router]);


  return <>{children}</>;
}
