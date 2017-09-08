<template>
  <div id="app">
    <v-header :seller="seller"></v-header>
    <div class="tab border-1px">
        <div class="tab-item">
          <router-link to="/goods" active-class="active">商品</router-link>
        </div>
        <div class="tab-item">
          <router-link to="/ratings" active-class="active">评论</router-link>
        </div>
        <div class="tab-item">
          <router-link to="/seller" active-class="active">商家</router-link>
        </div>
    </div>
    <keep-alive>
      <router-view :seller="seller"></router-view><!-- 传seller进入 -->
    </keep-alive>
  </div>
</template>

<script>
import header from '@/components/header/header.vue'
import {urlParse} from '@/common/js/util'

const ERR_OK = 0

export default{
  data() {
    return {
      seller: {
        id: (() => {
          let queryParam = urlParse()  // 解析获取seller.id
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
  components: {
    'v-header': header
  }
}
</script>

<style scoped lang="scss">
  @import './common/styles/mixin.scss';

  .tab {
    display: flex;
    width: 100%;
    height: 40px;
    line-height: 40px;
    // border-bottom: 1px solid rgba(7, 17, 27, 0.1);
    @include border-1px(rgba(7,17,27,0.1));
    .tab-item {
      flex: 1;
      text-align: center;
      & > a {
        display:block;
        font-size:14px;
        color:rgb(77,85,93);
        &.active{
          color:rgb(240,20,20);
        }
      }
    }
  }
</style>
