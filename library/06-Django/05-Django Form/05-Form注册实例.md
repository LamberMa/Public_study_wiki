# Form注册实例

> 比如我现在要做一个注册页面，要使用

Form类：

```python
from django.forms import fields, Form, widgets
from django.core.exceptions import ValidationError


# 用户注册相关Form组件定义
class RegisterForm(Form):

    # 用户名form组件
    username = fields.CharField(
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
    # 用户密码form组件
    password = fields.CharField(
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
    avatar = fields.FileField(
        required=False,
        widget=widgets.FileInput(
            attrs={'id': 'imgSelect', },
        )
    )
    auth_code = fields.CharField(
        error_messages={
            'required': '验证码不能为空'
        },
        widget=widgets.TextInput(
            attrs={'class': 'form-control', 'placeholder': '验证码', },
        ),
    )
```

如上代码所示，分别定义了用户名，昵称，密码，确认密码，头像以及验证码的字段。