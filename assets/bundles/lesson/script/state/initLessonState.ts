import { kit } from "../../../../kit/kit";
import { LESSON_LIST_CONFIG } from "../../../../Script/config/config";
import Lesson from "../lesson";

export default class InitLessonState implements kit.fsm.State<Lesson> {
    public entity: Lesson;

    public onMessage(entity: kit.fsm.Entity, telegram: kit.fsm.Telegrams): boolean {
        throw new Error("Method not implemented.");
    }
    public async enter(data?: any): Promise<void> {
        return new Promise((res, rej) => {
            // let result: any = await axios.post('lessonList');
            let result: any = LESSON_LIST_CONFIG;
            // result.forEach(element => {
            // let itemNode: cc.Node = cc.instantiate(this.entity.lessonItem);
            // this.entity.list.addChild(itemNode);
            // let item: LessonItem = itemNode.getComponent<LessonItem>(LessonItem)
            // item.init(element);
            // this.entity.lessonList.push(item);
            // });
            res();
        })
    }
    public execute(data?: any): void {
        throw new Error("Method not implemented.");
    }
    public exit(data?: any): void {
        throw new Error("Method not implemented.");
    }

}