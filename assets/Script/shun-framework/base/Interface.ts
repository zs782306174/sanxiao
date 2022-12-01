export interface Idispose {
    dispose(): void;
}

export interface IUi {
    onOpen?(data?: any): void;

    onClose?(): void;

    close(): void;
}

export interface IService extends Idispose{

}

declare type Constructor<T> = new (...args: any[]) => T;

export interface IServiceCenter{
    add<T extends IService>(service: Constructor<T>): T;
    get<T extends IService>(service: Constructor<T>): T | null;
    remove<T extends IService>(service: Constructor<T>): void
}

export interface IUIManager {
    open(viewId: string, data?: any, showMask?:boolean): Promise<void>;
    close(viewId: string | IUi): void;
}

export interface IEventCenter {
    on<TFunction extends (...any: any[]) => void>(eventName: string | number, callback: TFunction, thisArg?: any): void;
    once<TFunction extends (...any: any[]) => void>(eventName: string | number, callback: TFunction, thisArg?: any): void;
    off<TFunction extends (...any: any[]) => void>(eventName: string | number, callback: TFunction, thisArg?: any): void;
    targetOff(target: any): void;
}