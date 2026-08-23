/**
 * German Spell-Check & Word-Splitting
 * ===================================
 * Companion to the English spell-check path (getEnDict / spellCheckWord /
 * findBestSplit) found in the host app. German is tricky because compound
 * words (Komposita) are legitimate single tokens — e.g. "Kraftwerk",
 * "Hochschule", "Studentenwohnheim". We must therefore NOT blindly split
 * any unknown long word the way the English path does.
 *
 * This module only splits concatenated tokens when a *function word*
 * (article / pronoun / preposition / conjunction / modal) is glued to
 * another word — the classic PDF-extraction artefact, e.g.:
 *     "dieMiete"  -> "die Miete"
 *     "unddie"    -> "und die"
 *     "undder"    -> "und der"
 *     "inderSchule" -> "in der Schule"
 *
 * Rules implemented:
 *   1. Words already present in the dictionary are never split.
 *   2. Words whose only valid split would be Noun + Noun (both parts
 *      capitalized, neither a function word) are treated as compounds
 *      and left intact.
 *   3. A split is only accepted when at least one resulting part is a
 *      function word (case-insensitive, so sentence-initial "Der"/"Und"
 *      are recognized).
 *   4. Otherwise the word is returned unchanged (conservative: when in
 *      doubt, don't split).
 *
 * Public API:
 *   getDeDict()                 -> Set<string>   (~3000+ common German words)
 *   spellCheckGermanText(text)  -> string        (line-aware; skips Chinese)
 *   spellCheckGermanWord(word, dict) -> string   (single token)
 *   findBestGermanSplit(word, dict)  -> string[] | null  (best split parts)
 *   DE_FUNCTION_WORDS           -> Set<string>   (function-word lookup)
 */

/* ===========================================================================
 * 0. isChineseLine — reuse the host's helper if present, else a fallback so
 *    this file is usable standalone.
 * ========================================================================= */
var isChineseLine = (typeof isChineseLine === 'function')
    ? isChineseLine
    : function (line) {
        if (!line) return false;
        var chineseChars = (line.match(/[\u4e00-\u9fff]/g) || []).length;
        var totalChars = line.replace(/\s/g, '').length;
        return totalChars > 0 && chineseChars / totalChars > 0.4;
    };

/* ===========================================================================
 * 1. German function words — recognised case-insensitively when splitting,
 *    so that sentence-initial "Der" / "Und" / "In" are still detected.
 * ========================================================================= */
var DE_FUNCTION_WORDS = new Set([
    // articles / determiners
    'der', 'die', 'das', 'den', 'dem', 'des',
    'ein', 'eine', 'einen', 'einem', 'einer', 'eines',
    'kein', 'keine', 'keinen', 'keinem', 'keiner', 'keines',
    'mein', 'meine', 'meinen', 'meinem', 'meiner', 'meines',
    'dein', 'deine', 'deinen', 'deinem', 'deiner', 'deines',
    'sein', 'seine', 'seinen', 'seinem', 'seiner', 'seines',
    'unser', 'unsere', 'unseren', 'unserem', 'unserer', 'unseres',
    'euer', 'eure', 'euren', 'eurem', 'eurer', 'eures',
    'ihr', 'ihre', 'ihren', 'ihrem', 'ihrer', 'ihres',
    'dieser', 'diese', 'dieses', 'diesen', 'diesem', 'dieser',
    'jener', 'jene', 'jenes', 'jenen', 'jenem',
    'welcher', 'welche', 'welches', 'welchen', 'welchem',
    'jeder', 'jede', 'jedes', 'jedem', 'jeden',
    'mancher', 'manche', 'manches', 'manchen', 'manchem',
    'alle', 'allen', 'allem', 'aller', 'alles',
    'einige', 'etliche', 'mehrere', 'wenige', 'viele', 'solche',
    // personal / reflexive / demonstrative pronouns
    'ich', 'du', 'er', 'sie', 'es', 'wir', 'ihr', 'Sie',
    'mich', 'dich', 'sich', 'uns', 'euch',
    'mir', 'dir', 'ihm', 'ihnen',
    'man', 'jemand', 'niemand', 'etwas', 'nichts', 'alles', 'jeder',
    'wer', 'was', 'wessen', 'wen', 'wem',
    'dieser', 'diese', 'dieses', 'jener', 'jene', 'jenes',
    'selber', 'selbst',
    // interrogative / relative adverbs (function-like)
    'wo', 'wann', 'warum', 'wie', 'wohin', 'woher', 'weshalb', 'wieso', 'weswegen',
    // prepositions
    'in', 'an', 'auf', 'mit', 'von', 'zu', 'bei', 'nach', 'vor',
    'ueber', 'unter', 'durch', 'fuer', 'gegen', 'ohne', 'um', 'aus',
    'seit', 'trotz', 'waehrend', 'wegen', 'bis', 'ab', 'gegenueber',
    'innerhalb', 'außerhalb', 'statt', 'anstatt', 'binnen', 'außer',
    'oberhalb', 'unterhalb', 'diesseits', 'jenseits', 'dank', 'zufolge',
    'aufgrund', 'infolge', 'zwecks', 'mittels', 'laut', 'gemäß',
    'entlang', 'neben', 'hinter', 'zwischen',
    'ueber', 'fuer', 'ueber',
    // conjunctions
    'und', 'oder', 'aber', 'denn', 'weil', 'dass', 'daß', 'wenn', 'als',
    'sobald', 'sowie', 'entweder', 'weder', 'sondern', 'sowohl',
    'ob', 'obwohl', 'obschon', 'während', 'damit', 'bevor', 'nachdem',
    'solange', 'falls', 'sodass', 'indem', 'sooft',
    // modal / auxiliary verbs (inflected forms)
    'ist', 'sind', 'seid', 'war', 'waren', 'bin', 'bist', 'sei', 'seien',
    'hat', 'hatte', 'haben', 'hatten',
    'wird', 'werden', 'wurde', 'wurden',
    'kann', 'kannst', 'können', 'mag', 'magst', 'mögen',
    'muss', 'musst', 'müssen', 'soll', 'sollst', 'sollen',
    'will', 'willst', 'wollen', 'darf', 'darfst', 'dürfen',
    'möchte', 'möchten', 'würde', 'würden', 'sollte', 'sollten',
    'könnte', 'könnten', 'müsste', 'müssten',
    'nicht', 'kein', 'keine',
    // common adverbs that glue to neighbours
    'auch', 'noch', 'schon', 'immer', 'nie', 'manchmal', 'oft', 'selten',
    'meistens', 'meist', 'sehr', 'mehr', 'ganz', 'völlig', 'gar', 'sogar',
    'nur', 'sogar', 'besonders', 'deshalb', 'deswegen', 'trotzdem',
    'deshalb', 'deswegen', 'daher', 'somit', 'damit',
    'wenn', 'als', 'wie', 'so', 'da', 'hier', 'dort', 'jetzt', 'dann',
    'bald', 'später', 'früher',
    'allerdings', 'vielleicht', 'natürlich', 'wenigstens', 'höchstens',
    'mindestens', 'zumindest', 'zwar', 'doch', 'jedoch', 'dennoch',
    'vielmehr', 'ansonsten', 'sonst', 'dagegen', 'dabei', 'dadurch',
    'dafür', 'davon', 'dazu', 'daran', 'darauf', 'darüber', 'daraus',
    'dahinter', 'daneben', 'dahinten', 'davor', 'danach', 'darum',
    'darunter', 'darinnen', 'darin', 'dabei', 'damals',
    'wobei', 'wodurch', 'wofür', 'wogegen', 'wohinter', 'womit', 'wovon',
    'wozu', 'woran', 'worauf', 'worüber', 'woraus', 'worin',
    'hierbei', 'hierdurch', 'hierfür', 'hiermit', 'hiervon', 'hierzu',
    'hieran', 'hierauf', 'hierüber', 'hieraus', 'hierin',
    'inzwischen', 'unterdessen', 'gleichzeitig', 'derweil',
    'zusammen', 'auseinander', 'ineinander', 'miteinander',
    'durcheinander', 'voneinander', 'zueinander', 'nacheinander',
    'beieinander', 'aufeinander',
    // contractions that are single real words (must not be re-split)
    'im', 'am', 'zum', 'zur', 'vom', 'beim', 'ins', 'ans', 'ums', 'übers', 'übers'
]);

/* ===========================================================================
 * 2. Compact German dictionary — ~3000+ most common German words.
 *    Nouns are stored Capitalised (German orthography); function words,
 *    verbs, adjectives, adverbs are lower-case. Splitting is case-sensitive
 *    for nouns but case-insensitive for function words (sentence start).
 * ========================================================================= */
var _DE_DICT = null;

function getDeDict() {
    if (_DE_DICT) return _DE_DICT;
    _DE_DICT = new Set();
    var words = (
        // ---- articles / determiners / pronouns ----
        'der die das den dem des ein eine einen einer eines kein keine keinen ' +
        'keiner keinem keines mein meine meinen meiner meinem dein deine deinen ' +
        'deiner deinem sein seine seinen seiner seinem unser unsere unseren ' +
        'unserer unserem euer eure euren eurer eurem ihr ihre ihren ihrer ihrem ' +
        'dieser diese dieses diesen diesem jener jene jenes welcher welche welches ' +
        'jeder jede jedes mancher manche manches alle allen allem aller alles ' +
        'einige etliche mehrere wenige viele solche ich du er sie es wir ihr Sie ' +
        'mich dich sich uns euch mir dir ihm ihnen man jemand niemand etwas ' +
        'nichts alles wer was wessen wen wem selbst selber ' +
        // ---- interrogative / relative adverbs ----
        'wo wann warum wie wohin woher weshalb wieso weswegen wofür wodurch ' +
        'wogegen wohinter womit wovon wozu woran worauf worüber woraus worin ' +
        'wobei hierbei hierdurch hierfür hiermit hiervon hierzu hieran hierauf ' +
        'hierüber hieraus hierin ' +
        // ---- prepositions ----
        'in an auf mit von zu bei nach vor über unter durch für gegen ohne um ' +
        'aus seit trotz während wegen bis ab gegenüber innerhalb außerhalb statt ' +
        'anstatt binnen außer oberhalb unterhalb diesseits jenseits dank zufolge ' +
        'aufgrund infolge zwecks mittels laut gemäß entlang neben hinter zwischen ' +
        // ---- conjunctions ----
        'und oder aber denn weil dass daß wenn als sobald sowie entweder weder ' +
        'sondern sowohl ob obwohl obschon damit bevor nachdem solange falls ' +
        'sodass indem sooft ' +
        // ---- pronominal adverbs & connectors (must NOT be re-split) ----
        'dabei dadurch dafür dagegen dahinter damit davon dazu daran darauf ' +
        'darüber daraus danebens dahinten davor danach darum darunter darinnen ' +
        'darin damals deswegen deshalb trotzdem dennoch außerdem stattdessen ' +
        'infolgedessen demnach daher somit folglich mithin indessen unterdessen ' +
        'gleichzeitig derweil allerdings vielmehr ansonsten sonst ohnehin ' +
        'dazwischen danebens dabei ' +
        'inzwischen inzwischen heutzutage künftig zukünftig bisher seither ' +
        'vorher nachher zuvor danach später früher damals seitdem solange sowie ' +
        'sobald insofern inwieweit soweit sodass ' +
        'zusammen auseinander ineinander miteinander durcheinander voneinander ' +
        'zueinander nacheinander beieinander aufeinander hindurch ' +
        'heraus herein hinaus hinein herüber hinüber herunter hinunter herauf ' +
        'hinauf herab hinab zurück vorbe voraus entlang ' +
        // ---- contractions (single real words) ----
        'im am zum zur vom beim ins ans ums übers ' +
        // ---- auxiliary / modal verbs (inflected) ----
        'bin bist ist sind seid war waren warst wart gewesen habe hast hat haben ' +
        'hatte hatten hattest hattet gehabt wird werden werdet wurde wurden ' +
        'wurdest wurdet geworden kann kannst können könnt könnte könntest könnten ' +
        'mag magst mögen mögt möchte möchtest möchten möchtet soll sollst sollen ' +
        'sollt sollte solltest sollten solltet will willst wollen wollt wollte ' +
        'wolltest wollten wolltet muss musst müssen müsst musste mussten musstest ' +
        'musstet gemusst darf darfst dürfen dürft durfte durften gedurft ' +
        'würde würdest würden würdet sollte sollten möchte möchten ' +
        // ---- common verbs (inflected forms) ----
        'mache machst macht machen gemacht gehe gehst geht gehen gegangen komme ' +
        'kommst kommt kommen gekommen sehe siehst sieht sehen seht gesehen höre ' +
        'hörst hört hören gehört finde findest findet finden gefunden suche ' +
        'suchst sucht suchen gesucht kaufe kaufst kauft kaufen gekauft rufe rufst ' +
        'ruft rufen gerufen zeige zeigst zeigt zeigen gezeigt brauche brauchst ' +
        'braucht brauchen gebraucht denke denkst denkt denken gedacht glaube ' +
        'glaubst glaubt glauben geglaubt schlage schlägst schlägt schlagen ' +
        'geschlagen trage trägst trägt tragen getragen fahre fährst fährt fahren ' +
        'gefahren lese liest lesen gelesen schreibe schreibst schreibt schreiben ' +
        'geschrieben spreche sprichst spricht sprechen gesprochen treffe triffst ' +
        'trifft treffen getroffen esse isst essen esst gegessen trinke trinkst ' +
        'trinkt trinken getrunken wohne wohnst wohnt wohnen gewohnt lebe lebst ' +
        'lebt leben gelebt lerne lernst lernt lernen gelernt studiere studierst ' +
        'studiert studieren arbeitet arbeitest arbeiten gearbeitet antworte ' +
        'antwortest antwortet antworten geantwortet erzähle erzählst erzählt ' +
        'erzählen erzählt beschreibe beschreibst beschreibt beschreiben ' +
        'beschrieben vergleiche vergleichst vergleicht vergleichen verglichen ' +
        'diskutiere diskutierst diskutiert diskutieren diskutiert präsentiere ' +
        'präsentierst präsentiert präsentieren präsentiert interessiere ' +
        'interessierst interessiert interessieren interessiert lässt lassen ' +
        'ließ gelassen liegt lag gelegen steht stand gestanden sitzt saß ' +
        'gesessen hängt hing gehangen führt führte geführt nimmt nahm genommen ' +
        'gibt gab gegeben tut tat getan läuft lief gelaufen schläft schlief ' +
        'geschlafen beginnt begann begonnen fängt fing an angefangen hört auf ' +
        'hörte auf aufgehört macht auf öffnet schließt kauft verkauft verkaufte ' +
        'verkauft bezahlt bezahlte bezahlt kostet kostete gekostet versucht ' +
        'versuchte versucht schafft schaffte geschaffen lernt gelernt versteht ' +
        'verstand verstanden kennt kannte gekannt meint meinte gemeint nennt ' +
        'nannte genannt heißt hieß geheißen scheint schien geschienen erscheint ' +
        'erschien erschienen gilt galt gegolten passiert passierte geschieht ' +
        'geschah geschehen bringt brachte gebracht holt holte geholt schickt ' +
        'schickte geschickt sendet sandte gesandt weint weinte geweint lacht ' +
        'lachte gelacht singt sang gesungen tanzt tanzte getanzt springt sprang ' +
        'gesprungen fliegt flog geflogen schwimmt schwamm geschwommen klettert ' +
        'kletterte geklettert wartet wartete gewartet hilft half geholfen ' +
        'vergisst vergaß vergessen erinnert erinnerte erinnert erklärt erklärte ' +
        'erklärt bedeutet bedeutete bedeutet bekommt bekam bekommen erhält ' +
        'erhielt erhalten gehört gehörte gehört fällt fiel gefallen steigt ' +
        'stieg gestiegen bleibt blieb geblieben liegt lag gelegen liegt wächst ' +
        'wuchs gewachsen währt währte gewährt reicht reichte gereicht zeigt ' +
        'zeigte gezeigt legt legte gelegt stellt stellte gestellt hängt hing ' +
        'gehangen steckt steckte gesteckt hält hielt gehalten fährt fuhr ' +
        'gefahren fliegt flog geflogen ' +
        // ---- nouns: people & family (capitalised) ----
        'Mann Frau Kind Kinder Junge Mädchen Mensch Person Personen Leute Herr ' +
        'Dame Familie Eltern Vater Mutter Sohn Tochter Bruder Schwester Onkel ' +
        'Tante Großvater Großmutter Opa Oma Enkel Enkelin Cousin Cousine ' +
        'Schwiegermutter Schwiegervater Schwiegersohn Schwiegertochter ' +
        'Stiefvater Stiefmutter Schwager Schwägerin Schwiegereltern Verwandte ' +
        'Bekannte Freunde Nachbarn Baby ' +
        // ---- nouns: education & study ----
        'Schule Uni Universität Hochschule Student Studenten Studentin ' +
        'Professor Professorin Dozent Dozentin Lehrer Lehrerin Schüler ' +
        'Schülerin Direktor Rektor Dekan Fakultät Institut Kurs Seminar ' +
        'Vorlesung Übung Hausaufgabe Hausaufgaben Prüfung Klausur Test Examen ' +
        'Schein Note Noten Zeugnis Studium Studienfach Studienplatz Studiengang ' +
        'Studierende Kommilitone Kommilitonen Abschluss Bachelor Master Doktor ' +
        'Diplom Hörsaal Thema Aufgabe Aufgaben Frage Fragen Antwort Antworten ' +
        'Problem Lösung Beispiel Grund Vorteil Nachteil Meinung Standpunkt ' +
        'Idee Information Daten Grafik Schaubild Diagramm Entwicklung Zahl ' +
        'Anzahl Prozent Prozentsatz Preis Kosten Geld Euro Markt Wirtschaft ' +
        'Firma Unternehmen Gesellschaft Kultur Politik Geschichte Technik ' +
        'Wissenschaft Umwelt Energie ' +
        // ---- nouns: time & calendar ----
        'Tag Tage Jahr Jahre Zeit Stunde Minuten Sekunde Monat Monate Woche ' +
        'Wochen Wochenende Morgen Vormittag Mittag Nachmittag Abend Nacht ' +
        'Sonntag Montag Dienstag Mittwoch Donnerstag Freitag Samstag Sonnabend ' +
        'Frühling Sommer Herbst Winter Januar Februar März April Mai Juni Juli ' +
        'August September Oktober November Dezember Feiertag Geburtstag ' +
        'heute morgen gestern übermorgen vorgestern jetzt bald später früher ' +
        // ---- nouns: places & buildings ----
        'Welt Land Stadt Dorf Ort Gegend Region Haus Wohnung Zimmer Raum ' +
        'Küche Bad Badezimmer Schlafzimmer Wohnzimmer Kinderzimmer Arbeitszimmer ' +
        'Büro Treppe Decke Boden Wand Tür Fenster Garten Hof Straße Weg Platz ' +
        'Park Brücke Bahnhof Station Flughafen Krankenhaus Apotheke Post Bank ' +
        'Rathaus Polizei Feuerwehr Botschaft Amt Behörde Museum Theater Kirche ' +
        'Restaurant Café Hotel Laden Geschäft Einkaufszentrum Supermarkt Markt ' +
        'Baum Blume Gras Berg See Meer Fluss Strand Wald Feld Bibliothek Mensa ' +
        'Wohnheim Miete ' +
        // ---- nouns: transport & travel ----
        'Auto Bus Bahn Zug Straßenbahn U-Bahn S-Bahn Taxi Fahrrad Motorrad ' +
        'Flugzeug Schiff Reise Urlaub Flug Fahrt Ticket Karte Plan Fahrplan ' +
        'Ausweis Pass Reisepass Koffer Tasche Rucksack Richtung Kreuzung Ampel ' +
        'Brücke ' +
        // ---- nouns: household & objects ----
        'Tisch Stuhl Bett Sofa Sessel Hocker Schrank Regal Lampe Bild Spiegel ' +
        'Schlüssel Uhr Geschenk Rechnung Quittung Stift Bleistift Papier Heft ' +
        'Ordner Brille Schere Lineal Radiergummi Wörterbuch Lexikon Zeitung ' +
        'Zeitschrift Artikel Text Absatz Überschrift Übersetzung Grammatik ' +
        'Buchstabe Alphabet Buch Wort Worte Wörter Satz Seite Telefon Computer ' +
        'Laptop Bildschirm Tastatur Maus Drucker Internet Email Musik Film ' +
        'Spiel Sport Mannschaft Spieler Verein Topf Pfanne Teller Schüssel ' +
        'Tasse Glas Becher Flasche Besteck Messer Gabel Löffel Suppenlöffel ' +
        'Serviette Tischdecke Schwamm Seife Shampoo Zahnbürste Zahnpasta ' +
        'Handtuch Kamm Bürste Rasierer Parfüm Taschentuch Watte Pflaster ' +
        'Verband Medikament Tablette Salbe Tropfen Sirup Pille Kapsel Motor ' +
        'Reifen Bremse Licht ' +
        // ---- nouns: food & drink ----
        'Essen Trinken Lebensmittel Brot Milch Käse Fleisch Fisch Gemüse Obst ' +
        'Kartoffel Reis Nudel Apfel Banane Orange Tomate Butter Ei Zucker Salz ' +
        'Pfeffer Suppe Kuchen Schokolade Eis Kaffee Tee Saft Bier Wein Wasser ' +
        'Frühstück Mittagessen Abendessen ' +
        // ---- nouns: work & society ----
        'Arbeit Job Beruf Karriere Gehalt Lohn Freizeit Hobby Sprache Deutsch ' +
        'Englisch Fremdsprache Muttersprache Wortschatz Aussprache Fehler Verb ' +
        'Nomen Adjektiv Präposition Artikel Konjunktion Pronomen Adverb Arzt ' +
        'Ärztin Krankenschwester Pfleger Patient Apotheker Bäcker Metzger ' +
        'Verkäufer Kassierer Kellner Koch Friseur Mechaniker Elektriker Maler ' +
        'Maurer Tischler Schneider Gärtner Bauer Fischer Pilot Fahrer Beamter ' +
        'Polizist Feuerwehrmann Soldat Richter Anwalt Rechtsanwalt Notar ' +
        'Steuerberater Manager Chef Angestellter Arbeiter Mitarbeiter Kollege ' +
        'Kollegin Praktikant Azubi Lehrling Ingenieur Wissenschaftler Forscher ' +
        'Erfinder ' +
        // ---- nouns: nature & body ----
        'Sonne Mond Stern Himmel Wolke Regen Schnee Wind Sturm Wetter Feuer ' +
        'Erde Stein Metall Holz Glas Stoff Natur Umwelt Landschaft Tier Pflanze ' +
        'Blatt Wurzel Stamm Ast Frucht Samen Hund Katze Vogel Pferd Kuh Schwein ' +
        'Huhn Schaf Maus Kopf Gesicht Auge Ohr Nase Mund Hand Arm Bein Fuß ' +
        'Herz Lunge Leber Niere Magen Haut Haar Zahn Zähne Lippe Zunge Stirn ' +
        'Kinn Wange Schulter Finger Daumen Knie Hüfte Gesundheit Krankheit ' +
        'Medizin ' +
        // ---- nouns: abstract / communication ----
        'Anfang Ende Erfolg Misserfolg Gefahr Hoffnung Liebe Angst Freude ' +
        'Schmerz Ruhe Mut Geduld Erfahrung Wissen Kenntnis Fähigkeit ' +
        'Möglichkeit Chance Ziel Plan Traum Wahrheit Lüge Pflicht Recht Gesetz ' +
        'Regel Rat Tipp Hinweis Nachricht Neuigkeit Bitte Wunsch Ordnung System ' +
        'Methode Verfahren Prozess Schritt Ergebnis Folge Wirkung Einfluss ' +
        'Ursache Anlass Grund Zweck Sinn Inhalt Form Stil Art Weise Niveau ' +
        'Stufe Klasse Gruppe Menge Maß Grad Stärke Schwäche Qualität Wert ' +
        'Nutzen Schaden Risiko Sicherheit Unsicherheit Zweifel Vertrauen ' +
        'Erwartung Sorge Glück Gefühl Gedanke Meinung Ansicht Position ' +
        'Einstellung Verhalten Handlung Tat Maßnahme Entscheidung Wahl Auswahl ' +
        'Alternative Vorschlag Projekt Vorhaben Absicht Wille Ausdauer Kraft ' +
        'Macht Verantwortung Aufgabe Funktion Rolle Teil Anteil Beitrag ' +
        'Leistung Fortschritt Verbesserung Änderung Wachstum Zuwachs Rückgang ' +
        'Abfall Anstieg Zunahme Abnahme Unterschied Gegensatz Kontrast Vergleich ' +
        'Verhältnis Beziehung Verbindung Kontakt Kommunikation Gespräch ' +
        'Diskussion Debatte Argument Begründung Beweis Zeichen Signal Mitteilung ' +
        'Ankündigung Erklärung Beschreibung Darstellung Zusammenfassung ' +
        'Bewertung Urteil Schluss Fazit Folgerung Konsequenz Auswirkung Effekt ' +
        'Bedingung Voraussetzung Anforderung Bedarf Bedürfnis Frage Antwort ' +
        'Lösung Mittel Weg Methode Prinzip Vorschrift Standard Kategorie Sorte ' +
        'Reihe Zahl Anzahl Menge Summe Gesamt Rest Abstand Entfernung Länge ' +
        'Breite Höhe Tiefe Dicke Gewicht Volumen Größe Format Einheit Element ' +
        'Faktor Aspekt Seite Bereich Feld Branche Zweig Richtung Spur Linie ' +
        'Punkt Stelle Ort Platz Position Standort Raum Fläche Gebiet Zone ' +
        'Bezirk Kreis Kontinent Universum Planet ' +
        // ---- adjectives (base + common inflected forms) ----
        'gut gute guter gutes guten gutem schlecht schlechte schlechter ' +
        'schlechtes schönen schöne schöner schönes schönen schönem neu neue ' +
        'neuer neues neuen neuem alt alte alter altes alten altem groß große ' +
        'großer großes großen großem klein kleine kleiner kleines kleinen ' +
        'kleinem viel viele vieler vieles vielen vielem wenig wenige weniger ' +
        'weniges wenigen wenigem schnell schnelle schneller schnelles schnellen ' +
        'schnellem langsam langsame langsamer langsames langsamen langsamem ' +
        'einfach einfache einfacher einfaches einfachen einfachem schwer schwere ' +
        'schwerer schweres schweren schwerem leicht leichte leichter leichtes ' +
        'leichten leichtem wichtig wichtige wichtiger wichtiges wichtigen ' +
        'wichtigem richtig richtige richtiger richtiges richtigen richtigem ' +
        'falsch falsche falscher falsches falschen falschem möglich mögliche ' +
        'möglicher mögliches möglichen möglichem unmöglich unmögliche ' +
        'unmöglicher unmögliches unmöglichen unmöglichem interessant ' +
        'interessante interessanter interessantes interessanten interessantem ' +
        'langweilig langweilige langweiliger langweiliges langweiligen ' +
        'langweiligem toll super prima hässlich hässliche hässlicher hässliches ' +
        'hässlichen hässlichem heiß heiße heißer heißes heißen heißem kalt ' +
        'kalte kalter kaltes kalten kaltem warm warme warmer warmes warmen ' +
        'warmem kühl kühle kühler kühles kühlen kühlem trocken trockene ' +
        'trockener trockenes trockenen trockenem nass nasse nasser nasses ' +
        'nassen nassen klar klare klarer klares klaren klarem deutlich deutliche ' +
        'deutlicher deutliches deutlichen deutlichem sicher sichere sicherer ' +
        'sicheres sicheren sicherem unsicher unsichere unsicherer unsicheres ' +
        'unsicheren unsicherem bekannt bekannte bekannter bekanntes bekannten ' +
        'bekanntem unbekannt unbekannte unbekannter unbekanntes unbekannten ' +
        'unbekanntem lieb liebe lieber liebes lieben lieben nett nette netter ' +
        'nettes netten nettem freundlich freundliche freundlicher freundliches ' +
        'freundlichen freundlichem unfreundlich unfreundliche unfreundlicher ' +
        'unfreundliches unfreundlichen unfreundlichem höflich höfliche höflicher ' +
        'höfliches höflichen höflichem unhöflich unhöfliche unhöflicher ' +
        'unhöfliches unhöflichen unhöflichem pünktlich pünktliche pünktlicher ' +
        'pünktliches pünktlichen pünktlichem unpünktlich unpünktliche ' +
        'unpünktlicher unpünktliches unpünktlichen unpünktlichem teuer teure ' +
        'teurer teures teuren teurem billig billige billiger billiges billigen ' +
        'billigem günstig günstige günstiger günstiges günstigen günstigem reich ' +
        'reiche reicher reiches reichen reichem arm arme armer armes armen armem ' +
        'gesund gesunde gesunder gesundes gesunden gesundem krank kranke kranker ' +
        'krankes kranken krankem glücklich glückliche glücklicher glückliches ' +
        'glücklichen glücklichem traurig traurige trauriger trauriges traurigen ' +
        'traurigem wütend wütende wütender wütendes wütenden wütendem müde müder ' +
        'müdes müden müdem wach wache wacher waches wachen wachem hungrig ' +
        'hungrige hungriger hungriges hungrigen hungrigem satt satte satter ' +
        'sattes satten sattem durstig durstige durstiger durstiges durstigen ' +
        'durstigem voll volle voller volles vollen vollem leer leere leerer ' +
        'leeres leeren leerem offen offene offener offenes offenen offenem ' +
        'geschlossen geschlossene geschlossener geschlossenes geschlossenen ' +
        'geschlossenem frei freie freier freies freien freiem besetzt besetzte ' +
        'besetzter besetztes besetzten besetztem sauber saubere sauberer ' +
        'sauberes sauberen sauberem schmutzig schmutzige schmutziger schmutziges ' +
        'schmutzigen schmutzigem ordentlich ordentliche ordentlicher ordentliches ' +
        'ordentlichen ordentlichem unordentlich unordentliche unordentlicher ' +
        'unordentliches unordentlichen unordentlichem ruhig ruhige ruhiger ' +
        'ruhiges ruhigen ruhigem laut laute lauter lautes lauten lautem leise ' +
        'leiser leises leisen leisem stark starke starker starkes starken ' +
        'starkem schwach schwache schwacher schwaches schwachen schwachem hoch ' +
        'hohe hoher hohes hohen hohem niedrig niedrige niedriger niedriges ' +
        'niedrigen niedrigem tief tiefe tiefer tiefes tiefen tiefem breit breite ' +
        'breiter breites breiten breitem schmal schmale schmaler schmales ' +
        'schmalen schmalem dick dicke dicker dickes dicken dickem dünn dünne ' +
        'dünner dünnes dünnen dünnem rund runde runder rundes runden rundem ' +
        'eckig eckige eckiger eckiges eckigen eckigem gerade gerader gerades ' +
        'geraden geradem süß süße süßer süßes süßen süßem sauer saure saurer ' +
        'saures sauren saurem bitter bittere bitterer bitteres bitteren ' +
        'bitterem salzig salzige salziger salziges salzigen salzigem frisch ' +
        'frische frischer frisches frischen frischem modern moderne modernes ' +
        'modernen modernem traditionell traditionelle traditioneller ' +
        'traditionelles traditionellen traditionellem aktuell aktuelle aktueller ' +
        'aktuelles aktuellen aktuellem veraltet veraltete veralteter veraltetes ' +
        'veralteten veraltetem zusätzlich zusätzliche zusätzlicher zusätzliches ' +
        'zusätzlichen zusätzlichem besonders allgemein persönlich gemeinsam ' +
        'einzeln einzelne einzelner einzelnes einzelnen einzelnem öffentlich ' +
        'öffentliche öffentlicher öffentliches öffentlichen öffentlichem privat ' +
        'private privater privates privaten privatem formell formelle formeller ' +
        'formelles formellen formellem informell informelle informeller ' +
        'informelles informellen informellem offiziell offizielle offizieller ' +
        'offizielles offiziellen offiziellem inoffiziell inoffizielle ' +
        'inoffizieller inoffizielles inoffiziellen inoffiziellem direkt direkte ' +
        'direkter direktes direkten direktem indirekt indirekte indirekter ' +
        'indirektes indirekten indirektem aktiv aktive aktiver aktives aktiven ' +
        'aktivem passiv passive passiver passives passiven passivem positiv ' +
        'positive positiver positives positiven positivem negativ negative ' +
        'negativer negatives negativen negativem national nationale nationaler ' +
        'nationales nationalen nationalem international internationale ' +
        'internationaler internationales internationalen internationalem lokal ' +
        'lokale lokaler lokales lokalen lokalem global globale globaler globales ' +
        'globalen globalem regional regionale regionaler regionales regionalen ' +
        'regionalem sozial soziale sozialer soziales sozialen sozialem kulturell ' +
        'kulturelle kultureller kulturelles kulturellen kulturellem historisch ' +
        'historische historischer historisches historischen historischem ' +
        'geografisch geografische geografischer geografisches geografischen ' +
        'geografischem politisch politische politischer politisches politischen ' +
        'politisch politischem wirtschaftlich wirtschaftliche wirtschaftlicher ' +
        'wirtschaftliches wirtschaftlichen wirtschaftlichem ökologisch ökologische ' +
        'ökologischer ökologisches ökologischen ökologischem technisch technische ' +
        'technischer technisches technischen technischem wissenschaftlich ' +
        'wissenschaftliche wissenschaftlicher wissenschaftliches ' +
        'wissenschaftlichen wissenschaftlichem medizinisch medizinische ' +
        'medizinischer medizinisches medizinischen medizinischem pädagogisch ' +
        'pädagogische pädagogischer pädagogisches pädagogischen pädagogischem ' +
        'psychologisch psychologische psychologischer psychologisches ' +
        'psychologischen psychologischem philosophisch philosophische ' +
        'philosophischer philosophisches philosophischen philosophischem ' +
        'religiös religiöse religiöser religiöses religiösen religiösem ' +
        'moralisch moralische moralischer moralisches moralischen moralischem ' +
        'ethisch ethische ethischer ethisches ethischen ethischem legal legale ' +
        'legaler legales legalen legalem illegal illegale illegaler illegales ' +
        'illegalen illegalem formal formale formaler formales formalen formalem ' +
        'normal normale normaler normales normalen normalem natürlich natürliche ' +
        'natürlicher natürliches natürlichen natürlichem künstlich künstliche ' +
        'künstlicher künstliches künstlichen künstlichem organisch organische ' +
        'organischer organisches organischen organischem synthetisch ' +
        'synthetische synthetischer synthetisches synthetischen synthetischem ' +
        'wichtig möglich unmöglich nötig notwendig überflüssig sinnlos sinnvoll ' +
        'nützlich nutzlos hilfreich hilflos gefährlich ungefährlich giftig ' +
        'ungiftig lebendig tot leblos klug dumm intelligent unintelligent weise ' +
        'töricht schlau blöd gescheit begabt talentiert fleißig faul arbeitsam ' +
        'träge dynamisch statisch beweglich unbeweglich flexibel unflexibel ' +
        'starr locker fest weich hart glatt rau stumpf scharf spitz flach hohl ' +
        'massiv dicht durchlässig wasserdicht rein unrein befleckt fleckig ' +
        'fleckfrei gewaschen feucht klatschnass durchnässt regennass verdorrt ' +
        'verwelkt roh gekocht gebraten gebacken gegrillt verbrannt angebrannt ' +
        'gekauft gespült geputzt gereinigt desinfiziert sterilisiert ' +
        'wunderschön schrecklich bequem unbequem gefährlich sicher bunt ernst ' +
        'nett lustig verrückt geduldig ungeduldig ehrlich unehrlich böse ähnlich ' +
        'gleich verschieden einzig genug spät früh jung erwachsen reif ' +
        'bequem unbequem ' +
        // ---- adverbs ----
        'heute morgen gestern übermorgen vorgestern jetzt bald später früher ' +
        'immer nie niemals manchmal oft selten meistens meist hier da dort ' +
        'oben unten links rechts vorne hinten draußen drinnen überall nirgends ' +
        'zusammen allein auch nur noch schon sowieso trotzdem deshalb deswegen ' +
        'infolgedessen aufgrund gegenüber hinsichtlich bezüglich anstatt statt ' +
        'wegen binnen außer innerhalb außerhalb oberhalb unterhalb diesseits ' +
        'jenseits sehr mehr ziemlich ganz völlig total absolut äußerst höchst ' +
        'extrem besonders vorwiegend hauptsächlich generell grundsätzlich ' +
        'normalerweise üblicherweise gewöhnlich fast beinahe nahezu ungefähr ' +
        'etwa rund schätzungsweise circa ca gerade eben exakt genau präzise ' +
        'haargenau punktgenau akkurat sorgfältig gründlich oberflächlich ' +
        'ausführlich detailliert kurz knapp bündig prägnant pointiert geistreich ' +
        'witzig humorvoll lustig komisch seltsam merkwürdig eigenartig sonderbar ' +
        'bizarr skurril exzentrisch verrückt wahnsinnig irre dämlich albern ' +
        'naiv arglos unschuldig schuldlos tadellos makellos fehlerfrei perfekt ' +
        'ideal optimal bestmöglich bestens hervorragend ausgezeichnet exzellent ' +
        'brillant glänzend großartig fantastisch wunderbar herrlich prächtig ' +
        'hübsch ansehnlich attraktiv reizvoll charmant bezaubernd faszinierend ' +
        'fesselnd spannend mitreißend packend ergreifend rührend bewegend ' +
        'tröstlich erfreulich freudig froh fröhlich heiter vergnügt aufgeregt ' +
        'nervös angespannt gespannt wirklich echt tatsächlich eigentlich nämlich ' +
        'wohl eben halt übrigens hoffentlich bestimmt vielleicht möglicherweise ' +
        'vielleicht wahrscheinlich sicherlich gewiss wahrscheinlich offensichtlich ' +
        'anscheinend scheinbar angeblich ' +
        // ---- numbers, ordinals, multiplicatives ----
        'null eins zwei drei vier fünf sechs sieben acht neun zehn elf zwölf ' +
        'dreizehn vierzehn fünfzehn sechzehn siebzehn achtzehn neunzehn zwanzig ' +
        'dreißig vierzig fünfzig sechzig siebzig achtzig neunzig hundert tausend ' +
        'million millionen milliarde milliarden erste zweite dritte vierte fünfte ' +
        'sechste siebte achte neunte zehnte elfte zwölfte einmal zweimal dreimal ' +
        'viermal mehrmals ' +
        // ---- languages / nationalities ----
        'deutsch englisch französisch spanisch italienisch chinesisch japanisch ' +
        'russisch türkisch arabisch polnisch portugiesisch niederländisch ' +
        'Deutschland Europa Amerika Asien Afrika Asien Berlin München Hamburg ' +
        // ---- extra common everyday nouns (capitalised) ----
        'Abschied Anfang Anfang Erfolg Ende Gefahr Hoffnung Liebe Angst Freude ' +
        'Schmerz Ruhe Lust Mut Geduld Erfahrung Wissen Kenntnis Fähigkeit ' +
        'Möglichkeit Chance Ziel Plan Traum Wahrheit Lüge Pflicht Recht Gesetz ' +
        'Regel Rat Tipp Hinweis Nachricht Neuigkeit Ankündigung Warnung Bitte ' +
        'Wunsch Ordnung System Methode Verfahren Prozess Schritt Ergebnis Folge ' +
        'Wirkung Einfluss Ursache Anlass Grund Zweck Sinn Inhalt Form Stil Art ' +
        'Weise Niveau Stufe Klasse Gruppe Menge Maß Grad Stärke Schwäche Qualität ' +
        'Wert Nutzen Schaden Risiko Sicherheit Vertrauen Erwartung Sorge Glück ' +
        'Gefühl Gedanke Meinung Ansicht Position Einstellung Verhalten Handlung ' +
        'Tat Maßnahme Entscheidung Wahl Auswahl Alternative Vorschlag Projekt ' +
        'Vorhaben Absicht Wille Ausdauer Kraft Macht Verantwortung Aufgabe ' +
        'Funktion Rolle Teil Anteil Beitrag Leistung Fortschritt Verbesserung ' +
        'Änderung Wachstum Zuwachs Rückgang Abfall Anstieg Zunahme Abnahme ' +
        'Unterschied Gegensatz Kontrast Vergleich Verhältnis Beziehung ' +
        'Verbindung Kontakt Kommunikation Gespräch Diskussion Debatte Argument ' +
        'Begründung Beweis Zeichen Signal Mitteilung Erklärung Beschreibung ' +
        'Darstellung Zusammenfassung Bewertung Urteil Schluss Fazit Folgerung ' +
        'Konsequenz Auswirkung Effekt Bedingung Voraussetzung Anforderung ' +
        'Bedarf Bedürfnis Frage Antwort Lösung Mittel Weg Methode Prinzip ' +
        'Vorschrift Standard Kategorie Sorte Reihe Zahl Anzahl Summe Rest ' +
        'Abstand Entfernung Länge Breite Höhe Tiefe Dicke Gewicht Volumen Größe ' +
        'Format Einheit Element Faktor Aspekt Seite Bereich Feld Branche Zweig ' +
        'Richtung Spur Linie Punkt Stelle Ort Platz Position Standort Raum ' +
        'Fläche Gebiet Zone Bezirk Kreis Kontinent Universum Planet ' +
        'Sonne Mond Stern Himmel Wolke Regen Schnee Wind Sturm Wetter Feuer ' +
        'Erde Stein Metall Holz Glas Stoff Natur Umwelt Landschaft Tier Pflanze ' +
        'Baum Blume Gras Blatt Wurzel Stamm Ast Frucht Samen ' +
        // ---- extra everyday nouns (objects / places / abstract) ----
        'Tisch Stuhl Bett Sofa Sessel Hocker Schrank Regal Lampe Bild Spiegel ' +
        'Schlüssel Uhr Geschenk Rechnung Quittung Stift Bleistift Papier Heft ' +
        'Ordner Brille Schere Lineal Wörterbuch Buch Telefon Computer Internet ' +
        'Email Musik Film Spiel Sport Mannschaft Spieler Verein Topf Pfanne ' +
        'Teller Schüssel Tasse Glas Becher Flasche Besteck Messer Gabel Löffel ' +
        'Serviette Tischdecke Schwamm Seife Shampoo Zahnbürste Zahnpasta ' +
        'Handtuch Kamm Bürste Rasierer Parfüm Taschentuch Watte Pflaster ' +
        'Verband Medikament Tablette Salbe Tropfen Sirup Pille Kapsel ' +
        'Krankenhaus Arztpraxis Klinik Praxis Therapie Behandlung Operation ' +
        'Untersuchung Diagnose Rezept Impfung Virus Bakterium Infektion Fieber ' +
        'Schmerzen Kopf Bauch Rücken Hals Nase Ohr Auge Hand Arm Bein Fuß Herz ' +
        'Lunge Leber Niere Magen Haut Haar Zahn Gesicht Mund Lippe Zunge Stirn ' +
        'Kinn Wange Schulter Ellbogen Handgelenk Finger Daumen Zeigefinger ' +
        'Mittelfinger Ringfinger Nagel Knie Hüfte Oberschenkel Unterschenkel ' +
        'Knöchel Ferse Zeh Wade Gesäß Brust Rippe Wirbel Wirbelsäule Becken ' +
        'Gelenk Muskel Sehne Knochen Blut Ader Vene Arterie Nerv Gehirn ' +
        'Rückenmark Luftröhre Speiseröhre Darm Galle Blase ' +
        // ---- colours / materials / misc adjectives ----
        'rot rote roter rotes roten rotm grün grüne grüner grünes grünen ' +
        'blau blaue blauer blaues blauen blauem gelb gelbe gelber gelbes gelben ' +
        'gelbem schwarz schwarze schwarzer schwarzes schwarzen schwarzem weiß ' +
        'weiße weißer weißes weißen weißem braun braune brauner braunes braunen ' +
        'braunem grau graue grauer graues grauen grauem orange rosa lila violett ' +
        'gold golden silber silbern ' +
        // ---- extra verbs / participles (lowercase) ----
        'geben nehmen machen gehen kommen sehen wissen denken sagen fragen hören ' +
        'lesen schreiben sprechen treffen essen trinken wohnen leben lernen ' +
        'studieren arbeiten antworten erzählen beschreiben vergleichen ' +
        'diskutieren präsentieren interessieren brauchen glauben schlagen tragen ' +
        'fahren bleiben liegen stehen sitzen hängen führen lassen fallen laufen ' +
        'schlafen beginnen aufhören öffnen schließen kaufen verkaufen bezahlen ' +
        'kosten versuchen schaffen verstehen kennen meinen nennen heißen scheinen ' +
        'erscheinen gelten passieren geschehen bringen holen schicken weinen ' +
        'lachen singen tanzen springen fliegen schwimmen klettern warten helfen ' +
        'vergessen erinnern erklären bedeuten bekommen erhalten gehören ' +
        'reichen zeigen legen stellen hängen stecken halten führen fahren ' +
        'gegangen gekommen gesehen gehört gefunden gesucht gekauft gerufen ' +
        'gezeigt gebraucht gedacht geglaubt geschlagen getragen gefahren ' +
        'gelesen geschrieben gesprochen getroffen gegessen getrunken gewohnt ' +
        'gelebt gelernt studiert gearbeitet geantwortet erzählt beschrieben ' +
        'verglichen diskutiert präsentiert interessiert gewesen gehabt geworden ' +
        'gemacht gegangen gekommen gesehen gehört gefunden gesucht gekauft ' +
        'gerufen gezeigt gebraucht gedacht geglaubt geschlagen getragen ' +
        'gefahren gelesen geschrieben gesprochen getroffen gegessen getrunken ' +
        'gewohnt gelebt gelernt studiert gearbeitet geantwortet erzählt ' +
        'beschrieben verglichen diskutiert präsentiert interessiert ' +
        // ---- TestDaF / academic vocabulary ----
        'Vorbereitungszeit Sprechzeit Aufgabenstellung ' +
        'Situationsbeschreibung Quelle Vergleich Darstellung Argument Fazit ' +
        'Begründung überzeugen darstellen abwägen begründen zusammenfassen ' +
        'vorstellen argumentieren belegen erwähnen hervorheben hervorgehen ' +
        'darüber außerdem dennoch jedoch einerseits andererseits zunächst ' +
        'anschließend schließlich zuletzt zudem ferner gleichfalls ebenso ' +
        'daher somit folglich infolgedessen mithin demnach demzufolge indessen ' +
        'inzwischen unterdessen gleichzeitig derzeit heutzutage künftig ' +
        'zukünftig bisher seither vorher nachher zuvor danach später früher ' +
        'damals seitdem solange sowie sobald ' +
        // ---- extra common short words & particles (lowercase) ----
        'ja nein doch etwa fast gar sehr wohl recht eben halt noch schon immer ' +
        'oft viel wenig eher ziemlich ganz sehr gar so da hier dort nun dann ' +
        'wieder zurück herunter hinunter herauf hinauf herab hinab ' +
        'vorn hinten vorne oben unten links rechts mitten draußen drinnen ' +
        'irgendwo irgendwann irgendwie irgendwer irgendwas irgendjemand ' +
        'überall nirgends überall zusammen allein ' +
        // ---- extra nouns: places / buildings / institutions ----
        'Bahnhof Flughafen Krankenhaus Apotheke Bank Post Rathaus Polizei ' +
        'Feuerwehr Botschaft Amt Behörde Museum Theater Kirche Restaurant Café ' +
        'Hotel Laden Geschäft Einkaufszentrum Supermarkt Markt Bibliothek Mensa ' +
        'Wohnheim Universität Hochschule Schule Bahnhof Kreuzung Ampel Brücke ' +
        // ---- extra nouns: family & people ----
        'Mann Frau Kind Kinder Junge Mädchen Mensch Person Leute Herr Dame ' +
        'Familie Eltern Vater Mutter Sohn Tochter Bruder Schwester Onkel Tante ' +
        'Großvater Großmutter Opa Oma Enkel Enkelin Cousin Cousine Freund ' +
        'Freundin Kollege Kollegin Nachbar Nachbarin Bekannte ' +
        // ---- extra common verbs infinitive ----
        'sein haben werden können müssen sollen wollen mögen dürfen lassen ' +
        'bleiben gehen kommen stehen liegen sitzen sehen hören sagen sprechen ' +
        'fragen antworten erzählen beschreiben vergleichen diskutieren ' +
        'präsentieren interessieren lernen studieren arbeiten leben wohnen ' +
        'essen trinken kochen backen braten waschen putzen aufräumen ' +
        'einkaufen bezahlen kosten sparen verdienen gewinnen verlieren suchen ' +
        'finden kaufen verkaufen mieten vermieten bauen reparieren öffnen ' +
        'schließen anfangen beginnen beenden aufhören versuchen schaffen ' +
        'verstehen kennen lernen lehren erklären zeigen geben nehmen bringen ' +
        'holen schicken senden empfangen bekommen erhalten behalten verlieren ' +
        'finden suchen wählen treffen besuchen einladen feiern gratulieren ' +
        'heiraten umziehen verreisen fliegen fahren reisen wandern spazieren ' +
        'schwimmen klettern tanzen singen spielen lachen weinen schlafen ' +
        'träumen warten helfen brauchen glauben hoffen fürchten zweifeln ' +
        'wissen denken vergessen erinnern ' +
        // ---- extra adverbs / particles ----
        'gern gerne lieber amliebsten sofort endlich leider übrigens ' +
        'hoffentlich bestimmt wirklich echt absolut etwa ziemlich ganz gar ' +
        'sehr viel wenig eher fast beinahe schätzungsweise ungefähr ' +
        'ungefähr vielleicht möglicherweise wahrscheinlich sicherlich gewiss ' +
        'offensichtlich anscheinend scheinbar angeblich tatsächlich eigentlich ' +
        'nämlich wohl eben halt ja nein doch ' +
        // ---- extra nouns: everyday life ----
        'Arbeit Beruf Job Karriere Gehalt Lohn Urlaub Ferien Freizeit Hobby ' +
        'Interesse Interessen Sprache Deutsch Englisch Wortschatz Grammatik ' +
        'Aussprache Fehler Verb Nomen Adjektiv Präposition Artikel Konjunktion ' +
        'Pronomen Adverb Musik Kunst Literatur Film Sport Spiel Mannschaft ' +
        'Spieler Verein Mannschaft ' +
        // ---- extra nouns: nature & weather ----
        'Wetter Sonne Mond Stern Himmel Wolke Regen Schnee Wind Sturm Eis ' +
        'Feuer Wasser Luft Erde Stein Metall Holz Glas Papier Stoff Natur ' +
        'Umwelt Landschaft Tier Pflanze Baum Blume Gras Blatt Wurzel Stamm ' +
        'Ast Frucht Samen Hund Katze Vogel Pferd Kuh Schwein Huhn Schaf Maus ' +
        'Fisch ' +
        // ---- extra nouns: body & health ----
        'Körper Kopf Gesicht Auge Ohr Nase Mund Hand Arm Bein Fuß Herz Lunge ' +
        'Leber Niere Magen Haut Haar Zahn Lippe Zunge Stirn Kinn Wange ' +
        'Schulter Finger Knie Gesundheit Krankheit Medizin Arzt Krankenhaus ' +
        'Apotheke Rezept Medikament Tablette ' +
        // ---- extra nouns: food & kitchen ----
        'Essen Trinken Lebensmittel Brot Milch Käse Fleisch Fisch Gemüse Obst ' +
        'Apfel Banane Orange Tomate Kartoffel Reis Nudel Butter Ei Zucker Salz ' +
        'Pfeffer Suppe Kuchen Schokolade Eis Kaffee Tee Saft Bier Wein Wasser ' +
        'Frühstück Mittagessen Abendessen ' +
        // ---- extra nouns: household & objects ----
        'Tisch Stuhl Bett Sofa Sessel Schrank Regal Lampe Bild Spiegel ' +
        'Schlüssel Uhr Geschenk Rechnung Quittung Stift Bleistift Papier Heft ' +
        'Ordner Brille Schere Lineal Radiergummi Wörterbuch Buch Wort Satz ' +
        'Seite Telefon Computer Laptop Bildschirm Tastatur Maus Drucker Internet ' +
        'Email Topf Pfanne Teller Schüssel Tasse Glas Becher Flasche Besteck ' +
        'Messer Gabel Löffel ' +
        // ---- extra adjectives ----
        'gut schön neu alt groß klein viel wenig schnell langsam einfach ' +
        'schwer leicht wichtig richtig falsch möglich unmöglich interessant ' +
        'langweilig toll super prima hässlich heiß kalt warm kühl trocken nass ' +
        'klar deutlich sicher unsicher bekannt unbekannt nett freundlich ' +
        'unfreundlich höflich unhöflich pünktlich unpünktlich teuer billig ' +
        'günstig reich arm gesund krank glücklich traurig wütend müde hungrig ' +
        'satt durstig voll leer offen geschlossen frei besetzt sauber schmutzig ' +
        'ordentlich unordentlich ruhig laut leise stark schwach hoch niedrig ' +
        'tief breit schmal dick dünn rund eckig gerade süß sauer bitter ' +
        'salzig frisch modern traditionell aktuell veraltet zusätzlich ' +
        'besonders allgemein persönlich gemeinsam einzeln öffentlich privat ' +
        'formell informell offiziell inoffiziell direkt indirekt aktiv passiv ' +
        'positiv negativ national international lokal global regional sozial ' +
        'kulturell historisch geografisch politisch wirtschaftlich ökologisch ' +
        'technisch wissenschaftlich medizinisch pädagogisch psychologisch ' +
        'philosophisch religiös moralisch ethisch legal illegal formal normal ' +
        'natürlich künstlich organisch synthetisch wunderschön schrecklich ' +
        'bequem gefährlich sicher bunt ernst lustig verrückt geduldig ' +
        'ungeduldig ehrlich unehrlich böse ähnlich gleich verschieden einzig ' +
        'genug spät früh jung erwachsen reif klug dumm intelligent weise ' +
        'schlau begabt talentiert fleißig faul ' +
        // ---- extra common words to avoid false splits ----
        'wirklich sowieso überall nirgends übermorgen vorgestern nachmittags ' +
        'vormittags abends morgens mittags nachts derzeit inzwischen ohnehin ' +
        'beizeiten inmitten vorn vorne gerade genau etwa fast ' +
        'deshalb deswegen trotzdem dennoch außerdem stattdessen infolgedessen ' +
        'demnach daher somit folglich mithin indessen unterdessen gleichzeitig ' +
        'derweil allerdings vielmehr ansonsten sonst ohnehin ' +
        'dabei dadurch dafür dagegen dahinter damit davon dazu daran darauf ' +
        'darüber daraus danebens dahinten davor danach darum darunter darinnen ' +
        'darin damals ' +
        'wobei wodurch wofür wogegen wohinter womit wovon wozu woran worauf ' +
        'worüber woraus worin ' +
        'hierbei hierdurch hierfür hiermit hiervon hierzu hieran hierauf ' +
        'hierüber hieraus hierin ' +
        'zusammen auseinander ineinander miteinander durcheinander voneinander ' +
        'zueinander nacheinander beieinander aufeinander hindurch ' +
        'heraus herein hinaus hinein herüber hinüber herunter hinunter herauf ' +
        'hinauf herab hinab zurück vorbe voraus entlang ' +
        'indem insofern inwieweit soweit sodass solange sowie sobald ' +
        'inzwischen unterdessen gleichwohl ' +
        'sehr mehr ziemlich ganz völlig total absolut äußerst höchst extrem ' +
        'besonders vorwiegend hauptsächlich generell grundsätzlich normalerweise ' +
        'üblicherweise gewöhnlich meistens meist manchmal oft selten ' +
        // ---- extra common nouns (capitalised) final batch ----
        'Problem Lösung Beispiel Frage Antwort Grund Vorteil Nachteil Meinung ' +
        'Idee Information Idee Entwicklung Zahl Anzahl Prozent Preis Kosten ' +
        'Geld Euro Markt Wirtschaft Firma Unternehmen Gesellschaft Kultur ' +
        'Politik Geschichte Technik Wissenschaft Umwelt Energie Natur Wasser ' +
        'Luft Boden ' +
        'Mann Frau Kind Tag Jahr Zeit Welt Land Stadt Haus Schule ' +
        'Universität Student Professor Kurs Seminar Vorlesung Prüfung Klausur ' +
        'Note Studium Kommilitone Thema Aufgabe Frage Antwort Problem Lösung ' +
        'Beispiel Grund Vorteil Nachteil Meinung Standpunkt Idee Information ' +
        'Daten Grafik Schaubild Diagramm Entwicklung Zahl Anzahl Prozent Preis ' +
        'Kosten Geld Euro Markt Wirtschaft Firma Unternehmen Gesellschaft ' +
        'Kultur Politik Geschichte Technik Wissenschaft Umwelt Energie Natur ' +
        'Wasser Luft Boden ' +
        // ---- final: assorted high-frequency words ----
        'schon noch auch nur schon immer nie manchmal oft selten meistens meist ' +
        'sehr mehr ganz gar sogar besonders deshalb deswegen trotzdem außerdem ' +
        'jedoch dennoch vielmehr ansonsten sonst vielleicht natürlich ' +
        'allerdings wenigstens höchstens mindestens zumindest zwar doch ' +
        'allerdings tatsächlich eigentlich nämlich wohl eben halt übrigens ' +
        'hoffentlich bestimmt sicherlich wahrscheinlich offensichtlich ' +
        'anscheinend scheinbar angeblich möglicherweise ' +
        // ---- grammar / linguistics terms (capitalised) ----
        'Wortart Wortarten Substantiv Adjektiv Artikel Pronomen Präposition ' +
        'Konjunktion Adverb Hilfsverb Modalverb Vollverb Reflexivpronomen ' +
        'Kasus Nominativ Genitiv Dativ Akkusativ Singular Plural Maskulinum ' +
        'Femininum Neutrum Konjugation Deklination Tempus Präsens Präteritum ' +
        'Perfekt Plusquamperfekt Futur Imperativ Konjunktiv Indikativ Partizip ' +
        'Infinitiv Rektion Valenz Subjekt Prädikat Objekt Attribut Adverbial ' +
        'Nebensatz Hauptsatz Relativsatz Kausalsatz Konditionalsatz ' +
        'Konzessivsatz Finalsatz Konsekutivsatz Temporalsatz Lokalsatz ' +
        'Satzglied Satzreihe Satzgefüge Infinitivgruppe Partizipialgruppe ' +
        'Präpositionalobjekt Genitivobjekt Dativobjekt Akkusativobjekt ' +
        'Präpositionalattribut Nomenphrase Verbphrase Adjektivphrase ' +
        'Adverbphrase Komma Punkt Fragezeichen Ausrufezeichen Semikolon ' +
        'Doppelpunkt Anführungszeichen Klammer Bindestrich Schrägstrich ' +
        'Absatz Kapitel Abschnitt Untertitel Überschrift Fußnote Endnote ' +
        'Inhaltsverzeichnis Literaturverzeichnis Glossar Register Stichwort ' +
        'Quellenangabe Literaturangabe Zitat Fundstelle Seitenzahl Zeile Spalte ' +
        'Abbildung Tabelle Statistik Säulendiagramm Kreisdiagramm ' +
        'Liniendiagramm Balkendiagramm Kurve Achse Skala Legende Maßstab ' +
        'Gleichung Formel Variable Konstante Funktion Parameter Argument ' +
        'Addition Subtraktion Multiplikation Division Summe Differenz Produkt ' +
        'Quotient Bruch Dezimalzahl Ganzzahl Ziffer Hypothese These Antithese ' +
        'Synthese Gegenargument Tatsache Feststellung Behauptung Vermutung ' +
        'Annahme Reflexion Konzept Begriff Vorstellung Ansicht Sichtweise ' +
        'Perspektive Betrachtungsweise Ansatz Zugang Strategie Taktik Modell ' +
        'Struktur Gliederung Hierarchie Ebene Dimension Facette Merkmal ' +
        'Charakteristikum Eigenschaft Kennzeichen Kriterium Richtlinie Norm ' +
        'Verordnung Bestimmung Klausel Paragraph Zeitraum Zeitspanne Dauer ' +
        'Höhepunkt Tiefpunkt Wendepunkt Moment Augenblick Jahrzehnt ' +
        'Jahrhundert Jahrtausend Epoche Ära Periode Phase Stadium Zustand ' +
        'Situation Lage Stand Umstände Rahmen Kontext Hintergrund Vorgeschichte ' +
        'Vergangenheit Gegenwart Zukunft Andenken Souvenir Gedächtnis Erlebnis ' +
        'Abenteuer ' +
        // ---- additional nouns: body parts (capitalised) ----
        'Zeh Ferse Wade Gesäß Brust Rippe Wirbel Wirbelsäule Becken Gelenk ' +
        'Muskel Sehne Knochen Ader Vene Arterie Nerv Gehirn Rückenmark ' +
        'Luftröhre Speiseröhre Magen Darm Galle Blase Braue Wimper Lid ' +
        'Pupille Iris Schläfe Nacken Ellbogen Handgelenk Daumen Zeigefinger ' +
        'Mittelfinger Ringfinger Knöchel Oberschenkel Unterschenkel ' +
        // ---- additional nouns: animals (capitalised) ----
        'Tier Tiger Löwe Bär Wolf Fuchs Hase Kaninchen Ratte Eichhörnchen ' +
        'Igel Frosch Schlange Wal Hai Delfin Krabbe Hummer Garnele Spinne ' +
        'Insekt Biene Ameise Schmetterling Fliege Mücke Wanze Käfer Wurm ' +
        'Schnecke Muschel Pferd Kuh Schwein Schaf Ziege Huhn Hahn Henne ' +
        'Küken Gans Ente Truthahn Taube Krähe Drossel Meise Sperling ' +
        'Schwalbe Eule Adler Falke Storch Kranich Reh Hirsch Wildschwein ' +
        'Dachs Karpfen Forelle Aal Lachs Thunfisch Kabeljau Hering Hecht ' +
        // ---- additional nouns: plants (capitalised) ----
        'Rose Tulpe Narzisse Sonnenblume Gänseblümchen Klee Distel Moos Pilz ' +
        'Busch Strauch Dorn Zweig Nadel Tanne Fichte Eiche Buche Birke ' +
        'Ahorn Linde Pappel Weide Kiefer Palme Kakteen ' +
        // ---- additional nouns: food & kitchen (capitalised) ----
        'Wurst Schinken Hähnchen Pute Gans Lamm Rindfleisch Schweinefleisch ' +
        'Geflügel Meeresfrüchte Spaghetti Mehl Gewürz Kräuter Basilikum ' +
        'Petersilie Schnittlauch Kümmel Zimt Vanille Knoblauch Zwiebel Karotte ' +
        'Gurke Paprika Spinat Kohl Brokkoli Blumenkohl Bohne Erbse Linse Mais ' +
        'Birne Kirsche Erdbeere Himbeere Brombeere Blaubeere Johannisbeere ' +
        'Stachelbeere Aprikose Pfirsich Pflaume Zwetschge Melone Ananas Mango ' +
        'Kiwi Zitrone Limette Grapefruit Mandarine Mandel Nuss Haselnuss ' +
        'Walnuss Cashew Erdnuss Rosine Quark Joghurt Sahne Honig Marmelade ' +
        'Konfitüre Keks Torte Gebäck Brötchen Semmel Croissant Baguette Sekt ' +
        'Schnaps Likör Wodka Whisky Rum Cocktail Limonade Cola Fanta Sprite ' +
        'Orangensaft Apfelsaft Tomatensaft Karottensaft Multivitaminsaft ' +
        // ---- additional nouns: professions (capitalised) ----
        'Dachdecker Klempner Schlosser Schweißer Zimmermann Drechsler Weber ' +
        'Färber Gerber Sattler Konditor Fleischer Barista Kosmetikerin Masseur ' +
        'Optiker Zahntechniker Chemiker Biologe Physiker Mathematiker ' +
        'Informatiker Programmierer Administrator Designer Architekt ' +
        'Bauingenieur Vermesser Kartograph Geologe Geograph Meteorologe ' +
        'Astronom Flugbegleiter Kapitän Matrose Lokführer Busfahrer Taxifahrer ' +
        'Kutscher Förster Jäger Landwirt Florist Elektriker Maler Tischler ' +
        'Schreiner Schneider Bäcker Metzger Verkäufer Kassierer Kellner Koch ' +
        'Friseur Mechaniker Pilot Fahrer Beamter Polizist Feuerwehrmann Soldat ' +
        'Richter Anwalt Notar Steuerberater Manager Chef Angestellter Arbeiter ' +
        'Praktikant Ingenieur Wissenschaftler Forscher Erfinder ' +
        // ---- additional nouns: nature / geography / objects (capitalised) ----
        'Wüste Oase Steppe Tundra Gletscher Vulkan Überschwemmung Orkan Tornado ' +
        'Lawine Erdrutsch Bergwerk Höhle Schlucht Kliff Felsen Gipfel Tal Ebene ' +
        'Halbinsel Insel Archipel Bucht Golf Kap Landenge Meerenge Wasserfall ' +
        'Quelle Bach Strom See Teich Tümpel Sumpf Moor Wiese Weide Acker ' +
        'Nordpol Südpol Äquator Hausnummer Stockwerk Etage Vorgarten Hinterhof ' +
        'Spielplatz Marktplatz Kirchplatz Markthalle Kaufhaus Warenhaus Boutique ' +
        'Metzgerei Bäckerei Konditorei Apotheke Drogerie Friseursalon ' +
        'Tankstelle Waschstraße Autowerkstatt Werkstatt Atelier Studio Labor ' +
        'Archiv Gericht Gefängnis Klinik Ambulanz Notaufnahme Operationssaal ' +
        'Entbindungsstation Rezeption Wartezimmer Sprechzimmer Behandlungsraum ' +
        'Ministerium Botschaft Konsulat Fachhochschule Seminarraum Hörsaal ' +
        'Studentenwerk Campus ' +
        // ---- additional verbs / participles (lowercase) ----
        'öffne öffnest öffnet öffnen geöffnet schließe schließt schließen ' +
        'geschlossen kaufe kaufst kauft kaufen gekauft verkaufe verkaufst ' +
        'verkauft verkaufen verkaufte verkauft bezahle bezahlst bezahlt ' +
        'bezahlen bezahlt koste kostest kostet kosten kostete gekostet ' +
        'versuche versuchst versucht versuchen versuchte versucht schaffe ' +
        'schaffst schafft schaffen schaffte geschaffen verstehe verstehst ' +
        'versteht verstehen verstand verstanden kenne kennst kennt kennen ' +
        'kannte gekannt meine meinst meint meinen meinte gemeint nennst nennt ' +
        'nannte genannt heißt heiße heißen hieß geheißen scheine scheinst scheint ' +
        'scheinen schien geschienen erscheine erscheinst erscheint erscheinen ' +
        'erschien erschienen gelte gilt gelten galt gegolten passiere passierst ' +
        'passiert passieren passierte geschehe geschieht geschah geschehen bringe ' +
        'bringst bringt bringen brachte gebracht hole holst holt holen holte ' +
        'geholt schicke schickst schickt schicken schickte geschickt sende ' +
        'sendest sendet senden sandte gesandt weine weinst weint weinen weinte ' +
        'geweint lache lachst lacht lachen lachte gelacht singe singst singt ' +
        'singen sang gesungen tanze tanzte getanzt springe springst springt ' +
        'springen sprang gesprungen fliege fliegst fliegt fliegen flog ' +
        'geflogen schwimme schwimmst schwimmt schwimmen schwamm geschwommen ' +
        'klettere kletterst klettert klettern kletterte geklettert warte ' +
        'wartest wartet warten wartete gewartet helfe hilfst hilft helfen half ' +
        'geholfen vergesse vergisst vergessen vergaß erinnere erinnerst erinnert ' +
        'erinnern erinnerte erklärt erklärst erklärt erklären erklärte erklärt ' +
        'bedeute bedeutest bedeutet bedeuten bedeutete bedeutet bekomme ' +
        'bekommst bekommt bekommen bekam erhalten erhält erhältst erhielt ' +
        'gehöre gehörst gehört gehören gehörte gehört reiche reichst reicht ' +
        'reichen reichte gereicht zeige zeigst zeigt zeigen zeigte gezeigt lege ' +
        'legst legt legen legte gelegt stelle stellst stellt stellen stellte ' +
        'gestellt hänge hängst hängt hängen hing gehangen stecke steckst steckt ' +
        'stecken steckte gesteckt halte hältst hält halten hielt gehalten fahre ' +
        'fährst fährt fahren fuhr gefahren fliege fliegst fliegt fliegen flog ' +
        'geflogen blase bläst blasen blies geblasen beiße beißt beißen biss ' +
        'gebissen fange fängst fängt fangen fing gefangen jage jagst jagt jagen ' +
        'jagte gejagt klinge klingst klingt klingen klang geklungen klopfe ' +
        'klopft klopfen klopfte geklopft lade lädst lädt laden lud geladen ' +
        'leuchte leuchtest leuchtet leuchten leuchtete geleuchtet pfeife pfeifst ' +
        'pfeift pfeifen pfiff gepfiffen prüfe prüfst prüft prüfen prüfte ' +
        'geprüft rette rettest rettet retten rettete gerettet rolle rollst ' +
        'rollt rollen rollte gerollt schiebe schiebst schiebt schieben schob ' +
        'geschoben schieße schießt schießen schoss geschossen schließe schließt ' +
        'schließen schloss geschlossen schweige schweigst schweigt schweigen ' +
        'schwieg geschwiegen streiche streichst streicht streichen strich ' +
        'gestrichen stoße stößt stoßen stieß gestoßen streite streitest streitet ' +
        'streiten stritt gestritten stütze stützt stützen stützte gestützt ' +
        'suche suchst sucht suchen suchte gesucht teile teilst teilt teilen ' +
        'teilte geteilt trage trägst trägt tragen trug getragen treffe triffst ' +
        'trifft treffen traf getroffen trenne trennst trennt trennen trennte ' +
        'getrennt trinke trinkst trinkt trinken trank getrunken trockne ' +
        'trocknest trocknet trocknen trocknete getrocknet übe übst übt üben übte ' +
        'geübt überzeuge überzeugst überzeugt überzeugen überzeugte überzeugt ' +
        'untersuche untersuchst untersucht untersuchen untersuchte untersucht ' +
        'verändere veränderst verändert verändern veränderte verändert verlasse ' +
        'verlässt verlassen verließ verlassen vergleiche vergleicht vergleichen ' +
        'verglich verglichen verhindere verhinderst verhindert verhindern ' +
        'verhinderte verhindert verkaufe verkauft verkaufen verliere verlierst ' +
        'verliert verlieren verlor verloren vermittle vermittelst vermittelt ' +
        'vermitteln vermittelte vermittelt vermeide vermeidest vermeidet ' +
        'vermeiden vermied vermieden verrät verrätst verraten verriet verraten ' +
        'versuche versucht versuchen versuchte versucht verteidige verteidigst ' +
        'verteidigt verteidigen verteidigte verteidigt verteile verteilst ' +
        'verteilt verteilen verteilte verteilt vertraue vertraust vertraut ' +
        'vertrauen vertraute vertraut verwandle verwandelst verwandelt verwandeln ' +
        'verwandelte verwandelt verwende verwendest verwendet verwenden ' +
        'verwendete verwendet verursache verursachst verursacht verursachen ' +
        'verursachte verursacht verwirkliche verwirklichst verwirklicht ' +
        'verwirklichen verwirklichte verwirklicht vorschlage vorschlägst ' +
        'vorschlägt vorschlagen schlug vor vorgeschlagen vorstelle vorstellst ' +
        'vorstellt vorstellen stellte vor vorgestellt wachse wächst wachsen ' +
        'wuchs gewachsen wähle wähst wählt wählen wählte gewählt wandere ' +
        'wanderst wandert wandern wanderte gewandert wasche wäschst wäscht ' +
        'waschen wusch gewaschen wechsle wechselst wechselt wechseln wechselte ' +
        'gewechselt werfe wirfst wirft werfen warf geworfen werde wirst werden ' +
        'wurde geworden wickle wickelst wickelt wickeln wickelte gewickelt ' +
        'wiederhole wiederholst wiederholt wiederholen wiederholte wiederholt ' +
        'wisse weißt wissen wusste gewusst wohne wohnst wohnt wohnen wohnte ' +
        'gewohnt wundere wunderst wundert wundern wunderte gewundert wünsche ' +
        'wünschst wünscht wünschen wünschte gewünscht zeuge zeugst zeugt zeugen ' +
        'zeugte gezeugt zähle zählst zählt zählen zählte gezählt zwinge zwingst ' +
        'zwingt zwingen zwang gezwungen ' +
        // ---- additional adjectives (lowercase) ----
        'eckig rund oval viereckig dreieckig kreisförmig kugelförmig würfelförmig ' +
        'zylindrisch konisch flach gewölbt konkav konvex spitz stumpf rutschfest ' +
        'klebrig flüssig gasförmig elastisch spröde zäh zähflüssig dickflüssig ' +
        'dünnflüssig trüb transparent durchsichtig undurchsichtig opak leuchtend ' +
        'glänzend matt glitzernd funkelnd schimmernd irisierend einfarbig ' +
        'mehrfarbig gestreift gepunktet kariert gemustert mutig feige neugierig ' +
        'gleichgültig zufrieden unzufrieden stolz bescheiden egoistisch selbstlos ' +
        'humorvoll ernsthaft charmant sympathisch unsympathisch eifersüchtig ' +
        'nostalgisch optimistisch pessimistisch realistisch idealistisch ' +
        'pragmatisch theoretisch praktisch abstrakt konkret kreativ einfallslos ' +
        'originell banal außergewöhnlich ungewöhnlich typisch atypisch auffällig ' +
        'unauffällig sichtbar unsichtbar spürbar fühlbar hörbar lesbar ' +
        'verständlich unverständlich erklärbar lösbar machbar real fiktiv ' +
        'authentisch echt unecht original bekannt unbeliebt populär unpopulär ' +
        'berühmt ' +
        // ---- additional adverbs (lowercase) ----
        'irgendwo irgendwann irgendwie irgendwer irgendwas irgendjemand ' +
        'andauernd fortwährend ständig unaufhörlich pausenlos dauerhaft ' +
        'vorübergehend zeitweise gelegentlich fallweise notfalls ' +
        'erforderlichenfalls nötigenfalls gegebenenfalls glücklicherweise ' +
        'bedauerlicherweise erfreulicherweise interessanterweise ' +
        'merkwürdigerweise seltsamerweise bekanntermaßen erwartungsgemäß ' +
        'wie erwartet wie vorgesehen wie geplant wie gewohnt wie üblich wie ' +
        'immer wie gehabt wie gesagt wie erwähnt wie bekannt stattdessen ' +
        'hingegen andererseits einerseits zunächst anschließend schließlich ' +
        'zuletzt zudem ferner des Weiteren darüber hinaus nicht nur sondern ' +
        'auch sowohl als auch entweder oder weder noch je desto umso ' +
        'solchermaßen derart dergestalt somit folglich demnach mithin ' +
        'deswegen deshalb trotzdem dennoch außerdem obendrein gleichwohl ' +
        // ---- additional common nouns (capitalised): weather / astronomy / misc ----
        'Wetterbericht Wettervorhersage Prognose Vorhersage Voraussage ' +
        'Wetterlage Kaltfront Warmfront Tiefdruckgebiet Hochdruckgebiet ' +
        'Luftdruck Luftfeuchtigkeit Temperatur Grad Celsius Fahrenheit Kelvin ' +
        'Niederschlag Hagel Graupel Nebel Tau Reif Gewitter Donner Blitz ' +
        'Windböe Windstille Brise Monsun Passatwind Föhn Luftströmung Strömung ' +
        'Wolkenbildung Wolkenbruch Starkregen Dauerregen Schneeregen Schneefall ' +
        'Schneedecke Schneemann Schneeball Eisdecke Eisberg Eisfläche Eisbahn ' +
        'Schlittschuh Snowboard Schlitten Rodel Bob Sonnenschein Sonnenaufgang ' +
        'Sonnenuntergang Sonnenstrahl Sonnenbrand Sonnenbrille Sonnencreme ' +
        'Sonnenlicht Mondlicht Vollmond Neumond Halbmond Sternzeichen ' +
        'Tierkreiszeichen Sternbild Sternschnuppe Galaxie Sonnensystem Merkur ' +
        'Venus Mars Jupiter Saturn Uranus Neptun Pluto Flamme Funke Asche ' +
        'Rauch Glut Brand Brandstiftung Feuerwehr Feuerlöscher Feuermelder ' +
        'Feueralarm Brandschutz ' +
        // ---- additional common verbs (lowercase) ----
        'denken vergessen erinnern lernen lehren unterrichten prüfen testen ' +
        'wiederholen üben trainieren vergleichen unterscheiden erkennen ' +
        'identifizieren bestimmen klassifizieren ordnen sortieren gruppieren ' +
        'einteilen unterteilen sammeln aufbewahren lagern aufheben behalten ' +
        'verlieren finden suchen entdecken erfinden entwickeln erstellen ' +
        'erzeugen produzieren herstellen bauen konstruieren entwerfen planen ' +
        'organisieren vorbereiten durchführen ausführen verändern ändern ' +
        'anpassen verbessern verschlechtern korrigieren reparieren ' +
        'instandsetzen restaurieren erneuern ersetzen austauschen wechseln ' +
        'umbauen umgestalten renovieren sanieren entscheiden wählen aussuchen ' +
        'festlegen feststellen ermitteln herausfinden klären lösen beantworten ' +
        'erklären beschreiben darstellen zusammenfassen wiedergeben berichten ' +
        'erzählen erwähnen nennen bezeichnen benennen kennzeichnen markieren ' +
        'betonen hervorheben unterstreichen pointieren argumentieren begründen ' +
        'beweisen belegen rechtfertigen verteidigen angreifen kritisieren ' +
        'loben tadeln schimpfen streiten diskutieren debattieren verhandeln ' +
        'zustimmen ablehnen verweigern akzeptieren annehmen zögern zaudern ' +
        // ---- final batch: assorted high-frequency words ----
        'nördlich südlich östlich westlich nordöstlich nordwestlich ' +
        'südöstlich südwestlich zentral peripher mittig innen außen oben ' +
        'unten vorn hinten links rechts geradeaus zurück vorwärts seitwärts ' +
        'bergauf bergab aufwärts abwärts einwärts auswärts heimwärts rückwärts ' +
        'hierhin dorthin irgendwohin nirgendwohin überallhin hierher dorther ' +
        'irgendwoher nirgendwoher überallher täglich wöchentlich monatlich ' +
        'jährlich stündlich minütlich sekündlich vorläufig provisorisch ' +
        'anfangs letztendlich hernach ' +
        // ---- common dative / plural noun forms (so func+Noun splits work) ----
        'Hause Häuser Miete Mieten Tage Monate Jahre Stunden Minuten Wochen ' +
        'Männer Frauen Kinder Leute Menschen Studenten Professoren Lehrer ' +
        'Schüler Häuser Zimmer Autos Busse Bahnen Züge Straßen Städte Dörfer ' +
        'Länder Flüsse Berge Seen Meere Wälder Gärten Bäume Blumen Bücher ' +
        'Worte Wörter Sätze Seiten Kapitel Briefe emails Fragen Antworten ' +
        'Probleme Lösungen Beispiele Gründe Vorteile Nachteile Meinungen Ideen ' +
        'Informationen Daten Grafiken Kosten Preise Märkte Firmen Unternehmen ' +
        'Gesellschaften Kulturen Politiken Geschichten Techniken Wissenschaften ' +
        'Energien Augen Ohren Hände Füße Zähne Münder Nasen Köpfe Gesichter ' +
        'Arme Beine Schultern Finger Knie Mütter Väter Söhne Töchter Brüder ' +
        'Schwestern Eltern Freunde Bekannte Nachbarn Kollegen Gäste Kunden ' +
        // ---- additional real words to guard against false splits ----
        'inmitten derweil indessen unterdessen gleichwohl zurzeit dergestalt ' +
        'innewohnen innehalten innehaben vormalig ehemals vordem vorab vorweg ' +
        'voran vorwärts nachträglich nachherig nachfolgend derzeitig ' +
        'gegenwärtig augenblicklich momentan ehedem obendrein beizeiten ' +
        'unterwegs unterwegs derweilen indes desungeachtet nichtsdestotrotz ' +
        'mitunter obgleich obschon wenngleich gleichviel wohingegen indes ' +
        'dahingegen hingegen andernfalls allenfalls notgedrungen notgedrungen ' +
        'schlichtweg schlichtweg kurzerhand schier schlechthin geradezu ' +
        'geradezu geradewegs geradeaus schlechthin schlechthin schlechthin'
    );
    _DE_DICT = new Set(words.trim().split(/\s+/));
    return _DE_DICT;
}

/* ===========================================================================
 * 3. spellCheckGermanText — line-aware spell check (skips translations)
 * ========================================================================= */
function spellCheckGermanText(text) {
    if (!text) return text;
    var dict = getDeDict();

    var lines = text.split('\n');
    var result = lines.map(function (line) {
        if (isChineseLine(line)) return line; // Don't spell-check Chinese translations

        // Tokenize German words (incl. umlauts / ß, apostrophes, hyphens).
        return line.replace(/[A-Za-zÄÖÜäöüß][A-Za-zÄÖÜäöüß'\-]*/g, function (word) {
            return spellCheckGermanWord(word, dict);
        });
    });
    return result.join('\n');
}

/* ===========================================================================
 * 4. spellCheckGermanWord — check a single token
 * ========================================================================= */
function spellCheckGermanWord(word, dict) {
    if (!word) return word;
    dict = dict || getDeDict();

    // Words already known are never split (covers compounds like "Kraftwerk"
    // as well as regular inflected forms that live in the dictionary).
    if (deInDict(word, dict)) return word;

    // Don't touch very short tokens (1-3 chars) — likely abbreviations or
    // valid short words.
    if (word.length <= 3) return word;

    // Don't touch tokens containing apostrophes or hyphens — they are
    // already compound/morphological forms (e.g. "geht's", "deutsch-englisch").
    if (word.indexOf("'") >= 0 || word.indexOf('-') >= 0) return word;

    // Try to split into known words. German is split CASE-SENSITIVELY so that
    // nouns keep their capitalisation; function words are still recognised
    // case-insensitively (sentence-initial "Der", "Und", ...).
    var bestSplit = findBestGermanSplit(word, dict);
    if (bestSplit && bestSplit.length >= 2) {
        return bestSplit.join(' ');
    }
    return word; // Can't split — leave as is (conservative)
}

/* ===========================================================================
 * 5. findBestGermanSplit — find the best way to split a concatenated token
 *
 * Strategy:
 *   - Try 2-way and 3-way splits where every part is a known word.
 *   - Score each candidate. A candidate is only acceptable if at least one
 *     part is a function word (case-insensitive). Splits where every part
 *     is a capitalized noun (compound word) are rejected.
 *   - Prefer the candidate that most looks like a missing-space artefact:
 *     a lowercase function word immediately followed by a capitalised word
 *     (e.g. "die"+"Miete").
 * ========================================================================= */
function findBestGermanSplit(word, dict) {
    dict = dict || getDeDict();
    var n = word.length;
    if (n < 4) return null; // Too short to split meaningfully

    var best = null;       // { parts:[...], score:Number }
    var bestScore = -Infinity;

    // --- 2-way splits -------------------------------------------------------
    for (var i = 2; i <= n - 2; i++) {
        var left = word.substring(0, i);
        var right = word.substring(i);
        if (!deInDict(left, dict) || !deInDict(right, dict)) continue;

        var parts = [left, right];
        var score = scoreGermanSplit(parts);
        if (score <= 0) continue; // rejected (no function word / compound)

        if (score > bestScore) {
            bestScore = score;
            best = { parts: parts, score: score };
        }
    }

    // --- 3-way splits -------------------------------------------------------
    if (n >= 6) {
        for (var i2 = 2; i2 <= n - 4; i2++) {
            var p1 = word.substring(0, i2);
            if (!deInDict(p1, dict)) continue;
            for (var j = i2 + 2; j <= n - 2; j++) {
                var p2 = word.substring(i2, j);
                var p3 = word.substring(j);
                if (!deInDict(p2, dict) || !deInDict(p3, dict)) continue;

                var parts3 = [p1, p2, p3];
                var score3 = scoreGermanSplit(parts3);
                if (score3 <= 0) continue;

                if (score3 > bestScore) {
                    bestScore = score3;
                    best = { parts: parts3, score: score3 };
                }
            }
        }
    }

    return best ? best.parts : null;
}

/* ===========================================================================
 * 6. Internal helpers
 * ========================================================================= */

/**
 * Membership test that is case-sensitive for nouns but case-insensitive for
 * function words (so sentence-initial "Der" / "Und" / "In" are recognised).
 */
function deInDict(word, dict) {
    dict = dict || getDeDict();
    if (!word) return false;
    if (dict.has(word)) return true;
    // Function words legitimately appear capitalised at the start of a
    // sentence — recognise them case-insensitively.
    if (DE_FUNCTION_WORDS.has(word.toLowerCase())) return true;
    return false;
}

/** True for an uppercase-initial token that is NOT a function word. */
function deIsNoun(word) {
    if (!word) return false;
    var first = word.charAt(0);
    var isCap = (first >= 'A' && first <= 'Z') ||
                first === 'Ä' || first === 'Ö' || first === 'Ü';
    if (!isCap) return false;
    // "Der"/"Und"/"In" at sentence start are function words, not nouns.
    if (DE_FUNCTION_WORDS.has(word.toLowerCase())) return false;
    return true;
}

function deIsFunctionWord(word) {
    if (!word) return false;
    return DE_FUNCTION_WORDS.has(word.toLowerCase());
}

/**
 * Score a candidate split. Returns <= 0 to reject, > 0 to accept (higher
 * is better). Acceptance requires at least one function word; pure
 * noun+noun compounds are rejected.
 */
function scoreGermanSplit(parts) {
    var hasFunc = false;
    var nounCount = 0;
    var score = 0;

    for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        var isFunc = deIsFunctionWord(p);
        var isNoun = deIsNoun(p);

        if (isFunc) {
            hasFunc = true;
            score += 30;                       // function word involved
        } else if (isNoun) {
            nounCount++;
            score += 6;                        // content noun
        } else {
            score += 8;                        // other lower-case content word
        }
        // Mild length reward (prefers balanced, non-trivial parts) — capped.
        score += Math.min(p.length, 8);
    }

    // No function word anywhere -> too risky (likely a compound). Reject.
    if (!hasFunc) return -1000;

    // All parts capitalized nouns -> compound word (e.g. "AutoBus"). Reject.
    if (nounCount === parts.length) return -1000;

    // Strong "missing space" signal: a lowercase function word directly
    // followed by a capitalised word (e.g. "die"+"Miete", "und"+"Der").
    for (var k = 0; k < parts.length - 1; k++) {
        var a = parts[k];
        var b = parts[k + 1];
        var aLower = !(a.charAt(0) >= 'A' && a.charAt(0) <= 'Z') &&
                     a.charAt(0) !== 'Ä' && a.charAt(0) !== 'Ö' && a.charAt(0) !== 'Ü';
        var bCap = deIsNoun(b);
        if (deIsFunctionWord(a) && aLower && bCap) {
            score += 25;
        }
    }

    return score;
}

/* ===========================================================================
 * 7. Exports (browser global + CommonJS)
 * ========================================================================= */
if (typeof window !== 'undefined') {
    window.DE_FUNCTION_WORDS = DE_FUNCTION_WORDS;
    window.getDeDict = getDeDict;
    window.spellCheckGermanText = spellCheckGermanText;
    window.spellCheckGermanWord = spellCheckGermanWord;
    window.findBestGermanSplit = findBestGermanSplit;
    window.deInDict = deInDict;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DE_FUNCTION_WORDS: DE_FUNCTION_WORDS,
        getDeDict: getDeDict,
        spellCheckGermanText: spellCheckGermanText,
        spellCheckGermanWord: spellCheckGermanWord,
        findBestGermanSplit: findBestGermanSplit,
        deInDict: deInDict,
        isChineseLine: typeof isChineseLine === 'function' ? isChineseLine : null
    };
}
