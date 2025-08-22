"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/utils/supabase/client";
import { useUserStore } from "@/stores/userStore";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

let debounceTimer: NodeJS.Timeout;

export default function CompleteProfilePage() {
  const router = useRouter();
  const {
    user,
    loading: userLoading,
    checkUsername,
    usernameAvailable,
  } = useUserStore();

  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
  });

  const [loading, setLoading] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(
    null
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (field === "username") {
      if (debounceTimer) clearTimeout(debounceTimer);

      if (value.trim().length > 2) {
        setCheckingUsername(true);
        debounceTimer = setTimeout(async () => {
          await checkUsername(value.trim());
          setCheckingUsername(false);
        }, 500);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (!user) throw new Error("User not found. Please log in again.");

      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          username: formData.username.trim(),
          full_name: formData.fullName.trim() || null,
        })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setMessage({ type: "success", text: "Profile updated successfully!" });
      router.push("/dashboard");
    } catch (err: unknown) {
      console.error("Error updating profile:", err);
      setMessage({
        type: "error",
        text:
          typeof err === "object" && err !== null && "message" in err
            ? String((err as { message?: string }).message)
            : "An unknown error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (userLoading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="flex justify-center mt-20">
      <Card className="bg-card/80 backdrop-blur-sm border border-border/50 w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Your Profile</CardTitle>
          <CardDescription>
            Just a few more details and you&apos;ll be ready to go.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a username"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                required
              />
              {formData.username.length > 2 && (
                <p
                  className={`text-sm ${
                    usernameAvailable === null
                      ? "text-muted-foreground"
                      : usernameAvailable
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {checkingUsername
                    ? "Checking availability..."
                    : usernameAvailable === null
                    ? "Enter at least 3 characters"
                    : usernameAvailable
                    ? "Username is available"
                    : "Username is already taken"}
                </p>
              )}
            </div>

            {/* Full name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name (optional)</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
              />
            </div>

            {/* Message */}
            {message && (
              <p
                className={`text-sm ${
                  message.type === "error" ? "text-red-500" : "text-green-500"
                }`}
              >
                {message.text}
              </p>
            )}

            {/* Save button */}
            <Button
              type="submit"
              className="w-full"
              disabled={
                loading ||
                checkingUsername ||
                !usernameAvailable ||
                formData.username.length < 3
              }
            >
              {loading ? "Saving..." : "Save Profile"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or go back
              </span>
            </div>
          </div>

          {/* Skip link */}
          <div className="text-center text-sm">
            <Link href="/dashboard" className="text-primary hover:underline">
              Skip for now
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
