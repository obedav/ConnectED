'use client'

import { useQuery } from '@tanstack/react-query'
import type { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database.types'

const supabase = createClient()

export function useUser(): {
  user: User | null
  profile: Profile | null
  isLoading: boolean
} {
  const { data: user, isLoading: userLoading } = useQuery<User | null>({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      return user
    },
    staleTime: 1000 * 60 * 5,
  })

  const { data: profile, isLoading: profileLoading } =
    useQuery<Profile | null>({
      queryKey: ['profile', user?.id],
      queryFn: async () => {
        if (!user?.id) return null
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        return data
      },
      enabled: !!user?.id,
      staleTime: 1000 * 60 * 5,
    })

  return {
    user: user ?? null,
    profile: profile ?? null,
    isLoading: userLoading || (!!user?.id && profileLoading),
  }
}
