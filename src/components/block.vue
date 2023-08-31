<script setup lang="ts">
import { dev } from "../composables/storage";
import { BlockState } from "../type";

defineProps<{ block: BlockState }>();
</script>

<template>
  <div
    class="flex h-8 w-8 cursor-pointer items-center justify-center gap-px border border-gray-500/10 text-sm text-white/50"
  >
    <template v-if="block.flag">
      <div>⛳</div>
    </template>
    <template v-if="block.sweeped || dev">
      <div v-if="block.isMine">💣</div>
      <div v-else>
        {{ block.aroundMineQuantity || dev ? block.aroundMineQuantity : '' }}
      </div>
    </template>
  </div>
</template>
