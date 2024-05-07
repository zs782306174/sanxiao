

import { Component, _decorator, Sprite, Node, UITransform, Animation, SpriteFrame, } from "cc";

import Const from "../Const";
import { Cell } from "../GameService";
const { ccclass, property } = _decorator;
export enum CellAnima {
    shake = 'shake',
    die = 'die',
}
@ccclass
export default class CellView extends Component {

    @property(Sprite)
    private avatarSprite!: Sprite;

    @property(Animation)
    private animation!: Animation;

    @property(Node)
    private selcedFrame!: Node;

    @property(Node)
    private effectNode!: Node;

    @property(SpriteFrame)
    bgFrames:SpriteFrame[] = [];

    private cellData!: Cell;

    public get selected() {
        return this.selcedFrame.active;
    }

    public set selected(selected) {
        this.selcedFrame.active = selected;
    }

    public get data() {
        return this.cellData;
    }

    public set data(cell: Cell) {
        this.cellData = cell;
    }

    public init(cell: Cell) {
        this.cellData = cell;
        
        this.avatarSprite.spriteFrame = this.bgFrames[cell.type];
        this.node.setPosition(cell.startX * Const.CELL_WIDTH, cell.startY * Const.CELL_WIDTH);
    }

    public get pos() {
        return this.getComponent(UITransform)!.convertToWorldSpaceAR(this.effectNode.position)
    }
    
    public async playAnim(name: CellAnima): Promise<Node> {
        return new Promise((resovle, reject) => {
            resovle(this.node);
            // this.animation.on(Animation.EventType.FINISHED, () => {
            //     this.animation.off(Animation.EventType.FINISHED);
            //     resovle(this.node);
            // })
            // this.animation.play(name);
        })
    }
}