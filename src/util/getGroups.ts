import YAML from 'yaml';
import fs from 'fs';
import { getGuildDataPath } from './guildData';


export function getEdtGroups(guildId: string) {
    const file = fs.readFileSync(getGuildDataPath(guildId, "timetables"), 'utf8');
    const doc = YAML.parse(file);
    return doc.groups;
}


export function getRolesId(guildId: string) {
    let roles: String[] = [];
    const file = fs.readFileSync(getGuildDataPath(guildId, "timetables"), 'utf8');
    const doc = YAML.parse(file);
    for (const group in doc.groups) {
        roles.push(doc.groups[group].role);
    }
    return roles;
}

export function getRoleId(group: string, guildId: string) {
    const file = fs.readFileSync(getGuildDataPath(guildId, "timetables"), 'utf8');
    const doc = YAML.parse(file);
    return doc.groups[group].role;
}