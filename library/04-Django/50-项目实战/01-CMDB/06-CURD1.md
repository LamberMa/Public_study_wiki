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
            <thead id="tbhead"></thead>
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

- q：即query，要查询的字段，比如主机名的q就是hostname，id的q就是id；因为我们这里完全是借助的django_orm去操作的。因此这里也可以使用跨表，反向查询的。当然这里的值也可以是None，None指的是这个字段不需要去数据库查询的时候设置的值；因为有的时候我们可能要在标题显示一列操作，这一列操作和数据本身没有什么关系，也不用去数据库拿值。

- title：要显示在标题的名称。

- display：是否显示当前字段，有的时候字段需要取，但是不一定要显示，比如id字段，我们可以去用来提交数据等，但是没必要显示，有的情况下可能也不是连续的，所以没有实际的意义就可以不显示

- text：模板，根据模板我们可以定制最终在表格中展示的数据的最终形式。有的时候我们并不想让数据原原本本的就显示从数据库取出来的样子，我们有时候会给数据加上一个后缀或者前缀然后再在前端页面显示，这里就用到了模板，这个操作加强了我们的数据展示的可定制性。

  ```python
  # text本身就是一个小字典，其内部包含tpl以及kwargs两个key，其中tpl表示要展示在前端表格的模板，kwargs表示要填充进模板的参数。比如下面这个示例实际的tpl展示的就是一个a标签，然后nid会被对应的id替换到这个a标签中。这样就可以保证每个a标签中的nid都是跟随数据库中的id一致。
  # 这里@id其实就是要替换的值为id字段的值，具体的处理我们会放到前端去做内容的匹配，你只要知道这里的@后面的其实和query的内容是一个意思就可以了。
  'text': {
      'tpl': '<a href="/backend/del?nid={nid}">删除</a>',
      'kwargs': {'nid': '@id'},
  },
      
  # 
  ```

简单的table_config说明完毕，当然这只是展示的一个页面或者仅仅是一个服务，比如在CMDB中，我要展示资产表，我有这样的一个table_config，当展示服务器表或者其他表的时候对应的字段根据models设计的不一样也是会发生变化的，因此针对不同的服务需要设置不同的table_config。

### 取值&传值

现在我们设计好了要拿的字段，接下来就是需要在数据库去取了。

```python
# 取的话还是很简单的，直接去遍历table_config然后过滤掉q为None的情况，因为查询的字段不允许出现None值。使用列表生成式构造一个values_list。
values_list = [row['q'] for row in table_config if row['q']]
```

取数据的话那么就简单多了：

```python
# 取的时候支持*args列表，或者**kwargs字典，我们就可以把取号的values_list都扔在这里。
# 最后拿到的这个资源列表就是我们最终想要的这么一个资源的query_set。
resource_list = models.Server.objects.values(*values_list)
```

因为具体数据的生成是靠前端JS去动态的生成，因此我们将取出的数据值直接序列化一下丢给前端就可以了。这里提供了两种方法，其中一种借用django，另外一种自定制：

1. 使用Django的序列化模块

   ```python
   # 可以使用序列化模块进行序列化，
   v = models.Server.objects.all()
   from django.core import serializers
   # serializers可以针对queryset对象进行序列化。
   data = serializers.serialize('json', v)
   ```

2. 自己序列化

   ```python
   # 自己序列化想到的无非就是json.dumps一下，然后return给前端，不过json.dumps的时候需要注意几个问题，首先queryset对象是不可以序列化的，因为我们在上面的取出来的内容就是一个queryset，所以在返回给前端的时候要list一下，强制做一下类型的转换。或者你取的时候你就别取queryset就得了。直接拿列表
   # 还有一个问题就是如果你取出来的值包含datetime对象的话同样也会造成序列化失败，同queryset，报错内容为：Object of type 'xxx' is not JSON serializable。因此需要我们自己对默认的JSON做一个二次扩展，代码内容如下：
   
   from datetime import date, datetime
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

然后我们把数据返回给前端，前端就可以拿到数据了。

```python
ret = {
    'server_list': list(server_list),
    'table_config': table_config,
}
```

完整视图函数参考：

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

## JS端的简单处理

现在已经可以通过访问后端拿到传递过来的数据了，那么应该如何处理呢？表头和表数据分别填充；

### 拿数据

```javascript
$(function () {
    // 一开始执行的一个初始化函数
    initial();
});

// 后端发送获取数据的js
function initial() {
    $.ajax({
        url:'/backend/curd_json.html',
        type:'GET',
        dataType: 'JSON',
        success:function (arg) {
            // 这里分别定义了两个初始化函数一个创建表头，一个填充数据内容。
            // 创建表头，将我们的定制的配置文件table_config传递过去。
            initTableHeader(arg.table_config);
            // 为数据表填充数据，将资产和table_config传递过去，根据table_config填充数据
            initTableBody(arg.server_list,arg.table_config);
        }
    })
}
```

### 填充表头数据

```javascript
function initTableHeader(table_config) {
    /*
    * 我现在要通过这个table_config动态的，因为table_config要显示啥使我们在后端定义好的
    * 插入表格的表头，也就是th标签；遍历table_config，k为索引值，v为含有标题的小字典
    */
    // 生成tbhead中的一行，一个tr标签。
    var $tr = $('<tr>');
    $.each(table_config,function (k,v) {
        var tag = document.createElement('th');
        tag.innerHTML = v.title;
        $('#tbhead').find('tr').append(tag);
    })
    $('#tbhead').append($tr);
}
```

![](http://tuku.dcgamer.top/18-8-16/75017048.jpg)

### 填充表格内容

```javascript
// 为字符串创建可以像Python那样的字符串的格式化方法
String.prototype.format = function (args) {
    return this.replace(/\{(\w+)\}/g, function (s,i) {
        return args[i];
    });
};

function initTableBody(server_list,table_config) {
    /*
    * server_list从后台发回来的数据是一个列表套字典的形式，每一个小字典都
    * 是一条资产信息。我们遍历具体的每一条资产拿数据。
    */
    $.each(server_list,function (k,row) {
        // 遍历server_list列表，k为索引值，row是一条资产信息，形如：
        // row:{"id": 1, "hostname": "lamber的MacBookPro"},
        // 每循环一条资产数据加一行，生成一个tr
        var tr = document.createElement('tr');
        $.each(table_config,function (key, tbconfig_value) {
            // 这里把table_config引进来是为了解决字段乱序的问题，按照table_config的设置
            // 在我们传过来的server资产中去拿数据，这样显示的数据就不会是乱序的，而且显示
            // 的顺序我们也是可以自己定义的，只要改后端table_config的对应项的位置就可以了。
            // tableconfig_value: {'q':'id','title':'ID'}样式的字典
            // 如果让显示再显示，不让显示的就不显示。判断display属性。
            if (tableconfig_value.display){
                // 创建一个td
                var td = document.createElement('td');
                /**
                 * 如果rrow.q是有值的那么rrow.q就是我们要的字段名称，将这个作为key的话填入到
                 * row中，就可以根据这个key值拿到对应的value填入到td中就可以了。
                 * if(tabconfig_value['q']){
                 *     td.innerHTML = row[rrow.q];
                 * }else{
                 *     console.log(rrow.text);
                 *     td.innerHTML = rrow.text;   
                 * }
                 */
                /* 这里并不采用上述的方法，为了保证我们之前说过的可以自定制内容的显示因此要把text中的
                * kwargs参数项目利用起来。这里对上述的插入数据的方法做了一点扩展；
                * text.tpl对应的是模板，而text.kwargs对应的则是参数，可以参考下面的示例：
                * rrow.text.tpl = "asdasd{n1}asd"
                * rrow.text.kwargs = {'n1':'@id', 'n2':'as'}
                */
                // 首先定义一个空的字典
                var newKwargs = {};
                // 遍历传递过来的参数,这里我们自定义了一种模式，模板以”@+字段名“形式的组合的会被动态的
                // 替换成字段名的数据，当然并不是所有的数据都需要被替换成动态数据，因此要原原本本显示的
                // 的数据就不加@符号了，我把@符号作为是否替换动态数据的依据，这个是我们自定义的。
                $.each(tableconfig_value.text.kwargs, function (tpkey,tpvalue) {
                	var item = tpvalue;
                    if(tpvalue[0] === "@"){
                    // 模板是以@开头的，比如@username,@id这类的。判断方法也很简单直接用字符串切割。
                    // 如果是以@开头的那么就那么就把后面的字段名拿出来，否则item就等于原原本本的值就行
                    // 通过substring取到@后面的字段值，然后作为key值在row中取到真实的数据。
                        item = row[tpvalue.substring(1,tpvalue.length)];
                    }
                    // 更新字典，比如newKwargs['n1'] = 22;这样的
                    newKwargs[tpkey] = item;
            	});
                // 然后我们想让JavaScript像python字符串那样格式化，因此需要扩展js的string对象
                // 具体可以查看最上方的扩展方法，替换完了以后tpl中的变量都被替换成了最终数据值
                var newText = rrow.text.tpl.format(newKwargs);
                // newText就是我们的最终的替换完变量要显示的文字，动态的为这个td设置上
            	td.innerHTML = newText;
                // 为tr添加一列
            	$(tr).append(td)
    		}
        });
        // 循环完成以后把整条资产加到表格中，
   	    $('#tbbody').append(tr);
    });
}
```

现在其实就可以简单的显示出来我们的要的内容了。

![](http://tuku.dcgamer.top/18-8-16/22947558.jpg)

### 封装

最后我们想把这个小的插件封装成一个js组件方便以后项目的调用，因此采用jquery的插件扩展功能。这个项目中存在变数的有url，这是访问后端api数据的，这个内容是变化的。

```javascript
// 声明一个匿名函数，给这个匿名函数传递一个jQuery的参数。匿名函数会自执行。
(function(jq){
    function initial(url){……}
    function initTableHeader(table_config){……}
    function initTableBody(server_list, table_config){……}
    
    // 对jquery进行扩展
    jq.extend({
        curd: function(url){
            initial(url);
        }
    })
})(jQuery)
```

那么前端想使用这个插件的时候，直接引入这个插件然后：

```javascript
# 直接这样调用，然后传入api的地址就行了，这样这个插件就有一定的通用性了
$.curd('/backend/curd_json.html')
```

为什么要把这些功能封到一个匿名函数中呢，因为这个匿名函数的作用域包含上述的函数在外部都是不可调用的，唯一的入口也就是我们自己定义的这个扩展的jq的curd这个方法可以用到。