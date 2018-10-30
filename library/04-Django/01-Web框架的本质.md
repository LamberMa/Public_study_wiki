数据库

1. 安装
2. 创建用户+授权
3. 连接
   - 数据库：终端创建数据库（字符编码）
   - 数据表：终端，orm，pymysql（create……，engine innodb，charset）
   - 数据行：增删改查



问题：简述ORM原理

浏览器的请求头：

```html
GET / HTTP/1.1
Host: localhost:10020
Connection: keep-alive
Cache-Control: max-age=0
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.84 Safari/537.36\
Upgrade-Insecure-Requests: 1
Accept:text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8
Accept-Encoding: gzip, deflate, br
Accept-Language: zh-CN,zh;q=0.9,ja;q=0.8,en;q=0.7,zh-TW;q=0.6
Cookie: Pycharm-2f1c850a=df26fed3-d2a7-4be6-bfa1-4dc7a4831b46
```

服务器会返回对应的响应头和响应体。



小结：

```
1、HTTP 短连接，无状态
2、浏览器 socket客户端    网站 socket服务端
3、自己写网站
   a：socket服务端
   b：根据URL不同返回不同的内容，路由系统：URL -- 函数
   c：字符串返回给用户，末班引擎渲染，html充当模板(特殊自符)，自己创造任意数据。
4、web框架：
   框架种类：
     - a,b,c                 ----- tornado
     - 第三方的a,b,c          ------ wsgiref -> Django
     - 第三方的a,b,第三方的c   ------ Flask
   分类：
     - Django框架(包含n多的web工具，是一个大家伙)
     - 其他
```

## MVC

- model：django中用来描述数据表的，运用这个类，可以通过简单的python代码来创建，检索，更新，删除数据库中的记录，而无需一条又一条的写sql语句。
- views：业务层逻辑，视图函数
- urls：什么样的url调用什么样的视图，
- xxx.html：html模板，这个页面如何设计应该如何显示。

这些部分松散的组合何在一起就是模型-视图-控制器（MVC）的设计模式，其实在diango中也可以叫MTV的设计模式（model-template-view）。mvc是一种软件开发的方法，它吧代码的定义和数据访问的模型与请求逻辑（controller）还有用户接口视图分开来。这样，每一个由django驱动的web应用都有着明确的目的，并且可独立更改而不影响到其他的部分。比如更改程序url而不改变程序底层实现，改变html不触碰python代码，数据库冲洗命名数据表只需要修改模型层，而不需要频繁的在多个文件中查找和替换。

## Web框架的本质

http是无状态的，短连接。你连我一次，我回复你一次，你下次来我就不知道你是谁了。