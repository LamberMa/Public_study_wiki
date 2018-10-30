# Python开发

[TOC]



## Basis

### Python递归的最大深度

```python
python有一个默认的最大递归深度，网上测的都说在970~980左右，我自己用ipython测试会到2800多。其实这个递归深度是可以设置的，python设置默认一个递归深度是为了避免python栈溢出引发一些异常，如果真的需要很大的递归深度可以自己引入sys模块进行设置：

import sys
sys.setrecursionlimit(10000)
```





## OOP

### python的自省有几种？

```
自省是一种自我检查的行为，在python中，自省是检查某种事物以确定它是什么，它知道什么，它能做什么。换言之就是在python中你可以通过自省知道运行时候的对象类型。
常见的我们说的反射，getattr，hasattr。python内部提供的dir()，type()，isinstance()，id()，help()，callable()；
```

### \_\_new\_\_和\_\_init\_\_有什么区别？

```python
- __init__是实例方法，__new__是静态方法
- __new__是真正返回创建好的实例的方法，而__init__不返回，只用来作为对象内容的构造。
- 只有在__new__返回一个cls的实例时，后面的__init__才能被调用
- 当创建一个新势力的时候调用__init__，初始化一个实例的时候使用__init__

ps: __metaclass__是创建类时起作用.所以我们可以分别使用__metaclass__,__new__和__init__来分别在类创建,实例创建和实例初始化的时候做一些小手脚.
```







## Cookie&Session

**session和cookie的实现原理？**

```
session: 是服务端应⽤程序在服务器上记录⽤⼾当前会话数据，有效时间⽐较短，会话结束就销毁了；因为数据保存在服务端，因此可以认为比起cookie，session更为可靠，而且session的实现要依赖于cookie

cookie: 是通过 http 响应头发送到⽤⼾浏览器端保存的，通常会设置⼀段时间内都有效；cookie通常用来保存用户数据，session_id，标记用户，设备；一般认为cookie是不可靠的，session是可靠地。
```



## 网络编程



## Web开发

### Django



### Flask

#### Flask框架的优势在于哪些？



#### Flask第三方插件



#### Flask内置功能依赖



#### Flask中上下文管理流程以及和Django的比较？





#### Flask中上下文管理主要涉及到了哪些相关的类？并描述这些类的作用



### Toronado







## 项目

### CMDB

**CMDB应该包含哪些重要的实体，以及包含的主要的字段**

```
- 业务板块：名称，负责人，域名
- 应用：仓库地址，负责人，节点，构建命令，启动命令，日志路径；
- 服务器/云主机 ：供应商，地域，机房，ip，cpu，mem，disk，bandwidth，计费方式；
```



## 开发规范

### Restful

#### 谈谈你对restful规范的理解





#### DRF视图你都用过哪些基类？





## 算法





## 设计

