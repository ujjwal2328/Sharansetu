"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const DynamicMap = dynamic(() => import("./MapContent"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-full min-h-[400px]" />
});

interface MapWrapperProps {
  forcedLayers?: {
    population?: boolean;
    shelters?: boolean;
    routes?: boolean;
    blockedRoads?: boolean;
    riskZones?: boolean;
  };
}

export default function MapWrapper(props: MapWrapperProps) {
  return <DynamicMap forcedLayers={props.forcedLayers} />;
}
