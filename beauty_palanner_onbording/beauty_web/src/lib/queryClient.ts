import { QueryClient } from '@tanstack/react-query'

// A shared QueryClient instance.
let queryClient: QueryClient | null = null

export function getQueryClient() {
  if (!queryClient) {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: 1,
          staleTime: 30_000,
          refetchOnWindowFocus: false,
        },
      },
    })
  }
  return queryClient
}
