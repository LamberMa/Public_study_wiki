# 增删改查组件2

> 上一节已经可以进行数据的简单展示了，并且我们使用jquery的拓展将这个curd封装成了插件。我引入以后直接调用插件的curd方法然后再传入一个url就可以了。接下来对更复杂的情况进行扩展说明。

## 扩展下拉框数据

像服务器列表这种一些数据就是固定的显示的数据，不过如果是资产表（Asset）这种表中就会存在选择的内容，比如：

```python
# 截取自asset model设计
device_type_choices = (
    (1, '服务器'),
    (2, '交换机'),
    (3, '防火墙'),
    (4, '路由器'),
)
device_status_choices = (
    (1, '上架'),
    (2, '在线'),
    (3, '离线'),
    (4, '下架'),
)
device_type_id = models.IntegerField(choices=device_type_choices, default=1, verbose_name="资产类型")
device_status_id = models.IntegerField(choices=device_status_choices, default=1)
```

一个资产在是服务器那么device_type_id在数据库实际保存的就是1，同理资产状态保存的也不是上线下线这种汉字，而是对应的1，2，3，4这种数值。按照之前的逻辑，那么取出来的话显示在前端的就是意义不明的数字，因此针对这一部分要进行进一步的扩展。

### table_config扩展

给前端穿过去的每一条资产信息都在server_list里，对应的类似于device_type_id的这种字段的值都是数字，而不是真正的数据，因此在前端table_config这里做一些扩展；

```python
{
    'q': 'device_type_id',
    'title': '资产类型',
    'display': True,
    'text': {
        'tpl': '{n1}',
        'kwargs': {'n1': '@@device_type_choices'},
    },
    'attrs': {
        'global-key': 'device_type_choices',
    }
},
```

1. kwargs新增一种双@符号的形式，这种规则是我自己定制的，用来匹配这种特殊类型的字段。
2. attrs：新增一个attrs字段，传递一些其他的必要信息，这里在attrs中新增一个global_key，这个key对应的value我们填写的就是这个字段对应的choices选择。名称要和model模型中相对应。
3. 最后我们将这个内容一并发到前端去

```python
# 在返回给前端的ret字典中新家一个global_dict，对应的内容就是table_config中的global_key
# 当然值的话我们其实是在models模型类中写死的，直接拿就行了。最后一起发送到前端。
ret = {
    'server_list': list(asset_list),
    'table_config': asset_table_config,
    'global_dict': {
        'device_type_choices': models.Asset.device_type_choices,
    },
}
```

### 前端JS扩展

为了能在前端这个插件中整体使用这个传过来的global变量，我们在匿名函数中设置一个GLOBAL_DICT的变量用来接收这个传递过来的内容

```javascript
(function(jq){
    var GLOBAL_DICT = {};
    ………………
 })(jQuery)
```

变量设置好了，就应该把设置好的内容填充到这个变量里去，最好的时机就是在initial初始化的时候，因此对初始化函数进行进一步改写，在初始化的时候我们去遍历传过来的global_dict，然后循环填充我们设置的字典，其中的key就是device_type_choices这种的key，value就是可选项：

```javascript
function initial(url) {
    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'JSON',
        success: function (arg) {
            /*
            server_list: 相关资产信息
            table_config: 自定义的表配置
            global_dict: 相关的状态信息
            * */
            $.each(arg.global_dict, function (k, v) {
                GLOBAL_DICT[k] = v;
            });

            initTableHeader(arg.table_config);
            initTableBody(arg.server_list, arg.table_config);
        }
    })
}
```

对数据填充函数inittablebody进行扩展，加上对双@符号的判断：

```javascript

function initTableBody(server_list, table_config) {
    $.each(server_list, function (k, row) {
        var tr = document.createElement('tr');
        tr.setAttribute('nid', row.id);
        $.each(table_config, function (key, tbconfig_value) {
            if (tbconfig_value.display) {
                var td = document.createElement('td');
                /* 在td标签中添加内容 */
                var newKwargs = {};
                $.each(tbconfig_value.text.kwargs, function (tpkey, tpvalue) {
                    var item = tpvalue;
                    // 多加一个判断，如果说前两个字符是以'@@'开头的话。
                    // 那么就取到双@后面的字段值然后去我们的GLOBAL_DICT中拿值就可以了。
                    if (tpvalue.substring(0, 2) === '@@') {
                        // 拿到当前这个td的所有可选值
                        var choices = GLOBAL_DICT[tpvalue.substring(2, tpvalue.length)]
                        // 拿到实际可选值的id，假如这个字段是device_type_id，那么q取到的值
                        // 就是对应的1，2，3或者4.然后循环遍历判等，如果相等赋值就完事了。
                        var nid = row[tbconfig_value.q];
                        $.each(choices, function (gk, gv) {
                            // 这里要判断一下nid是否存在，因为这个字段虽然是选择字段
                            // 但是允许不选择。可以留空的。如果我留空了，那么数据库就取不到数据
                            // 自然gv[0]也不会等于nid，因此单独加一个判断，否则会显示我们
                            // 定制的双@的字符串，意义不明。
                            // 或者有一个更好的方法，在数据库设置一个值显示为无，默认值为这个
                            if (nid) {
                                if (gv[0] === nid) {
                                	item = gv[1];
                            	}
                            }else{
                                item = ''
                            }  
                        })
                    // 这里维持原来的判断
                    } else if (tpvalue[0] === "@") {
                        item = row[tpvalue.substring(1, tpvalue.length)];
                    }
                    // 每遍历一列就更新一个字典
                    newKwargs[tpkey] = item;
                });
                var newText = tbconfig_value.text.tpl.format(newKwargs);
                td.innerHTML = newText;
                $(tr).append(td)
            }
        });
        $('#tbbody').append(tr);
    });
```

到目前为止数据已经可以正常显示了，下面开始增加以下操作这些内容的按钮，来对这个插件的功能进行进一步扩展。

## 功能按钮的设计

> 设计功能按钮的想法是能让用户在前端就可以直接对资源进行自由的增删改查的一些操作，可以让数据的显示和操作同屏完成，使操作更加简便快捷。

这里借用BootStrap的按钮组来实现界面的显示。有各种各样的功能，针对这些功能，一个一个的说。。

```html
<div class="btn-group row" role="group">
    <button id="checkAll" type="button" class="btn btn-default">全选</button>
    <button id="checkReverse" type="button" class="btn btn-default">反选</button>
    <button id="checkCancel" type="button" class="btn btn-default">取消</button>
    <button id="jobAdd" type="button" class="btn btn-primary" data-toggle="modal" data-target="#myModal">新增报事
    </button>
    <button id="multiDel" type="button" class="btn btn-default">删除</button>
    <button id="refresh" type="button" class="btn btn-default">刷新</button>
    <button id="save" type="button" class="btn btn-default">保存</button>
    <button id="editmodelornot" type="button" class="btn btn-default">进入编辑模式</button>
</div>
```

### 全选

全选这个功能相对简单很多，找到tbbody下的checkbox都给它勾上就行了。

```javascript
$('#checkAll').click(function () {
    var $tbbody = $('#tbbody');
    $tbbody.find(':checkbox').prop('checked', true);
});
```

### 反选

反选也很简单，就是多了一个判断，找到tbbody下的所有checkbox，勾上的去掉钩，没钩的给勾上。

```javascript
$('#checkReverse').click(function () {
    $(tbbody).find(':checkbox').each(function () {
        if ($(this).prop('checked')) {
            $(this).prop('checked', false);
        }else {
            $(this).prop('checked', true);
        }
    })
});
```

### 取消

找到tbbody下所有勾上的，然后去掉勾就完事了。

```javascript
$('#checkCancel').click(function () {
	$(tbbody).find(':checkbox').each(function () {
        if ($(this).prop('checked')) {
            $(this).prop('checked', false);
        }
	})
});
```

### 删除

在书写table_config的时候，第一列为选择列，放了一堆checkbox，通过tpl我们把id也带了过去，这样在选中的时候那么可以通过这个input的value值去取到这条资产记录的id了；

```javascript
{
    'q': None,
    'title': '选择',
    'display': True,
    'text': {
        'tpl': '<input type="checkbox" value="{n1}">',
        'kwargs': {'n1': '@id'}
    },
    'attrs': {
        'edit-enable': 'false',
    }
},
```

JS处理：定义一个idList空数组，然后找到tbbody下的选中的标签，去遍历，这里的每一个$(this)是那个checkbox的input框，然后我们直接去value就可以了，遍历push到后端。

这里有一个csrftoken的问题，出于安全的考虑，django会对POST、PUT、DELETE这几种操作进行csrdtoken的检查。POST可以将其放到post参数中，但是django对put和delete只能通过检查header的方式检查csrf_token。因此在提交数据的时候要在header中封装csrftoken进去。这里放两个内容参考，对这一块的内容处理进行了拓展：

- [使django支持PUT，DELETE方案](https://blog.csdn.net/weixin_35993084/article/details/80778921)
- [Ajax请求中提交csrfToken | django中csrf的其他使用 | Django](http://www.cnblogs.com/pymkl/articles/9209618.html)

```javascript
$('#multiDel').click(function () {
    var idList = [];
    $('#tbbody').find(':checked').each(function () {
        idList.push($(this).val());
    });
    $.ajax({
        url: url,
        // form表单只能提交get或者post请求，但是对于ajax delete也是ok的。
        type: 'delete',
        headers: {"X-CSRFToken": $(csrftoken).val()},
        data: JSON.stringify(idList),
        success: function (arg) {
            console.log(arg)
        }
    })
});
```

这样我在后端其实就可以拿到对应的id数值了，只不过django并没有对delete请求进行封装，所以我们只能自己去request.body里去取数据了，注意取过来的是字节类型的，转码一下。

```python
def showwork_ajax(request):
    """向前端发送具体的消息"""
    if request.method == "DELETE":
        # 针对delete请求，我们只能去request.body中自己取数据了。
        del_id_list = request.body.decode('utf-8')
        print(del_id_list)
        # 这里删除的操作就省略了。
        # models.xx.objects.delete(*del_id_list)
        return HttpResponse('...')
    
    …………………………略
```

### 编辑模式的设计

> 针对编辑模式的设计，我想设计这样一个按钮，点击按钮进入编辑模式，可以编辑的内容当这条记录被选中的时候，可以被修改的部分就会进入修改状态。然后就可以进行编辑了

#### 编辑模式？

何谓编辑模式，比如下面这样一条记录：

![](http://tuku.dcgamer.top/18-8-17/18194609.jpg)

其中资产类型和状态都是可选的，那么进入编辑模式的时候应该是一个select框，机柜号和机房应该是对应的生成一个input框，让我们可以输入想要的值，不需要编辑的字段还让它保持原样，如图：

![](http://tuku.dcgamer.top/18-8-17/66634404.jpg)

#### 模式实现

设计思路为，需要多选的就把当前td的内容替换掉生成一个select框，然后把多个选项遍历依次生成option标签塞到select标签下。

##### 扩展table_config

刚才说到的，如果这些内容都是用前端来去生成的，前端并不知道你哪些内容该编辑，哪些内容不该编辑，哪些内容应该被替换成input框，哪些内容应该被替换成select框，这些内容其实前端是不知道的，我们应该在后端告诉前端，这个时候又要在table_config中加字段了。

```python
{
    'q': 'device_type_id',
    'title': '资产类型',
    'display': True,
    'text': {
        'tpl': '{n1}',
        'kwargs': {'n1': '@@device_type_choices'},
    },
    'attrs': {
        'edit-enable': 'true',
        'edit-type': 'select',
        'global-key': 'device_type_choices',
        'origin': '@device_type_id'
    }
},
```

不需要在table_config中添加更多的字段，只需要继续扩充attrs这个字典就可以了。

- edit-enable：是否可以编辑，这个要告诉前端，当前字段是否可以编辑
- edit-type：告诉前端你这个字段应该是一个input框还是一个select选择框
- origin：标识原始的数据值，@device_type_id会在前端被替换成对应的值。该字段的作用是当字段的值发生变化以后有一个可对比的原值参照，如果值变了才提交，值不变的话那么就不用提交。

##### 前端JS逻辑实现

在上面扩展table_config以后新增的这些属性如何让它在前端体现出来可以拿到我们提供的数据呢？这就需要在初始化表格时候把我们给的所有的属性值作为每一列（td）的属性值在生成表格的都作为属性加到对应的td标签上去，因此对initTablebody进行进一步的修改，添加为td增加属性的逻辑：

```javascript
function initTableBody(server_list, table_config) {
    $.each(server_list, function (k, row) {
        var tr = document.createElement('tr');
        // 为这一行设置一下id，让我们知道每一行资源实际的id是什么
        tr.setAttribute('nid', row.id);
        $.each(table_config, function (key, tbconfig_value) {
            if (tbconfig_value.display) {
                var td = document.createElement('td');
                /* 在td标签中添加内容 */
                var newKwargs = {};
                $.each(tbconfig_value.text.kwargs, function (tpkey, tpvalue) {
                   // 这里是遍历kwargs，根据模板生成数据值的操作，太多就直接省略了   
                });
                var newText = tbconfig_value.text.tpl.format(newKwargs);
                td.innerHTML = newText;

                /* 这里就是我们新添加的逻辑，为td属性设置属性的逻辑 */
                $.each(tbconfig_value.attrs, function (attrkey, attrvalue) {
                    if (attrvalue[0] === '@') {
                        attrvalue = row[attrvalue.substring(1, attrvalue.length)];
                    }
                    td.setAttribute(attrkey, attrvalue);
                });
            $(tr).append(td)
           }
       });
       $('#tbbody').append(tr);
    });
}
```

增加完了以后的结果就是如图所示的，这样我们就可以取到对应的属性值了：

![](http://tuku.dcgamer.top/18-8-17/27557887.jpg)

在完成逻辑之前首先设计一个总的可编辑按钮的开关，用于标识是否进入编辑模式，如果进入编辑模式以后，那么选中的行应该会进入可编辑的状态，如果在非编辑模式下，即使选中了改行，那么也不会进入编辑模式。针对这个编辑模式的按钮设计很简单，整一个按钮，进入编辑模式之前是一个颜色，进入编辑模式之后是一个颜色，进入不同的模式以后分别执行不同的方法就ok。

```javascript
/*
1、Bootstrap提供了很多的按钮样式，直接加上对应的btn class就可以让按钮显示对应的样式，这里我让进入编辑模式以后button的样式变成btn-warning的样式
2、因此判断是否进入编辑模式的标准就可以通过是否有这个btn-warning这个class来进行判断了。当有这个类的时候，就应该退出这个模式，并一并修改按钮上的问题。同理，没有这个类的时候应该加上这个类，并把按钮上的文字改为“退出编辑模式”
3、进入编辑模式以后并不是所有的记录都应该是编辑状态，应该是你选中了那一条记录，那条记录才应该进入编辑状态，因此在进入编辑状态后还应该在判断一下这些记录哪些记录是被选中的。只有选中的记录才应该进入编辑模式允许用户编辑
4、同理退出编辑模式的时候也是刚才选中的那些退出编辑模式。
*/
$('#editmodelornot').click(function () {
    if ($(this).hasClass('btn-warning')) {
        // 如果有这个css class的话那么应该退出这个编辑模式
        $(this).removeClass('btn-warning');
        $(this).text('进入编辑模式');
        $('#tbbody').find(':checkbox').each(function () {
            var $tr = $(this).parent().parent();
            if ($(this).prop('checked')) {
                trOutEdit($tr);
            }
        })
    } else {
        $(this).addClass('btn-warning');
        $(this).text('退出编辑模式');
        // 还有一个问题就是我在未进入编辑模式的时候选中一些数据，然后再点进入编辑模式发现并不会变
        // 化因此我们在进出编辑模式的时候不只是改改字换换样式啥的，也要做基础的判断是否选中。
        $('#tbbody').find(':checkbox').each(function () {
            // $(this)是当前这个input type为checkbox的input框
            // 它的父级的父级也就是这一条资源记录的tr标签我们要传递给trIntoEdit
            var $tr = $(this).parent().parent();
            // 只有选中状态的tr才应该进入编辑模式。
            if ($(this).prop('checked')) {
                trIntoEdit($tr);
            }
        })
    }
});
```

在上面进入和退出编辑模式的时候分别调用了trIntoEdit和trOutEdit函数，这两个函数我们还没有定义，因此我们需要在上面定义一下这两个函数来处理进出编辑模式的具体逻辑

**trIntoEdit**

这个函数需要一个参数，就是我们要操作哪一条资源？因此在上面循环遍历的时候要找到对应记录的tr，然后传递进来。

```javascript
function trIntoEdit($tr) {
    // 找到这条记录下可以编辑的td标签然后开始遍历
    $tr.children('td[edit-enable="true"]').each(function () {
        // $(this)就是循环的每一个td对象
        // 如果传过来的没有设置的话就是undefined，设置的就是设置的值。
        
        // 获取一下当前的td的editype
        var editType = $(this).attr('edit-type');
        if (editType === 'select') {
            // 如果type是select，那么生成下拉框
            var $tag = $('<select>');
            // 通过我们设置的gloabal-key的属性去直接拿GLOBAL_DICT中的选择值。
            var device_type_choices = GLOBAL_DICT[$(this).attr('global-key')];
            // 设置一个原始值用来作为判断数据是否被修改的依据
            var origin = $(this).attr('origin');
            $.each(device_type_choices, function (key, value) {
                // value才是真正的数据，v.0是id，v1是名称，比如v.0=1,v.1表示服务器
                var $option = $('<option>');
                $option.text(value[1]);
                $option.val(value[0]);
                // 为select框设置一个默认值，比如进入编辑模式之前是服务器
                // 那么进入编辑模式只有应该默认的选项也应该是服务器，因此这里做一下判断。
                if (value[0] == origin) {
                    $option.prop('selected', true);
                }
                $tag.append($option);
            });
            // 把这个select框内容放到td下，此时的$(this)就是这个td，看最顶层的each。
            $(this).html($tag);
        } else {
            // 如果editType不是select，就目前来讲只有input因此不需要做额外的条件判断    
            // 获取原来的td标签的内容
            var text = $(this).text();
                
            // 创建一个input标签并设置里面的内容。
            var $tag_input = $('<input>');
            $tag_input.val(text);
            $(this).html($tag_input);
        }
    })
}
```

此时我们进入编辑模式以后，再随便选中一个项目以后就会发现此时对应的内容都变成可编辑的了。









这里删除可以单个删除也可以批量删除，思路为找到勾选的内容，然后把勾选的加到一个数组里，统一传到后台就可以了。那么传递到后台的应该是什么？应该是这条资产的id信息，而不是资产的内容。但是这个id应该从哪里取，如果说能通过选中的标签通过它的value直接拿到这个资产的id的话那就好了。因此在初始化表结构的时候就应该做这个操作，因此对inittablebody加一个设置id的操作：

```javascript
function initTableBody(server_list, table_config) {
        // 同tbhead
        // $(tbbody).empty();
        $.each(server_list, function (k, row) {
            var tr = document.createElement('tr');
            // 在这里添加一条，设置一点id，内容就是nid。
            tr.setAttribute('nid', row.id);
            $.each(table_config, function (key, tbconfig_value) {
				// 略略略略略略略略略略略略
            });
            $('#tbbody').append(tr);
        });

    }
```

