import { LIFE_CYCLE_BLOCK, LIFE_CYCLE_COMPLETE, LIFE_CYCLE_READY, LIFE_CYCLE_UNBLOCK } from "../../../kit/events/events";
import EventSystem from "../../../kit/system/event/EventSystem";

/**
 * 负责章节生命周期，等通用功能
 */
const { ccclass } = cc._decorator;

@ccclass
export default class BaseChapterComponent extends cc.Component {
    protected params: any = null;
    initParams(params) {
        this.params = params;
    }

    onLoad() {
        console.log("BaseChapterComponent onLoad params: ", this.params);
        this.registerEvent();
    }

    registerEvent() {
        EventSystem.on(LIFE_CYCLE_BLOCK, this.onLifeCycleBlock, this);
        EventSystem.on(LIFE_CYCLE_UNBLOCK, this.onLifeCycleUnBlock, this);
    }

    unregisterEvent() {
        EventSystem.off(LIFE_CYCLE_BLOCK, this.onLifeCycleBlock, this);
        EventSystem.off(LIFE_CYCLE_UNBLOCK, this.onLifeCycleUnBlock, this);
    }

    onChapterReady() {
        EventSystem.emit(LIFE_CYCLE_READY);
    }

    // override
    onLifeCycleBlock() {

    }
    // override
    onLifeCycleUnBlock() {

    }

    onChapterComplete() {
        EventSystem.emit(LIFE_CYCLE_COMPLETE);
    }

    onDestroy() {
        console.log("BaseChapterComponent onDestroy do sth");
        this.unregisterEvent();
    }


}
