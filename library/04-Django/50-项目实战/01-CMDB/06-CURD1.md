# 增删改查插件

> 数据的采集以及录入已经完成，接下来就是将我们的数据展示出来，在autoserver项目中新建一个app名称为backend，用来做cmdb后台。本次实现插件的方法为基于前端的CURD插件，传递过来数据以后数据的展示是由JS动态生成的。

## 后端项目准备工作

**在主路由入口配置backend的路由设置**

```python
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('backend/', include('backend.urls')),
]
```

记得在settings中注册一下backend，否则app将无法正常使用，然后写第一个页面的展示

```python
# 路由
urlpatterns = [
    re_path('^curd.html$', views.curd),
    re_path('^curd_json.html$', views.curd_json)
]
```

**模板**

模板，模板中，其实啥都没有，就放了一个div容器和一个table的框架，我们要将我们采集到的数据都在这里显示，具体的数据我们会通过js的ajax去请求然后动态的生成在页面上：

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
    <link rel="stylesheet" href="/static/css/bootstrap.css">
</head>
<body>
    <div style="width: 700px;margin: 0 auto;">
        <table class="table table-bordered table-hover">
            <thead id="tbhead">
                <tr></tr>
            </thead>
            <tbody id="tbbody"></tbody>

    </table>
    </div>

    <script src="/static/js/jquery-3.3.1.js"></script>
    <script src="/static/js/bootstrap.js"></script>
    <script src="/static/js/backend.js"></script>
</body>
</html>
```

**视图函数**

对应的视图函数，实际的页面展示中，发起两个请求，第一次请求就是单独的展示这个html，这个html就是一个框架，或者叫一个模子。

```python
def curd(request):
   return render(request, 'backend/curd.html')
```

第二个请求同时会向后台请求数据，为前端提供数据。要显示的数据有标题以及对应标题的内容。

## Table_Config设计

>  我们存到数据库里的数据最后要显示出来的，但是有的时候并不是所有字段我们都需要显示出来的，举个简单的例子，比如ID字段，这个就可以不显示。而我这里想要达到的效果是对这个显示的字段（标题头部）进行自定制，让前端显示啥，前端就显示啥。不想让某一个字段在前端显示直接在后端注销掉对应的字段就可以，因此提出table_config的这样一个设计。

构造这样一个数据结构，table_config本身是一个列表，列表中套小字典，每一个小字典代表表头的一个字段，然后根据需要去扩展每一个字段。

### table_config字段说明

首先看一个table_config示例：

```python
[{
    'q': 'sn',
    'title': 'SN号',
    'display': True,
    'text': {
        'tpl': '{n1}',
        'kwargs': {'n1': '@sn'},
    },
},]
```

- q：即query，要查询的字段，比如主机名的q就是hostname，id的q就是id；因为我们这里完全是借助的django_orm去操作的。因此这里也可以使用跨表，反向查询的。

- title：要显示在标题的名称。

- display：是否显示当前字段，有的时候字段需要取，但是不一定要显示，比如id字段，我们可以去用来提交数据等，但是没必要显示，有的情况下可能也不是连续的，所以没有实际的意义就可以不显示

- text：模板，根据模板我们可以定制最终在表格中展示的数据的最终形式。有的时候我们并不想让数据原原本本的就显示从数据库取出来的样子，我们有时候会给数据加上一个后缀或者前缀然后再在前端页面显示，这里就用到了模板，这个操作加强了我们的数据展示的可定制性。

  ```python
  # text本身就是一个小字典，其内部包含tpl以及kwargs两个key，其中tpl表示要展示在前端表格的模板，kwargs表示要填充进模板的参数。
  ```

  

1. 做一个类似于python中的字符串格式化的模板，tpl，将kwargs中的参数传递进去以后就可以将格式化的字符串显示出来。这样可以做到让普通字符串直接显示，有模板的替换模板成动态值。

2. 这个我们想在表格的最后一列添加一列操作，比如操作这一列的表格内有编辑啊，删除啊操作，这在前端体现应该是一个a标签，但是它不需要在数据库字段内去取值的，因此我们在table_config中添加一个小字典，让q为None，也就是意味着不取。对应的text中的tpl模板也要进行修改

3. 上面这样一个数据结构构造完成以后把我们要在数据库取的字段名拿出来，同时过滤掉q值为None的操作列，因为values_list列表里不允许存在None值。这样生成的values_list就是一个要取的字段列表
   values_list = [row['q'] for row in table_config if row['q']]

4. 拿到要取的字段列表以后我们就可以直接使用这个列表取数据了`models.Server.objects.values(*values_list)`。拿到数据以后我们就要序列化一下返回给前端了。不过这样取出来的是一个queryset。queryset对象是一个不可json序列化的对象，否则会报错`Object of type 'QuerySet' is not JSON serializable`，解决这个问题的方法很简单，在序列化之前list一下就可以了。强制做类型转换。

5. 还有一个可能造成上述问题的可能就是你取出来的值里包含datetime的对象的话也是会报上面的错误的。这个时候我们要对默认的json进行二次的定制（扩展）：

   ```python
   class JsonCustomEncoder(json.JSONEncoder):
   
       def default(self, value):
           # 看要序列化的这个对象是不是datetime对象，如果是的话我们自己处理时间格式。
           if isinstance(value, datetime):
               return value.strftime('%Y-%m-%d %H:%M:%S')
           # 看要序列化的这个对象是不是date对象，如果是的话我们自己处理时间格式。
           elif isinstance(value, date):
               return value.strftime('%Y-%m-%d')
           # 如果不是的话那么就使用默认的
           else:
               return json.JSONEncoder.default(self, value)
   
   # json在调用的时候加一个cls参数。这样在每一个字段序列化的时候都会调用这个类的特殊方法，默认如果不填写的话调用的就是json.JSONEncoder
   json.dumps(ret, cls=JsonCustomEncoder)
   ```

   上述的方法可以是一个比较通用的方法，因为我们经常会用values去取值，还有一种方法是django为我们提供的，同样可以达到上述的效果：

   ```python
   # 可以使用序列化模块进行序列化，当然直接去数据直接取出来字典或者列表，不弄出来queryset就行了。
   v = models.Server.objects.all()
   from django.core import serializers
   serializers可以针对queryset对象进行序列化。
   data = serializers.serialize('json', v)
   ```

6. 最后返回给前端序列化后的数据，一个server_list（列表），table_config，也是一个列表，里面包着一个一个小的字典。

完整视图函数

```python
def curd_json(request):
    table_config = [
        {
            'q': 'id',
            'title': 'ID',
            'text': {
                'tpl': '{n1}',
                'kwargs': {'n1': '@id'},
            }
        },
        {
            'q': 'hostname',
            'title': '主机名',
            'text': {
                'tpl': '{n1}',
                'kwargs': {'n1': '@hostname'},
            }
        },
        {
            'q': 'create_at',
            'title': '创建时间',
            'text': {
                'tpl': '{n1}',
                'kwargs': {'n1': '@create_at'},
            }
        },
        {
            'q': 'asset__cabinet_num',
            'title': '机柜号',
            'text': {
                'tpl': '{n1}',
                'kwargs': {'n1': '@asset__cabinet_num'},
            }
        },
        {
            'q': 'asset__business_unit__name',
            'title': '业务线名称',
            'text': {
                'tpl': '{n1}',
                'kwargs': {'n1': '@asset__business_unit__name'},
            }
        },
        {
            'q': None,
            'title': '操作',
            'text': {
                'tpl': '<a href="/backend/del?nid={nid}">删除</a>',
                'kwargs': {'nid': '@id'},
            }
        },
    ]
    values_list = [row['q'] for row in table_config if row['q']]
    server_list = models.Server.objects.values(*values_list)

    class JsonCustomEncoder(json.JSONEncoder):

        def default(self, value):
            if isinstance(value, datetime):
                return value.strftime('%Y-%m-%d %H:%M:%S')
            elif isinstance(value, date):
                return value.strftime('%Y-%m-%d')
            else:
                return json.JSONEncoder.default(self, value)
    ret = {
        'server_list': list(server_list),
        'table_config': table_config,
    }

    return HttpResponse(json.dumps(ret, cls=JsonCustomEncoder))
```

**前端接收处理**

现在已经可以通过访问后端拿到传递过来的数据了，那么应该如何处理呢？表头和表数据分别填充；

```javascript
$(function () {
    // 一开始执行的一个初始化函数
    initial();
});

// 为字符串创建可以像Python那样的字符串的格式化方法
String.prototype.format = function (args) {
    return this.replace(/\{(\w+)\}/g, function (s,i) {
        return args[i];
    });
};

// 这就是之前说的向后端发送获取数据的js
function initial() {
    $.ajax({
        url:'/backend/curd_json.html',
        type:'GET',
        dataType: 'JSON',
        success:function (arg) {
            // 创建表头
            initTableHeader(arg.table_config);
            // 为数据表填充数据
            initTableBody(arg.server_list,arg.table_config);
        }
    })
}

function initTableHeader(table_config) {
    /*
    * 我现在要通过这个table_config动态的，因为table_config要显示啥使我们在后端定义好的
    * 插入表格的表头，也就是th标签；遍历table_config，k为索引值，v为含有标题的小字典
    */
    $.each(table_config,function (k,v) {
        var tag = document.createElement('th');
        tag.innerHTML = v.title;
        $('#tbhead').find('tr').append(tag);
    })
}

function initTableBody(server_list,table_config) {
    /*
    * server_list从后台发回来的数据是一个列表套字典的形式，每一个小字典都
    * 是一条资产信息。我们遍历具体的每一条资产拿数据。
    * row是整个一条资产的信息，rrow是table_config表头的详细信息字典
    */
    $.each(server_list,function (k,row) {
        // 遍历server_list列表，k为索引值，row为包含资产信息的小字典，形如：
        // row:{"id": 1, "hostname": "\u9a6c\u6653\u96e8\u7684MBP"},
        var tr = document.createElement('tr');
        $.each(table_config,function (kk,rrow) {
            // 这里把table_config引进来是为了解决字段乱序的问题
            // 这样以后如果想要调整顺序的话就可以随便更换了，直接换后台配置文件就行了。
            // kk还是索引值，rrow: {'q':'id','title':'ID'}样式的字典
            var td = document.createElement('td');
            // 如果rrow.q是有值的那么rrow.q就是我们要的字段名称，将这个作为key的话填入到row中
            // 就可以根据这个key值拿到对应的value填入到td中就可以了。
            // if(rrow['q']){
            //     td.innerHTML = row[rrow.q];
            // }else{
            //     console.log(rrow.text);
            //     td.innerHTML = rrow.text;
            // }

			/*
			* 这里对上述的插入数据的方法做了一点扩展，在后台传过来的table_config中海油text这个key
			* text.tpl对应的是模板，而text.kwargs对应的则是参数，可以参考下面的示例：
			* rrow.text.tpl = "asdasd{n1}asd"
			* rrow.text.kwargs = {'n1':'@id', 'n2':'as'}
			* 我想要一种效果就是虽然后台拿过来的值是固定的，但是我在前台展示的时候可以加点料。
			* 这个模板由我自己来定义，但是显示以及模板内容替换由前端来做。
			*/
            // 首先定义一个空的字典
            var newKwargs = {};
            // 遍历传递过来的参数,这里我们自定义了一种模式，模板以”@+字段名“形式的组合的会被动态的
            // 替换成字段名的数据，当时并不是所有的数据都需要被替换成动态数据，因此要原原本本显示的
            // 的数据就不加@符号了，我把@符号作为是否替换动态数据的依据
            $.each(rrow.text.kwargs, function (tpkey,tpvalue) {
                var av = tpvalue;
                if(tpvalue[0] === "@"){
                    // 模板是以@开头的，比如@username,@id这类的。判断方法也很简单直接用字符串切割。
                    // 如果是以@开头的那么就那么就把后面的字段名拿出来，否则av就等于原原本本的值就可以
                    // 通过substring取到@后面的字段值，然后作为key值在row中取到真实的数据。
                    av = row[tpvalue.substring(1,tpvalue.length)];
                }
                // 更新字典，比如newKwargs['n1'] = 22;这样的
                newKwargs[kkk] = av;
            });
            // 我们在上面扩展了js的string对象，让它可以像python字符串那样进行format格式化。
            // 替换完了以后tpl中的什么n1,n2什么的都被替换成了最终可以直接显示的值了。
            var newText = rrow.text.tpl.format(newKwargs);
            td.innerHTML = newText;
            $(tr).append(td)
        })
    });
    $('#tbbody').append(tr);
}
```

上面这个是动态定制列，对于列上面的内容可以通过格式化进行自定制。现在有一个需求是会去数据库去取，但是不想让这个字段在页面显示出来。因此需要对这个table_config进行扩展，添加一个display字段标明是否显示。比如修改了业务线以后应该发到后台的是业务线的id，但是这个id根本不需要在前台去显示，因此我们可以增加一个display字段去控制。加完以后table_config中的每一个小字典应该是这种形式的：

```python
{
    'q': 'id',
    'title': 'ID',
    'display': False,
    'text': {
        'tpl': '{n1}',
        'kwargs': {'n1': '@id'},
    }
},
```

然后在对应的Inittableheader和inittablebody中添加上if判断就可以了。请参考完整版代码



封装



jquery的扩展

```javascript
jq.extend({
    xx:function(arg){
        
    }
})

$.xx(123)
```

