# Form组件定义

> 

## Form类：

```python
from django.forms import fields, Form, widgets
from django.core.exceptions import ValidationError


# 用户注册相关Form组件定义
class RegisterForm(Form):
    """
    RegisterForm的实例中的fields是一个有序的字典，简单来说也就是我们写的这字段都是有顺序的
    一个一个往下的来匹配的。
    """

    # 用户名form组件
    username = fields.CharField(
        label='用户名',
        max_length=32,
        min_length=6,
        required=True,
        error_messages={
            'required': '用户名不能为空',
            'max_length': '最大长度请不要超过32',
            'min_length': '请输入至少6个字符',
        },
        widget=widgets.TextInput(
            attrs={'class': 'form-control', 'placeholder': '请输入您的用户名', })
        )
    # 用户昵称form组件
    nickname = fields.CharField(
        label='昵称',
        max_length=32,
        min_length=6,
        required=True,
        error_messages={
            'required': '用户名不能为空',
            'max_length': '最大长度请不要超过32个字符',
            'min_length': '请输入至少6个字符',
        },
        widget=widgets.TextInput(
            attrs={'class': 'form-control', 'placeholder': '请输入您的昵称'}
        )
    )
    # 用户邮箱字段
    email = fields.EmailField(
        label='邮箱',
        required=True,
        widget=widgets.TextInput(
            attrs={'class': 'form-control', 'placeholder': '请输入您的密码'}
        )
    )

    # 用户密码form组件
    password = fields.CharField(
        label='密码',
        max_length=32,
        min_length=10,
        required=True,
        error_messages={
            'required': '密码为必填字段，请不要留空',
            'max_length': '最大长度请不要超过32个字符',
            'min_length': '密码长度不要小于10个字符',
        },
        widget=widgets.PasswordInput(
            attrs={'class': 'form-control', 'placeholder': '请输入您的密码'}
        )
    )
    # 确认密码form组件
    re_password = fields.CharField(
        label='确认密码',
        max_length=32,
        min_length=10,
        required=True,
        error_messages={
            'required': '密码为必填字段，请不要留空',
            'max_length': '最大长度请不要超过32个字符',
            'min_length': '密码长度不要小于10个字符',
        },
        widget=widgets.PasswordInput(
            attrs={'class': 'form-control', 'placeholder': '请再次输入您的密码'},
        ),
    )
    # 头像字段
    avatar = fields.FileField(
        required=False,
        widget=widgets.FileInput(
            attrs={'id': 'imgSelect', },
        )
    )
    # 验证码字段
    auth_code = fields.CharField(
        label='验证码',
        error_messages={
            'required': '验证码不能为空'
        },
        widget=widgets.TextInput(
            attrs={'class': 'form-control', 'placeholder': '验证码', },
        ),
    )
```

如上代码所示，分别定义了用户名，昵称，密码，确认密码，邮箱字段，头像以及验证码的字段。需要注意的就是在使用widget挂件的时候，要指定对应的挂件类型，比如密码就是`widgets.PasswordInput`文件类型的就是`widgets.FileInput`；为了让form类在前端调用的时候能够携带对应的BootStrap样式，我们这里就给每个form类属性加上了widget挂件通过设置attr，设置对应input的标签的css类。那么如何放到对应的前端页面呢，其实很简单。

## 视图函数

这里我们默认发送get请求的时候就给客户端返回一个前端页面

```python
def register(request):
    """
    注册相关视图函数
    :param request:
    :return:
    """
    if request.method == "GET":
        obj = RegisterForm(request)
        return render(request, 'register.html', {'obj': obj})
```

对应的html页面，值得注意的几个点如下：

- 不要忘记写csrf_token
- 因为我们的上传还要上传头像，头像图片属于稳健所以要指定enctype，不能用默认的。
- label和对应的input框进行绑定，注意label的for的值为`obj.xxx.id_for_label`。因为对应的这个input的框的require id是随机生成的。
- errors中对应的字段不一定有值，也就是这个字段不一定出错，因此要判断一下，是否显示这个包含错误的span标签。
- 目前使用的是上下模式的form表单，label显示在上，input框显示在下，BootStrap还提供了水平模式的（.form-horizontal），在`.form-control`中的input是`width:100%`撑开的，因此当我们要设置验证码的时候如果要让验证码的输入框和验证码显示在同一行，需要再设置input框的宽度减小一些，否则验证码就会被挤到下一行。将input的宽度百分比减小，向左浮动，验证码向右浮动，父级清除浮动即可。
- 头像是通过绝对定位定位到最上面的，通过一个img标签和一个type为file的input框联合实现的，很简单把img和input设置一样的宽高，然后通过定位让这俩标签重合在一起，最后把input的透明度设置为0，这个时候，就只能看到img，但是input仍然存在，就会实现一种点击img实际上是触发一个上传的操作。

```html
<div id="register">
    <form novalidate action="/register/" method="post" enctype="multipart/form-data">
        {% csrf_token %}
        <div class="form-group">
            <label for="{{ obj.username.id_for_label }}">{{ obj.username.label }}</label>
            {{ obj.username }}
            {% if obj.errors.username %}
                <span>{{ obj.errors.username.0 }}</span>
            {% endif %}
        </div>
        <div class="form-group">
            <label for="{{ obj.nickname.id_for_label }}">{{ obj.nickname.label }}</label>
            {{ obj.nickname }}
            {% if obj.errors.nickname %}
                <span>{{ obj.errors.nickname.0 }}</span>
            {% endif %}
        </div>
        <div class="form-group">
            <label for="{{ obj.email.id_for_label }}">{{ obj.email.label }}</label>
            {{ obj.email }}
            {% if obj.errors.email %}
                <span>{{ obj.errors.email.0 }}</span>
            {% endif %}
        </div>
        <div class="form-group">
            <label for="{{ obj.password.id_for_label }}">{{ obj.password.label }}</label>
            {{ obj.password }}
            {% if obj.errors.password %}
                <span>{{ obj.errors.password.0 }}</span>
            {% endif %}
        </div>
        <div class="form-group">
            <label for="{{ obj.re_password.id_for_label }}">{{ obj.re_password.label }}</label>
            {{ obj.re_password }}
            {% if obj.errors.re_password %}
                <span>{{ obj.errors.re_password.0 }}</span>
            {% endif %}
        </div>
        <div class="form-group">
            <label for="{{ obj.auth_code.id_for_label }}">{{ obj.auth_code.label }}</label>
            <div class="authcode clearfix">
                {{ obj.auth_code }}
                {% if obj.errors.auth_code %}
                    <span>{{ obj.errors.auth_code.0 }}</span>
                {% endif %}
                <img src="/auth_code/" alt="" title="点击更新">
            </div>
        </div>
        <button type="submit" class="btn btn-primary btn-block">注册</button>
        <div class="avatar">
            <img id='previewimg' src="/static/imgs/head/default/default1.jpg" alt="">
            {{ obj.avatar }}
        </div>
    </form>

</div>
```

**CSS**

```less
@charset "utf-8";

/* css reset reference https://cssreset.com/ */
// 这里的这个html和body都要设置高度，不设置html只设置body是不会生效的。
html, body {
  height: 100%;
}

div#register {
  position: relative;
  border: 1px solid #000;
  border-radius: 6px;
  padding: 50px 15px 20px;
  width: 400px;
  left: 50%;
  top: 50%;
  margin-left: -200px;
  margin-top: -250px;
  .form-group{
    position: relative;
    span{
      text-indent: 1em;
      width:250px;
      height: 30px;
      line-height: 30px;
      font-size: 14px;
      position: absolute;
      top: 26px;
      left: 400px;
      border-radius: 4px;
      background-color: #c1e2b3;
      &:before{
        position: absolute;
        content: "";
        width: 0;
        height: 0;
        right: 100%;
        top: 10px;
        border-top: 5px solid transparent;
        border-right: 10px solid #c1e2b3;
        border-bottom: 5px solid transparent;
      }
    }
  }
  .avatar {
    width: 100px;
    height: 100px;
    border: 1px solid lightgray;
    border-radius: 50px;
    box-shadow: 0 0 3px gray;
    overflow: hidden;
    background: red;
    position: absolute;
    top: -60px;
    left: 160px;
    img {
      width: 100px;
      height: 100px;
      position: absolute;
    }
    input {
      width: 100px;
      height: 100px;
      position: absolute;
      opacity: 0;
    }
  }
  .authcode {
    input {
      /* 
      Bootstrap默认会使form-control下的所有input的width为100%，为了让input和这个验证码
      在一行显示，因此单独设置一下这个input框的占用宽度的百分比。
       */
      width: 65%;
      float: left;
    }
    img{
      float: right;
      border: 1px solid #000000;
    }
  }
}
```





