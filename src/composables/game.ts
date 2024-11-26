import { ref } from "vue";
import type { BlockState, GameState } from "../type";
import type { Ref } from "vue";
import { aroundRelativePositions, numberColors } from "../enum";

let timer: number;

export class GamePlay {
  public state = ref() as Ref<GameState>;

  constructor(
    public width: number,
    public height: number,
    public mineQuantity: number,
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

  /**
   * 重置游戏状态
   * @param width 游戏区域宽度，默认为当前宽度
   * @param height 游戏区域高度，默认为当前高度
   * @param mineQuantity 地雷数量，默认为当前地雷数量
   */
  public reset(width = this.width, height = this.height, mineQuantity = this.mineQuantity) {
    // 清除计时器
    this.overTiming();

    // 更新游戏参数
    this.width = width;
    this.height = height;
    this.mineQuantity = mineQuantity;

    // 重置游戏状态
    this.state.value = {
      generatedMines: false,
      status: 'playing',
      time: 0,
      flags: mineQuantity,
      board: this.generateBoard(width, height),
    };
  }

  /**
   * 生成游戏区域
   * @param width 游戏区域宽度
   * @param height 游戏区域高度
   * @returns 游戏区域二维数组
   */
  private generateBoard(width: number, height: number): BlockState[][] {
    return Array.from({ length: height }, (_, y) =>
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
    );
  }

  private randomInt(max: number, min = 0): number {
    return Math.round(Math.random() * max + min);
  }

  private generateMines(initial: BlockState): void {
    let mineQuantity = 0;
    const randomMine = () => {
      const x = this.randomInt(this.width - 1);
      const y = this.randomInt(this.height - 1);
      const block = this.board[y][x];
      if (initial.x === x && initial.x === y) return;
      if (block.isMine) return;

      block.isMine = true;
      mineQuantity++;
    }

    while (mineQuantity < this.mineQuantity) {
      randomMine();
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
          this.state.value.flags++;
        }
        this.sweeperMore(sibling!);
      }
    });
  }

  private startTiming() {
    timer = setInterval(() => {
      this.state.value.time++
    }, 1000);
  }

  private overTiming() {
    clearInterval(timer);
  }

  public sweepeBlock(block: BlockState) {
    if (block.flag || this.isOver) return;
    if (!this.state.value.generatedMines) {
      this.state.value.generatedMines = true;
      this.startTiming();
      this.generateMines(block);
    }

    block.sweeped = true;

    if (block.isMine) {
      this.overTiming();
      block.lightBomb = true;
      this.state.value.status = 'lose';
      this.showBombs();
      return;
    }

    this.sweeperMore(block);
  }

  public flagBlock(block: BlockState) {
    if (block.sweeped || this.isOver || !this.state.value.flags) return;

    block.flag = !block.flag;

    block.flag ? this.state.value.flags-- : this.state.value.flags++;
  }

  public checkResult() {
    if (this.isOver) return;

    const sweepedQuantity = this.blocks.filter(block => block.sweeped).length;

    if (sweepedQuantity === this.blocks.length - this.mineQuantity) {
      this.overTiming();
      this.state.value.status = 'won';
      this.showFlags();
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

  private showFlags() {
    const noMineBlocks = this.blocks.filter((block) => block.isMine);
    noMineBlocks.forEach(block => {
      block.flag = true;
      this.state.value.flags = 0;
    })
  }
}
