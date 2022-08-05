import { UpdateChapterType } from './../config/enum';
import { ChapterVo, LessonVo} from "./lessonVo";


/**
 * 环节通知刷新环节信息
 */
export interface UpdateChapterInfo {
    updateType:UpdateChapterType;
    params: ChapterVo | LessonVo;
}

interface Params {
    bookNum: number;
    maxPage: number;
}
export class BookItemData {
    id: number;
    url: string;
    main: string;
    assets: any[];
    params: Params;
    unlock: boolean;

    constructor(data, unlock) {
        this.parse(data, unlock);
    }

    parse(data, unlock) {
        this.id = data.id;
        this.url = data.url;
        this.main = data.main;
        this.assets = data.assets;
        this.params = data.params;
        this.unlock = !!unlock;
    }

    public get isLock(): boolean {
        return this.unlock;
    }

    public setUnlock() {
        this.unlock = true;
    }
}


export class GameItemData {
    id: number;
    url: string;
    main: string;
    assets: any[];
    params: any;
    unlock: boolean;

    constructor(data, unlock) {
        this.parse(data, unlock);
    }

    parse(data, unlock) {
        cc.log(" ====unlock: ", unlock)
        this.id = data.id;
        this.url = data.url;
        this.main = data.main;
        this.assets = data.assets;
        this.params = data.params;
        this.unlock = !!unlock;
    }

    public get isLock(): boolean {
        return this.unlock;
    }

    public setUnlock() {
        this.unlock = true;
    }
}

export class EncourageItemData {
    lessonId: number;
    shipUrl: string;
    iconUrl: string;
    type: number;
    bookId: number;
    gameId: number;
    propId: number;
    lockVal: number; //解锁标识 1解锁 0未解锁

    constructor(data, unlock) {
        this.parse(data, unlock);
    }

    parse(data, unlock) {
        cc.log(" ====unlock: ", unlock)
        this.lessonId = data.lessonId;
        this.shipUrl = data.shipUrl;
        this.iconUrl = data.iconUrl;
        this.type = data.type;
        this.bookId = data.bookId;
        this.gameId = data.gameId;
        this.propId = data.propId;
        this.lockVal = unlock;
    }

    public get isLock(): boolean {
        return !!this.lockVal;
    }

    public setUnlock() {
        this.lockVal = 0;
    }
}
