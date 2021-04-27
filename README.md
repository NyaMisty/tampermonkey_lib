# Misty的Tampermonkey脚本库

这是一个我自己手写的脚本库，主要覆盖了我日常需要用的各种功能。大部分脚本不需要unsafeWindow以及其他特殊grant。

## Injector

```
var GMHelpers = {
    toSource_(object)     // 火狐的toSource纯js版（注意不支持循环引用）
                          // 这个实现有一部分bug，object中的方法必须要 func1: function(fun) {} 这么定义才可以正常工作
                          // Injector会默认expose这个类到window中
}

var Injector = {
    injectFunc(fun),      // 通过<script>注入并执行一个函数
    exposeObj(obj, name), // 向window中set一个名为name的obj
    getInjectedScript(),  // 将所有已经inject或expose的操作输出为一个js snippet
    init(),               // 暂时没用
}
```


## XHRHook

```
var XHRHook = {
    rewriteURL: function(url, xhr) {},          // 回调函数，初始化时通过XHRHook.rewriteXXX设置为对应函数
                                                // 返回undefined时，不做修改，否则将对应东西rewrite掉
    rewriteBody: function(url, xhr, body) {},   
    rewriteResp: function(url, xhr, resp) {},
    init(isdebug = false),                      // 需要调用此方法初始化hook，isdebug = true时会输出所有XHR请求
}
```

## DocumentRewriter
```
var DocumentRewriter = {
    rewriteWithUrl: function(dpc, url, rewriter),        // 通过XHR获取页面后，调用rewriter改写返回内容，然后再写入到doc中
    rewrite: function(doc, newbody),                     // 将doc直接改写为newbody的内容
    init(rewritefun),                               // init中传rewritefun(newframe, frameurl)，主页面newframe为null，其余时为iframe node
                                                    // init后如有iframe出现，会动态调用此方法重写，并将所有已应用的inject再次注入
}
```

## ESModuleHook
```
var ESModuleHook = {
    init(),                  // 提前设置好 window.rewriteESModule(function)，接收ES module的closure，返回修改后的新function closure
}