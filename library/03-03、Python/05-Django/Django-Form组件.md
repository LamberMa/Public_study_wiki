# Form组件

> - 需要对请求的数据做验证
> - 获取到数据然后进行验证
>
> 在数据库操作之前进行一些规则的验证。

问题：

- 无法记住上次提交的内容，因此页面刷新数据消失
- 重复的进行用户数据的校验：正则，长度，是否为空。

Django提供Form组件：

1. 定义组件

   ```python
   from django.forms import Form
   from django.forms import fields

   class LoginForm(Form):
       # 正则验证，要保证html标签的name属性和这里的属性是一致的，否则会找不到。
       # 这样可以后台根据自己定义的规则进行校验，
       username = fields.CharField(
           max_length=18, 
           min_length=6,
           required=True,
           # 自定制错误信息
           error_messages={
               'required': '不能为空',
               'min_length': '太短',
               'max_length': '太长了'
           }
       )
       password = fields.CharField(max_length=16,required=True)
       

   # 使用我们定义的规则
   def login(request):
       if request.method == 'GET':
           return render xxxxx
       else:
           obj = LoginForm(request.POST)
           # ret返回True or False，直接调用is_valid()就可以
           # 这个是由Django内部提供的一个验证机制。
           if obj.is_valid():
               # obj.cleaned_data是一个字典，就是验证通过后，用户提交的数据
               # 这样如果遇到注册的时候创建用户直接使用create(**kwargs)就行了
               pring(obj.cleaned_data)
               return redirect('https://www.baidu.com')
           else:
               # obj.errors是所有的错误信息
               # 这是一个对象，但是内部有一个__str__方法因此我们看到的是一大串html字符串
               print(obj.errors)
               print(obj.errors['username'])
               # 拿多个错误信息的第一个，只要错误信息没满足就有问题，我们永远拿第一个就行了
               print(obj.errors['password'][0])
               return render(request, 'login.html', )
           
   ```

   新建一个project专门用来学习写form

   保留上次输入的值

   用户输入的格式验证

   - form提交，页面默认会刷新
   - ajax提交，页面不会刷新，偷偷的给服务器传递数据。上次内容自动保留，可以手动js刷新

field的本质就是验证规则，其实就是正则表达式。我们写的这个类继承Form，同样也可以看做一个校验的模板。

Form表单内部验证原理：

1. 每一次实例化Form组件类的时候，会先执行一个操作，把当前定义的字段放到self.fields中。然后变成：

   ```python
   self.fields = {
       'username': fields.CharField(xxxxx) # 正则表达式,
       'password': 正则2
   }
   ```

2. 循环self.fields。

   ```python
   for k, v in self.fields.items():
     # 获取到用户输入的内容
     input_value = request.POST.get(k)
     # 通过正则表达式和用户输入的内容按照正则表达式进行匹配。
     return flag标志位
   ```



Integer继承field，CharField继承fields，emailField继承CharField

error_message对应的key：

- invalid：格式错误
- required：是否为空
- max_length，min_length：长度
- min_value，max_value：数值的范围，针对Integer

自定义正则表达式

```python
# regexfield继承charfield，可以使用是否为空，最长最短，还有自己写的，一共4种
t = fields.RegexField('139\d+', error_messages={'invalid': '格式错误'})
```

CharField中的strip为true，默认给你去掉空格。

IntegerField会主动的调用父类的构造方法，CharField也是。



required：是否为空

widget,label,disabled,label_suffix,initial,help_text其实是放在一起使用的。他可以帮你自动生成html标签。

```python
class xxx:
    t1 = xxx
    
    
在前端：(建议使用这种方法)
{{ obj.t1.label }}
{{ obj.t1.help_text }}
{{ obj.t1 }}

更简单的调用方法：
# 去对象吧所有的字段找到，然后生成html标签。这种方法其实不太灵活
{{ obj.as_p }}
{{ obj.as_ul }}
{{ obj.as_table }}
使用ul的时候记得在外层套一个ul标签，生成table的时候在外面套一个table标签
这俩内容只生成标签内部的东西。

因此两种方法一个是操作更简单，一个是控制更灵活。
```



```python
label = 'xxxxx'

<form method="POST" enctype="multipart/form-data">
    {% csrf_token %}
    
        {{ form.xxoo.label }} # 可以把class中定义的label内容显示出来
        {{ form.xxoo.id_for_label }}
        {{ form.xxoo.label_tag }}
        {{ form.xxoo.errors }}
        <p>{{ form.user }} {{ form.user.errors }}</p>
        <input type="submit" />
</form>
```

initial：

help_text：obj.t1.help_text

widget：

```python
from django.forms import widgets

# 指定生成的html标签是哪一种
widget = widgets.Select
```

上面这一堆除了widget其他的属性并不推荐使用。







Django内置字段：

```python
Field
    required=True,               是否允许为空
    widget=None,                 HTML插件
    label=None,                  用于生成Label标签或显示内容
    initial=None,                初始值
    help_text='',                帮助信息(在标签旁边显示)
    error_messages=None,         错误信息 {'required': '不能为空', 'invalid': '格式错误'}
    show_hidden_initial=False,   是否在当前插件后面再加一个隐藏的且具有默认值的插件（可用于检验两次输入是否一直）
    validators=[],               自定义验证规则，在原有的规则上继续添加正则
    localize=False,              是否支持本地化
    disabled=False,              是否可以编辑
    label_suffix=None            Label内容后缀
 
 
CharField(Field)
    max_length=None,             最大长度
    min_length=None,             最小长度
    strip=True                   是否移除用户输入空白
 
IntegerField(Field)
    max_value=None,              最大值
    min_value=None,              最小值
 
FloatField(IntegerField)
    ...
 
DecimalField(IntegerField)
    max_value=None,              最大值
    min_value=None,              最小值
    max_digits=None,             总长度
    decimal_places=None,         小数位长度
 
BaseTemporalField(Field)
    input_formats=None          时间格式化   
 
DateField(BaseTemporalField)    格式：2015-09-01
TimeField(BaseTemporalField)    格式：11:12
DateTimeField(BaseTemporalField)格式：2015-09-01 11:12
 
DurationField(Field)            时间间隔：%d %H:%M:%S.%f
    ...
 
RegexField(CharField)
    regex,                      自定制正则表达式
    max_length=None,            最大长度
    min_length=None,            最小长度
    error_message=None,         忽略，错误信息使用 error_messages={'invalid': '...'}
 
EmailField(CharField)      
    ...
 
FileField(Field)
    allow_empty_file=False     是否允许空文件
 
ImageField(FileField)      
    ...
    注：需要PIL模块，pip3 install Pillow
    以上两个字典使用时，需要注意两点：
        - form表单中 enctype="multipart/form-data"
        - view函数中 obj = MyForm(request.POST, request.FILES)
 
URLField(Field)
    ...
 
 
BooleanField(Field)  
    ...
 
NullBooleanField(BooleanField)
    ...
 
ChoiceField(Field)
    ...
    choices=(),                选项，如：choices = ((0,'上海'),(1,'北京'),)
    required=True,             是否必填
    widget=None,               插件，默认select插件
    label=None,                Label内容
    initial=None,              初始值
    help_text='',              帮助提示
 
 
ModelChoiceField(ChoiceField)
    ...                        django.forms.models.ModelChoiceField
    queryset,                  # 查询数据库中的数据
    empty_label="---------",   # 默认空显示内容
    to_field_name=None,        # HTML中value的值对应的字段
    limit_choices_to=None      # ModelForm中对queryset二次筛选
     
ModelMultipleChoiceField(ModelChoiceField)
    ...                        django.forms.models.ModelMultipleChoiceField
 
 
     
TypedChoiceField(ChoiceField)
    coerce = lambda val: val   对选中的值进行一次转换
    empty_value= ''            空值的默认值
 
MultipleChoiceField(ChoiceField)
    ...
 
TypedMultipleChoiceField(MultipleChoiceField)
    coerce = lambda val: val   对选中的每一个值进行一次转换
    empty_value= ''            空值的默认值
 
ComboField(Field)
    fields=()                  使用多个验证，如下：即验证最大长度20，又验证邮箱格式
                               fields.ComboField(fields=[fields.CharField(max_length=20), fields.EmailField(),])
 
MultiValueField(Field)
    PS: 抽象类，子类中可以实现聚合多个字典去匹配一个值，要配合MultiWidget使用
 
SplitDateTimeField(MultiValueField)
    input_date_formats=None,   格式列表：['%Y--%m--%d', '%m%d/%Y', '%m/%d/%y']
    input_time_formats=None    格式列表：['%H:%M:%S', '%H:%M:%S.%f', '%H:%M']
 
FilePathField(ChoiceField)     文件选项，目录下文件显示在页面中
    path,                      文件夹路径
    match=None,                正则匹配
    recursive=False,           递归下面的文件夹
    allow_files=True,          允许文件
    allow_folders=False,       允许文件夹
    required=True,
    widget=None,
    label=None,
    initial=None,
    help_text=''
 
GenericIPAddressField
    protocol='both',           both,ipv4,ipv6支持的IP格式
    unpack_ipv4=False          解析ipv4地址，如果是::ffff:192.0.2.1时候，可解析为192.0.2.1， PS：protocol必须为both才能启用
 
SlugField(CharField)           数字，字母，下划线，减号（连字符）
    ...
 
UUIDField(CharField)           uuid类型
    ...
```

Form：

- 验证功能
- 生成HTML的功能，但是这个不是目的。

保留上一次输入的内容：

```python
def login(request):
    if request.method == 'GET':
        obj = TestForm()
```



Form生成html标签，单独使用意义不大，结合POST请求生成HTML标签更有意义。会携带value属性，带着数据。解决Form上次输入内容。



日后：

- Ajax：仅用作验证功能
- Form：验证功能，生成HTML标签。

Form类中的名字最好和数据库中的字段是一致的，这样就可以直接

models.xxx.objects.create(**obj.cleaned_data)



obj = ClassForm(data = 字典) # 会进行校验

obj = ClassForm(initial = 字典) # 内部不会进行校验，让页面显示初始值

models.Classes.objects.filter(id=nid).update(**obj.cleand_data)



widget = widgets.Select(choices=(

​	(xx,xx),(xx,xx)

))



widget = widgets.Select(choices=models.Classess.objects.values_list('id', 'title')

```python
row = models.Student.objects.filter(id=nid).values('name','email','age','cls_id').first()
obj = StudentForm(initial=row)
```



插件样式的定制

```python
widget = widget.TextInput(attrs={
    'class': 'form-control',
})
```



- 多对多
  - ChoiceField（可被替代）
  - MultipleChoiceField
- 常用插件
  - CheckBox
  - radio
  - input
  - textarea
  - File
- 扩展Extra（比如跟数据库相关的，跟文件相关的）

多选：

widget=widgets.SelectMultiple(choice=models.Classes.objects.values_list('id', 'title'))

自带多选属性就不用加attr了。

但是得到的值是形如：`"['1','2']"`这样列表形式的字符串，是str格式的，`['1','2']`是selectMultiple得到的，转换成字符串是CharField给我们多此一举。这种情况下针对单选的时候用CharField其实是没什么问题的，但是针对多选的话就有问题了。

```python
xx = fields.MultipleChoiceField(
	choice=models.Classes.objects.values_list('id','title'),
    widget=widgets.SelectMultiple
)
# 这些字段都是属于类的静态对象
obj = teacherForm()
1.找到所有字段
2.放到self.fields = {
    # 只执行一遍，tname后面的内容在创建对象的时候仅仅会执行一遍。
    # 以后再使用永远是使用的启动的时候的数据。
    'tname': fields.CharField(min_length=2)
}
因为添加班级后，老师关联的班级不会刷新。因此做以下改造(无法显示动态数据的问题)
改造Form类：
class TeacherForm(Form):
    tname = fields.CharFields(min_length=2)
    xx = fields.MultipleChoiceField(
	# choice=models.Classes.objects.values_list('id','title'),
    widget=widgets.SelectMultiple
	)
    
    def __init__(self, *args, **kwargs):
        # 执行完父类的构造方法以后其实就是什么也没执行，但是多了一个self.fields属性
        super(TeacherForm, self).__init__(*args, **kwargs)
        # 每一次实例化的时候都重新取一次
        self.fields['xx'].choice = models.Classes.objects.values_list('id', 'title')

        可以通过查看父类Form来查看构造方法
        
## 静态方法：
In [1]: class Formtest:
   ...:     a = 'aaa'
   ...:     def __init__(self):
   ...:         self.name = 'lamber'
   ...:         

In [2]: user1 = Formtest()

In [3]: user2 = Formtest()

In [4]: user1.a
Out[4]: 'aaa'

In [5]: user2.a
Out[5]: 'aaa'

In [6]: id(user1.a)
Out[6]: 4335799128

In [7]: id(user2.a)
Out[7]: 4335799128

In [8]: user1.name
Out[8]: 'lamber'

In [9]: user2.name
Out[9]: 'lamber'

In [10]: id(user1.name)
Out[10]: 4332738072

In [11]: id(user2.name)
Out[11]: 4332738072

In [12]: class FormTest2:
    ...:     a = 'bbb'

In [13]: class FormTest2:
    ...:     a = 'bbb'
    ...:     def __init__(self, name)
  File "<ipython-input-13-24a134a61628>", line 3
    def __init__(self, name)
                            ^
SyntaxError: invalid syntax


In [14]: class FormTest2:
    ...:     a = 'bbb'
    ...:     def __init__(self, name):
    ...:         self.name = name
    ...:         

In [15]: a = FormTest2('lamber')

In [16]: b = FormTest2('mxy')

In [17]: a.name
Out[17]: 'lamber'

In [18]: b.name
Out[18]: 'mxy'

In [19]: id(a.name)
Out[19]: 4332738072

In [20]: id(b.name)
Out[20]: 4336020872

In [21]: a.a
Out[21]: 'bbb'

In [22]: id(a.a)
Out[22]: 4310928608

In [23]: b.a
Out[23]: 'bbb'

In [24]: id(b.a)
Out[24]: 4310928608
    
    
解决动态显示还有另外一个办法：
使用django提供的ModelChoiceField和ModelMultipleChoiceField字段来实现
但是并不推荐这个方法
from django import forms
from django.forms import fields
from django.forms import widgets
from django.forms import models as form_model
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
 
class FInfo(forms.Form):
    # 这个方法需要classes类加一个__str__方法然后return self.title
    xx = form_model.ModelMultipleChoiceField(queryset=models.NNewType.objects.all())
    # xx = form_model.ModelChoiceField(queryset=models.Classes.objects.all())
    # 但是这种方法并不推荐使用，适用于代码量比较少或者小的时候可以使用，因为必须结合module使用，耦合性略高。简单的程序可以去使用，推荐使用上面的上面的去操作self.fields的方式。
    
```

那么单选的时候就可以用CharField。ChoiceField只能搞单选：

```python
xx = fields.ChoiceField(
	choice=models.Classes.objects.values_list('id','title'),
    widget=widgets.Select(attrs={'class': 'classxxxx'})
)
```

CharField和ChoiceField本质是一致的因此没什么区别。

多选的情况下如果要插入值的话，可以把那个多选的拿出来：

```python
# pop可以单独把其中一个数据拿出来。因此我们把选择的老师班级拿出来
xx = obj.cleaned_data.pop('xx')
row = models.Teacher.objects.create(**obj.cleaned_data)
# 操作老师上课的关系表
row.c2t.add(*xx)  # xx = ['1','2']
```

编辑老师：

```python
def edit_teacher(request, nid):
    if request.method == 'GET':
        row = models.Teacher.objects.filter(id=nid).first()
        class_ids = row.c2t.values_list('id')
        # 使用内置函数zip去取第一列，class_ids是一个[(1，)，(11，)，……]这样形式的
        id_list = list(zip(*class_ids))[0] if list(zip(*class_ids)) else []
        obj = TeacherForm(initial={
            'tname': row.name,
            'xx': 
        })
    return render(request, 'edit_teacher.html', 'obj':obj)
```

Form常用组件：

```python
class TestForm(Form):
    t1 = fields.CharField(
        widget = widgets.Textarea(attr=字典)
    )
    t2 = fields.CharField(
        # checkbox单选框
        widget=widgets.CheckboxInput
    )
    t3 = fields.MultipleChoiceField(
        # checkbox多选框
        choices = [(1,'basketball')，(2，'soccer')],
        widget=widgets.CheckboxSelectMultiple
    )
    
def test(request):
    obj = TestForm(initial={'t3': [2,3]})
    return render(request, 'test.html', {'obj': obj})


# radio，默认取回来的值只可能有一个，因此使用ChoiceField就可以了。
t4 = fileds.ChoiceField(
    choice=[(1,'basketball')，(2，'soccer')],
    widget=widgets.RadioSelect
)

# 文件上传，提交过来的内容就是Bytes，返回值是一个文件对象。里面包含文件的属性
t5 = fileds.FileField(
    widget=widgets.FileInput
)
```

### Form验证执行流程以及钩子

验证字段is_vaild→self.is_bound and not self.errors如果self.is_bound是true就做绑定元整，否则就返回false

self.errors→self.full_clean()→self.cleaned_data是空的—self._clean_fields—遍历fields中的所有字段；value = fields.clean(value) 把值按照正则做校验。验证成功后：

self.cleaned_data[name] = value

对象中含有‘clean_属性名’，并且可以执行相对应的函数名的函数。也就是说：

```python
# 有如下的代码
class TestForm(Form):
    user = fields.CharField()  # 执行顺序1
    pwd = fileds.CharField()   # 执行顺序3
    
    # 这个函数会在内部被调用，如果有这个方法就执行没有就不执行，内部通过反射去判断的。
    # 上面只能是正则判断，在方法中就可以进行进一步的高级验证了，比如数据库判断
    # 如果正则表达式都没有通过，那么这里的函数就不会执行了。所以在正则没有验证成功后
    # 会抛出一个异常ValidationError然后，假如一个错误
    # self.add_error(name, e)
    # 所以这个扩展函数没有通过的时候我们也可以抛出一个异常添加到error中
    def clean_user(self):   # 执行顺序2
        # clean_user中不能取pwd的值，因为这回pwd的值还不在字典里呢
        # 因此最好只取自己的值，除非在你执行这一部分的时候其他的值已经加进去了。
        v = self.cleand_data['user']
        from django.core.exceptions import ValidationError
        if models.Student.objects.filter(name=v).count():
            # 这里的code就是之前定制的error_message的key
            # 默认不写就是invalid
            raise ValidationError('User exists', code='invalid')
        # 一定要返回一个值，因为django内部要重新赋值，否则会赋值为None
        return xxx
    
    def clean_pwd(self):   # 执行顺序4
        return self.cleaned_data['pwd']
```

验证通过后走下一句self._clean_form(self)，此时self_cleaned_data有值了，否则就是一个空字典→cleaned_data = self.clean()→找到这个self.clean()方法，可以看到注释说明这是一个钩子，用户扩展的。这个我们自己也可以进行自定义:

```python
# 有如下的代码
class TestForm(Form):
    user = fields.CharField()  # 执行顺序1
    pwd = fileds.CharField()   # 执行顺序3

    def clean_user(self):   
        v = self.cleand_data['user']
        from django.core.exceptions import ValidationError
        if models.Student.objects.filter(name=v).count():
            raise ValidationError('User exists', code='invalid')
        return xxx
    
    def clean_pwd(self):   # 执行顺序4
        return self.cleaned_data['pwd']
    
    def clean(self):
        # 举例子做一个联合唯一的判断，对用户和密码做整体判断
        user = self.cleaned_data.get('user')
        email = self.cleaned_data.get('email')
        # 数据库验证
        if models.Student.objects.filter(user=user,email=email).count():
            # 整体存在就别添加了。
            raise ValidationErrors('用户名已经存在')
        return self.cleaned_data
```

最后一个self._post_clean(self)也是用来自定义的。

```python
# 有如下的代码
class TestForm(Form):
    user = fields.CharField()  # 执行顺序1
    pwd = fileds.CharField()   # 执行顺序3

    def clean_user(self):   
        v = self.cleand_data['user']
        from django.core.exceptions import ValidationError
        if models.Student.objects.filter(name=v).count():
            raise ValidationError('User exists', code='invalid')
        return xxx
    
    def clean_pwd(self):   # 执行顺序4
        return self.cleaned_data['pwd']
    
    def clean(self):
        pass
    
    def _post_clean(self):
        """
        也是自定制的内容，一般用不到这个内容
        """
        pass
```

自定义验证规则





## Django文件上传

```python
class F2Form(Form):
    user = fields.CharField()
    fafafa = fields.FileField()
    
    
def f2(request):
    if request.method == 'GET':
        obj = F2Form()
        return render(request, 'f2.html',{'obj':obj})
    else:
        # 文本用data接收，文件用files接收。类型不一样
        obj = F2Form(data=request.POST, files=request.FILES)
        if obj.is_vaild():
            # 文件获取到的是一个文件对象，有文件名啊，文件大小啊等各种属性
            obj.cleaned_data.get('fafafa')
```



```python
class F2Form(Form):
    user = fields.CharField()
    fafafa = fields.FileField()
    
    
def f2(request):
    if request.method == 'GET':
        obj = F2Form()
        return render(request, 'f2.html',{'obj':obj})
    else:
        import os
        # 这里拿到的也是一个文件对象，有name和size等其他属性
        file_obj = request.FILE.get('fafafa')
        # 把文件一点一点的获取到，一块一块的。那么就可以像迭代器一样一块一块的去取
        f = open(os.path.join('static',file_obj.name), 'wb')
        # chunk的size可以自定义，默认chunk_size为64*2**10
        for chunk in file_obj.chunks():
           f.write(chunk)
        f.close()
        return render(request, 'f2.html')

# 这个enctype="multipart/form-data"是要加的，否则后台获取到的数据字典是空的。
# 这个和上传协议有关，加上以后会按照文件的编码进行上传。
<form method="POST" action='/xxx/' enctype="multipart/form-data">
</form>
```



