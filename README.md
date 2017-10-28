# appEleme-project

> vue2高仿饿了么app

### Build Setup

```javascript
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

```
### 构建项目

```javascript
vue init webpack appEleme-project

npm run dev

cnpm install node-sass --save-dev
cnpm install sass-loader --save-dev   // sass-loader依赖于node-sass

cnpm install vue-resource --save

cnpm install better-scroll --save-dev

```
### 项目脑图
![image](https://github.com/ccyinghua/appEleme-project/blob/master/resource/readme/vue.png?raw=true)

> markdown文件说明

- header.md - 头部组件开发说明
- goods.md - 商品组件开发说明
- foodDetail.md - 商品详情页组件说明
- seller.md - 商家详情页组件说明

### 编译打包

1. npm run build  生成dist文件，dist文件是npm run build执行以后被编译打包生成的文件，CSS,JS,图片等文件都在dist文件中。

![image](https://github.com/ccyinghua/appEleme-project/blob/master/resource/readme/build/build-img01.png?raw=true)

2. 打开dist下的index.html,空白页

![image](https://github.com/ccyinghua/appEleme-project/blob/master/resource/readme/build/build-img02.png?raw=true)

3. 路径不对，config/index.js中，改路径之后重新npm run build打包

![image](https://github.com/ccyinghua/appEleme-project/blob/master/resource/readme/build/build-img03.png?raw=true)
   
4. 可以打开了，但是mock数据无法加载

![image](https://github.com/ccyinghua/appEleme-project/blob/master/resource/readme/build/build-img04.png?raw=true)

5. 在项目根目录建立测试的http server---prod.server.js,并且config/index.js

![image](https://github.com/ccyinghua/appEleme-project/blob/master/resource/readme/build/build-img05.png?raw=true)

6. 命令node prod.server.js，浏览器输入localhost:9000运行成功。

![image](https://github.com/ccyinghua/appEleme-project/blob/master/resource/readme/build/build-img06.png?raw=true)
