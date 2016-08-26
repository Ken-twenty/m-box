(function (window) {

    var iArray = [],
        push = iArray.push,
        document = window.document;

    //main
    function itcast (selector) {
        return new itcast.fn.init(selector);
    }

    //function_init_users
    itcast.fn = itcast.prototype = {
        constructor:itcast,
        selector : "",
        length : 0,
        init:function (selector,context) {
            if (!selector) return this;
            if (itcast.isString(selector)) {
                if (itcast.isHTML(selector)) {
                    push.apply(this,itcast.parseHTML(selector));
                } else {
                    push.apply(this,select(selector,context));
                    this.selector = selector;
                    this.context = context || document;
                }
                return this;
            }
            if (itcast.isFunction(selector)) {
                var oldFn = window.onload;
                if (itcast.isFunction(oldFn)) {
                    window.onload = function () {
                        oldFn();
                        selector();
                    };
                } else {
                    window.onload = selector;
                }
            }
            if (itcast.isDOM(selector)) {
                this[0] = selector;
                this.length = 1;
                return this;
            }
            if (itcast.isArrayLike(selector)) {
                push.apply(this,selector);
                return this;
            }
            if (itcast.isItcast(selector)) return selector;
        },
        each : function (callback) {
            itcast.each(this,callback);
            return this;
        }
    };

    //prototype
    itcast.fn.init.prototype = itcast.fn;

    //function_extend_coder
    itcast.extend = itcast.fn.extend = function (source) {
        var key;
        if (source && typeof source === "object") {
            for (key in source) {
                this[key] = source[key];
            }
        }
    };

    //JUDGE_coder
    itcast.extend({
        isString : function (obj) {
            return !!obj && typeof obj === "string";
        },
        isHTML : function (obj) {
            var _o = itcast.trim(obj);
            return _o.charAt(0) === "<" && _o.charAt(_o.length - 1) === ">" &&
                _o.length >= 3;
        },
        isFunction : function (obj) {
            return typeof obj === "function";
        },
        isItcast : function (obj) {
            return typeof obj === "object" && "selector" in obj;
        },
        isDOM : function (obj) {
            return !!obj.nodeType;
        },
        isWindow : function (obj) {
            return "window" in obj && obj.window === window;
        },
        isArrayLike : function (obj) {
            if (itcast.isWindow(obj) || itcast.isFunction(obj)) return false;
            return "length" in obj && obj.length >= 0;
        }
    });

    //TOOL_coder
    itcast.extend({
        trim : function (str) {
            if (!str) return "";
            return str.replace(/^\s+|\s+$/g,"");
        },
        parseHTML : function (html) {
            var ret,div;
            ret = [];
            div = document.createElement("div");
            div.innerHTML = html;
            itcast.each(div.childNodes,function () {
                if (this.nodeType === 1) ret.push(this);
            });
            return ret;
        },
        each : function (obj,callback) {
            var i = 0,
                l = obj.length;
            for (;i < l;) {
                if (callback.call(obj[i],obj[i],i++) === false) break;
            }
        }
    });

    //CSS_coder
    itcast.extend({
        setCss : function (dom,name,value) {
            if (value !== undefined) {
                dom.style[name] = value;
            } else if (typeof name === "object") {
                var key;
                for (key in name) {
                    dom.style[key] = name[key];
                }
            }
        },
        getCss : function (dom,name) {
            return document.defaultView && document.defaultView.getComputedStyle ?
                document.defaultView.getComputedStyle(dom,null)[name] : dom.currentStyle[name];
        },
        hasClass : function (dom,className) {
            return (" " + dom.className + " ").indexOf(" " + itcast.trim(className) + " ") >= 0;
        },
        addClass : function (dom,className) {
            var _className = dom.className;
            if (!_className) dom.className = className;
            else {
                if (!itcast.hasClass(dom,className)) dom.className += " " + className;
            }
        },
        removeClass : function (dom,className) {
            dom.className = itcast.trim((" " + dom.className + " ").replace(" " + itcast.trim(className) + " "," "));
        },
        toggleClass : function (dom,className) {
            if (itcast.hasClass(dom,className)) itcast.removeClass(dom,className);
            else itcast.addClass(dom,className);
        }
    });

    //CSS_users
    itcast.fn.extend({
        css : function (name,value) {
            if (value === undefined) {
                if (typeof name === "object") {
                    return this.each(function () {
                        itcast.setCss(this,name);
                    });
                } else {
                    return this.length > 0 ? itcast.getCss(this[0],name) : undefined;
                }
            } else {
                return this.each(function () {
                    itcast.setCss(this,name,value);
                });
            }
        },
        hasClass : function (className) {
            return this.length > 0 ? itcast.hasClass(this[0],className) : false;
        },
        addClass : function (className) {
            return this.each(function () {
                itcast.addClass(this,className);
            });
        },
        removeClass : function (className) {
            return this.each(function () {
                if (className === undefined) this.className = "";
                else itcast.removeClass(this,className);
            });
        },
        toggleClass : function (className) {
            return this.each(function () {
                itcast.toggleClass(this,className);
            });
        }
    });

    //ATTR_coder
    itcast.extend({
        setAttr : function (dom,name,value) {
            dom.setAttribute(name,value);
        },
        getAttr : function (dom,name) {
            return dom.getAttribute(name);
        },
        setHTML : function (dom,html) {
            dom.innerHTML = html;
        },
        getHTML : function (dom) {
            return dom.innerHTML;
        },
        setVal : function (dom,val) {
            dom.value = val;
        },
        getVal : function (dom) {
            return dom.value;
        },
        setText : function (elem,text) {
            if (elem.textContent) elem.textContent = text;
            else {
                elem.innerHTML = "";
                elem.appendChild(document.createTextNode(text));
            }
        },
        getText : function (elem) {
            var ret = "",nodeType = elem.nodeType;
            if (nodeType === 1 || nodeType === 9 || nodeType === 11) {
                if (elem.textContent) return elem.textContent;
                else for(elem = elem.firstChild;elem;elem = elem.nextSibling) ret += getText(elem);
            } else if (nodeType === 3) return elem.nodeValue;
            return ret;
        }
    });

    //ATTR_users
    itcast.fn.extend({
        attr : function (name,value) {
            if (value === undefined) return this.length > 0 ? itcast.getAttr(this[0],name) : undefined;
            else return this.each(function () {
                itcast.setAttr(this,name,value);
            });
        },
        html : function (html) {
            if (html === undefined) return this.length > 0 ? itcast.getHTML(this[0]) : undefined;
            else return this.each(function () {
                itcast.setHTML(this,html);
            });
        },
        val : function (val) {
            if (val === undefined) return this.length > 0 ? itcast.getVal(this[0]) : undefined;
            else return this.each(function () {
                itcast.setVal(this,val);
            });
        },
        text : function (text) {
            if (text === undefined) return this[0] && itcast.getText(this[0]);
            else return this.each(function () {
                itcast.setText(this,text);
            });
        }
    });

    //DOM_operation_users
    itcast.fn.extend({
        appendTo : function (target) {
            var _source = this,
                tg_l = target.length,
                ret = [];
            target = itcast(target);

            target.each(function (elem,i) {
                _source.each(function () {
                    var node = i === tg_l - 1 ? this : this.cloneNode(this);
                    elem.appendChild(node);
                    ret.push(node);
                });
            });

            return itcast(ret);
        },
        prependTo : function (target) {
            var _source,firstNode,node,ret = [];
            _source = this;
            target = itcast(target);
            target.each(function (elem,i) {
                firstNode = this.firstChild;
                _source.each(function () {
                    node = i === 0 ? this : this.cloneNode(true);
                    elem.insertBefore(node,firstNode);
                    ret.push(node);
                });
            });
            return itcast(node);
        },
        remove : function () {
            return this.each(function () {
                this.parentNode.removeChild(this);
            });
        },
        empty : function () {
            return this.each(function () {
                this.innerHTML = "";
            });
        },
        next : function () {
            var ret = [],
                node;
            this.each(function () {
                for (node = this.nextSibling;node;node = node.nextSibling) {
                    if (node.nodeType === 1) {
                        ret.push(node);
                        break;
                    }
                }
            });
            return itcast(ret);
        },
        nextAll : function () {
            var ret = [],
                node;
            this.each(function () {
                for (node = this.nextSibling;node;node = node.nextSibling) {
                    if (node.nodeType === 1) {
                        ret.push(node);
                    }
                }
            });
            return itcast(ret);
        },
        before : function (new_elem) {
            var node;
            new_elem = itcast(new_elem);
            return this.each(function (dom,i) {
                new_elem.each(function () {
                    node = i === 0 ? this : this.cloneNode(true);
                    dom.parentNode.insertBefore(node,dom);
                });
            });
        },
        after : function (new_elem) {
            var node,nextNode;
            new_elem = itcast(new_elem);
            this.each(function (dom,i) {
                nextNode = dom.nextSibling;
                new_elem.each(function () {
                    node = i === 0 ? this : this.cloneNode(true);
                    if (nextNode) dom.parentNode.insertBefore(node,nextNode);
                    else dom.parentNode.appendChild(node);
                });
            });
            return this;
        }
    });

    //event_operation_users
    itcast.fn.extend({
        on : function (type,callback) {
            return this.each(function () {
                if (this && this.nodeType === 1) {
                    if (this.addEventListener) this.addEventListener(type,callback,false);
                    else if (this.attachEvent) {
                        var that = this;
                        this.attachEvent("on" + type,function () {
                            callback.call(that);
                        });
                    }
                }
            });
        },
        off : function (type,callback) {
            return this.each(function () {
                if (this && this.nodeType === 1) {
                    if (this.removeEventListener) this.removeEventListener(type,callback,false);
                    else if (this.detachEvent) this.detachEvent("on" + type,callback);
                }
            });
        }
    });

    itcast.each(("mouseenter mouseleave mousedown mouseup keypress " +
        "keydown keyup focus blur click dblclick scroll resize").split(" "),
        function (type) {
            itcast.fn[type] = function (callback) {
                return this.on(type, callback);
            };
        });

    //animation_module_coder
    itcast.extend({
        kv : {
            left : "offsetLeft",
            top : "offsetTop",
            width : "offsetWidth",
            height : "offsetHeight"
        },
        easing : {
            linearUp: function (x, t, b, c, d) {
                return (c - b) * t / d;
            },
            linearDown: function (x, t, b, c, d) {
                return (c - b) * t / d * (2 - t / d);
            }
        },
        getLocation : function (dom,target) {
            var key,obj = {};
            for (key in target) obj[key] = dom[itcast.kv[key]];
            return obj;
        },
        getTween : function (time,location,target,dur,easingName) {
            var key,obj = {};
            for (key in target) obj[key] = itcast.easing[easingName](null,time,location[key],parseInt(target[key]),dur);
            return obj;
        },
        setStyle : function (dom,location,tween) {
            var key;
            for (key in tween) dom.style[key] = location[key] + tween[key] + "px";
        },
        getDistance : function (location,target) {
            var key,obj = {};
            for (key in target) obj[key] = parseInt(target[key]) - location[key];
            return obj;
        }
    });

    //animation_module_users
    itcast.fn.extend({
        animate : function (target,dur,easingName) {
            return this.each(function (dom) {
                var location = itcast.getLocation(dom,target),
                    distance = itcast.getDistance(location,target),
                    startTime,timer = dom.timerId;
                startTime = +new Date;
                function render() {
                    var tween,currentTime = +new Date,time = currentTime - startTime;
                    if (dom.getAttribute("stopAni")) {
                        dom.removeAttribute("stopAni");
                        dom.removeAttribute("timerId");
                        return;
                    }
                    if (time >= dur) {
                        tween = distance;
                        dom.removeAttribute("timerId");
                    } else {
                        tween = itcast.getTween(time,location,target,dur,easingName);
                        window.requestAnimationFrame(render);
                    }
                    itcast.setStyle(dom,location,tween);
                }
                if (!timer) {
                    timer = window.requestAnimationFrame(render);
                    dom.setAttribute("timerId",timer);
                    dom.removeAttribute("stopAni");
                }
            });
        },
        stopAnimating : function() {
            return this.each(function (dom) {
                if (dom.getAttribute("timerId")) dom.setAttribute("stopAni",true);
            });
        },
        isAnimating : function () {
            return !!this[0] && !!this[0].getAttribute("timerId");
        }
    });

    //easing_style
    itcast.extend({
        easeInQuad: function(x, t, b, c, d) {
            return c * (t /= d) * t + b;
        },
        easeOutQuad: function(x, t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        },
        easeInOutQuad: function(x, t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t + b;
            return -c / 2 * ((--t) * (t - 2) - 1) + b;
        },
        easeInCubic: function(x, t, b, c, d) {
            return c * (t /= d) * t * t + b;
        },
        easeOutCubic: function(x, t, b, c, d) {
            return c * ((t = t / d - 1) * t * t + 1) + b;
        },
        easeInOutCubic: function(x, t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t + 2) + b;
        },
        easeInQuart: function(x, t, b, c, d) {
            return c * (t /= d) * t * t * t + b;
        },
        easeOutQuart: function(x, t, b, c, d) {
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        },
        easeInOutQuart: function(x, t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t + b;
            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        },
        easeInQuint: function(x, t, b, c, d) {
            return c * (t /= d) * t * t * t * t + b;
        },
        easeOutQuint: function(x, t, b, c, d) {
            return c * ((t = t / d - 1) * t * t * t * t + 1) + b;
        },
        easeInOutQuint: function(x, t, b, c, d) {
            if ((t /= d / 2) < 1) return c / 2 * t * t * t * t * t + b;
            return c / 2 * ((t -= 2) * t * t * t * t + 2) + b;
        },
        easeInSine: function(x, t, b, c, d) {
            return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
        },
        easeOutSine: function(x, t, b, c, d) {
            return c * Math.sin(t / d * (Math.PI / 2)) + b;
        },
        easeInOutSine: function(x, t, b, c, d) {
            return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
        },
        easeInExpo: function(x, t, b, c, d) {
            return (t == 0) ? b : c * Math.pow(2, 10 * (t / d - 1)) + b;
        },
        easeOutExpo: function(x, t, b, c, d) {
            return (t == d) ? b + c : c * (-Math.pow(2, -10 * t / d) + 1) + b;
        },
        easeInOutExpo: function(x, t, b, c, d) {
            if (t == 0) return b;
            if (t == d) return b + c;
            if ((t /= d / 2) < 1) return c / 2 * Math.pow(2, 10 * (t - 1)) + b;
            return c / 2 * (-Math.pow(2, -10 * --t) + 2) + b;
        },
        easeInCirc: function(x, t, b, c, d) {
            return -c * (Math.sqrt(1 - (t /= d) * t) - 1) + b;
        },
        easeOutCirc: function(x, t, b, c, d) {
            return c * Math.sqrt(1 - (t = t / d - 1) * t) + b;
        },
        easeInOutCirc: function(x, t, b, c, d) {
            if ((t /= d / 2) < 1) return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
            return c / 2 * (Math.sqrt(1 - (t -= 2) * t) + 1) + b;
        },
        easeInElastic: function(x, t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        },
        easeOutElastic: function(x, t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t == 0) return b;
            if ((t /= d) == 1) return b + c;
            if (!p) p = d * .3;
            if (a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
        },
        easeInOutElastic: function(x, t, b, c, d) {
            var s = 1.70158;
            var p = 0;
            var a = c;
            if (t == 0) return b;
            if ((t /= d / 2) == 2) return b + c;
            if (!p) p = d * (.3 * 1.5);
            if (a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else var s = p / (2 * Math.PI) * Math.asin(c / a);
            if (t < 1) return -.5 * (a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            return a * Math.pow(2, -10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p) * .5 + c + b;
        },
        easeInBack: function(x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        },
        easeOutBack: function(x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        easeInOutBack: function(x, t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            if ((t /= d / 2) < 1) return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
        },
        easeOutBounce: function(x, t, b, c, d) {
            if ((t /= d) < (1 / 2.75)) {
                return c * (7.5625 * t * t) + b;
            } else if (t < (2 / 2.75)) {
                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + .75) + b;
            } else if (t < (2.5 / 2.75)) {
                return c * (7.5625 * (t -= (2.25 / 2.75)) * t + .9375) + b;
            } else {
                return c * (7.5625 * (t -= (2.625 / 2.75)) * t + .984375) + b;
            }
        }
    }, itcast.easing);

    //ajax_module_coder
    function createXMLHR() {
        var xml;
        if (window.XMLHttpRequest) xml = new XMLHttpRequest();
        else xml = new ActiveXObject("Microsoft.XMLHTTP");
        return xml;
    }

    function formatData(data) {
        var ret = [],
            key;
        if (!data) return null;
        for (key in data) ret.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
        ret.push(("_=" + Math.random()).replace(".",""));
        return ret.join("&");
    }

    itcast.extend({
        AjaxSettings : {
            url : "",
            type : "GET",
            dataType : "json",
            async : "true",
            success : function () {},
            fail : function () {},
            data : null,
            onreadystatechange : function (success,context,xml,fail) {
                xml.onreadystatechange = function () {
                    if (xml.readyState === 4) {
                        if (xml.status >= 200 && xml.status < 300) {
                            var data;
                            if (context.dataType.toLowerCase() === "json")
                                data = JSON.parse(xml.responseText);
                            else data = xml.responseText;
                            success && success.call(context,data,xml);
                        }else fail && fail.call({message : "failed."},xml);
                    }
                };
            }
        },
        //users
        ajax : function (options) {
            var xml,data,context = {};
            if (!options || options.url) throw new Error("参数异常。");
            itcast.extend(itcast.AjaxSettings,context);
            itcast.extend(options,context);
            context.type = context.type.toUpperCase();

            xml = createXMLHR();
            data = formatData(context.data);
            if (context.type === "GET") {
                var url = !!context.data && !!data ? context.url + "?" + data : context.url;
                xml.open("GET",url,context.async);
            } else {
                xml.open("POST",context.url,context.async);
                xml.setRequestHeader("Content-Type","application/x-www-form-urlencoded;charset=UTF-8");
            }
            xml.send(context.type === "GET" ? null : data);
            context.onreadystatechange(context.success,context,xml,context.fail);
        }
    });

    //I
    window.I = window.itcast = itcast;

    //select
    var select = (function () {
        var nativeExp = /^[^{]+\{\s*\[native \w/,
            chooseExp = /^(?:#([\w-]+)|\.([\w-]+)|(\w+)|(\*))$/,
            support = {
                getElementsByClassName:nativeExp.test(document.getElementsByClassName)
            };

        function getTag (tagName,context,results) {
            results = results || [];
            results.push.apply(results,context.getElementsByTagName(tagName));
            return results;
        }

        function getId (idName,results) {
            results = results || [];
            var node = document.getElementById(idName);
            if (node) results.push(node);
            return results;
        }

        function getClass (className,context,results) {
            results = results || [];
            if (support.getElementsByClassName)
                results.push.apply(results,context.getElementsByClassName(className));
            else {
                var nodes = getTag("*",context);
                each(nodes,function () {
                    if ((" " + this.className + " ").indexOf(" " + trim(className) + " ") >= 0)
                        results.push(this);
                });
            }
            return results;
        }

        function get (selector,context,results) {
            context = context || document;
            var match = chooseExp.exec(selector);
            if (match) {
                if(match[1]) results = getId(match[1]);
                else {
                    var nodeType = context.nodeType;
                    if (nodeType == 1 || nodeType == 9 || nodeType == 11)
                        context = [context];
                    else if (typeof context === "string") context = get(context);

                    each(context,function () {
                        if (match[2]) results = getClass(match[2],this,results);
                        else if (match[3]) results = getTag(match[3],this,results);
                        else if (match[4]) results = getTag("*",this,results);
                    });
                }
            }
            return results;
        }

        function select (selector,context,results) {
            results = results || [];
            each(selector.split(","),function () {
                var res = context;
                each(this.split(" "),function () {
                    res = get(this.valueOf(),res);
                });
                results.push.apply(results,res);
            });
            return results;
        }

        function each (obj,callback) {
            var i = 0,
                l = obj.length;
            for (;i < l;) {
                if (callback.call(obj[i],obj[i],i++) === false) break;
            }
        }

        function trim (str) {
            return str.replace(/^\s+|\s+$/,"");
        }

        return select;
    })();

})(window);