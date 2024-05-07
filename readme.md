# 三消游戏demo

#### 游戏启动
```typescript
import { Component, _decorator, ProgressBar, Prefab, } from "cc";
import { App } from "./Script/shun-framework/App";
import ResManager from "./Script/shun-framework/ResManager";
import { GameScene } from "./sanxiao/script/GameScene";
import GameService from "./sanxiao/script/GameService";
const { ccclass, property } = _decorator;
@ccclass
export default class init extends Component {

	@property(ProgressBar)
	private loadProgressBar!: ProgressBar;

	@property(GameScene)
	private gameScene!: GameScene;

	public async onLoad() {
		await ResManager.loadDir('sanxiao', 'pool', Prefab, (c, t) => {
			this.loadProgressBar.progress = c / t;
		})
		this.onEnter();
	}

	public onEnter() {
		App.ServiceCenter.add(GameService).initMap(7, 8, [[0, 10], [1, 10], [2, 10], [3, 10], [4, 10]]);
		this.gameScene.startGame();
	}
}
```
#### 服务 GameService
```typescript

import Service from '../../Script/shun-framework/base/Service';
import Utils from '../../Script/shun-framework/Utils';
export class Cell {

    //实际x坐标
    x!: number;

    //实际y坐标
    y!: number;

    //当前临时x坐标
    startX!: number;

    //当前临时y坐标
    startY!: number;

    //格子类型
    type!: CellType;

    //道具类型
    daoju: number = 0;

    //格子状态
    state!: number

    constructor(x: number, y: number, type: number, startX: number, startY: number) {
        this.x = x;
        this.y = y;
        this.startX = startX;
        this.startY = startY;
        this.type = type;
        this.state = CellState.life;
    }
}
export enum CellState {
    life,
    die,

}
export enum CellType {
    red,
    yellow,
    blue,
    green,
    pink,

}
export default class GameService extends Service {


    public width!: number;
    public height!: number;
    private map: Cell[][] = [];
    private typeArr: number[][] = [];

    //有所变化的格子列表
    private changedCells: Cell[] = [];
    
    //即将被销毁的格子列表
    private emptyCells: Cell[] = [];

    /**
     * 初始化地图
     * @param width 横向格子数量
     * @param height 纵向格子数量
     * @param typeArr 格子类型权重数组
     */
    public initMap(width: number, height: number, typeArr: number[][]) {
        this.width = width;
        this.height = height;
        this.typeArr = typeArr;
        this.map.length = 0;
        for (let y = 0; y < this.height; y++) {
            let line: Cell[] = [];
            this.map.push(line);
            for (let x = 0; x < this.width; x++) {
                let lastX = x - 1;
                let lastY = y - 1;
                let typeArr = this.typeArr.concat();
                let type = typeArr.length;
                if (lastX >= 0) {
                    type = this.map[y][lastX].type;
                    typeArr.splice(type, 1);
                }
                if (lastY >= 0) {
                    let type1 = this.map[lastY][x].type;
                    if (type1 != type) {
                        if (type1 > type) {
                            --type1;
                        }
                        typeArr.splice(type1, 1);
                    }
                }
                let cell = this.createRandomCell(x, y, typeArr)
                
                line.push(cell)

            }

        }
    }
    public getMap() {
        return this.map;
    }
    /**
     * 判断是否相邻
     * @returns 
     */
    public checkIsNeighbor(cell1: Cell, cell2: Cell) {
        let sameH = cell1.y == cell2.y && (cell1.x == cell2.x + 1 || cell1.x == cell2.x - 1);
        if (sameH) {
            return true;
        }
        let sameV = cell1.x == cell2.x && (cell1.y == cell2.y + 1 || cell1.y == cell2.y - 1);
        return sameV;
    }

    /**
     * 交换两个格子
     * @param x1 
     * @param y1 
     * @param x2 
     * @param y2 
     * @returns 被销毁的格子
     */
    public exchange(x1: number, y1: number, x2: number, y2: number) {

        let cell1 = this.map[y1][x1];
        let cell2 = this.map[y2][x2];
        this.map[y1][x1] = cell2;
        cell2.x = x1;
        cell2.y = y1;
        this.map[y2][x2] = cell1;
        cell1.x = x2;
        cell1.y = y2;
        this.emptyCells.length = 0;
        if (cell1.daoju && cell2.daoju) {
            this.crashCell(cell1);
            this.crashCell(cell2);
            return this.emptyCells;
        }
        let canCresh = false;
        let arr = this.checkCanCrash(cell1);
        if (arr.length >= 3) {
            canCresh = true;
            for (const cell of arr) {
                this.crashCell(cell);
            }
        }
        arr = this.checkCanCrash(cell2);
        if (arr.length >= 3) {
            canCresh = true;
            for (const cell of arr) {
                this.crashCell(cell);
            }
        }
        if (!canCresh) {
            this.map[y1][x1] = cell1;
            cell1.x = x1;
            cell1.y = y1;
            this.map[y2][x2] = cell2;
            cell2.x = x2;
            cell2.y = y2;
        }
        return this.emptyCells;
    }

    /**
     * 掉落
     * @param emptyCells 被销毁的格子
     */
    public fall(emptyCells: Cell[]) {
        this.changedCells.length = 0;
        let zongduis: { [key: number]: Cell[] } = {}
        emptyCells.sort((a, b) => { return a.y - b.y })
        for (const cell of emptyCells) {
            if (!zongduis[cell.x]) {
                zongduis[cell.x] = [];
            } else {
                continue;
            }
            for (let y = cell.y; y < this.height; y++) {
                let currentCell = this.map[y][cell.x];
                if (currentCell.state == CellState.life) {
                    currentCell.startY = currentCell.y;
                    currentCell.startX = cell.x;
                    currentCell.x = cell.x;
                    currentCell.y -= zongduis[cell.x].length;
                    this.map[currentCell.y][currentCell.x] = currentCell;
                    this.changedCells.push(currentCell);
                } else {
                    currentCell.startY = this.height + zongduis[cell.x].length;
                    currentCell.startX = cell.x;
                    currentCell.x = cell.x;
                    zongduis[cell.x].push(currentCell);
                }
            }
        }
        for (const key in zongduis) {
            let list = zongduis[key];
            for (const cell of list) {
                cell.state = CellState.life;
                cell.type = Utils.getRandomFromArr(this.typeArr)!;
                cell.y = cell.startY - list.length;
                this.map[cell.y][cell.x] = cell;
                this.changedCells.push(cell);
            }
        }

        return this.changedCells;
    }

    /**
     * 掉落后再次进行消除检测
     * @returns 
     */
    public checkAfterFall() {
        this.emptyCells.length = 0;
        for (const cell of this.changedCells) {
            let canCreshCells = this.checkCanCrash(cell);
            for (const canCreshCell of canCreshCells) {
                this.crashCell(canCreshCell);
            }
        }
        return this.emptyCells;
    }

    /**
     * 判断该格子附近是否可三消
     */
    private checkCanCrash(startCell: Cell) {
        let horizontalCells = [];
        let verticalCells = [];
        let breakHorizontal = false;
        let breakVertical = false;
        for (let index = -2; index <= 2; index++) {
            let newX = startCell.x + index;
            let newY = startCell.y + index;
            if (newX >= 0 && newX < this.width && !breakHorizontal) {
                let cell = this.map[startCell.y][newX]

                if (cell.type == startCell.type) {
                    horizontalCells.push(cell);
                } else {
                    if (horizontalCells.length < 3) {
                        horizontalCells.length = 0;
                    } else {
                        breakHorizontal = true;
                    }
                }
            }
            if (newY >= 0 && newY < this.height && !breakVertical) {
                let cell = this.map[newY][startCell.x];
                if (cell.type == startCell.type) {
                    verticalCells.push(cell);
                } else {
                    if (verticalCells.length < 3) {
                        verticalCells.length = 0;
                    } else {
                        breakVertical = true;
                    }

                }

            }
        }
        let canCresh: Cell[] = [];
        if (horizontalCells.length >= 3) {
            canCresh = horizontalCells;
        }
        if (verticalCells.length >= 3) {
            for (let index = 0; index < verticalCells.length; index++) {
                const cell = verticalCells[index];
                if (cell == startCell && horizontalCells.length >= 3) {
                    continue;
                }
                canCresh.push(cell);
            }
        }

        return canCresh;
    }
    /**
     * 销毁格子
     */
    private crashCell(cell: Cell) {
        if (this.emptyCells.indexOf(cell) != -1) {
            return;
        }
        cell.state = CellState.die;
        this.emptyCells.push(cell);

        if (cell.daoju) {
            this.daoju(cell);
        }

    }

    /**
     * 执行格子的道具效果
     */
    private daoju(cell: Cell) {

    }

    private createRandomCell(x: number, y: number, typeArr: number[][]) {
        let type = Utils.getRandomFromArr(typeArr)!;
        return new Cell(x, y, type, x, y);
    }


    public dispose(): void {
        throw new Error('Method not implemented.');
    }

}
```
#### 视图 GameScene
```typescript
import { _decorator, Component, Node, Widget, EventTouch, tween, v3, UITransform } from 'cc';
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
    
    private gameScenePool = new PoolManager('sanxiao');

    private cellNodes: Array<Array<Node | null>> = [];

    private selectedCell: Node[] = [];

    /**
     * 开始游戏
     */
    public startGame() {
        this.cellPanel.getComponent(Widget)?.updateAlignment();
        this.cellPanel.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.cellPanel.on(Node.EventType.TOUCH_MOVE, this.onTouchEnd, this);
        this.initMap();
    }

    /**
     * 选中格子，如果选中列表有2个格子则尝试交换
     * @param event 
     */
    private onTouchStart(event: EventTouch) {
        let pos = event.getUILocation();
        let transform = this.cellPanel.getComponent(UITransform);
        var p = transform?.convertToNodeSpaceAR(v3(pos.x,pos.y))
        let x = Math.floor(p!.x / Const.CELL_WIDTH);
        let y = Math.floor(p!.y / Const.CELL_WIDTH);
        let cellNode = this.cellNodes[y][x]!;
        let startNode = this.selectedCell[0];
        if (cellNode != startNode) {
            this.selectedCell.push(cellNode);
            cellNode.getComponent(CellView)!.selected = true;
            if (this.selectedCell.length == 2) {
                startNode.getComponent(CellView)!.selected = false;
                this.exchange();
                event.propagationStopped = true;
            }
        }
    }

    /**
     * 拖动格子，如果选中列表有2个格子则尝试交换
     * @param event 
     */
    private onTouchEnd(event: EventTouch) {
        let startNode = this.selectedCell[0];
        let pos = event.getUILocation();
        let transform = this.cellPanel.getComponent(UITransform);
        var p = transform?.convertToNodeSpaceAR(v3(pos.x,pos.y))
        let x = Math.floor(p!.x / Const.CELL_WIDTH);
        let y = Math.floor(p!.y / Const.CELL_WIDTH);

        let cellNode = this.cellNodes[y][x]!;
        if (cellNode != startNode) {
            this.selectedCell.push(cellNode);
            if (this.selectedCell.length == 2) {
                this.exchange();
                event.propagationStopped = true;
            }
        }
    }

    /**
     * 尝试交换
     * @returns 
     */
    private exchange() {
        let gameService = App.ServiceCenter.get(GameService)!;
        let cellView1 = this.selectedCell[0].getComponent(CellView)!;
        let cellView2 = this.selectedCell[1].getComponent(CellView)!;
        let cell1 = cellView1!.data!;
        let cell2 = cellView2!.data!;
        if (!gameService.checkIsNeighbor(cell1, cell2)) {
            
            this.selectedCell[0] = this.selectedCell[1];
            this.selectedCell.length = 1;
            //两个格子不相邻，不可交换，并选中最后选中的格子
            return;
        }
        this.cellNodes[cell1.y][cell1.x] = cellView2!.node!;
        this.cellNodes[cell2.y][cell2.x] = cellView1!.node!;
        cellView1.selected = false;
        cellView2.selected = false;
        //移动格子并调用Service
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
                //本次操作不可消除并执行撤回动作
                this.cellNodes[cell1.y][cell1.x] = cellView1!.node!;
                this.cellNodes[cell2.y][cell2.x] = cellView2!.node!;
                tween(this.cellNodes[cell1.y][cell1.x]).to(0.2, { position: v3(cell1.x * Const.CELL_WIDTH, cell1.y * Const.CELL_WIDTH) }).start();
                tween(this.cellNodes[cell2.y][cell2.x]).to(0.2, { position: v3(cell2.x * Const.CELL_WIDTH, cell2.y * Const.CELL_WIDTH) }).start();
            }
        }).start();
    }
    /**
     * 初始化地图
     */
    private initMap() {
        let gameService = App.ServiceCenter.get(GameService)!;
        let map = gameService.getMap();
        for (let y = 0; y < gameService.height; y++) {
            this.cellNodes[y] = [];
            for (let x = 0; x < gameService.width; x++) {
                const cell = map[y][x];
                let node = this.createCell(cell);
                //this.moveCell(node);
            }
        }
    }
    /**
     * 格子掉落
     * @param cells 
     */
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

    /**
     * 移动格子
     * @param cellNode 
     * @param speed 
     * @returns 
     */
    private moveCell(cellNode: Node, speed = 8) {
        return new Promise((resovle) => {
            let cell = cellNode.getComponent(CellView)!.data;
            let time = (cell.startY - cell.y) / speed;
            tween(cellNode).to(time, { position: v3(cell.x * Const.CELL_WIDTH, cell.y * Const.CELL_WIDTH) }).call(() => {
                this.cellNodes[cell.y][cell.x] = cellNode;
                resovle(cellNode);
            }).start();
        })

    }

    /**
     * 批量销毁格子
     * @param cells 
     */
    private async crashAll(cells: Cell[]) {
        let all = [];
        for (const cell of cells) {
            let cellNode = this.cellNodes[cell.y][cell.x]!;
            all.push(this.crash(cellNode));
        }
        await Promise.all(all);
        await Utils.waitSomeTimes(200);
    }

    /**
     * 销毁格子
     * @param cellNode 
     */
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

    /**
     * 生成格子
     * @param cellNode 
     */
    private createCell(cell: Cell) {
        let cellNode = this.gameScenePool.getAsync(Prefab.Cell)!;
        cellNode.getComponent(CellView)!.init(cell);
        this.cellPanel.addChild(cellNode);
        this.cellNodes[cell.y][cell.x] = cellNode;
        return cellNode;
    }
    /**
     * 回收格子
     * @param cellNode 
     */
    private recycle(cell: Cell) {

        let cellNode = this.cellNodes[cell.y][cell.x];
        this.cellNodes[cell.y][cell.x] = null;
        cellNode && this.gameScenePool.put(cellNode);
    }

    protected onDestroy() {
        this.cellPanel.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.cellPanel.off(Node.EventType.TOUCH_MOVE, this.onTouchEnd, this);
        this.gameScenePool.clearAll();
    }

}



```
#### 目前没有任何特效
#### 没有添加任何道具
