# Django Auth

```python
# session添加过程
1.生成特殊字符串
2.以生成的特殊字符串为key，在数据库的session表中对应一个session value
3.在响应中向浏览器写了一个cookie，cookie的值就是这个特殊的字符串

# 登录校验装饰器
from functools import wraps
def check_login(f):
    # 装饰器修复技术
    @wraps(f)
    def inner(request, *args, **kwargs):
        if request.session.get('is_login') == '1':
            return f(request, *args, **kwargs)
        else:
            return redirect("/login")
```

## Auth模块的简单实用

- 创建用户，这样创建的用户其实是会扔到django为我们默认创建的初始表中的auth_user这张表中。

  ```shell
  python manage.py createsuperuser
  ```

  

```python
class AuthenticationMiddleware(MiddlewareMixin):
    def process_request(self, request):
        assert hasattr(request, 'session'), (
            "The Django authentication middleware requires session middleware "
            "to be installed. Edit your MIDDLEWARE%s setting to insert "
            "'django.contrib.sessions.middleware.SessionMiddleware' before "
            "'django.contrib.auth.middleware.AuthenticationMiddleware'."
        ) % ("_CLASSES" if settings.MIDDLEWARE is None else "")
        request.user = SimpleLazyObject(lambda: get_user(request))
```





## 扩展自带的auth_user表

1. 新建一个表，然后一对一关联上面的auth_user表，就可以进行关联了。

2. 自己写一个类，继承这个auth_user类，然后自己再写一些自定义类。

   ```python
   # 注意继承的类不是User试AbstractUser
   class UserInfo(AbstractUser):
       ……………………
       
   # 如果使用继承的方式使用了内置的auth，这个时候要在settings里配置，设置一下用户认证的时候默认使用的是哪一张表，因为一旦继承了以后其实相当于覆盖了原来的表
   AUTH_USER_MODEL = 'app01.UserInfo'
   ```

   



# 表结构设计







## 验证码

使用极验：https://docs.geetest.com/install/deploy/server/python

