<!-- web/frontend/src/components/SettingsTab.vue -->
<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import Select from "primevue/select";
import Button from "primevue/button";
import Message from "primevue/message";
import { useToast } from "primevue/usetoast";
import { apiRequest, errorText } from "@/api";

interface RoleOption {
    id: string;
    name: string;
}

interface GuildSettings {
    adminRoleId: string;
    noClassRoleId: string;
}

interface SettingsResponse {
    settings: GuildSettings;
    roles: RoleOption[];
}

const toast = useToast();
const roles = ref<RoleOption[]>([]);
const saved = ref<GuildSettings>({ adminRoleId: "", noClassRoleId: "" });
const adminRoleId = ref<string | null>(null);
const noClassRoleId = ref<string | null>(null);
const loading = ref<boolean>(true);
const loadError = ref<string | null>(null);

const dirty = computed<boolean>(
    () =>
        (adminRoleId.value ?? "") !== saved.value.adminRoleId ||
        (noClassRoleId.value ?? "") !== saved.value.noClassRoleId,
);


async function load(): Promise<void> {
    try {
        const data: SettingsResponse = await apiRequest<SettingsResponse>("settings");
        roles.value = data.roles;
        saved.value = {
            adminRoleId: data.settings.adminRoleId,
            noClassRoleId: data.settings.noClassRoleId,
        };
        adminRoleId.value = data.settings.adminRoleId || null;
        noClassRoleId.value = data.settings.noClassRoleId || null;
    } catch (error) {
        loadError.value = errorText(error);
    } finally {
        loading.value = false;
    }
}

async function save(): Promise<void> {
    const payload: GuildSettings = {
        adminRoleId: adminRoleId.value ?? "",
        noClassRoleId: noClassRoleId.value ?? "",
    };
    try {
        await apiRequest<void>("settings", "PUT", payload);
        saved.value = payload;
        toast.add({ severity: "success", summary: "Enregistré", life: 3000 });
    } catch (error) {
        toast.add({
            severity: "error",
            summary: "Échec de l'enregistrement",
            detail: errorText(error),
            life: 6000,
        });
    }
}

onMounted(load);
</script>

<template>
    <Message v-if="loadError !== null" severity="error">{{ loadError }}</Message>
    <div v-else class="settings">
        <div class="field">
            <label for="adminRole">Rôle administrateur</label>
            <Select
                id="adminRole"
                v-model="adminRoleId"
                :options="roles"
                optionLabel="name"
                optionValue="id"
                placeholder="Non configuré"
                :loading="loading"
                showClear
            />
            <small>Peut lancer toutes les commandes du bot, y compris /config.</small>
        </div>
        <div class="field">
            <label for="noClassRole">Rôle « sans classe »</label>
            <Select
                id="noClassRole"
                v-model="noClassRoleId"
                :options="roles"
                optionLabel="name"
                optionValue="id"
                placeholder="Non configuré"
                :loading="loading"
                showClear
            />
        </div>
        <Button label="Enregistrer" icon="pi pi-save" :disabled="!dirty" @click="save" />
    </div>
</template>

<style scoped>
.settings {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
    max-width: 28rem;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}
</style>