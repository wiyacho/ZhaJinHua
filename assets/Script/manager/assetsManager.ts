
export default class AssetsManager {
    private static _instance: AssetsManager;

    private assetsMap: any;

    public static get instance(): AssetsManager {
        if (!AssetsManager._instance) {
            AssetsManager._instance = new AssetsManager();
        }
        return AssetsManager._instance;
    }

    constructor() {
        this.assetsMap = [];
    }

    // 添加全局node
    public addGlobalNode(node: cc.Node): void {
        cc.log(`add node to global :${node.name}`)
        this.assetsMap[node.name] = node;
    }

    public getGlobalNode(nodeName: string): cc.Node {
        return this.assetsMap[nodeName];
    }

    public release(): void {
        for (let key in this.assetsMap) {
            delete this.assetsMap[key];
        }
    }
}