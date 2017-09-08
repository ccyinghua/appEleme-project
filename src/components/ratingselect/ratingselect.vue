<!-- 评价类型组件 -->
<template>
  <div class="ratingselect">
    <div class="rating-type border-1px">
      <span class="block positive" :class="{'active': selectType===2}" @click="select(2,$event)">{{desc.all}}<span class="count">{{ratings.length}}</span></span>
      <span class="block positive" :class="{'active': selectType===0}" @click="select(0,$event)">{{desc.positive}}<span class="count">{{positives.length}}</span></span>
      <span class="block negative" :class="{'active': selectType===1}" @click="select(1,$event)">{{desc.negative}}<span class="count">{{negatives.length}}</span></span>
    </div>
    <div class="switch" :class="{'on': onlyContent}" @click="toggleContent($event)">
      <span class="icon-check_circle"></span>
      <span class="text">只看有内容的评价</span>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  const POSITIVE = 0  // 推荐
  const NEGATIVE = 1  // 吐槽
  const ALL = 2       // 全部

  export default {
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
    computed: {
      positives() {    // 过滤获取评价类型(rateType)是0(推荐)的评价内容
        return this.ratings.filter((rating) => {
          return rating.rateType === POSITIVE
        })
      },
      negatives() {    // 过滤获取评价类型(rateType)是1(吐槽)的评价内容
        return this.ratings.filter((rating) => {
          return rating.rateType === NEGATIVE
        })
      }
    },
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
  }
</script>

<style scoped lang="scss">
@import "../../common/styles/mixin.scss";
.ratingselect{
  .rating-type{
    padding:18px 0;
    margin:0 18px;
    @include border-1px(rgba(7,17,27,0.1));
    font-size:0;
    .block{
      display:inline-block;
      padding:8px 12px;
      margin-right:8px;
      border-radius:1px;
      font-size:12px;
      color:rgb(77,85,93);
      &.active{color:#fff;}
      &.positive{
        background: rgba(0,160,220,0.2);
        &.active{ background: rgb(0,160,220);}
      }
      &.negative{
        background: rgba(77,85,93,0.2);
        &.active{ background: rgb(77,85,93);}
      }
      .count{
        font-size:8px;
        margin-left:2px;
        line-height: 16px;
      }
    }
  }
  .switch{
    padding:12px 18px;
    line-height: 24px;
    border-bottom:1px solid rgba(7,17,27,0.1);
    font-size:12px;
    color:rgb(147,153,159);
    font-size:0;
    &.on{
      .icon-check_circle{color:#00c850;}
    }
    .icon-check_circle{
      display:inline-block;
      vertical-align:top;
      margin-right:4px;
      font-size:24px;
    }
    .text{
      display:inline-block;
      vertical-align:top;
      font-size:12px;
    }
  }
}
</style>