let fragment = document.createDocumentFragment()
class Compile {
    constructor(el,vm){
        this.el = this.isElementNode(el)?el:document.querySelector(el)
        this.vm = vm
         // 如果这个元素能获取到  我们才开始编译
        if(!this.el ) return 
        // 先把真实dom移入到内存中 
        let fragment =  this.nodeToFragment(this.el)
        // 编译 => 提取想要的元素节点  v-model 和 文本节点
        this.compile(fragment)
        // 把编译好的fragment 塞回到页面中
        this.el.appendChild(fragment)
           
    }
    /** 专门写一些辅助方法 */
    isElementNode(node){

        return node.nodeType === 1
    }
    
    isDirective(name){
        return name.includes('v-')
    }
    /* 核心方法 */
    nodeToFragment(el){

        let firstChild
        while (firstChild  = el.firstChild) {
            fragment.appendChild(firstChild)
        }
        return fragment
    }
    
    compile(fragment){
        let childNodes = [...fragment.childNodes]
            childNodes.forEach(element=>{
                if(this.isElementNode(element)){
                    // 这里需要编译元素
                    this.compileElement(element)
                    this.compile(element)/* 递归 */ 
                }else{
                    // 这里需要编译文本
                    this.compileText(element)
                }
            })
    }

    compileElement(element){
        // v-model v-test解析
        let attrs = [... element.attributes]
        attrs.forEach(attr => {
            
            if(this.isDirective(attr.name)){
                const value = attr.value
                let type = attr.name.slice(2)
                compileUtil[type](element,this.vm,value)
            }
        });
    }

    compileText(element){
        let text = element.textContent
        let reg = /\{\{([^}]+)\}\}/g 
        if(reg.test(text)){
             // node this.vm.$data text
             compileUtil['text'](element,this.vm,text)
        }
    }
}

let a = 1
const  compileUtil = {
    getVal(vm,expr){
        console.log(expr)
        let exprList = expr.split('.')
      return  exprList.reduce((pre,text)=>{
          return pre[text]  
        },vm.$data)
    },
    text(node,vm,expr){// 文本处理
            let updateFn= this.updater['updaterText']
           expr =   expr.replace(/\{\{([^}]+)\}\}/g ,(...arg)=>{
            let watcher =   new Watcher(vm,arg[1],()=>{
                updateFn && updateFn(node,this.getVal(vm,arg[1]))
            })
                return arg[1]
            }).replace(/\s+/g, "").replace(/<\/?.+?>/g,"")
            
            updateFn && updateFn(node,this.getVal(vm,expr))
    },
    model(node,vm,expr){ // 输入框处理

        let updateFn= this.updater['updaterModel']
        new Watcher(vm,expr,()=>{
            updateFn && updateFn(node,this.getVal(vm,expr))
        })
        updateFn && updateFn(node,this.getVal(vm,expr))
    },   
    updater:{
        updaterText(node,value){
            node.textContent = value
        },
        updaterModel(node,value){
            node.value = value 
        }
    }
}
