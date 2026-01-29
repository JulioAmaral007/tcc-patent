import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  console.log('🔐 [Auth Callback] Iniciando troca de código:', { code: !!code, next })

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      console.log('✅ [Auth Callback] Sessão obtida com sucesso para:', data.user?.email)
      
      // GARANTIA: Sincroniza o usuário manualmente na tabela public.users
      const user = data.user
      if (user) {
        try {
          const { error: syncError } = await supabase.from('users').upsert({
            id: user.id,
            name: user.user_metadata?.full_name || user.user_metadata?.name || 'Usuário',
            email: user.email,
            created_at: new Date().toISOString()
          }, { onConflict: 'id' })
          
          if (syncError) {
            console.error('⚠️ [Auth Callback] Erro ao sincronizar usuário:', syncError.message)
          } else {
            console.log('✨ [Auth Callback] Usuário sincronizado em public.users')
          }
        } catch (syncErr) {
          console.error('❌ [Auth Callback] Exceção na sincronização:', syncErr)
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host') 
      const isLocalEnv = process.env.NODE_ENV === 'development'
      
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    } else {
      console.error('❌ [Auth Callback] Erro na troca de código:', error.message)
    }
  }

  console.warn('⚠️ [Auth Callback] Falha na autenticação ou código ausente')
  return NextResponse.redirect(`${origin}/?error=auth_failed`)
}
