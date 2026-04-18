"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Download, Upload, Trash2, User, Calendar, Sparkles } from "lucide-react";
import { useUser, usePlanConfig } from "@/hooks/use-storage";
import * as storage from "@/lib/storage";

export default function EinstellungenPage() {
  const { user, setUser } = useUser();
  const { config, setConfig } = usePlanConfig();
  const [name, setName] = useState(user?.name ?? "");
  const [progDate, setProgDate] = useState(config?.progExamDate ?? "");
  const [mathDate, setMathDate] = useState(config?.mathExamDate ?? "");
  const [budgetHours, setBudgetHours] = useState(
    config ? Math.round(config.dailyTimeBudgetMinutes / 60) : 4
  );
  const [suggestionsEnabled, setSuggestionsEnabled] = useState(
    config?.suggestionsEnabled ?? true
  );
  const [showReset, setShowReset] = useState(false);
  const [importError, setImportError] = useState("");

  function handleNameSave() {
    if (!user || !name.trim()) return;
    setUser({ ...user, name: name.trim() });
  }

  function handlePlanSave() {
    if (!config) return;
    setConfig({
      ...config,
      progExamDate: progDate,
      mathExamDate: mathDate,
      dailyTimeBudgetMinutes: budgetHours * 60,
      suggestionsEnabled,
    });
  }

  const planDirty =
    !!config &&
    (progDate !== config.progExamDate ||
      mathDate !== config.mathExamDate ||
      budgetHours * 60 !== config.dailyTimeBudgetMinutes ||
      suggestionsEnabled !== config.suggestionsEnabled);

  function handleExport() {
    const data = storage.exportAllData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `matura-lernplan-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const json = ev.target?.result as string;
        storage.importAllData(json);
        setImportError("");
        window.location.reload();
      } catch {
        setImportError("Ungültige Datei. Bitte eine gültige Backup-Datei auswählen.");
      }
    };
    reader.readAsText(file);
  }

  function handleReset() {
    storage.resetAllData();
    window.location.href = "/";
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Einstellungen</h1>
      </div>

      {/* Name */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="h-4 w-4" /> Profil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3 items-end">
            <div className="flex-1 space-y-2">
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <Button onClick={handleNameSave} disabled={!name.trim() || name === user?.name}>
              Speichern
            </Button>
          </div>
          {user && (
            <p className="text-xs text-muted-foreground">
              Registriert seit: {new Date(user.createdAt).toLocaleDateString("de-DE")}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Plan-Konfiguration */}
      {config && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" /> Plan-Konfiguration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="s-prog-date">Prüfungstermin Programmieren</Label>
                <Input
                  id="s-prog-date"
                  type="date"
                  value={progDate}
                  onChange={(e) => setProgDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="s-math-date">Prüfungstermin Mathematik</Label>
                <Input
                  id="s-math-date"
                  type="date"
                  value={mathDate}
                  onChange={(e) => setMathDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="s-budget">
                Tägliches Lernbudget: {budgetHours} Stunden
              </Label>
              <input
                id="s-budget"
                type="range"
                min={1}
                max={6}
                step={1}
                value={budgetHours}
                onChange={(e) => setBudgetHours(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={suggestionsEnabled}
                onChange={(e) => setSuggestionsEnabled(e.target.checked)}
              />
              <Sparkles className="h-4 w-4 text-muted-foreground" />
              <span>Vorschläge der App anzeigen</span>
            </label>
            <Button
              onClick={handlePlanSave}
              disabled={!planDirty || !progDate || !mathDate}
            >
              Plan-Einstellungen speichern
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Data Management */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Daten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="h-4 w-4" /> Daten exportieren
            </Button>
            <div>
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
                id="import-file"
              />
              <label htmlFor="import-file">
                <Button variant="outline" className="gap-2 cursor-pointer" type="button" onClick={() => document.getElementById("import-file")?.click()}>
                  <Upload className="h-4 w-4" /> Daten importieren
                </Button>
              </label>
            </div>
          </div>
          {importError && <p className="text-sm text-destructive">{importError}</p>}

          <Separator />

          <div>
            <Button variant="destructive" onClick={() => setShowReset(true)} className="gap-2">
              <Trash2 className="h-4 w-4" /> Alle Daten löschen
            </Button>
            <p className="text-xs text-muted-foreground mt-1">
              Löscht alle Fortschritte, Bewertungen und Einstellungen.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Reset Dialog */}
      <Dialog open={showReset} onOpenChange={setShowReset}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alle Daten löschen?</DialogTitle>
            <DialogDescription>
              Das löscht alle deine Fortschritte, Bewertungen, Simulationsergebnisse und Einstellungen unwiderruflich.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setShowReset(false)}>Abbrechen</Button>
            <Button variant="destructive" onClick={handleReset}>Endgültig löschen</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
