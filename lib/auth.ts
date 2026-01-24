import { supabase } from './supabase'

/**
 * Inicia o processo de login com Google OAuth
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) {
    console.error('Error signing in with Google:', error.message)
    throw error
  }

  return data
}

/**
 * Signs out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error signing out:', error.message)
    throw error
  }
}

/**
 * Obtém o usuário logado de forma segura (lado do cliente)
 */
export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error) {
    // Silencioso para não poluir o log no carregamento inicial
    return null
  }
  return user
}
