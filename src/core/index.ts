import { DefaultOptions, Options, RaptorConfig, reportRaptorData } from "../types/index";
import { rewriteHistoryEvent } from "../utils/pv";

const MouseEventList: string[] = ['click', 'dblclick', 'mousedown', 'mouseup', 'mouseenter', 'mouseout', 'mouseover'];

export default class Raptor {
    config: Options;
    private version: string | undefined;

    constructor(options: Options) {
        this.config = Object.assign(this.init(), options);
        this.start();
    }

    private init(): DefaultOptions {
        this.version = RaptorConfig.version;
        // 重写事件
        window.history['pushState'] = rewriteHistoryEvent("pushState")
        window.history['replaceState'] = rewriteHistoryEvent('replaceState')
        
        return <DefaultOptions>{
            sdkVersion: this.version,
            historyRaptor: false,
            hashRaptor: false,
            domRaptor: false,
            jsError: false,
        }
    }
    // 手动设置用户id：通常后端可以自己拿到用户账号，无需手动设置
    setUserId<T extends DefaultOptions['uuid']>(uuid: T) {
        this.config.uuid = uuid;
    }
    // 额外信息
    setExtra<T extends DefaultOptions['extra']>(extra: T) {
        this.config.extra = extra;
    }
    // 手动上报;
    sendRaptor<T extends reportRaptorData>(data: T) {
        this.reportRaptor(data);
    }
    // 手动埋点事件: 该元素需要增加属性target-key;
    targetKeyReport(eventList: string[] = MouseEventList) {
        eventList.forEach(event => {
            window.addEventListener(event, (e) => {
                const target = e.target as HTMLElement;
                const targetValue = target.getAttribute('target-key');
                if (targetValue) {
                    this.sendRaptor({
                        targetKey: targetValue,
                        event
                    })
                }
            })
        })
    }

    private captureEvents<T>(eventList: string[], targetKey: string, data?: T) {
        eventList.forEach(event => {
            window.addEventListener(event, () => {
                this.reportRaptor({ event, targetKey, data })
            })
        })
    }

    private start() {
        if (this.config.historyRaptor) {
            this.captureEvents(['pushState'], 'history-pv');
            this.captureEvents(['replaceState'], 'history-pv');
            this.captureEvents(['popstate'], 'history-pv');
        }
        if (this.config.hashRaptor) {
            this.captureEvents(['hashchange'], 'hash-pv');
        }
        if (this.config.domRaptor) {
            if (!this.config.domEventList || this.config.domEventList.length === 0) {
                this.targetKeyReport();
            } else {
                this.targetKeyReport(this.config.domEventList);
            } 
        }
        if (this.config.jsError) {
            this.jsError();
        }
    }

    private jsError() {
        // 上报错误的时候，上报网络以及浏览器信息；
        this.errorEvent();
        this.promiseReject();
    }

    private errorEvent() {
        window.addEventListener('error', (e) => {
            this.sendRaptor({
                targetKey: 'error message',
                event: 'error',
                message: e.message,
                agent: navigator.userAgent,
                networkType: (window.navigator as any).connection.effectiveType
            });
        })
    }

    private promiseReject() {
        window.addEventListener('unhandledrejection', (event) => {
            event.promise.catch(error => {
                this.sendRaptor({
                    targetKey: "promise rejected",
                    event: "promise",
                    message: error,
                    agent: navigator.userAgent,
                    networkType: (window.navigator as any).connection.effectiveType
                });
            })
        })
    }

    // sendBeacon：考虑页面跳转的因素，通常业务埋点用http接口或者gif图片即可
    private reportRaptor<T>(data: T) {
        const params = Object.assign(this.config, data, { time: new Date().getTime() });
        let headers = {
            type: 'application/x-www-form-urlencoded'
        };
        let blob = new Blob([JSON.stringify(params)], headers);
        navigator.sendBeacon(this.config.requestUrl, blob);
    }
}



