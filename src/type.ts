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
  isBegin: boolean;
  isEnd: boolean;
}
