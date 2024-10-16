## -- GEARCHIVEERD --

Deze repo is gearchiveerd. Aangezien ik geen Somtoday-account meer heb kan ik dit niet langer maintainen.

Voel je vrij om de boel te forken.

# somtoday-cijfer-export

Somtoday cijfer screenshot tool 🇳🇱

## Wat doet dit?

Wanneer je je cijfers moet controleren voor het examen, is het handig om deze van tevoren op een rustig moment te controleren.
Deze tool maakt automatisch (op een manier die de ratelimit van Somtoday acceptabel vindt) een screenshot van je cijfers van ieder schooljaar, en ieder vak.
Waarom is dit handig? Nou, ik had persoonlijk geen zin om alle hokjes open te klappen in Somtoday, om vervolgens alle screenshots netjes te moeten ordenen,
terwijl voor sommige vakken er zelfs langere screenshots nodig zijn. Deze tool authenticeert automatisch met Somtoday (met de inloggegevens in config.json)
en maakt daarna screenshots in de aangegeven `screenshotDirectory`.

## Configuratie

De bot is te configureren via `config.json`. Het schema van dit bestand spreekt aardig voor zich, en de zod validator is te vinden in `src/config.ts`, maar hierbij de hoofdlijnen.

- **schoolName**: de schoolnaam in Somtoday. Dit kan ook het eerste stukje van de naam zijn, zolang je maar de opgegeven waarde + ENTER in Somtoday kan intypen en Somtoday dan begrijpt welke school je bedoelde werkt het.
- **username**: de gebruikersnaam in Somtoday (let op: sommige scholen gebruiken andere methodes om in te loggen, dus het kan zijn dat dit niet werkt, maak dan [een issue](https://github.com/25huizengek1/somtoday-cijfer-export/issues/new/choose))
- **password**: het wachtwoord van je account
- **screenshotDirectory** (optioneel, default = `screenshots`): de map waarin de screenshots terecht komen, wordt aangemaakt als het pad niet bestaat.
- **delay** (optioneel, default = `10`): de tijd tussen toetsaanslagen in milliseconde.

## Licentie

De broncode is beschermd onder de GNU GPLv3 licentie. Een kopie daarvan is te vinden in `LICENSE`.
