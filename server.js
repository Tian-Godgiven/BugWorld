const express = require('express');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackConfig = require('./webpack.config.js');

const app = express();
const compiler = webpack(webpackConfig);

// 使用 webpack-dev-middleware 中间件
app.use(webpackDevMiddleware(compiler, {
  publicPath: webpackConfig.output.publicPath
}));

// 设置根路径的路由，用于返回 index.html
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/dist/index.html');
  });

// 将文件 serve 到 port 3000。
app.listen(3000, function () {
  console.log('App listening on port 3000\n');
});