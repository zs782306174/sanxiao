

import { Component, _decorator, Enum} from "cc";
import { App } from "../App";
import { IUi } from "./Interface";

export enum UILayer{
    base,
    big,
    popup,
    message
}
const { ccclass, property } = _decorator;
@ccclass
export default class UIBase extends Component implements IUi {

    @property({type:Enum(UILayer)})
    layer:UILayer = UILayer.base;
    
    onOpen?(data?: any): void;

    onClose?(): void;

    public close() {
       App.UiManager.close(this);
    }
}