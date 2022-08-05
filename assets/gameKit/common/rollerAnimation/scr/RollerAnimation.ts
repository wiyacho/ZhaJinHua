import ChapterGameComponent from "../../scripts/ChapterGameComponent";

const { ccclass, property } = cc._decorator;

@ccclass
export default class RollerAnimation extends ChapterGameComponent {
  @property(cc.Node)
  farNode: cc.Node = null;

  @property(cc.Node)
  middleNode: cc.Node = null;

  @property(cc.Node)
  nearNode: cc.Node = null;

  @property({
    displayName: "远景速度",
    tooltip: "如果要从左往右请填写负数",
  })
  public farSpeed: number = 100;

  @property({
    displayName: "中景速度",
    tooltip: "如果要从左往右请填写负数",
  })
  public middleSpeed: number = 200;

  @property({
    displayName: "近景速度",
    tooltip: "如果要从左往右请填写负数",
  })
  public nearSpeed: number = 300;

  @property({
    displayName: "横向移动",
    tooltip: "默认从右往左",
  })
  public isHorizontal: boolean = true;

  /** 是否停止移动 */
  public isStopMove: boolean = false;

  onLoad() {
    super.onLoad();
  }

  start() { }

  public initData() { }

  /** 暂停物体移动 */
  public stopMove() {
    this.isStopMove = true;
  }

  /** 恢复物体移动 */
  public resumeMove() {
    this.isStopMove = false;
  }

  public setFarSpeed(speed) {
    this.farSpeed = speed;
  }

  public getFarSpeed() {
    return this.farSpeed;
  }

  public setMiddleSpeed(speed) {
    this.middleSpeed = speed;
  }

  public getMiddleSpeed() {
    return this.middleSpeed;
  }

  public setNearSpeed(speed) {
    this.nearSpeed = speed;
  }

  public getNearSpeed() {
    return this.nearSpeed;
  }

  onDestroy() {
    super.onDestroy();
  }

  /**
   *
   * @param FSpeed 远景速度
   * @param MSpeed 中景速度
   * @param NSpeed 近景速度
   * @returns
   */
  public changeSpeedMove(FSpeed: number, MSpeed: number, NSpeed: number) {
    if (this.farNode.childrenCount > 0) {
      this.farNode.children.forEach((v) => {
        if (this.isHorizontal) {
          v.x -= FSpeed;
        } else {
          v.y -= FSpeed;
        }
        this.checkNode(v, FSpeed);
      });
    }

    if (this.nearNode.childrenCount > 0) {
      this.nearNode.children.forEach((v) => {
        if (this.isHorizontal) {
          v.x -= NSpeed;
        } else {
          v.y -= NSpeed;
        }
        this.checkNode(v, NSpeed);
      });
    }

    if (this.middleNode.childrenCount > 0) {
      this.middleNode.children.forEach((v) => {
        if (this.isHorizontal) {
          v.x -= MSpeed;
        } else {
          v.y -= MSpeed;
        }
        this.checkNode(v, MSpeed);
      });
    }
  }

  private checkNode(node: cc.Node, dir: number) {
    let w = cc.view.getFrameSize().width + node.width / 2;
    let h = cc.view.getFrameSize().height + node.height / 2;
    if (this.isHorizontal) {
      if (dir >= 0) {
        //  从右往左  <------
        if (node.x < -w) {
          node.x = w;
        }
      } else {
        // 从左往右 ------>
        if (node.x > w) {
          node.x = -w;
        }
      }
    } else {
      if (dir >= 0) {
        //  从上往下
        if (node.y < -h) {
          node.y = h;
        }
      } else {
        // 从下往上
        if (node.y > h) {
          node.y = -h;
        }
      }
    }
  }

  update(dt) {
    if (this.isStopMove) return;
    let farSpeed = dt * this.farSpeed;
    let middleSpeed = dt * this.middleSpeed;
    let nearSpeed = dt * this.nearSpeed;
    this.changeSpeedMove(farSpeed, middleSpeed, nearSpeed);
  }
}
