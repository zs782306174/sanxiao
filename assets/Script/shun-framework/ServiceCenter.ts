import { IService } from "./base/Interface";

declare type Constructor<T> = new (...args: any[]) => T;
export default class ServiceCenter {

    services: Map<Constructor<IService>, IService> = new Map();
    
    public add<T extends IService>(service: Constructor<T>): T {
        let s = new service();
        this.services.set(service, s);
        return s;
    }
    public get<T extends IService>(service: Constructor<T>): T | null {
        let s = this.services.get(service) as T;
        return s;
    }

    public remove<T extends IService>(service: Constructor<T>): void {
        let s = this.services.get(service) as T;
        if (s) {
            s.dispose();
            this.services.delete(service);
        }
        
    }
}