"use client";

import { useState, useEffect } from "react";
import { authService } from "../api/auth.service";
import { useAuth } from "../hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return (
    <div className="w-full max-w-md h-[600px] border border-white/5 bg-white/5 rounded-2xl animate-pulse" />
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await authService.register({ email, password });
      if (res.status === 'ok' || res.data) {
        // Auto-login after successful registration
        const loginRes = await authService.login({ email, password });
        if (loginRes.status === 'ok') {
          login(loginRes.data.token, loginRes.data.user);
        } else {
          router.push('/login?registered=true');
        }
      } else {
        setError(res.message || "Registration failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl relative overflow-hidden">
      {/* Top glint effect */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      <CardHeader className="space-y-3 text-center pt-10 pb-6 relative z-10">
        <div className="w-16 h-16 bg-blue-600/20 rounded-2xl mx-auto flex items-center justify-center border border-blue-500/30 mb-2 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
          <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
          Create Account
        </h1>
        <CardDescription className="text-white/60 text-sm font-medium">
          Sign up to start automating your Facebook tasks
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-10 relative z-10 px-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 mb-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3 backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80 font-medium ml-1">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com" 
              required
              className="bg-black/20 border-white/10 text-white placeholder:text-white/30 h-11 px-4 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 transition-all"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/80 font-medium ml-1">Password</Label>
            <div className="relative group">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                required
                className="bg-black/20 border-white/10 text-white placeholder:text-white/30 h-11 px-4 pr-11 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-white/40 hover:text-white/80 transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white/80 font-medium ml-1">Confirm Password</Label>
            <div className="relative group">
              <Input 
                id="confirmPassword" 
                type={showPassword ? "text" : "password"} 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••" 
                required
                className="bg-black/20 border-white/10 text-white placeholder:text-white/30 h-11 px-4 pr-11 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 transition-all"
              />
            </div>
          </div>
          
          <Button 
            disabled={isLoading} 
            type="submit" 
            className="w-full h-12 mt-4 text-[15px] font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] transition-all duration-300"
          >
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Sign Up"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-white/60">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Sign in
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
