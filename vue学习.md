1. [vue仓库地址](https://github.com/vuejs/vue.git)  分支:dev
2. [参考文章](http://hcysun.me/vue-design/art/)
3. ![Vue构造函数学习](/Users/symboint/Desktop/Vue构造函数学习.png)


Vue项目结构

```
├── scripts ------------------------------- 构建相关的文件，一般情况下我们不需要动
│   ├── git-hooks ------------------------- 存放git钩子的目录
│   ├── alias.js -------------------------- 别名配置
│   ├── config.js ------------------------- 生成rollup配置的文件
│   ├── build.js -------------------------- 对 config.js 中所有的rollup配置进行构建
│   ├── ci.sh ----------------------------- 持续集成运行的脚本
│   ├── release.sh ------------------------ 用于自动发布新版本的脚本
├── dist ---------------------------------- 构建后文件的输出目录
├── examples ------------------------------ 存放一些使用Vue开发的应用案例
├── flow ---------------------------------- 类型声明，使用开源项目 [Flow](https://flowtype.org/)
├── packages ------------------------------ 存放独立发布的包的目录
├── test ---------------------------------- 包含所有测试文件
├── src ----------------------------------- 这个是我们最应该关注的目录，包含了源码
│   ├── compiler -------------------------- 编译器代码的存放目录，将 template 编译为 render 函数
│   ├── core ------------------------------ 存放通用的，平台无关的代码
│   │   ├── observer ---------------------- 反应系统，包含数据观测的核心代码
│   │   ├── vdom -------------------------- 包含虚拟DOM创建(creation)和打补丁(patching)的代码
│   │   ├── instance ---------------------- 包含Vue构造函数设计相关的代码
│   │   ├── global-api -------------------- 包含给Vue构造函数挂载全局方法(静态方法)或属性的代码
│   │   ├── components -------------------- 包含抽象出来的通用组件
│   ├── server ---------------------------- 包含服务端渲染(server-side rendering)的相关代码
│   ├── platforms ------------------------- 包含平台特有的相关代码，不同平台的不同构建的入口文件也在这里
│   │   ├── web --------------------------- web平台
│   │   │   ├── entry-runtime.js ---------- 运行时构建的入口，不包含模板(template)到render函数的编译器，所以不支持 `template` 选项，我们使用vue默认导出的就是这个运行时的版本。大家使用的时候要注意
│   │   │   ├── entry-runtime-with-compiler.js -- 独立构建版本的入口，它在 entry-runtime 的基础上添加了模板(template)到render函数的编译器
│   │   │   ├── entry-compiler.js --------- vue-template-compiler 包的入口文件
│   │   │   ├── entry-server-renderer.js -- vue-server-renderer 包的入口文件
│   │   │   ├── entry-server-basic-renderer.js -- 输出 packages/vue-server-renderer/basic.js 文件
│   │   ├── weex -------------------------- 混合应用
│   ├── sfc ------------------------------- 包含单文件组件(.vue文件)的解析逻辑，用于vue-template-compiler包
│   ├── shared ---------------------------- 包含整个代码库通用的代码
├── package.json -------------------------- 不解释
├── yarn.lock ----------------------------- yarn 锁定文件
├── .editorconfig ------------------------- 针对编辑器的编码风格配置文件
├── .flowconfig --------------------------- flow 的配置文件
├── .babelrc ------------------------------ babel 配置文件
├── .eslintrc ----------------------------- eslint 配置文件
├── .eslintignore ------------------------- eslint 忽略配置
├── .gitignore ---------------------------- git 忽略配置
```

# Vue源码学习

## Vue构造函数

#### tips(vue源码现版本涉及到用rollup.js做模块打包,flow做静态语法检查等,有兴趣大家可以自己去看下)

1,执行 `npm run dev` 时，根据 `scripts/config.js` 文件中的配置

```js
  'web-full-dev': {
    entry: resolve('web/entry-runtime-with-compiler.js'),
    dest: resolve('dist/vue.js'),
    format: 'umd',
    env: 'development',
    alias: { he: './entity-decoder' },
    banner
  }
```

2,入口文件为"web/entry-runtime-with-compiler.js"

web 指的是哪一个目录？这其实是一个别名配置，打开 scripts/alias.js 文件,web 指向的应该是 src/platforms/web  (那么已知scripts/alias.js配置了一堆别名.具体可自行查看,设置别名通过rollup实现,和webpack类似功能,包括别名,应用出入口配置,环境变量配置等,这里不深入研究),接下来从这里查找Vue 构造函数

里面这句话``` import Vue from './runtime/index'```查找到 ```src/platforms/web/runtime/index```里查找到```src/core/index```,过程省略

以此类推:找到真正抛出Vue实例的文件

```
src/platforms/web/entry-runtime-with-compiler.js ->src/platforms/web/runtime/index->src/core/index->src/core/instance/index
```

```js
//src/core/instance/index
//分别从 ./init.js、./state.js、./render.js、./events.js、./lifecycle.js 这五个文件中导入
import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

// 定义 Vue 构造函数
function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
   //划重点! 当New一个Vue时,this._init将被执行
  this._init(options)
}

// 将 Vue 作为参数传递给导入的五个方法
initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

// 导出 Vue
export default Vue
```

3,下面大概观察一下5个文件对"Vue"做了什么

```js
// .init => initMixin(Vue) 初始化Vue实例
// 类似 Vue: Class<Component> 即为 flow静态语法检查,可自定义类型配置 可直接视为
//export function initMixin (Vue)... 判断代码删除,感兴趣可自行阅览,这里希望走通一个流程
// 定义_init方法
export function initMixin (Vue: Class<Component>) { 
  Vue.prototype._init = function (options?: Object) {
    const vm: Component = this
    // a uid
    vm._uid = uid++
    // expose real self
    // 抛出实例本身 调用钩子
    vm._self = vm
    callHook(vm, 'beforeCreate')
    initInjections(vm) // resolve injections before data/props 
    initState(vm)
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}
```

```js
// .state.js =>stateMixin(Vue)
//接入了Observer
import {
  set,
  del,
  observe,
  defineReactive,
  toggleObserving
} from '../observer/index' 

export function stateMixin (Vue: Class<Component>) {
  // flow somehow has problems with directly declared definition object
  // when using Object.defineProperty, so we have to procedurally build up
  // the object here.
  const dataDef = {}
  dataDef.get = function () { return this._data }
  const propsDef = {}
  propsDef.get = function () { return this._props }
  // 非生产环境时,set劫持data props不可修改
  if (process.env.NODE_ENV !== 'production') {
    dataDef.set = function (newData: Object) {
      warn(
        'Avoid replacing instance root $data. ' +
        'Use nested data properties instead.',
        this
      )
    }
    propsDef.set = function () {
      warn(`$props is readonly.`, this)
    }
  }
  Object.defineProperty(Vue.prototype, '$data', dataDef)
  Object.defineProperty(Vue.prototype, '$props', propsDef)
  //设置Vue下的 this.$set this.$delete this.$watch,总算看到一点眼熟的东西了...
  Vue.prototype.$set = set
  Vue.prototype.$delete = del

  Vue.prototype.$watch = function (
    expOrFn: string | Function,
    cb: any,
    options?: Object
  ): Function {
    const vm: Component = this
    if (isPlainObject(cb)) {
      return createWatcher(vm, expOrFn, cb, options)
    }
    options = options || {}
    options.user = true
    const watcher = new Watcher(vm, expOrFn, cb, options)
    if (options.immediate) {
      cb.call(vm, watcher.value)
    }
    return function unwatchFn () {
      watcher.teardown()
    }
  }
}

```

可以看到，`$data` 属性实际上代理的是 `_data` 这个实例属性，而 `$props` 代理的是 `_props` 这个实例属性。然后有一个是否为生产环境的判断，如果不是生产环境的话，就为 `$data` 和 `$props` 这两个属性通过 `set`劫持报警,表示不能修改

```js
//./events.js =>eventsMixin(Vue)

//注册$on $once $off $emit
export function eventsMixin (Vue: Class<Component>) {
  const hookRE = /^hook:/
  Vue.prototype.$on = function (event: string | Array<string>, fn: Function): Component {
    const vm: Component = this
    if (Array.isArray(event)) {
      for (let i = 0, l = event.length; i < l; i++) {
        this.$on(event[i], fn)
      }
    } else {
      (vm._events[event] || (vm._events[event] = [])).push(fn)
      // optimize hook:event cost by using a boolean flag marked at registration
      // instead of a hash lookup
      if (hookRE.test(event)) {
        vm._hasHookEvent = true
      }
    }
    return vm
  }
    ... 
Vue.prototype.$once = function (event: string, fn: Function): Component {}
Vue.prototype.$off = function (event?: string | Array<string>, fn?: Function): Component {}
Vue.prototype.$emit = function (event: string): Component {}
```

```js
//./lifecycle.js => lifecycleMixin(Vue)

//注册生命周期
Vue.prototype._update = function (vnode: VNode, hydrating?: boolean) {}
Vue.prototype.$forceUpdate = function () {}
Vue.prototype.$destroy = function () {}
```

```js
//** .render.js => renderMixin(Vue)
/*这个方法的一开始以 Vue.prototype为参数调用了 installRenderHelpers 函数，这个函数来自于与 render.js 文件相同目录下的 render-helpers/index.js 文件，打开这个文件找到 installRenderHelpers 函数：
*/

export function renderMixin (Vue: Class<Component>) {
  // install runtime convenience helpers
  // 这个方法是给Vue.prototype 下面注册一系列方法, 具体看源码
  installRenderHelpers(Vue.prototype)

   //注册nextick方法
  Vue.prototype.$nextTick = function (fn: Function) {
    return nextTick(fn, this)
  }

  Vue.prototype._render = function () {
    const vm: Component = this
    const { render, _parentVnode } = vm.$options

    // reset _rendered flag on slots for duplicate slot check
    if (process.env.NODE_ENV !== 'production') {
      for (const key in vm.$slots) {
        // $flow-disable-line
        vm.$slots[key]._rendered = false
      }
    }

    if (_parentVnode) {
      vm.$scopedSlots = _parentVnode.data.scopedSlots || emptyObject
    }

    // set parent vnode. this allows render functions to have access
    // to the data on the placeholder node.
    vm.$vnode = _parentVnode
    // render self
    let vnode
    try {
      vnode = render.call(vm._renderProxy, vm.$createElement)
    } catch (e) {
      handleError(e, vm, `render`)
      // return error render result,
      // or previous vnode to prevent render error causing blank component
      /* istanbul ignore else */
      if (process.env.NODE_ENV !== 'production') {
        if (vm.$options.renderError) {
          try {
            vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e)
          } catch (e) {
            handleError(e, vm, `renderError`)
            vnode = vm._vnode
          }
        } else {
          vnode = vm._vnode
        }
      } else {
        vnode = vm._vnode
      }
    }
    // return empty vnode in case the render function errored out
    if (!(vnode instanceof VNode)) {
      if (process.env.NODE_ENV !== 'production' && Array.isArray(vnode)) {
        warn(
          'Multiple root nodes returned from render function. Render function ' +
          'should return a single root node.',
          vm
        )
      }
      vnode = createEmptyVNode()
    }
    // set parent
    vnode.parent = _parentVnode
    return vnode
  }
}

/*
经过这次混入以后加入了这两个方法
  Vue.prototype.$nextTick = function (fn: Function) {
    return nextTick(fn, this)
  }
  Vue.prototype._render = function () {}
  */
```



到目前为止，`core/instance/index.js` 文件，也就是 `Vue` 的出生文件的代码我们就看完了，按照之前我们寻找Vue构造函数时的文件路径回溯，下一个我们要看的文件应该就是 `core/index.js` 文件，要注意的事,以上的5个混入方法,return出来的都是vm,都是对Vue实例进行的操作

4`core/index.js`将 `Vue` 从 `core/instance/index.js` 文件中导入了进来，我们打开 `core/index.js` 文件，下面是其全部的代码

```js
//core/index.js
/* @flow */

import Vue from './instance/index'
import { initGlobalAPI } from './global-api/index'
import { isServerRendering } from 'core/util/env'
import { FunctionalRenderContext } from 'core/vdom/create-functional-component'
//混入全局API
initGlobalAPI(Vue)

//这一部分是为了再ssr中使用它 先忽略吧...
Object.defineProperty(Vue.prototype, '$isServer', {
  get: isServerRendering
})

Object.defineProperty(Vue.prototype, '$ssrContext', {
  get () {
    /* istanbul ignore next */
    return this.$vnode && this.$vnode.ssrContext
  }
})

// expose FunctionalRenderContext for ssr runtime helper installation
Object.defineProperty(Vue, 'FunctionalRenderContext', {
  value: FunctionalRenderContext
})

Vue.version = '__VERSION__'

export default Vue

```

```js
//./global-api/index
import { ASSET_TYPES } from 'shared/constants'
/*
 ASSET_TYPES = [
  'component',
  'directive',
  'filter'
]
*/
export function initGlobalAPI (Vue: GlobalAPI) {
  // config
  const configDef = {}
  configDef.get = () => config
  if (process.env.NODE_ENV !== 'production') {
    configDef.set = () => {
      warn(
        'Do not replace the Vue.config object, set individual fields instead.'
      )
    }
  }
  Object.defineProperty(Vue, 'config', configDef)

  // exposed util methods.
  // NOTE: these are not considered part of the public API - avoid relying on
  // them unless you are aware of the risk.
  // 注册vue.util 这一部分仍然为全局API但没有暴露出来,官方文档上没有介绍
  Vue.util = {
    warn,
    extend,
    mergeOptions,
    defineReactive
  }
  Vue.set = set
  Vue.delete = del
  Vue.nextTick = nextTick

   //到这里为止, options的都是一个空对象
  Vue.options = Object.create(null)
   // 注册了  'components','directives', 'filters' 3个option
  /* 将变成
  Vue.options = {
	components: Object.create(null),
	directives: Object.create(null),
	filters: Object.create(null),
	_base: Vue
	}
  */
  ASSET_TYPES.forEach(type => {
    Vue.options[type + 's'] = Object.create(null)
  })

  // this is used to identify the "base" constructor to extend all plain-object
  // components with in Weex's multi-instance scenarios.
  Vue.options._base = Vue

  //extend 来自于 shared/util.js 文件，可以在 附录/shared/util.js 文件工具方法全解 中查看其作用，总之这句话的意思就是将 builtInComponents 的属性混合到 Vue.options.components 中，其中 builtInComponents 来自于 core/components/index.js 文件 里面代码先不深究 到这一步,最终Vue.options会变成
/*
Vue.options = {
	components: {
		KeepAlive
	},
	directives: Object.create(null),
	filters: Object.create(null),
	_base: Vue
}
*/
  extend(Vue.options.components, builtInComponents)

  //往下跟踪这4个函数
  initUse(Vue)
  initMixin(Vue)
  initExtend(Vue)
  initAssetRegisters(Vue)
}

```

```js
 //global-api/use.js => initUse(Vue)
import { toArray } from '../util/index'

// 注册 Vue.use()方法
export function initUse (Vue: GlobalAPI) {
  Vue.use = function (plugin: Function | Object) {
    const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
    if (installedPlugins.indexOf(plugin) > -1) {
      return this
    }

    // additional parameters
    const args = toArray(arguments, 1)
    args.unshift(this)
    if (typeof plugin.install === 'function') {
      plugin.install.apply(plugin, args)
    } else if (typeof plugin === 'function') {
      plugin.apply(null, args)
    }
    installedPlugins.push(plugin)
    return this
  }
}

```

```js
//global-api/mixin.js => initMixin(Vue)

//注册 Vue.mixin()方法
import { mergeOptions } from '../util/index'

export function initMixin (Vue: GlobalAPI) {
  Vue.mixin = function (mixin: Object) {
    this.options = mergeOptions(this.options, mixin)
    return this
  }
}

```

```js
// global-api/extend.js => initExtend(Vue) =>注册Vue.extend()方法, 添加cid属性

import { ASSET_TYPES } from 'shared/constants'
import { defineComputed, proxy } from '../instance/state'
import { extend, mergeOptions, validateComponentName } from '../util/index'

export function initExtend (Vue: GlobalAPI) {
  /**
   * Each instance constructor, including Vue, has a unique
   * cid. This enables us to create wrapped "child
   * constructors" for prototypal inheritance and cache them.
   */
  Vue.cid = 0
  let cid = 1

  /**
   * Class inheritance
   */
  Vue.extend = function (extendOptions: Object): Function {
    extendOptions = extendOptions || {}
    const Super = this
    const SuperId = Super.cid
    const cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {})
    if (cachedCtors[SuperId]) {
      return cachedCtors[SuperId]
    }

    const name = extendOptions.name || Super.options.name
    if (process.env.NODE_ENV !== 'production' && name) {
      validateComponentName(name)
    }
	//注册一个新实例,并继承当前的option,再进行初始化
    const Sub = function VueComponent (options) {
      this._init(options)
    }
    Sub.prototype = Object.create(Super.prototype)
    Sub.prototype.constructor = Sub
    Sub.cid = cid++
    Sub.options = mergeOptions(
      Super.options,
      extendOptions
    )
    Sub['super'] = Super

    // For props and computed properties, we define the proxy getters on
    // the Vue instances at extension time, on the extended prototype. This
    // avoids Object.defineProperty calls for each instance created.
    if (Sub.options.props) {
      initProps(Sub)
    }
    if (Sub.options.computed) {
      initComputed(Sub)
    }

    // allow further extension/mixin/plugin usage
    Sub.extend = Super.extend
    Sub.mixin = Super.mixin
    Sub.use = Super.use

    // create asset registers, so extended classes
    // can have their private assets too.
      /*
     ASSET_TYPES = [
      'component',
      'directive',
      'filter'
    ]
    */
    ASSET_TYPES.forEach(function (type) {
      Sub[type] = Super[type]
    })
    // enable recursive self-lookup
    if (name) {
      Sub.options.components[name] = Sub
    }

    // keep a reference to the super options at extension time.
    // later at instantiation we can check if Super's options have
    // been updated.
    Sub.superOptions = Super.options
    Sub.extendOptions = extendOptions
    Sub.sealedOptions = extend({}, Sub.options)

    // cache constructor
    cachedCtors[SuperId] = Sub
    return Sub
  }
}
```

```js
// global-api/assets.js =>  initAssetRegisters(Vue)
// 注册三个全局API  Vue.components() 注册组件  Vue.directive()注册指令  Vue.filter()注册过滤器
/* @flow */

import { ASSET_TYPES } from 'shared/constants'
import { isPlainObject, validateComponentName } from '../util/index'

export function initAssetRegisters (Vue: GlobalAPI) {
  /**
   * Create asset registration methods.
   */
    // ASSET_TYPES = ['component', 'directive', 'filter']
  ASSET_TYPES.forEach(type => {
    Vue[type] = function (
      id: string,
      definition: Function | Object
    ): Function | Object | void {
      if (!definition) {
        return this.options[type + 's'][id]
      } else {
        /* istanbul ignore if */
        if (process.env.NODE_ENV !== 'production' && type === 'component') {
          validateComponentName(id)
        }
        if (type === 'component' && isPlainObject(definition)) {
          definition.name = definition.name || id
          definition = this.options._base.extend(definition)
        }
        if (type === 'directive' && typeof definition === 'function') {
          definition = { bind: definition, update: definition }
        }
        this.options[type + 's'][id] = definition
        return definition
      }
    }
  })
}

```

回到```platforms/web/runtime/index.js```下(platforms下有web和weex,我们只看web),

```js
//platforms/web/runtime/index.js

import Vue from 'core/index'
import config from 'core/config'
/*
core/config下初始化了Vue.config的状态
Vue.config = {
  optionMergeStrategies: Object.create(null),
  silent: false,
  productionTip: process.env.NODE_ENV !== 'production',
  devtools: process.env.NODE_ENV !== 'production',
  performance: false,
  errorHandler: null,
  warnHandler: null,
  ignoredElements: [],
  keyCodes: Object.create(null),
  isReservedTag: no,
  isReservedAttr: no,
  isUnknownElement: no,
  getTagNamespace: noop,
  parsePlatformTagName: identity,
  mustUseProp: no,
  _lifecycleHooks: LIFECYCLE_HOOKS
}
*/
import { extend, noop } from 'shared/util'
import { mountComponent } from 'core/instance/lifecycle'
import { devtools, inBrowser, isChrome } from 'core/util/index'

import {
  query,
  mustUseProp,
  isReservedTag,
  isReservedAttr,
  getTagNamespace,
  isUnknownElement
} from 'web/util/index'

import { patch } from './patch'
import platformDirectives from './directives/index'
/*
platformDirectives = {
  model,
  show
}
*/
import platformComponents from './components/index'
/*
platformComponents =  {
  Transition,
  TransitionGroup
}

*/
// install platform specific utils
/*
安装平台依赖
*/
Vue.config.mustUseProp = mustUseProp
Vue.config.isReservedTag = isReservedTag
Vue.config.isReservedAttr = isReservedAttr
Vue.config.getTagNamespace = getTagNamespace
Vue.config.isUnknownElement = isUnknownElement

// install platform runtime directives & components
/*
回顾上文,在进行此项操作之前, Vue.options是
Vue.options = {
	components: {
		KeepAlive
	},
	directives: Object.create(null),
	filters: Object.create(null),
	_base: Vue
} 这样的状态
*/
extend(Vue.options.directives, platformDirectives)
extend(Vue.options.components, platformComponents)
//extend之后, 变成了,适应"web"环境下的option
/*
Vue.options = {
	components: {
		KeepAlive,
		Transition,
		TransitionGroup
	},
	directives: {
		model,
		show
	},
	filters: Object.create(null),
	_base: Vue
}
*/

// install platform patch function
//如果在浏览器下 _patch_指向patch(),否则为一个空函数 function(){}
Vue.prototype.__patch__ = inBrowser ? patch : noop

// public mount method
Vue.prototype.$mount = function (
  el?: string | Element,
  hydrating?: boolean
): Component {
  el = el && inBrowser ? query(el) : undefined
  return mountComponent(this, el, hydrating)
}

// devtools global hook
/* istanbul ignore next */
if (inBrowser) {
  setTimeout(() => {
    if (config.devtools) {
      if (devtools) {
        devtools.emit('init', Vue)
      } else if (
        process.env.NODE_ENV !== 'production' &&
        process.env.NODE_ENV !== 'test' &&
        isChrome
      ) {
        console[console.info ? 'info' : 'log'](
          'Download the Vue Devtools extension for a better development experience:\n' +
          'https://github.com/vuejs/vue-devtools'
        )
      }
    }
    if (process.env.NODE_ENV !== 'production' &&
      process.env.NODE_ENV !== 'test' &&
      config.productionTip !== false &&
      typeof console !== 'undefined'
    ) {
      console[console.info ? 'info' : 'log'](
        `You are running Vue in development mode.\n` +
        `Make sure to turn on production mode when deploying for production.\n` +
        `See more tips at https://vuejs.org/guide/deployment.html`
      )
    }
  }, 0)
}

export default Vue

//至此告一段落  入口 web/entry-runtime.js 里面只有两句代码
/*

import Vue from './runtime/index'

export default Vue

即可知道在浏览器端抛出Vue的就是platforms/web/runtime/index.js
至于entry-runtime-with-compiler.js这个文件是在运行时的入口文件,加入了compiler(运行时需要不定时编译)
*/
```

## Vue实例生成过程

```js
// core/instance/index.js 
import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

function Vue (options) {
  if (process.env.NODE_ENV !== 'production' &&
    !(this instanceof Vue)
  ) {
    warn('Vue is a constructor and should be called with the `new` keyword')
  }
  this._init(options)
}

initMixin(Vue)
stateMixin(Vue)
eventsMixin(Vue)
lifecycleMixin(Vue)
renderMixin(Vue)

export default Vue

```

当```new Vue({el:'#app',data:{}})```时,首先执行的事 this._init(),来源自 ```core/instance/init.js```文件

```js
// core/instance/init.js

/* @flow */
/*
//Vue.config初始化
Vue.config = {
  optionMergeStrategies: Object.create(null),
  silent: false,
  productionTip: process.env.NODE_ENV !== 'production',
  devtools: process.env.NODE_ENV !== 'production',
  performance: false,
  errorHandler: null,
  warnHandler: null,
  ignoredElements: [],
  keyCodes: Object.create(null),
  isReservedTag: no,
  isReservedAttr: no,
  isUnknownElement: no,
  getTagNamespace: noop,
  parsePlatformTagName: identity,
  mustUseProp: no,
  _lifecycleHooks: LIFECYCLE_HOOKS
}
*/
/*
web环境下的options初始化
   Vue.options = {
        components: {
            KeepAlive,
            Transition,
            TransitionGroup
        },
        directives: {
            model,
            show
        },
        filters: Object.create(null),
        _base: Vue
    }
*/
import config from '../config' 
import { initProxy } from './proxy'
import { initState } from './state'
import { initRender } from './render'
import { initEvents } from './events'
import { mark, measure } from '../util/perf'
import { initLifecycle, callHook } from './lifecycle'
import { initProvide, initInjections } from './inject'
import { extend, mergeOptions, formatComponentName } from '../util/index'

let uid = 0
//...略 只看_init()方法
/* new Vue({
	el:'#app',
	data:{}
	})
*/
export function initMixin (Vue: Class<Component>) {
  Vue.prototype._init = function (options?: Object) {//options ={el:'#app',data:{}}
    const vm: Component = this //Component = new Vue({...options})这个实例
    // a uid
    vm._uid = uid++ //uid = 1

    let startTag, endTag
    /* istanbul ignore if */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      startTag = `vue-perf-start:${vm._uid}`
      endTag = `vue-perf-end:${vm._uid}`
      mark(startTag)
    }

    // a flag to avoid this being observed
    vm._isVue = true
    // merge options
    if (options && options._isComponent) {//如果Options为内部组件时执行的的语句,先略
      // optimize internal component instantiation
      // since dynamic options merging is pretty slow, and none of the
      // internal component options needs special treatment.
      initInternalComponent(vm, options) //父子组件的时间监听,先略
    } else {//根组件执行
      vm.$options = mergeOptions(//初始化option
        resolveConstructorOptions(vm.constructor),
        options || {},
        vm
      )
 /*上面一句相当于 vm.$options = mergeOptions(
  //* resolveConstructorOptions(vm.constructor)
  {
    components: {
      KeepAlive
      Transition,
      TransitionGroup
    },
    directives:{
      model,
      show
    },
    filters: Object.create(null),
    _base: Vue
  },
  // options || {}
  {
    el: '#app',
    data: {
      test: 1
    }
  },
  vm
)
*/

    /* istanbul ignore else */
    if (process.env.NODE_ENV !== 'production') {
      initProxy(vm)
    } else {
      vm._renderProxy = vm
    }
    // expose real self
    vm._self = vm
    initLifecycle(vm)
    initEvents(vm)
    initRender(vm)
    callHook(vm, 'beforeCreate')
    initInjections(vm) // resolve injections before data/props
    initState(vm)
    initProvide(vm) // resolve provide after data/props
    callHook(vm, 'created')

    /* istanbul ignore if */
      /*
      Vue.config.performance，我们通过将其设置为 true，即可开启性能追踪，你可以追踪四个场景的性能：
        1、组件初始化(component init)
        2、编译(compile)，将模板(template)编译成渲染函数
        3、渲染(render)，其实就是渲染函数的性能，或者说渲染函数执行且生成虚拟DOM(vnode)的性能
        4、打补丁(patch)，将虚拟DOM渲染为真实DOM的性能,
        如果不支持不会执行
        */
    if (process.env.NODE_ENV !== 'production' && config.performance && mark) {
      vm._name = formatComponentName(vm, false)
      mark(endTag)
      measure(`vue ${vm._name} init`, startTag, endTag)
    }
	//挂在dom
    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }
}

//后面再写
export function resolveConstructorOptions (Ctor: Class<Component>) {//Ctor 为Vue构造函数
  let options = Ctor.options
  // 解析Vue 构造函数的Option
  if (Ctor.super) {//子类才会进入的语句 super关键字指向Vue构造函数
    const superOptions = resolveConstructorOptions(Ctor.super) //递归调用一直找到根组件的option,
    const cachedSuperOptions = Ctor.superOptions
    if (superOptions !== cachedSuperOptions) {
      // super option changed,
      // need to resolve new options.
      Ctor.superOptions = superOptions
        //用来解决使用 vue-hot-reload-api 或者 vue-loader 时产生的一个 bug 的。
      // check if there are any late-modified/attached options (#4976)
      const modifiedOptions = resolveModifiedOptions(Ctor)
      // update base extend options
      if (modifiedOptions) {
        extend(Ctor.extendOptions, modifiedOptions)
      }
      options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions)
      if (options.name) {
        options.components[options.name] = Ctor
      }
    }
  }
    //在我们当前的例子中  中间一段if(){...}可以忽略 实际上是直接返回了options
  return options
}

//...略 只看_init()相关
```

```js
// mergeOptions from core/util/options.js

/**
 * Merge two option objects into a new one.
 * Core utility used in both instantiation and inheritance.
   合并两个option
 */
export function mergeOptions (
  parent: Object,
  child: Object,
  vm?: Component
): Object {
  if (process.env.NODE_ENV !== 'production') {
  /*
     * Validate component names
    function checkComponents (options: Object) {
      for (const key in options.components) {
        validateComponentName(key) // 校验组件名称规范
        }
      }
   */
    checkComponents(child)
  }
//其实通过 Vue.extend 创造出来的子类也是拥有这个属性的。所以这就允许我们在进行选项合并的时候，去合并一个 Vue 实例构造者的选项
  if (typeof child === 'function') {
    child = child.options
  }
//规范化props
  normalizeProps(child, vm)
 //规范化 inject和provide  这方面不是很懂
    /*
    // 父级组件提供 'foo'
        var Provider = {
          provide: {
          foo: async(){
          
          }
          },
          // ...
        }

        // 子组件注入 'foo'
        var Child = {
          inject: ['foo'],
          created () {
            this.async foo().then(token...)
          }
          // ...
        }
    */
  normalizeInject(child, vm)
  normalizeDirectives(child)
  const extendsFrom = child.extends
  if (extendsFrom) {
    parent = mergeOptions(parent, extendsFrom, vm)
  }
  if (child.mixins) {
    for (let i = 0, l = child.mixins.length; i < l; i++) {
      parent = mergeOptions(parent, child.mixins[i], vm)
    }
  }
  const options = {}
  /*
  function mergeField (key) {
  const strat = strats[key] || defaultStrat
  options[key] = strat(parent[key], child[key], vm, key)
}
  */
  let key
  for (key in parent) {
    mergeField(key)
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
        
    }
  }
  function mergeField (key) {
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }
  return options
}
//规范化props
function normalizeProps (options: Object, vm: ?Component) {
  const props = options.props
  if (!props) return
  const res = {}
  let i, val, name
  if (Array.isArray(props)) {
    i = props.length
    while (i--) {
      val = props[i]
      if (typeof val === 'string') {
        name = camelize(val)//横线转驼峰
        res[name] = { type: null }
      } else if (process.env.NODE_ENV !== 'production') {
        warn('props must be strings when using array syntax.')
      }
    }
  } else if (isPlainObject(props)) {//[判断是否为一个纯对象]
    for (const key in props) {
      val = props[key]
      name = camelize(key)
      res[name] = isPlainObject(val)
        ? val
        : { type: val }
    }
  } else if (process.env.NODE_ENV !== 'production') {
    warn(
      `Invalid value for option "props": expected an Array or an Object, ` +
      `but got ${toRawType(props)}.`,
      vm
    )
  }
  options.props = res
    /* 最够都要规范成
    props: {
      someData1: {
        type: Number
      },
      someData2: {
        type: String,
        default: ''
      }
    }
*/
}
/**
 * Normalize all injections into Object-based format
 //规范化inject,先贴出来,以后研究
 */
function normalizeInject (options: Object, vm: ?Component) {
  const inject = options.inject
  if (!inject) return
  const normalized = options.inject = {}
  if (Array.isArray(inject)) {
    for (let i = 0; i < inject.length; i++) {
      normalized[inject[i]] = { from: inject[i] }//规范化inject
    }
  } else if (isPlainObject(inject)) {
    for (const key in inject) {
      const val = inject[key]
      normalized[key] = isPlainObject(val)
        ? extend({ from: key }, val)
        : { from: val }
    }
  } else if (process.env.NODE_ENV !== 'production') {
    warn(
      `Invalid value for option "inject": expected an Array or an Object, ` +
      `but got ${toRawType(inject)}.`,
      vm
    )
  }
}
 //规范化direvtives,先贴出来,以后研究
function normalizeDirectives (options: Object) {
  const dirs = options.directives
  if (dirs) {
    for (const key in dirs) {
      const def = dirs[key]
      if (typeof def === 'function') {
        dirs[key] = { bind: def, update: def }
      }
    }
  }
}

```

```js
//core/util/options.js
/*
接着上面例子
mergeOptions(
  //* resolveConstructorOptions(vm.constructor)
  {
    components: {
      KeepAlive
      Transition,
      TransitionGroup
    },
    directives:{
      model,
      show
    },
    filters: Object.create(null),
    _base: Vue
  },
  // options || {}
  {
    el: '#app',
    data: {
      test: 1
    }
  },
  vm
)
*/
const strats = config.optionMergeStrategies  // 此时为Object.create(null)
export function mergeOptions (
  parent: Object,//components: {KeepAlive,Transition,TransitionGroup}
  child: Object, // {el: '#app',data: {test: 1}}
  vm?: Componentvm // new Vue({el: '#app',data: {test: 1}})
): Object {
  if (process.env.NODE_ENV !== 'production') {
    checkComponents(child)
  }

  if (typeof child === 'function') {
    child = child.options
  }

  normalizeProps(child, vm)
  normalizeInject(child, vm)
  normalizeDirectives(child)
  const extendsFrom = child.extends
  if (extendsFrom) {
    parent = mergeOptions(parent, extendsFrom, vm)
  }
  if (child.mixins) {
    for (let i = 0, l = child.mixins.length; i < l; i++) {
      parent = mergeOptions(parent, child.mixins[i], vm)
    }
  }
  const options = {}
  let key
  
  for (key in parent) {
    mergeField(key)
  }
  for (key in child) {
    if (!hasOwn(parent, key)) {
      mergeField(key)
    }
  }
 /* function mergeField (key) {
    const strat = strats[key] || defaultStrat
    options[key] = strat(parent[key], child[key], vm, key)
  }
 */ 
  return options
}
```

## Vue 合并策略

### el,props,data合并

```js
//core/utils/options.js

/**
 * Option overwriting strategies are functions that handle
 * how to merge a parent option value and a child option
 * value into the final value.
 */
// 读取config下的初始值:Object.create(null)
const strats = config.optionMergeStrategies  //成为策略对象

/**
 * Options with restrictions
 */
if (process.env.NODE_ENV !== 'production') {//合并props
  strats.el = strats.propsData = function (parent, child, vm, key) {
    if (!vm) {// 没有Vue实例时 =>在Vue.extend()方法的时候 可以理解为 有vm的时候是实例,没有则是组件
      warn(
        `option "${key}" can only be used during instance ` +
        'creation with the `new` keyword.'
      )
    }
    return defaultStrat(parent, child)//默认策略
  }
}
...后续持续阅读更新..
```



