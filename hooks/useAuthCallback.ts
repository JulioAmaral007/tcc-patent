'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

/**
 * Processa tokens de autenticação vindos do hash da URL (ex.: OAuth implicit)
 * e parâmetro de erro. Deve ser usado em nível de layout para cobrir todas as páginas.
 */
export function useAuthCallback() {
  const searchParams = useSearchParams()

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam === 'auth_failed') {
      toast.error('Authentication failed', {
        description:
          'Could not complete sign in with Google. Check the server console.',
      })
    }

    const processAuthTokens = async () => {
      if (typeof window === 'undefined' || !window.location.hash) return

      const hashParams = new URLSearchParams(window.location.hash.substring(1))
      const accessToken = hashParams.get('access_token')
      const refreshToken = hashParams.get('refresh_token')

      if (!accessToken || !refreshToken) return

      try {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        })

        if (error) {
          toast.error('Error processing login')
        } else {
          toast.success('Login successful!')
        }
      } catch {
        toast.error('Error processing login')
      } finally {
        window.history.replaceState(
          null,
          '',
          window.location.pathname + window.location.search,
        )
      }
    }

    processAuthTokens()
  }, [searchParams])
}
