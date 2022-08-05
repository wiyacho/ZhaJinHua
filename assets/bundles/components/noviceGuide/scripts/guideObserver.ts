import { UserDataManager } from "../../../../Script/manager/userDataManager";
import IGuideObserver from "./IGuideObserver";

const { ccclass, property } = cc._decorator;

@ccclass
export default class GuideObserver implements IGuideObserver {
    public check(stepId: number): boolean {
        return true;
    }

    public begin(stepId: number): void {

    }
    public end(stepId: number): void {
        UserDataManager.instance.guideStep = stepId;
    }
}
