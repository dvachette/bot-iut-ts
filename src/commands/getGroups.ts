import YAML from 'yaml';
import fs from 'fs';  

interface Group {
    name : string;
    value : string;
}
export function getGroups(path : fs.PathOrFileDescriptor) {
    const file = fs.readFileSync(path, 'utf8');
    const doc = YAML.parse(file);
    return doc.groups;
}


export function getRolesId(path : fs.PathOrFileDescriptor) {
    let roles : String[] = [];
    const file = fs.readFileSync(path, 'utf8');
    const doc = YAML.parse(file);
    for (const group in doc.groups) {
        roles.push(doc.groups[group].role);
    }
    return roles;
}

export function getRoleId(group : string, path : fs.PathOrFileDescriptor) {
    const file = fs.readFileSync(path, 'utf8');
    const doc = YAML.parse(file);
    return doc.groups[group].role;
}

export function composeGroup(group : string, semester : string, sub_group : string) { 
    if (group === "") {
        return "noGroup";
    }
    if (["lpessir", "lpdevops", "but3aged", "but3dacs", "g3a2"].includes(group)) {
        return group;
    }

    if (sub_group === "") {
        return "noGroup";
    }
    if (["aspe", "but3ra1", "but3ra2", "but3ra3"].includes(group)) {
        return group + sub_group;
    }
    if (semester === "") {
        return "noGroup";
    }
    return group + semester + sub_group;
}

