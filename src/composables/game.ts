import { ref } from "vue";
import type { BlockState, GameState } from "../type";
import type { Ref } from "vue";
import { aroundRelativePositions, numberColors } from "../enum";

export class GamePlay {
  public state = ref() as Ref<GameState>;

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

  get isOver(): boolean {
    return this.state.value.status !== 'playing';
  }

  public reset(width = this.width, height = this.height) {
    this.state.value = {
      generatedMines: false,
      status: 'playing',
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

  private generateMines(initial: BlockState): void {
    for (const row of this.board) {
      for (const block of row) {
        if (initial.x === block.x && initial.x === block.x) continue;
        block.isMine = Math.random() < 0.1;
      }
    }

    this.countArountMines();
  }

  private getSiblings(x1: number, y1: number) {
    return aroundRelativePositions.map(([px, py]) => {
      const x2 = x1 + px;
      const y2 = y1 + py;
      if (x2 < 0 || x2 >= this.width || y2 < 0 || y2 >= this.height) return;

      return this.board[y2][x2];
    }).filter(Boolean);
  }

  private countArountMines(): void {
    this.state.value.board.forEach((row) => {
      row.forEach((block) => {
        const { x, y, isMine } = block;
        if (isMine) return;

        this.getSiblings(x, y).forEach(sibling => {
          if (sibling!.isMine) {
            block.aroundMineQuantity += 1;
          }
        });
      });
    });
  }

  public getClass(block: BlockState): string {
    const { sweeped, isMine, aroundMineQuantity, flag, lightBomb } = block;
    // 标记状态下的样式
    const flagStyle = this.isOver
      ? isMine
        ? "bg-gray-500/20"
        : "bg-red-500/50"
      : "bg-gray-500/20";
    // 未被扫描状态下的样式
    const unsweepedStyle = this.isOver
      ? "bg-gray-500/20"
      : "bg-gray-500/20 hover:bg-gray-500/50";
    // 已被扫描状态下的样式
    const sweepedStyle =
      isMine && lightBomb ? "bg-red-500" : numberColors[aroundMineQuantity - 1];

    return flag ? flagStyle : sweeped ? sweepedStyle : unsweepedStyle;
  }

  private sweeperMore(block: BlockState) {
    if (block.aroundMineQuantity) return;

    this.getSiblings(block.x, block.y).forEach(sibling => {
      if (!sibling!.sweeped) {
        sibling!.sweeped = true;
        if (sibling!.flag) {
          sibling!.flag = false;
        }
        this.sweeperMore(sibling!);
      }
    });
  }

  public sweepeBlock(block: BlockState) {
    if (block.flag || this.isOver) return;
    if (!this.state.value.generatedMines) {
      this.generateMines(block);
      this.state.value.generatedMines = true;
    }

    block.sweeped = true;
    if (block.isMine) {
      block.lightBomb = true;
      this.state.value.status = 'lose';
      this.showBombs();
      return;
    }

    this.sweeperMore(block);
  }

  public flagBlock(block: BlockState) {
    if (block.sweeped || this.isOver) return;

    block.flag = !block.flag;
  }

  public checkResult() {
    if (this.isOver) return;

    if (
      this.blocks.every(
        (block) => block.sweeped || (block.flag && block.isMine),
      )
    ) {
      alert("恭喜你，成功了~");
      this.state.value.status = 'won';
    }
  }

  private showBombs() {
    const mineBlocks = this.blocks.filter((block) => block.isMine);
    mineBlocks.forEach((block) => {
      if (!block.flag) {
        block.sweeped = true;
      }
    });
  }
}
