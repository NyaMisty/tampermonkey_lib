var ESModuleHook = {
    init() {
        var hookObjDefProp = function() {
            window.ori_call = Function.prototype.call
            window.moduleGet = new Set()
            Function.prototype.call = function(context) {
                if (context === Function.prototype.call) {
                    console.log(arguments);
                    return arguments[0].apply(window, [...arguments].slice(1))
                }
                var th = this
                try {
                    if (arguments[1].exports !== undefined && arguments[1].exports === arguments[0] && arguments[1].exports === arguments[2]) {
                        if (!window.moduleGet.has(arguments[3])) {
                            console.log("got moduleGet!");
                            console.log(arguments[3])
                            window.moduleGet.add(arguments[3])
                        }
                        console.log(this, arguments)
                        var fun = this.toString()
                        var newfun = window.rewriteESModule(this);
                        th = newfun;
                        //Function.prototype.call = window.ori_call
                    }
                } catch(e) {
                }
                return window.ori_call.apply(th, arguments);
            }
        }
        Injector.injectFunc(hookObjDefProp);
    }
};