# header组件开发
> 为什么加v-if

App.vue传入子组件的数据seller，因为是异步请求，传出的会是空对象，那seller.supports[0]就是未定义的，会报错，要加个 ==v-if== 判断，不存在就不会读取。

```
header.vue-子组件

<div v-if="seller.supports" class="support">
  <icon :size="1" :type="seller.supports[0].type"></icon>
  <span class="text">{{seller.supports[0].description}}</span>
</div>

==> 父组件传来的==数据需要props注册==
props: {
    seller: {
      type: Object
    }
}
```

```
App.vue-父组件

<template>
    <div id="app">
        <v-header :seller="seller"></v-header>   <!--传入seller给header组件-->
    </div>
</template>

data() {
    return {
        seller: {}
    }
},
created() {
    this.$http.get('api/seller').then((response) => {  // 异步请求
        response = response.body; console.log(response)
        if (response.errno === ERR_OK) {
            this.seller = response.data 
            console.log(this.seller)
        }
    })
}
```
> star.vue-五角星子组件

五角星在页面中出现过很多次，只不过有些大小不同，做成组件方便直接使用；需要传给star组件大小 ==size== 和分数 ==score==
- 用传入的size返回不同的类名(starType),写不同的样式区分
- 传入的score分数，用计算属性对分数计算返回一个状态数组

```
header.vue
<star :size="48" :score="seller.score"></star>

star.vue
<template>
  <div class="star" :class="starType">
    <span v-for="(itemClass,index) in itemClasses" :class="itemClass" class="star-item" :key="index"></span>
  </div>
</template>

const LENGTH = 5
const CLS_ON = 'on'
const CLS_HALF = 'half'
const CLS_OFF = 'off'
props: {
    size: {
        type: Number
    },
    score: {
        type: Number
    }
}
computed: {
    starType() {
        return 'star-' + this.size
    },
    itemClasses() {
        let result = []
        let score = Math.floor(this.score * 2) / 2  // 结果不是整数，就是1.5,2.5(小数部分是5)
        let hasDecimal = score % 1 !== 0 // 判断是否有小数点
        let integer = Math.floor(score) // 整数部分
        for (let i = 0; i < integer; i++) {
            result.push(CLS_ON)
        }
        if (hasDecimal) {
            result.push(CLS_HALF)
        }
        while (result.length < LENGTH) {
            result.push(CLS_OFF)
        }
        return result
    
        // 方法2
        // let result = []
        // let hasDecimal = this.score % 1 !== 0  // 判断是否有小数点
        // let integer = Math.floor(this.score)  // 整数部分
        // for (let i = 0; i < integer; i++) {
        //   result.push(CLS_ON)
        // }
        // if (hasDecimal) {
        //   let larger = Math.floor((this.score - integer) * 10) >= 5
        //   if (larger) {
        //     result.push(CLS_HALF)
        //   }
        // }
        // while (result.length < LENGTH) {
        //   result.push(CLS_OFF)
        // }
        // return result
        }
    }
```
> icon.vue-优惠图标组件

与star.vue组件类似，在页面中出现过很多次，需要传给icon组件大小 ==size== 和图标的类型 ==type==
- 用传入的size返回不同的类名(iconType),写不同的样式区分
- 传入的type获取不同的类型代表的类名，展现不同的样式

```
header.vue
<icon :size="2" :type="seller.supports[index].type"></icon>

icon.vue
<template>
  <div class="icon" :class="iconType">
    <span class="icon-item" :class="classMap[type]"></span>
  </div>
</template>
props: {
    size: {
      type: Number
    },
    type: {
      type: Number
    }
},
computed: {
    iconType() {
      return 'icon-' + this.size
    }
  },
  created() {
    this.classMap = ['decrease', 'discount', 'special', 'invoice', 'guarantee']
  }
}
```

![image](https://github.com/ccyinghua/appEleme-project/blob/master/resource/readme/header/header-img01.jpg?raw=true)

![image](https://github.com/ccyinghua/appEleme-project/blob/master/resource/readme/header/header-img02.jpg?raw=true)
