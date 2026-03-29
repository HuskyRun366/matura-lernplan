"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useUser } from "@/hooks/use-storage";
import { GraduationCap } from "lucide-react";

export default function LandingPage() {
  const { user, setUser, hydrated } = useUser();
  const [name, setName] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (hydrated && user) {
      router.replace("/dashboard");
    }
  }, [hydrated, user, router]);

  if (!hydrated) return null;
  if (user) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setUser({
      name: name.trim(),
      createdAt: new Date().toISOString(),
      theme: "dark",
    });
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">
            HTL-Matura Lernplan 2026
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Programmieren: 4. Mai 2026 &middot; Mathematik: 11. Mai 2026
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Dein Name</Label>
              <Input
                id="name"
                placeholder="z.B. Clemens"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full" disabled={!name.trim()}>
              Lernplan starten
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
