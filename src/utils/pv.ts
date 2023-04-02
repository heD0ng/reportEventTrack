export const rewriteHistoryEvent = <T extends keyof History>(type: T): () => any => {
    const raw = history[type];
    // this: 伪参数；或者tsconfig中开启noImplicitThis属性
    return function (this: any) {
        const res = raw.apply(this, arguments);
        const e = new Event(type);
        window.dispatchEvent(e);
        return res;
    }
}
