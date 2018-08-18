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
    // 记得现在前端模版上放上{% csrf_token %}
    var csrftoken = $('input[name=csrfmiddlewaretoken]');
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
        'origin': '@device_type_id',
        'name': 'device_type_id'，
    }
},
```

不需要在table_config中添加更多的字段，只需要继续扩充attrs这个字典就可以了。

- edit-enable：是否可以编辑，这个要告诉前端，当前字段是否可以编辑
- edit-type：告诉前端你这个字段应该是一个input框还是一个select选择框
- origin：标识原始的数据值，@device_type_id会在前端被替换成对应的值。该字段的作用是当字段的值发生变化以后有一个可对比的原值参照，如果值变了才提交，值不变的话那么就不用提交。
- name：如果以后数据提交了的话对应提交到数据库的哪个字段呢？这里就是一个标识

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
                    // 略略略略略略略略略略略略略略略
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

**trOutEdit**

对于退出编辑模式，同样需要传递一个参数，这个参数其实就是我们操作的这一行的tr，传递一个当前行的tr对象过来就可以了，同trIntoEdit。

```javascript
function trOutEdit($tr) {
    $tr.children('td[edit-enable="true"]').each(function () {
        var editType = $(this).attr('edit-type');
        if (editType === 'select') {
            // 首先要拿到默认选中的值。
            /**
             * DOM对象转换为jq对象，只要用$()把dom对象包装起来就可以得到了。
             * jq对象转换为dom对象的时候在后面加一个"[0]"就可以了。
             * 这里将select的jq对象转换为dom对象调用selectedOptions方法。
             * */
            // 如果td内容是一个select框的话，那么在退出之前首先要获取用户到底选中了哪一个
            var option = $(this).find('select')[0].selectedOptions;
            // 然后将这个选中的值以一个名为new-origin的属性记录在这td上。
            // 这么做的原因是后面如果做了修改还要提交到后台，new-origin和origin要进行比较
            // 如果值相等说明根本就没改，那么发送请求的时候这个就可以pass，new-origin也是一个作为
            // 判断是否修改的一个标准。
            $(this).attr('new-origin', $(option).val());
            // 然后把这个td设置为这个option的显示的值。text是option的值，比如“服务器”,val是对应id
            $(this).html($(option).text());
        } else {
            // 如果不是select框直接先拿值，然后把input框干掉把数值塞在这就行了。
            var input_val = $(this).find('input').val();
            $(this).html(input_val);
        }
    })
}
```

书写完两个函数以后，此时我们进入编辑模式以后，再随便选中一个项目以会发现此时对应的内容并没有变化，这是因为我们在设置编辑按钮的时候只是检测编辑模式下哪些选中了给它变成编辑模式，如果是编辑模式下，我后来又手动选中的内容就不会发生变化，因此我们还需要单独给checkbox绑定事件：

```javascript
# 注意，这里要用on的方式绑定数据，直接使用click(function(){})的方式是绑定不上的，这种方式要求得先有数据，因此要用事件的委派。这个时候不管你是先生成的还是后生成的都可以绑定的上。
$('#tbbody').on('click', ':checkbox', function () {
    /**
     * $(this)表示当前的checkbox标签
     * 1.点击首先检测是否进入编辑模式，如果是，就退出，不是就进入
     */
    var $tr = $(this).parent().parent();
    // 否则什么都不做，因为本来就是直接点不进入编辑模式的。
    if ($('#editmodelornot').hasClass('btn-warning')) {
        if ($(this).prop('checked')) {
            // 进入编辑模式
            trIntoEdit($tr);
        } else {
            // 退出编辑模式
            trOutEdit($tr)
        }
    }
});
```

这样操作完成以后，我们就可以进行简单的编辑模式的进出编辑模式了。不过对应的上面的很多内容要进行进一步的扩展，比如全选，全选的时候要判断是否是编辑模式，如果是编辑模式的话就该进入编辑模式，如果不是的话就应该什么都不做，同样的反选，取消操作也要做扩展。

#### 扩展全选/反选/取消

##### 扩展全选

扩展内容无非也就是针对编辑模式多了一层判断：

1. 首先全选的时候会遍历每一行，然后针对每一行做内容的判断，首先判断是否进入编辑模式，如果不在编辑模式的话，我们就逐行遍历然后不管你之前勾上没勾上吧，统一再给你勾一遍。
2. 如果说在编辑模式的话，我们需要判断在全选之前是否有已经勾选过的。如果没有勾选的就给它勾上，同时进入编辑模式，执行trIntoEdit；如果是已经勾选上的tr，那么这一行本身就应该已经处在一个编辑模式了，我们不要再调用一次trIntoEdit方法去执行了。
3. 为什么在编辑模式全选的时候要单独判断有没有之前就勾选的内容呢？还记得trIntoEdit的逻辑么，假如edit_type为input的时候，在进入编辑模式的时候首先获取到`$(this)`的text值然后新建一个input标签，然后将这个input标签的value值设置为text的内容，注意，此时设置的是value值，但是input的text内容是空的，空的，空的！所以如果又执行一遍的话，你就会发现input框变成空的了，啥都没有了。很蛋疼；此时如果再执行trOutEdit退出编辑模式的时候，value为空，那么最后设置的td就是一个空值。总之，这里注意的地方就是，td有值那是因为td的text有值，input有值那是因为input的value有值，注意这两点别搞混。

```javascript
$('#checkAll').click(function () {
    var $tbbody = $('#tbbody');
    /**
     * 首先全选的时候应该让这一行进入编辑模式，但是我们发现通过事件触发和我们手动点击不一样
     * 手动点击会触发编辑模式，但是事件触发checked并不会进入编辑模式，因此我们需要手动调用一下
     * */
     if ($('#editmodelornot').hasClass('btn-warning')) {
         $tbbody.find(':checkbox').each(function () {
             if (!$(this).prop('checked')) {
                 $(this).prop('checked', true);
                 var $tr = $(this).parent().parent();
                 trIntoEdit($tr)
             }
          })
     } else {
         $tbbody.find(':checkbox').prop('checked', true);
     }
 });
```

##### 扩展反选

同全选，加一个针对编辑模式的判断。

```javascript
$('#checkReverse').click(function () {
    if ($('#editmodelornot').hasClass('btn-warning')) {
        $('#tbbody').find(':checkbox').each(function () {
            var $tr = $(this).parent().parent();
            if ($(this).prop('checked')) {
                $(this).prop('checked', false);
                trOutEdit($tr);
            } else {
                $(this).prop('checked', true);
                trIntoEdit($tr);
            }
         })
    } else {
        $('#tbbody').find(':checkbox').each(function () {
            if ($(this).prop('checked')) {
                $(this).prop('checked', false);
            } else {
                $(this).prop('checked', true);
            }
         })
    }
});
```

##### 扩展取消按钮

```javascript
$('#checkCancel').click(function () {
    if ($('#editmodelornot').hasClass('btn-warning')) {
        $('#tbbody').find(':checkbox').each(function () {
            if ($(this).prop('checked')) {
                $(this).prop('checked', false);
                var $tr = $(this).parent().parent();
                trOutEdit($tr)
            }
        })
     } else {
        $('#tbbody').find(':checkbox').prop('checked', false);
     }
});
```

### 刷新

设置一个刷新按钮，目的就是为了刷新一遍重新拿数据。刷新的时候重新执行以下initial()初始化函数就行了。

```javascript
$('#refresh').click(function () {
    // 刷新一遍重新拿数据
    initial(url);
});
```

注意此时执行的时候要扩展以下inittablebody和inittablehead，在创建之前先清除一下，否则你就会看到刷新一次重复的数据在页面重新生成一次：

```javascript
// 在initTableHeader函数的第一行加上这么一句，先清空再重新生成
$(tbhead).empty();

// 和initTableHeader函数的第一行加上这么一句，先清空再重新生成。
$(tbbody).empty();
```

### 保存

设计编辑模式的原因其实就是为了方便我们进行修改，修改完了以后我们是要提交给后端服务的，因此这里又设置了一个保存按钮，方便用户进行数据的保存：

1. 保存按钮设计为需要退出编辑模式以后才能进行保存，当我们退出编辑模式，执行trOutEdit的时候是会将修改的值获取到然后放到td中的。同时为当前的td设置一个new-origin的属性用来表示数据是否已经发生更改，作为判断标准或者依据。
2. 定义一个all_list用以保存我们发生修改的数据。
3. 然后开始遍历tablebody的每一行，之前为每一个tr设置了nid，这个nid其实就是资产信息在数据库的id，在这里就可以很方便的使用上了，定义一个row_dict用来保存到底这一行的哪些数据发生了变化；
4. 遍历这一行tr的每一个td标签，首先判断这一个td是否是能编辑的，如果不能编辑那就不用进内部的判断了；如果这个数据是可编辑的并且edit-type是select的，那么就要比较new-origin和origin的值，如果变化了，说明修改了，如果没变化说明没有修改；如果修改了的话，那么我们就将这个td字段的name属性作为key，新数据newData作为value更新到这个字典里。当字段不是select的时候，直接获取text值，然后和td的origin属性值进行比较，如果变化了，做如上的同样操作。
5. 我们在遍历每一行的时候，首先设置一个flag置位，只要数据发生变化了需要修改了那么就把flag置位为true，当遍历完tr的每一个td的时候如果发生了变化，那么还要把这一条tr的资产信息的id带过去。
6. 将发生变化的这个row_dict字典添加到all_list中
7. ajax提交到后台，注意cstf_token的问题

```javascript
$('#save').click(function () {
    // 设计为首先推出编辑模式以后才能保存
    var editornot = $('#editmodelornot');
    if ($(editornot).hasClass('btn-warning')) {
        // 在编辑模式下应该退出
        $('#tbbody').find(':checkbox').each(function () {
            if ($(this).prop("checked")) {
                var $tr = $(this).parent().parent();
                trOutEdit($tr);
            }
        })
        // 退出编辑模式记得修改按钮样式和文字。否则在下一次触发的时候会报错
        $(editornot).removeClass('btn-warning');
        $(editornot).text('进入编辑模式');
    }
    // 定一个修改资产的列表总表，下面去循环每一个发生变化的项然后append进来
    var all_list = [];
    // 退出以后获取用户修改过的数据，然后通过ajax提交到后台
    $('#tbbody').children().each(function () {
        // $(this)这里指的就是tr
        var $tr = $(this);
        var nid = $tr.attr('nid');
        var row_dict = {};
        var flag = false;
        $tr.children().each(function () {
            // 要判断是否可编辑，同时还要判断下拉框的情况下
            if ($(this).attr('edit-enable') === 'true') {
                if ($(this).attr('edit-type') == 'select') {
                    var newData = $(this).attr('new-origin');
                    var oldData = $(this).attr('origin');
                    if (newData) {
                        if (newData != oldData) {
                            var name = $(this).attr('name');
                            row_dict[name] = newData;
                            // 如果写过数据就置位为true
                            flag = true;
                         }
                     }
                } else {
                    var newData = $(this).text();
                    var oldData = $(this).attr('origin');
                    if (newData != oldData) {
                        var name = $(this).attr('name');
                        row_dict[name] = newData;
                        // 如果写过数据就置位为true
                        flag = true;
                    }
                }
            }
        });
   
        // 如果没有编辑的话dict可能为空，因此要做一下判断
        if (flag) {
            // 在这里我加了个判断，做了修改的一个是要传递一下资产的id过去
            // 再有就是把这一条资产添加到这个all_list中去。
            row_dict['id'] = nid;
            all_list.push(row_dict);
        }
    });
    /**
     * RestfulApi
     * 添加：post；获取用get；删除：delete；修改:put
     * */
    $.ajax({
        url: url,
        method: 'PUT',
        headers: {"X-CSRFToken": $(csrftoken).val()},
        data: JSON.stringify(all_list),
        success: function (arg) {
        	console.log(arg);
        }
    })
});
```

后台接收到以后的形式就是这样的：

```javascript
# 形如这样一个列表套多个字典的的形式
[{
    "sys_name":"4",
    "job_type":"4",
    "job_describe":"协助123123发版脚本修改",
    "job_user":"123123",
    "ops3":"4",
    "oprate":"2",
    "status":"2",
    "job_method":"修改环境变量处理nohup无法直接调用java的问题",
    "job_time":"4",
    "note":"null22222",
    "id":"1"
},{……},{……},
]

# 因为对应的一个个小字典的key其实都是对应的我们的字典的值，因此可以直接进行更新
all_list = json.loads(request.body.decode('utf-8'))
for row in all_list:
    nid = row.pop('id')
    models.Server.objects.filter(id=nid).update(**row)
```

### 新增

关于新增，后期补充，新增视业务的不同而不同，如果内容少量内容的添加可以直接使用模态框就可以了，如果多数内容的添加，也可以针对这个内容单独设置一个页面进行添加也是可以的。换句话说就是这个添加的操作不适合封装到这个curd插件里，关于这个内容，直接写一个a标签触发事件最方便。