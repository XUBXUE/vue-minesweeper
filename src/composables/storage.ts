import { ref } from "vue";
import { useToggle } from "@vueuse/core";

export function useDev() {
  const dev = ref(false);
  const toggleDev = useToggle(dev);

  return {
    dev,
    toggleDev,
  };
}
