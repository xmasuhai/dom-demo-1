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
    create(tagName /* 语义化 形参 */ ) {
        // return document.createElement(tagName) // 不能创建带有结构的 HTML 元素`<div><span>1</span></div>`

        // const container = document.createElement("div")
        const container = document.createElement("template");
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
    after(node, node2) {
        // 在后面插入节点，就相当于在此 node 后面的节点的前面插 // 必须调用父节点的 insertBefore() 方法
        console.log(node.siblings); // null ?
        node.parentNode.insertBefore(node2, node.nextSibling);
        /* 判断 排除最后一个节点 没有下一个节点 null 也符合 */
    },
    before(node, node2) {
        node.parentNode.insertBefore(node2, node);
    },
    append(parent, node) {
        parent.appendChild(node);
    },
    wrap(node, parent) {
        dom.before(node, parent); // 将要包裹的“父节点”先插到目标节点的前面
        dom.append(parent, node); // 再把目标节点用 append 移至将要包裹的父节点的下面
    },
    remove(node) {
        // node.remove() // IE 不支持 兼容性不好
        node.parentNode.removeChild(node);
        return node; // 仍然需要获取此节点的引用
    },
    empty(node) {
        // 清空 node 里面的所有子元素
        // node.innerHTML = ''
        // const childNodes = node.childNodes 可以改写成以下的写法
        /*
         ** const {childNodes} = node // 解构赋值
         */
        const array = [];
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
        let x = node.firstChild;
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
    attr(node, name, value) {
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
    text(node, string) {
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
    html(node, string) {
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
    style(node, name, value) {
        if (arguments.length === 3) {
            // dom.style(div, "color", "red"')
            return node.style[name] = value;
            // node.style.name = value;
        } else if (arguments.length === 2) {
            if (typeof name === "string") {
                // 读取 dom.style(div, 'color')
                return node.style[name];
            } else if (name instanceof Object /* true */ ) {
                // dom.style(div, {color:'red'})
                const object = name;
                for (let key in object) {
                    // 遍历读取所有对应的key
                    // key: border | color | ···
                    // node.style.border = ...
                    // node.style.color = ...
                    // 调用属性值 []方法 读取的时变量;点方法 读取的是字符串
                    // node.style.key; // 字符串
                    node.style[key] = object[key];
                }
                return object
            }
        }
    },
    class: {
        /* 用于添加class */
        add(node, className) {
            node.classList.add(className)
        },
        /* 用于删除class */
        remove(node, className) {
            node.classList.remove(className)
        },
        has(node, className) {
            return node.classList.contains(className)
        }
    },
    on(node, eventName, fn) {
        node.addEventListener(eventName, fn)
    },
    off(node, eventName, fn) {
        console.log(`${eventName}取消事件`)
        node.removeEventListener(eventName, fn)
    },
    toggle(node, eventName, fn) {
        node.addEventListener("mousedown", function() {
            console.log("鼠标按下了");
            node.addEventListener(eventName, fn);
            node.addEventListener("mouseup", function() {
                console.log("鼠标抬起了");
                node.removeEventListener(eventName, fn)
            })
        });
    },
    /* 查 */
    /* scope 为查找的范围 节点对象 */
    find(selector, scope) {
        /* 如果有 scope 节点 就找 scope 里的；没有就找 document 里的 */
        return (scope || document).querySelectorAll(selector)
            /* 返回的是 NodeList 伪数组 取用加 NodeList[0] */
    },
    parent(node) {
        return node.parentNode
    },
    children(node) {
        return node.children
    },
    siblings(node) {
        return Array.from(node.parentNode.children)
            .filter(n => n !== node)
    },
    next(node) {
        let x = node.nextSibling
            /* 排除文本节点 */
        while (x && x.nodeType === 3) {
            x = x.nextSibling
        }
        return x
    },
    previous(node) {
        let x = node.previousSibling
            /* 排除文本节点 */
        while (x && x.nodeType === 3) {
            x = x.previousSibling
        }
        return x
    },
    each(nodeList, fn) {
        for (let i = 0; i < nodeList.length; i++) {
            fn.call(null, nodeList[i])
        }
    },
    index(node) {
        const list = dom.children(node.parentNode)
        let i
        for (i = 0; i < list.length; i++) {
            if (list[i] === node) {
                break
            }
        }
        return i
    }
};