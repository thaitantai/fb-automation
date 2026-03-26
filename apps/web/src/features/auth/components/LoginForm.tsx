"use client";

import { useState } from "react";
import { authService } from "../api/auth.service";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { Loader2, AlertCircle } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await authService.login({ email, password });
      if (res.status === 'ok') {
        login(res.data.token, res.data.user);
      } else {
        setError(res.message || "Invalid credentials. Please try again.");
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
      
      <CardHeader className="space-y-3 text-center pt-10 pb-8 relative z-10">
        <div className="w-16 h-16 bg-blue-600/20 rounded-2xl mx-auto flex items-center justify-center border border-blue-500/30 mb-2 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
          <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-white drop-shadow-md">
          Welcome Back
        </h1>
        <CardDescription className="text-white/60 text-sm font-medium">
          Sign in to your automation dashboard
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-10 relative z-10 px-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 mb-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3 backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="font-medium">{error}</p>
            </div>
          )}
          
          <div className="space-y-2.5">
            <Label htmlFor="email" className="text-white/80 font-medium ml-1">Email Address</Label>
            <Input 
              id="email" 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com" 
              required
              className="bg-black/20 border-white/10 text-white placeholder:text-white/30 h-12 px-4 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 transition-all"
            />
          </div>
          
          <div className="space-y-2.5">
            <div className="flex items-center justify-between ml-1">
              <Label htmlFor="password" className="text-white/80 font-medium">Password</Label>
            </div>
            <Input 
              id="password" 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              required
              className="bg-black/20 border-white/10 text-white placeholder:text-white/30 h-12 px-4 rounded-xl focus-visible:ring-2 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50 transition-all"
            />
          </div>
          
          <Button 
            disabled={isLoading} 
            type="submit" 
            className="w-full h-12 mt-4 text-[15px] font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] transition-all duration-300"
          >
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Sign In to Dashboard"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
