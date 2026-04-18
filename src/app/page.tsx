"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useUser, usePlanConfig } from "@/hooks/use-storage";
import { DEFAULT_PROG_EXAM_DATE, DEFAULT_MATH_EXAM_DATE } from "@/lib/plan-data";
import { GraduationCap } from "lucide-react";

type Step = "name" | "plan";

export default function LandingPage() {
  const { user, setUser, hydrated: userH } = useUser();
  const { config, setConfig, hydrated: configH } = usePlanConfig();
  const router = useRouter();

  const [step, setStep] = useState<Step>("name");
  const [name, setName] = useState("");
  const [progDate, setProgDate] = useState(DEFAULT_PROG_EXAM_DATE);
  const [mathDate, setMathDate] = useState(DEFAULT_MATH_EXAM_DATE);
  const [budgetHours, setBudgetHours] = useState(4);

  useEffect(() => {
    if (!userH || !configH) return;
    if (user && config) {
      router.replace("/dashboard");
      return;
    }
    if (user && !config) {
      setName(user.name);
      setStep("plan");
    }
  }, [user, config, userH, configH, router]);

  if (!userH || !configH) return null;
  if (user && config) return null;

  function submitName(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    if (!user) {
      setUser({
        name: name.trim(),
        createdAt: new Date().toISOString(),
        theme: "dark",
      });
    }
    setStep("plan");
  }

  function submitPlan(e: React.FormEvent) {
    e.preventDefault();
    setConfig({
      progExamDate: progDate,
      mathExamDate: mathDate,
      studyStartDate: new Date().toISOString().split("T")[0],
      dailyTimeBudgetMinutes: budgetHours * 60,
      suggestionsEnabled: true,
      createdAt: new Date().toISOString(),
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
            {step === "name"
              ? "Willkommen! Lass uns mit deinem Namen starten."
              : "Lernplan einrichten"}
          </p>
        </CardHeader>
        <CardContent>
          {step === "name" ? (
            <form onSubmit={submitName} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Dein Name</Label>
                <Input
                  id="name"
                  placeholder="Dein Vorname"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={!name.trim()}>
                Weiter
              </Button>
            </form>
          ) : (
            <form onSubmit={submitPlan} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="prog-date">Prüfungstermin Programmieren</Label>
                <Input
                  id="prog-date"
                  type="date"
                  value={progDate}
                  onChange={(e) => setProgDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="math-date">Prüfungstermin Mathematik</Label>
                <Input
                  id="math-date"
                  type="date"
                  value={mathDate}
                  onChange={(e) => setMathDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="budget">Tägliches Lernbudget: {budgetHours} Stunden</Label>
                <input
                  id="budget"
                  type="range"
                  min={1}
                  max={6}
                  step={1}
                  value={budgetHours}
                  onChange={(e) => setBudgetHours(parseInt(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Nur als Orientierung — du entscheidest jeden Tag selbst, was du
                  lernst. Die App schlägt dir dazu passende Aufgaben vor.
                </p>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={!progDate || !mathDate}
              >
                Lernplan starten
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
