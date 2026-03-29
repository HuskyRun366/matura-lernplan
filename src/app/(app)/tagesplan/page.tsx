"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TagesplanRedirect() {
  const router = useRouter();
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    router.replace(`/tagesplan/${today}`);
  }, [router]);
  return null;
}
