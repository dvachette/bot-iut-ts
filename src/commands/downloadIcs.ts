import fs from 'fs';
import https from 'https';

export function downloadICS(url: string, destination: string) {
    const file = fs.createWriteStream(destination);

    https.get(url, (response) => {
        if (response.statusCode !== 200) {
            console.error(`Erreur: ${response.statusCode} - ${response.statusMessage}`);
            return;
        }

        response.pipe(file);

        file.on('finish', () => {
            file.close();
            console.log(`Fichier téléchargé : ${destination}`);
        });
    }).on('error', (err) => {
        console.error(`Erreur de téléchargement : ${err.message}`);
    });
}
