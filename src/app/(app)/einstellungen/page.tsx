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
import { Download, Upload, Trash2, User } from "lucide-react";
import { useUser } from "@/hooks/use-storage";
import * as storage from "@/lib/storage";

export default function EinstellungenPage() {
  const { user, setUser } = useUser();
  const [name, setName] = useState(user?.name ?? "");
  const [showReset, setShowReset] = useState(false);
  const [importError, setImportError] = useState("");

  function handleNameSave() {
    if (!user || !name.trim()) return;
    setUser({ ...user, name: name.trim() });
  }

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
