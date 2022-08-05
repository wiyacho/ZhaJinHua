import ClickCmpt from "./component/ClickCmpt";
import Events from "./events/events";
import ResLoader from "./framework/load/ResLoader";
import PlatformSystem from "./framework/platform/PlatformSystem";
import PopupManager from "./manager/popupManager.ts/PopupManager";
import ResourcesManager, { ResourceType } from "./manager/ResourcesManager";
import { VideoEventTransType } from "./structure/ClientModuleEnum";
import { VideoClient2Module, VideoModule2Client } from "./structure/ClientModuleInterface";
import LinkedList from "./structure/LinkedNode";
import AudioManager from "./system/audio/AudioManager";
import ErrorSystem from "./system/error/ErrorSystem";
import EventSystem from "./system/event/EventSystem";
import IEntity from "./system/fsm/entity/IEntity";
import Telegram from "./system/fsm/message/Telegram";
import IState from "./system/fsm/state/IState";
import StateMachine from "./system/fsm/StateMachine";
import LogSystem from "./system/log/LogSystem";
import HttpSystem from "./system/net/http/HttpSystem";
import TimerSystem from "./system/timer/TimerSystem";
import { LocalStorageUtils } from "./utils/LocalStorageUtils";
import { TimeUtils } from "./utils/TimeUtils";
import UIUtils, { UIContainer } from "./utils/UIUtils";
import ModelManager from "./model/ModelManager";
import ModelBase from "./model/ModelBase";
import { MessageBase } from "./model/MessageBase";
import NativeInfo, { NetworkType } from "./model/NativeInfo";
import SpotSystem from "./system/log/SpotSystem";
import { TIPS_TYPE } from "./structure/ClientTipsEnum";
import UrlUtils from "./utils/UrlUtils";

/**
 * cocos-kit
 * ```
 * 版本1：统一命名空间，兼容老版本
 * 版本2：可动态替换kit，大厅可以本地调试子bundle项目
 * ```
 */
export namespace kit {
    export namespace util {
        export const Time = TimeUtils;
        export const Ui = UIUtils;
        export const UiContainer = UIContainer;
        export const LocalStorage = LocalStorageUtils;
        export const Url = UrlUtils;
    }
    export namespace system {
        export const log: LogSystem = LogSystem.instance;
        export const error: ErrorSystem = ErrorSystem.instance;
        export const timer: TimerSystem = TimerSystem.instance;
        export const platform: PlatformSystem = PlatformSystem.instance;
        export const spot: SpotSystem = SpotSystem.instance;
    }
    export namespace manager {
        export const resources: ResourcesManager = ResourcesManager.instance;
        export namespace Resources {
            export const Type = ResourceType;
        }
        export const Audio = AudioManager;
        export const Event = EventSystem;
        export const Http = HttpSystem;
        export const Popup = PopupManager;
    }

    export namespace consts {
        export const Event = Events;
    }

    export namespace structure {
        export const LinkList = LinkedList;
        export namespace Tips {
            export const Type = TIPS_TYPE;
        }

    }

    export namespace video {
        export const videoTransType = VideoEventTransType;
        export interface Module2Client extends VideoModule2Client { };
        export interface Client2Module extends VideoClient2Module { };
    }

    export namespace component {
        export const Click = ClickCmpt;
    }

    export class Loader extends ResLoader { };

    export namespace fsm {
        export interface Entity extends IEntity { };
        export interface State<T extends Entity> extends IState<T> { };
        export class StateManager<T extends IEntity> extends StateMachine<T>{};
        export interface Telegrams extends Telegram{ };
    }

    export namespace model {
        export const modelManager: ModelManager = ModelManager.instance;
        export class modelBase extends ModelBase { }
        export class messageBase extends MessageBase { }
        export class nativeInfo extends NativeInfo { }
        export namespace netWork {
            export const networkType = NetworkType;
        }
    }
}