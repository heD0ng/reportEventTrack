/**
 * @uuid  用户名、mis号等身份信息
 * @requestUrl 接口地址、必填
 * @historyRaptor history模式上报
 * @hashRaptor hash模式上报
 * @domRaptor 携带target-key上报事件
 * @domEventList 自定义上报事件
 * @sdkVersion  sdk版本
 * @extra extra 透传字段
 * @jsError js、promise 异常上报
 */
export interface DefaultOptions {
    uuid: string | undefined;
    requestUrl: string | undefined;
    historyRaptor: boolean;
    hashRaptor: boolean;
    domRaptor: boolean;
    domEventList: string[];
    sdkVersion: string | number;
    extra: Record<string, any> | undefined;
    jsError: boolean;
}

// 上报地址必填
export interface Options extends Partial<DefaultOptions> {
    requestUrl: string,
}


export enum RaptorConfig {
    version = '1.0.0'
}

export type reportRaptorData = {
    [key: string]: any,
    event: string,
    targetKey: string
}