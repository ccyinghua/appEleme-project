<!-- 购物车组件 -->
<template>
  <div class="shopcart-wrapper">
    <div class="shopcart">
      <!-- 内容区 -->
      <div class="content" @click="toggleList">
        <!-- 左边 -->
        <div class="content-left">
          <div class="logo-wrapper">
            <div class="logo" :class="{'highlight':totalCount>0}">
              <i class="icon-shopping_cart" :class="{'highlight':totalCount>0}"></i>
            </div>
            <div class="num" v-show="totalCount>0">{{totalCount}}</div>
          </div>
          <div class="price" :class="{'highlight':totalPrice>0}">￥{{totalPrice}}元</div>
          <div class="desc">另需配送费￥{{deliveryPrice}}元</div>
        </div>
        <!-- 右边 -->
        <div class="content-right" @click.stop.prevent="pay">
          <div class="pay" :class="payClass">
            {{payDesc}}
            <!-- ￥{{minPrice}}元起送 -->
          </div>
        </div>
      </div>
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
      <!-- 购物车详情 -->
      <transition name="fold">
        <div class="shopcart-list" v-show="listShow">
          <div class="list-header">
            <h1 class="title">购物车</h1>
            <span class="empty" @click="empty">清空</span>
          </div>
          <div class="list-content" ref="listContent">
            <ul>
              <li class="food" v-for="food in selectFoods">
                <span class="name">{{food.name}}</span>
                <div class="price">
                  <span>￥{{food.price*food.count}}</span>
                </div>
                <div class="cartcontrol-wrapper">
                  <cartcontrol :food="food"></cartcontrol>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </transition>
    </div>
    <!-- 蒙层 -->
    <transition name="fade">
      <div class="list-mask" v-show="listShow" @click="hideList"></div>
    </transition>
  </div>
</template>

<script type="text/ecmascript-6">
import BScroll from 'better-scroll'
import cartcontrol from '@/components/cartcontrol/cartcontrol'  // 商品数量加减图标组件

export default {
  props: {
    selectFoods: {   // 选中的商品数组
      type: Array,
      default() {
        return [
          // {
          //   price: 10,
          //   count: 2
          // }
        ]
      }
    },
    deliveryPrice: {
      type: Number,
      default: 0
    },
    minPrice: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      balls: [{show: false}, {show: false}, {show: false}, {show: false}, {show: false}],
      dropBalls: [],
      fold: true   // 购物车是否折叠
    }
  },
  computed: {
    totalPrice() {   // 根据选中的商品计算总价格
      let total = 0
      this.selectFoods.forEach((food) => {
        total += food.price * food.count
      })
      return total
    },
    totalCount() {   // 根据选中的商品显示选中的商品个数
      let count = 0
      this.selectFoods.forEach((food) => {
        count += food.count
      })
      return count
    },
    payDesc() {   // 购物车右侧按钮变化
      if (this.totalPrice === 0) {
        return `￥${this.minPrice}元起送`
      } else if (this.totalPrice < this.minPrice) {
        let diff = this.minPrice - this.totalPrice
        return `还差￥${diff}元起送`
      } else {
        return '去结算'
      }
    },
    payClass() {
      if (this.totalPrice < this.minPrice) {
        return 'not-enough'
      } else {
        return 'enough'
      }
    },
    listShow() {
      if (!this.totalCount) {   // 假如所选商品为 0 ，return 掉结果，并将 fold 置为初始值
        this.fold = true
        return false
      }
      let show = !this.fold  // 否则，取 fold 的反值，靠 fold 的变化来 决定 列表显示与否
      if (show) {     // 购物车详情展示时，初始化better-scroll
        this.$nextTick(() => {
          if (!this.scroll) {   // 加判断防止一直初始化
            this.scroll = new BScroll(this.$refs.listContent, {
              click: true
            })
          } else {
            this.scroll.refresh()  // 重新计算better-scroll
          }
        })
      }
      return show
    }
  },
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
    },
    toggleList() {   // 购物车详情切换
      if (!this.totalCount) {
        return
      }
      this.fold = !this.fold
    },
    empty() {   // 清空购物车
      this.selectFoods.forEach((food) => {
        food.count = 0
      })
    },
    hideList() {  // 点击蒙层，隐藏列表
      this.fold = true
    },
    pay() {
      if (this.totalPrice < this.minPrice) {
        return
      }
      window.alert(`支付${this.totalPrice}元`)
    }
  },
  components: {
    cartcontrol
  }
}
</script>

<style scoped lang="scss">
@import "../../common/styles/mixin.scss";

.shopcart{
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: 50;
  width: 100%;
  height: 48px;
  /* 内容 */
  .content{
    display:flex;
    background: #141d27;
    font-size: 0;
    color: rgba(255, 255, 255, 0.4);
    .content-left{
      flex:1;
      .logo-wrapper{display:inline-block;position:relative;top:-10px;margin:0 12px;padding:6px;width:56px;height:56px;box-sizing:border-box;vertical-align:top;border-radius:50%;background: #14172d;
        .logo{
          width:100%;
          height:100%;
          border-radius:50%;
          text-align: center;
          background: #2b343c;
          &.highlight{
            background: rgb(0,160,220);
          }
          .icon-shopping_cart{
            line-height: 44px;
            font-size:24px;
            color:#80858a;
            &.highlight{color:#fff;}
          }
        }
        .num{
          position:absolute;
          top:0;
          right:0;
          width:24px;
          height:16px;
          line-height: 16px;
          text-align: center;
          border-radius:16px;
          font-size:9px;
          font-weight:700;
          color:#fff;
          background: rgb(420,20,20);
          box-shadow:0 4px 8px 0 rgba(0,0,0,0.4);
        }
      }
      .price{
        display:inline-block;
        vertical-align:top;
        margin-top:12px;
        line-height: 24px;
        padding-right:12px;
        box-sizing:border-box;
        border-right:1px solid rgba(255,255,255,0.1);
        font-size:16px;
        font-weight:700;
        color:rgba(255,255,255,0.4);
        &.highlight{color:#fff;}
      }
      .desc{
        display:inline-block;
        vertical-align:top;
        margin:12px 0 0 12px;
        line-height: 24px;
        font-size:10px;
      }
    }
    .content-right{
      flex:0 0 105px;
      width:105px;
      .pay{
        height:48px;
        line-height: 48px;
        text-align: center;
        font-size:12px;
        font-weight:700;
        &.not-enough{
          background: #2b333b;
        }
        &.enough{
          background: #00b43c;
          color:#fff;
        }
      }
    }
  }
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
  /* 购物车详情 */
  .shopcart-list{
    position:absolute;
    left:0;
    top:0;
    z-index:-1;
    width:100%;
    transition:all 0.5s ;
    transform:translate3d(0,-100%,0);
    &.fold-enter,&.fold-leave-active{
      transform:translate3d(0,0,0);
    }
    .list-header{
      padding:0 18px;
      height:40px;
      line-height: 40px;
      background: #f3f5f7;
      border-bottom:1px solid rgba(7,17,27,0.1);
      .title{
        float: left;
        font-size:14px;
        color:rgb(7,17,27);
      }
      .empty{
        float: right;
        font-size:12px;
        color:rgb(0,160,220);
      }
    }
    .list-content{
      padding:0 18px;
      max-height:217px;
      overflow:hidden;
      background: #fff;
      .food{
        position:relative;
        padding:12px 0;
        box-sizing:border-box;
        @include border-1px(rgba(7,17,27,0.1));
        .name{
          line-height: 24px;
          font-size:14px;
          color:rgb(7,17,27);
        }
        .price{
          position:absolute;
          right:90px;
          bottom:12px;
          line-height: 24px;
          font-size:14px;
          font-weight:700;
          color:rgb(240,20,20);
        }
        .cartcontrol-wrapper{
          position:absolute;
          right:0;
          bottom:6px;
        }
      }
    }
  }
}
.list-mask{
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 40;
  backdrop-filter: blur(10px);
  transition: all 0.5s;
  opacity: 1;
  background: rgba(7, 17, 27, 0.6);
  &.fade-enter, &.fade-leave-avtive{
    opacity: 0;
    background: rgba(7, 17, 27, 0);
  }
}
</style>