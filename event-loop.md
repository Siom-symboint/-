event-loop 再熟悉

一个event loop有```一个或者多个```task队列。(macrotask/宏任务) ,一个先进先出的队列

当用户代理安排一个任务，必须将该任务增加到相应的event loop的一个tsak队列中。

每一个task都来源于指定的任务源，比如可以为鼠标、键盘事件提供一个task队列，其他事件又是一个单独的队列。可以为鼠标、键盘事件分配更多的时间，保证交互的流畅。

属于macrotask任务的有
DOM操作任务源：
此任务源被用来相应dom操作，例如一个元素以非阻塞的方式插入文档。

用户交互任务源：
此任务源用于对用户交互作出反应，例如键盘或鼠标输入。响应用户操作的事件（例如click）必须使用task队列。

网络任务源：
网络任务源被用来响应网络活动。

history traversal任务源：
当调用history.back()等类似的api时，将任务插进task队列。

task任务源非常宽泛，比如ajax的onload，click事件，基本上我们经常绑定的各种事件都是task任务源，还有数据库操作（IndexedDB ），需要注意的是setTimeout、setInterval、setImmediate也是task任务源。总结来说task任务源：

setTimeout
setInterval
setImmediate
I/O
UI rendering

每一个event loop都有```一个```microtask(微任务)队列，一个microtask会被排进microtask队列而不是task队列

microtask 队列和task 队列有些相似，都是先进先出的队列，由指定的任务源去提供任务，不同的是一个
event loop里只有一个microtask 队列。

HTML Standard没有具体指明哪些是microtask任务源，通常认为是microtask任务源有：

```js
process.nextTick
promises
Object.observe
MutationObserver
```

###在现在大部分主流浏览器版本定义里,promises属于microtask中,但也有例外,比如safari 9.1.2

event loop的处理过程（Processing model）
在规范的Processing model定义了event loop的循环过程：

一个event loop只要存在，就会不断执行下边的步骤： 
1.在tasks队列中选择最老的一个task,用户代理可以选择任何task队列，如果没有可选的任务，则跳到下边的microtasks步骤。 
2.将上边选择的task设置为正在运行的task。 
3.Run: 运行被选择的task。 
4.将event loop的currently running task变为null。 
5.从task队列里移除前边运行的task。  
6.Microtasks: 执行```microtasks任务检查点```。（也就是执行microtasks队列里的任务） 
7.更新渲染（Update the rendering）... 
8.如果这是一个worker event loop，但是没有任务在task队列中，并且WorkerGlobalScope对象的closing标识为true，则销毁event loop，中止这些步骤，然后进行定义在Web workers章节的run a worker。  
9.返回到第一步。

event loop会不断循环上面的步骤，概括说来：

event loop会不断循环的去取tasks队列的中最老的一个任务推入栈中执行，并在当次循环里依次执行并清空microtask队列里的任务。
执行完microtask队列里的任务，有可能会渲染更新。（浏览器很聪明，在一帧以内的多次dom变动浏览器不会立即响应，而是会积攒变动以最高60HZ的频率更新视图）


```js
macrotasks: script(整体代码),setTimeout, setInterval, setImmediate, I/O, UI rendering
microtasks: process.nextTick, Promises, Object.observe, MutationObserver

//作者：何幻
//链接：https://www.jianshu.com/p/3ed992529cfc
```

microtasks检查点（microtask checkpoint）
event loop运行的第6步，执行了一个microtask checkpoint，看看规范如何描述microtask checkpoint：

当用户代理去执行一个microtask checkpoint，如果microtask checkpoint的flag（标识）为false，用户代理必须运行下面的步骤：
1.将microtask checkpoint的flag设为true。
2.Microtask queue handling: 如果event loop的microtask队列为空，直接跳到第八步（Done）。
3.在microtask队列中选择最老的一个任务。
4.将上一步选择的任务设为event loop的currently running task。
5.运行选择的任务。
6.将event loop的currently running task变为null。
7.将前面运行的microtask从microtask队列中删除，然后返回到第二步（Microtask queue handling）。
8.Done: 每一个environment settings object它们的 responsible event loop就是当前的event loop，会给environment settings object发一个 rejected promises 的通知。
9.清理IndexedDB的事务。
10.将microtask checkpoint的flag设为flase。

microtask checkpoint所做的就是执行microtask队列里的任务。什么时候会调用microtask checkpoint呢?

当上下文执行栈为空时，执行一个microtask checkpoint。
在event loop的第六步（Microtasks: Perform a microtask checkpoint）执行checkpoint，也就是在运行task之后，更新渲染之前。



macrotasks和microtask都是推入栈中执行的，要完整了解event loops还需要认识JavaScript execution context stack，它的规范位于https://tc39.github.io/ecma262/#execution-context-stack。
