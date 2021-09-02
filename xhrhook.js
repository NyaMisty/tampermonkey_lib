var XHRHook = {
    rewriteURL: function(url, xhr) {},
    rewriteBody: function(url, xhr, body) {},
    rewriteResp: function(url, xhr, resp) {},
    init(isdebug = false) {
        Injector.exposeObj({
            rewriteURL: this.rewriteURL,
            rewriteBody: this.rewriteBody,
            rewriteResp: this.rewriteResp,
            isdebug: isdebug,
        }, "XHRHook")
        var hookXHR = function() {
            var oldOpen, oldSend, i, xhrdbg;
            if (XHRHook.isdebug) {
                xhrdbg = function() {console.log.apply(this, arguments)}
            } else {
                xhrdbg = () => {}
            }
            if( XMLHttpRequest.hooked ) {
                return;
            }

            XMLHttpRequest.hooked = true;
            oldOpen = XMLHttpRequest.prototype.open;
            oldSend = XMLHttpRequest.prototype.send;

            var newOpen = function(){ // tamper request url
                var oriUrl = this.url = arguments[1];
                xhrdbg("[XHRHook] Open: " + this.url)
                var newUrl = XHRHook.rewriteURL(this.url, this)
                if (newUrl) {
                    this.url = arguments[1] = newUrl;
                }
                if (oriUrl !== this.url) {
                    xhrdbg("[XHRHook] Open-Hook: " + this.url)
                }
                oldOpen.apply(this, arguments);
            }
            // override the native send()
            var newSend = function() {
                xhrdbg("[XHRHook] Send: " + this.url + " from: " + location.href)

                var oriBody = arguments[0];
                var newBody = XHRHook.rewriteBody(this.url, this, oriBody);
                if (newBody !== undefined) {
                    if (newBody === false) {
                        xhrdbg("[XHRHook] Blocking request to " + this.url)
                        return;
                    }
                    arguments[0] = newBody;
                    xhrdbg("[XHRHook] Send-Rewrite body: from " + oriBody + " to " + newBody)
                }

                var that = this;
                var orichange = this.onreadystatechange || (() => {})
                var newchange = function(a, e) {
                    if (!this.url) {}
                    else if (this.readyState == 4) {
                        xhrdbg("[XHRHook] StateChangeFinish: " + this.url)
                        var response = XHRHook.rewriteResp(this.url, this, (this.responseType === 'text' || this.responseType === '') ? this.responseText : this.response)
                        if (response !== undefined) {
                            xhrdbg("[XHRHook] StateChangeFinish-Rewrite resp: " + response)
                            Object.defineProperty(this, 'response', {writable: true});
                            Object.defineProperty(this, 'responseText', {writable: true});
                            this.response = this.responseText = response;
                        }
                    }
                    return orichange(a, e)
                }
                this.onreadystatechange = newchange

                var fuck = setInterval(() => {
                    if (that.onreadystatechange !== newchange){
                        orichange = that.onreadystatechange
                        that.onreadystatechange = newchange;
                        clearInterval(fuck);
                    }
                    if (that.readyState == 4) {
                        clearInterval(fuck);
                    }
                }, 50)
                oldSend.apply(this, arguments);
            }
            XMLHttpRequest.prototype.open = newOpen;
            XMLHttpRequest.prototype.send = newSend;
            /*setInterval(() => {
                XMLHttpRequest.prototype.open = newOpen;
                XMLHttpRequest.prototype.send = newSend;
            }, 20)*/
        };
        hookXHR();
        Injector.injectFunc(hookXHR);
    }
};
