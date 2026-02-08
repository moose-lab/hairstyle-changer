import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "../../../lib/auth-client";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { Loader2, Github } from "lucide-react";
import { INITIAL_CREDITS } from "@shared/const";

export default function Signup() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (user) {
    setLocation("/");
    return null;
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await authClient.signUp.email({ email, password, name });
      if (error) {
        toast.error("Sign up failed", { description: error.message });
        return;
      }
      toast.success("Account created!", {
        description: `You've been given ${INITIAL_CREDITS} free credits to get started.`,
      });
      window.location.href = "/";
    } catch (err) {
      toast.error("Sign up failed", {
        description: err instanceof Error ? err.message : "Please try again",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    authClient.signIn.social({ provider: "google", callbackURL: "/" });
  };

  const handleGithubSignIn = () => {
    authClient.signIn.social({ provider: "github", callbackURL: "/" });
  };

  return (
    <div className="min-h-screen animated-gradient flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-black gradient-text">Create Account</CardTitle>
          <p className="text-gray-500 mt-1">
            Get {INITIAL_CREDITS} free credits to try AI hairstyles
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSignUp} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full gradient-button" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Sign Up"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={handleGoogleSignIn} disabled={isLoading}>
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09A6.97 6.97 0 015.5 12c0-.73.13-1.43.35-2.09V7.07H2.18A11.97 11.97 0 001 12c0 1.94.46 3.78 1.28 5.41l3.56-2.84.01-.48z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </Button>
            <Button variant="outline" onClick={handleGithubSignIn} disabled={isLoading}>
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </Button>
          </div>

          <div className="text-center text-sm">
            Already have an account?{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-semibold text-purple-600"
              onClick={() => setLocation("/login")}
            >
              Sign in
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
