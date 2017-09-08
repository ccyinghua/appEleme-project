<template>
  <transition name="move">
    <div v-show="showFlag" class="foodDetail" ref="foodDetail">
      <div class="food-content">
        <!-- 商品图片 -->
        <div class="image-header">
          <img :src="food.image">
          <div class="back" @click="hide">
            <i class="icon-arrow_lift"></i>
          </div>
        </div>
        <!-- 商品内容 -->
        <div class="content">
          <h1 class="title">{{food.name}}</h1>
          <div class="detail">
            <span class="sell-count">月售{{food.sellCount}}份</span>
            <span class="rating">好评率{{food.rating}}%</span>
          </div>
          <div class="price">
            <span class="now">￥{{food.price}}</span><span class="old" v-show="food.oldPrice">￥{{food.oldPrice}}</span>
          </div>
          <!-- 没选择这个商品显示"加入购物车",选择了就显示"加减图标组件"(被加入购物车盖住了，都属于定位) -->
          <div class="cartcontrol-wrapper">
            <cartcontrol :food="food"></cartcontrol>
          </div>
          <div @click="addFirst($event)" class="buy" v-show="!food.count || food.count===0">加入购物车</div>
        </div>
        <split v-show="food.info"></split>
        <!-- 商品介绍 -->
        <div class="info" v-show="food.info">
          <h1 class="title">商品介绍</h1>
          <p class="text">{{food.info}}</p>
        </div>
        <split></split>
        <!-- 商品评价 -->
        <div class="rating">
          <h1 class="title">商品评价</h1>
          <!--
            * 传值给ratingselect组件
            * selectType     显示的评价类型(全部，推荐，吐槽)
            * onlyContent    是否只显示有内容的评价
            * desc           那些类型(全部，推荐，吐槽)
            * food.ratings   这种商品的评价内容
            -->
          <ratingselect :select-type="selectType" :only-content="onlyContent" :desc="desc" :ratings="food.ratings" @select="selectRating" @toggle="toggleContent"></ratingselect>
          <div class="rating-wrapper">
            <ul v-show="food.ratings && food.ratings.length">
              <li v-show="needShow(rating.rateType,rating.text)" v-for="rating in food.ratings" class="rating-item border-1px">
                <div class="user">
                  <span class="name">{{rating.username}}</span>
                  <img class="avatar" :src="rating.avatar" width="12" height="12">
                </div>
                <div class="time">{{rating.rateTime | formatDate}}</div>
                <p class="text">
                  <span :class="{'icon-thumb_up': rating.rateType===0, 'icon-thumb_down': rating.rateType===1}"></span>{{rating.text}}
                </p>
              </li>
            </ul>
            <div class="no-rating" v-show="!food.ratings || !food.ratings.length">暂无评价</div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script type="text/ecmascript-6">
import BScroll from 'better-scroll'
import cartcontrol from '@/components/cartcontrol/cartcontrol'  // 商品数量加减图标组件
import split from '@/components/split/split'
import ratingselect from '@/components/ratingselect/ratingselect.vue'
import {formatDate} from '@/common/js/util'  // 时间转换函数

// const POSITIVE = 0
// const NEGATIVE = 1
const ALL = 2

export default {
  props: {
    food: {
      type: Object
    }
  },
  data() {
    return {
      showFlag: false,
      selectType: ALL,     // 点击的类型(全部，推荐，吐槽.....)
      onlyContent: false,  // 是否只显示有内容的文字
      desc: {              // 类型的显示文字
        all: '全部',
        positive: '推荐',
        negative: '吐槽'
      }
    }
  },
  created() {
  },
  methods: {
    show() {    // 点击商品展示商品详情页
      this.showFlag = true
      this.selectType = ALL   // 显示时默认展示全部评价
      this.onlyContent = false // 显示时默认不展示有内容的评价
      this.$nextTick(() => {
        if (!this.scroll) {   // 加判断防止一直初始化
          this.scroll = new BScroll(this.$refs.foodDetail, {
            click: true
          })
        } else {
          this.scroll.refresh()  // 重新计算better-scroll
        }
      })
    },
    hide() {
      this.showFlag = false
    },
    addFirst(event) {
      if (!event._constructed) {  // 防止PC端触发两次点击
        return
      }
      this.$root.eventHub.$emit('add', event.target)   // 派发事件,shopcart.vue接收事件从而生成小球动画
      this.$set(this.food, 'count', 1)  // Vue.set也可以，但是本页面要import Vue...添加属性，变化就能被观测到，就能通知到DOM发生变化
    },
    needShow(type, text) {  // 筛选显示的评论列表;参数：type(本条评论代表的类型，是推荐还是吐槽).text(本条评论的评论内容)
      if (this.onlyContent && !text) {   // 选择了"只显示有内容的评价"同时本条评论没有内容文字，这条评论false不显示
        return false
      }
      if (this.selectType === ALL) {  // 状态是显示ALL全部，这条评论true显示
        return true
      } else {
        return type === this.selectType  // 否则判断本条评论的状态是不是与点击的selectType相同，相同返回true显示
      }
    },
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
  },
  filters: {
    formatDate(time) {
      let date = new Date(time)
      return formatDate(date, 'yyyy-MM-dd hh:mm')
    }
  },
  components: {
    cartcontrol,
    split,
    ratingselect
  }
}
</script>

<style scoped lang="scss">
@import "../../common/styles/mixin.scss";
.foodDetail{
  position:fixed;
  left:0;
  top:0;
  bottom:48px;
  z-index:30;
  width:100%;
  background: #fff;
  transition:all 0.2s linear;
  transform: translate3d(0,0,0);
  &.move-enter,&.move-leave-active{
    transform: translate3d(100%,0,0);
  }
  /* 商品图片 */
  .image-header{
    position:relative;
    width:100%;
    height:0;
    padding-top:100%;
    img{
      position:absolute;
      top:0;
      left:0;
      width:100%;
      height:100%;
    }
    .back{
      position:absolute;
      top:10px;
      left:0;
      .icon-arrow_lift{
        display: block;
        padding:10px;
        font-size:20px;
        color:#fff;
      }
    }
  }
  /* 商品内容 */
  .content{
    padding:18px;
    position:relative;
    .title{
      line-height: 18px;
      margin-bottom:8px;
      font-size:14px;
      font-weight:700;
      color:rgb(7,17,27);
    }
    .detail{
      margin-bottom:18px;
      line-height: 10px;
      height:10px;
      font-size:0;
      .sell-count,.rating{
        font-size:10px;
        color:rgb(147,153,159);
      }
      .sell-count{
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
      right:12px;
      bottom:12px;
    }
    .buy{
      position:absolute;
      right:18px;
      bottom:18px;
      z-index:10;
      height:24px;
      line-height: 24px;
      padding:0 12px;
      box-sizing:border-box;
      border-radius:12px;
      font-size:10px;
      color:#fff;
      background: rgb(0,160,220);
    }
  }
  /* 商品介绍 */
  .info{
    padding:18px;
    .title{
      line-height: 14px;
      margin-bottom:6px;
      font-size:14px;
      color:rgb(7,17,27);
    }
    .text{
      line-height: 24px;
      padding:0 8px;
      font-size:12px;
      color:rgb(77,85,93);
    }
  }
  /* 商品评价 */
  .rating{
    padding-top:18px;
    .title{
      line-height: 14px;
      margin-left: 18px;
      font-size: 14px;
      color: rgb(7, 17, 27);
    }
    .rating-wrapper{
      padding: 0 18px;
      .rating-item{
        position: relative;
        padding: 16px 0;
        @include border-1px(rgba(7, 17, 27, 0.1));
        .user{
          position: absolute;
          right: 0;
          top: 16px;
          line-height: 12px;
          font-size: 0;
          .name{
            display: inline-block;
            margin-right: 6px;
            vertical-align: top;
            font-size: 10px;
            color: rgb(147, 153, 159);
          }
          .avatar{
            border-radius: 50%;
          }
        }
        .time{
          margin-bottom: 6px;
          line-height: 12px;
          font-size: 10px;
          color: rgb(147, 153, 159);
        }
        .text{
          line-height: 16px;
          font-size: 12px;
          color: rgb(7, 17, 27);
          .icon-thumb_up, .icon-thumb_down{
            margin-right: 4px;
            line-height: 16px;
            font-size: 12px;
          }
          .icon-thumb_up{
            color: rgb(0, 160, 220);
          }
          .icon-thumb_down{
            color: rgb(147, 153, 159);
          }
        }
      }
      .no-rating{
        padding: 16px 0;
        font-size: 12px;
        color: rgb(147, 153, 159);
      }
    }
  }
}
</style>