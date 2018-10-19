# 定制Actions

## 设计思路

允许对数据进行一部分操作，类似于如下的样子

![](http://tuku.dcgamer.top/18-10-19/45129488.jpg)

比如可以选初始化，或者勾选批量删除等等。首先对这个功能说明一下，以后这个整体的CURD的组件是可以套用在多个系统的，那么当对应到不同的系统或者对应不同业务的模型类的时候，这个操作可能是不同的，具体的什么操作要看实际的业务而定，因此这里的操作每一个模型类，应该都是可以自己定制的，而不是定死的。因此这个操作列要像list_display一样或者add_or_edit_model_form一样允许用户自己去定义。因此我们可以在用户自定义的类中去重写这个action，来实现用户的私人定制。

在BaseLamberAdmin中定一个action_list的列表。用来存储我们的action操作，那么里面操作对应的实体应该是什么呢？我们这里可以在里面存放对应的方法。通过相应的方法去操作。或者写上一个对象；

## 设计实现

以userinfo这个模型类为例，我们在注册这个类的时候实际上是使用了`v1.site.register(models.UserInfo, LamberUserInfo)`，因为这个LamberUserInfo这个类是继承BaseLamberAdmin，因此我们可以在这个LamberUserInfo中重写action_list去定制我们的action。首先定制一个initial操作为例

```python
# LamberUserInfo
from lamber.service import v1

class LamberUserInfo(v1.BaseLamberAdmin):
    
    def initial(self, request):
        """
        :param request:
        :return: True：表示还在当前页面，因为当前页面可能还有其他条件
        返回False：就不用保留地址，直接跳转到不加条件的首页
        """
        # 在changelist_view调用，因为checkbox有name=pk，因此可以拿到选中的checkbox
        pk_list = request.POST.getlist('pk')
        # 通过pk，我们又能拿到对应的value，就能拿到对应的对象。就能进行一系列操作
        models.UserInfo.objects.filter(pk__in=pk_list).update(username='kakaka')
        # 这里其实返回不返回没有太所谓，这里就看自己的设计了，比如返回一个布尔值。
        # 返回True就留在当前页面。返回false，跳转到其他页面。
        return True
    
    # python里面一切皆对象，当然函数也是，所以我们可以像对象一样也给函数赋一个值
    initial.text = '初始化'
    
    action_list = [initial, multi_del]
```

在BaseLamberAdmin的changelist_view中我们去对数据显示做操作。

```python
# BaseLamberAdmin
class BaseLamberAdmin(object):
    def changelist_view(self, request):
        # actions相关操作
        action_list = []

        for item in self.action_list:
            # 这里我去遍历self.action_list，从self.action_list可以优先拿到用户自定制的。
            # 然后针对每一个操作去构造一个小字典，name为函数的名字，text为函数的中文名
            # 我们在定义的时候为函数添加了一个text属性，用来给函数命名，这样在前端就能看到中文了。
            # 提交name的意义在于，我要将name赋值到options的value处。
            # 这样拿到提交的数据的时候，我知道调用的是哪一个函数。
            tpl = {'name': item.__name__, 'text': item.text}
            action_list.append(tpl)
        if request.method == 'POST':
            # 根据提交的name获取到提交的options的value，虽然操作名是初始化，但是我可以拿到字符串
            # 形式的initial，然后通过反射，我就可以拿到这个函数对象。
            func_name_str = request.POST.get('action')
            # 获取到对象的时候同时进行调用
            ret = getattr(self, func_name_str)(request)
            # 在我们的设计中，设计的是如果返回True就还留在当前页面，简单的redirect以下就行。
            # 但是当前页面可能存在参数，因此记得要拼接当前的url，带上相关的参数。
            action_page_url = base_page_url
            # 如果返回为true就跳转到带参数的页面，如果返回为false就跳转到不带参数的列表页
            if ret:
                action_page_url = "{0}?{1}".format(base_page_url, request.GET.urlencode())
            return redirect(action_page_url)
        context = {
            'result_list': result_list,
            'list_display': self.list_display,
            'lamberadmin_obj': self,
            'add_url': add_url,
            'page_str': page_obj.pager(),
            'action_list': action_list,
        }

        return render(request, 'checklist_view.html', context)
```

前端展示模板：

```html
# lamber/templates/changelist_view.html
<div class="container">
    <h1>数据列表</h1>
    <form method="post">
        {% csrf_token %}
        <!--以form表单形式传递，会携带checkbox和select框，给提交上去。当然这个要和对应的checkbox的列一起配合使用，比如给那一列加上对应的name，不然提交上去也取不到。-->
        {% if action_list %}
            <div class="row">
                <select name="action" id="" class="form-control" style="width:200px;float: left">
                    {% for item in action_list %}
                        <option value="{{ item.name }}">{{ item.text }}</option>
                    {% endfor %}
                </select>
                <input type="submit" value="执行" class="btn btn-primary">
            </div>
        {% endif %}

        <a href='{{ add_url }}' style="float: right;" class="btn btn-default">添加</a>

        <!--数据表格 开始-->
        {% func result_list list_display lamberadmin_obj %}
        <!--数据表格结束-->
    </form>

    <!--分页开始-->
    <ul class="pagination">
        {{ page_str|safe }}
    </ul>
    <!--分页结束-->
</div>
</body>
```

