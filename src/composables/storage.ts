import { ref } from "vue";
import { useToggle } from "@vueuse/core";

export const dev = ref(false);
export const toggleDev = useToggle(dev);
