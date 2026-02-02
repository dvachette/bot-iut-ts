import { getGroups } from "./util/getGroups";
import { config } from "./config";

async function test() {
    const groups = Object.keys(getGroups(config.CONF_YAML_PATH)).filter(g => !g.endsWith("b")).map(g => g.endsWith("a") ? g.slice(0, -1) : g);
    console.log("Available groups:", groups);
}

test();