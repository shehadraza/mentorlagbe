
"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import Navbar from "@/components/shared/navbar";

function SiteNavbarContent() {
  const pathname = usePathname();

  if (pathname.startsWith("/dashboard")) {
    return null;
  }

  return <Navbar />;
}

export default function SiteNavbar() {
  return (
    <Suspense fallback={null}>
      <SiteNavbarContent />
    </Suspense>
  );
}
