<script setup lang="ts">
import { computed, watch, watchEffect } from "vue";
import { GamePlay } from "./composables";
import Block from "./components/block.vue";
import confetti from "canvas-confetti";

const game = new GamePlay(10, 10, 10);

const state = game.state;

const simple = () => game.reset(10, 10, 10);

const normal = () => game.reset(20, 20, 30);

const difficult = () => game.reset(30, 16, 50);

const emoji = computed(() => {
  return state.value.status === "playing"
    ? "😊"
    : state.value.status === "won"
    ? "😎"
    : "😭";
});

watch(
  () => state.value.status,
  (status) => {
    if (status === "won") {
      congratulation();
    }
  },
);

const congratulation = () =>
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  });

watchEffect(() => {
  game.checkResult();
});
</script>

<template>
  <div class="flex flex-col items-center justify-center pt-10">
    <div>
      <div class="my-3 flex items-center justify-between text-gray-50 text-sm">
        <div>Mines: {{ state.flags }}</div>
        <button
          class="absolute left-1/2 -translate-x-1/2 rounded bg-gray-500/20 p-2 leading-none text-white hover:bg-gray-500/50"
          @click="game.reset()"
        >
          {{ emoji }}
        </button>
        <div>Time: {{ state.time }}</div>
      </div>
      <div>
        <div
          class="flex items-center justify-center"
          v-for="(row, y) in state.board"
          :key="y"
        >
          <Block
            v-for="(block, x) in row"
            :key="x"
            :block="block"
            :class="game.getClass(block)"
            @click="game.sweepeBlock(block)"
            @contextmenu.prevent="game.flagBlock(block)"
          />
        </div>
      </div>
      <div class="mt-2 flex items-center justify-between">
        <button
          class="rounded bg-gray-500/20 p-2 text-white text-xs hover:bg-gray-500/50"
          @click="simple"
        >
          Simple
        </button>
        <button
          class="rounded bg-gray-500/20 p-2 text-white text-xs hover:bg-gray-500/50"
          @click="normal"
        >
          Normal
        </button>
        <button
          class="rounded bg-gray-500/20 p-2 text-white text-xs hover:bg-gray-500/50"
          @click="difficult"
        >
          Difficult
        </button>
        <!-- <button class="rounded bg-gray-500/20 p-2 text-white hover:bg-gray-500/50" @click="toggleDev()">
          {{ dev ? "Normal" : "Dev" }}
        </button> -->
      </div>
    </div>
  </div>
</template>
