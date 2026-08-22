"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const DynamicMap = dynamic(() => import("./MapContent"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full min-h-[400px]" />
});

interface MapWrapperProps {
  zones?: any;
  shelters?: any;
  roads?: any;
  assignments?: any;
}

export default function MapWrapper(_props: MapWrapperProps) {
  return <DynamicMap />;
}
