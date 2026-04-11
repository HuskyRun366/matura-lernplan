export interface MathSection {
  heading: string;
  body: string;
  example?: string;
}

export interface MathTheorie {
  topicId: string;
  sections: MathSection[];
}

export const MATHE_THEORIE: Record<string, MathTheorie> = {
  A1: {
    topicId: "A1",
    sections: [
      {
        heading: "Grundmengen",
        body: "ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ ⊂ ℂ\n• ℕ = {0, 1, 2, 3, …} natürliche Zahlen\n• ℤ = {…, −2, −1, 0, 1, 2, …} ganze Zahlen\n• ℚ = {p/q | p,q ∈ ℤ, q≠0} rationale Zahlen\n• ℝ\\ℚ = irrationale Zahlen (√2, π, e, …)\n• ℝ alle reellen Zahlen\n\nIntervalle: [a;b] = geschlossen, (a;b) = offen, [a;b) = halbоffen",
        example: "Welche Mengen enthält −3/4?\nℚ ✓ (Bruch), ℝ ✓, aber ∉ ℤ, ∉ ℕ\n\nIn welcher Menge liegt √3?\n√3 ≈ 1,732… ist irrational → ∈ ℝ\\ℚ, ∈ ℝ, aber ∉ ℚ",
      },
      {
        heading: "Absolutbetrag und Runden",
        body: "|x| = x falls x ≥ 0, −x falls x < 0\n|a − b| = Abstand zwischen a und b auf der Zahlengeraden\n\n|x| < r  ↔  −r < x < r\n|x| > r  ↔  x < −r  oder  x > r\n\nRunden: kaufmännisch (≥5 aufrunden), Angabe der Stelle",
        example: "Löse |2x − 3| < 5:\n−5 < 2x − 3 < 5\n−2 < 2x < 8\n−1 < x < 4  →  x ∈ (−1; 4)\n\nLöse |x + 1| ≥ 2:\nx + 1 ≤ −2  oder  x + 1 ≥ 2\nx ≤ −3  oder  x ≥ 1",
      },
      {
        heading: "Prozent- und Zinsrechnung",
        body: "Grundwert G, Prozentwert P, Prozentsatz p%:\n  P = G · p/100\n  G = P · 100/p\n  p = P/G · 100\n\nZinsrechnung:\n  K_n = K_0 · (1 + p/100)^n  (Zinseszins)\n  Halbwertszeit: n = log(0,5) / log(1 + p/100)",
        example: "Kapital K₀ = 2000 €, Zinssatz 3% p.a., nach 5 Jahren:\nK₅ = 2000 · 1,03⁵ = 2000 · 1,1593 = 2318,55 €\n\nEin Artikel kostet nach 20% Rabatt 240 €. Originalpreis?\nG = 240 / 0,80 = 300 €",
      },
    ],
  },

  A2: {
    topicId: "A2",
    sections: [
      {
        heading: "Potenz- und Logarithmusregeln",
        body: "Potenzregeln:\n  aᵐ · aⁿ = aᵐ⁺ⁿ\n  aᵐ / aⁿ = aᵐ⁻ⁿ\n  (aᵐ)ⁿ = aᵐⁿ\n  a⁰ = 1, a⁻ⁿ = 1/aⁿ\n  a^(1/n) = ⁿ√a\n\nLogarithmusregeln:\n  log(a·b) = log a + log b\n  log(a/b) = log a − log b\n  log(aⁿ) = n · log a\n  Basiswechsel: log_b(x) = ln(x)/ln(b)",
        example: "Vereinfache: 2³ · 2⁵ / 2⁴ = 2^(3+5−4) = 2⁴ = 16\n\nLöse: 3^x = 50\nx = log(50)/log(3) = ln(50)/ln(3) ≈ 1,699/1,099 ≈ 3,56\n\nVereinfache: log₂(32) = log₂(2⁵) = 5",
      },
      {
        heading: "Binomische Formeln und Faktorisieren",
        body: "(a + b)² = a² + 2ab + b²\n(a − b)² = a² − 2ab + b²\n(a + b)(a − b) = a² − b²\n\nFaktorisieren:\n  ax + ay = a(x + y)\n  ax² + bx = x(ax + b)\n  a² − b² = (a+b)(a−b)",
        example: "Berechne 99² = (100 − 1)² = 10000 − 200 + 1 = 9801\n\nFaktorisiere: x² − 9 = (x+3)(x−3)\n\nFaktorisiere: 2x² − 8x = 2x(x − 4)",
      },
      {
        heading: "Algebraische Brüche",
        body: "Kürzen: Zähler und Nenner durch gemeinsamen Faktor teilen\nAddition: auf gemeinsamen Nenner bringen\nMultiplikation: Zähler·Zähler / Nenner·Nenner\nDivision: mit Kehrwert multiplizieren",
        example: "Vereinfache: (x² − 4)/(x − 2) = (x+2)(x−2)/(x−2) = x + 2\n\nBerechne: 1/x + 2/(x+1) = (x+1 + 2x) / (x(x+1)) = (3x+1)/(x(x+1))",
      },
    ],
  },

  A3: {
    topicId: "A3",
    sections: [
      {
        heading: "Lineare und quadratische Gleichungen",
        body: "Linear: ax + b = 0  →  x = −b/a\n\nQuadratisch: ax² + bx + c = 0\n  Diskriminante: D = b² − 4ac\n  x₁₂ = (−b ± √D) / 2a\n  D > 0: zwei Lösungen\n  D = 0: eine Lösung (Doppelwurzel)\n  D < 0: keine reelle Lösung\n\nVieta: x₁ + x₂ = −b/a,  x₁ · x₂ = c/a",
        example: "Löse: 2x² − 5x + 2 = 0\nD = 25 − 16 = 9\nx₁₂ = (5 ± 3) / 4\nx₁ = 2,  x₂ = 1/2\n\nProbe Vieta: x₁+x₂ = 2,5 = 5/2 ✓  x₁·x₂ = 1 = 2/2 ✓",
      },
      {
        heading: "Bruch- und Wurzelgleichungen",
        body: "Bruchgleichung: Mit Nenner multiplizieren, Probe wegen Definitionslücken!\nWurzelgleichung: Quadrieren — unbedingt Probe machen (Scheinlösungen möglich!)",
        example: "Löse: 2/(x−1) = 3/(x+2)\nKreuzweise: 2(x+2) = 3(x−1)\n2x + 4 = 3x − 3  →  x = 7\nProbe: 2/6 = 1/3 = 3/9 = 1/3 ✓\n\nLöse: √(2x+1) = x − 1\n2x+1 = (x−1)² = x²−2x+1\nx² − 4x = 0  →  x(x−4) = 0\nx=0: √1 = −1? FALSCH (Scheinlösung!)\nx=4: √9 = 3 = 4−1 ✓",
      },
      {
        heading: "Lineare Ungleichungen",
        body: "Wie lineare Gleichung — aber bei Multiplikation/Division mit negativer Zahl dreht sich das Zeichen um!\n\nFallunterscheidung bei Betragsungleichungen:\n  |f(x)| < c  ↔  −c < f(x) < c\n  |f(x)| > c  ↔  f(x) < −c  oder  f(x) > c",
        example: "Löse: −3x + 2 > 11\n−3x > 9  →  x < −3  (Zeichen dreht!)\n\nLöse: |3x − 1| ≤ 5\n−5 ≤ 3x − 1 ≤ 5\n−4 ≤ 3x ≤ 6\n−4/3 ≤ x ≤ 2",
      },
    ],
  },

  A4: {
    topicId: "A4",
    sections: [
      {
        heading: "Winkel und Bogenmaß",
        body: "Umrechnung: rad = Grad · π/180,  Grad = rad · 180/π\n\nBogenmaß wichtiger Winkel:\n  30° = π/6,  45° = π/4,  60° = π/3,  90° = π/2\n  120° = 2π/3,  180° = π,  270° = 3π/2,  360° = 2π",
        example: "45° in Bogenmaß: 45 · π/180 = π/4 ≈ 0,785\n2,5 rad in Grad: 2,5 · 180/π ≈ 143,2°",
      },
      {
        heading: "sin, cos, tan im rechtwinkligen Dreieck",
        body: "Gegenkathete = GK (gegenüber α)\nAnkathete = AK (neben α)\nHypotenuse = H (gegenüber 90°)\n\nsin α = GK/H\ncos α = AK/H\ntan α = GK/AK = sin α/cos α\n\nPythagoras: a² + b² = c²\nsin²α + cos²α = 1",
        example: "Dreieck: α = 35°, Hypotenuse c = 10 cm. Finde a und b:\na = c · sin 35° = 10 · 0,574 = 5,74 cm\nb = c · cos 35° = 10 · 0,819 = 8,19 cm\n\nGegeben: a = 4, b = 3. Finde α:\ntan α = 4/3  →  α = arctan(4/3) ≈ 53,1°",
      },
      {
        heading: "Einheitskreis und Periodizität",
        body: "Einheitskreis: Punkt (cos φ, sin φ)\n\nVorzeichen je Quadrant:\n  I (0°–90°): sin+, cos+, tan+\n  II (90°–180°): sin+, cos−, tan−\n  III (180°–270°): sin−, cos−, tan+\n  IV (270°–360°): sin−, cos+, tan−\n\nPeriode: sin und cos: 2π, tan: π\nSymmetrien: sin(−x) = −sin x, cos(−x) = cos x",
        example: "sin 120° = sin(180° − 60°) = sin 60° = √3/2 ≈ 0,866\ncos 150° = −cos 30° = −√3/2\ntan 135° = −tan 45° = −1\n\nWichtige exakte Werte:\n  sin 30° = 1/2,  cos 30° = √3/2\n  sin 45° = cos 45° = √2/2\n  sin 60° = √3/2,  cos 60° = 1/2",
      },
    ],
  },

  A5: {
    topicId: "A5",
    sections: [
      {
        heading: "Grundbegriffe: Definitionsbereich, Wertemenge, Graph",
        body: "f: D → W,  x ↦ f(x)\n• Definitionsbereich D = alle erlaubten x-Werte\n• Wertemenge W = alle möglichen y-Werte (f(D))\n• Injektiv: verschiedene x → verschiedene y\n• Surjektiv: jedes y ∈ W wird angenommen\n• Bijektiv: injektiv + surjektiv → Umkehrfunktion existiert\n\nUmkehrfunktion f⁻¹: x und y tauschen, nach y auflösen",
        example: "f(x) = 2x + 3:\nD = ℝ, W = ℝ, bijektiv\nUmkehrfunktion: y = 2x+3 → x = (y−3)/2\nf⁻¹(x) = (x−3)/2\n\nf(x) = x²: D = ℝ, W = [0;∞)\nNicht injektiv: f(2) = f(−2) = 4",
      },
      {
        heading: "Lineare und quadratische Funktionen",
        body: "Linear: f(x) = kx + d\n  k = Steigung = (y₂−y₁)/(x₂−x₁)\n  d = y-Achsenabschnitt\n  Nullstelle: x = −d/k\n\nQuadratisch: f(x) = ax² + bx + c  (Parabel)\n  Scheitelpunkt: S = (−b/2a, f(−b/2a))\n  Scheitelform: f(x) = a(x − xₛ)² + yₛ",
        example: "Durch (1; 3) und (4; 9):\nk = (9−3)/(4−1) = 2, d = 3−2·1 = 1\nf(x) = 2x + 1\n\nf(x) = x² − 4x + 3:\nScheitel: xₛ = 4/2 = 2, yₛ = 4−8+3 = −1\nS = (2; −1), Parabel nach oben\nScheitelform: f(x) = (x−2)² − 1",
      },
      {
        heading: "Transformationen und Spezielle Funktionen",
        body: "Transformationen von f(x):\n  f(x) + c: Verschiebung um c nach oben\n  f(x − d): Verschiebung um d nach rechts\n  a·f(x): Streckung in y-Richtung\n  f(b·x): Stauchung in x-Richtung\n  −f(x): Spiegelung an x-Achse\n\nPotenzfunktionen: xⁿ — Kurvenform je nach n\nExponential: eˣ, aˣ  (a > 0, a ≠ 1)\nLogarithmus: ln x = log_e(x), log x = log₁₀(x)",
        example: "f(x) = 2·sin(3x − π) + 1:\n• Amplitude: 2 (doppelt so groß)\n• Periode: 2π/3 (dreimal so schnell)\n• Verschiebung nach rechts: π/3\n• Verschiebung nach oben: +1\n\nf(x) = eˣ → g(x) = e^(−x): Spiegelung an y-Achse",
      },
    ],
  },

  A6: {
    topicId: "A6",
    sections: [
      {
        heading: "Ableitungsregeln",
        body: "Konstante: c' = 0\nPotenz: (xⁿ)' = n·xⁿ⁻¹\nSumme: (f+g)' = f' + g'\nProdukt: (f·g)' = f'·g + f·g'\nQuotient: (f/g)' = (f'·g − f·g') / g²\nKette: (f(g(x)))' = f'(g(x)) · g'(x)\n\nWichtige Ableitungen:\n  (sin x)' = cos x\n  (cos x)' = −sin x\n  (eˣ)' = eˣ\n  (ln x)' = 1/x\n  (aˣ)' = aˣ · ln a",
        example: "f(x) = x³ − 5x + 2\nf'(x) = 3x² − 5\n\nf(x) = sin(2x² + 1)  [Kettenregel]\nf'(x) = cos(2x² + 1) · 4x\n\nf(x) = x·eˣ  [Produktregel]\nf'(x) = 1·eˣ + x·eˣ = eˣ(1 + x)",
      },
      {
        heading: "Kurvendiskussion",
        body: "1. Definitionsbereich D\n2. Symmetrie: f(−x)=f(x)? (gerade), f(−x)=−f(x)? (ungerade)\n3. Nullstellen: f(x) = 0 lösen\n4. Extrempunkte: f'(x) = 0, f''(x) ≠ 0\n   f''(xₑ) > 0: Minimum, f''(xₑ) < 0: Maximum\n5. Wendepunkte: f''(x) = 0, f'''(x) ≠ 0\n6. Verhalten für x → ±∞\n7. Graph",
        example: "f(x) = x³ − 3x\nf'(x) = 3x² − 3 = 0  →  x = ±1\nf''(x) = 6x\nf''(−1) = −6 < 0: Maximum bei (−1; 2)\nf''(1) = 6 > 0: Minimum bei (1; −2)\nWendepunkt: f''(x) = 0 → x = 0: W(0; 0)",
      },
    ],
  },

  A7: {
    topicId: "A7",
    sections: [
      {
        heading: "Grundbegriffe der Wahrscheinlichkeit",
        body: "Wahrscheinlichkeit P(A) ∈ [0; 1]\nKomplementregel: P(Ā) = 1 − P(A)\nAdditionsregel: P(A∪B) = P(A) + P(B) − P(A∩B)\nBei disjunkten Ereignissen: P(A∪B) = P(A) + P(B)\nMultiplikationsregel: P(A∩B) = P(A) · P(B|A)\nUnabhängige Ereignisse: P(A∩B) = P(A) · P(B)",
        example: "Würfel: P(gerade Zahl) = 3/6 = 1/2\nP(nicht 6) = 1 − 1/6 = 5/6\n\nUrne: 3 rote, 2 blaue Kugeln (ohne Zurücklegen)\nP(beide rot) = 3/5 · 2/4 = 6/20 = 3/10\n\nP(A) = 0,4, P(B) = 0,3, unabhängig:\nP(A und B) = 0,4 · 0,3 = 0,12\nP(A oder B) = 0,4 + 0,3 − 0,12 = 0,58",
      },
      {
        heading: "Erwartungswert und Varianz",
        body: "Für eine diskrete Zufallsgröße X mit P(X=xᵢ) = pᵢ:\n  Erwartungswert: μ = E(X) = Σ xᵢ · pᵢ\n  Varianz: σ² = Var(X) = Σ (xᵢ−μ)² · pᵢ\n  Standardabweichung: σ = √Var(X)\n\nBinomialverteilung X ~ B(n, p):\n  P(X=k) = C(n,k) · pᵏ · (1−p)^(n−k)\n  μ = n·p,  σ² = n·p·(1−p)",
        example: "Münzwurf 4x: X = Anzahl Köpfe, X ~ B(4; 0,5)\nP(X=2) = C(4,2) · 0,5² · 0,5² = 6 · 0,0625 = 0,375\nμ = 4 · 0,5 = 2\nσ² = 4 · 0,5 · 0,5 = 1, σ = 1\n\nC(n,k) = n! / (k! · (n−k)!)\nC(4,2) = 24/(2·2) = 6",
      },
    ],
  },

  B1: {
    topicId: "B1",
    sections: [
      {
        heading: "Sinussatz und Kosinussatz",
        body: "Für Dreieck mit Seiten a, b, c und Winkeln α, β, γ gegenüber:\n\nSinussatz:\n  a/sin α = b/sin β = c/sin γ = 2R\nAnwendung: wenn 2 Seiten + Gegenwinkel oder 2 Winkel + 1 Seite bekannt\n\nKosinussatz:\n  a² = b² + c² − 2bc · cos α\n  cos α = (b² + c² − a²) / (2bc)\nAnwendung: wenn alle 3 Seiten oder 2 Seiten + eingeschlossener Winkel bekannt",
        example: "Gegeben: a=7, b=5, γ=80°. Finde c.\nc² = a² + b² − 2ab·cos γ = 49+25 − 70·cos80°\n= 74 − 70·0,1736 = 74 − 12,15 ≈ 61,85\nc ≈ 7,86\n\nGegeben: a=8, α=50°, β=70°. Finde b.\nb = a·sin β/sin α = 8·sin70°/sin50° = 8·0,940/0,766 ≈ 9,81",
      },
      {
        heading: "Flächeninhalt und Additionstheoreme",
        body: "Flächeninhalt Dreieck:\n  A = (1/2)·a·b·sin γ (2 Seiten + eingeschl. Winkel)\n\nAdditionstheoreme:\n  sin(α±β) = sin α·cos β ± cos α·sin β\n  cos(α±β) = cos α·cos β ∓ sin α·sin β\n  sin 2α = 2·sin α·cos α\n  cos 2α = cos²α − sin²α = 1 − 2sin²α",
        example: "Dreieck: a=6, b=8, γ=40°\nA = (1/2)·6·8·sin40° = 24·0,643 ≈ 15,43\n\nBerechne sin 75° = sin(45°+30°)\n= sin45°·cos30° + cos45°·sin30°\n= (√2/2)(√3/2) + (√2/2)(1/2)\n= √6/4 + √2/4 = (√6+√2)/4 ≈ 0,966",
      },
    ],
  },

  B2: {
    topicId: "B2",
    sections: [
      {
        heading: "Kartesische Form und Gaußsche Zahlenebene",
        body: "Komplexe Zahl: z = a + bi  (a = Realteil, b = Imaginärteil, i² = −1)\nGaußsche Zahlenebene: Realteil auf x-Achse, Imaginärteil auf y-Achse\n\nBetrag: |z| = √(a² + b²)\nArgument: φ = arg(z) = arctan(b/a)  (Quadrant beachten!)\n\nKonjugiert: z̄ = a − bi\n  z · z̄ = a² + b² = |z|²",
        example: "z = 3 + 4i:\n|z| = √(9+16) = 5\nφ = arctan(4/3) ≈ 53,1°\n\nDivision: (3+4i)/(1+2i)\n= (3+4i)(1−2i) / ((1+2i)(1−2i))\n= (3−6i+4i−8i²) / (1+4)\n= (3−2i+8) / 5 = (11−2i)/5 = 2,2 − 0,4i",
      },
      {
        heading: "Polarform und Rechenoperationen",
        body: "Polarform: z = r · (cos φ + i·sin φ) = r · e^(iφ)\n  r = |z|, φ = Argument\n\nMultiplikation in Polarform:\n  z₁·z₂ = r₁·r₂ · e^(i(φ₁+φ₂))  (Beträge mul., Argumente add.)\n\nDivision: z₁/z₂ = (r₁/r₂) · e^(i(φ₁−φ₂))\n\nPotenzen (de Moivre): zⁿ = rⁿ · e^(inφ)\n\nWurzeln: n-te Wurzel hat n Lösungen:\n  z_k = ⁿ√r · e^(i(φ+2kπ)/n),  k=0,1,…,n−1",
        example: "z = 1 + i: r = √2, φ = 45° = π/4\nPolarform: z = √2 · e^(iπ/4)\n\nz⁴ = (√2)⁴ · e^(i·4·π/4) = 4 · e^(iπ) = 4·(−1) = −4\n\nKubische Wurzeln von 1 (1 = e^(i·0)):\nz_k = e^(i·2kπ/3),  k = 0,1,2\nz₀ = 1, z₁ = e^(i2π/3) = −1/2 + i√3/2, z₂ = e^(i4π/3) = −1/2 − i√3/2",
      },
    ],
  },

  B3: {
    topicId: "B3",
    sections: [
      {
        heading: "Vektoren — Grundoperationen",
        body: "Vektor v = (v₁; v₂; v₃), Betrag |v| = √(v₁²+v₂²+v₃²)\n\nAddition: u + v = (u₁+v₁; u₂+v₂; u₃+v₃)\nSkalarmultiplikation: λ·v = (λv₁; λv₂; λv₃)\n\nSkalarprodukt: u·v = u₁v₁ + u₂v₂ + u₃v₃\n  u·v = |u|·|v|·cos φ\n  Senkrecht: u·v = 0\n\nKreuzprodukt (R³):\n  u×v = (u₂v₃−u₃v₂; u₃v₁−u₁v₃; u₁v₂−u₂v₁)\n  u×v ⊥ u, u×v ⊥ v, |u×v| = |u|·|v|·sin φ",
        example: "u=(1;2;3), v=(4;−1;2)\n\nu·v = 4−2+6 = 8\n|u| = √14, |v| = √21\ncos φ = 8/(√14·√21) = 8/√294 ≈ 0,467 → φ ≈ 62,2°\n\nu×v = (2·2−3·(−1); 3·4−1·2; 1·(−1)−2·4)\n     = (4+3; 12−2; −1−8) = (7; 10; −9)",
      },
      {
        heading: "Geraden und Ebenen",
        body: "Geradengleichung (Parameterform):\n  g: X = P + t·v  (P=Punkt, v=Richtungsvektor)\n\nEbenengleichung:\n  Parameterform: E: X = P + s·u + t·v\n  Normalenform: n·(X−P) = 0  (n = Normalenvektor)\n  Koordinatenform: ax + by + cz = d\n\nNormalenvektor der Ebene: n = u × v\n\nAbstand Punkt Q von Ebene n·X = d:\n  Abstand = |n·Q − d| / |n|",
        example: "Ebene durch P(1;0;2), u=(1;1;0), v=(0;2;1):\nn = u×v = (1·1−0·2; 0·0−1·1; 1·2−1·0) = (1;−1;2)\nKoordinatenform: 1(x−1) − 1(y−0) + 2(z−2) = 0\nx − y + 2z = 5\n\nAbstand Q(2;1;1): |2−1+2−5|/√6 = |−2|/√6 ≈ 0,816",
      },
    ],
  },

  B4: {
    topicId: "B4",
    sections: [
      {
        heading: "Matrizen — Operationen",
        body: "Matrix A: m×n (m Zeilen, n Spalten)\nAddition: nur bei gleicher Dimension, elementweise\nMultiplikation: A(m×p) · B(p×n) = C(m×n)\n  cᵢⱼ = Σₖ aᵢₖ · bₖⱼ (Zeile i von A mal Spalte j von B)\n  NICHT kommutativ: AB ≠ BA allgemein\n\nDeterminante (2×2): det(A) = ad − bc\nDeterminante (3×3): Sarrus-Regel",
        example: "A = ((1,2),(3,4)),  B = ((5,6),(7,8))\n\nA·B = ((1·5+2·7, 1·6+2·8),(3·5+4·7, 3·6+4·8))\n    = ((19,22),(43,50))\n\ndet(A) = 1·4 − 2·3 = 4 − 6 = −2\n\nInverse von A (2×2): A⁻¹ = (1/det)·((d,−b),(−c,a))\nA⁻¹ = (1/−2)·((4,−2),(−3,1)) = ((-2,1),(3/2,−1/2))",
      },
      {
        heading: "Lineare Gleichungssysteme — Gauß-Elimination",
        body: "LGS A·x = b mit Gauß-Elimination auf Zeilenstufenform bringen:\n1. Erweiterte Matrix [A|b] aufschreiben\n2. Durch Zeilenoperationen obere Dreiecksform herstellen\n   (Zeile addieren/subtrahieren, Vielfaches addieren)\n3. Rückwärtseinsetzen\n\nFälle:\n  eindeutige Lösung: Rang(A) = Rang(A|b) = n\n  keine Lösung: Rang(A) < Rang(A|b)\n  ∞ Lösungen: Rang(A) = Rang(A|b) < n",
        example: "x + 2y = 5\n3x − y = 1\n\n[1  2 | 5]  →  [1  2 | 5]\n[3 −1 | 1]     [0 −7 | −14]  (Z2 − 3·Z1)\n\ny = 2, x = 5 − 4 = 1  →  Lösung: (1; 2)\n\nKramer-Regel (2×2): x = (d₁a₂₂−d₂a₁₂)/det, y = (a₁₁d₂−a₂₁d₁)/det",
      },
    ],
  },

  B5: {
    topicId: "B5",
    sections: [
      {
        heading: "Ableitungsregeln (erweitert)",
        body: "Alle Grundregeln wie bei A6, zusätzlich:\n\n(tan x)' = 1/cos²x = 1 + tan²x\n(arcsin x)' = 1/√(1−x²)\n(arctan x)' = 1/(1+x²)\n(xⁿ)' = n·xⁿ⁻¹  auch für negative und gebrochene n\n\nImplizite Differentiation: y als Funktion von x betrachten,\nbei y immer mit dy/dx multiplizieren.\n\nLogarithmische Ableitung: bei Produkten und komplizierten Potenzen\n  [ln f(x)]' = f'(x)/f(x)",
        example: "f(x) = (x²+1)^(3/2)  [Kettenregel]\nf'(x) = (3/2)(x²+1)^(1/2) · 2x = 3x√(x²+1)\n\nImplizit: x² + y² = r² → 2x + 2y·y' = 0\ny' = −x/y\n\nf(x) = xˣ: ln f = x·ln x\nf'/f = ln x + 1  →  f' = xˣ(ln x + 1)",
      },
      {
        heading: "Anwendungen: Extremwerte und Optimierung",
        body: "Lokales Extremum: f'(x₀) = 0 (notwendige Bedingung)\nHinreichend: Vorzeichenwechsel von f', oder f''(x₀) ≠ 0\n\nOptimierungsaufgaben:\n1. Zielfunktion aufstellen (was soll maximiert/minimiert werden?)\n2. Nebenbedingung einsetzen um nur eine Variable zu haben\n3. Ableiten und = 0 setzen\n4. Überprüfen ob Maximum oder Minimum\n5. Randwerte nicht vergessen!",
        example: "Rechteck mit Umfang 40 cm. Maximale Fläche?\nUmfang: 2x + 2y = 40  →  y = 20 − x\nFläche: A(x) = x·y = x(20−x) = 20x − x²\nA'(x) = 20 − 2x = 0  →  x = 10\nA''(x) = −2 < 0: Maximum!\nQuadrat: x = y = 10, A_max = 100 cm²\n\nVon einer Linie: A(x) = 20x−x², D = (0;20), kein Randmax.",
      },
    ],
  },

  B6: {
    topicId: "B6",
    sections: [
      {
        heading: "Stammfunktionen und Integrationsregeln",
        body: "Grundintegrale:\n  ∫xⁿ dx = xⁿ⁺¹/(n+1) + C  (n ≠ −1)\n  ∫1/x dx = ln|x| + C\n  ∫eˣ dx = eˣ + C\n  ∫sin x dx = −cos x + C\n  ∫cos x dx = sin x + C\n\nLinearität: ∫(af+bg) dx = a∫f dx + b∫g dx\nPartielle Integration: ∫u·v' dx = u·v − ∫u'·v dx\nSubstitution: ∫f(g(x))·g'(x) dx = F(g(x)) + C",
        example: "∫(3x² − 2x + 5) dx = x³ − x² + 5x + C\n\nPartielle Integration: ∫x·eˣ dx\nu=x, v'=eˣ  →  u'=1, v=eˣ\n= x·eˣ − ∫eˣ dx = xeˣ − eˣ + C = eˣ(x−1) + C\n\nSubstitution: ∫2x·sin(x²) dx\nt = x², dt = 2x dx\n= ∫sin t dt = −cos t + C = −cos(x²) + C",
      },
      {
        heading: "Bestimmtes Integral und Flächen",
        body: "Hauptsatz: ∫ₐᵇ f(x) dx = F(b) − F(a)\n\nFläche zwischen f und x-Achse:\n  A = ∫ₐᵇ |f(x)| dx  (Vorzeichenwechsel beachten!)\n\nFläche zwischen f und g:\n  A = ∫ₐᵇ |f(x)−g(x)| dx\n\nRotationsvolumen um x-Achse:\n  V = π · ∫ₐᵇ [f(x)]² dx\n\nMittelwert von f auf [a;b]:\n  f̄ = (1/(b−a)) · ∫ₐᵇ f(x) dx",
        example: "∫₀² (x²−x) dx = [x³/3 − x²/2]₀² = (8/3−2) − 0 = 2/3\n\nFläche f(x)=x²−x auf [0;2]:\nNullstelle bei x=1: Vorzeichen wechselt!\nA = |∫₀¹(x²−x)dx| + |∫₁²(x²−x)dx|\n= |−1/6| + |7/6| = 1/6 + 7/6 = 8/6 = 4/3\n\nRotationsvolumen sin(x) auf [0;π]:\nV = π·∫₀^π sin²x dx = π·[x/2 − sin2x/4]₀^π = π²/2",
      },
    ],
  },

  B7: {
    topicId: "B7",
    sections: [
      {
        heading: "Trennung der Variablen",
        body: "DGL-Form: y' = f(x)·g(y)\nMethode: Variablen trennen und integrieren\n  dy/g(y) = f(x) dx\n  ∫ dy/g(y) = ∫ f(x) dx\n\nAnfangswertproblem (AWP): Mit Anfangsbedingung y(x₀)=y₀\ndie Integrationskonstante C bestimmen.",
        example: "y' = 2xy,  y(0) = 3:\ndy/y = 2x dx\n∫dy/y = ∫2x dx\nln|y| = x² + C\ny = e^(x²+C) = K·e^(x²)\nAWP: 3 = K·e⁰ = K  →  y = 3e^(x²)\n\ny' = −y + 2,  y(0) = 0:\n(trennbar) dy/(y−2) = −dx\nln|y−2| = −x + C\ny−2 = Ke^(−x)\nAWP: −2 = K  →  y = 2 − 2e^(−x)",
      },
      {
        heading: "Lineare DGL 1. Ordnung",
        body: "Form: y' + p(x)·y = q(x)\n\nLösung mit Variation der Konstanten:\n1. Homogene Lösung: y' + py = 0 → y_h = C·e^(−∫p dx)\n2. Partikuläre Lösung: C(x) als Funktion annehmen\n   C'(x) = q(x) · e^(∫p dx)\n   C(x) = ∫q(x)·e^(∫p dx) dx\n3. Allg. Lösung: y = e^(−∫p dx) · (∫q·e^(∫p dx) dx + C)",
        example: "y' − y = eˣ  (p=−1, q=eˣ)\ny_h = C·eˣ\ne^(∫p dx) = e^(−x)\nC'(x) = eˣ · e^(−x) = 1  →  C(x) = x\ny = eˣ · (x + C) = eˣ(x+C)\nKontrolle: y' = eˣ(x+C) + eˣ = y + eˣ ✓",
      },
    ],
  },

  B8: {
    topicId: "B8",
    sections: [
      {
        heading: "Normalverteilung und Standardisierung",
        body: "X ~ N(μ; σ²): Glockenkurve, symmetrisch um μ\nStandardisierung: Z = (X−μ)/σ, Z ~ N(0;1)\n\nWahrscheinlichkeiten:\n  P(X ≤ x) = Φ((x−μ)/σ)  (Standardnormalverteilung Φ)\n  P(a ≤ X ≤ b) = Φ((b−μ)/σ) − Φ((a−μ)/σ)\n  Φ(−z) = 1 − Φ(z)\n\nFaustregeln:\n  P(μ−σ ≤ X ≤ μ+σ) ≈ 68%\n  P(μ−2σ ≤ X ≤ μ+2σ) ≈ 95%\n  P(μ−3σ ≤ X ≤ μ+3σ) ≈ 99,7%",
        example: "X ~ N(70; 100) (μ=70, σ=10)\nP(X ≤ 80) = Φ((80−70)/10) = Φ(1) ≈ 0,8413\nP(60 ≤ X ≤ 80) = Φ(1) − Φ(−1) = 0,8413−0,1587 = 0,6826\n\nP(X ≥ 85) = 1 − Φ(1,5) = 1 − 0,9332 = 0,0668\n\nQuantil: Φ(z₀,₉₅) = 0,95 → z = 1,645\nWert x mit P(X ≤ x) = 0,95:\nx = μ + 1,645·σ = 70 + 16,45 = 86,45",
      },
      {
        heading: "Konfidenzintervall",
        body: "Schätzung des Erwartungswertes μ aus Stichprobe:\n\nBekannte Varianz σ²:\n  KI: [x̄ − z_{α/2}·σ/√n ; x̄ + z_{α/2}·σ/√n]\n\nUnbekannte Varianz (t-Verteilung, ν=n−1):\n  KI: [x̄ − t_{α/2;ν}·s/√n ; x̄ + t_{α/2;ν}·s/√n]\n\nHäufige z-Werte:\n  95%: z = 1,960\n  99%: z = 2,576\n  90%: z = 1,645\n\nBreite des KI: w = 2·z·σ/√n → für kleines KI: großes n!",
        example: "n=100 Messungen: x̄=152, s=12, 95%-KI:\n[152 − 1,96·12/10 ; 152 + 1,96·12/10]\n= [152 − 2,352 ; 152 + 2,352] = [149,65 ; 154,35]\n\nWieviele Messungen für Breite ≤ 2 (95%)?\n2·1,96·12/√n ≤ 2\n√n ≥ 23,52  →  n ≥ 554",
      },
    ],
  },

  B9: {
    topicId: "B9",
    sections: [
      {
        heading: "Korrelationskoeffizient",
        body: "Maß für linearen Zusammenhang: r ∈ [−1; 1]\n  r = 1: perfekt positiv linear\n  r = −1: perfekt negativ linear\n  r = 0: kein linearer Zusammenhang (kann anderer Zus. bestehen!)\n\nr = Σ(xᵢ−x̄)(yᵢ−ȳ) / √[Σ(xᵢ−x̄)² · Σ(yᵢ−ȳ)²]\n   = s_{xy} / (s_x · s_y)\n\nBestimmtheitsmaß: R² = r²\nAnteil der durch x erklärten Varianz von y",
        example: "Daten: x=(1,2,3,4,5), y=(2,4,5,4,5)\nx̄=3, ȳ=4\nΣ(xᵢ−x̄)(yᵢ−ȳ) = (−2)(−2)+(−1)(0)+(0)(1)+(1)(0)+(2)(1) = 4+0+0+0+2 = 6\nΣ(xᵢ−x̄)² = 4+1+0+1+4 = 10\nΣ(yᵢ−ȳ)² = 4+0+1+0+1 = 6\nr = 6/√(10·6) = 6/√60 ≈ 0,775\nR² ≈ 0,60: ca. 60% der Varianz von y erklärt",
      },
      {
        heading: "Lineare Regression",
        body: "Regressionsgerade y = a + b·x (Methode der kleinsten Quadrate):\n\nb = Σ(xᵢ−x̄)(yᵢ−ȳ) / Σ(xᵢ−x̄)²  = s_{xy}/s_x²\na = ȳ − b·x̄\n\nDie Regressionsgerade geht durch (x̄; ȳ)!\nResiduen: eᵢ = yᵢ − (a + b·xᵢ)\nΣeᵢ = 0 immer.",
        example: "Vorherige Daten: x̄=3, ȳ=4\nb = 6/10 = 0,6\na = 4 − 0,6·3 = 4 − 1,8 = 2,2\nRegressionsgerade: y = 2,2 + 0,6x\n\nVorhersage für x=6:\nŷ = 2,2 + 0,6·6 = 5,8\n\nR² = 0,775² ≈ 0,60:\n60% der Variation in y wird durch x erklärt.\nGüte des Modells: mittelmäßig (R² < 0,8 eher schwach)",
      },
    ],
  },
};
