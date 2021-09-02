// from https://gist.github.com/archan937/1961799
var GMHelpers = {
    toSource_: function(object) {
        switch (typeof(object)) {
            case "undefined":
                return "undefined";
            case "string":
                return "\"" + object.replace(/\n/g, "\\n").replace(/\"/g, "\\\"") + "\"";
            case "object":
                if (object == null) {
                    return "null";
                }
                var a = [];
                if (object instanceof Array) {
                    for (var i in object) {
                        a.push(this.toSource_(object[i]));
                    };
                    return "[" + a.join(", ") + "]";
                } else {
                    for (var key in object) {
                        if (object.hasOwnProperty(key)) {
                            a.push(key + ": " + this.toSource_(object[key]));
                        }
                    };
                    return "{" + a.join(", ") + "}";
                }
            default:
                return object.toString();
        }
    }
};

var Injector = {
    _injectedScripts: [],
    _injectScript: function(text) {
        var ss = document.createElement("script")
        ss.appendChild(document.createTextNode(text));
        (document.body || document.head || document.documentElement).appendChild(ss);
    },
    injectFunc: function(fun) {
        this._injectScript('('+ fun +')();if(!window._injectedScripts) { window._injectedScripts = []; } window._injectedScripts.push('+fun+');')
        this._injectedScripts.push(fun);
    },
    exposeObj: function(obj, name) {
        this.injectFunc("() => {window."+name+"=("+GMHelpers.toSource_(obj)+")}")
    },
    getInjectedScript: function() {
        var allscript = this._injectedScripts.concat(window._injectedScripts || [])
        var scriptNodes = allscript.map((script) => '<'+'script>'+ '('+ script +')();if(!window._injectedScripts) { window._injectedScripts = []; } window._injectedScripts.push('+script+');'+'<'+'/script>'); // eslint-disable-line no-useless-concat
        var scripts = scriptNodes.join('\r\n')
        return scripts;
    },
    init() {
    }
};
Injector.exposeObj(GMHelpers, "GMHelpers");
Injector.exposeObj({_injectedScripts: [], getInjectedScript: Injector.getInjectedScript}, "Injector");
