// web/frontend/src/main.ts
import { createApp } from "vue";
import PrimeVue from "primevue/config";
import ToastService from "primevue/toastservice";
import Aura from "@primeuix/themes/aura";
import "primeicons/primeicons.css";
import "./style.css";
import App from "./App.vue";

createApp(App)
    .use(PrimeVue, {
        theme: {
            preset: Aura,
            options: { darkModeSelector: "system", cssLayer: false },
        },
    })
    .use(ToastService)
    .mount("#app");