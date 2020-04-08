// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"dom.js":[function(require,module,exports) {
/* 实现的几个 DOM 接口
** dom.create(`<div>hi</div>`) // 用于创建节点
** dom.after(node, node2) // 用于向后追加兄弟节点
// 原生的提供了一个兼容性不佳的实验性接口`ChildNode.after() MDN`
** dom.before(node, node2) // 用于向前追加兄弟节点
** dom.append(parent, child) // 用于创建子节点
** dom.wrap(`<div></div>`) //  用于创建父节点
*/
// dom.create = function() {}
window.dom = {
  // create: function() {} // 可简化为
  create: function create(tagName
  /* 语义化 形参 */
  ) {
    // return document.createElement(tagName) // 不能创建带有结构的 HTML 元素`<div><span>1</span></div>`
    // const container = document.createElement("div")
    var container = document.createElement("template");
    container.innerHTML = tagName.trim(); // 除去空格
    // return container.children[0]

    return container.content.firstChild;
    /* 存在 不可识别元素(<td></td>)的 bug
     ** <td</td>> 不能单独存在 只能放在<table></table> 里<tr></tr>或<tbody></tbody> 里，放在 div 里不符合 HTML 语法
     ** 可以放任意元素，不出 bug 的标签是 <template></template>
     ** <template></template> 是窜门用来容纳人以标签的
     ** <template></template> 用template.content.firstChild拿到
     */
  },
  after: function after(node, node2) {
    // 在后面插入节点，就相当于在此 node 后面的节点的前面插 // 必须调用父节点的 insertBefore() 方法
    console.log(node.siblings); // null ?

    node.parentNode.insertBefore(node2, node.nextSibling);
    /* 判断 排除最后一个节点 没有下一个节点 null 也符合 */
  },
  before: function before(node, node2) {
    node.parentNode.insertBefore(node2, node);
  },
  append: function append(parent, node) {
    parent.appendChild(node);
  },
  wrap: function wrap(node, parent) {
    dom.before(node, parent); // 将要包裹的“父节点”先插到目标节点的前面

    dom.append(parent, node); // 再把目标节点用 append 移至将要包裹的父节点的下面
  },
  remove: function remove(node) {
    // node.remove() // IE 不支持 兼容性不好
    node.parentNode.removeChild(node);
    return node; // 仍然需要获取此节点的引用
  },
  empty: function empty(node) {
    // 清空 node 里面的所有子元素
    // node.innerHTML = ''
    // const childNodes = node.childNodes 可以改写成以下的写法

    /*
     ** const {childNodes} = node // 解构赋值
     */
    var array = [];
    /*
     **    for (let i = 0; i < childNodes.length; i++) { // 不需要i++的循环就用 while 循环代替
     **        console.log(childNodes)
     **        console.log(childNodes.length)
     **        dom.remove(childNodes[i]) // remove( nodes) 会实时改变 nodes 的长度每次减一 导致循环的长度不固定 出现 bug
     **        array.push(childNodes[i])
     **    }
     */
    //  不需要i++的循环就用 while 循环代替for 循环

    /* 获取第一个子节点 并 push 进数组 */

    var x = node.firstChild;

    while (x) {
      // 如果 x 存在
      array.push(dom.remove(node.firstChild));
      x = node.firstChild; // 第一个子节点已经移除 原先第二节点就变为现在的第一个节点
    }

    return array; // 仍然需要获取此节点的引用
  },

  /* 改 用于读写属性 */

  /* 用判断 arguments 的个数来重载函数 */

  /* 重载
   ** 有三个形参时，就是设置；
   ** 第二个形参时，就是读取
   */
  attr: function attr(node, name, value) {
    // 组合
    if (arguments.length === 3) {
      node.setAttribute(name, value); // 原生DOM setAttribute(name, value)
    } else if (arguments.length === 2) {
      return node.getAttribute(name); // 原生DOM getAttribute(name) 并返回值
    }
  },

  /* 用于读/写文本内容 */

  /* 重载
   ** 有两个形参时，就是设置；
   ** 第一个形参时，就是读取
   */
  text: function text(node, string) {
    // 设计模式 之 适配
    // console.log('innerText' in node) //true
    if (arguments.length === 2) {
      /* 写 */
      if ("innerText" in node) {
        node.innerText = string; // IE // 会将节点原本的所有内容，包括标签全部改变
      } else {
        node.textContent = string; // Chrome/ Firefox // 会将节点原本的所有内容，包括标签全部改变
      }
    } else if (arguments.length === 1) {
      /* 读 */
      if ("innerText" in node) {
        return node.innerText; // IE // 会将节点原本的所有内容，包括标签全部改变
      } else {
        return node.textContent; // Chrome/ Firefox // 会将节点原本的所有内容，包括标签全部改变
      }
    }
  },

  /* 用于读/写HTML内容 */
  html: function html(node, string) {
    if (arguments.length === 2) {
      node.innerHTML = string;
    } else if (arguments.length === 1) {
      return node.innerHTML;
    }
  },

  /* 用于修改style */

  /* 重载
   ** 第二个形参是对象时，就是设置；dom.style(div, {color: "red"})
   ** 有三个形参时，也是设置；dom.style(div, 'color', 'red')
   ** 第二个形参是字符串时，就是读取 dom.style(div, 'color')
   */
  style: function style(node, name, value) {
    if (arguments.length === 3) {
      // dom.style(div, "color", "red"')
      return node.style[name] = value; // node.style.name = value;
    } else if (arguments.length === 2) {
      if (typeof name === "string") {
        // 读取 dom.style(div, 'color')
        return node.style[name];
      } else if (name instanceof Object
      /* true */
      ) {
          // dom.style(div, {color:'red'})
          var object = name;

          for (var key in object) {
            // 遍历读取所有对应的key
            // key: border | color | ···
            // node.style.border = ...
            // node.style.color = ...
            // 调用属性值 []方法 读取的时变量;点方法 读取的是字符串
            // node.style.key; // 字符串
            node.style[key] = object[key];
          }

          return object;
        }
    }
  },
  class: {
    /* 用于添加class */
    add: function add(node, className) {
      node.classList.add(className);
    },

    /* 用于删除class */
    remove: function remove(node, className) {
      node.classList.remove(className);
    },
    has: function has(node, className) {
      return node.classList.contains(className);
    }
  },
  on: function on(node, eventName, fn) {
    node.addEventListener(eventName, fn);
  },
  off: function off(node, eventName, fn) {
    console.log('点击取消事件');
    node.removeEventListener(eventName, fn);
  },
  toggle: function toggle(node, eventName, fn) {
    node.addEventListener("mousedown", function () {
      console.log("鼠标按下了");
      node.addEventListener("mousemove", fn);
      node.addEventListener("mouseup", function () {
        console.log("鼠标抬起了");
        node.removeEventListener("mousemove", fn);
      });
    });
  },
  find: function find(selector, scope) {
    return (scope || document).querySelectorAll(selector);
  },
  parent: function parent(node) {
    return node.parentNode;
  },
  children: function children(node) {
    return node.children;
  },
  siblings: function siblings(node) {
    return Array.from(node.parentNode.children).filter(function (n) {
      return n !== node;
    });
  },
  next: function next(node) {
    var x = node.nextSibling;

    while (x && x.nodeType === 3) {
      x = x.nextSibling;
    }

    return x;
  },
  previous: function previous(node) {
    var x = node.previousSibling;

    while (x && x.nodeType === 3) {
      x = x.previousSibling;
    }

    return x;
  },
  each: function each(nodeList, fn) {
    for (var i = 0; i < nodeList.length; i++) {
      fn.call(null, nodeList[i]);
    }
  },
  index: function index(node) {
    var list = dom.children(node.parentNode);
    var i;

    for (i = 0; i < list.length; i++) {
      if (list[i] === node) {
        break;
      }
    }

    return i;
  }
};
},{}],"../../../../../../../.config/yarn/global/node_modules/parcel/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "59202" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../../../../../../../.config/yarn/global/node_modules/parcel/src/builtins/hmr-runtime.js","dom.js"], null)
//# sourceMappingURL=/dom.1d0b6d56.js.map