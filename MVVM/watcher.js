/* 观察者的目的 提供响应式以来
    当数据变化时  执行对应的方法
    当data变化时，通知相应的元素变化
*/
class Watcher {
    constructor(vm,expr,cb){
         this.vm = vm
         this.expr = expr
         this.cb = cb
         this.value = this.get()
    }
    getConstantValue(vm,expr){
        expr = expr.split('.')
        return expr.reduce((pre,next)=>{
            return  pre[next]
        },vm.$data)
    }

    get(){
        Dep.target = this
       let val =   this.getConstantValue(this.vm,this.expr)
        Dep.target = null
       return val
        
    }

    update(){
        let newVal  = this.getConstantValue(this.vm,this.expr)
        let oldVal = this.value
        if(newVal !== oldVal){
            this.cb(newVal,oldVal)
        }
    }
}