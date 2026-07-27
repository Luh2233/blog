---
title: "Leetcode399"
date: 2026-07-22
tags: [ACM]
category: "学习"
summary: "Leetcode399题，用c语言解十分繁琐"
draft: false
---
![leetcode399](/images/leetcode399.png)
一道非常复杂的题，结合了链表和dfs。尤其是链表，由于c语言没有没有内置链表所以得自己手写，这些底层的东西真的是极其坐牢
## 结构体
**其实就是构建链表，定义节点**
```c
struct edgenode {
    int to; //指向的邻居节点的编号
    double weight;//与相邻节点连接的边的权重
    struct edgenode* next; //指向的下一个edgenode节点
};
```
## 映射工具
**c语言没有hashmap，只能像这样子来映射**
### getIndex
```c
char varNames[100][10]; //题目中的一个个元素都是字母如"a"，"bc", 所以由varNames这个char类型二维数组来记录
//一共记录100个元素的，每个元素字符长度最大为10
int varCount = 0; //已记录的元素个数
int getIndex(char* name) {//拿取编号（主要建图的时候用）
    for (int i = 0; i < varCount; i++) {//循环比对，找到即返回该元素编号
        if (strcmp(varNames[i], name) == 0) {
            return i;
        }
    }
    strcpy(varNames[varCount], name);//如未找到则在varNames末尾加入该元素
    //此时这个未记录元素已完成映射，如VarNames[0]="a"
    varCount++;//更改varCount使varNames的记录往后移
    return varCount - 1;//！！！这里的-1，varCount本身没有改变，只是返回值为了与编号一致而-1
}
```
### findIndex
```c
int findIndex(char* name) {//专门用来验证该元素是否在图中存在，不存在则返回-1（题目要求）
    for (int i = 0; i < varCount; i++) {//循环比对部分与getIndex一样
        if (strcmp(varNames[i], name) == 0)
            return i;
    }
    return -1;
}
```
## 将加边操作封装为函数
```c
struct edgenode* graph[100] = {NULL};//初始化图，可容纳100个struct edgenode*，初始值为NULL。在主函数里会用到
void addVerge(struct edgenode** head, int to, double weight) {
    //！！！head**是二级指针，因为要操作一级指针head*，不这样的话没法修改head*指针指向的值（形参问题），自然就没法用next指向下一个节点了
    struct edgenode* newnode =(struct edgenode*)malloc(sizeof(struct edgenode));
    //创建对象，分配内存，避免这个函数一结束加完的边就都没了
    newnode->to = to;
    newnode->weight = weight;
    newnode->next = *head;
    *head = newnode;
}
```
## dfs
**除了使用dfs遍历整个图，还要同时解决累乘的问题**
```c
bool visited[10000];
double dfs(int cur, int target, double curProduct) {
    if (cur == target) {//判定结束条件当前值=目标值
        return curProduct;//返回当前乘积，累乘部分并未在dfs函数中体现，在主函数中修改传入的参数
    }
    visited[cur] = true;
    struct edgenode* p = graph[cur];//要结合主函数看，不能单独看dfs
    while (p != NULL) {//结束条件，找到空的树（树的末端）
        if (!visited[p->to]) {//下一个节点没看过就访问
            double res = dfs(p->to, target, curProduct * p->weight);
            //res就是当前乘积，结合前面的return curProduct看
            if (res != -1.0) {
                return res;
            }
        }
        p = p->next;//看过了，就接着找下一个，next就在这里用上了，用来更新p
    }
    return -1.0;
}
```
## 主函数
**使用上述工具对题目所给数据进行操作，完成建图与解答。同时评测系统会不断调用主函数作为解答函数，要记得初始化**
```c
double* calcEquation(char*** equations, int equationsSize,int* equationsColSize, double* values, int valuesSize,char*** queries, int queriesSize, int* queriesColSize,int* returnSize) {//题目给的参数
/*
equations：等式条件本身
二维数组指针，即一个指向里面套了数组的数组的指针。
因为c没有String类型，所以当数组作为参数传入时会自动退化为指向数组头元素的像应类型的指针
equationsSize：题目给出的等式条件的数量
equationsColSize：每个等式条件的纵向数量，依题意恒定为2
values：每个等式的值
valuesSize：值的数量
queries：问题数组
queriesSize：问题的数量
queriesColSize：每个等式条件的纵向数量，依题意恒定为2
returnSize：评测系统需要的具体的返回参数
*/
    varCount = 0;//初始化主函数，因为评测系统会调用这个函数作为解答，之前定义的全局变量只是一次性初始化，重复调用主函数会导致错误值不断积累
    memset(graph, 0, sizeof(graph));
    //初始化数组graph，0会被视为NULL，sizeof（graph）则规定了要初始化的数量
    for (int i = 0; i < equationsSize; i++) {//建图，映射
        int a = getIndex(equations[i][0]);//就是给a和b一个数字编号（映射）
        //例如：0代表a，graph[0]代表所有和a相关联的值
        int b = getIndex(equations[i][1]);
        double v = values[i];

        addVerge(&graph[a], b, v);
        addVerge(&graph[b], a, 1 / v);
    }
    double* ans = (double*)malloc(queriesSize * sizeof(double));
    //为答案数组分配内存空间
    *returnSize = queriesSize;
    for (int i = 0; i < queriesSize; i++) {
        int c = findIndex(queries[i][0]);//确认每个queries中的元素是否是图中的，不是的话返回-1，即这个queries的ans为-1
        int d = findIndex(queries[i][1]);
        if (c == -1 || d == -1) {
            ans[i] = -1.0;
        } else {
            memset(visited, 0, sizeof(visited));
            ans[i] = dfs(c, d, 1.0);//在dfs中返回答案
        }
    }
    return ans;
}
```