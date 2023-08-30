<script setup lang="ts">
import { ref } from "vue";

interface BlockState {
  x: number;
  y: number;
  isMine?: boolean;
  aroundMineQuantity: number;
  sweeped: boolean;
  flag: boolean;
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
let isFinish = false;

const state = ref(
  Array.from({ length: HEIGHT }, (_, y) =>
    Array.from(
      { length: WIDTH },
      (_, x): BlockState => ({
        x,
        y,
        aroundMineQuantity: 0,
        sweeped: false,
        flag: false,
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
  const { sweeped, isMine, aroundMineQuantity, flag } = block;
  if (flag) return 'bg-gray-500/20';
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
      if (currentAroundBlock.flag) {
        currentAroundBlock.flag = false;
      }
      sweeperMore(currentAroundBlock);
    }
  });
}

function sweepeBlock(block: BlockState) {
  if (block.flag || isFinish) return;
  if (!isBegin) {
    generateMines(block);
    isBegin = true;
  }

  block.sweeped = true;
  if (block.isMine) {
    alert("BOOOOM!");
    isFinish = true;
  }

  sweeperMore(block);
  checkResult();
}

function flagBlock(block: BlockState) {
  if (block.sweeped || isFinish) return;
  block.flag = !block.flag;
}

function checkResult() {
  const blocks = state.value.flat();

  if (blocks.every(block => block.sweeped || (block.flag && block.isMine))) {
    alert('恭喜你，成功了~');
    isFinish = true;
  }
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
        class="flex h-8 w-8 cursor-pointer items-center justify-center gap-px border border-gray-500/10 text-sm"
        :class="getClass(block)"
        v-for="(block, x) in row"
        :key="x"
        @click="sweepeBlock(block)"
        @contextmenu.prevent="flagBlock(block)"
      >
        <template v-if="block.flag">
          <div>⛳</div>
        </template>
        <template v-if="block.sweeped">
          <div v-if="block.isMine">💣</div>
          <div v-else-if="block.aroundMineQuantity > 0">{{ block.aroundMineQuantity }}</div>
        </template>
      </div>
    </div>
  </div>
</template>
