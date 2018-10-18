# 使用Form生成HTML

[TOC]

## 简单实现

> widget,label,disabled,label_suffix,initial,help_text其实是放在一起使用的，他可以帮你自动生成html标签。生成html标签不是目的，

先写一个测试的form类：

```python
# 实质就是返回fields.CharField内部的__str__方法返回一串html代码字符串
class TestForm(Form):
    t1 = fields.CharField(
        max_length=10,
        required=True, 
        label="用户名",
        help_text="我是这个输入框的帮助信息",
        # 表单的默认值
        initial='666',
    )
```

然后在视图函数中调用

```python
def testform(request):
    if request.method == "GET":
        obj = form.TestForm()
        return render(request, 'testform.html', {
            'obj': obj,
        })
    else:
        pass
```

在前端视图模板中进行调用：

```html
<form method="post" id="f1">
    {% csrf_token %}
    {{ obj.t1.label }}  # 这样调用只是简单的显示出来
    {{ obj.t1 }}
    {{ obj.t1.help_text }}   # 这样调用只是简单显示，但是并不是这么用的。
    <input type="submit">
</form>
```

在前端界面就会生成如下的input输入框，这个就是form为我们生成的。

![](http://omk1n04i8.bkt.clouddn.com/18-3-27/6070256.jpg)

其实比起上面的这种调用方式还有一种更为简单的调用方式：

```python
# 这种方式的实现原理是去对象把所有的字段找到，然后生成html标签，对应的参数也会应用上，比如help_text，label_suffix这种参数都会被应用。这种方法其实不太灵活
{{ obj.as_p }}
{{ obj.as_ul }}
{{ obj.as_table }}

# 使用ul的时候记得在外层套一个ul标签，生成table的时候在外面套一个table标签；这俩内容只生成标签内部的东西。
```

两种方法都可以使用，一个简单，一个控制灵活，因此如果真要用的话建议使用控制更为灵活的。范例如下

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

# 这里注意一下这个id_for_label的用法
<form>
    <div class="form-group">
        <label for="{{ obj.username.id_for_label }}">用户名</label>
        {{ obj.username }}
    </div>
</form>

# 会生成如下的html，实现label和input的捆绑
<div class="form-group">
    <label for="id_username">用户名</label>
    <input type="text" name="username" class="form-control" placeholder="请输入您的用户名" maxlength="32" minlength="6" required="" id="id_username">
</div>
```

## 保存用户上次的数据

```python
def testform(request):
    if request.method == "GET":
        # 在这里生成的是一个不带value值的input标签
        obj = form.TestForm()
        return render(request, 'testform.html', {'obj': obj,})
    else:
        # 先别管用户数据对不对，用户提交的数据肯定是过来了
        # 那么就会生成一个input标签带着value值，值为用户输入的值(因为传递了用户的POST数据)
        obj = form.TestForm(request.POST)
        if obj.is_valid():
            # 数据验证部分
            print(obj.cleaned_data)
        else:
            # 数据验证失败
            print(obj.errors)
        return render(request, 'testform.html', {'obj': obj})
```

Form生成html标签，单独使用意义不大，结合POST请求生成HTML标签更有意义。会携带value属性，带着数据。解决Form上次输入内容。目前为止比较流行的浏览器都会为我们做一部分验证，我们在学习调试的过程中为了避免干扰可以在form表单中添加`novalidate`属性来规避这个问题。当然实际生产中当然是不要加这个参数，白给的一个验证为什么不加，对吧~

## 修改数据

> 一般修改数据的时候，要显示原来的数据，那么怎么让数据在修改的时候显示初始化的一个原来的值呢？

```python
# 这个字典就是你从数据库取出来的一个原来的数据，那么你在数据库取数据的时候你就得考虑一下怎么取数据了，应该用values给取出来一个字典放在这里
# 默认也可以直接在这放一个字典，因为默认的就是data=字典，你不写这个data的时候默认就是data，系统会默认给你补上。而且这种方式会默认进行校验，也就是你这个默认初始值不对的话可是会报错的。放到obj.errors中。
obj = ClassForm(data = 字典) 
```

如果想要默认不进行校验的话需要传递另外一个参数，initial参数。这样就不会进行校验了。

```python
obj = ClassForm(initial = 字典) # 内部不会进行校验，让页面显示初始值

# 示例
row = models.Student.objects.filter(id=nid).values('name','email','age','cls_id').first()
obj = StudentForm(initial=row)
# 体现预先选中的效果，value为1，2，3的会被提前默认选中
# obj = xxxForm(initial={'name':xxxx, '多选框字段': [1,2,3])
```

## 数据的更新

当修改后的数据提交过来以后，如何进行更新，和create的时候差不多，注意的是，针对更新的是针对某一个数据更新，记得要做一次内容的过滤（filter）：

```python
# 同样支持传递一个字典的方式进行更新。
models.Classes.objects.filter(id=nid).update(**obj.cleand_data)
```

### Tips

**添加数据的小技巧**

小提醒，一般要插入数据库的一些内容，我们在定制Form组件的时候，我们的字段名称要和数据库中的字段名称是一致的，因为orm在create数据的时候是允许填入一个字典的，比如：

```python
models.xxx.objects.create(**obj.cleaned_data)
```

这样我们就可以方便的去添加用户数据了，这样插入数据就方便很多了。

## widget挂件

> 上面说了这么多，又有label，又有什么help_text，其实这一堆东西都是不建议使用，当然除了widget，widget其实是用来定制生成怎样的html的。

用widget来指定生成的html标签是哪一种

```python
from django.forms import widgets

# 指定生成的html标签是哪一种
widget = widgets.Select
```

### 单选下拉框

单选下拉菜单，虽然这里显示的是名称，但是提交的却是id，所以可以直接更新或者修改数据库。

```python
# 这里其实choices接收的是一个列表（元组），列表中是一个个的小元组，那么我们就可以利用orm的values_list来取出来对应的格式。
"""
widget = widgets.Select(choices=(
	(xx,xx),(xx,xx)
))
"""
class xxxForm(Form):
    gender = fields.IntegerField(
        widget=widgets.Select(choices=models.xxx.objects.values_list('id', 'other_colume'))
    )
    
# 单选还可以使用ChoiceField，并且ChoiceField也只能搞单选。搞单选的时候IntergerField和ChoiceField本质一致，区别不大，因此都可以用来生成单选下拉框。
xx = fields.ChoiceField(
	choice=models.Classes.objects.values_list('id','title'),
    widget=widgets.Select(attrs={'class': 'classxxxx'})
)
```
### 应用样式属性

让我们的组件应用css的样式

```python
# 当然attrs里面可以写很多属性，class只是其中之一而已。
widget = widget.TextInput(attrs={
    'class': 'form-control',
})
```
### 多选下拉框

```python
# 因为是多选的，是以widget要使用SelectMultiple，而不是Select，一旦使用了Select那么就说明我要生成的是单选的，即使你在widget中添加一个attr为'multiple'的属性也是不可以的。异常的表现就是不管你前端多选了一个，最后在后台获取到的提交的数据之后一个。
# 因为它在内部是使用request.POST.get('xx')去获取的，那么只能获取到一个
# 要获取多个是request.POST.get_list，因此这里拿到的是一个数据。
# 修改为以下的写法
class xxxForm(Form):
    teacher = fields.CharField(widget=widgets.SelectMultiple(choice=models.xxx.objects.values_list('id', 'title')))

    
# 显示到前端以后查看的话其实显示是正常的，但是提交的时候我们会发现一个问题。比如我选了id为1号和2号的，根据我们的理解应该提交上来一个列表里，包含着1和2。但是到这里还不对。
# 得到的值是形如："['1','2']"这样列表形式的字符串，是str格式的，['1','2']是selectMultiple得到的，转换成字符串是CharField给我们多此一举。这种情况下针对单选的时候用CharField其实是没什么问题的，但是针对多选的话就有问题了。因此就不能使用CharField了。
# 因此使用多选的时候要使用MultipleChoiceFiled+choices结合使用。
xx = fields.MultipleChoiceField(
	choices=models.Classes.objects.values_list('id','title'),
    widget=widgets.SelectMultiple
)
```

如果数据正确的话那么就应该添加数据了，有的时候可能要多表添加，或者你获取的字段并不是所有字段都需要作为添加的内容，因此有时候一个提交过来的大字典里要剔除去一些字段就可以使用pop

```python
# pop可以单独把其中一个数据拿出来。假如有这么一个关系，比如添加老师的时候，在前台填写的时候肯定是把老师以及老师任教班级这个关系都写上，但是如果是一个新老师的话还得添加新老师，所以应该先加老师，但是提交过来的任教班级又不能添加到老师表里，因此我们把选择的老师班级拿出来。
xx = obj.cleaned_data.pop('xx')
row = models.Teacher.objects.create(**obj.cleaned_data)
# 然后再操作老师上课的关系表
row.c2t.add(*xx)  # xx = ['1','2']
```

#### 解决静态字段不能实时显示的bug

> 问题背景：比如我们要维护一个教务系统，要添加老师，添加老师的时候除了有老师的基本信息外，还有老师的所属班级，班级有一个单独的班级表，老师表是外键过去的。现在程序启动起来以后我实时的添加班级，但是发现在添加老师的时候在多选列表中并没有显示我们之前新添加的内容。这就是我们这里说到的一个实时显示的bug问题。

首先回顾一下静态方法

```python
In [1]: class FormTest2:
    ...:     a = 'bbb'
    ...:     def __init__(self, name):
    ...:         self.name = name        

In [2]: a = FormTest2('lamber')

In [3]: b = FormTest2('mxy')

In [4]: a.name
Out[4]: 'lamber'

In [5]: b.name
Out[5]: 'mxy'

In [6]: id(a.name)
Out[6]: 4332738072

In [7]: id(b.name)
Out[7]: 4336020872

In [8]: a.a
Out[8]: 'bbb'

In [9]: id(a.a)
Out[9]: 4310928608

In [10]: b.a
Out[10]: 'bbb'

In [11]: id(b.a)
Out[11]: 4310928608
```

通过上面的例子可以发现，其中这个变量a属于类的静态数据，实例化以后的内存地址也都是指向的同一块。我们在书写Form组件的时候，其实每一个字段都是这个Form组件类的一个静态字段。看一下我们这个多选的静态字段是如何实现的：

```python
xx = fields.MultipleChoiceField(
    choices=models.Classes.objects.values_list('id', 'title'),
    widget=widgets.SelectMultiple
)
```

那么我们在实例化调用的时候：

```python
# 这些字段都是属于类的静态对象
obj = teacherForm()
1.找到所有字段
2.放到self.fields = {
    # 只执行一遍，tname后面的内容在创建对象的时候仅仅会执行一遍。
    # 以后再使用永远是使用的启动的时候的数据。
    'tname': fields.CharField(min_length=2)
}
```

因为这个班级属于静态字段，再次实例化的时候使用的一直是启动时候的数据，因此添加班级的时候，老师关联的班级并不会刷新，因此我们针对这个问题要对这个Form类做一下改造。

```python
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
        # 这样处理更加灵活，可以使列表，又可以是字典等。
        self.fields['xx'].choice = models.Classes.objects.values_list('id', 'title')

        可以通过查看父类Form来查看构造方法
```

解决动态显示还有另外一个办法，使用django提供的ModelChoiceField和ModelMultipleChoiceField字段来实现。但是并不推荐这个方法：

```python
from django import forms
from django.forms import fields
from django.forms import widgets
from django.forms import models as form_model
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
 
class FInfo(forms.Form):
    # 这个方法需要对应的model的classes类加一个__str__方法然后return self.title，因为默认显示的其实是对象，而不是这个数据的名称，value是值。所以要单独加__str__方法。
    xx = form_model.ModelMultipleChoiceField(queryset=models.NNewType.objects.all())
    # xx = form_model.ModelChoiceField(queryset=models.Classes.objects.all()) 单选
    # 但是这种方法并不推荐使用，适用于代码量比较少或者小的时候可以使用，因为必须结合model使用（比如给model加一个__str__方法），耦合性略高。简单的程序可以去使用，推荐使用上面的上面的去操作self.fields的方式。
    # 毕竟我们自己取数据字段值不依赖于__str__方法，相对更加也灵活性，因此继承也是推荐的方法。
```

### 其他常用插件

```python
class TestForm(Form):
    t1 = fields.CharField(
        # widget = widgets.PasswordInput
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

### 内置插件

```python
TextInput(Input)
NumberInput(TextInput)
EmailInput(TextInput)
URLInput(TextInput)
PasswordInput(TextInput)
HiddenInput(TextInput)
Textarea(Widget)
DateInput(DateTimeBaseInput)
DateTimeInput(DateTimeBaseInput)
TimeInput(DateTimeBaseInput)
CheckboxInput
Select
NullBooleanSelect
SelectMultiple
RadioSelect
CheckboxSelectMultiple
FileInput
ClearableFileInput
MultipleHiddenInput
SplitDateTimeWidget
SplitHiddenDateTimeWidget
SelectDateWidget
```

## 小结

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