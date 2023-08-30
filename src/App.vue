<script setup lang="ts">
import { ref } from "vue";

interface BlockState {
  x: number;
  y: number;
  isMine?: boolean;
  aroundMineQuantity: number;
  sweeped: boolean;
}

const WIDTH = 10;
const HEIGHT = 10;

const aroundRelativePositions = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [1, 0],
  [1, 1],
  [0, 1],
  [-1, 1],
  [-1, 0],
];

const numberColors = [
  "text-blue-400",
  "text-green-400",
  "text-lime-400",
  "text-yellow-400",
  "text-orange-400",
  "text-red-400",
  "text-pink-400",
  "text-purple-400",
];

let isBegin = false;

const state = ref(
  Array.from({ length: HEIGHT }, (_, y) =>
    Array.from(
      { length: WIDTH },
      (_, x): BlockState => ({
        x,
        y,
        aroundMineQuantity: 0,
        sweeped: false,
      }),
    ),
  ),
);

function generateMines(initial: BlockState): void {
  for (const row of state.value) {
    for (const block of row) {
      if (Math.abs(initial.x - block.x) < 1 || Math.abs(initial.y - block.y) < 1) continue;
      block.isMine = Math.random() < 0.1;
    }
  }
  countArountMines();
}

function countArountMines(): void {
  state.value.forEach((row) => {
    row.forEach((block) => {
      const { x, y, isMine } = block;
      if (isMine) return;
      aroundRelativePositions.forEach(([px, py]) => {
        const mx = x + px;
        const my = y + py;
        if (mx < 0 || mx >= WIDTH || my < 0 || my >= HEIGHT) return;

        if (state.value[my][mx].isMine) {
          block.aroundMineQuantity += 1;
        }
      });
    });
  });
}

function getClass(block: BlockState): string {
  const { sweeped, isMine, aroundMineQuantity } = block;
  if (!sweeped) return "bg-gray-500/20 hover:bg-gray-500/50";
  return isMine ? "bg-red-500" : numberColors[aroundMineQuantity - 1];
}

function sweeperMore(block: BlockState) {
  if (block.aroundMineQuantity) return;

  aroundRelativePositions.forEach(([px, py]) => {
    const mx = block.x + px;
    const my = block.y + py;
    if (mx < 0 || mx >= WIDTH || my < 0 || my >= HEIGHT) return;
    const currentAroundBlock = state.value[my][mx];
    
    if (!currentAroundBlock.sweeped) {
      currentAroundBlock.sweeped = true;
      sweeperMore(currentAroundBlock);
    }
  });
}

function clickBlock(block: BlockState) {
  if (!isBegin) {
    generateMines(block);
    isBegin = true;
  }

  block.sweeped = true;
  if (block.isMine) {
    alert("BOOOOM!");
  }

  sweeperMore(block);
}
</script>

<template>
  <div class="m-20">
    <div
      class="flex items-center justify-center"
      v-for="(row, y) in state"
      :key="y"
    >
      <div
        class="flex h-8 w-8 cursor-pointer items-center justify-center gap-px border border-gray-500/10 text-sm text-white/50"
        :class="getClass(block)"
        v-for="(block, x) in row"
        :key="x"
        @click="clickBlock(block)"
      >
        <template v-if="block.sweeped">
          <div v-if="block.isMine">x</div>
          <div v-else>{{ block.aroundMineQuantity || "" }}</div>
        </template>
      </div>
    </div>
  </div>
</template>
