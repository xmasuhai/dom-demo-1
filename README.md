# 代码使用方法

```bash
yarn global add parcel 或者 npm i -g parcel

# 找个干净的目录
git clone https://github.com/xmasuhai/dom-demo-1.git
cd dom-demo-1
parcel src/index.html
```

## 实现下面三个接口

```JavaScript
window.dom = {
    find(selector){
        document.querySelectorAll(selector);
    },
    style(node,name,value){
        if(arguments.length === 3){
            node.style[name] = value;
        }else if(arguments.length === 2){
            if(typeof name === 'string'){
                return node.style[name];
            }else if(name instanceof Object){
                for(let key in name)
                node.style[key] = name[key];
            }
        }
    },
    each(nodeList,fun){
        for(let i=0;i<nodeList.length;i++){
            fun.call(null, nodeList[i]);
        }
    }
}

/* 测试代码 */
const div = dom.find('#test>.red')[0] // 获取对应的元素
dom.style(div, 'color', 'red') // 设置 div.style.color

const divList = dom.find('.red') // 获取多个 div.red 元素
dom.each(divList, (n)=> console.log(n)) // 遍历 divList 里的所有元素
```
