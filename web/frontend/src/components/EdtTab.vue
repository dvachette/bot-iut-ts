<!-- web/frontend/src/components/EdtTab.vue -->
<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import Select from "primevue/select";
import Button from "primevue/button";
import Message from "primevue/message";
import { useToast } from "primevue/usetoast";
import { apiRequest, errorText } from "@/api";
import { validateEdtConfig, type EdtGroupEntry } from "#/edtConfig";

interface RoleOption {
    id: string;
    name: string;
}

interface ChannelOption {
    id: string;
    label: string;
}

interface EdtResponse {
    groups: Record<string, EdtGroupEntry>;
    channels: ChannelOption[];
    roles: RoleOption[];
}

interface EdtRow {
    id: string;
    name: string;
    role: string | null;
    channel: string | null;
    edturl: string;
}

let lastRowId = 0;

function newRowId(): string {
    lastRowId += 1;
    return `row-${lastRowId}`;
}

const toast = useToast();
const rows = ref<EdtRow[]>([]);
const roles = ref<RoleOption[]>([]);
const channels = ref<ChannelOption[]>([]);
const savedSnapshot = ref<string>("[]");
const loading = ref<boolean>(true);
const saving = ref<boolean>(false);
const loadError = ref<string | null>(null);

const roleIds = computed<ReadonlySet<string>>(() => new Set(roles.value.map((r) => r.id)));
const channelIds = computed<ReadonlySet<string>>(() => new Set(channels.value.map((c) => c.id)));

function snapshot(list: readonly EdtRow[]): string {
    return JSON.stringify(list.map((r) => [r.name, r.role, r.channel, r.edturl]));
}

const dirty = computed<boolean>(() => snapshot(rows.value) !== savedSnapshot.value);

function toGroups(list: readonly EdtRow[]): Record<string, EdtGroupEntry> {
    const groups: Record<string, EdtGroupEntry> = {};
    for (const row of list) {
        groups[row.name.trim()] = {
            role: row.role ?? "",
            channel: row.channel ?? "",
            edturl: row.edturl.trim(),
        };
    }
    return groups;
}

function validate(): string | null {
    const names = new Set<string>();
    for (const row of rows.value) {
        const name: string = row.name.trim();
        if (name.length === 0) {
            return "Un groupe n'a pas de nom.";
        }
        if (names.has(name)) {
            return `Le nom de groupe "${name}" est en double.`;
        }
        names.add(name);
    }
    return validateEdtConfig({ groups: toGroups(rows.value) }, roleIds.value, channelIds.value);
}

async function load(): Promise<void> {
    try {
        const data: EdtResponse = await apiRequest<EdtResponse>("edt");
        roles.value = data.roles;
        channels.value = data.channels;
        rows.value = Object.entries(data.groups).map(([name, entry]) => ({
            id: newRowId(),
            name,
            role: entry.role,
            channel: entry.channel,
            edturl: entry.edturl,
        }));
        savedSnapshot.value = snapshot(rows.value);
    } catch (error) {
        loadError.value = errorText(error);
    } finally {
        loading.value = false;
    }
}

function addRow(): void {
    rows.value.push({ id: newRowId(), name: "", role: null, channel: null, edturl: "" });
}

function removeRow(id: string): void {
    rows.value = rows.value.filter((row) => row.id !== id);
}

async function save(): Promise<void> {
    const problem: string | null = validate();
    if (problem !== null) {
        toast.add({ severity: "warn", summary: "Configuration invalide", detail: problem, life: 6000 });
        return;
    }

    saving.value = true;
    try {
        await apiRequest<void>("edt", "PUT", { groups: toGroups(rows.value) });
        for (const row of rows.value) {
            row.name = row.name.trim();
            row.edturl = row.edturl.trim();
        }
        savedSnapshot.value = snapshot(rows.value);
        toast.add({ severity: "success", summary: "Enregistré", life: 3000 });
    } catch (error) {
        toast.add({
            severity: "error",
            summary: "Échec de l'enregistrement",
            detail: errorText(error),
            life: 6000,
        });
    } finally {
        saving.value = false;
    }
}

onMounted(load);
</script>

<template>
    <Message v-if="loadError !== null" severity="error">{{ loadError }}</Message>
    <div v-else class="edt">
        <DataTable :value="rows" dataKey="id" size="small" :loading="loading">
            <template #empty>Aucun groupe configuré.</template>
            <Column header="Groupe" style="width: 12%">
                <template #body="{ data }">
                    <InputText v-model="data.name" placeholder="g1s1a" fluid />
                </template>
            </Column>
            <Column header="Rôle" style="width: 20%">
                <template #body="{ data }">
                    <Select
                        v-model="data.role"
                        :options="roles"
                        optionLabel="name"
                        optionValue="id"
                        placeholder="Rôle"
                        filter
                        fluid
                    />
                </template>
            </Column>
            <Column header="Salon" style="width: 28%">
                <template #body="{ data }">
                    <div :title="data.channel ?? ''">
                        <Select
                            v-model="data.channel"
                            :options="channels"
                            optionLabel="label"
                            optionValue="id"
                            placeholder="Salon"
                            filter
                            fluid
                        />
                    </div>
                </template>
            </Column>
            <Column header="URL de l'emploi du temps">
                <template #body="{ data }">
                    <InputText v-model="data.edturl" placeholder="https://..." fluid />
                </template>
            </Column>
            <Column style="width: 4rem">
                <template #body="{ data }">
                    <Button
                        icon="pi pi-trash"
                        severity="danger"
                        text
                        rounded
                        aria-label="Supprimer le groupe"
                        @click="removeRow(data.id)"
                    />
                </template>
            </Column>
        </DataTable>
        <small>Dans l'URL, START et END sont remplacés par la date de début et de fin.</small>
        <div class="actions">
            <Button label="Ajouter un groupe" icon="pi pi-plus" severity="secondary" @click="addRow" />
            <Button label="Enregistrer" icon="pi pi-save" :disabled="!dirty" :loading="saving" @click="save" />
        </div>
    </div>
</template>

<style scoped>
.edt {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.actions {
    display: flex;
    justify-content: space-between;
    gap: 0.75rem;
}
</style>