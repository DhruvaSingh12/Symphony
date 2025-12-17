"use client";

import { HydrationBoundary, DehydratedState } from "@tanstack/react-query";
import { ReactNode } from "react";

interface HydrateClientProps {
  children: ReactNode;
  state?: DehydratedState;
}

export default function HydrateClient({ children, state }: HydrateClientProps) {
  return (
    <HydrationBoundary state={state}>
      {children}
    </HydrationBoundary>
  );
}
