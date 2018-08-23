## Django ModelForm

> - Model：操作数据库
> - Form：对用户请求过来的数据进行验证+生成html标签
>
> 那么modelform就是操作数据+用户请求验证+生成html标签。如果是写的大型的应用程序，那么不推荐使用modelform，比如数据库操作，不同的业务部门通过api或者rpc去访问。对于这些业务部门来说，他们是接触不到数据库这些表的，这些人只需要做form数据验证，然后转发给基础平台，让基础平台进行数据的插入就行了，这个时候model和form就应该分开了，互相没有依赖关系；对于中小型的应用，比如数据库表就在这个app里，通过modelform可以让你省一些事。
>
> 参考：www.cnblogs.com/wupeiqi/articles/6229414.html







反向生成url

include('app01.urls',namespace='aaa')

app01.urls中的这一大堆对应关系是和aaa这个namespace对应的。

我在调用v1.site.urls的时候返回的是

[],appname,namespace

其实就相当于include('v1.site.urls', namespace='namespace')

因此以后再反向生成的时候就需要加上这个namespace了。

namespace在分发的时候做进一级别的划分，比如url的name都是n1，有两条，那么n1对应的到底是哪一个。

这个时候如果再加上namespace就可以进行区分了。

只要反向生成url就必须指定namespace

```python

```

反向url的作用：增加成功，跳转回哪个列表？这几个执行函数其实是不知道的。它只能根据反向生成url，根据当前url，根据你的app再加上你的名称去做。可以反向生成的这个列表连接，这样就能跳转回去了？

## CRM项目组件之处理用户请求

在lamber下创建一个template模板，那么他们会优先来自己的template下找。

inclusion_tag表示要导入一个html模板



