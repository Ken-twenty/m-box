/**
 * Created by Administrator on 2016/8/19.
 */
(function (window) { //使window成为一个局部变量
    var iArray = [],
        push = iArray.push,
        document = window.document;  //命名常用的局部变量，比局部变量的性能更为优越。

    //itcast就相当于$(jQuery)
    //核心函数
    function itcast (selector) {
        //...
        return new itcast.fn.init(selector);
    }

    //由于会经常调用itcast.prototype,因此为其添加一个简单的书写方式
    itcast.fn = itcast.prototype = {
        constructor:itcast,
        selector : "",//用于判断是否itcast对象
        length:0,//保证itcast对象在任何情况下都是伪数组对象
        init:function (selector) {
            //处理null、false、undefined、""
            if (!selector) return this;
            if (itcast.isString(selector)) {
                //处理html字符串类型
                if (itcast.isHTML(selector)) {
                    push.apply(this,itcast.parseHTML(selector));
                } else {   //...
                    push.apply(this,select(selector,context));
                    //缓存、追溯用
                    this.selector = selector;
                    this.context = context || document;
                }
                return this;
            }
            if (itcast.isFunction(selector)) {
                //处理函数
                var oldFn = window.onload;
                //如果存在以绑定过的事件处理函数??把selector作为新的事件处理函数添加到window.onload
                if (itcast.isFunction(oldFn)) {
                    window.onload = function () {
                        oldFn();
                        selector();
                    };
                } else { //如果oldFn为无效值（不是一个函数）
                    window.onload = selector;
                }
            }
            if (itcast.isDOM(selector)) {
                //this.elements = [selector];
                this[0] = selector;
                this.length = 1;
                return this;
            }
            if (itcast.isArrayLike(selector)) {
                push.apply(this,selector);
                return this;
            }
            //处理itcast对象
            if (itcast.isItcast(selector)) return selector;
        },
        each : function (callback) {
            //this就是itcast对象，即each方法的调用者
            itcast.each(this,callback);
            //链式编程的关键
            return this;
        }
    };

    //扩展函数封装
    itcast.extend = itcast.fn.extend = function (source) {
        var key;
        if (source && typeof source === "object") {
            for (key in source) {
                this[key] = source[key];
            }
        }
    };

    //类型判断方法 扩展
    itcast.extend({
        isString : function (obj) {
            return typeof obj === "string";
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
            return "selector" in obj;
        },
        isDOM : function (obj) {
            return obj.nodeType;
        },
        isWindow : function (obj) {
            return "window" in obj && obj.window === window;
        },
        isArrayLike : function (obj) {
            //类数组：真数组或伪数组对象
            //1.因为window对象和函数也有length属性，因此先排除这两者。
            if (itcast.isWindow(obj) || itcast.isFunction(obj)) return false;
            return "length" in obj && obj.length >= 0;
        }
    });

    //工具类方法 扩展
    itcast.extend({
        trim : function (str) {
            if (!str) return "";
            return str.replace(/^\s+|\s+$/g,"");
        },
        parseHTML : function (html) {
            //思路：1.创建一个div元素，并且给他的innerHTML赋值为传入的html
            //     2.声明一个数组，存储创建出来的所有html元素
            //     3.遍历div下的所有子节点，依次添加到数组中
            //     4.返回数组
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

    //css模块
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
                document.defaultView.getComputedStyle(dom)[name] : dom.currentStyle[name];
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

    itcast.fn.extend({
        css : function (name,value) {
            //如果value等于undefined，那么就识别为只传入name一个参数
            if (value === undefined) {
                //同时设置多个样式
                if(typeof name === "object") {
                    return this.each(function () {
                        //这里面的this是指itcast对象里面的每一个DOM元素，
                        // 也可以通过传参，获取DOM元素
                        itcast.setCss(this,name);
                    });
                } else {//如果name是一个字符串的话，表示获取相应的样式值
                    //默认获取itcast对象上第一个DOM元素的样式值
                    return this.length > 0 ? itcast.getCss(this[0],name) : undefined;
                    //首先判断当前itcast对象上是否有DOM元素，
                    // 有则返回第一个DOM元素的样式值，无则返回undefined
                }
            } else {//如果value有值，那么就是给itcast对象上所有的DOM元素设置单个样式值。
                return this.each(function () {
                    itcast.setCss(this,name,value);
                });
            }
        },
        hasClass : function (className) {
            //默认判断itcast对象上的第一个DOM元素是否具有指定的类样式。
            return this.length > 0 ? itcast.hasClass(this[0],className) : false;
        },
        addClass : function (className) {
            //each遍历，给itcast对象上的每一个DOM元素添加指定的类样式
            return this.each(function () {
                //这里的this指遍历到的每一个DOM元素
                itcast.addClass(this,className);
            });
        },
        removeClass : function (className) {
            return this.each(function () {
                //如果传入的className为undefined或无效值，那么就将所有DOM的样式类都移除
                if (className === undefined) this.className = "";
                else itcast.removeClass(this,className); //如果指定了要删除的样式类，那么就将所有DOM元素的指定样式类移除
            });
        },
        //判断是否具有指定的样式类，有则删除，无则添加
        toggleClass : function (className) {
            return this.each(function () { //这里的this指调用这个函数的itcast对象
                itcast.toggleClass(this,className); //这里的this指遍历出来的每一个DOM元素
            });
        }
    });

    //属性模块
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
                //element节点、document节点、document.fragment节点
                if (elem.textContent) return elem.textContent;
                else for(elem = elem.firstChild;elem;elem = elem.nextSibling) ret += getText(elem);
                //递归循环，遍历其子元素的兄弟元素，使其进入(nodeType === 3)语句
                //ret 实现结果集的累加
            } else if (nodeType === 3) return elem.nodeValue;
            return ret;
        }
    });

    itcast.fn.extend({
        attr : function (name,value) {
            //如果value为无效值，表示获取值
            if (value === undefined) return this.length > 0 ? itcast.getAttr(this[0],name) : undefined; //默认返回itcast对象上第一个DOM元素的指定属性值
            //当value为有效值
            else return this.each(function () { //这里的this指调用attr的itcast对象
                itcast.setAttr(this,name,value); //这里的this指遍历到的每一个dom元素
            });
        },
        html : function (html) {
            //如果没有传入html，或html为无效值，则表示获取itcast对象上第一个DOM元素的innerHTML属性值
            if (html === undefined) return this.length > 0 ? itcast.getHTML(this[0]) : undefined;
            else return this.each(function () {
                itcast.setHTML(this,html);
            });
        },
        val : function (val) {
            if (val === undefined) {
                return this.length > 0 ? itcast.getVal(this[0]) : undefined;
            } else return this.each(function () {
                itcast.setVal(this,val);
            });
        },
        text : function (text) {
            if (text === undefined) return this[0] && itcast.getText(this[0]); //与真或假
            else return this.each(function () {
                itcast.setText(this,text);
            });
        }
    });

    //DOM操作模块
    itcast.fn.extend({
        appendTo : function (target) {
            var _source = this,
                tg_l = target.length,
                ret = [];
            target = itcast(target);

            target.each(function (elem,i) {
                _source.each(function () {
                    var node = i === tg_l - 1 ? this : this.cloneNode(true);
                    //若target是一个含有多个DOM对象的数组，则前几个都是复制追加操作，最后一项是"移动操作"
                    elem.appendChild(node);
                    ret.push(node); //把source包装成一个数组
                });
            });

            return itcast(ret); //返回source，非return this 的链式编程操作。
        },
        append : function (source) {
            itcast(source).appendTo(this);
            return this;
        },
        prependTo : function (target) {
            var _source,firstNode,node,ret = [];
            _source = this; //缓存this，即prependTo的调用者
            target = itcast(target);
            target.each(function (elem,i) {
                //保存当前DOM元素的第一个子节点
                firstNode = this.firstChild;
                _source.each(function () {
                    //理同上
                    node = i === 0 ? this : this.cloneNode(true);
                    //给elem添加子节点，并且要在原第一个子节点的前面
                    elem.insertBefore(node,firstNode);
                    ret.push(node);
                });
            });
            return itcast(ret); //理同上
        },
        prepend : function (source) {
            itcast(source).prependTo(this);
            return this;
        },
        remove : function () {
            return this.each(function () { //第一个this指调用remove方法的itcast对象
                this.parentNode.removeChild(this); //第二个this指遍历到的itcast对象中的每一个DOM元素
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
            this.each(function () { //遍历调用next的itcast对象上的每一个DOM元素
                for (node = this.nextSibling;node;node = node.nextSibling) { //循环获取每一个DOM上的下一个兄弟节点
                    if (node.nodeType === 1) { //当节点类型值为1时，添加到结果数组，并跳出循环
                        ret.push(node);
                        break;
                    }
                }
            });
            return itcast(ret); //转换为itcast对象并返回，链式编程
        },
        nextAll : function () {
            var ret = [],
                node;
            this.each(function () {
                for (node = this.nextSibling;node;node = node.nextSibling) { //当node为null时，停止循环，即寻找this后面的所有兄弟节点
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
                    dom.parentNode.insertBefore(node,dom);//(新控价，容器)（参数必须都是DOM对象）
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

    //事件模块
    itcast.fn.extend({
        on : function (type,callback) {
            return this.each(function () {
                if (this && this.nodeType === 1) {
                    if (this.addEventListener) this.addEventListener(type,callback,false); //默认为false，在冒泡阶段触发事件
                    else if (this.attachEvent) {
                        var that = this;
                        this.attachEvent("on" + type,function () {
                            callback.call(that); //console.log(this === that); true
                        }); // 冒泡阶段
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
            return this.on(type,callback);
        };
    });//循环添加 "事件(callback)" 给itcast对象的实例

    //动画模块
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
        //获取所有属性的起始值
        getLocation : function (dom,target) {
            var key,obj = {};
            for (key in target) {
                obj[key] = dom[itcast.kv[key]];
            }
            return obj;
        },
        //获取所有属性在一段时间后的位移量
        getTween : function (time,location,target,dur,easingName) {
            var key,obj = {};
            for (key in target) {
                obj[key] = itcast.easing[easingName](null,time,location[key],parseInt(target[key]),dur);
            }
            return obj;
        },
        //根据位移量和起始值，为DOM元素动态改变样式
        setStyle : function (dom,location,tween) {
            var key;
            for (key in tween) {
                dom.style[key] = location[key] + tween[key] + "px";
            }
        },
        //根据所有属性的起始值和终止值，获取相应的总距离
        getDistance : function (location,target) {
            var key,obj = {};
            for (key in target) {
                obj[key] = parseInt(target[key]) - location[key];
            }
            return obj;
        }
    });

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
        stopAnimating : function () {
            return this.each(function (dom) {
                if (dom.getAttribute("timerId")) {
                    dom.setAttribute("stopAni",true);
                }
            });
        },
        isAnimating : function () {
            return !!this[0] && !!this[0].getAttribute("timerId");
        }
    });

    //动画模式扩展
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

    //ajax模块
    function createXMLHR() {
        var xml;
        if (window.XMLHttpRequest) xml = new XMLHttpRequest();
        else xml = new ActiveXObject("Microsoft.XMLHTTP"); //兼容IE
        return xml;
    }

    function formatData(data) {
        var ret = [],
            key;
        //过滤空值
        if (!data) return null;
        for (key in data) ret.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
        //在链接上加上随机属性值，防止获取缓存数据
        ret.push(("_=" + Math.random()).replace(".",""));
        return ret.join("&");
    }

    itcast.extend({
        //ajax默认设置
        AjaxSettings : {
            url : "",
            type : "GET",//默认GET方式的ajax
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
                        } else fail && fail.call({message : "failed."},xml);
                    }
                }
            }
        },
        //users
        ajax : function (options) {
            var xml,data,context = {};
            if (!options || !options.url) throw new Error("参数异常。");

            //将默认Ajax设置拷贝到context
            itcast.extend(itcast.AjaxSettings,context);
            //将用户自定义设置覆盖到context
            itcast.extend(options,context);
            context.type = context.type.toUpperCase();

            //创建请求对象
            xml = createXMLHR();
            //格式化参数
            data = formatData(context.data);
            if (context.type === "GET") {
                //格式化参数
                var url = !!context.data && !!data ? context.url + "?" + data : context.url;
                xml.open("GET",url,context.async);
            } else {
                xml.open("POST",context.url,context.async);
                xml.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
            }
            xml.send(context.type === "GET" ? null : data);
            //注册状态监听事件
            context.onreadystatechange(context.success,context,xml,context.fail);
        }
    });

    //核心原型
    itcast.fn.init.prototype = itcast.fn;
    //把itcast或者说I暴露在外面
    window.I = window.itcast = itcast;

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

})(window);//自调用函数执行时传入一个全局变量window