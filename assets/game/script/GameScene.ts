import { _decorator, Component, Node, Widget, EventTouch, tween, v3, UITransform, utils } from 'cc';
import { App } from '../../Script/shun-framework/App';
import PoolManager from '../../Script/shun-framework/PoolManager';
import Utils from '../../Script/shun-framework/Utils';
import Const from './Const';
import GameService, { Cell } from './GameService';
import CellView, { CellAnima } from './view/CellView';
const { ccclass, property } = _decorator;
export enum Prefab {
    Cell = "Cell"


}
@ccclass('GameScene')
export class GameScene extends Component {

    @property(Node)
    private cellPanel!: Node;

    @property(Node)
    private maskNode!: Node;
    
    private gameScenePool = new PoolManager('game');

    private cellNodes: Array<Array<Node | null>> = [];

    private selectedCell: Node[] = [];

    protected onLoad() {

    }

    public startGame() {
        this.cellPanel.getComponent(Widget)!.updateAlignment();
        this.cellPanel.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.initMap();
    }

    private onTouchEnd(event: EventTouch) {
        let pos = event.getUILocation();
        let x = Math.floor(pos.x / Const.CELL_WIDTH);
        let y = Math.floor(pos.y / Const.CELL_WIDTH);

        let cellNode = this.cellNodes[y][x]!;

        this.selectedCell.push(cellNode);
        if (this.selectedCell.length == 2) {
            this.exchange();
        }
    }

    private exchange() {
        let gameService = App.ServiceCenter.get(GameService)!;
        let cellView1 = this.selectedCell[0].getComponent(CellView);
        let cellView2 = this.selectedCell[1].getComponent(CellView);
        let cell1 = cellView1!.data!;
        let cell2 = cellView2!.data!;
        if (!gameService.checkIsNeighbor(cell1, cell2)) {
            this.selectedCell[0] = this.selectedCell[1];
            this.selectedCell.length = 1;
            return;
        }
        this.cellNodes[cell1.y][cell1.x] = cellView2!.node!;
        this.cellNodes[cell2.y][cell2.x] = cellView1!.node!;
        tween(this.cellNodes[cell2.y][cell2.x]).to(0.2, { position: v3(cell2.x * Const.CELL_WIDTH, cell2.y * Const.CELL_WIDTH) }).start();
        tween(this.cellNodes[cell1.y][cell1.x]).to(0.2, { position: v3(cell1.x * Const.CELL_WIDTH, cell1.y * Const.CELL_WIDTH) }).call(async () => {
            let all = gameService.exchange(cell1.x, cell1.y, cell2.x, cell2.y);
            this.selectedCell.length = 0;
            if (all.length > 0) {
                this.maskNode.active = true;
                await this.crashAll(all);
                let cells = gameService.fall(all);
                await this.dropCells(cells);
            } else {
                this.cellNodes[cell1.y][cell1.x] = cellView1!.node!;
                this.cellNodes[cell2.y][cell2.x] = cellView2!.node!;
                tween(this.cellNodes[cell1.y][cell1.x]).to(0.2, { position: v3(cell1.x * Const.CELL_WIDTH, cell1.y * Const.CELL_WIDTH) }).start();
                tween(this.cellNodes[cell2.y][cell2.x]).to(0.2, { position: v3(cell2.x * Const.CELL_WIDTH, cell2.y * Const.CELL_WIDTH) }).start();
            }
        }).start();
    }

    private initMap() {
        let gameService = App.ServiceCenter.get(GameService)!;
        let map = gameService.getMap();
        for (let y = 0; y < gameService.height; y++) {
            this.cellNodes[y] = [];
            for (let x = 0; x < gameService.width; x++) {
                const cell = map[y][x];
                let node = this.createCell(cell);
                this.moveCell(node);
            }
        }
    }

    private async dropCells(cells: Cell[]) {
        let all: Promise<any>[] = [];
        let gameService = App.ServiceCenter.get(GameService)!;
        for (const cell of cells) {
            let cellNode = null;
            if (cell.startY >= gameService.height) {
                cellNode = this.createCell(cell);
            } else {
                cellNode = this.cellNodes[cell.startY][cell.startX];
                cellNode!.getComponent(CellView)!.init(cell);
            }
            this.cellNodes[cell.y][cell.x] = cellNode;
            all.push(this.moveCell(cellNode!));
        }
        await Promise.all(all);
        let crashes = gameService.checkAfterFall();
        if (crashes.length > 0) {
            await this.crashAll(crashes)
            let cells = gameService.fall(crashes);
            await this.dropCells(cells);
        }else{
            this.maskNode.active = false;
        }
    }

    private moveCell(cellNode: Node, speed = 4) {
        return new Promise((resovle) => {
            let cell = cellNode.getComponent(CellView)!.data;
            let time = (cell.startY - cell.y) / speed;
            tween(cellNode).to(time, { position: v3(cell.x * Const.CELL_WIDTH, cell.y * Const.CELL_WIDTH) }).call(() => {
                this.cellNodes[cell.y][cell.x] = cellNode;
                resovle(cellNode);
            }).start();
        })

    }

    private async crashAll(cells: Cell[]) {
        let all = [];
        for (const cell of cells) {
            let cellNode = this.cellNodes[cell.y][cell.x]!;
            all.push(this.crash(cellNode));
        }
        await Promise.all(all);
        await Utils.waitSomeTimes(200);
    }

    private async crash(cellNode: Node) {
        let cellView = cellNode.getComponent(CellView)!;
        if (cellView.data.daoju) {
            switch (cellView.data.daoju) {
                case 0:

                    break;

                case 1:

                    break;
                case 2:

                    break;
            }
        }
        await cellView.playAnim(CellAnima.die);
        this.recycle(cellView.data);
    }

    private createCell(cell: Cell) {
        let cellNode = this.gameScenePool.getAsync(Prefab.Cell)!;
        cellNode.getComponent(CellView)!.init(cell);
        this.cellPanel.addChild(cellNode);
        this.cellNodes[cell.y][cell.x] = cellNode;
        return cellNode;
    }

    private recycle(cell: Cell) {

        let cellNode = this.cellNodes[cell.y][cell.x];
        this.cellNodes[cell.y][cell.x] = null;
        cellNode && this.gameScenePool.put(cellNode);
    }

    private gameOver() {
        this.cellPanel.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    protected onDestroy() {
        this.gameScenePool.clearAll();
    }
}


