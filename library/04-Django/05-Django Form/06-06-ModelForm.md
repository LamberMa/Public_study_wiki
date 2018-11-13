# ModelForm

> Model：用于操作数据库
>
> Form：生成HTML标签以及对请求的数据做数据校验。
>
> ModelForm：上述两者功能的合集
>
> 但是ModelForm由于集合和Model和Form因此适用场景就变小了，如果是大型的应用程序是不适合适用ModelForm的，在大场景的时候数据库和前端展示以及后端验证会作为单独的模块单独出去会有不同的基础平台来实现，而不是全部都耦合在一起，也不互相依赖。因此ModelForm虽然一定程度上要好用一些，但是同时也限制了它的应用场景。

## 简单使用

```python
class UserGroup(models.Model):
    title = models.CharField(max_length=32)
    
    def __str__(self):
        return self.title
    
class Role(models.Model):
    name = models.CharField(max_length:32)
    
    def __str__(self):
        return self.name

class UserInfo(models.Model):
    user = models.CharField(max_length=32)
    email = models.EmailField()
    ug = models.ForeignKey(UserGroup, null=True, blank=True)
    
    m2m = models.ManyToManyField('Role')
    
    def __str__(self):
        return self.user
```





```python
from django.forms import Form, fields, widgets
class TestForm(Form):
    user = fields.CharField(required=True)
    email = fields.EmailField(required=True)
    ug_id = fields.ChoiceField(
        widget=widgets.Select,
        choices=[]
    )
    
    def __init__(self, *args, **kwargs):
        super(TestForm, self).__init__(*args, **kwargs)
        self.fields['ug_id'].choices = models.UserGroup.objects.values_list('id', 'title')
```





```python
def test(request):
    if request.method == 'GET':
        form = TestForm()
        context = {
            'form': form
        }
        return render(request, 'test.html', context)
    else:
        form = TestForm(request.POST)
        if form.is_vaild():
            # 提交过来的外键字段是ug，这个ug必须是一个对象，如果把提交的内容改成ug_id就可以直接提交了。
            models.UserInfo.objects.create(**form.cleaned_data)
            return redirect('http://www.baidu.com')
        context = {
            'form': form
        }
        return render(request, 'test.html', context)
```





简单的写法：

```python
form django.forms import ModelForm

class TestModelForm(ModelForm)：
    class Meta:
        model = models.UserInfo
        fields = "__all__"
        error_messages = {
            # 字典的key就是字段名，按照如下形式就可以定制我们的错误信息
            'user': {'required': '用户名不能为空'}
            'email': {'required': '邮箱不能为空', 'invalid': '邮箱不能为空'}
        }
        
def test(request):
    if request.method == 'GET':
        form = TestModelForm()
        context = {
            'form': form
        }
        return render(request, 'test.html', context)
    else:
        form = TestModelForm(request.POST)
        if form.is_vaild():
            # ModelForm不用你分门别类的去保存，直接一个save就能搞定。
            # 其他的关系表也为你自动加进去了。
            form.save()
            return redirect('http://www.baidu.com')
        context = {
            'form': form
        }
        return render(request, 'test.html', context)
    
在前端把对应的model字段写上就可以了。省了写什么select，省了写什么多对多，全都省了。
```



```python
def edit(request, nid):
    obj = models.UserInfo.objects.filter(id=nid).first()
    if request.method == 'GET':
        # 使用instance=obj就可以进行数据的填充
        form = TestModelForm(instance=obj)
        context = {
            'form': form
        }
        return render(request, 'edit.html', context)
    else:
        # 编辑的时候必须带着这个instance
        form = TestModelForm(instance=obj, data=request.POST, files=request.FILES)
        if form.is_valid():
            form.save()
            return redirect('/')
        return render(request, 'edit.html', context)
```



www.cnblogs.com/wupeiqi/articles/6229414.html

```python
ModelForm
    a.  class Meta:
            model,                           # 对应Model的，只能对应一个，
            fields=None,                     # 字段，可以__all__所有，也可以接一个元组写上字段名
            exclude=None,                    # 排除字段
            labels=None,                     # 提示信息，一般用不到，form.as_p的时候会用到，labels是一个字典，字段名对应label名称。，下面的help_texts同理。
            help_texts=None,                 # 帮助提示信息
            widgets=None,                    # 自定义插件同Form的widgets，接收一个字典，key是字段名，比如'user': fwigets.Textarea(attrs={'class':'c1'})，注意这个widgets重名了，所以我们导入的要重命名一下。
            error_messages=None,             # 自定义错误信息（整体错误信息from django.core.exceptions import NON_FIELD_ERRORS）
            field_classes=None               # 自定义字段类 （也可以自定义字段）一般不用。一般默认生成的时候比如用户名是input框，email也是input框，但是email有一个type为email的验证规则，如果你也想让这个username有email的验证规则，就可以用fields_classes = {'user': ffields.EmailField}注意后面括号都不能加，因此很有局限性，还有一个就是注意这里的fields和Meta上面的fields重名了，记得给这个重命名一下。
            localized_fields=('birth_date',) # 本地化，如：根据不同时区显示数据
            如：
                数据库中
                    2016-12-27 04:10:57
                setting中的配置
                    TIME_ZONE = 'Asia/Shanghai'
                    USE_TZ = True
                则显示：
                    2016-12-27 12:10:57
    b. 验证执行过程
        is_valid -> full_clean -> 钩子 -> 整体错误
 
    c. 字典字段验证
        def clean_字段名(self):
            # 可以抛出异常
            # from django.core.exceptions import ValidationError
            return "新值"
    d. 用于验证
        model_form_obj = XXOOModelForm()
        model_form_obj.is_valid()
        model_form_obj.errors.as_json()
        model_form_obj.clean()
        model_form_obj.cleaned_data
    e. 用于创建
        model_form_obj = XXOOModelForm(request.POST)
        #### 页面显示，并提交 #####
        # 默认保存多对多
            obj = form.save(commit=True)
        # 不做任何操作，内部定义 save_m2m（用于保存多对多）
            obj = form.save(commit=False)
            obj.save()      # 保存单表信息
            obj.save_m2m()  # 保存关联多对多信息
 
    f. 用于更新和初始化
        obj = model.tb.objects.get(id=1)
        model_form_obj = XXOOModelForm(request.POST,instance=obj)
        ...
 
        PS: 单纯初始化
            model_form_obj = XXOOModelForm(initial={...})
```

咱们自己写的优先级更高。