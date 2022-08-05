

export default interface IGuideObserver {

      /**
       * 检查阶段
       * @param stepId
       * @return {boolean} 是否继续
       */
      check(stepId: number): boolean;
      /**
       * 开始一步引导
       * @param stepId
       */
      begin(stepId: number): void;

      /**
       * 结束一步引导
       * @param stepId
       */
      end(stepId: number): void;
}
