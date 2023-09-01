<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { GamePlay } from "./composables";
import { useStorage } from "@vueuse/core";
import Block from "./components/block.vue";

const game = new GamePlay(10, 10, 10);

const state = useStorage("game-state", game.state);

const simple = () => game.reset(10, 10, 10);

const normal = () => game.reset(20, 20, 30);

const difficult = () => game.reset(30, 16, 50);

const emoji = computed(() => {
  return state.value.status === 'playing'
    ? "😊"
    : state.value.status === 'won' 
      ? "😎"
      : "😭";
})

watchEffect(() => {
  game.checkResult();
});
</script>

<template>
  <div class="flex justify-center items-center pt-10 flex-col">
    <div>
      <div class="flex items-center justify-between my-2 text-gray-50">
        <div>Flag: {{ state.flags }}</div>
        <button class="rounded bg-gray-500/20 p-2 text-white hover:bg-gray-500/50 leading-none" @click="game.reset()">
          {{ emoji }}
        </button>
        <div>Time: {{ state.time }}</div>
      </div>
      <div>
        <div class="flex items-center justify-center" v-for="(row, y) in state.board" :key="y">
          <Block v-for="(block, x) in row" :key="x" :block="block" :class="game.getClass(block)"
            @click="game.sweepeBlock(block)" @contextmenu.prevent="game.flagBlock(block)" />
        </div>
      </div>
      <div class="m-2 flex items-center justify-between">
        <button class="rounded bg-gray-500/20 p-2 text-white hover:bg-gray-500/50" @click="simple">
          simple
        </button>
        <button class="rounded bg-gray-500/20 p-2 text-white hover:bg-gray-500/50" @click="normal">
          normal
        </button>
        <button class="rounded bg-gray-500/20 p-2 text-white hover:bg-gray-500/50" @click="difficult">
          difficult
        </button>
        <!-- <button class="rounded bg-gray-500/20 p-2 text-white hover:bg-gray-500/50" @click="toggleDev()">
          {{ dev ? "Normal" : "Dev" }}
        </button> -->
      </div>
    </div>
  </div>
</template>
