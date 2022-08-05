/**
 * 游戏配置
 */
export default interface IGameBoardItemConfig {
    id: number;
    main: string;
    name?: string;
    assets: string[];
    params: any[];
    entry: string
}