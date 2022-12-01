
import {IService } from "./Interface";

export default abstract class Service implements IService {

    // public init(data?:any) {
    //     if (typeof data == 'object') {
    //         for (const key in data) {
    //             //@ts-ignore
    //             this[key] = data[key];
    //         }
    //     }
    // }

  
    
    abstract dispose(): void;
}