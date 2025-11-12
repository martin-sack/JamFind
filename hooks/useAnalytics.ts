import { useQuery } from "@tanstack/react-query";

export const useOverview = () =>
  useQuery({
    queryKey: ["overview"],
    queryFn: async () => (await fetch("/api/admin/analytics/overview")).json()
  });

export const useTopTracks = () =>
  useQuery({
    queryKey: ["topTracks"],
    queryFn: async () => (await fetch("/api/admin/analytics/top")).json()
  });
