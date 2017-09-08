<!-- 商品组件 -->
<template>
  <div class="goods">
    <!-- 左侧分类列表 -->
    <div class="menu-wrapper" ref="menuWrapper">
      <ul>
        <li v-for="(item,index) in goods" class="menu-item" :class="{'current':currentIndex === index}" @click="selectMenu(index,$event)">
          <span class="text border-1px">
            <!-- <span v-show="item.type>0" class="icon" :class="classMap[item.type]"></span> -->
            <icon v-show="item.type>0" :size="3" :type="item.type"></icon>{{item.name}}
          </span>
        </li>
      </ul>
    </div>
    <!-- 右侧商品列表 -->
    <div class="foods-wrapper" ref="foodsWrapper">
      <ul>
        <li v-for="item in goods" class="food-list food-list-hook">
          <h1 class="title">{{item.name}}</h1>
          <ul>
            <li v-for="food in item.foods" class="food-item border-1px" @click="goDetail(food,$event)">
              <div class="icon">
                <img width="57" height="57" :src="food.icon" alt="">
              </div>
              <div class="content">
                <h2 class="name">{{food.name}}</h2>
                <p class="desc">{{food.description}}</p>
                <div class="extra">
                  <span class="count">月售{{food.sellCount}}份</span><span>月售{{food.rating}}%</span>
                </div>
                <div class="price">
                  <span class="now">￥{{food.price}}</span><span class="old" v-show="food.oldPrice">￥{{food.oldPrice}}</span>
                </div>
                <div class="cartcontrol-wrapper">
                  <!-- add自定义事件用于派发当前点击的dom元素，add为子组件方法，addFood为父组件方法 -->
                  <cartcontrol :food="food" @add="addFood"></cartcontrol>
                </div>
              </div>
            </li>
          </ul>
        </li>
      </ul>
    </div>
    <!-- 购物车组件 -->
    <shopcart :selectFoods="selectFoods" :delivery-price="seller.deliveryPrice" :min-price="seller.minPrice" ref="shopcart"></shopcart>
    <!-- 商品详情页 -->
    <food-detail v-if="selectedFood" :food="selectedFood" ref="myfood"></food-detail>
  </div>
</template>

<script>
import BScroll from 'better-scroll'
import shopcart from '@/components/shopcart/shopcart.vue'  // 购物车组件
import cartcontrol from '@/components/cartcontrol/cartcontrol'  // 商品数量加减图标组件
import icon from '@/components/icon/icon.vue'
import foodDetail from '@/components/foodDetail/foodDetail.vue'  // 商品详情页

const ERR_OK = 0

export default {
  props: {
    seller: {
      type: Object
    }
  },
  data() {
    return {
      goods: [],
      listHeight: [],  // 右侧列表；累加的区间数组，对应每个区间所在的高度，滚动到对应高度左侧对应分类高亮
      scrollY: 0,
      selectedFood: {}
    }
  },
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
    },
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
  created() {
    // this.classMap = ['decrease', 'discount', 'special', 'invoice', 'guarantee']

    this.$http.get('api/goods').then((response) => {
      response = response.body
      if (response.errno === ERR_OK) {
        this.goods = response.data
        // console.log(this.goods)
        // DOM没更新
        this.$nextTick(() => { // DOM更新之后再执行，因为goods数据是异步请求来的。
          this._initScroll()   // 可以上下滚动了
          this._calculateHeight()  // 计算高度
        })
      }
    })
  },
  methods: {
    selectMenu(index, event) {     // 左侧menu点击事件
      if (!event._constructed) {
        return
      }  // PC页面时,点击不会被 better-scroll阻止事件,初始化,给 better-scroll派发事件,使移动端拥有点击事件,因此切换到PC端时,点击事件会被执行两次,方法:在点击时,传 $event变量,Better-scroll插件中的 event事件和原生 js的 event有属性上得区别,Better-scroll插件派发的事件时event._constructed为true,原生点击事件是没有这个属性的
      // console.log(index)
      let foodList = this.$refs.foodsWrapper.getElementsByClassName('food-list-hook')
      let el = foodList[index]
      this.foodsScroll.scrollToElement(el, 300)
    },
    _initScroll() {  // 初始化上下滚动
      this.menu = new BScroll(this.$refs.menuWrapper, {
        click: true  // 移动端：没有这个左侧的点击事件不起作用
      })

      this.foodsScroll = new BScroll(this.$refs.foodsWrapper, {
        click: true,  // 让右侧商品列表可以点击，否侧cartconstrol.vue中的点击加减也会没有作用
        probeType: 3  // 希望在滚动的时候能实时告诉滚动的位置
      })

      this.foodsScroll.on('scroll', (pos) => {
        this.scrollY = Math.abs(Math.round(pos.y))
      })
    },
    _calculateHeight() {   // 计算每个区间高度
      let foodList = this.$refs.foodsWrapper.getElementsByClassName('food-list-hook')
      let height = 0
      this.listHeight.push(height)
      for (let i = 0; i < foodList.length; i++) {
        let item = foodList[i]
        height += item.clientHeight
        this.listHeight.push(height)
      }
    },
    addFood(target) {   // 子组件$emit派发而来的事件
      this._drop(target) // 传递target
    },
    _drop(target) {
      // 体验优化，异步执行下落动画
      this.$nextTick(() => {
        // 调用shopcart组件中的drop方法，向shopcart组件传入当前点击的dom对象
        this.$refs.shopcart.drop(target)
      })
    },
    goDetail(food, $event) {  // 点击进入商品详情页
      if (!event._constructed) {
        return
      }
      this.selectedFood = food
      this.$refs.myfood.show()   // 调用food.vue的show()方法
    }
  },
  components: {
    shopcart,
    cartcontrol,
    icon,
    foodDetail
  }
}
</script>

<style scoped lang="scss">
@import '../../common/styles/mixin.scss';

.goods{
  display:flex;
  position:absolute;
  top:174px;
  bottom:46px;
  width:100%;
  overflow: hidden;
  .menu-wrapper{
    flex:0 0 80px;
    width:80px; /* 兼容性安卓 */
    background: #f3f5f7;
    .menu-item{
      display:table;height:54px;width:56px;padding:0 12px;line-height: 14px;
      &.current{
        position:relative;
        z-index:10;
        margin-top:-1px;
        background: #fff;
        font-weight:700;
        .text{
          @include border-none();
        }
      }
      /* .icon{
        display:inline-block;
        vertical-align:top;
        width:12px;
        height:12px;
        margin-right:2px;
        background-size:12px 12px;
        background-repeat: no-repeat;
        &.decrease{
          @include bg-image('decrease_3')
        }
        &.discount{
          @include bg-image('discount_3')
        }
        &.guarantee{
          @include bg-image('guarantee_3')
        }
        &.invoice{
          @include bg-image('invoice_3')
        }
        &.special{
          @include bg-image('special_3')
        }
      } */
      .text{
        display:table-cell;
        width:56px;
        vertical-align:middle;
        font-size:12px;
        @include border-1px(rgba(7, 17, 27, 0.1));
      }
    }
  }
  /* 右边 */
  .foods-wrapper{
    flex:1;
    .title{
      padding-left:14px;
      height:26px;
      line-height: 26px;
      border-left:2px solid #d9dde1;
      font-size:12px;
      color:rgb(147,153,159);
      background: #f3f5f7;
    }
    .food-item{
      display:flex;
      margin:18px;
      padding-bottom:18px;
      @include border-1px(rgba(7, 17, 27, 0.1));
      &:last-child{
        @include border-none();
        margin-bottom:0;
      }
      .icon{
        flex:0 0 57px;
        margin-right:10px;
      }
      .content{
        flex:1;
        .name{
          margin:2px 0 8px 0;
          height:14px;
          line-height: 14px;
          font-size:14px;
          color:rgb(7,17,27);
        }
        .desc,.extra{
          line-height: 10px;
          font-size:10px;
          color:rgb(147,163,159);
        }
        .desc{
          margin-bottom:8px;
          line-height: 12px;
        }
        .extra{
          .count{
            margin-right:12px;
          }
        }
        .price{
          font-weight:700;
          line-height: 24px;
          .now{
            margin-right:18px;
            font-size:14px;
            color:rgb(240,20,20);
          }
          .old{
            text-decoration:line-through;
            font-size:10px;
            color:rgb(147,153,159);
          }
        }
        .cartcontrol-wrapper{
          position:absolute;
          right:0;
          bottom:12px;
        }
      }
    }
  }
}
</style>
