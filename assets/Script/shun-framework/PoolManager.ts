import { NodePool, Prefab, Node, instantiate } from "cc";
import ResManager from "./ResManager";


export default class PoolManager {

    constructor(bundleName: string) {
        this.bundleName = bundleName;
    }
    private bundleName: string;

    private poolMap: Map<string, NodePool> = new Map<string, NodePool>();

    public async preload() {
        await ResManager.loadDir(this.bundleName, 'pool', Prefab);
    }

    private getPool(name: string): NodePool {
        let pool = this.poolMap.get(name);
        if (!pool) {
            pool = new NodePool();
            this.poolMap.set(name, pool);
        }
        return pool;
    }

    public put(node: Node) {
        let pool = this.getPool(node.name);
        pool.put(node);
    }

    public clearAll(){
        this.poolMap.forEach((pool)=>{
            pool.clear();
        })
    }

    public clear(name: string) {
        let pool = this.getPool(name);
        pool.clear();
    }
    
    public getAsync(name: string) {
        let pool = this.getPool(name);
        let node: Node | null = null;
        if (pool.size() > 0) {
            node = pool.get();
        } else {
            let prefab = ResManager.get<Prefab>(this.bundleName, 'pool/' + name)!;
            node = instantiate(prefab);
        }
        return node!;
    }

    public async get(name: string): Promise<Node> {
        let pool = this.getPool(name);
        let node: Node | null = null;
        if (pool.size() <= 0) {
            let prefab = await ResManager.loadPrefab(this.bundleName, 'pool/' + name);
            node = instantiate(prefab);
        } else {
            node = pool.get();
        }
        return node!;
    }
}
