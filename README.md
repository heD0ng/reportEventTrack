# Raptor
这是一个埋点SDK
This is a buried SDK by hd.

使用方法如下
The usage is as follows

用法
usage
```js
const tr = new Raptor({
    requestUrl:"http://localhost:3000/xxxx", //接口地址
    historyRaptor:true,
    domRaptor:true,
    jsError:true,
})
//添加用户id
tr.setUserId()

//自定义上报 必须要有 event 和 targetKey  两个字段
tr.sendRaptor({xxx})
```
