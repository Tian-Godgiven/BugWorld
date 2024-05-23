const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack')

 module.exports = {
   mode: 'development',
   entry: './src/index.js',
   devtool: 'inline-source-map',
   devServer: {
     static: './dist',
   },
   plugins: [
    new HtmlWebpackPlugin({
        filename: 'index.html',
        template: './src/index.html', // 你的主页面模板
        chunks: ['index'], // 使用的 JavaScript 入口文件
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery'
    })
   ],
   output: {
     filename: 'bundle.js',
     path: path.resolve(__dirname, 'dist'),
     clean: true,
    publicPath: '/',
   },
   module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
      }
    ],
    
  },
 };