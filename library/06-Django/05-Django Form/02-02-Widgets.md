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

### 使用说明

- 单选下拉菜单，虽然这里显示的是名称，但是提交的却是id，所以可以直接更新或者修改数据库。

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
      
  # 单选还可以使用ChoiceField，并且ChoiceField也只能搞单选。搞单选的时候CharField和ChoiceField本质一致，区别不大，因此都可以用来生成单选下拉框。
  xx = fields.ChoiceField(
  	choice=models.Classes.objects.values_list('id','title'),
      widget=widgets.Select(attrs={'class': 'classxxxx'})
  )
  ```

- 让我们的组件应用css的样式

  ```python
  # 当然attrs里面可以写很多属性，class只是其中之一而已。
  widget = widget.TextInput(attrs={
      'class': 'form-control',
  })
  ```

- 多选下拉框

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
  	choice=models.Classes.objects.values_list('id','title'),
      widget=widgets.SelectMultiple
  )
  ```

  









Django的内置插件

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

# 