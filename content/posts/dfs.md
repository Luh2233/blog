---
title: "dfs"
date: 2026-07-23
tags: [ACM，专题归纳]
category: "学习"
summary: "dfs的一些分类与辨明"
draft: false
---
**dfs有三种形式：1.前序遍历 2.中序遍历 3.后序遍历**
### 前置代码
```c
struct TreeNode {
    int val;
    struct TreeNode *left;
    struct TreeNode *right;
};
```
# 共通思路
**先判非空，即tree!=NULL。是NULL则直接返回**
**之后进行遍历（递归）**
## 前序遍历
**一条路走到黑**  
**根>左>右**
```c
void dfs(struct TreeNode* start){
    if(start==NULL){
        return;
    }
    int num=start->val; //这一步不是一定的，只是根据题目刚好有连续不重复数字，要随机变通
    visit(root);//visit只是访问节点的意思，并非具体函数
    //先访问完再去探索其余左右节点
    dfs(start->left);//无论什么遍历顺序，左永远>右
    dfs(start->right);
}
```
## 中序遍历
**先折完左，再折右**  
**左>根>右**
```c
void dfs(struct TreeNode* start){
    if(start==NULL){
        return;
    }
    int num=start->val; 
    dfs(start->left);
    visit(root);
    dfs(start->right);
}
```
## 后序遍历
**左右一起折，再一起收束根**  
**左>右>根**
```c
void dfs(struct TreeNode* start){
    if(start==NULL){
        return;
    }
    int num=start->val; 
    dfs(start->left);
    dfs(start->right);
    visit(root);
}
```