import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  let next = searchParams.get("next") ?? "/dashboard";

  if (!next.startsWith("/")) next = "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        return NextResponse.redirect(`${origin}/auth/auth-code-error`);
      }

      // ✅ Check if profile exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle(); // cleaner than single()

      if (!profile) {
        // No profile → create one
        const { error: insertError } = await supabase
          .from("profiles")
          .insert([
            {
              id: user.id,
              email: user.email,
              username: null,
              theme: "default",
            },
          ]);

        if (insertError) {
          console.error("Error creating profile:", insertError.message);
          return NextResponse.redirect(`${origin}/auth/auth-code-error`);
        }

        return NextResponse.redirect(
          `${origin}/auth/complete-profile-redirect`
        );
      }

      if (!profile.username) {
        return NextResponse.redirect(
          `${origin}/auth/complete-profile-redirect`
        );
      }

      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
