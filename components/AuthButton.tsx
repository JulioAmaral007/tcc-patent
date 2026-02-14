'use client'

import { useEffect, useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { signInWithGoogle, signOut } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import {
  LogIn,
  LogOut,
  User as UserIcon,
  Settings,
  ChevronDown,
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import type { User } from '@supabase/supabase-js'

export function AuthButton() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Busca a sessão inicial
    const initSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initSession()

    // Escuta mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
    })

    // Fechar menu ao clicar fora
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      subscription.unsubscribe()
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogin = async () => {
    try {
      await signInWithGoogle()
    } catch {
      toast.error('Error signing in with Google')
    }
  }

  const handleLogout = async () => {
    try {
      await signOut()
      setIsOpen(false)
      toast.success('Session ended')
    } catch {
      toast.error('Error signing out')
    }
  }

  if (loading) {
    return <div className="w-10 h-10 rounded-full bg-muted animate-pulse"></div>
  }

  if (user) {
    const avatarUrl = user.user_metadata?.avatar_url
    const fullName = user.user_metadata?.full_name || user.email

    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-1 rounded-full hover:bg-accent/50 transition-all border border-border/50 group"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/20 bg-secondary">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={fullName || 'User'}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
          </div>
          <ChevronDown
            className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card shadow-lg py-2 z-50 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
            <div className="px-4 py-2 border-b border-border mb-1">
              <p className="text-sm font-semibold truncate text-foreground">
                {fullName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user.email}
              </p>
            </div>

            <div className="px-2">
              <button
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md hover:bg-accent hover:text-accent-foreground transition-colors"
                onClick={() => {
                  toast.info('Settings coming soon')
                  setIsOpen(false)
                }}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-md text-destructive hover:bg-destructive/10 transition-colors mt-1"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign out</span>
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Button
      variant="default"
      size="sm"
      onClick={handleLogin}
      className="gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md transition-all hover:scale-105 active:scale-95 px-4 rounded-full"
    >
      <LogIn className="w-4 h-4" />
      <span className="hidden sm:inline">Sign in with Google</span>
      <span className="sm:hidden">Sign in</span>
    </Button>
  )
}
