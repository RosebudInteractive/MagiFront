export default emitter;
declare const emitter: Emitter;
declare class Emitter {
    listeners: any[];
    addListener(type: any, callback: any): void;
    emit(type: any, args: any): void;
}
