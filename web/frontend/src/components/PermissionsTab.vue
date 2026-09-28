<!-- web/frontend/src/components/PermissionsTab.vue -->
<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import MultiSelect from "primevue/multiselect";
import Button from "primevue/button";
import Message from "primevue/message";
import { useToast } from "primevue/usetoast";
import { apiRequest, errorText } from "@/api";

interface RoleOption {
    id: string;
    name: string;
}

interface PermissionsResponse {
    permissions: Record<string, string[]>;
    commands: string[];
    roles: RoleOption[];
}

interface PermissionRow {
    command: string;
    roles: string[];
}

const toast = useToast();
const rows = ref<PermissionRow[]>([]);
const roles = ref<RoleOption[]>([]);
const savedSnapshot = ref<string>("[]");
const loading = ref<boolean>(true);
const saving = ref<boolean>(false);
const loadError = ref<string | null>(null);

function snapshot(list: readonly PermissionRow[]): string {
    return JSON.stringify(list.map((row) => [row.command, [...row.roles].sort()]));
}

const dirty = computed<boolean>(() => snapshot(rows.value) !== savedSnapshot.value);

function toPayload(list: readonly PermissionRow[]): Record<string, string[]> {
    const payload: Record<string, string[]> = {};
    for (const row of list) {
        if (row.roles.length > 0) {
            payload[row.command] = [...row.roles];
        }
    }
    return payload;
}

async function load(): Promise<void> {
    try {
        const data: PermissionsResponse = await apiRequest<PermissionsResponse>("permissions");
        const roleIds: ReadonlySet<string> = new Set(data.roles.map((role) => role.id));
        roles.value = data.roles;
        rows.value = [...data.commands]
            .sort((a, b) => a.localeCompare(b))
            .map((command) => ({
                command,
                roles: (data.permissions[command] ?? []).filter((id) => roleIds.has(id)),
            }));
        savedSnapshot.value = snapshot(rows.value);
    } catch (error) {
        loadError.value = errorText(error);
    } finally {
        loading.value = false;
    }
}

async function save(): Promise<void> {
    saving.value = true;
    try {
        await apiRequest<void>("permissions", "PUT", toPayload(rows.value));
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
    <div v-else class="permissions">
        <Message severity="info" :closable="false">
            Une commande sans rôle n'est utilisable que par le propriétaire du serveur, les membres
            avec la permission Administrateur et le rôle administrateur. Donner accès à /config
            revient à donner tous les droits.
        </Message>
        <DataTable :value="rows" dataKey="command" size="small" :loading="loading">
            <Column header="Commande" style="width: 25%">
                <template #body="{ data }">/{{ data.command }}</template>
            </Column>
            <Column header="Rôles autorisés">
                <template #body="{ data }">
                    <MultiSelect
                        v-model="data.roles"
                        :options="roles"
                        optionLabel="name"
                        optionValue="id"
                        display="chip"
                        placeholder="Aucun rôle"
                        filter
                        fluid
                    />
                </template>
            </Column>
        </DataTable>
        <div class="actions">
            <Button label="Enregistrer" icon="pi pi-save" :disabled="!dirty" :loading="saving" @click="save" />
        </div>
    </div>
</template>

<style scoped>
.permissions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.actions {
    display: flex;
    justify-content: flex-end;
}
</style>