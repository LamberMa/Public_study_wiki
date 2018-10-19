# Model&URL

## 自动注册Model

在lamber的app中我新建一个service的python package，在里面新建一个v1.py用于存放我们注册Model相关的业务逻辑。

```python
# lamber/service/v1.py
class BaseLamberAdmin(object):
    pass

class LamberSite(object):
    def __init__(self):
        self._registry = {}
        self.namespace = 'lamber'
        self.appname = 'lamber'

    def register(self, model_class, xxx=BaseLamberAdmin):
        # 这里的xxx其实就是相当于django admin里面的admin_class
        self._registry[model_class] = xxx(model_class, self)

site = LamberSite()
```

然后我们就可以在其他的app里面仿照djang admin中的admin.py那样去新建一个我们自己的注册文件，比如叫lamber.py。根据上面的设定，只要程序一启动起来，就回去执行我们的lamber.py文件。在Django Admin中我们是通过`admin.site.register(models.xxx)`这样的方式去注册，在这里我们同样可以这样去操作：

```python
# 以新建一个app01中的lamber.py为例
from lamber.service import v1
from app01 import models

v1.site.register(models.UserInfo)
```

这样就完成了一个模型类的注册，其他类的注册也是按照这个流程以此类推。其实这里的site本身就是LamberSite()的一个实例化的对象，所以我们不管怎么使用，使用的都是这样个实例化后的对象，所以这是一个单例模式的应用。

我们调用了site实例的register方法，register方法会填充初始的默认字典`_register`，其中key就是我们的`model_class`，value就是`BaseLamberAdmin`的对象。这里每一个value其实都是不同的对象，原因很简单，因为传入的`model_class`不一样，所以生成的对应实例也不是一个。

这里其实可以看到，我们在调用register方法的时候，只传入了默认一个模型类，但是在register方法中还有个xxx，有一个默认值，是BaseLamberAdmin，这里后面会说到，我们这里这个类还可以自定制。

就目前来讲，我们完成了注册操作以后其实就是得到了一个构造好的`_registry`字典。

## 自动生成URL

我们最终的目的是要注册类以后就生成一系列的url供我们使用和访问，类似于django admin中的如下模式：

- 查：http://127.0.0.1:8000/admin/app01/userinfo/
- 增：http://127.0.0.1:8000/admin/app01/userinfo/add/
- 改：http://127.0.0.1:8000/admin/app01/userinfo/1/change/
- 删：http://127.0.0.1:8000/admin/app01/userinfo/1/delete/

我们的目的是为了每注册一个类，就为这个模型类生成这样的一套CURD的操作，让操作流程标准化。因此对LamberSite做进一步扩展：

```python
class LamberSite(object):
    def __init__(self):
        self._registry = {}
        self.namespace = 'lamber'
        self.appname = 'lamber'

    def register(self, model_class, xxx=BaseLamberAdmin):
        self._registry[model_class] = xxx(model_class, self)

    def login(self, request):
        # 默认的login页面，login和logout其实是不需要动态生成的。
        return HttpResponse('login')

    def logout(self, request):
        return HttpResponse('logout')

    def get_urls(self):
        # 先把这些不需要动态生成的扔在这里。
        ret = [
            path('login/', self.login, name='login'),
            path('logout/', self.logout, name='logout')
        ]
		# 动态的把我们注册的模型类的操作通过循环_registry添加到这个ret里面去。
        # 循环的key是模型类，value是BaseLamberAdmin的对象。
        for model_cls, lamber_admin_obj in self._registry.items():
            # 获取字符串app的名称和模型类的名称。比如app01下的userinfo类。
            appname = model_cls._meta.app_label
            model_name = model_cls._meta.model_name
            # 调用lamber_admin_obj对象的urls方法生成这一个类的增删改查方法
            ret.append(path('%s/%s/' % (appname, model_name), include(lamber_admin_obj.urls),))
		# 将所有的url对应关系返回
        return ret

    @property
    def urls(self):
        return self.get_urls(), self.appname, self.namespace
```

在生成对应模型类的时候，我们调用了BaseLamberAdmin的对象的urls方法，这个方法的作用是为了生成这个类的CURD的url路由映射，这样，不管我们注册了几个类，只要循环调用urls方法就可以了，接下来看一下这个urls方法是如何写的。

```python
class BaseLamberAdmin(object):

    def __init__(self, model_class, site):
        self.model_class = model_class
        self.site = site
        # 提前协上一点常用的
        self.app_label = self.model_class._meta.app_label
        self.model_name = self.model_class._meta.model_name
        self.request = None
        
    def changelist_view(self, request):
        pass

    def add_view(self, request):
        pass

    def delete_view(self, request, object_id):
		pass

    def change_view(self, request, object_id):
        pass

    @property
    def urls(self):
        # 首先获取到对应的app的名称，以及模型类的名称。
        info = self.model_class._meta.app_label, self.model_class._meta.model_name
        urlpatterns = [
            # 我们自己构造一个urlpatterns，构造成功以后返回就行了。这里的视图函数我们后续慢慢补充
            
            # 如果什么也不接收就是默认显示所有数据，注意reverse url的拼接
            path('', self.changelist_view, name='%s_%s_changelist' % info),
            # 如果是add，那么就是要添加数据
            path('add/', self.add_view, name='%s_%s_add' % info),
            # 删除和修改数据都应该传递一个数据的id过来，我们才知道要修改哪一个
            path('<path:object_id>/delete/', self.delete_view, name='%s_%s_delete' % info),
            path('<path:object_id>/change/', self.change_view, name='%s_%s_change' % info),
        ]
        return urlpatterns
```

urls.py中，直接调用v1中site对象的urls方法，因为加了property的装饰器，因此可以直接像属性一样调用，实际上这里返回的就是一个元组，分别为urls对应关系、appname、namespace。这里的逻辑和include的逻辑是一样的，具体include的逻辑可以参照上一节Django中的include的逻辑说明。include在这里返回的也是一个元组。

```python
# 调用成功之后所有注册的model class就全部加入进来了。
from lamber.service import v1
urlpatterns = [
    path('lamber/', v1.site.urls),
]
```

## 反向URL的生成

> 首先说一下为什么会用到反向的url，其中一个原因就是我们的CURD业务逻辑对应的都是BaseLamberAdmin中的一套CURD的方法（changelist_view，add_view，delete_view，change_view），以增加为例，比如userinfo数据类中添加成功了应该跳转回userinfo的列表，那么这个add_view如何知道跳转回哪个展示列表，它是不知道的，它不知道应该跳转回userinfo的展示列表还是usergroup的展示列表的，这个时候只能利用反向URL来跳转回去，具体看如下是如何操作的。

生成url的时候其实就是用的reverse，不过和之前唯一的区别就是我们加入了namespace，namespace的作用其实就是在之前的url逻辑上又做了一层的区分，比如说两个app的reverse的name都叫aaa，为了区别到底是哪个aaa，就可以加上namespace加以区别。因此在使用反向url的时候我们还要额外的带上namespace，否则Django不知道你是要为哪一个namespace生成。

还记得看include源码的时候，namespace如果没有传递的时候namespace其实就是appname。

```python
# 在这里必须要加上namespace，我们这里的namespace就是lamber
# 如果在分发的时候指定了namespace，那么在反向生成的时候就必须指定namespace
# 使用的方式很简单，就是reverse name:namespace
"""
常见的指定namespace的方式
path('', include('app01.urls', namespace='xx'))
"""
print(reverse('lamber:login'))

# 如果不指定namespace的话对应的反向URL找不到会报如下的错误
NoReverseMatch at /lamber/login/
Reverse for 'login' not found. 'login' is not a valid view function or pattern name.
```

知道如何生成反向URL了，那么根据我们定制的规则，其实就可以通过拼接name得到对应的url了。

## 多级namespace反向URL

url的对应关系是可以嵌套的，比如：

```python
urlpatterns = [
    path('test1/', include([
        path('aaa/', include([
            path('bbb/', views.bbb, name='bbb')
        ], namespace='n2')),
    ], namespace='n1'))
]
```

针对这种情况下要按照如下的办法生成反向url：

```python
from django.urls import reverse
# 这个namespace多层嵌套的情况下，从最外层开始依次往下写就可以了。有几层套几层就行了。
print(reverse(n1:n2:bbb))
```

namespace的意义在于区分不同的app之间重复的反向name的情况。