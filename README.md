# Satz-Detektiv

Ein Latein-Lernspiel im Stil eines Detektiv-Logikrätsels für Schülerinnen und Schüler (ab Ende des 1. Lernjahrs).

## Spielprinzip

In einem illustrierten Raum steht ein rätselhafter Vorfall im Mittelpunkt. Drei bis fünf Zeugen geben je eine lateinische Aussage ab, begleitet von einer klaren Wahrheitsregel (z. B. *„Genau eine Aussage ist falsch“* oder *„Nur der Täter lügt“*). Wer die lateinischen Kasus-Endungen (Nominativ, Akkusativ, Dativ, Ablativ), Verneinungen und Tempora korrekt deutet und logisch kombiniert, überführt den Täter und setzt den lateinischen Lösungssatz per Drag & Drop oder Antippen zusammen.

## Modulstruktur

- `src/core/` — Domänentypen, Wahrheitsregeln und endlicher CSP-Solver mit Eindeutigkeits- und Redundanzprüfung
- `src/latin/` — Strukturiertes JSON-Lexikon, Schema-Validierung, CSV-Importer/Exporter, Morphologie-Beuger, Ambiguitätserkennung und deterministischer Latein-/Deutsch-Renderer
- `src/generator/` — Seed-basierter Zufallsgenerator (`mulberry32`), Szenarien für 6 Räume und garantierte Fallerzeugung für Stufen 1–4
- `src/content/` — Kuratierte Story-Kapitel und deterministischer Tagesfall
- `src/audio/` — Web-Audio-Synthesizer mit getrennten Reglern für Musik und Effekte
- `src/services/` — Lokale Speicherung, Ränge, Abzeichen und Spaced-Repetition-Empfehlungen
- `src/ui/` — Mobile-first und Desktop-taugliche Oberfläche mit illustrierter Bühne, Notizraster, Wort-Inspektor und Drag-&-Drop-Lösungsbau

## Skripte

- `npm run dev` — Entwicklungsserver auf Port 3000 starten
- `npm test` — Vitest-Unit- und 1.000-Fälle-Property-Tests ausführen
- `npm run lint` — TypeScript-Typprüfung (`tsc --noEmit`)
- `npm run build` — Produktions-HTML/PWA-Build in `dist/` erzeugen
