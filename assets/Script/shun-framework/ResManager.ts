import { Node, Asset, assetManager, AssetManager, AudioSource, ImageAsset, instantiate, Prefab, resources, Sprite, SpriteAtlas, SpriteFrame, AudioClip } from "cc";
declare type ResExt = { ext: string }
declare type ProgressCallBack = (finished: number, total: number, item: AssetManager.RequestItem) => {}
declare type Constructor<T = unknown> = new (...args: any[]) => T;
/**
 * ResManger
 */
export default class ResManager {

    public static async loadBundle(name: string): Promise<AssetManager.Bundle> {
        return new Promise((resolve, reject) => {
            assetManager.loadBundle(name, (err, bundle) => {
                if (err)
                    reject(err)
                else
                    resolve(bundle)
            })
        })
    }

    public static async preloadScene(bundleName: string, name: string, progressCallback?: ProgressCallBack): Promise<any> {
        const bundle = await this.loadBundle(bundleName);
        return new Promise((resolve, reject) => {
            bundle.preloadScene(name, progressCallback!, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(err);
                }
            })
        })
    }

    public static async preloadDir(bundleName: string, name: string, progressCallback?: ProgressCallBack): Promise<any> {
        const bundle = await this.loadBundle(bundleName);
        return new Promise((resolve, reject) => {
            bundle.preloadDir(name, progressCallback!, (err, assets) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(assets);
                }
            })
        })
    }

    public static async loadDir<T extends Asset>(bundleName: string, url: string, assetType?: typeof Asset, progressCallback?: (c: number, t: number) => void,): Promise<T[]> {
        const bundle = await this.loadBundle(bundleName);
        return new Promise((resolve, reject) => {
            //@ts-ignore
            bundle.loadDir(url, assetType, progressCallback!, (err, res: T[]) => {
                if (err)
                    reject(err);
                else
                    resolve(res);
            });
        })
    }

    public static async loadRes<T extends Asset>(bundleName: string, url: string, assetType: typeof Asset): Promise<T> {
        const bundle = await this.loadBundle(bundleName);
        return new Promise<T>((resolve, reject) => {
            //@ts-ignore
            bundle.load(url, assetType, (err, asset: T) => {
                if (err) {
                    reject(err);
                } else
                    resolve(asset);
            })
        })
    }

    public static async loadRemote<T extends Asset>(url: string, ext?: ResExt, cb?: Function): Promise<T> {
        return new Promise<T>((resolve, reject) => {

            const res = resources.get(url) as T;

            if (res) {
                if (cb)
                    cb(res);
                resolve(res);
                return;
            }
            //@ts-ignore
            assetManager.loadRemote<T>(url, ext, (err, res) => {
                if (err) {
                    reject(err);
                    return;
                }
                if (cb)
                    cb(res);
                resolve(res);
            });
        })

    }

    public static get<T extends Asset>(bundleName: string, url: string): T | null {
        let bundle = assetManager.getBundle(bundleName);
        if (bundle) {
            return bundle.get(url) as T;
        } else {
            return null;
        }
    }

    public static async setSpriteImage(sprite: Sprite, url: string, bundleName?:string) {
        if (bundleName) {
            let img = await this.loadRes<SpriteFrame>(bundleName, url, SpriteFrame);
            sprite.spriteFrame = img;
        } else {
            let img = await this.loadRemote<ImageAsset>(url, { ext: '.png' });
            sprite.spriteFrame = SpriteFrame.createWithImage(img);
        }

    }

    public static async setSpriteImageFromAtla(sprite: Sprite, bundleName: string, atlaUrl: string, name: string) {
        let atla = await this.loadRes<SpriteAtlas>(bundleName, atlaUrl, SpriteAtlas);
        sprite.spriteFrame = atla.getSpriteFrame(name);
    }

    public static async loadPrefab(bundleName: string, url: string): Promise<Node> {
        let prefab = await this.loadRes<Prefab>(bundleName, url, Prefab);
        let node = instantiate(prefab);
        return node;
    }

    public static async setAudioSource(audioSource: AudioSource, url: string, isLoop: boolean, bundleName?: string) {
        if (bundleName) {
            audioSource.clip = await this.loadRes<AudioClip>(bundleName, url, AudioClip);
        } else {
            audioSource.clip = await this.loadRemote<AudioClip>(url);
        }
        audioSource.loop = isLoop;
        audioSource.play();
    }
}