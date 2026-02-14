import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // GARANTIA: Sincroniza o usuário manualmente na tabela public.users
      const user = data.user
      if (user) {
        try {
          const { error: syncError } = await supabase.from('users').upsert(
            {
              id: user.id,
              name:
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                'Usuário',
              email: user.email,
              created_at: new Date().toISOString(),
            },
            { onConflict: 'id' },
          )

          if (syncError) {
            // Falha silenciosa na sincronização; sessão já foi criada
          }
        } catch {
          // Exceção na sincronização; sessão já foi criada
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
    }
  }

  return NextResponse.redirect(`${origin}/?error=auth_failed`)
}
