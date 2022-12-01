import { EventTarget } from "cc";
import { IEventCenter, IUIManager } from "./base/Interface";
import ServiceCenter from "./ServiceCenter";

export class App {

    private static uiManager: IUIManager;

    private static serviceCenter: ServiceCenter = new ServiceCenter();

    private static eventCenter: IEventCenter = new EventTarget();

    
    public static get UiManager(){
        return  this.uiManager;
    }

    public static get ServiceCenter(){
        return  this.serviceCenter;
    }

    public static get EventCenter(){
        return  this.eventCenter;
    }

    public static init(uiManager:IUIManager){
        this.uiManager = uiManager;
    }
}

