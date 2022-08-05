
import { kit } from "../../../../kit/kit";
import { BUNDLE_LOADING_LESSON } from "../../../../Script/config/config";
import AssetsManager from "../../../../Script/manager/assetsManager";
import loadingStateV2 from "../../../../Script/state/loadingStateV2";
import { CConst } from "../../../book_base/scripts/config/CConst";
import LoadAnim from "./LoadAnim";

/**
 * 课程过度
 */
const { ccclass, property } = cc._decorator;

@ccclass
export default class LoadingLesson extends cc.Component {

    private lessonLoadOk = false // 课程资源加载完毕
    loadingActionEnded = false // loading动画结束

    // 当前entity
    public static currEntity: kit.fsm.Entity = null

    // 当前配置
    public layoutIndex = 1

    public static pre_delay = 0.5
    public static after_delay = 0.5

    // anim: LoadAnim = null
    bg: LoadAnim = null

    static instance: LoadingLesson = null

    progress: cc.Label = null
    rocket: LoadAnim = null

    public onLoad() {
        LoadingLesson.instance = this
        let bgNode = cc.find('bg', this.node)
        this.bg = bgNode.addComponent(LoadAnim)
        // this.fixBg(bgNode)
        kit.manager.Event.on(kit.consts.Event.LIFE_CYCLE_READY, this.onLifeCycleReady, this)
        let rocketNode = cc.find('rocket', this.node)
        this.rocket = rocketNode.addComponent(LoadAnim)
        this.progress = cc.find('progress', this.node).getComponent(cc.Label)
    }

    private fixBg(bg: cc.Node) {
        let frameSize: cc.Size = cc.view.getFrameSize() // 屏幕尺寸
        let designResolution: cc.Size = cc.Canvas.instance.designResolution
        let designSize: cc.Size = cc.size(designResolution.width, designResolution.height)  // cc.Canvas.instance.designResolution
        let frameAspectRatio: number = frameSize.width / frameSize.height
        let screenSize: cc.Size = { ...designSize } as cc.Size

        let w = 1334
        let h = 750

        let ratio: number = w / h
        if (ratio > frameAspectRatio) {
            let width = w * screenSize.height / h
            let scale = width / w
            bg.scale = scale
        } else {
            let height = h * screenSize.width / w
            let scale = height / h
            bg.scale = scale
        }
    }

    private left = -448
    private right = 448
    private tw1: cc.Tween = null
    private tw2: cc.Tween = null

    progressValue = 0
    /**
     * 设置progress
     * @param value 
     */
    setProgress(value, duration = 0.2) {
        if (value > 1.0) {
            throw new Error("LoadingLesson.setProgress: value范围：[0,1]");
        }
        this.progress.node.active = true
        cc.Tween.stopAllByTarget(this.progress.node)
        this.tw1 = cc.tween(this.progress.node).to(duration,
            { x: this.progress.node.x }, {
            progress: (start, end, current, ratio) => {
                this.progressValue = Math.ceil(value * ratio * 100)
                let per = this.progressValue
                if (this.progressValue >= 100) {
                    per = 99
                }
                let percent = per
                this.progress.string = `%${percent}`
                return start + (end - start) * ratio;
            }
        }).call(()=>{
            this.tryClose()
        }).start()
    }

    private endFunc: Function = null

    tryClose() {
        if (this.loadingActionEnded && this.needHide && this.progressValue >= 1.0) {
            this.hide()
        }
    }

    public onLifeCycleReady() {
    }

    public adjustOver() {
    }

    public onDestroy() {
        // kit.manager.Event.off(LOADING_LESSON_BUNDLE_ENDED, this.onLessonBundleEnded, this)
        kit.manager.Event.off(kit.consts.Event.LIFE_CYCLE_READY, this.onLifeCycleReady, this)
    }

    public start() {
        this.bg.node.zIndex = 100
        this.progress.node.zIndex = 110
        this.rocket.node.zIndex = 110
    }

    public onEnable() {
    }

    async show(type) {
        this.needHide = false
        this.loadingActionEnded = false
        this.progress.string = `%1`
        this.progress.node.active = false
        this.endFunc = null
        this.rocket.node.active = true
        // this.scheduleOnce(() => {
        //     this.progress.node.active = true
        // }, 1)
        this.rocket.play(loadingStateV2.ROCKET_IN).then(() => {
            this.rocket.play(loadingStateV2.ROCKET_IDLE)
        })
        await this.bg.play(loadingStateV2.CLOUD_IN).then(() => {
            this.bg.play(loadingStateV2.CLOUD_IDLE, true)
        })

        this.loadingActionEnded = true
        this.progress.node.active = true
    }

    private needHide = false

    async hide() {
        this.progress.string = `%100`
        this.scheduleOnce(() => {
            this.bg.play(loadingStateV2.CLOUD_OUT)
            this.progress.node.active = false
        }, 1.5)

        await this.rocket.play(loadingStateV2.ROCKET_OUT).then(() => {
            this.rocket.node.active = false
        })
        if (this.endFunc) {
            let func = this.endFunc
            func()
        }

        let node = AssetsManager.instance.getGlobalNode(BUNDLE_LOADING_LESSON)
        node.removeFromParent(false)
    }

    onLessonReady(func) {
        this.endFunc = func
        this.needHide = true
        this.progress.string = `%100`
        this.tryClose()
    }
}