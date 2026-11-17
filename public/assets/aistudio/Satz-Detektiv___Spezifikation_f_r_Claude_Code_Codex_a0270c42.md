# Satz-Detektiv – Spezifikation für Claude Code / Codex

Briefing für ein Latein-Lernspiel im Stil eines Detektiv-Logikrätsels. Als Startprompt in Claude Code oder Codex geben oder als `SPEC.md` ins Repo legen.

## 0. Wichtigste Regel: Der Prototyp ist eine Skizze

Es gibt einen kleinen Prototyp (eine HTML-Datei mit zwei handgeschriebenen Fällen). Er zeigt **nur**, wie sich das Spiel anfühlen soll. Er ist ausdrücklich **nicht** die Vorlage für Code, Architektur, Optik oder UI.

**Verbindlich** (bitte einhalten):

- Die Spielidee und das Lernziel aus Abschnitt 1 und 2.
- Die Spielregeln aus Abschnitt 3 (Fälle, Aussagen, Wahrheitsregel, Lösung per Drag & Drop).
- Die Qualitätsanforderungen an Rätsel und Latein aus Abschnitt 5 und 6.

**Frei** (hier soll der Agent eigene, bessere Entscheidungen treffen):

- Code und Architektur. Der Prototyp-Code wird nicht weiterverwendet, nicht refaktoriert und nicht als Basis kopiert. Neues Projekt, saubere Struktur.
- Grafik, Figuren, Räume, Animation, Layout und Menüs. Die Prototyp-Figuren sind Platzhalter aus einfachen Formen und sollen ersetzt werden.
- Die zwei Beispielfälle im Prototyp sind nur Demo-Daten. Sie werden durch generierte Fälle ersetzt.

Wenn der Agent etwas anders macht als der Prototyp, ist das erwünscht, solange es der Spielidee dient. Gründe kurz in `DECISIONS.md`.

## 1. Idee in einem Satz

In einem Raum steht ein Fall (z. B. ein zerbrochenes Fenster), fünf Zeugen sagen je einen lateinischen Satz, und der Spieler findet per Logik und Lateinkenntnis den Hergang heraus und baut die Lösung als lateinischen Satz zusammen.

## 2. Zielgruppe und Lernziel

- Schüler Gymnasium Bayern, Latein ab Ende des 1. Lernjahrs, etwa 11 bis 14 Jahre, vor allem am Smartphone.
- Lernziel: Satzglieder und Endungen verstehen. Wer handelt (Nominativ), wer oder was ist betroffen (Akkusativ), wer bekommt etwas (Dativ), dazu Verben im Präsens und Perfekt, Negation (*non*), Präpositionen. Die Endungen **entscheiden** über die Lösung, nicht nur Vokabeln.
- Das Spiel soll sich wie ein Logikrätsel anfühlen, nicht wie ein Vokabeltest.

## 3. Spielablauf

1. **Fall:** Ein kurzer Szenentext und bis zu drei Fragen, z. B. „Wer hat das Fenster zerbrochen? Was wurde geworfen? Wer hat es ihm gegeben?“
2. **Zeugen:** Fünf Figuren stehen im Raum, jede sagt einen lateinischen Satz zum Fall (z. B. *Maximus lapidem non iecit*).
3. **Wahrheitsregel** pro Fall, wird dem Spieler klar angezeigt. Beispiele: „Genau eine Aussage ist falsch.“, „Jeder sagt eine wahre und eine falsche Aussage.“, „Einer lügt immer, die anderen sagen die Wahrheit.“
4. **Logik und Notizen:** Der Spieler kann Aussagen als wahr/falsch/offen markieren und hat ein Notizraster (Person × Gegenstand × Geber) zum Ausschließen.
5. **Lösung:** Per Drag & Drop (und alternativ per Antippen) baut der Spieler einen lateinischen Lösungssatz aus Wortbausteinen, z. B. „\[Gaius\] \[lapidem\] iecit; \[Cornelia\] ei dedit.“ In der Auswahl liegen **Fallen** mit falschen Endungen (*Gaium* statt *Gaius*, *lapis* statt *lapidem*).
6. **Prüfung:** Falsche Lücken werden markiert. Es gibt Hinweise auf die Art des Fehlers (z. B. „Hier steht das Subjekt, welcher Fall?“), aber nie die Lösung direkt.
7. **Belohnung:** Sterne je nach Versuchen und Hilfen, ein kurzer Epilog (Szene mit der aufgelösten Geschichte).

**Hilfen (begrenzt):**

- Tipp auf ein Wort zeigt Vokabel und Form.
- Übersetzungs-Joker für einen Satz (begrenzte Anzahl pro Fall).
- Vokabelliste zum Fall.
- Hinweis, welche Aussage sicher wahr oder falsch ist (teurer Joker).

## 4. Spielfeld und Grafik (Professor-Layton-Anmutung)

- Große, ausdrucksstarke Figuren in einem gemalten Raum (Salon, Garten, Werkstatt, Markt, Villa, Tempel). Handgezeichneter, warmer Bilderbuch-Look mit klaren Silhouetten, Mimik und kleinen Idle-Animationen.
- Zeugen stehen im Raum, der Spieler tippt eine Figur an, sie tritt nach vorn, es erscheint eine große Sprechblase mit dem lateinischen Satz.
- Das Rätsel-Szenario ist sichtbar (kaputtes Fenster, fehlender Kuchen, beschädigte Statue, verschwundener Brief …), Beweisstücke können angetippt werden.
- Ein kurzer Intro-Dialog pro Fall, kleine Sprünge im Ton von „Kommissar Cornelius“ o. Ä. Humor ist erwünscht.
- Musik und Geräusche: ruhige, leicht rätselhafte Musik, Effekte für Markieren, Einsetzen, richtig, falsch, gelöst. Lautstärkeregler getrennt.
- Mobile first (Hochformat), auch Tablet und Desktop. Hell- und Dunkelmodus, Option für reduzierte Animation.
- Platzhaltergrafik ist für den Anfang erlaubt. Es dürfen nur eigene, lizenzfreie oder dokumentierte Assets verwendet werden (`CREDITS.md`). Keine Figuren oder Motive aus „Professor Layton“ nachbauen, nur die allgemeine Anmutung als Inspiration.

## 5. Rätselgenerator (Kern des Projekts)

Die Fälle werden **generiert**, nicht von Hand geschrieben. Das ist der anspruchsvollste Teil.

**Modell:**

- Ein Fall besteht aus Variablen (Täter, Gegenstand, Geber, optional Ort, Zeit), Personen, Gegenständen und einer Wahrheitsregel.
- Aussagentypen: Identität („X hat es getan“), Verneinung, Gegenstand („Der Stein hat das Fenster zerbrochen“), Geben/Empfänger („X hat Y den Ball gegeben“), Negation von Verbindungen, Zusammensetzungen (und/oder), später Bezug auf andere Aussagen.
- Jede Aussage ist als logische Formel hinterlegt und wird in einen lateinischen Satz **gerendert** (siehe Abschnitt 6).

**Erzeugung:**

1. Zufällige Lösung würfeln (Seed-basiert, reproduzierbar).
2. Zeugenaussagen erzeugen, die zur Wahrheitsregel passen (wahre und falsche Aussagen gezielt mischen).
3. **Eindeutigkeit prüfen:** Mit einem Solver (Brute-Force-Suche, CSP oder SAT/SMT, je nach Größe) alle Lösungen berechnen. Der Fall wird nur akzeptiert, wenn es **genau eine** Lösung gibt.
4. Redundante Aussagen vermeiden (jede Aussage soll für die Eindeutigkeit gebraucht werden oder zumindest nicht den Fall trivial machen).
5. Schwierigkeit messen, z. B. durch die Anzahl der nötigen Deduktionsschritte oder wie viele Lösungen nach der ersten Aussage noch offen sind. Schwierigkeit steuert Aussagentypen, Anzahl der Fragen (1 bis 3) und Wahrheitsregel.

**Anforderungen:**

- Generator unabhängig von der Oberfläche (reines Modul mit Tests).
- Property-Tests: Tausende zufällige Fälle haben jeweils genau eine Lösung und sind in akzeptabler Zeit erzeugbar.
- Nicht triviale Fälle: Eine einzelne Aussage darf nicht schon die ganze Lösung verraten, wenn der Spieler nicht erst logisch auf deren Wahrheit schließen muss.
- Handkuratierte Fälle sollen zusätzlich möglich sein (Tutorial, Story-Fälle), im selben Datenformat.

## 6. Lateinische Sätze und Grammatik

- Ein kleines Grammatikmodell rendert Sätze aus Bausteinen: Subjekt (Nominativ), Objekt (Akkusativ), Dativobjekt, Verb (Präsens, Perfekt, später weitere), Negation (*non*), Präpositionen mit Kasus, einfache Verbindungen (*et*, *sed*).
- **Sprachliche Korrektheit hat Vorrang.** Alle Formen werden aus Lexikondaten erzeugt (Stamm, Deklinationstyp, Genus, Stammformen), nicht frei improvisiert. Jedes Wort bekommt Metadaten für Hilfen (Vokabel, Form, Übersetzung).
- Mehrdeutige Formen (z. B. *puellae*, *amico*) müssen vom Generator erkannt werden. Entweder werden sie vermieden, oder der Satz bleibt eindeutig (Satzkontext), oder beide Lesarten werden beim Eindeutigkeitstest berücksichtigt.
- Wortstellung leicht variieren (Latein ist flexibel), aber das Verb steht standardmäßig am Ende.
- Das Lexikon ist als Daten abgelegt (JSON/YAML), nach Lektionen und Wortarten gruppiert, mit Schema-Validierung und CSV-Importer. Keine Wortlisten aus geschützten Schulbüchern abschreiben, buchspezifische Lektionslisten liefert der Auftraggeber.
- Deutsche Übersetzungen werden aus den Satzbausteinen erzeugt (nicht aus einem KI-Dienst zur Laufzeit), damit sie korrekt und reproduzierbar sind.

## 7. Stufen und Fortschritt

- **Stufe 1:** 3 Zeugen, 1 Frage (nur Nominativ und Akkusativ, Präsens).
- **Stufe 2:** 5 Zeugen, 2 Fragen, Negationen, Perfekt.
- **Stufe 3:** 5 Zeugen, 3 Fragen, Dativ, gemischte Aussagen.
- **Stufe 4:** Ablativ und Präpositionen, kompliziertere Wahrheitsregeln, mehr Mehrdeutigkeit.
- Kapitel mit Story (Detektiv-Karriere, wiederkehrende Figuren), Sterne, Ränge (z. B. vom Praktikanten zum Chefermittler), Abzeichen.
- Spaced Repetition: Grammatikbereiche, in denen Fehler passieren, tauchen häufiger auf.
- Tagesfall mit festem Seed, damit alle denselben Fall lösen und vergleichen können.

## 8. Technik (Vorschlag)

- TypeScript. Oberfläche wahlweise Canvas/SVG-basiert oder mit einem Spiel-Framework wie Phaser. Entscheidung begründen.
- Module: `core` (Fallmodell, Solver, Wahrheitsregeln), `latin` (Lexikon, Grammatik, Satzrenderer), `generator`, `content`, `ui`, `audio`, `services`.
- Drag & Drop mit Pointer Events, auch Touch, zusätzlich Tippen und Tastatur. Barrierefreiheit beachten.
- PWA mit Offline-Modus, lokaler Speicherstand.
- Tests: Vitest für Solver, Generator und Grammatik, Playwright-Smoke-Tests (Fall lösen).

## 9. Datenschutz und Barrierefreiheit

- DSGVO-konform, Kinder als Zielgruppe: keine Werbung, keine Drittanbieter-Tracker, keine Pflichtangaben. Daten lokal, Cloud nur freiwillig, Export und Löschen möglich.
- Platzhalter für Datenschutzerklärung und Impressum, rechtlich füllt der Auftraggeber.
- Große Touch-Ziele, farbenblind-sichere Gestaltung (Markierungen nicht nur über Farbe), Screenreader-taugliche Menüs, einstellbares Tempo bzw. keine Zeitlimits im Standardmodus.

## 10. Meilensteine

1. **Grundlage:** Projektsetup, Lexikon-Schema, Grammatikmodell und Satzrenderer mit Tests.
2. **Generator:** Fallmodell, Solver, Eindeutigkeitsprüfung, erste Wahrheitsregel („genau eine Aussage ist falsch“), Property-Tests.
3. **Spielbarer Kern:** Raum mit Zeugen, Sprechblasen, Markierungen, Notizraster, Lösungssatz per Drag & Drop, Hilfen. Platzhaltergrafik erlaubt.
4. **Inhalt und Schwierigkeit:** Stufen 1 bis 4, weitere Wahrheitsregeln, mehr Aussagentypen und Szenarien.
5. **Grafik und Ton:** Layton-artige Figuren und Räume, Animationen, Musik, Intro und Epilog je Fall.
6. **Fortschritt:** Sterne, Ränge, Abzeichen, Wiederholungssystem, Tagesfall.
7. **Feinschliff:** Barrierefreiheit, Performance, Datenschutzseiten, Release-Checkliste.

## 11. Abnahmekriterien

- Jeder generierte Fall hat nachweislich genau eine Lösung. Die Tests laufen grün.
- Alle lateinischen Sätze sind grammatisch korrekt und werden aus Lexikon und Grammatikmodell erzeugt.
- Ein Fall lässt sich am Handy ohne Erklärung verstehen und lösen. Die Lösung hängt an Endungen und Logik, nicht an Raten.
- Neue Vokabeln, Szenarien und Wahrheitsregeln lassen sich per Datei ergänzen.
- Kein Code und keine Grafik des Prototyps wurde unreflektiert übernommen. `DECISIONS.md`, `README.md`, `CREDITS.md` sind aktuell.

## 12. Offene Punkte (Auftraggeber entscheidet)

- Welche Lehrbuchlektionen bilden den Startwortschatz?
- Welche Wahrheitsregeln sollen zuerst kommen?
- Soll es nur für den Eigengebrauch oder für Klassen laufen? Das bestimmt Konten, Rangliste und Datenschutzaufwand.
- Ob und wie die drei Latein-Spiele (Lateinblaster, Dr. Declinatio, Satz-Detektiv) eine gemeinsame Plattform bekommen.
