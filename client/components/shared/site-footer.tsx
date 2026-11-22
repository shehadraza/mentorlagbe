
"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import Footer from "@/components/shared/footer";

function SiteFooterContent() {
  const pathname = usePathname();

  if (pathname === "/" || pathname.startsWith("/dashboard")) {
    return null;
  }

  return <Footer />;
}

export default function SiteFooter() {
  return (
    <Suspense fallback={null}>
      <SiteFooterContent />
    </Suspense>
  );
}
