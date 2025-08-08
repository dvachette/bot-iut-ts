# Discord Schedule Bot

Bot Discord permettant la gestion et l'envoi automatisé d'emplois du temps dans des channels dédiés.

## Commandes

- `/group <semester> <group_name>`  
  Attribue le rôle associé au groupe spécifié.

- `/send_today`  
  Envoie manuellement les emplois du temps du lendemain.

- `/send_week`  
  Envoie manuellement les emplois du temps pour la semaine prochaine.

- `/repo`  
  Affiche le lien du dépôt GitHub.

- `/ping`  
  Répond par "pong".

### Permissions

- `/permission add <command> <role_id>`  
  Ajoute un rôle autorisé à utiliser une commande.

- `/permission remove <command> <role_id>`  
  Retire un rôle autorisé d'une commande.

- `/permission list <command>`  
  Liste les rôles autorisés pour une commande.

- `/permission list`  
  Liste toutes les commandes avec leurs rôles autorisés.

### Diffusion (Broadcast)

- `/broadcast send <group> <message>`  
  Envoie un message à tous les channels d'un groupe de diffusion.

- `/broadcast create <group>`  
  Crée un nouveau groupe de diffusion.

- `/broadcast delete <group>`  
  Supprime un groupe de diffusion.

- `/broadcast list`  
  Liste tous les groupes de diffusion.

- `/broadcast add <group> <channel_id>`  
  Ajoute un channel à un groupe de diffusion.

- `/broadcast remove <group> <channel_id>`  
  Retire un channel d'un groupe de diffusion.

---

## Installation

```bash
git clone https://github.com/dvachette/bot-iut-ts
cd bot-iut-ts
npm i
npm run build
```
## Configuration
### Fichier `conf.yaml`

À créer ou modifier avec la structure suivante :

```yaml
groups:
  nom_du_groupe:
    role: "rôle du groupe"
    channel: "channel EDT du groupe"
    edturl: URL de l'EDT du groupe (remplacer la date de début et de fin par START et END)
```

### Fichier `.env`

À créer à la racine du projet :

```env
DISCORD_TOKEN=            # Token Discord
DISCORD_CLIENT_ID=        # ID de client Discord
CONF_YAML_PATH=           # Chemin du fichier de configuration YAML
GUILD_ID=                 # ID du serveur
GROUPS_FILE=              # Fichier JSON contenant les groupes de diffusion
PERMISSIONS_FILE=         # Fichier JSON contenant les permissions
ADMIN_ROLE_ID=            # ID du rôle admin (toujours autorisé à utiliser toutes les commandes)
```

## Lancement

npm run start

## Licence

MIT