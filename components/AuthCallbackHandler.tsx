'use client'

import { Suspense } from 'react'
import { useAuthCallback } from '@/hooks/useAuthCallback'

function AuthCallbackHandlerInner() {
  useAuthCallback()
  return null
}

/**
 * Componente que processa callbacks de autenticação (hash da URL e ?error=).
 * Usado no layout para cobrir todas as rotas.
 */
export function AuthCallbackHandler() {
  return (
    <Suspense fallback={null}>
      <AuthCallbackHandlerInner />
    </Suspense>
  )
}
