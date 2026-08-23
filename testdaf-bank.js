/**
 * TestDaF (德福) Oral Exam Question Bank
 * Based on "德福考前必备 口语" (徐立华编著)
 * 10 Modelltests, each with 7 Aufgaben
 */

var TESTDAF_TASK_TYPES = [
    { num: 1, type: 'Telefonieren', desc: '电话咨询', level: 'TDN 3', formality: 'formell', prepTime: 30, speakTime: 60 },
    { num: 2, type: 'Informieren', desc: '信息表达', level: 'TDN 3', formality: 'informell', prepTime: 60, speakTime: 60 },
    { num: 3, type: 'Grafikbeschreibung', desc: '图表描述', level: 'TDN 4', formality: 'formell', prepTime: 60, speakTime: 120 },
    { num: 4, type: 'Argumentieren', desc: '观点论证', level: 'TDN 5', formality: 'formell', prepTime: 180, speakTime: 120 },
    { num: 5, type: 'Ratschlag geben', desc: '建议给朋友', level: 'TDN 3', formality: 'informell', prepTime: 60, speakTime: 90 },
    { num: 6, type: 'Vortrag halten', desc: '图表论述', level: 'TDN 5', formality: 'formell', prepTime: 120, speakTime: 120 },
    { num: 7, type: 'Stellung nehmen', desc: '表态建议', level: 'TDN 3', formality: 'informell', prepTime: 30, speakTime: 60 },
];

var TESTDAF_BANK = {

    1: {
        title: 'Modelltest 1',
        tasks: {
            1: {
                title: 'Aufgabe 1',
                type: 'Telefonieren',
                desc: '电话咨询',
                situation: 'Sie haben eine Jobchance für den Vormittag gefunden. Aber vormittags sollten Sie Ihren Deutschkurs besuchen, deshalb rufen Sie beim akademischen Auslandsamt an, um nachzufragen, ob es noch alternative Deutschkurse am Nachmittag gibt.',
                requirements: 'Stellen Sie sich vor.\nSagen Sie, warum Sie anrufen.\nFragen Sie nach Einzelheiten zu den Formalitäten.',
                prepTime: 30,
                speakTime: 60,
                level: 'TDN 3',
                formality: 'formell'
            },
            2: {
                title: 'Aufgabe 2',
                type: 'Informieren',
                desc: '信息表达',
                situation: 'Bei einer Einführungsveranstaltung an der Uni treffen Sie den Kommilitonen Hans, einen älteren Studenten. Er ist schon 28 Jahre alt und schreibt bald seine Abschlussarbeit. Er interessiert sich für Studienmöglichkeiten in Ihrer Heimat und fragt Sie danach.',
                requirements: 'Erklären Sie Hans, welche Studienmöglichkeiten es in Ihrem Heimatland gibt;\nwelche Abschlussprüfungen es gibt;\nwie das Studium finanziert wird.',
                prepTime: 60,
                speakTime: 60,
                level: 'TDN 3',
                formality: 'informell'
            },
            3: {
                title: 'Aufgabe 3',
                type: 'Grafikbeschreibung',
                desc: '图表描述',
                situation: 'In Ihrem Landeskundekurs geht es heute um die Wohnungssituation von deutschen Familien. Ihr Dozent hat eine Grafik ausgeteilt, die die monatliche Miete nach Familientyp darstellt.',
                requirements: 'Beschreiben Sie die Grafik.',
                prepTime: 60,
                speakTime: 120,
                level: 'TDN 4',
                formality: 'formell'
            },
            4: {
                title: 'Aufgabe 4',
                type: 'Argumentieren',
                desc: '观点论证',
                situation: 'In Ihrem pädagogischen Seminar diskutieren Sie über den Sprachlernprozess von Ausländern. Ein Kommilitone meint, dass viele ausländische Studenten zu viel Zeit für das Deutschlernen aufwenden. Die Ausländer könnten doch auch während der Studienzeit Fachdeutschkenntnisse erwerben.',
                requirements: 'Wägen Sie Vorteile und Nachteile ab.\nBegründen Sie Ihre eigene Meinung.',
                prepTime: 180,
                speakTime: 120,
                level: 'TDN 5',
                formality: 'formell'
            },
            5: {
                title: 'Aufgabe 5',
                type: 'Ratschlag geben',
                desc: '建议给朋友',
                situation: 'Ihre Freundin Anna hat in diesem Semester das Fach Europäische Geschichte belegt. Für den Schein kann sie entweder innerhalb von zwei Wochen eine Seminararbeit verfassen oder eine Klausur nach den Ferien schreiben.',
                requirements: 'Sagen Sie Anna, was Sie an ihrer Stelle tun würden.\nBegründen Sie Ihre Meinung.',
                prepTime: 60,
                speakTime: 90,
                level: 'TDN 3',
                formality: 'informell'
            },
            6: {
                title: 'Aufgabe 6',
                type: 'Vortrag halten',
                desc: '图表论述',
                situation: 'In Ihrem Soziologieseminar diskutieren Sie heute über den weltweiten Absatz von Flaschenwasser. Ihr Dozent hat eine Grafik ausgeteilt, die die Entwicklung des weltweiten Verkaufs von Flaschenwasser zeigt.',
                requirements: 'Nennen Sie Gründe für die dargestellte Entwicklung.\nStellen Sie dar, welche Folgen Sie für die Zukunft sehen.',
                prepTime: 120,
                speakTime: 120,
                level: 'TDN 5',
                formality: 'formell'
            },
            7: {
                title: 'Aufgabe 7',
                type: 'Stellung nehmen',
                desc: '表态建议',
                situation: 'Ihr Freund Markus möchte in der Freizeit etwas lesen, weiß aber nicht, was er abonnieren soll: eine Wochenzeitschrift mit vielen internationalen Kommentaren oder eine lokale Tageszeitung. Er braucht Ihren Rat.',
                requirements: 'Sagen Sie Markus, wozu Sie ihm raten.\nBegründen Sie Ihre Meinung.',
                prepTime: 30,
                speakTime: 60,
                level: 'TDN 3',
                formality: 'informell'
            }
        }
    },

    2: {
        title: 'Modelltest 2',
        tasks: {
            1: {
                title: 'Aufgabe 1',
                type: 'Telefonieren',
                desc: '电话咨询',
                situation: 'Ihre Universität veranstaltet eine Exkursion für Geologiestudenten nach Marokko. Sie möchten an dieser Exkursion teilnehmen und rufen beim Sekretariat an.',
                requirements: 'Stellen Sie sich vor.\nSagen Sie, warum Sie anrufen.\nFragen Sie nach Einzelheiten zu den Formalitäten.',
                prepTime: 30,
                speakTime: 60,
                level: 'TDN 3',
                formality: 'formell'
            },
            2: {
                title: 'Aufgabe 2',
                type: 'Informieren',
                desc: '信息表达',
                situation: 'Ihr Freund Thomas möchte am Karnevalsumzug in Köln teilnehmen und hat sich gut verkleidet. Er interessiert sich für die Feiertage in Ihrer Heimat und fragt Sie danach.',
                requirements: 'Erklären Sie Thomas, ob in Ihrem Heimatland ein solches Kostümfest gibt;\nwie man sich verkleidet;\nwie die Stimmung dabei ist.',
                prepTime: 60,
                speakTime: 60,
                level: 'TDN 3',
                formality: 'informell'
            },
            3: {
                title: 'Aufgabe 3',
                type: 'Grafikbeschreibung',
                desc: '图表描述',
                situation: 'In Ihrem Landeskundekurs geht es heute um die Verkehrsmittelnutzung bei Urlaubsreisen. Ihr Dozent hat eine Grafik ausgeteilt, die die Nutzung verschiedener Verkehrsmittel bei Urlaubsreisen der Jahre 1998 und 2008 vergleicht.',
                requirements: 'Beschreiben Sie die Grafik.',
                prepTime: 60,
                speakTime: 120,
                level: 'TDN 4',
                formality: 'formell'
            },
            4: {
                title: 'Aufgabe 4',
                type: 'Argumentieren',
                desc: '观点论证',
                situation: 'Dieses Semester sind viele gefragte Vorlesungen schon überfüllt. Manche Kursteilnehmer können dem Professor schwer folgen. Deshalb hat Ihre Uni geplant, dass diese Vorlesungen gleichzeitig über das Internet übertragen werden.',
                requirements: 'Wägen Sie Vorteile und Nachteile ab.\nBegründen Sie Ihre eigene Meinung.',
                prepTime: 180,
                speakTime: 120,
                level: 'TDN 5',
                formality: 'formell'
            },
            5: {
                title: 'Aufgabe 5',
                type: 'Ratschlag geben',
                desc: '建议给朋友',
                situation: 'Ihr Freund Peter arbeitet als Tutor am Campus. Die Arbeit macht ihm Spaß, aber seine Noten werden immer schlechter. Er überlegt, den Job aufzugeben.',
                requirements: 'Sagen Sie Peter, was Sie an seiner Stelle tun würden.\nBegründen Sie Ihre Meinung.',
                prepTime: 60,
                speakTime: 90,
                level: 'TDN 3',
                formality: 'informell'
            },
            6: {
                title: 'Aufgabe 6',
                type: 'Vortrag halten',
                desc: '图表论述',
                situation: 'In Ihrem Soziologieseminar diskutieren Sie heute über die Entwicklung des Tourismus in Europa. Ihr Dozent hat eine Grafik ausgeteilt, die die Anzahl der nach Europa ankommenden Reisenden (in Millionen) von 1950 bis 2020 zeigt.',
                requirements: 'Nennen Sie Gründe für die dargestellte Entwicklung.\nStellen Sie dar, welche Folgen Sie für die Zukunft sehen.',
                prepTime: 120,
                speakTime: 120,
                level: 'TDN 5',
                formality: 'formell'
            },
            7: {
                title: 'Aufgabe 7',
                type: 'Stellung nehmen',
                desc: '表态建议',
                situation: 'Ihr Freund Alex bekommt eine Jobchance: Er soll eine Nebenrolle in einem Film spielen. Gerade schreibt er eine Seminararbeit über Schauspieler. Dieser Job dauert sechs Wochen während der Vorlesungszeit.',
                requirements: 'Sagen Sie Alex, wozu Sie ihm raten.\nBegründen Sie Ihre Meinung.',
                prepTime: 30,
                speakTime: 60,
                level: 'TDN 3',
                formality: 'informell'
            }
        }
    },

    3: {
        title: 'Modelltest 3',
        tasks: {
            1: {
                title: 'Aufgabe 1',
                type: 'Telefonieren',
                desc: '电话咨询',
                situation: 'Sie haben gerade Ihre Universität gewechselt und müssen nach Berlin umziehen. Sie brauchen günstige Tickets für Verkehrsmittel, z. B. für Bus oder für S-Bahn. Deshalb rufen Sie das Verkehrsbüro der Stadt an.',
                requirements: 'Stellen Sie sich vor.\nSagen Sie, warum Sie anrufen.\nFragen Sie nach Einzelheiten zu den Formalitäten.',
                prepTime: 30,
                speakTime: 60,
                level: 'TDN 3',
                formality: 'formell'
            },
            2: {
                title: 'Aufgabe 2',
                type: 'Informieren',
                desc: '信息表达',
                situation: 'Ihr Freund Ben ist schon verheiratet und hat bereits zwei Kinder. Seine Frau muss arbeiten, solange Ben noch studieren muss. Er fragt Sie nach der Heiratssituation in Ihrer Heimat.',
                requirements: 'Erklären Sie Ben, mit welchem Alter die Leute in Ihrer Heimat heiraten;\nob und wie sie ihre Karriere planen;\nwie die Rolle der Frau in Ihrer Kultur ist.',
                prepTime: 60,
                speakTime: 60,
                level: 'TDN 3',
                formality: 'informell'
            },
            3: {
                title: 'Aufgabe 3',
                type: 'Grafikbeschreibung',
                desc: '图表描述',
                situation: 'In Ihrem Landeskundekurs geht es heute um den Energieverbrauch in Deutschland. Ihr Dozent hat eine Grafik ausgeteilt, die den wahrgenommenen und den tatsächlichen Energieverbrauch in deutschen Haushalten gegenüberstellt.',
                requirements: 'Beschreiben Sie die Grafik.',
                prepTime: 60,
                speakTime: 120,
                level: 'TDN 4',
                formality: 'formell'
            },
            4: {
                title: 'Aufgabe 4',
                type: 'Argumentieren',
                desc: '观点论证',
                situation: 'In Ihrem pädagogischen Seminar diskutieren Sie über den Wandel von Bildung. Mit dem digitalen Zeitalter werden immer seltener Papier und Stifte beim Lernen benutzt. Deshalb schlagen manche Kommilitonen vor, dass die Schüler sich mit Laptops ausstatten sollten.',
                requirements: 'Wägen Sie Vorteile und Nachteile ab.\nBegründen Sie Ihre eigene Meinung.',
                prepTime: 180,
                speakTime: 120,
                level: 'TDN 5',
                formality: 'formell'
            },
            5: {
                title: 'Aufgabe 5',
                type: 'Ratschlag geben',
                desc: '建议给朋友',
                situation: 'Ihr Freund Klaus hat jetzt sein Studium abgeschlossen. Während der Studienzeit hatte er schon einen Nebenjob. Er könnte nach dem Abschluss diesen Job weiterhin ausüben und viel Geld verdienen. Aber er möchte eine Arbeitsstelle suchen, die seinen Fachkenntnissen entspricht.',
                requirements: 'Sagen Sie Klaus, was Sie an seiner Stelle tun würden.\nBegründen Sie Ihre Meinung.',
                prepTime: 60,
                speakTime: 90,
                level: 'TDN 3',
                formality: 'informell'
            },
            6: {
                title: 'Aufgabe 6',
                type: 'Vortrag halten',
                desc: '图表论述',
                situation: 'In Ihrem Seminar geht es heute um die Entwicklung der Anzahl der Studienberechtigten in Deutschland. Ihr Dozent hat eine Grafik ausgeteilt, die den Anteil der 18- bis 25-jährigen Studienberechtigten in Deutschland von 1980 bis 2008 zeigt.',
                requirements: 'Nennen Sie Gründe für die dargestellte Entwicklung.\nStellen Sie dar, welche Folgen Sie für die Zukunft sehen.',
                prepTime: 120,
                speakTime: 120,
                level: 'TDN 5',
                formality: 'formell'
            },
            7: {
                title: 'Aufgabe 7',
                type: 'Stellung nehmen',
                desc: '表态建议',
                situation: 'Ihre Freundin Julia studiert Russisch und Geschichte. In den Semesterferien möchte sie ihre Brieffreundin in Russland besuchen, um ihre Sprachkenntnisse zu verbessern. Aber ihre Eltern möchten mit ihr in Rom Urlaub machen.',
                requirements: 'Sagen Sie Julia, wozu Sie ihr raten.\nBegründen Sie Ihre Meinung.',
                prepTime: 30,
                speakTime: 60,
                level: 'TDN 3',
                formality: 'informell'
            }
        }
    },

    4: {
        title: 'Modelltest 4',
        tasks: {
            1: {
                title: 'Aufgabe 1',
                type: 'Telefonieren',
                desc: '电话咨询',
                situation: 'Ihre Universität organisiert ein Sportturnier und braucht einige Studenten als Aushilfen. Sie haben daran Interesse und rufen beim Studentenwerk an.',
                requirements: 'Stellen Sie sich vor.\nSagen Sie, warum Sie anrufen.\nFragen Sie nach Einzelheiten zu den Formalitäten.',
                prepTime: 30,
                speakTime: 60,
                level: 'TDN 3',
                formality: 'formell'
            },
            2: {
                title: 'Aufgabe 2',
                type: 'Informieren',
                desc: '信息表达',
                situation: 'Sie treffen Dirk, einen deutschen Freund, auf dem Weg zur Uni. Dirk fährt gern mit dem Fahrrad statt mit dem Bus. Er fragt Sie nach dem Radfahren in Ihrer Heimat.',
                requirements: 'Sagen Sie Dirk, wie viele Studenten in Ihrem Heimatland mit dem Rad zur Uni fahren;\nwie viel ein Fahrrad kostet;\nob das Radfahren sicher ist.',
                prepTime: 60,
                speakTime: 60,
                level: 'TDN 3',
                formality: 'informell'
            },
            3: {
                title: 'Aufgabe 3',
                type: 'Grafikbeschreibung',
                desc: '图表描述',
                situation: 'In Ihrem Seminar sprechen Sie über das Thema Rauchen bei Jugendlichen. Ihr Dozent hat eine Grafik ausgeteilt, die das Rauchverhalten von Jugendlichen nach Schulform in den Jahren 2001 bis 2008 darstellt.',
                requirements: 'Beschreiben Sie die Grafik.',
                prepTime: 60,
                speakTime: 120,
                level: 'TDN 4',
                formality: 'formell'
            },
            4: {
                title: 'Aufgabe 4',
                type: 'Argumentieren',
                desc: '观点论证',
                situation: 'Seit Jahrzehnten studieren immer mehr Ausländer in Deutschland. Aber viele davon haben noch sprachliche Schwierigkeiten in den Vorlesungen. Ein Kommilitone schlägt vor, dass die ausländischen Studenten vor dem Fachstudium einen Deutschkurs besuchen sollen.',
                requirements: 'Wägen Sie Vorteile und Nachteile ab.\nBegründen Sie Ihre eigene Meinung.',
                prepTime: 180,
                speakTime: 120,
                level: 'TDN 5',
                formality: 'formell'
            },
            5: {
                title: 'Aufgabe 5',
                type: 'Ratschlag geben',
                desc: '建议给朋友',
                situation: 'Ihre Freundin Susanne arbeitet schon drei Jahre als Lehrerin an einer Realschule. Neuerdings hat sie die Chance erhalten, bei einem Biologie-Professor an der Uni mitzuarbeiten.',
                requirements: 'Sagen Sie Susanne, was Sie an ihrer Stelle tun würden.\nBegründen Sie Ihre Meinung.',
                prepTime: 60,
                speakTime: 90,
                level: 'TDN 3',
                formality: 'informell'
            },
            6: {
                title: 'Aufgabe 6',
                type: 'Vortrag halten',
                desc: '图表论述',
                situation: 'In Ihrem Soziologieseminar befasst man sich heute mit dem Thema der Arbeitssituation von Jugendlichen. Ihr Dozent hat eine Grafik ausgeteilt, die die Arbeitssituation von Jugendlichen unter 30 Jahren darstellt.',
                requirements: 'Nennen Sie Gründe für die dargestellte Entwicklung.\nStellen Sie dar, welche Folgen Sie für die Zukunft sehen.',
                prepTime: 120,
                speakTime: 120,
                level: 'TDN 5',
                formality: 'formell'
            },
            7: {
                title: 'Aufgabe 7',
                type: 'Stellung nehmen',
                desc: '表态建议',
                situation: 'Ihr Freund Martin hat im Lotto 5000 Euro gewonnen. Er erzählt Ihnen, dass er neue Möbel für sein Zimmer im Studentenwohnheim kaufen möchte. Dafür müsste er aber sein ganzes Erspartes ausgeben.',
                requirements: 'Sagen Sie Martin, wozu Sie ihm raten.\nBegründen Sie Ihre Meinung.',
                prepTime: 30,
                speakTime: 60,
                level: 'TDN 3',
                formality: 'informell'
            }
        }
    },

    5: {
        title: 'Modelltest 5',
        tasks: {
            1: {
                title: 'Aufgabe 1',
                type: 'Telefonieren',
                desc: '电话咨询',
                situation: 'Sie sind gerade ins Studentenwohnheim eingezogen und möchten Ihren Laptop ans Internet anschließen. Sie wissen nicht, wie das geht, und rufen beim Studentenwerk an.',
                requirements: 'Stellen Sie sich vor.\nSagen Sie, warum Sie anrufen.\nFragen Sie nach Einzelheiten zu den Formalitäten.',
                prepTime: 30,
                speakTime: 60,
                level: 'TDN 3',
                formality: 'formell'
            },
            2: {
                title: 'Aufgabe 2',
                type: 'Informieren',
                desc: '信息表达',
                situation: 'Sie haben mit Ihrer Freundin Simona einen Film über europäische Kultur und Sitten gesehen. Simona interessiert sich für das höfliche Benehmen in Ihrer Heimat.',
                requirements: 'Erklären Sie Simona, wie man sich bei Ihnen höflich verhält;\nwelche Begrüßungsformen es gibt;\nwelche Tischsitten gelten.',
                prepTime: 60,
                speakTime: 60,
                level: 'TDN 3',
                formality: 'informell'
            },
            3: {
                title: 'Aufgabe 3',
                type: 'Grafikbeschreibung',
                desc: '图表描述',
                situation: 'In Ihrem Landeskundekurs geht es heute um das Auslandsstudium deutscher Studenten. Ihr Dozent hat eine Grafik ausgeteilt, die die Anzahl der deutschen Studierenden im Ausland von 1996 bis 2010 darstellt.',
                requirements: 'Beschreiben Sie die Grafik.',
                prepTime: 60,
                speakTime: 120,
                level: 'TDN 4',
                formality: 'formell'
            },
            4: {
                title: 'Aufgabe 4',
                type: 'Argumentieren',
                desc: '观点论证',
                situation: 'Immer mehr Firmen wollen ihre Mitarbeiter motivieren. Aber wie kann man die Arbeitskompetenz beurteilen? Dazu sind die Kriterien noch umstritten. Ein Kommilitone schlägt vor, dass das Verkaufspersonal nur nach Umsatzleistung entlohnt werden soll.',
                requirements: 'Wägen Sie Vorteile und Nachteile ab.\nBegründen Sie Ihre eigene Meinung.',
                prepTime: 180,
                speakTime: 120,
                level: 'TDN 5',
                formality: 'formell'
            },
            5: {
                title: 'Aufgabe 5',
                type: 'Ratschlag geben',
                desc: '建议给朋友',
                situation: 'Ihr Freund Alex hat neulich ein Vortragsthema durch Verlosung erhalten. Dieses Thema hat er im letzten Semester schon mit seinen Kommilitonen oft besprochen. Er überlegt, ob er ein neues Thema wählen soll.',
                requirements: 'Sagen Sie Alex, was Sie an seiner Stelle tun würden.\nBegründen Sie Ihre Meinung.',
                prepTime: 60,
                speakTime: 90,
                level: 'TDN 3',
                formality: 'informell'
            },
            6: {
                title: 'Aufgabe 6',
                type: 'Vortrag halten',
                desc: '图表论述',
                situation: 'In Ihrem Wirtschaftsseminar sprechen Sie über die Verbreitung von Online-Banking. Ihr Dozent hat eine Grafik ausgeteilt, die die Anzahl der Online-Konten in Deutschland (in Millionen) von 2006 bis 2011 zeigt.',
                requirements: 'Nennen Sie Gründe für die dargestellte Entwicklung.\nStellen Sie dar, welche Folgen Sie für die Zukunft sehen.',
                prepTime: 120,
                speakTime: 120,
                level: 'TDN 5',
                formality: 'formell'
            },
            7: {
                title: 'Aufgabe 7',
                type: 'Stellung nehmen',
                desc: '表态建议',
                situation: 'Ihr Freund Ole hat sich von seiner Freundin Kathrin getrennt. Aber er liebt sie noch sehr und kann seit einigen Tagen nicht gut schlafen. Er muss bald seine Abschlussprüfung schreiben.',
                requirements: 'Sagen Sie Ole, wozu Sie ihm raten.\nBegründen Sie Ihre Meinung.',
                prepTime: 30,
                speakTime: 60,
                level: 'TDN 3',
                formality: 'informell'
            }
        }
    },

    6: {
        title: 'Modelltest 6',
        tasks: {
            1: {
                title: 'Aufgabe 1',
                type: 'Telefonieren',
                desc: '电话咨询',
                situation: 'Sie studieren an einer deutschen Hochschule und wollen in Ihrer Freizeit eine Fremdsprache lernen. Sie wollen einen Online-Kurs der Uni besuchen und rufen beim Sprachzentrum an.',
                requirements: 'Stellen Sie sich vor.\nSagen Sie, warum Sie anrufen.\nFragen Sie nach Einzelheiten zu den Formalitäten.',
                prepTime: 30,
                speakTime: 60,
                level: 'TDN 3',
                formality: 'formell'
            },
            2: {
                title: 'Aufgabe 2',
                type: 'Informieren',
                desc: '信息表达',
                situation: 'Sie gehen zu den Informationstagen der Uni. Dort treffen Sie Ihren Freund Wolfgang. Er interessiert sich für die Studienwahl der Schulabgänger in Ihrer Heimat.',
                requirements: 'Erzählen Sie Wolfgang, welche Kriterien für junge Leute bei der Hochschulwahl wichtig sind;\nwelche Studienfächer beliebt sind;\nwie die Zulassung geregelt ist.',
                prepTime: 60,
                speakTime: 60,
                level: 'TDN 3',
                formality: 'informell'
            },
            3: {
                title: 'Aufgabe 3',
                type: 'Grafikbeschreibung',
                desc: '图表描述',
                situation: 'In Ihrem Landeskundekurs geht es heute um die Wohnsituation deutscher Studenten. Ihr Dozent hat eine Grafik ausgeteilt, die zeigt, wo Studenten in Deutschland wohnen und wie sie gerne wohnen möchten.',
                requirements: 'Beschreiben Sie die Grafik.',
                prepTime: 60,
                speakTime: 120,
                level: 'TDN 4',
                formality: 'formell'
            },
            4: {
                title: 'Aufgabe 4',
                type: 'Argumentieren',
                desc: '观点论证',
                situation: 'In vielen EU-Ländern wird gesetzlich geregelt, dass die Geschäfte an den Wochentagen spätestens um 22 Uhr schließen und an den Sonntagen sowie den Feiertagen geschlossen bleiben. Ein Kommilitone schlägt vor, dass diese Regelung auch in Deutschland gelten soll.',
                requirements: 'Wägen Sie Vorteile und Nachteile ab.\nBegründen Sie Ihre eigene Meinung.',
                prepTime: 180,
                speakTime: 120,
                level: 'TDN 5',
                formality: 'formell'
            },
            5: {
                title: 'Aufgabe 5',
                type: 'Ratschlag geben',
                desc: '建议给朋友',
                situation: 'Ihre Freundin Simone hat schon drei Jahre lang Geologie studiert und bekommt jetzt eine Exkursionschance in die Antarktis. Diese Forschungsreise findet im nächsten Semester statt, sodass Simone ein Urlaubssemester einlegen müsste.',
                requirements: 'Sagen Sie Simone, was Sie an ihrer Stelle tun würden.\nBegründen Sie Ihre Meinung.',
                prepTime: 60,
                speakTime: 90,
                level: 'TDN 3',
                formality: 'informell'
            },
            6: {
                title: 'Aufgabe 6',
                type: 'Vortrag halten',
                desc: '图表论述',
                situation: 'In Ihrem Seminar sprechen Sie heute über das Thema Übergewicht in Deutschland. Ihr Dozent hat eine Grafik ausgeteilt, die den Anteil von Frauen und Männern mit Übergewicht nach Alter in Deutschland im Jahr 2003 zeigt.',
                requirements: 'Nennen Sie Gründe für die dargestellte Entwicklung.\nStellen Sie dar, welche Folgen Sie für die Zukunft sehen.',
                prepTime: 120,
                speakTime: 120,
                level: 'TDN 5',
                formality: 'formell'
            },
            7: {
                title: 'Aufgabe 7',
                type: 'Stellung nehmen',
                desc: '表态建议',
                situation: 'Zum Semesterbeginn treffen Sie Ihren Freund Jürgen vor dem schwarzen Brett. Er möchte einen Computer kaufen und liest gerade eine Anzeige, auf der ein sehr günstiges Angebot steht. Er weiß nicht, ob er diesen Computer kaufen soll.',
                requirements: 'Sagen Sie Jürgen, wozu Sie ihm raten.\nBegründen Sie Ihre Meinung.',
                prepTime: 30,
                speakTime: 60,
                level: 'TDN 3',
                formality: 'informell'
            }
        }
    },

    7: {
        title: 'Modelltest 7',
        tasks: {
            1: {
                title: 'Aufgabe 1',
                type: 'Telefonieren',
                desc: '电话咨询',
                situation: 'Sie haben eine Jobchance für den Vormittag gefunden, aber vormittags haben Sie Deutschkurs. Sie rufen beim akademischen Auslandsamt an, um nachzufragen, ob es alternative Deutschkurse am Nachmittag gibt.',
                requirements: 'Stellen Sie sich vor.\nSagen Sie, warum Sie anrufen.\nFragen Sie nach Einzelheiten zu den Formalitäten.',
                prepTime: 30,
                speakTime: 60,
                level: 'TDN 3',
                formality: 'formell'
            },
            2: {
                title: 'Aufgabe 2',
                type: 'Informieren',
                desc: '信息表达',
                situation: 'Sie treffen Hans, einen älteren Studenten, der sich für Studienmöglichkeiten in Ihrer Heimat interessiert.',
                requirements: 'Erklären Sie Hans, welche Studienmöglichkeiten es in Ihrem Heimatland gibt;\nwelche Abschlussprüfungen es gibt;\nwie das Studium finanziert wird.',
                prepTime: 60,
                speakTime: 60,
                level: 'TDN 3',
                formality: 'informell'
            },
            3: {
                title: 'Aufgabe 3',
                type: 'Grafikbeschreibung',
                desc: '图表描述',
                situation: 'In Ihrem Landeskundekurs geht es heute um die Auswanderung deutscher Staatsbürger. Ihr Dozent hat eine Grafik ausgeteilt, die die Entwicklung der Anzahl deutscher Auswanderer seit 1991 darstellt.',
                requirements: 'Beschreiben Sie die Grafik.',
                prepTime: 60,
                speakTime: 120,
                level: 'TDN 4',
                formality: 'formell'
            },
            4: {
                title: 'Aufgabe 4',
                type: 'Argumentieren',
                desc: '观点论证',
                situation: 'Neue Untersuchungen haben ergeben, dass die Konzentrationsfähigkeit von Schülern täglich nach 10 Uhr morgens am höchsten ist. Deshalb schlägt ein Kommilitone vor, dass die Schulen erst um 10 Uhr beginnen sollten.',
                requirements: 'Wägen Sie Vorteile und Nachteile ab.\nBegründen Sie Ihre eigene Meinung.',
                prepTime: 180,
                speakTime: 120,
                level: 'TDN 5',
                formality: 'formell'
            },
            5: {
                title: 'Aufgabe 5',
                type: 'Ratschlag geben',
                desc: '建议给朋友',
                situation: 'Ein Freund von Ihrem Freund Jochen wird bald heiraten. Er hat Jochen zu seiner Hochzeit eingeladen. Aber an demselben Tag muss Jochen eine Prüfung nachholen. Es ist bereits die letzte Chance.',
                requirements: 'Sagen Sie Jochen, was Sie an seiner Stelle tun würden.\nBegründen Sie Ihre Meinung.',
                prepTime: 60,
                speakTime: 90,
                level: 'TDN 3',
                formality: 'informell'
            },
            6: {
                title: 'Aufgabe 6',
                type: 'Vortrag halten',
                desc: '图表论述',
                situation: 'In einem Seminar sprechen Sie heute über die Entwicklung der Atomenergie in Deutschland. Ihr Dozent hat eine Grafik ausgeteilt, die die Entwicklung der Kraftwerke in Deutschland von 1950 bis 2010 zeigt.',
                requirements: 'Nennen Sie Gründe für die dargestellte Entwicklung.\nStellen Sie dar, welche Folgen Sie für die Zukunft sehen.',
                prepTime: 120,
                speakTime: 120,
                level: 'TDN 5',
                formality: 'formell'
            },
            7: {
                title: 'Aufgabe 7',
                type: 'Stellung nehmen',
                desc: '表态建议',
                situation: 'Ihre Freundin Sabine lernt jetzt Französisch in einem Sprachkurs. Die Lehrbücher sind sehr teuer. Sie möchte die Bücher nicht kaufen, sondern in der Bibliothek ausleihen. Aber die Ausleihfrist ist zu kurz.',
                requirements: 'Sagen Sie Sabine, wozu Sie ihr raten.\nBegründen Sie Ihre Meinung.',
                prepTime: 30,
                speakTime: 60,
                level: 'TDN 3',
                formality: 'informell'
            }
        }
    },

    8: {
        title: 'Modelltest 8',
        tasks: {
            1: {
                title: 'Aufgabe 1',
                type: 'Telefonieren',
                desc: '电话咨询',
                situation: 'Sie studieren Maschinenbau an der Uni. Vor einigen Tagen haben Sie auf einem Aushang gelesen, dass das Studentenwerk einen Design-Wettbewerb für Studierende veranstaltet. Sie rufen beim Studentenwerk an.',
                requirements: 'Stellen Sie sich vor.\nSagen Sie, warum Sie anrufen.\nFragen Sie nach Einzelheiten zu den Formalitäten.',
                prepTime: 30,
                speakTime: 60,
                level: 'TDN 3',
                formality: 'formell'
            },
            2: {
                title: 'Aufgabe 2',
                type: 'Informieren',
                desc: '信息表达',
                situation: 'Ihr Freund Simon steht kurz vor dem Abschluss. Er bewirbt sich für Festanstellungen in großen Firmen. In der Küche unterhalten Sie sich über die Berufswahl. Er fragt Sie nach der Situation in Ihrem Heimatland.',
                requirements: 'Erklären Sie Simon, wann man in Ihrem Heimatland mit der Arbeitssuche beginnt;\nwelche Bewerbungsunterlagen wichtig sind;\nwie Vorstellungsgespräche ablaufen.',
                prepTime: 60,
                speakTime: 60,
                level: 'TDN 3',
                formality: 'informell'
            },
            3: {
                title: 'Aufgabe 3',
                type: 'Grafikbeschreibung',
                desc: '图表描述',
                situation: 'In Ihrem Seminar sprechen Sie über die Entwicklung des Frauenanteils im Lehrberuf. Ihr Dozent hat eine Grafik ausgeteilt, die den Anteil der Lehrerinnen in Allgemeinbildung von 1998 bis 2007 darstellt.',
                requirements: 'Beschreiben Sie die Grafik.',
                prepTime: 60,
                speakTime: 120,
                level: 'TDN 4',
                formality: 'formell'
            },
            4: {
                title: 'Aufgabe 4',
                type: 'Argumentieren',
                desc: '观点论证',
                situation: 'In Deutschland haben Bürger ab 18 Jahren das Wahlrecht. Viele Jugendliche können ihr politisches Bewusstsein schon früh in der Schule entwickeln. Ein Kommilitone schlägt vor, dass das Wahlalter auf 16 Jahre gesenkt werden soll.',
                requirements: 'Wägen Sie Vorteile und Nachteile ab.\nBegründen Sie Ihre eigene Meinung.',
                prepTime: 180,
                speakTime: 120,
                level: 'TDN 5',
                formality: 'formell'
            },
            5: {
                title: 'Aufgabe 5',
                type: 'Ratschlag geben',
                desc: '建议给朋友',
                situation: 'Ihre Freundin Jasmin ist schon verheiratet. Sie und ihr Mann studieren zusammen Medizin und leiden jetzt unter Geldmangel. Deshalb möchte Jasmin das Studium unterbrechen und arbeiten gehen.',
                requirements: 'Sagen Sie Jasmin, was Sie an ihrer Stelle tun würden.\nBegründen Sie Ihre Meinung.',
                prepTime: 60,
                speakTime: 90,
                level: 'TDN 3',
                formality: 'informell'
            },
            6: {
                title: 'Aufgabe 6',
                type: 'Vortrag halten',
                desc: '图表论述',
                situation: 'In einem Seminar sprechen Sie heute über das Phänomen Einwanderung in Deutschland. Ihr Dozent hat eine Grafik ausgeteilt, die die Verteilung der Einwanderer in Deutschland darstellt.',
                requirements: 'Nennen Sie Gründe für die dargestellte Entwicklung.\nStellen Sie dar, welche Folgen Sie für die Zukunft sehen.',
                prepTime: 120,
                speakTime: 120,
                level: 'TDN 5',
                formality: 'formell'
            },
            7: {
                title: 'Aufgabe 7',
                type: 'Stellung nehmen',
                desc: '表态建议',
                situation: 'Ihr Freund Steffen sollte einen DAAD-Stipendiaten aus Indien vom Bahnhof abholen. Er hat sich verspätet und ihn verpasst. Steffen hat von ihm auch keine Handynummer.',
                requirements: 'Sagen Sie Steffen, wozu Sie ihm raten.\nBegründen Sie Ihre Meinung.',
                prepTime: 30,
                speakTime: 60,
                level: 'TDN 3',
                formality: 'informell'
            }
        }
    },

    9: {
        title: 'Modelltest 9',
        tasks: {
            1: {
                title: 'Aufgabe 1',
                type: 'Telefonieren',
                desc: '电话咨询',
                situation: 'Ihre Hochschule organisiert ein Tutorprogramm, um den ausländischen Studienanfängern zu helfen. Sie interessieren sich dafür und rufen beim akademischen Auslandsamt an.',
                requirements: 'Stellen Sie sich vor.\nSagen Sie, warum Sie anrufen.\nFragen Sie nach Einzelheiten zu den Formalitäten.',
                prepTime: 30,
                speakTime: 60,
                level: 'TDN 3',
                formality: 'formell'
            },
            2: {
                title: 'Aufgabe 2',
                type: 'Informieren',
                desc: '信息表达',
                situation: 'Ihre Hochschule veranstaltet eine Party für die Neulinge. Ihr Freund Peter interessiert sich für die Situation der Auslandsstudenten aus Ihrer Heimat.',
                requirements: 'Erklären Sie Peter, wie ausländische Studenten in Ihrem Heimatland aufgenommen werden;\nwelche Schwierigkeiten sie haben;\nwelche Unterstützung sie bekommen.',
                prepTime: 60,
                speakTime: 60,
                level: 'TDN 3',
                formality: 'informell'
            },
            3: {
                title: 'Aufgabe 3',
                type: 'Grafikbeschreibung',
                desc: '图表描述',
                situation: 'In Ihrem Seminar sprechen Sie über die Beurteilung deutscher Unternehmen durch Studenten. Ihr Dozent hat eine Grafik ausgeteilt, die zeigt, wie Studenten die Wettbewerbsfähigkeit deutscher Unternehmen in den Jahren 2005 bis 2007 einschätzen.',
                requirements: 'Beschreiben Sie die Grafik.',
                prepTime: 60,
                speakTime: 120,
                level: 'TDN 4',
                formality: 'formell'
            },
            4: {
                title: 'Aufgabe 4',
                type: 'Argumentieren',
                desc: '观点论证',
                situation: 'In einer Veranstaltung der Universität wird darüber diskutiert, wie die Bibliothek Geld sparen kann. Ein Diskussionsteilnehmer schlägt vor, dass die Bibliothek nur noch E-Books anschaffen soll, keine gedruckten Bücher mehr.',
                requirements: 'Wägen Sie Vorteile und Nachteile ab.\nBegründen Sie Ihre eigene Meinung.',
                prepTime: 180,
                speakTime: 120,
                level: 'TDN 5',
                formality: 'formell'
            },
            5: {
                title: 'Aufgabe 5',
                type: 'Ratschlag geben',
                desc: '建议给朋友',
                situation: 'Ihr Freund Markus studiert Chemie. Er hat ein Seminar gefunden, das ein kompliziertes Computerprogramm in Bezug auf Chemie vorstellt. Er kann somit praktische Erfahrungen sammeln, aber das Seminar findet zur gleichen Zeit wie sein Hauptseminar statt.',
                requirements: 'Sagen Sie Markus, was Sie an seiner Stelle tun würden.\nBegründen Sie Ihre Meinung.',
                prepTime: 60,
                speakTime: 90,
                level: 'TDN 3',
                formality: 'informell'
            },
            6: {
                title: 'Aufgabe 6',
                type: 'Vortrag halten',
                desc: '图表论述',
                situation: 'In Ihrem Seminar wird das Thema der Erwerbstätigkeit von Frauen in Deutschland diskutiert. Ihr Dozent hat eine Grafik ausgeteilt, die die Erwerbstätigenquoten von Frauen darstellt.',
                requirements: 'Nennen Sie Gründe für die dargestellte Entwicklung.\nStellen Sie dar, welche Folgen Sie für die Zukunft sehen.',
                prepTime: 120,
                speakTime: 120,
                level: 'TDN 5',
                formality: 'formell'
            },
            7: {
                title: 'Aufgabe 7',
                type: 'Stellung nehmen',
                desc: '表态建议',
                situation: 'Ihre Freundin Heidi wohnt mit der ausländischen Studentin Elena aus Spanien zusammen. Elena möchte ihr Deutsch verbessern und spricht mit Heidi immer Deutsch. Aber Heidi lernt jetzt Spanisch und möchte sich mit Elena auf Spanisch unterhalten.',
                requirements: 'Sagen Sie Heidi, wozu Sie ihr raten.\nBegründen Sie Ihre Meinung.',
                prepTime: 30,
                speakTime: 60,
                level: 'TDN 3',
                formality: 'informell'
            }
        }
    },

    10: {
        title: 'Modelltest 10',
        tasks: {
            1: {
                title: 'Aufgabe 1',
                type: 'Telefonieren',
                desc: '电话咨询',
                situation: 'An Ihrer Hochschule findet bald ein Sommerfest statt. Sie sind Mitglied einer Jugendrockband und interessieren sich für eine Aufführungschance beim Sommerfest. Sie rufen beim Studentenwerk an.',
                requirements: 'Stellen Sie sich vor.\nSagen Sie, warum Sie anrufen.\nFragen Sie nach Einzelheiten zu den Formalitäten.',
                prepTime: 30,
                speakTime: 60,
                level: 'TDN 3',
                formality: 'formell'
            },
            2: {
                title: 'Aufgabe 2',
                type: 'Informieren',
                desc: '信息表达',
                situation: 'Sie treffen Ihre Freundin Susanne bei der Geburtstagsfeier eines Freundes. Susanne interessiert sich für solche Aktivitäten in Ihrer Heimat.',
                requirements: 'Sagen Sie Susanne, wie man in Ihrem Heimatland Geburtstage feiert;\nwelche Geschenke üblich sind;\nwelche Rolle die Familie dabei spielt.',
                prepTime: 60,
                speakTime: 60,
                level: 'TDN 3',
                formality: 'informell'
            },
            3: {
                title: 'Aufgabe 3',
                type: 'Grafikbeschreibung',
                desc: '图表描述',
                situation: 'In Ihrem Landeskundekurs geht es heute um die Ausgaben deutscher Studenten. Ihr Dozent hat eine Grafik ausgeteilt, die die Ausgaben der Studenten in Deutschland darstellt.',
                requirements: 'Beschreiben Sie die Grafik.',
                prepTime: 60,
                speakTime: 120,
                level: 'TDN 4',
                formality: 'formell'
            },
            4: {
                title: 'Aufgabe 4',
                type: 'Argumentieren',
                desc: '观点论证',
                situation: 'Zurzeit wollen viele Jugendliche auch an Privathochschulen in Deutschland studieren. Bei einer Diskussionsveranstaltung schlägt ein Kommilitone vor, dass alle Hochschulen privatisiert werden sollen.',
                requirements: 'Wägen Sie Vorteile und Nachteile ab.\nBegründen Sie Ihre eigene Meinung.',
                prepTime: 180,
                speakTime: 120,
                level: 'TDN 5',
                formality: 'formell'
            },
            5: {
                title: 'Aufgabe 5',
                type: 'Ratschlag geben',
                desc: '建议给朋友',
                situation: 'Ihre Freundin Sabine hat das Abitur gemacht und möchte Zahnmedizin studieren. Aber die Zulassungsvoraussetzungen für Medizin sind sehr hoch. Wenn sie nicht sofort einen Studienplatz bekommt, muss sie ein Jahr warten.',
                requirements: 'Sagen Sie Sabine, was Sie an ihrer Stelle tun würden.\nBegründen Sie Ihre Meinung.',
                prepTime: 60,
                speakTime: 90,
                level: 'TDN 3',
                formality: 'informell'
            },
            6: {
                title: 'Aufgabe 6',
                type: 'Vortrag halten',
                desc: '图表论述',
                situation: 'In Ihrem Seminar sprechen Sie heute über die Entwicklung von Naturkatastrophen weltweit. Ihr Dozent hat eine Grafik ausgeteilt, die die Anzahl der Naturkatastrophen pro Jahr in der Welt darstellt.',
                requirements: 'Nennen Sie Gründe für die dargestellte Entwicklung.\nStellen Sie dar, welche Folgen Sie für die Zukunft sehen.',
                prepTime: 120,
                speakTime: 120,
                level: 'TDN 5',
                formality: 'formell'
            },
            7: {
                title: 'Aufgabe 7',
                type: 'Stellung nehmen',
                desc: '表态建议',
                situation: 'Ihr Freund Jochen hat einen Job im Café gefunden. Er soll drei Tage pro Woche dort arbeiten, und der Job dauert abends von neun bis ein Uhr nachts. Jochen überlegt, ob er den Job annehmen soll.',
                requirements: 'Sagen Sie Jochen, wozu Sie ihm raten.\nBegründen Sie Ihre Meinung.',
                prepTime: 30,
                speakTime: 60,
                level: 'TDN 3',
                formality: 'informell'
            }
        }
    }

};

/**
 * Retrieve a specific task from a given mock test.
 * @param {number} testNum - The test number (1-10)
 * @param {number} taskNum - The task number (1-7)
 * @returns {object|null} The task object, or null if not found
 */
function getTestDaFTask(testNum, taskNum) {
    var test = TESTDAF_BANK[testNum];
    if (!test) return null;
    return test.tasks[taskNum] || null;
}

/**
 * Retrieve the array of task type metadata.
 * @returns {array} Array of task type objects
 */
function getTestDaFTaskTypes() {
    return TESTDAF_TASK_TYPES;
}
