<script setup lang="ts">
import { watchEffect } from "vue";
import { GamePlay, dev, toggleDev } from "./composables";
import { useStorage } from "@vueuse/core";
import Block from "./components/block.vue";

const game = new GamePlay(10, 10);

const state = useStorage("game-state", game.state);

watchEffect(() => {
  game.checkResult();
});
</script>

<template>
  <div class="flex justify-center items-center pt-10 flex-col">
    <h2 class="text-gray-50 my-2">you win~</h2>
    <div>
      <div class="flex items-center justify-center" v-for="(row, y) in state.board" :key="y">
        <Block v-for="(block, x) in row" :key="x" :block="block" :class="game.getClass(block)"
          @click="game.sweepeBlock(block)" @contextmenu.prevent="game.flagBlock(block)" />
      </div>
    </div>
    <div class="m-2 flex items-center justify-center gap-5">
      <button class="rounded bg-gray-500/20 p-2 text-white hover:bg-gray-500/50" @click="game.reset()">
        Reset
      </button>
      <button class="rounded bg-gray-500/20 p-2 text-white hover:bg-gray-500/50" @click="toggleDev()">
        {{ dev ? "Normal" : "Dev" }}
      </button>
    </div>
  </div>
</template>
