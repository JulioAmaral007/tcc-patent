import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const cookieStore = await cookies()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set({ name, value, ...options })
            })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.session) {
      console.log('✅ [CALLBACK]: Login realizado com sucesso!')
      
      // Cria uma URL com os tokens no fragmento para o cliente processar
      const redirectUrl = new URL(next, origin)
      redirectUrl.hash = `access_token=${data.session.access_token}&refresh_token=${data.session.refresh_token}&expires_in=${data.session.expires_in}&token_type=bearer`
      
      return NextResponse.redirect(redirectUrl.toString())
    }
    
    console.error('❌ [CALLBACK]: Erro na troca de código:', error)
  }

  return NextResponse.redirect(`${origin}?error=auth_failed`)
}
