"use client"

import { supabase } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"

export default function GoogleButton() {
  const signIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        queryParams: {
          access_type: "offline", // so you can get refresh tokens
          prompt: "consent",
        },
      },
    })
    if (error) console.error("Google Auth Error:", error.message)
  }

  return (
    <Button onClick={signIn} className="w-full">
      Continue with Google
    </Button>
  )
}
