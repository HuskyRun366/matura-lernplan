"use client";

import { use } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ChevronLeft, HelpCircle, BookOpen } from "lucide-react";
import { UEBUNGEN } from "@/lib/uebungen-data";
import { THEORIE_PAGES } from "@/lib/theorie-data";

export default function UebungPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const uebung = UEBUNGEN[slug];

  if (!uebung) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Übung nicht gefunden
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <Link
            href="/faecher/programmieren"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-3"
          >
            <ChevronLeft className="h-4 w-4" />
            Programmieren
          </Link>
          <div className="flex flex-wrap gap-2 mb-2">
            {uebung.topicIds.map((id) => (
              <Badge key={id} variant="secondary">
                {id}
              </Badge>
            ))}
          </div>
          <h1 className="text-2xl font-heading font-semibold">{uebung.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{uebung.subtitle}</p>
        </div>

        {/* Hilfe-Button */}
        <Sheet>
          <SheetTrigger>
            <Button variant="outline" className="flex-shrink-0">
              <HelpCircle className="h-4 w-4 mr-2" />
              Hilfe
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <SheetHeader>
              <SheetTitle>Konzepte & Hilfe</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-3 overflow-y-auto">
              {uebung.helpTopics.map((topic, i) => (
                <div
                  key={i}
                  className="p-3 border rounded-lg text-sm text-muted-foreground"
                >
                  {topic}
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Beschreibung */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Aufgabenbeschreibung</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {uebung.description}
          </p>
        </CardContent>
      </Card>

      {/* Teilaufgaben */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Teilaufgaben</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            {uebung.tasks.map((task, i) => (
              <li key={task.id} className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium">{task.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {task.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Verwandte Theorie-Seiten */}
      {uebung.relatedTheorie.length > 0 && (
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            Theorie-Seiten
          </h2>
          <div className="flex flex-wrap gap-2">
            {uebung.relatedTheorie.map((tSlug) => {
              const theorie = THEORIE_PAGES[tSlug];
              return theorie ? (
                <Link
                  key={tSlug}
                  href={`/faecher/programmieren/theorie/${tSlug}`}
                >
                  <Badge
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
                  >
                    {theorie.title}
                  </Badge>
                </Link>
              ) : null;
            })}
          </div>
        </div>
      )}
    </div>
  );
}
