<!-- web/frontend/src/App.vue -->
<script setup lang="ts">
import { computed, ref } from "vue";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import Toast from "primevue/toast";
import Message from "primevue/message";
import SettingsTab from "@/components/SettingsTab.vue";
import { LINK_TOKEN, linkStatus } from "@/api";
import EdtTab from "@/components/EdtTab.vue"
import PermissionsTab from "@/components/PermissionsTab.vue";
import BroadcastsTab from "@/components/BroadcastsTab.vue";

const activeTab = ref<string>("edt");

const blockingMessage = computed<string | null>(() => {
    if (LINK_TOKEN === null) {
        return "Lien invalide.";
    }
    if (linkStatus.value === "locked") {
        return "Ce lien est déjà utilisé dans une autre session.";
    }
    if (linkStatus.value === "expired") {
        return "Ce lien a expiré ou n'est plus valide. Relancez /config gui sur Discord.";
    }
    return null;
});
</script>

<template>
    <Toast />
    <main class="layout">
        <h1>Configuration du bot</h1>
        <Message v-if="blockingMessage !== null" severity="error">{{ blockingMessage }}</Message>
        <Tabs v-else v-model:value="activeTab">
            <TabList>
                <Tab value="edt">Emplois du temps</Tab>
                <Tab value="permissions">Permissions</Tab>
                <Tab value="broadcasts">Broadcasts</Tab>
                <Tab value="settings">Paramètres</Tab>
            </TabList>
            <TabPanels>
                <TabPanel value="edt">
                    <EdtTab />
                </TabPanel>
                <TabPanel value="permissions">
                    <PermissionsTab />
                </TabPanel>
                <TabPanel value="broadcasts">
                    <BroadcastsTab />
                </TabPanel>
                <TabPanel value="settings">
                    <SettingsTab />
                </TabPanel>
            </TabPanels>
        </Tabs>
    </main>
</template>

<style scoped>
.layout {
    max-width: 960px;
    margin: 0 auto;
    padding: 1.5rem;
}
</style>