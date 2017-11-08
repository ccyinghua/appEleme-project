# seller.vue 商家详情页

- #### 上下滚动better-scroll
    
```javascript
1. seller页面也和goods和ratings页面一样，需要上下滑动
2. 前面初始化better-scroll都是在生命周期created() {} (实例已经创建完成，属性已经绑定)内
3. seller页面我们需要在生命周期 mounted (模板编译之后,DOM渲染好之后)中初始化

mounted() {  // DOM渲染好以后
    console.log(this.seller)  // 空对象
    this.scroll = new BScroll(this.$refs.seller, {
        click: true
    })
},

> seller是异步获取的，seller.vue组件页面内容都是靠seller里面数据填充页面撑开，
> 所以一开始内容没有的；mounted中this.seller输出空对象，此时DOM没有被撑开。
> 方法：用watch观察监听变化
> 向后端请求数据的时候watch执行，监听变化；但是若是点击"商品",再切回"商家"是不执行watch的，_initScroll()失效了，所以mounted也需要执行scroll；
并且初始化scroll要判断是否存在this.scroll

watch: {
    'seller'() {   // 想后端请求数据的时候监听seller变化
      this.$nextTick(() => {
        this._initScroll()
      })
    }
},
mounted() {  // DOM渲染好以后
    this.$nextTick(() => {   // 不是请求数据的时候可以滚动
      this._initScroll()
    })
},
methods: {
    _initScroll() {
      if (!this.scroll) {
        this.scroll = new BScroll(this.$refs.seller, {
          click: true
        })
      } else {
        this.scroll.refresh()
      }
    }
}

```
- #### 商家实景图片左右滚动

```javascript
1. 先根据图片尺寸和左右 margin 计算出 list 列表容器的 宽度，然后 用 better-scroll 进行左右滚动

2. 跟上下滚动一样，一般情况下，要在 vue mounted 之后就可以初始化 better-scroll 
但是这时候，图片资源还没有请求到，所以无法得知图片的pics的length，继而无法得知，列表容器的宽度

3. 解决办法：
vue 提供了一个 watch 对象，来用来监测数据的变化
当 watch 监测到 seller 数据的变化，然后调用 _initPicScroll，初始化 better-scroll 

<div class="pic-wrapper" ref="picWrapper">
    <ul class="pic-list" ref="picList">
        <li class="pic-item" v-for="pic in seller.pics">
            <img :src="pic" width="120" height="90">
        </li>
    </ul>
</div>

watch:{
    'seller'(){
        this.$nextTick(()=>{
            this._initPics();
        })
    }
},
mounted() { 
    this.$nextTick(() => {
        this._initPics()
    })
},
methods:{
    _initPics() {  // 初始化图片左右滚动
        if (this.seller.pics) {   // 如果有图片
            let picWidth = 120  // li的宽度
            let margin = 6      // li的margin
            let width = (picWidth + margin) * this.seller.pics.length - margin
            this.$refs.picList.style.width = width + 'px'
            this.$nextTick(() => {
                if (!this.picScroll) {
                    this.picScroll = new BScroll(this.$refs.picWrapper, {
                        scrollX: true,   // 开启横向滚动
                        eventPassthrough: 'vertical'  // 希望横向模拟横向滚动，而纵向的滚动还是保留原生滚动
                    })
                } else {
                    this.picScroll.refresh()
                }
            })
        }
    }
}
```
- #### 用localStorage本地收藏商家

```javascript
>  先给商家模拟添加一个id值放在url中，http://localhost:8080/?id=12345&a=b#/goods
>  然后解析url获取id值添加到this.seller
>  根据每个商家独有的id值进行收藏

common/js/util.js

/**
 * 解析url参数
 * @example ?id=12345&a=b
 * @return Object {id:12345,a:b}
 */
export function urlParse() {
    let url = window.location.search
    let obj = {}
    let reg = /[?&][^?&]+=[^?&]+/g  // 包含?或&字符，后面跟着非(^)?或&字符=一个或多个(非?或&字符)
    let arr = url.match(reg)
    // ['?id=12345', '&a=b']
    if (arr) {
        arr.forEach((item) => {
            let tempArr = item.substring(1).split('=') // [id,12345];[a,b]
            // decodeURIComponent() 函数可对 encodeURIComponent() 函数编码的 URI 进行解码
            let key = decodeURIComponent(tempArr[0])
            let val = decodeURIComponent(tempArr[1])
            obj[key] = val
        })
    }
    return obj
}


App.vue
data() {
    return {
      seller: {
        id: (() => {
          let queryParam = urlParse()
          console.log(queryParam)
          return queryParam.id
        })()
      }
    }
  },
created() {
    this.$http.get('api/seller?id=' + this.seller.id).then((response) => {
      response = response.body; console.log(response)
      if (response.errno === ERR_OK) {
        // this.seller = response.data  // 这样seller.id没有了
        // console.log(this.seller)
        this.seller = Object.assign({}, this.seller, response.data)  // 用Object的assign方法将data的seller.id和请求回来的seller数据组合一起
        console.log(this.seller.id)
      }
    })
},

```

```javascript
1. 在　common/js/util.js 文件里创建两个公共函数函数 存储 localStorae 和 读取 localStorage 
2. 在点击收藏按钮时，调用存储 方法，首次进入页面时，调用 读取方法

>> common/js/util

/**
 * 本地存储
 * localStorage只能存储字符串,所以多用到JSON.parse和JSON.stringify
 * @param  {[type]} id    商家的id
 * @param  {[type]} key   要存储的元素，例收藏"favorite"
 * @param  {[type]} value 存储元素的值，例true
 * @return localStorage.__seller__= "{"id":{"key":value}}"="{"12345":{"favorite":true}}"
 */
export function saveToLocal(id, key, value) {
    let seller = window.localStorage.__seller__
    if (!seller) {  // 本地无存储时
        seller = {}
        seller[id] = {}
    } else {
        seller = JSON.parse(seller)
        if (!seller[id]) {  // 如果没有id，就存成一个空对象
            seller[id] = {}
        }
    }
    seller[id][key] = value
    window.localStorage.__seller__ = JSON.stringify(seller)
}

/**
 * 本地localStorage读取
 * @param  {[type]} id  商家的id
 * @param  {[type]} key 要读取的元素，例收藏"favorite"
 * @param  {[type]} def 默认值
 * @return {[type]}     结果值
 */
export function loadFromLocal(id, key, def) {
    let seller = window.localStorage.__seller__
    if (!seller) {  // 本地无存储时取默认值
        return def
    }
    seller = JSON.parse(seller)[id]
    if (!seller) {  // 无id值返回默认
        return def
    }
    let ret = seller[key]
    return ret || def
}


>> seller.vue-商家详情页

    import {saveToLocal, loadFromLocal} from '@/common/js/util'
    data() {
        return {
            // favorite: false   // 本地固定死的值
            favorite: (() => {   // 读取localStorage本地值
                return loadFromLocal(this.seller.id, 'favorite', false)
            })()
        }
    },
    methods: {
        toggleFavorite() {  // 点击收藏事件
            if (!event._constructed) {
                return
            }
            this.favorite = !this.favorite
            saveToLocal(this.seller.id, 'favorite', this.favorite)  // 本地localStorage存储
        }
    }
```
商家详情页：

![image](https://github.com/ccyinghua/appEleme-project/blob/master/resource/readme/seller/seller-img.jpg?raw=true)