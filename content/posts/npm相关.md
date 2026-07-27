---
title: "npm相关"
date: 2026-07-21
tags: [npm]
category: "学习"
summary: "npm相关的东西"
draft: false
---
## 概述
**npm(Node Package Manager)node包管理器，是Node.js自带的包管理工具，其主要职责为：**
- 安装和管理第三方库(npm install)
- 运行项目脚本(npm run dev)
- 管理项目依赖和版本  
**总之：有些像python的pip**
## 常用命令
### 安装依赖
在运行前我们要先安装项目依赖，其安装的依赖都会放到```node_modules```下
```bash
npm install 包名（可选，不加则默认安装所有）
```
PS：安装好后的包和包名会被自动添加到```package.json```的 dependencies 字段中同时更新```package-lock.json```
### package.json与package-lock.json的区别
| 文件 | 作用 | 特性 |
|------|------|------|
| package.json | 声明项目需要的依赖及版本范围（如 ^2.1.0，小版本2.1.x无限制） | 允许小版本更新 |
| package-lock.json | 锁定当前实际安装的精确版本（如 2.1.3） | 完全锁定精确版本 |
### 运行调试
安装好依赖后，就可以运行调试
```
npm run dev(调试命令，以dev为例)
```
具体的运行命令可在```node_modules```的scripts字段中查看，约定俗成的调试命令是dev