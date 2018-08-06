```
原来的Server代码:


​```js
// index.js
  const http = require('http')
  const chalk = require('chalk')
  const conf = require('./config/defaultConfig')
  const path = require('path')
  const route = require('./route/route')

  const server = http.createServer((req, res) => {
      const filePath = path.join(this.conf.root, req.url)
      route(req, res, filePath,this.conf)
    })


    server.listen(this.conf.port, this.conf.hostname, () => {
      const addr = `http://${this.conf.hostname}:${this.conf.port}`;
      console.info(`Server started at ${chalk.green(addr)}`)
    })
//config/defaultConfig.js

module.exports = {
  root:process.cwd(),
  hostname:'127.0.0.1',
  port:9999,
  compress:/\.(html|js|css|md)/, //支持压缩的扩展名
  cache:{
    maxAge:600,
    expires:true,
    cacheControl:true,
    lastModified:true,
    etag:true
  }
}

// route/route.js
 const fs = require('fs')
 const promisify = require('util').promisify
 const stat = promisify(fs.stat)
 const readdir = promisify(fs.readdir)
 const path = require('path')
 const HandleBars = require('handlebars')
 const config = require('../config/defaultConfig.js')

 
 module.exports = async function (req, res, filePath) {
   const stats = await stat(filePath)
   if (stats.isFile()) {
       if (filePath.match(config.compress)) {
         rs = compress(rs, req, res)
       }
       rs.pipe(res)
     } else if (stats.isDirectory()) {
       const files = await readdir(filePath)
       res.statusCode = 200
       res.setHeader('Content-Type', 'text/html')
       const dir = path.relative(config.root, filePath);
    //... other code
     }
   } catch (ex) {
     console.info(ex)
     res.statusCode = 404
     res.setHeader('Content-Type', 'text/plain')
     res.end(`${filePath} is not a directory or file`)
   }
 }

​```

现在Server 的代码

​```js
//index.js
const http = require('http')
const chalk = require('chalk')
const conf = require('./config/defaultConfig')
const path = require('path')
const route = require('./route/route')

//为方便命令行调用,Server抛出class 每次新增实例调用start()开启服务
class Server { 
  constructor(config) {
     this.conf = Object.assign({},conf,config)
  }

  start(){
    const server = http.createServer((req, res) => {
      const filePath = path.join(this.conf.root, req.url)
      route(req, res, filePath,this.conf)//不再读取defaultConfig下的配置
    })


    server.listen(this.conf.port, this.conf.hostname, () => {
      const addr = `http://${this.conf.hostname}:${this.conf.port}`;
      console.info(`Server started at ${chalk.green(addr)}`)
    })

  }
}

module.exports = Server

//config/defaultConfig.js

module.exports = {
  root:process.cwd(),
  hostname:'127.0.0.1',
  port:9999,
  compress:/\.(html|js|css|md)/, //支持压缩的扩展名
  cache:{
    maxAge:600,
    expires:true,
    cacheControl:true,
    lastModified:true,
    etag:true
  }
}

//yargs.js
//以yargs工具为例
const yargs = require('yargs')
const Server = require('./index')
const conf = require('./config/defaultConfig')

const argv = yargs
  .usage('anywhere [options]')//配置命令
  .option('p', {
    alias: 'port',
    describe: '端口号',
    default: conf.port
  })
  .option('h', {
    alias: 'hostname',
    describe: 'host',
    default: conf.hostname
  })
  .option('d', {
    alias: 'root',
    describe: 'root path',
    default: process.cwd()
  })
  .version()
  .alias('v','version')
  .help()
  .argv;

  const server = new Server(argv)

  server.start()

//route/route.js

 const fs = require('fs')
 const promisify = require('util').promisify
 const stat = promisify(fs.stat)
 const readdir = promisify(fs.readdir)
 const path = require('path')
 const HandleBars = require('handlebars')
//  const config = require('../config/defaultConfig.js')

 module.exports = async function (req, res, filePath, config) { 
     // 为将defaultConfig做cli可配置化,不再读文件信息,转为server 传入
   try {
     const stats = await stat(filePath)
     if (stats.isFile()) {
       const contentType = mime(filePath)
       res.setHeader('Content-Type', `${ contentType};charset=utf-8`)
       res.setHeader('Access-Control-Allow-Origin', '*')
       res.setHeader("Access-Control-Allow-Methods", "*");
       res.setHeader("Access-Control-Allow-Headers", "Content-Type,XFILENAME,XFILECATEGORY,XFILESIZE");
       if (filePath.match(config.compress)) {
         rs = compress(rs, req, res)
       }
       rs.pipe(res)
       // fs.readFile(filePath,(err,data)=>{
       //   res.end(data)
       // })
     } else if (stats.isDirectory()) {
       const files = await readdir(filePath)
       res.statusCode = 200
       res.setHeader('Content-Type', 'text/html')
    //... other code
       res.end()
     }
   } catch (ex) {
     console.info(ex)
     res.statusCode = 404
     res.setHeader('Content-Type', 'text/plain')
     res.end(`${filePath} is not a directory or file`)
   }
 }


​```

此时即可通过参数命令配置服务启动,如:

​```shell
node src/yargs.js -p 1234 
Server started at http://127.0.0.1:1234
​```

发布到npm

​```json
//package.json
  "bin": {
      "staticWebServer":"bin/staticWebServer" //语义化,anydoor为可执行命令
  },

//新增 bin/staticWebServer

#! /usr/bin/env node

require('../src/yargs.js')


//新增config/openUrl.js
const {exec} = require('child_process')

module.exports = url =>{
  switch (process.platform) {
    case 'darwin':
    exec(`open ${url}`)
      break;
    case 'win32':
    exec(`start ${url}`)
    default:
      break;
  }
}

// src/index.js
const http = require('http')
const chalk = require('chalk')
const conf = require('./config/defaultConfig')
const path = require('path')
const route = require('./route/route')
+ const openUrl = require('./config/openUrl')


class Server {
  constructor(config) {
    this.conf = Object.assign({},conf,config)
  }

  start(){
    const server = http.createServer((req, res) => {
      const filePath = path.join(this.conf.root, req.url)
      route(req, res, filePath,this.conf)
    })

    server.listen(this.conf.port, this.conf.hostname, () => {
      console.info(this.conf)
      const addr = `http://${this.conf.hostname}:${this.conf.port}`;
      console.info(`Server started at ${chalk.green(addr)}`)
+      openUrl(addr) //自动打开网址功能
    })

  }
}

module.exports = Server

​```

#### 发布到npm

​```shell
npm login
npm publish
​```



​```js
//安装
npm i -g staticWebServer 
//使用方法 例
/**
*把当前文件夹作为静态资源服务器根目录 
* anydoor -p 8080 #设置端口号为8080
* anydoor -h localhost #设置host 为localhost
* anydoor -d /usr # 设置根目录为/usr
*/
​```

- 使用方法

​```js
anydoor  #  把当前文件夹作为静态资源服务器根目录

anydoor 
​```
```