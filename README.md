# http-client

## 概要

一个nodejs编写的网路请求模块。对request模块进行封装。实现了如下标准接口方法。

- $get
- $getJson
- $post
- $postJson
- $setUrlPrefix
- $addParamsFilter

## 运行

    npm install #安装项目依赖
    mocha   #执行测试用例


## 外部依赖

### 测试库(chai)

### URL处理库(uri.js)

http://medialize.github.io/URI.js/docs.html

### 网络请求库(request)



## 开发笔记

### 修改package.json 时intellij IDEA 提示clear-ready-only-status怎么办？

因为你在不同权限下进行了两次编辑导致的。Mac系统使用如下代码

    sudo chown -R $USER /http-client(这里是你项目目录)