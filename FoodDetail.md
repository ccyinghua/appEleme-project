# foodDetail.vue商品详情页
- #### 点击加入购物车
    ###### goods.vue--父组件

    ```javascript
    <li v-for="food in item.foods"   @click="goDetail(food,$event)"></li>
    <!-- 传递点击的商品信息selectedFood给子组件 -->
    <food-detail v-if="selectedFood" :food="selectedFood" ref="myfood"></food-detail>
    data() {
        return {
          selectedFood: {}
        }
    },
    methods:{
        goDetail(food, $event) {  // 点击进入商品详情页
            if (!event._constructed) {
                return
            }
            this.selectedFood = food   // 点击的商品信息赋值给selectedFood
            this.$refs.myfood.show()   // 调用food.vue的show()方法
        }
    }

    ```
    ###### goodDetail.vue--子组件
        
    ```javascript
    <div v-show="showFlag" class="foodDetail" ref="foodDetail"></div>
    
    import BScroll from 'better-scroll'
    methods: {
        show() {    // 点击商品展示商品详情页
          this.showFlag = true
          this.$nextTick(() => {
            if (!this.scroll) {   // 加判断防止一直初始化
              this.scroll = new BScroll(this.$refs.foodDetail, {
                click: true
              })
            } else {
              this.scroll.refresh()  // 重新计算better-scroll
            }
          })
        }
    }
    
    <!-- 没选择这个商品显示"加入购物车",选择了就显示"加减图标组件"(被加入购物车盖住了，都属于定位) -->
    <div class="cartcontrol-wrapper">
        <cartcontrol :food="food"></cartcontrol>
    </div>
    <div @click="addFirst($event)" class="buy" v-show="!food.count || food.count===0">加入购物车</div>
    
    methods: {
        addFirst(event) {
          if (!event._constructed) { // 防止PC端触发两次点击
            return
          }
          this.$root.eventHub.$emit('add', event.target)   // 派发事件,shopcart.vue接收事件从而生成小球动画
          this.$set(this.food, 'count', 1)  // Vue.set也可以，但是本页面要import Vue...添加属性，变化就能被观测到，就能通知到DOM发生变化
        }
    },

    ```
    ###### main.js
        
    ```javascript
    /* eslint-disable no-new */
    new Vue({
      el: '#app',
      router,
      template: '<App/>',
      components: { App },
      data: {eventHub: new Vue()}  // 用于非父子组件通信
    })

    ```
- #### 评论列表筛选显示
    
    ```
    html:
    // 用v-show来控制评论是否显示
    <li v-show="needShow(rating.rateType,rating.text)" v-for="rating in food.ratings" class="rating-item border-1px"></li>
    
    
    javascript:
    data() {
        return {
          selectType: ALL,     // 点击的类型(全部，推荐，吐槽.....)
          onlyContent: false,  // 是否只显示有内容的文字
          desc: {              // 类型的显示文字
            all: '全部',
            positive: '推荐',
            negative: '吐槽'
          }
        }
    },
    methods: {
        // 筛选显示的评论列表;参数：type(本条评论代表的类型，是推荐还是吐槽).text(本条评论的评论内容)
        needShow(type, text) {  
            if (this.onlyContent && !text) {   // 选择了"只显示有内容的评价"同时本条评论没有内容文字，这条评论false不显示
                return false
            }
            if (this.selectType === ALL) {  // 状态是显示ALL全部，这条评论true显示
                return true
            } else {
                return type === this.selectType  // 否则判断本条评论的状态是不是与点击的selectType相同，相同返回true显示
            }
        }
    }
    ```
- #### foodDetail.vue 商品详情页时间转换
    
    ```
    1. 在 common 目录下创建一个公共工具函数 utils.js ,然后在需要用到的 组件中，进行 import 引入
        export function formatDate(date, fmt) {
            if (/(y+)/.test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length))
            }
            let o = {
                'M+': date.getMonth() + 1,
                'd+': date.getDate(),
                'h+': date.getHours(),
                'm+': date.getMinutes(),
                's+': date.getSeconds()
            }
            for (let k in o) {
                if (new RegExp(`(${k})`).test(fmt)) {
                    let str = o[k] + ''
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : padLeftZero(str))
                }
            }
            return fmt
        }
        function padLeftZero(str) {
            return ('00' + str).substr(str.length)
        }

    2. 在 foodDetail 组件中使用,只需用 import 引入要使用到的 方法 即可
        import { format } from 'common/js/utils'
    
    3. 在组件中即可直接使用 该方法
        code:
        <div class="time">{{rating.rateTime | formatDate}}</div>
        filters: {
            formatDate(time) {
              let date = new Date(time)
              return formatDate(date, 'yyyy-MM-dd hh:mm')
            }
        }
    ```

> ratingselect.vue 评价选择组件

![image](https://github.com/ccyinghua/appEleme-project/blob/master/resource/readme/food/food-img02.jpg?raw=true)


1. 全部、推荐、吐槽 类似一个Tab选项卡的栏目;
2. 只看有内容的评价 筛选;
    
###### foodDetail.vue--父组件(商品详情页)

```javascript
html:
// * 传值给ratingselect.vue组件
//   selectType     显示的评价类型(全部，推荐，吐槽)
//   onlyContent    是否只显示有内容的评价
//   desc           那些类型(全部，推荐，吐槽)
//   food.ratings   这种商品的评价内容
// * 子组件的派发事件：select; toggle 传了一些参数过来
<ratingselect 
    :select-type="selectType" 
    :only-content="onlyContent" 
    :desc="desc" 
    :ratings="food.ratings" 
    @select="selectRating" 
    @toggle="toggleContent"></ratingselect>


<!--在 父组件 methods 对象中 用 selectRating 方法接收子组件 emit 过来的值，赋值给 父组件 selectType 然后在通过 props传递给子组件，从而实现改变; 
只看有内容的评价也是同理，用的是 toggleContent 方法-->
javascript:    
methods: {
    selectRating(type) {
        this.selectType = type
        this.$nextTick(() => {
            this.scroll.refresh()
        })
    },
    toggleContent(onlyContent) {
        this.onlyContent = !this.onlyContent
        this.$nextTick(() => {
            this.scroll.refresh()
        })
    }
}

```
###### ratingselect.vue--子组件
    
```html
html:
<div class="rating-type border-1px">
    <span class="block positive" :class="{'active': selectType===2}" @click="select(2,$event)">{{desc.all}}<span class="count">{{ratings.length}}</span></span>
    <span class="block positive" :class="{'active': selectType===0}" @click="select(0,$event)">{{desc.positive}}<span class="count">{{positives.length}}</span></span>
    <span class="block negative" :class="{'active': selectType===1}" @click="select(1,$event)">{{desc.negative}}<span class="count">{{negatives.length}}</span></span>
</div>
<div class="switch" :class="{'on': onlyContent}" @click="toggleContent($event)">
    <span class="icon-check_circle"></span>
    <span class="text">只看有内容的评价</span>
</div>

```
  
```javascript
javascript:
// 定义 三个常量 代表这三种状态
const POSITIVE = 0  // 推荐
const NEGATIVE = 1  // 吐槽
const ALL = 2       // 全部

// 注册父组件传过来的值
props: {
  ratings: {    // 商品的评价内容
    type: Array,
    default() {
      return []
    }
  },
  selectType: {  // 显示的评价类型(全部，推荐，吐槽....)
    type: Number,
    default: ALL
  },
  onlyContent: {  // 是否只显示有内容的评价
    type: Boolean,
    default: false
  },
  desc: {          // 那些类型(全部，推荐，吐槽)
    type: Object,
    default() {
      return {
        all: '全部',
        positive: '满意',
        negative: '不满意'
      }
    }
  }
},

->  不可以在子组件内，随意改变父组件传过来的值，
->  通过 $emit 将子组件需要改变的值，发送给父组件，
->  然后父组件在通过 props 传给 子组件，然后 view 就会发生相应的改变
methods: {
  select(type, event) {
    if (!event._constructed) {    // 还在better-scroll里面，避免PC端两次点击
      return
    }
    this.$emit('select', type)   // 告诉父组件点击的类型
  },
  toggleContent(event) {
    if (!event._constructed) {
      return
    }
    this.$emit('toggle', this.onlyContent)   // 告诉父组件是否只显示有内容的评价
  }
}

```
商品详情页：

![image](https://github.com/ccyinghua/appEleme-project/blob/master/resource/readme/food/food-img01.jpg?raw=true)







