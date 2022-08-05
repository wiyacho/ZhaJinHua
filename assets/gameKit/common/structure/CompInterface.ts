


export interface GameTaskInitParam {
    bundleName: string;  // bundle
    imgList: string[];   // 每一轮显示image的路径
}


export interface GameTaskShowParam {
    taskIndex: number;
    complete: boolean;
    callFunc1?: () => void;  // 移动到指定位置回调
    callFunc2?: () => void;  // 在指定位置即将离开回调
    callFunc3?: () => void;  // 离开回到原始位置回调
}


export interface Comp2TemplateParams {
    win?: number;  // 是否完成 0 未完成  1完成
    curStep?: number;  // 当前是第几步
}

export interface AnimationConfig {
    name: string;      // 动画名称
    loop?: boolean;     // 是否循环
    duration?: number;  // 循环的话，播放时间
    func?: () => void;
}
