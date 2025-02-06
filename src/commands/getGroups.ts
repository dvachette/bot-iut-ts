import YAML from 'yaml';
import fs from 'fs';  

interface Group {
    name : string;
    value : string;
}
export function getGroups(path : fs.PathOrFileDescriptor) {
    let groups : Group[] = [];
    const file = fs.readFileSync(path, 'utf8');
    const doc = YAML.parse(file);
    return doc.groups;
}

export function composeGroup(group : string, semester : string, sub_group : string) { 
    if (["lpessir", "lpdevops", "but3aged", "but3dacs"].includes(group)) {
        return group;
    }
    if (sub_group === null) {
        return "noGroup";
    }
    if (["aspe", "but3ra1", "but3ra2", "but3ra3"].includes(group)) {
        return group + sub_group;
    }
    if (semester === null) {
        return "noGroup";
    }
    return group + semester + sub_group;
}

