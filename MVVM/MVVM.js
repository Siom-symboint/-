class MVVM {
    constructor(options){
        // 挂载实例
        this.$el = options.el
        this.$data = options.data
        // 数据劫持 吧对象的所有属性改成get/set方法

        new Observer(this.$data)
        this.proxyData(options.data)
        // 如果有要编译的模板我就开始开始编译
        if(this.$el){
            new Compile(this.$el,this)
        }
    }
    proxyData(data){
        Object.keys(data).forEach(key => {
            Object.defineProperty(this,key,{
                get(){
                    return this.$data[key]
                },
                set(newVal){
                    this.$data[key] = newVal
                }
            })
        });
    }
}

// export default MVVM