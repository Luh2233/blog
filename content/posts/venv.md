---
title: "venv的创建与管理"
date: 2026-07-14
tags: [python,medibot]
category: "学习"
summary: "venv相关"
draft: false
---

**venv就是使用python为项目创建虚拟环境来与全局环境和其它环境进行隔离，以避免package和其它变量的冲突**
# 创建与激活
## 创建venv
先cd到项目目录，执行
```bash
python -m venv firstvenv
```
使用方式为：**python + -m + venv + 虚拟环境的名字**

## 激活venv（二选一）
- 在powershell中，按路径执行Activate.ps1。例如
    ```bash
    D:\学习\python\venv\firstvenv\Scripts\Activate.ps1
    ```
    *PS：哪怕已经切换到当前目录了，例如：D:\学习\python\venv\firstvenv\Scripts也不能直接执行Activate.ps1，而是要执行```.\Activate.ps1```不然会报错*

- 在cmd中，与在powershell中类似,只是执行文件由**Activate.ps1**变为**activate.bat**
    ```bash
    D:\学习\python\venv\firstvenv\Scripts\activate.bat
    ```
### 激活标志
在目录前出现自己定义的venv的名字
```bash
(firstvenv) PS D:\学习\python\venv\firstvenv\Scripts>
```
## 关闭venv
在任意位置执行```deactivate```
*PS: venv 文件夹本身不要提交到 git,加进 .gitignore*

# package的安装，导出与导入
## 安装
可在任意位置执行，但```必须在venv 激活的状态下执行,否则包会装到全局环境里去```
```bash
pip install requests flask
```
使用方法为**pip + install + 包名1 + 包名2**，无论在什么路径执行，包都会安装在```site-packages```中
## 导出
执行
```bash
pip freeze > requirement.txt
```
其中requirement.txt是你自定义的文件名（带后缀），会在当前目录输出
## 导入
执行
```bash
pip install -r "requirement.txt"
```
"requirement.txt"是输出的文件，里面有包的记录，主要就是为了用户要使用程序时能根据根据requirement.txt来安装相应的支持包