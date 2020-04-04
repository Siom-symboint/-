class Observer {
    constructor(data){
        
        this.observe(data)
        
    }
    observe(data){
        // 要对这个data数据将原有的属性改成set和get的形式
        if(!data || typeof data !== 'object'){
            return 
        }
        
        // 要将数据一一劫持
         Object.keys(data).forEach(key =>{
             this.defineReactive(data,key,data[key])
             this.observe(data[key])
         })
    }
    // 数据劫持
    defineReactive(obj,key,value){
        let dep = new Dep()
        let _this = this
        Object.defineProperty(obj,key,{
            enumerable:true,
            configurable:true,
            get(){
                Dep.target &&  dep.addSub(Dep.target)  
                return value
            },
            set(newValue){
                _this.observe(newValue)
                if(newValue  !== value){
                    value = newValue
                    dep.notify()
                }
            }
        })
    }
}

class Dep {
    constructor(){
        // 订阅的数组
        this.subs = []
    }

    addSub(watcher){
        this.subs.push(watcher)
    }
    notify(){
        this.subs.forEach(watcher=>{
            watcher.update()
        })
    }
}