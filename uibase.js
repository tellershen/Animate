;(function (win, NE, undefined) {
    var fn = function (el) {
        var self = this;
        if (!(self instanceof fn)) {
            return new fn(el);
        }
        this.el = el;
        if (NE.find) {
            if (NE.isString(this.el)) {
                this.selector = this.el;
                this.el = NE.find(this.el);
            }
            NE.mix(this, this.el);
            this.length = this.el.length;
        }
    }
    if (win[NE] === undefined) {
        win[NE] = fn;
    } else {
        return;
    }
    NE = win[NE];
    var doc = win['document'],
  	cfg = NE.Config = {
		    debug: false, // 发布到外网时为false
		    base: '/', // 内部测试、预发布环境使用
		    //base: 'http://', // 生产环境使用
		    timeout: 10   // getScript 的默认 timeout 时间
		};
    var mix = function (r, s, ov) {
        if (!s || !r) return r;
        if (ov === undefined) ov = true;
        for (var p in s) {
            if (ov || !(p in r)) {
                r[p] = s[p];
            }
        }
        return r;
    };
	
    mix(NE, {
        version: '0.1',
        mix: mix,
        /**
        * 输出debug信息.
        * @param msg {String} 信息内容.
        * @param cat {String} 信息输出的种类. 默认是log
        *        其他的有 "info", "warn", "error", "time", "trace" 等.
        */
        log: function (msg, cat) {
            if (win['console'] && console.log) {
                console[cat && console[cat] ? cat : 'log'](msg);
            }
        },
        namespace: function () {
            var args = arguments, l = args.length,
				o = null, i, arr, j, al,
				g = (args[l - 1] === true && l--);

            for (i = 0; i < l; ++i) {
                arr = args[i].split('.');
                o = g ? win : this;

                for (j = (win[arr[0]] === o ? 1 : 0), al = arr.length; j < al; ++j) {
                    o = o[arr[j]] = o[arr[j]] || {};
                }
            }

            return o;
        },
        /**
        *将 s.prototype 的成员复制到 r.prototype 上。
        *s 可以是非函数对象，此时复制的就是 s 的成员。
        *可以一次传入多个 s, 比如 S.augment(r, s1, s2, s3, ov, wl)
        */
        augment: function (/*r, s1, s2, ..., ov*/) {
            var args = arguments, len = args.length - 1,
			r = args[0], ov = args[len],
			i = 1;

            if (!NE.isBoolean(ov)) {
                ov = undefined;
                len++;
            }

            for (; i < len; i++) {
                mix(r.prototype, args[i].prototype || args[i], ov);
            }

            return r;
        },
        /**
        *将多个对象的成员合并到一个新对象上。参数中，后面的对象成员会覆盖前面的。
        *
        *Returns: Object
        *合并后的新对象
        */
        merge: function () {
            var o = {}, i, l = arguments.length;
            for (i = 0; i < l; ++i) {
                mix(o, arguments[i]);
            }
            return o;
        },
        /**
        *延时执行fn方法
        *param fn {function} 需要被执行的方法
        *param when {Number} 延时的时长 单位毫秒
        *param periodic {boolean}是否为周期执行
        *param o {Object} fn的作用域
        *param data {Object} fn方法的参数
        */
        later: function (fn, when, periodic, o, data) {
            when = when || 0;
            o = o || {};
            var d = NewEgg.makeArray(data), f, r;

            if (NewEgg.isString(fn)) {
                fn = o[fn];
            }

            f = function () {
                fn.apply(o, d);
            };

            r = (periodic) ? setInterval(f, when) : setTimeout(f, when);
            return {
                id: r,
                interval: periodic,
                cancel: function () {
                    if (this.interval) {
                        clearInterval(r);
                    } else {
                        clearTimeout(r);
                    }
                }
            };
        },
        laterEvent: function (fn, times, me) {
            if (me.sleepid) {
                clearTimeout(me.sleepid);
            }
            me.sleepid = setTimeout(fn, times);
        },
      
        /**
        *继承
        */
        extend: function (r, s) {
            if (!s || !r) return r;

            var OP = Object.prototype,
                O = function (o) {
                    function F() {
                    }

                    F.prototype = o;
                    return new F();
                },
                sp = s.prototype,
                rp = O(sp);
            if (NE.isPlainObject(s)) {
                r = s
                r = s.constructor != OP.constructor ? s.constructor : function () { s.apply(this.arguments); };
            } else {

                r.prototype = rp;
                rp.constructor = r;
                r.superclass = sp;

                if (sp.constructor === OP.constructor) {
                    sp.constructor = s;

                }
            }



            // assign constructor property
            //            if (s !== Object && sp.constructor === OP.constructor) {
            //                sp.constructor = s;
            //            }

            return r;
        }

        /**
        *添加模块到对象。
        *param name {String} 模块名称
        *param fn {Function} 入口函数
        *config {Object} 配置信息，有如下一些可用选项：
        *       config = {
        *        path: 'packages/core-min.js',                          // 脚本相对路径
        *        fullpath: 'http://xxxx/build/packages/core-min.js',    // 脚本绝对路径
        *        csspath:  'cssbase/base-min.css',                      // CSS 文件相对路径
        *        cssfullpath: 'http://xxxx/build/cssbase/base-min.css', // CSS 文件绝对路径
        *        requires: ['mod1','mod2']                              // 指定依赖的模块
        *        }
        */
    });

})(window, "NEUI");

(function (win, NE, undefined) {
    var doc = document, toString = Object.prototype.toString,
		indexOf = Array.prototype.indexOf,
		trim = String.prototype.trim, EMPTY = '', REG_TRIM = /^\s+|\s+$/g;

    NE.mix(NE, {
        isUndefined: function (o) {
            return o === undefined;
        },
        isBoolean: function (o) {
            return toString.call(o) === '[object Boolean]';
        },
        isString: function (o) {
            return toString.call(o) === '[object String]';
        },
        isNumber: function (o) {
            return toString.call(o) === '[object Number]' && isFinite(o);
        },
        isArray: function (o) {
            return toString.call(o) === '[object Array]';
        },
        isFunction: function (o) {
            // Safari 下，typeof NodeList 也返回 function
            return toString.call(o) === '[object Function]';
        },
        isPlainObject: function (o) {
            // Make sure that DOM nodes and window objects don't pass through.
            return o && toString.call(o) === '[object Object]' && !o['nodeType'] && !o['setInterval'];
        },
        isEmptyObject: function (o) {
            for (var p in o) {
                return false;
            }
            return true;
        },
        each: function (object, fn, context) {
            var key, val, i = 0, length = object.length,
                isObj = length === undefined || NE.isFunction(object);
            context = context || win;

            if (isObj) {
                for (key in object) {
                    if (fn.call(context, object[key], key, object) === false) {
                        break;
                    }
                }
            } else {
                for (val = object[0];
                     i < length && fn.call(context, val, i, object) !== false; val = object[++i]) {
                }
            }

            return object;
        },
        trim: trim ?
			function (str) {
			    return (str == undefined) ? EMPTY : trim.call(str);
			} :
			function (str) {
			    return (str == undefined) ? EMPTY : str.toString().replace(REG_TRIM, EMPTY);
			},
        /**
        * 正向查找数组元素在数组中的索引下标
        *
        * @link http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Objects:Array:indexOf
        * @memberOf array
        * @param item {*} 要执行的项
        * @param arr {Array} 要执行操作的数组
        *
        * @return {Number} 返回正向查找的索引编号
        */
        indexOf: indexOf ?
			function (item, arr) {
			    return indexOf.call(arr, item);
			} :
			function (item, arr) {
			    for (var i = 0, len = arr.length; i < len; ++i) {
			        if (arr[i] === item) return i;
			    }
			    return -1;
			},
        /**
        *
        */
        inArray: function (item, arr) {
            return NE.indexOf(item, arr) > -1;
        },
        makeArray: function (o) {
            if (o === null || o === undefined) return [];
            if (NE.isArray(o)) return o;

            // The strings and functions also have 'length'
            if (!NE.isNumber(o.length) || NE.isString(o) || NE.isFunction(o)) {
                return [o];
            }

            return Array.prototype.slice.call(o);
        },
        getGuid:function () {
            return "NEGUID" + ~ ~(new Date());
        }
    });

})(window, NEUI);
