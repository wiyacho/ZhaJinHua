import { LessonVo_V2 } from '../../../../Script/structure/lessonVoV2';
import { OPEN_LESSON_LIST, SCROLL_LESSON_2_LEARN } from '../../../../Script/config/event';
import { kit } from '../../../../kit/kit';
import HallV2 from '../HallV2';
import LessonCellV2 from '../LessonCellV2';
import LessonManagerV2 from '../../../../Script/manager/LessonManagerV2';
import { LESSON_TYPE_V2 } from '../../../../Script/config/enum';
import EventSystem from '../../../../kit/system/event/EventSystem';

export default class InitHallStateV2 implements kit.fsm.State<HallV2> {
    public entity: HallV2;

    public onMessage(entity: kit.fsm.Entity, telegram: kit.fsm.Telegrams): boolean {
        throw new Error("Method not implemented.");
    }
    // -93 78
    public async enter(data?: any): Promise<void> {
        return new Promise((res, rej) => {
            this.entity.lessonList = [];
            EventSystem.on(OPEN_LESSON_LIST, this.createCell, this);
            this.createCell();
            res();
        })
    }

    public createCell(data?: any) {
        this.entity.list.getComponent(cc.Layout).enabled = true;
        let result: LessonVo_V2[] = LessonManagerV2.instance.totalLessonData;
        // console.log("===========>>>>>>>>>>result: ", result);
        if (result.length > 0) {
            EventSystem.off(OPEN_LESSON_LIST, this.createCell, this);
        }
        // 删除已纯在的
        for (let index = 0; index < this.entity.lessonList.length; index++) {
            const cell = this.entity.lessonList[index];
            cell.node.destroy();
        }
        this.entity.lessonList = [];
        result.forEach(async (element: LessonVo_V2, index: number) => {
            let cell: cc.Node = cc.instantiate(this.entity.lessonCell);
            let comp = cell.getComponent(LessonCellV2);
            comp.init(this.entity, element, index);
            this.entity.list.addChild(cell);
            this.entity.lessonList.push(comp);
            let len = this.entity.lessonList.length;
            cell.y = len % 2 == 0 ? 78 : -93;
            //TODO: 大测小岛有点特殊
            if (element.lessonType == LESSON_TYPE_V2.testLesson) { //小测
                cell.y = -22;
                cell.width = 333;
            }
        });

        // 右侧留白
        let node = new cc.Node();
        node.width = 88;
        this.entity.list.addChild(node);

        kit.system.timer.doFrameOnce(3, () => {
            kit.manager.Event.emit(SCROLL_LESSON_2_LEARN);
        });

        //
        kit.system.timer.doFrameOnce(3, () => {
            if (!cc.isValid(this.entity.list)) {
                return
            }
            this.entity.list.getComponent(cc.Layout).enabled = false;
            let len = this.entity.lessonList.length;
            for (let index = 0; index < this.entity.lessonList.length; index++) {
                const cell = this.entity.lessonList[index];
                cell.node.setSiblingIndex(len - index);
            }
        });
    }

    public execute(data?: any): void {
        throw new Error("Method not implemented.");
    }
    public exit(data?: any): void {
        // throw new Error("Method not implemented.");
        EventSystem.off(OPEN_LESSON_LIST, this.createCell, this);

    }
}