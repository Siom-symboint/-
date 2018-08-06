### 进程


是计算机中的程序关于某数据集合上的一次运行活动，是系统进行资源分配和调度的基本单位

### 线程

进程内一个相对独立的，可调度的执行单元，与同属一个进程的线程共享进程的资源

多线程：启动一个进程，在一个进程内启动多个线程，这样多个线程也可以同时实行多个任务

- nodejs单线程：只针对主进程，I/O操作系统底层多线程调度

单线程并不是单进程：（并非只能调用单核）

常用场景：web场景， I/O密集型任务（非CPU密集型任务），高并发任务
例:webServer开发，本地（前端）代码构建（编译），实用工具开发（小爬虫，类似实用工具）--后两者从性能上并非最有，语法环境对前端适应性较强


 ### common.js
    module 被加载的时候执行，加载后缓存（第二遍记载的时候的时候不会再执行，直接使用缓存结果）
    （）
    
    一旦出现某个模块被循环加载，只输出已执行的部分，未执行的部分不被输出

 ```js
   moudule.exports  === exports   //true
 ```
exports 会自动指向 moudule.exports，因而轻易不要改变exports指向（在common.js的规范中）

###  path(路径)

API：
  normalize 格式化路径 
  ```JS
  const {normalize} = require('path')

  normalize('/usr//bin/../app.js')  //usr/bin/app.js
  ```
resolve 相对路径

```JS
const path  = require('path')

path.resove('./') //当前执行环境相对于 './'的执行路径
```



  join 拼接路径 

  ```JS
  const {join} = require('path')

  join('/usr','local','bin/')  //usr/local/bin  
  ```
  resolve 相对路径解析成绝对路径

  basename extname dirname   文件名  所在路径  拓展名

  parse format     分析路径生成对象   解析对象成路径



```js
// 如果提供了 `dir` `root`和 `base` 则返回 `{dir}${path.sep}${base}`

path.format({
    root:`/ingored`,
    dir:'home/usr/dir',
    base:'file.js'
})// home/user/dir/file.js

// 提供 `dir`，会忽略root
// 提供 `base`,会忽略ext，name， 
```

- _dirname  _filename resolve

// _dirname _filename 返回文件的绝对路径

//process.cwd() 返回当前进程的启动路径，并不一定是启动程序的所在路径



### buffer

- buffer 用于处理二进制数据流

- 实例类似整数数组，大小固定（不可修改长度）

- 底层实现是在V8引擎外分配物理内存。

  ```json
  Buffer.alloc(10) //创建一个长度为10的buffer, 默认用0填充(16进制)
  //alloc()接收数字，数字，字符串(可指定编码，默认utf-8)
  
  Buffer.acllocUnsafe(10) //创建一个长度为10的buffer,但是是不安全的，对应物理内存不确定，不会初始化，所以所含内容随机
  
  Buffer.form('test') //同样为创建一个Buffer实例，无法指定大小
  
  Buffer.byteLength //占用字节
  
  Buffer.isBuffer() //是否为buffer对象
   
  Buffer.concat() //拼接Buffer ，传入参数为Buffer 实例
  
  const buf = Buffer.form('this is a test Buffer')
  
  buf.length() //Buffer实例长度
  
  buf.toString('base64') //将Buffer实例内容转为base64格式的字符串
  
  buf.fill() //填充buffere实例
  
  const buf2 = Buffer.form('this is a test Buffer')
  buff.equals(buf2) //比较两个Buffer实例内容是否一致，和各自内存地址无关
  
  buf.indexOf() //类数组方法 有一系列
  
  buf.copy(bufer,form,to) //复制buffer内容，第一个参数为buffer内容，后两个参数为起止位置
  
  const StringDecoder = require('string-decoder').StringDecoder
  
  const decoder = new StringDecoder()
  
  const buf3 = Buffer.from('中文字符串')
  
  for(let i= 0; i <buf.length; i+=5){
      const b = Buffer.allocUnsafe(5);
      
      buf.copy(b,0,i)
    console.log(decoder.write(b))
      //由于中文字占3个字符长度，因此直接打印b时，会产生utf-8的编码格式无法解析的情况从而产生编码，因此需要StringDecoder这个方法，会自动识别不会产生中文乱码的格式
  }
  
  ```

  

### events

#####  node 中的event模块，和浏览器端的事件机制基本一致，核心思想为异步事件驱动架构，emitter（触发器，在浏览器端即为click，keyUp等一系列事件）周期性地调用函数对象（监听器）

- 所有能出发事件的对象都是 EventEmitter类的实例

  eventEmitter.on()允许将一个或多个函数绑定到会被触发的命名事件上

  当EventEmitter对象触发一个事件时，所有绑定在该事件的函数会被依次同步调用

  ```JS
  const EventEmitter = require('events');
  
  class MyEmitter extends EventEmitter{}
  
  cosnt myEmitter = new MyEmitter()
  
  myEmitter.on('event',()=>{
      console.log('触发了一个事件')
  })//注册事件
  
  myEmitter.emit('event')；//触发事件
  
  myEmitter.once('test',()=>{
      console.log('test event')
  })
  
  setInterVal(()=>{
      myEmitter.emit('test')
  },1000)//只会调用一次
  
  myEmitter.removeListener('test'.fn)//移除掉相应的回调函数
  
  myEmitter.removeListeners('test')//移除掉所有回调函数
  
  ```

  ### fs

  ```js
  /**
  * fs模块大部分API提供同步读取和异步读取两种方法，但都推荐用异步方式。
  *   在异步回调中，第一个参数永远为捕获的一场，  
  **/
  //读取文件，第一个参数为文件路径,第二个参数可忽略，这里表示用utf8的编码格式读取文件 ,可配置为一个对象
  fs.readFile(path,'utf8'，(err,data)=>{
      if(err) throw err
      
      console.log(data) //data为一个Buffer对象
  })
  fs.resdFileSync(path,'utf8')//同步操作
  
  //写入文件，第二个参数问写入参数，字符串时需指定编码格式，或可直接传入Buffer对象
  fs.writeFile(path,'this is a new Content',{ecoding:'utf8'},err=>{
      if(err) throw err
      
      console.log('done')
  })//写入字符串
  
  
  fs.stat(path,(err,stas)=>{
      if(err) throw err //错误捕获之后的操作
      
     stats.isFile()//是否为文件
     stats.isDirectory()//是否为文件夹
  })
  
  //文件重命名
  fs.readname('./text','text.txt',err=>{
      if(err) throw err
      
      console.log('done')
  })
  
  //文件删除
  fs.unlink('/usr/work/data',(err)=>{
      if(err) throw err;
      console.log('成功删除')
  })
  
  fs.readdir(path,handler) //读取文件夹
  fs.mkdir(path,hanlder) //创建文件夹
  fs.rmdir(path,handler) //删除文件夹
  
  fs.watch(path,options，handler) //监听文件变化
  options:{
      recursive:true,//是否递归监听
          
  }
   handler(eventType,filename){
   console.log(eventType) //变化类型
   console.log(filename) //文件名
   }
  ```

  

  ```js
  cost rs = fs.createReadStream(path) //创建一个Stream
  
  rs.pipe(process.stdout); //pipe,'管道' 参数代表管道末，即到达地址此例即为输出到控制台
  
  const ws = fs.createWriteStream(path) //创建一个写入流
  
  ws.on('finish',()=>{
      console.log('done')
  })//写入完成之后的回调
  ```

  

  `回调地狱解决`

  ```js
  const fs = require('fs')
  coonst promisify = require('util').pormisify
  
  const read = promisify(fs.readFile)
  read('./read.md').then().catch()
  //类似es6promise的实现，
  
  async function asyncReadFile(){
      try{
           const content  = await read('./read.md')
           console.log(content.toString())
      }catch(e){
          console.log(e)
      }  
  }
  //第三方框架koa，egg也更好实现了
  ```
  ### 静态资源服务器

  ```js
  const http = require('http')
  const chalk = require('chalk')
  const conf = require('./config/defaultConfig')
  const path = require('path')
  const route = require('./route/route')
  
  const server = http.createServer((req,res)=>{
    const filePath = path.join(conf.root,req.url)
    console.info(res)
    fs.stat(filePath,(err,stats)=>{
      if(err){
        res.statusCode = 404
  
        res.setHeader('Content-Type','text/plain')
        res.end(`${filePath} is not a directory or file`)
      }
      if(stats.isFile()){
        res.statusCode = 200
        res.setHeader('Content-Type','text/plain;charset=utf-8')
        // res.setEncoding('utf-8');
        // res.setHeader('Content-Type','text/plain,	application/x-jpg')//指定下载js文件
        fs.createReadStream(filePath).pipe(res)
        // fs.readFile(filePath,(err,data)=>{
        //   res.end(data)
        // })
      }else if(stats.isDirectory()){
        fs.readdir(filePath,(err,files)=>{
          res.statusCode = 200
          res.setHeader('Content-Type','text/plain')
          res.end(files.join(','))
        })
      }
    })
      res.statusCode = 200
      res.setHeader('Content-Type','text/html')
      res.write('<html><body><b>Hello Http</b></body></html>')
      //wirte可重复多写
  	res.end(filePath)
  })
  
  
  server.listen(conf.port, conf.hostname, () => {
    const addr = `http://${conf.hostname}:${conf.port}`;
    console.info(`Server started at ${chalk.green(addr)}`)
  })
  
  ```

  - tips: npm i -g -s supervisor   ,supervisor src/index.js 开启调试