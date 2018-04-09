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

