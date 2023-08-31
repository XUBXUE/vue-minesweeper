export interface BlockState {
  x: number;
  y: number;
  isMine?: boolean;
  aroundMineQuantity: number;
  sweeped: boolean;
  flag: boolean;
  lightBomb?: boolean;
}

export interface GameState {
  board: BlockState[][];
  generatedMines: boolean;
  status: 'playing' | 'won' | 'lose';
}
