# http-client

## 安装依赖

    npm install http-client-base --save

## 概要

一个nodejs编写的网路请求模块。对request模块进行封装。实现了如下标准接口方法。

- $get
- $getJson
- $post
- $postJson
- $setUrlPrefix
- $addParamsFilter
- $clearParamsFilter


## 下载项目并运行代码

    
    git clone https://github.com/hellobeifeng/http-client.git workSpace
    cd workSpace
    npm install #安装项目依赖
    mocha   #执行测试用例


## 开发笔记

### 修改package.json 时intellij IDEA 提示clear-ready-only-status怎么办？

因为你在不同权限下进行了两次编辑导致的。Mac系统使用如下代码

    sudo chown -R $USER /http-client(这里是你项目目录)