# Discord Schedule Bot

Bot Discord permettant la gestion et l'envoi automatisé d'emplois du temps dans des channels dédiés, pour les emplois du temps de l'université Claude Bernard Lyon 1.


## Utilisation

Le bot peut être installé [ici](https://discord.com/oauth2/authorize?client_id=1305656077005623336).
Pour le configurer, il faut être proprietaire du serveur Discord, ou bien avoir les permissions d'administrateur.
La configuration se fait via une interface web, accessible avec la commande `/config gui`.

### Commandes
#### `/ping`
`/ping`

Permet de vérifier que le bot est bien en ligne et répond aux commandes.

#### `/repo`
`/repo`

Permet d'obtenir le lien vers le dépôt GitHub du bot.

#### `/send_edt_day`
`/send_edt_day <date>`

Envoie l'emploi du temps du jour spécifié dans le channel où la commande est exécutée. La date doit être au format `YYYY-MM-DD`. Si la date n'est pas spécifiée, l'emploi du temps du lendemain sera envoyé.

#### `/send_edt_week`
`/send_edt_week <date>`

Envoie l'emploi du temps de la semaine spécifiée dans le channel où la commande est exécutée. La date doit être au format `YYYY-MM-DD`. Si la date n'est pas spécifiée, l'emploi du temps de la semaine suivante sera envoyé.

#### `/broadcast`
`/broadcast <subcommand> <...args>`

- `/broadcast send <group> <message>` : Envoie un message à tous les channels configurés pour le groupe spécifié.
- `/broadcast list` : Liste tous les groupes configurés pour le broadcast.
- `/broadcast add <group> <channel>` : Ajoute un channel pour le groupe spécifié.
- `/broadcast remove <group> <channel>` : Supprime un channel pour le groupe spécifié.
- `/broadcast delete <group>` : Supprime le groupe spécifié et tous les channels associés.
- `/broadcast create <group>` : Crée un nouveau groupe pour le broadcast.
- `/broadcast help` : Affiche l'aide pour la commande broadcast.

#### `/config gui`
`/config gui`

Génère un lien vers l'interface web de configuration du bot. Cette interface permet de configurer les channels pour chaque groupe, ainsi que d'autres paramètres du bot. Le lien généré est unique et ne peut être utilisé qu'une seule fois.

#### `/edt_config upload`
`/edt_config upload <file>`

Permet d'uploader un fichier d'emploi du temps pour un groupe spécifique. Le fichier doit être au format YAML et respecter la structure attendue par le bot.

#### `/permission`
`/permission <subcommand> <...args>`

- `/permission grant <role> <command>` : Accorde la permission d'utiliser une commande spécifique à un rôle.
- `/permission revoke <role> <command>` : Révoque la permission d'utiliser une commande spécifique à un rôle.
- `/permission list <command>` : Liste toutes les permissions configurées pour une commande spécifique.
- `/permission help` : Affiche l'aide pour la commande permission.
- `/permission listall` : Liste toutes les permissions configurées pour toutes les commandes.

#### `/role`
`/role <subcommand> <...args>`

- `/role add <role> <selector>` : Ajoute un rôle aux utilisateurs correspondant au sélecteur spécifié.

- `/role remove <role> <selector>` : Supprime un rôle aux utilisateurs correspondant au sélecteur spécifié.

#### `/select_group`
`/select_group`

Envoie un message avec un menu déroulant permettant aux utilisateurs de sélectionner leur groupe. Le bot attribuera automatiquement le rôle correspondant au groupe sélectionné.

### Selecteurs de groupe
Le bot utilise des sélecteurs pour déterminer quels utilisateurs doivent recevoir un rôle spécifique. Les sélecteurs doivent être au format suivant : 
```
| Opérateur | Signification                    |
|-----------|----------------------------------|
|   `&&`    | ET (les deux rôles requis)       |
|   `||`    | OU (l'un ou l'autre)             |
|   `!`     | NON (n'a pas ce rôle)            |
|   `( )`   | groupement, pour forcer un ordre |
```
**Exemples :**
- `@Grp1 && @Grp2` → membres ayant Grp1 **et** Grp2
- `@Grp1 || @Grp3` → membres ayant Grp1 **ou** Grp3
- `!@Grp4` → membres n'ayant **pas** Grp4
- `(@Grp1 && @Grp2) || !@Grp4` → (Grp1 et Grp2) ou pas Grp4

Pour insérer un rôle dans le champ `target`, tapez `@` suivi du nom et sélectionnez la suggestion proposée par Discord — ne pas taper le nom du rôle en texte libre, il ne sera pas reconnu.
### Format de configuration des emplois du temps
Le bot attend un fichier YAML pour la configuration des emplois du temps. Le format attendu est le suivant :

```yaml
groups:
  group_name:
    channel: "channel_id"
    role: "role_id"
    edturl: "url_to_edt_file"
  another_group:
    channel: "channel_id"
    role: "role_id"
    edturl: "url_to_edt_file"
```

L'url de l'emploi du temps doit etre un lien direct pour un calendrier au format ICS de l'université Claude Bernard Lyon 1. 
Pour obtenir ce lien, il faut se rendre sur le site de l'université (https://edt.univ-lyon1.fr/direct), se placer sur le calendrier de son groupe, puis cliquer sur l'icône "Exporter" (en bas à gauche), selectionner "ICalendar (Outlook/Mozilla/Google Calendar/ICal)", et enfin, cliquer sur Générer URL. Une fois le lien généré, il faut le copier et le coller dans le champ `edturl` du fichier YAML, en remplaçant dans l'url la premiere date par `START`, et la dernière date par `END`. Par exemple, si l'url générée est :
```
https://edt.univ-lyon1.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=6163&projectId=1&calType=ical&firstDate=2026-08-18&lastDate=2027-08-01
```
Il faut la modifier pour obtenir :
```
https://edt.univ-lyon1.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=6163&projectId=1&calType=ical&firstDate=START&lastDate=END
```

## Développement
Les fichiers sont répartis dans les dossiers suivants :
```
.
├── bot --> Contient le code source du bot
├── docker-compose.yml --> Contient la configuration pour lancer le bot et l'interface web avec Docker
├── LICENSE --> Contient la licence du projet
├── NOTICE --> Contient les informations légales du projet
├── README.md --> Contient la documentation du projet
├── shared --> Contient le code partagé entre le bot et l'interface web
└── web --> Contient le code source de l'interface web
```

L'interface web est développée en TypeScript et utilise le framework [Vue.js](https://vuejs.org/). Elle est construite avec [Vite](https://vitejs.dev/) et utilise [PrimeVue](https://www.primefaces.org/primevue/) pour les composants UI.

Le bot est développé en TypeScript et utilise la librairie [discord.js](https://discord.js.org/#/).

Pour lancer le bot et l'interface web en local, il est nécessaire d'avoir [Node.js](https://nodejs.org/) et [Docker](https://www.docker.com/) installés sur votre machine. Ensuite, vous pouvez exécuter la commande suivante dans le terminal à la racine du projet :
```
docker-compose up
```

Les pulls request doivent faites sur des branches `feat/<nom_de_la_fonctionnalité>` et les issues doivent etre créées sur le dépôt GitHub du projet.

## License
Ce projet est sous licence Apache 2.0. Pour plus d'informations, veuillez consulter le fichier [LICENSE](LICENSE) et [NOTICE](NOTICE).