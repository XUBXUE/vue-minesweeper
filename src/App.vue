<script setup lang="ts">
import { watchEffect } from "vue";
import { GamePlay, useDev } from "./composables";
import { useStorage } from '@vueuse/core';

const game = new GamePlay(10, 10);

const state = useStorage('game-state', game.state);

const { dev, toggleDev } = useDev();

watchEffect(() => {
  game.checkResult();
});
</script>

<template>
  <div class="m-20">
    <div
      class="flex items-center justify-center"
      v-for="(row, y) in state.board"
      :key="y"
    >
      <div
        class="flex h-8 w-8 cursor-pointer items-center justify-center gap-px border border-gray-500/10 text-sm"
        :class="game.getClass(block)"
        v-for="(block, x) in row"
        :key="x"
        @click="game.sweepeBlock(block)"
        @contextmenu.prevent="game.flagBlock(block)"
      >
        <template v-if="block.flag">
          <div>⛳</div>
        </template>
        <template v-if="block.sweeped || dev">
          <div v-if="block.isMine">💣</div>
          <div v-else>
            {{ block.aroundMineQuantity || '' }}
          </div>
        </template>
      </div>
    </div>
    <div class="m-2 flex justify-center items-center gap-5">
      <button class="bg-gray-500/20 hover:bg-gray-500/50 text-white p-2 rounded" @click="game.reset()">Reset</button>
      <button class="bg-gray-500/20 hover:bg-gray-500/50 text-white p-2 rounded" @click="toggleDev()">{{ dev ? 'Normal' : 'Dev' }}</button>
    </div>
  </div>
</template>
