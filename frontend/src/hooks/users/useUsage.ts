import { useQuery } from "@tanstack/react-query";
import { getUsage } from "../../api/usersApi";
import { UsageMetrics } from "../../types/usage";

export const usageQueryKeys = {
  all: ["usage"] as const,
  me: () => [...usageQueryKeys.all, "me"] as const,
};

export const useUsage = () => {
  return useQuery<UsageMetrics, Error>({
    queryKey: usageQueryKeys.me(),
    queryFn: getUsage,
    retry: 2,
  });
};
