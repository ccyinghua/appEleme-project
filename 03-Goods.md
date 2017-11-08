# goods.vue商品组件
> better-scroll滚动插件的用法
https://github.com/ustbhuangyi/better-scroll <br>
API：http://ustbhuangyi.github.io/better-scroll/doc/zh-hans/#better-scroll 是什么

```javascript
1.在需要的文件添加
import BScroll from 'better-scroll'

2.引用的示例代码
let scroll = new BScroll(DOM对象,{
    startX: 0,
    startY: 0,
    click: true,
    probeType: 3
    ...
})

3.Vue获得Dom对象方法
<div ref="foodsWrapper"></div>   //定义对象
this.$refs.foodsWrapper    //获取对象

4.(Vue 更新数据时是异步的,所以在数据未加载完全之前,Bscroll无法获取目标内容的高度,所以会导致无法滚动的现象)
为了解决上面的问题,运用Vue的nextTick();
(简单说，因为DOM至少会在当前tick里面的代码全部执行完毕再更新。所以不可能做到在修改数据后并且DOM更新后再执行，
要保证在DOM更新以后再执行某一块代码，就必须把这块代码放到下一次事件循环里面，比如setTimeout(fn, 0)，这样DOM更新后，就会立即执行这块代码。)
//DOM还没有更新
Vue.nextTick(function(){
    //DOM更新了
})

5.问题：PC页面时点击不会被 better-scroll阻止事件,初始化,给 better-scroll派发事件,
使移动端拥有点击事件,因此切换到PC端时,点击事件会被执行两次；
方法：在点击时,传 $event变量,Better-scroll插件中的 event事件和原生 js的 event有属性上得区别,
Better-scroll插件派发的事件时event._constructed为true,原生点击事件是没有这个属性的
//点击事件时
selectMenu(event){  
    if(!event._constructed){  //如果不存在这个属性，则不执行下面的函数
        return;
    }
}


```
- #### 菜单栏根据foodList列表滚动实时高亮

```javascript
1. 通过 _calculateHeight 方法动态计算出 每个列表的标题 的 clientHeight 值，并将其推进一个 listHeight 数组
2. 当滚动 foods 列表时，会动态计算出 pos.y 的值，
3. 把这个 pos.y 的值在计算属性里判断 返回其在 listHeight 数组中对应的 index 值
        computed: {
            currentIndex() {
              for (let i = 0; i < this.listHeight.length; i++) {
                let height1 = this.listHeight[i]
                let height2 = this.listHeight[i + 1]
                if (!height2 || (this.scrollY >= height1 && this.scrollY < height2)) {  // 在区间内，!height2是防止i是最后一个就没有height2了
                  return i
                }
              }
              return 0
            }
        },

4. 然后将菜单列表数组中的 index 值 设置为高亮,即遍历(v-for)列出列表时对应的index === currentIndex 时添加当前选中类名
```
- #### 点击左侧菜单栏，右侧 foods 列表实时滚动到相应位置
 
```javascript
1. 左侧menu-item点击事件selectMenu(index,$event)
2. 根据这个 index 获取 foodList 里面对应的li[index]元素
3. 用scrollToElement(el,100) 将 foodList 滚动到对应位置

selectMenu(index, event) {     // 左侧menu点击事件
    if (!event._constructed) {
        return
    }
    // console.log(index)
    let foodList = this.$refs.foodsWrapper.getElementsByClassName('food-list-hook')
    let el = foodList[index]
    this.foodsScroll.scrollToElement(el, 300)
}

```

> cartcontrol.vue商品数量加减图标组件
- #### 购物车计算属性的使用

1. 将 item.foods 数据信息(对应商品信息)通过props属性传递给cartcontrol组件(子组件)
2. 在cartcontrol组件中添加方法 addCart(增加商品数量)、decreaseCart(减少商品数量)改变item.foods.count的值
    1. item.foods.count并不是item.foods一开始就有的，当添加一个food不存在的属性时用`Vue.set`(this.food, 'count', 1); 变化就能被观测到，就能通知到DOM发生变化
3. 改变了item.count对象的值，在父组件 goods.vue 利用计算属性动态生成购物车商品数据，然后通过props属性传递给shopcart.vue组件遍历生成列表
 
 
```javascript
goods.vue
<cartcontrol :food="food"></cartcontrol>

computed: {
    selectFoods() {   // 选中的商品数组
      let foods = []
      this.goods.forEach((good) => {
        good.foods.forEach((food) => {
          if (food.count) {
            foods.push(food)
          }
        })
      })
      return foods
    }
},

```
- #### cartcontrol 增加和减少商品小球动画   
![image](https://github.com/ccyinghua/appEleme-project/blob/master/resource/readme/goods/goods-img03.jpg?raw=true)


```html
html:
<transition name="move">
    <!-- 父元素用于控制小球 透明度变化 -->
    <div class="cart-decrease" v-show="food.count>0" @click.stop.prevent="decreaseCart">
        <!-- 子元素用于控制小球旋转变化 -->
        <span class="inner icon-remove_circle_outline"></span>
    </div>
</transition>
```

```css
.cart-decrease{
    transition: all 0.4s linear;
    transform: translate3d(0, 0, 0);
    opacity: 1;
    .inner{
        transition: all 0.4s linear;
        transform: rotate(0deg);
    }
    /* 小球刚刚enter的状态和小球leave-active状态 */
    &.move-enter,&.move-leave-active{
        transition: all 0.4s linear;
        transform: translate3d(24px, 0, 0);
        opacity: 0;
        .inner{
            transform: rotate(180deg);
        }
    }
}

```
> shopcart.vue 购物车组件
- #### 购物车小球动画实现

     ![image](https://github.com/ccyinghua/appEleme-project/blob/master/resource/readme/goods/goods-img04.jpg?raw=true)

```javascript

1. 小球是从点击的位置运动到左下角的购物车按钮处的
2. 点击+图标时，传递点击的dom对象，通过 $emit 派发给父组件goods.vue
    cartcontorl.vue：
    this.$emit('add',event.target);
        - 说明：如果不是父子组件之间通信，也需要访问add事件，
            this.$root.eventHub.$emit('add', event.target)
            此时必须 main.js 设置:
                                new Vue({
                                  data: {eventHub: new Vue()}  // 用于非父子组件通信
                                })
3. goods.vue
   <div class="cartcontrol-wrapper">
        <!-- add自定义事件用于派发当前点击的dom元素，add为子组件方法，addFood为父组件方法 -->
        <cartcontrol :food="food" @add="addFood"></cartcontrol>
    </div> 
    
    addFood(target) {   // 子组件$emit派发而来的事件
      this._drop(target) // 传递target
    },
    _drop(target) {
      // 体验优化，异步执行下落动画
      this.$nextTick(() => {
        // 调用shopcart组件中的drop方法，向shopcart组件传入当前点击的dom对象
        // 注意：用$ref访问shopcart必须-<shopcart ref="shopcart"></shopcart>
        this.$refs.shopcart.drop(target)
      })
    }
4. shopcart.vue
    -#  创建小球 dom 结构
        <!-- 购物车小球动画 小球dom结构-->
        <div class="ball-container">
            <div v-for="ball in balls">
                <transition name="drop" @before-enter="beforeDrop" @enter="dropping" @after-enter="afterDrop">
                    <!--  外层纵向运动，内层横向运动-->
                    <div v-show="ball.show" class="ball">
                        <div class="inner inner-hook"></div>
                    </div>
                </transition>
            </div>
        </div>
    -#  创建 一个小球数组，内置5个对象（5个小球，均有 show 属性，初始值为false）
        以便在多次快速点击时，屏幕出现多个小球
        5个小球的初始位置 均在 左下角 购物车按钮处
        创建一个 dropBalls 数组用于存储 处在下落过程中的小球
        执行下落时 将 父组件传递过来的 dom 对象 当做一个属性 给 ball，方便 在下面的方法中计算 ball 的位置
        data() {
            return {
                // 创建5个小球用于动画
                balls:[{show:false},{show:false},{show:false},{show:false},{show:false}],
                dropBalls:[], // 存储下落小球
            }
        },   
    -#  执行 drop 动画
        执行 beforeDrop 动画之前，设置球的初始位置，计算初始位置与目标位置的差值x,y，将小球 transform : translate(x,y,0) 到动画初始位置
        执行 dropping 动画时，将小球移到目标位置transform : translate(0,0,0)
        执行 afterDrop 动画后，将小球的状态重置 display:none; show:false 并且删掉里面的之前存储的点击dom元素信息
        created() {
            this.$root.eventHub.$on('add', (target) => {
              // 体验优化，异步执行下落动画
              this.$nextTick(() => {
                this.drop(target)
              })
            })
        },
        methods: {
            drop(el) {    // 找到隐藏的小球，设为true，放到dropBalls里面
              console.log(el)
              for (let i = 0; i < this.balls.length; i++) {
                let ball = this.balls[i]
                if (!ball.show) {
                  ball.show = true
                  ball.el = el
                  this.dropBalls.push(ball)
                  // console.log(ball)  // el:div.cart-add.icon-add_circle;show:false
                  return
                }
              }
            },
            beforeDrop(el) {  // 动画前
              // console.log(el)  // 运动小球元素
              let count = this.balls.length
              while (count--) {
                let ball = this.balls[count]
                if (ball.show) {
                  // console.log(ball.el) // 加号图标
                  let rect = ball.el.getBoundingClientRect() // 点击的+号图标相对于视窗的位置集合。集合中有top, right, bottom, left等属性
                  let x = rect.left - 32  // +号距离购物车初始小球的横向距离；32s是运动的小球.ball的初始left坐标
                  let y = -(window.innerHeight - rect.top - 22)  // 纵向距离；22是bottom坐标
                  el.style.display = ''
                  el.style.webkitTransform = `translate3d(0,${y}px,0)`
                  el.style.transform = `translate3d(0,${y}px,0)`
                  let inner = el.getElementsByClassName('inner-hook')[0]
                  inner.style.webkitTransform = `translate3d(${x}px,0,0)`
                  inner.style.transform = `translate3d(${x}px,0,0)`
                }
              }
            },
            dropping(el) {  // 动画时
              /* eslint-disable no-unused-vars */
              let rf = el.offsetHeight
              this.$nextTick(() => {
                el.style.webkitTransform = 'translate3d(0,0,0)'
                el.style.transform = 'translate3d(0,0,0)'
                let inner = el.getElementsByClassName('inner-hook')[0]
                inner.style.webkitTransform = 'translate3d(0,0,0)'
                inner.style.transform = 'translate3d(0,0,0)'
              })
            },
            afterDrop(el) {  // 动画后
              let ball = this.dropBalls.shift()  // 删除数组的第一个元素
              // console.log(ball) // {el:div.cart-add.icon-add_circle;show:false}
              if (ball) {
                ball.show = false
                el.style.display = 'none'
              }
            }
        }
    -#  样式
        /* 小球dom结构 */
        .ball-container{
            .ball{
              position:fixed;
              left:32px;
              bottom:22px;
              z-index:200;
              transition:all 0.4s cubic-bezier(0.49, -0.29, 0.75, 0.41);   /* y 轴 贝塞尔曲线 */
              .inner{
                width:16px;
                height:16px;
                border-radius:50%;
                background-color: rgb(0,160,220);
                transition:all 0.4s linear;  /* x 轴只需要线性缓动 */
              }
            }
        }

```
- #### 购物车列表显示隐藏

```javascript
按钮控制 fold => fold 控制 => listShow ， listShow => 控制状态显示 (在totalCount>0)
在 data 选项里，定义一个 fold（折叠，true） 控制购物车的显示隐藏状态
在 computed 计算属性里，定义一个 listshow 方法，来表示购物车列表的显示隐藏状态

listShow() {
    if(!this.totalCount){  //假如所选商品为 0 ，return 掉结果，并将 fold 置为初始值
        this.fold = true;
        return false;
    }
    let show = !this.fold; // 否则，取 fold 的反值，靠 fold 的变化来 决定 列表显示与否
    
            if (show) {     // 购物车详情展示时，初始化better-scroll
                this.$nextTick(() => {
                    if (!this.scroll) {     // 加判断防止一直初始化
                        this.scroll = new BScroll(this.$refs.listContent, {
                            click: true
                        })
                    } else {
                        this.scroll.refresh()  // 重新计算better-scroll
                    }
                })
            }
    
    return show;
}

在 method 方法里有个 toggleList 方法控制 fold 状态
toggleList(){
    if(!this.totalCount){
        return;
    }
    this.fold = !this.fold;
}

```

![image](https://github.com/ccyinghua/appEleme-project/blob/master/resource/readme/goods/goods-img01.jpg?raw=true)
![image](https://github.com/ccyinghua/appEleme-project/blob/master/resource/readme/goods/goods-img02.jpg?raw=true)


























