
import { director, Node } from "cc";
import UIBase from "./base/UIBase";
import ResManager from "./ResManager";

export default class UIManager {

    private rootNode!:Node;

    public init(rootNode:Node){
        this.rootNode = rootNode;
        director.addPersistRootNode(rootNode);
    }

    public async open(viewId: string, data?: any, showMask = true) {
        let [bundleName, url] = viewId.split("-");
        let uiNode = await ResManager.loadPrefab(bundleName, url);
        if (uiNode) {
            let uibase = uiNode.getComponent(UIBase)!;
            let layer = this.rootNode.children[uibase.layer];
            layer.addChild(uiNode);
            uibase.onOpen && uibase.onOpen(data);
        }
    }

    public close(viewId: string | UIBase) {

    }
}