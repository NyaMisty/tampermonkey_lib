var DocumentRewriter = {
    rewriteWithUrl: function(doc, url, rewriter) {
        var client = new XMLHttpRequest();
        client.open("GET", url, false); // third parameter indicates sync xhr. :(
        client.send();
        var text = client.responseText
        const lastIndex = text.lastIndexOf("<"+"/head>"); // eslint-disable-line no-useless-concat
        if (lastIndex >= 0) {
            var scripts = Injector.getInjectedScript()
            text = text.substr(0, lastIndex) + scripts + '<'+'/head>' + text.substr(lastIndex + "<"+"/head>".length) // eslint-disable-line no-useless-concat
        }
        //console.log(ret)
        var newtext = rewriter(text)
        this.rewrite(doc, newtext)
    },
    rewrite: function(doc, newbody) {
        console.log(newbody);
        doc.open()
        doc.write(newbody);
        doc.close();
    },
    init(rewritefun) {
        Injector.exposeObj({rewriteFun: rewritefun, rewriteWithUrl: this.rewriteWithUrl, rewrite: this.rewrite}, "DocumentRewriter");
        var contentScriptAppendChild = () => {
            if (window.ori_appendChild) return;
            window.ori_appendChild = Element.prototype.appendChild
            window.ori_setAttribute = Element.prototype.setAttribute

            var newSetAttribute = function() {
                //debugger;
                if (this.tagName === "IFRAME") {
                    if (arguments[0] === "src") {
                        var goodframe = true
                        try {
                            if (!this.contentWindow) {
                                goodframe = false;
                            }
                        } catch(e) {
                            goodframe = false;
                        }
                        if (!goodframe) {
                            console.log("[IFrameHooker] Ignoring setAttribute iframe that haven't been add to body: " + this)
                        } else {
                            console.log("[IFrameHooker] Setting iframe src: " + this)
                            var frameurl = arguments[1]
                            if (DocumentRewriter.rewriteFun(this, window.getFullURL(frameurl))) {
                                return;
                            }
                        }
                    }
                }
                window.ori_setAttribute.apply(this, arguments);
            }

            var newAppendChild = function() {
                if (!arguments[0]) return window.ori_appendChild.apply(this. arguments);
                var newNode = arguments[0]
                if (!newNode.getElementsByTagName) {
                    return window.ori_appendChild.apply(this, arguments);
                }

                var ret = window.ori_appendChild.apply(this, arguments);
                var frames = newNode.tagName == "IFRAME" ? [newNode] : newNode.getElementsByTagName('iframe');
                for (var newframe of frames) {
                    var frameurl = newframe.getAttribute("src");
                    console.log("[IFrameHooker] Handling appended iframe " + frameurl);
                    DocumentRewriter.rewriteFun(newframe, window.getFullURL(frameurl))
                }
                return ret;
            }

            window.Element.prototype.appendChild = newAppendChild
            window.Element.prototype.setAttribute = newSetAttribute;
        };
        Injector.injectFunc(contentScriptAppendChild);
        rewritefun(null, location.href);
    }
};

