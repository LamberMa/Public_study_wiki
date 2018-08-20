# 组件搜索

> 目前已经可以说已经完成了组件的增删改，但是还有一样，那就是查，接下来将会扩展插件的查询功能。允许用户可以实现组合条件的查询

## 前端展示代码

```html
<!--作为额外元素的按钮式下拉菜单-->
<div>
    <!--搜索列表-->
    <div class="search-list clearfix" style="position: relative;">
        <!--搜索按钮，col-md-offset-10,列偏移，向右占位10个，然后搜索按钮实际占位是两份-->
        <div class="search-btn col-md-offset-10 col-md-2" style="position: absolute;bottom: 1px;text-align: right;">
            <input id="doSearch" type="button" class="btn btn-primary" value="搜索"/>
        </div>

        <!--每一个搜索条目，因为这个的定位是relative用来给内部做相对定位的，如果说本身没有设置宽度撑开的话
        那么本身定位就是有问题的，宽度是个空，因此会出现元素重叠的现象。不管你加多少个都撑不开
        都叠在一起了。
        -->
        <div class="search-item col-md-offset-2 col-md-8 clearfix" style="position: relative;height: 35px;">
            <!--左边的加号-->
            <div style="position: absolute;left:0;width: 38px;">
                <a type="button" class="btn btn-default add-search-condition">
                    <span class="glyphicon glyphicon-plus"></span>
                </a>
            </div>
            <!--右边的输入框，或者是select框-->
            <div class="input-group searchArea" style="position: absolute;left: 40px;right: 0;">
                <div class="input-group-btn">
                    <button type="button" class="btn btn-default dropdown-toggle" data-toggle="dropdown">
                        <span class="searchDefault">默认值</span>
                        <span class="caret"></span></button>
                    <ul class="dropdown-menu"></ul>
                </div>
            </div>
        </div>
    </div>
</div>
```

## JS操作

> 在这里其实很简单的设置了一个加号和一个下拉框；加号允许我创建多个搜索的条件，最后需要达到的结果是多个条件放在一起做搜索；然后旁边的下拉框其实是限制选取的搜索类型，我们搜索可以搜索服务器或者搜索服务器状态，比如上架或者下架等。比如服务器就应该让我们输入一个服务器的名称，而状态就应该让我们去选择一个状态；因此根据搜索条件的不同，旁边展示的内容也应该是不一样的，可能是搜索框，也可能是下拉菜单。

### 初始化搜索框

首先从后台构造一个搜索的配置，传递到前端来，前端根据搜索配置去生成对应的搜索条件，比如：

```python
search_config = [
        # 使用xxx__contains做模糊匹配，orm的用法再回顾一下。
        {'name': 'hostname__contanins', 'text': '主机名', 'search_type': 'input'},
        {'name': 'sn__contains', 'text': 'SN号', 'search_type': 'input'},
    ]
```

前端拿到这样的数据以后就可以针对这个内容进行遍历了。根据search_type生成不同的条件框。（需要在视图函数中，将search_config也作为返回的字典中的一项给传递到前端来），针对上述内容做简单说明：

- name：这个是实际要使用orm在数据库搜索的字段，比如hostname就是搜索数据库server表中的server字段，hostname__contains的用法为模糊匹配
- text：在前端搜索条件框那里要显示的中文名称。
- search_type：搜索条件，值为input或者select，根据type的不同，生成不同的搜索条件框
- global_name：如果search_type为select的话我们还应该把对应的选项的名字传递过去，比如device_type_id这个字段我们就应该把device_type_choices传递过去，只要把这个传递过去，我们就可以在对应的GLOBAL_DICT中拿到我们想要的选项。

现在可以开始进行初始化搜索框的设置了，需要做的工作就是讲我们从后端传递过来的每一个搜索项填充到我们上面的html的搜索项目中：

```javascript
(function(jq){
var CREATE_SEARCH_CONDITION = true;
function initSearch(search_config) {
    // 有可能有的表单没有设置search_config，没有设置的时候其实就是一个undefined，不需要就不生成即可。
    // CREATE_SEARCH_CONDITION设置一个置位，这个置位的作用是防止这个搜索条件的重复初始化生成
    // 仅仅第一次生成的时候就够了，后续就不用生成了。
    if (search_config && CREATE_SEARCH_CONDITION) {
        CREATE_SEARCH_CONDITION = false;
        // 找到搜索框的ul的位置，在里面动态添加li(搜索条件)
        $.each(search_config, function (k, v) {
            // 这里的v才是我们真正需要的数据
            // 创建一个li标签，然后设置li的属性；
            var li = document.createElement('li');
            $(li).attr('search_type', v.search_type);
            $(li).attr('name', v.name);
            if (v.search_type === 'select') {
                $(li).attr('global_name', v.global_name);
            }
            // 设置一个a标签，然后将a的文本显示为search_config的text文本添加到a
            // 然后把这个a添加到li下，最后将整个li添加到ul下，循环遍历，这样所有的下拉项就生成了。
            var a = document.createElement('a');
            a.innerHTML = v.text;
            li.append(a);
            $('.searchArea').find('ul').append(li)
        });

        // 初始化搜索默认条件，这么多下拉项总有一个是默认选中的。因此需要设置一下默认选项
        // 创建一个默认的局部变量，让它作为默认项，值为search_config第一个索引位的值。
        var defaultcondition = search_config[0];
        // 替换一下默认值的文本文字
        $('.search-item .searchDefault').text(defaultcondition.text);
        // 替换搜索框的标签，如果search_type为select就换成下拉框，反之则是input框
        if (defaultcondition.search_type === 'select') {
            // 动态生成一个select框
            var $sel = $('<select>');
            $sel.addClass('form-control');
            $sel.attr('name', defaultcondition.name);
            // 我们有下拉项的名字，我们就可以在GLOBAL_DICT中拿到下拉项的值。遍历值生成option
            $.each(GLOBAL_DICT[defaultcondition.global_name], function (k, v) {
                var option = document.createElement('option');
                $(option).text(v[1]);
                $(option).val(v[0]);
                $sel.append(option);
            });
            $('.input-group').append($sel);
        } else {
            var $inp = $('<input>');
            $inp.addClass('form-control');
            $inp.attr('name', search_config[0].name);
            $inp.prop('type', 'text');
            $('.input-group').append($inp);
        }
    }
}
})(jQuery)
```

将initSearch加入到initial()这个函数中来和inittablebody以及inittableheader进行统一初始化；

现在生成了搜索条件的li以及对应的右侧的搜索框，不过我们发现切换的时候，搜索条目并没有变，而且右侧的内容也没有动态起来。因此需要针对这个li加入点击事件，做到搜索框选择不同类型的时候，对应的右侧的搜索类型也要变；

```javascript
// 这里使用到了事件委派，因为li是动态生成的一开始并没有，因此直接click是会绑定失败的。
$('.search-list').on('click', 'li', function () {
    // 点击li执行函数
    var li_text = $(this).text();
    var search_type = $(this).attr('search_type');
    var name = $(this).attr('name');
    // 如果没有就是undefined
    var global_name = $(this).attr('global_name');

    // 替换显示的文本
    $(this).parent().prev().children('.searchDefault').text(li_text);

    // 替换搜索框的标签，如果search_type为select就换成下拉框
    if (search_type === 'select') {
        var $sel = $('<select>');
        $sel.addClass('form-control');
        $sel.attr('name', name);
        $.each(GLOBAL_DICT[global_name], function (k, v) {
            option = document.createElement('option');
            $(option).text(v[1]);
            $(option).val(v[0]);
            $sel.append(option);
        });

        $(this).parent().parent().next().remove();
        $(this).parent().parent().after($sel);
    } else {
        var $inp = $('<input>');
        $inp.addClass('form-control');
        $inp.attr('name', name);
        $inp.prop('type', 'text');
        $(this).parent().parent().next().remove();
        $(this).parent().parent().after($inp);
    }
});
```

### 搜索框的动态添加

我们要允许多个条件的联合查询，因此我们需要点击最左侧的加号可以动态得去生成搜索框，因此针对这个加号添加点击事件。

```javascript
// 如果要求点击事件添加多个搜索条件的话因为这个后添加的条件一开始也是没有的，因此也要做事件的委派
$('.search-list').on('click', '.add-search-condition', function () {
    if ($(this).children('span').hasClass('glyphicon-plus')) {
        /**
         * 如果我当前点击a标签的符号是一个加号的话那么就执行加一个的操作
         * 1、克隆一个search-item
         * 2、然后把这个item下的a标签中的span的class改为减号"glyphicon-minus"
         * */
         var newSearchItem = $(this).parent().parent().clone();
         $(newSearchItem).find('.add-search-condition').find('span').removeClass('glyphicon-plus').addClass('glyphicon-minus');
         $('.search-list').append(newSearchItem);
     } else {
         /**
          * 条件能走到这里说明点的这个选项是没有加号的，是一个减号；
          * 如果我点击的当前a标签的符号是一个减号的话，那么应该执行一个删除的操作
          * 把当前的点击的这个item给删除掉 */
          $(this).parent().parent().remove();
     }
});
```

### 查询数据的提交

现在已经可以做到添加多条数据了，接下来就是需要对数据进行提交搜索了。数据提交的第一步就是要先把所有的搜索条件都拿到再说：

```javascript
function getSearchCondition() {
    // 搜索条件可能有多个，这里直接构造一个字典去保存。
    var conditon = {};
    // 遍历search-list下的所有条件，找到所有type为text或者select框。
    $('.search-list').find('input[type=text],select').each(function () {
        // $(this)，这个要不就是input框，要你就是select，获取所有搜索条件
        var name = $(this).attr('name');
        var value = $(this).val();
        // 关于搜索条件这一块，比如针对服务器搜索，针对机柜是b14并且又是在线状态的服务器
        // 这里的两个条件是不同的条件，不同的条件的时候应该是与的关系，比如既是上线状态又是b13机柜的。
        // 针对同样条件的，比如收到两个条件分别为b13机柜和b14机柜，这样应该是或的关系
        // 不能说这个设备又是13机柜又是14机柜的，这个是不合理的，因此做如下处理
        // 同样的一个属性归到一个列表里去，不同的属性直接赋值即可。
        if (conditon[name]) {
            conditon[name].push(value)
        } else {
            conditon[name] = [value]
        }
    });
    return conditon;
}
```

数据的发送这里不单独做发送，而是在在执行初始化initial的时候直接传递过去，让后台去接收，当然这里的提交方式就是通过get方式提交的了：

```javascript
# 对initial进行进一步的扩展
function initial(url) {
    // 执行一个函数，获取当前搜索条件，没有条件的时候拿到的是一个空对象
    var searchCondition = getSearchCondition();
    $.ajax({
        url: url,
        type: 'GET',
        data: {'condition': JSON.stringify(searchCondition)},
        dataType: 'JSON',
        success: function (arg) {
            /*
             * server_list: 相关资产信息
             * table_config: 自定义的表配置
             * global_dict: 相关的状态信息
             * */
             $.each(arg.global_dict, function (k, v) {
                 GLOBAL_DICT[k] = v;
             });
             initTableHeader(arg.table_config);
             initTableBody(arg.server_list, arg.table_config);
             initSearch(arg.search_config);
       }
   })
}
```

那么这个条件在最开始生成页面的时候其实就是不存在的，是一个空字典（对象），那么后续我们添加了条件以后应该还有一个触发搜索的机制，目前还有一个小件没有用到，那就是我们一开始放那的那个搜索按钮，因此我们现在再对这个搜索按钮加一个事件：

```javascript
// 搜索按钮触发事件，重新获取结果，让它重新生成一下就可以了。
$('#doSearch').click(function () {
    initial(url);
})
```

数据的发送到这里也就完成了

### 后端接收和处理

因为我们是通过get方式发送到后端的，所以后端也是通过get方式去取数据就可以了。key为condition，name为对应的字段名，value为对应要查询的属性值，不同的字段类型之间的查询关系为or，同类型的

```python
# 针对获取server_list进行函数的封装
from django.db.models import Q 
from backend import models
def get_data_list(request, table_config, model_cls):
    con = Q()
    condition = request.GET.get('condition')
    condition_dict = json.loads(condition)
    for name, values in condition_dict.items():
        ele = Q()
        ele.connector = 'OR'
        for item in values:
            ele.children.append((name, item))
        con.add(ele, 'AND')
    values_list = [row['q'] for row in table_config if row['q']]
    server_list = model_cls.objects.filter(con).values(*values_list)
    return server_list

# 调用，传入request， 我们的的table_config， 还有Server的model模型类，然后将server_list返回给前端就可以了。返回的数据都是满足要求的数据，每次使用搜索按钮都会重新发一次请求获取的数据都是重新生成的。
server_list = get_data_list(request, server_table_config, models.Server)
```

