

import { Component, _decorator, ProgressBar, } from "cc";
import { GameScene } from "../game/script/GameScene";
import GameService from "../game/script/GameService";
import { App } from "../Script/shun-framework/App";
import ResManager from "../Script/shun-framework/ResManager";
const { ccclass, property } = _decorator;
@ccclass
export default class init extends Component {
	
	@property(ProgressBar)
	private loadProgressBar!: ProgressBar;

	@property(GameScene)
	private gameScene!: GameScene;

	public async onLoad() {
		await ResManager.loadDir('game', 'pool')
		this.onEnter();
	}

	public onEnter() {
		App.ServiceCenter.add(GameService).initMap(7, 8, [[0, 10], [1, 10], [2, 10], [3, 10], [4, 10]]);
		this.gameScene.startGame();
	}
}