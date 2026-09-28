<!-- web/frontend/src/components/BroadcastsTab.vue -->
<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import InputText from "primevue/inputtext";
import MultiSelect from "primevue/multiselect";
import Button from "primevue/button";
import Message from "primevue/message";
import { useToast } from "primevue/usetoast";
import { apiRequest, errorText } from "@/api";

interface ChannelOption {
    id: string;
    label: string;
}

interface BroadcastsResponse {
    broadcasts: Record<string, string[]>;
    channels: ChannelOption[];
}

interface BroadcastRow {
    id: string;
    name: string;
    channels: string[];
}

let lastRowId = 0;

function newRowId(): string {
    lastRowId += 1;
    return `broadcast-${lastRowId}`;
}

const toast = useToast();
const rows = ref<BroadcastRow[]>([]);
const channels = ref<ChannelOption[]>([]);
const savedSnapshot = ref<string>("[]");
const loading = ref<boolean>(true);
const saving = ref<boolean>(false);
const loadError = ref<string | null>(null);

function snapshot(list: readonly BroadcastRow[]): string {
    return JSON.stringify(list.map((row) => [row.name, [...row.channels]]));
}

const dirty = computed<boolean>(() => snapshot(rows.value) !== savedSnapshot.value);

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
    return null;
}

function toPayload(list: readonly BroadcastRow[]): Record<string, string[]> {
    const payload: Record<string, string[]> = {};
    for (const row of list) {
        payload[row.name.trim()] = [...row.channels];
    }
    return payload;
}

async function load(): Promise<void> {
    try {
        const data: BroadcastsResponse = await apiRequest<BroadcastsResponse>("broadcasts");
        const channelIds: ReadonlySet<string> = new Set(data.channels.map((channel) => channel.id));
        channels.value = data.channels;
        rows.value = Object.entries(data.broadcasts).map(([name, ids]) => ({
            id: newRowId(),
            name,
            channels: ids.filter((id) => channelIds.has(id)),
        }));
        savedSnapshot.value = snapshot(rows.value);
    } catch (error) {
        loadError.value = errorText(error);
    } finally {
        loading.value = false;
    }
}

function addRow(): void {
    rows.value.push({ id: newRowId(), name: "", channels: [] });
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
        await apiRequest<void>("broadcasts", "PUT", toPayload(rows.value));
        for (const row of rows.value) {
            row.name = row.name.trim();
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
    <div v-else class="broadcasts">
        <DataTable :value="rows" dataKey="id" size="small" :loading="loading">
            <template #empty>Aucun groupe de diffusion.</template>
            <Column header="Groupe" style="width: 25%">
                <template #body="{ data }">
                    <InputText v-model="data.name" placeholder="annonces" fluid />
                </template>
            </Column>
            <Column header="Salons">
                <template #body="{ data }">
                    <MultiSelect
                        v-model="data.channels"
                        :options="channels"
                        optionLabel="label"
                        optionValue="id"
                        display="chip"
                        placeholder="Aucun salon"
                        filter
                        fluid
                    />
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
        <div class="actions">
            <Button label="Ajouter un groupe" icon="pi pi-plus" severity="secondary" @click="addRow" />
            <Button label="Enregistrer" icon="pi pi-save" :disabled="!dirty" :loading="saving" @click="save" />
        </div>
    </div>
</template>

<style scoped>
.broadcasts {
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