export default class Utils {

    static getRandomFromArr(array: number[][]) {
        let total = 0;
        let wightArr = [];
        for (let index = 0; index < array.length; index++) {
            const pair = array[index];
            const w = pair[1];
            total += w;
            wightArr.push(total);
        }
        let random = Math.random() * total;
        for (let index = 0; index < array.length; index++) {
            const pair = array[index];
            const w = wightArr[index];
            const value = pair[0];
            if (random < w) {
                return value
            }
        }
    }
    
    static waitSomeTimes(time: number) {
        return new Promise((resovle, reject) => {
            setTimeout(() => {
                resovle(null);
            }, time);
        })
    }
}