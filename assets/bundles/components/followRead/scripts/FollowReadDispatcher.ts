import { kit } from "../../../../kit/kit";
import BaseComponent from "../../baseComponent";
import RecordComponent from "./core/RecordComponent";
import { FollowQuestionType, RecordStaticConfig } from "./core/RecordConfig";
import RecordManager from "./core/RecordManager";
import FollowReadQuestion from "./FollowReadQuestion";
import RecognitionQuestion from "./RecognitionQuestion";
import RecordingQuestion from "./RecordingQuestion";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FollowReadDispatcher extends BaseComponent {

    private componentMap: Map<FollowQuestionType, RecordComponent>;

    private currentComponent: RecordComponent;

    

    init(data?: any) {
        RecordStaticConfig.SDKTYPE = RecordStaticConfig.singSong;
        this.componentMap = new Map();
        // 跟读
        let followCmpt = this.node.addComponent(FollowReadQuestion);
        this.componentMap.set(FollowQuestionType.Follow, followCmpt);
        // 认读
        let recongnitionCmpt = this.node.addComponent(RecognitionQuestion);
        this.componentMap.set(FollowQuestionType.Recongnition, recongnitionCmpt);
        // 录音
        let recordingCmpt = this.node.addComponent(RecordingQuestion);
        this.componentMap.set(FollowQuestionType.Record, recordingCmpt);
        kit.manager.Event.on(kit.consts.Event.FOLLOW_CLIENT_TO_MODULE, this.handleEvent, this);

        cc.log("语音sdk参数 ", JSON.stringify(RecordStaticConfig.staticConfig()));
        RecordManager.instance.init();
        RecordManager.instance.initAudioUtil(JSON.stringify(RecordStaticConfig.staticConfig()));
    }

    private setCurrentComponent(type: FollowQuestionType) {
        switch (type) {
            case FollowQuestionType.Follow:
                this.currentComponent = this.componentMap.get(FollowQuestionType.Follow);
                break;
            case FollowQuestionType.Recongnition:

                this.currentComponent = this.componentMap.get(FollowQuestionType.Recongnition);
                break;
            case FollowQuestionType.Record:
                this.currentComponent = this.componentMap.get(FollowQuestionType.Record);
                break;
            default:
                this.currentComponent = this.componentMap.get(FollowQuestionType.Follow);
                break;
        }
    }


    /**
     * 处理接收到的事件
     * @param data  {eventName: string, extra}
     */
    handleEvent(data?: any) {
        cc.log('FollowReadQuestion--', data.data);
        switch (data.data.eventName) {
            case "display":
                this.currentComponent.display();
                break;
            case 'startRecord':
                this.currentComponent.handleStartEvent(data.data);
                break;
            case 'initComponent':
                if (this.currentComponent) {
                    this.currentComponent.release();
                }
                let type = data.data.extra.recordType;
                this.setCurrentComponent(type);
                this.currentComponent.initEvent();
                this.currentComponent.initComponent(data.data.extra);
                break;
            default:
                cc.log(`FollowReadQuestion ${data.data.eventName} not found`);
                break;
        }
    }

    onDestroy() {
        kit.manager.Event.off(kit.consts.Event.FOLLOW_CLIENT_TO_MODULE, this.handleEvent, this);
    }
}
