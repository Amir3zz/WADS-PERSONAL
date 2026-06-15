"use client";

import { Suspense } from "react";
import VerifyDeleteContent from "./verify-delete-content";

export default function VerifyDeletePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyDeleteContent />
    </Suspense>
  );
}