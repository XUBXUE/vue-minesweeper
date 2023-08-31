import { ref } from "vue";
import type { BlockState, GameState } from "../type";
import type { Ref } from "vue";
import { aroundRelativePositions, numberColors } from "../enum";

export class GamePlay {
  state = ref() as Ref<GameState>;

  constructor(
    public width: number,
    public height: number,
  ) {
    this.reset();
  }

  get board(): BlockState[][] {
    return this.state.value.board;
  }

  get blocks(): BlockState[] {
    return this.state.value.board.flat();
  }

  reset(width = this.width, height = this.height) {
    this.state.value = {
      isBegin: false,
      isEnd: false,
      board: Array.from({ length: height }, (_, y) =>
        Array.from(
          { length: width },
          (_, x): BlockState => ({
            x,
            y,
            aroundMineQuantity: 0,
            sweeped: false,
            flag: false,
          }),
        ),
      ),
    };
  }

  generateMines(initial: BlockState): void {
    for (const row of this.board) {
      for (const block of row) {
        if (initial.x === block.x && initial.x === block.x) continue;
        block.isMine = Math.random() < 0.1;
      }
    }

    this.countArountMines();
  }

  countArountMines(): void {
    this.state.value.board.forEach((row) => {
      row.forEach((block) => {
        const { x, y, isMine } = block;
        if (isMine) return;
        aroundRelativePositions.forEach(([px, py]) => {
          const mx = x + px;
          const my = y + py;
          if (mx < 0 || mx >= this.width || my < 0 || my >= this.height) return;

          if (this.board[my][mx].isMine) {
            block.aroundMineQuantity += 1;
          }
        });
      });
    });
  }

  getClass(block: BlockState): string {
    const { sweeped, isMine, aroundMineQuantity, flag, lightBomb } = block;

    // 标记状态下的样式
    const flagStyle = this.state.value.isEnd
      ? isMine
        ? "bg-gray-500/20"
        : "bg-red-500/50"
      : "bg-gray-500/20";
    // 未被扫描状态下的样式
    const unsweepedStyle = this.state.value.isEnd
      ? "bg-gray-500/20"
      : "bg-gray-500/20 hover:bg-gray-500/50";
    // 已被扫描状态下的样式
    const sweepedStyle =
      isMine && lightBomb ? "bg-red-500" : numberColors[aroundMineQuantity - 1];

    return flag ? flagStyle : sweeped ? sweepedStyle : unsweepedStyle;
  }

  sweeperMore(block: BlockState) {
    if (block.aroundMineQuantity) return;

    aroundRelativePositions.forEach(([px, py]) => {
      const mx = block.x + px;
      const my = block.y + py;
      if (mx < 0 || mx >= this.width || my < 0 || my >= this.height) return;
      const currentAroundBlock = this.board[my][mx];

      if (!currentAroundBlock.sweeped) {
        currentAroundBlock.sweeped = true;
        if (currentAroundBlock.flag) {
          currentAroundBlock.flag = false;
        }
        this.sweeperMore(currentAroundBlock);
      }
    });
  }

  sweepeBlock(block: BlockState) {
    if (block.flag || this.state.value.isEnd) return;
    if (!this.state.value.isBegin) {
      this.generateMines(block);
      this.state.value.isBegin = true;
    }

    block.sweeped = true;
    if (block.isMine) {
      block.lightBomb = true;
      this.state.value.isEnd = true;
      this.showBombs();
      return;
    }

    this.sweeperMore(block);
  }

  flagBlock(block: BlockState) {
    if (block.sweeped || this.state.value.isEnd) return;

    block.flag = !block.flag;
  }

  checkResult() {
    if (this.state.value.isEnd) return;

    if (
      this.blocks.every(
        (block) => block.sweeped || (block.flag && block.isMine),
      )
    ) {
      alert("恭喜你，成功了~");
      this.state.value.isEnd = true;
    }
  }

  showBombs() {
    const mineBlocks = this.blocks.filter((block) => block.isMine);
    mineBlocks.forEach((block) => {
      if (!block.flag) {
        block.sweeped = true;
      }
    });
  }
}
