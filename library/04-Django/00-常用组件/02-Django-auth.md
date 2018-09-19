# Django Auth

> 内容参考：www.cnblogs.com/liwenzhou/p/9030211.html

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

创建超级用户，这样创建的用户其实是会扔到django为我们默认创建的初始表中的auth_user这张表中。

```shell
python manage.py createsuperuser
```

使用这个Auth模块：

```python
from django.contrib import auth
```

auth模块中提供了很多实用的方法，接下来看一下这些方法是如何使用的：

1. authenticate()：提供了用户认证的功能，也就是验证用户名和密码是否正确，一般需要username和password两个关键字参数，如果认证成功，也就是用户名和密码都有效的话，就会返回一个user对象。authenticate()会在该 User 对象上设置一个属性来标识后端已经认证了该用户，且该信息在后续的登录过程中是需要的。

   ```python
   user = authenticate(username='theuser',password='thepassword')
   ```

2. login(HttpRequest,user)：该函数接受一个HttpRequest对象，以及一个经过认证的User对象。该函数实现一个用户登录的功能。它本质上会在后端为该用户生成相关session数据。然后我们就可以使用request.user了

   ```python
   from django.contrib.auth import authenticate, login
      
   def my_view(request):
     username = request.POST['username']
     password = request.POST['password']
     user = authenticate(username=username, password=password)
     if user is not None:
       login(request, user)
       # Redirect to a success page.
       ...
     else:
       # Return an 'invalid login' error message.
       ...
   ```

3. logout(request)：该函数接受一个HttpRequest对象，无返回值。当调用该函数时，当前请求的session信息会全部清除。该用户即使没有登录，使用该函数也不会报错。

   ```python
   from django.contrib.auth import logout
      
   def logout_view(request):
     logout(request)
     # Redirect to a success page.
   ```

4. is_authenticated()：用来判断当前请求是否通过了认证。记住这个是返回来的user对象的方法

   ```python
   def my_view(request):
     if not request.user.is_authenticated():
       return redirect('%s?next=%s' % (settings.LOGIN_URL, request.path))
   ```

5. login_required()：auth 给我们提供的一个装饰器工具，用来快捷的给某个视图添加登录校验。

   ```python
   from django.contrib.auth.decorators import login_required
         
   @login_required
   def my_view(request):
     ...
   ```

   若用户没有登录，则会跳转到django默认的 登录URL '/accounts/login/ ' 并传递当前访问url的绝对路径 (登陆成功后，会重定向到该路径)。

   如果需要自定义登录的URL，则需要在settings.py文件中通过LOGIN_URL进行修改。

   ```python
   LOGIN_URL = '/login/'  # 这里配置成你项目登录页面的路由
   ```

6. create_user()：auth 提供的一个创建新用户的方法，需要提供必要参数（username、password）等。

   ```python
   from django.contrib.auth.models import User
   # 记住不是create而是create_user，这个在密码部分做了加密处理，前者存的是明文，后者存的是密文
   user = User.objects.create_user（username='用户名',password='密码',email='邮箱',...）
   ```

7. create_superuser()：auth 提供的一个创建新的超级用户的方法，需要提供必要参数（username、password）等。

   ```python
   from django.contrib.auth.models import User
   user = User.objects.create_superuser（username='用户名',password='密码',email='邮箱',...）
   ```

8. check_password(password)：auth 提供的一个检查密码是否正确的方法，需要提供当前请求用户的密码。密码正确返回True，否则返回False。

   ```python
   ok = user.check_password('密码')
   ```

9. set_password(password)：auth 提供的一个修改密码的方法，接收 要设置的新密码 作为参数。

   注意：设置完一定要调用用户对象的save方法！！！

   ```python
   user.set_password(password='')
   user.save()
   ```

   **一个修改密码功能的简单案例**

   ```python
   @login_required
   def set_password(request):
       user = request.user
       err_msg = ''
       if request.method == 'POST':
           old_password = request.POST.get('old_password', '')
           new_password = request.POST.get('new_password', '')
           repeat_password = request.POST.get('repeat_password', '')
           # 检查旧密码是否正确
           if user.check_password(old_password):
               if not new_password:
                   err_msg = '新密码不能为空'
               elif new_password != repeat_password:
                   err_msg = '两次密码不一致'
               else:
                   user.set_password(new_password)
                   user.save()
                   return redirect("/login/")
           else:
               err_msg = '原密码输入错误'
       content = {
           'err_msg': err_msg,
       }
       return render(request, 'set_password.html', content)
   ```

## User对象属性

User对象属性：username， password

is_staff ： 用户是否拥有网站的管理权限.

is_active ： 是否允许用户登录, 设置为 False，可以在不删除用户的前提下禁止用户登录。

## Auth中间件

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

get_user：

```python
def get_user(request):
    if not hasattr(request, '_cached_user'):
        request._cached_user = auth.get_user(request)
    return request._cached_user
```

auth模块中的get_user方法：

```python
def get_user(request):
    """
    返回与给定request session相关的user模型示例，如果取不到用户就返回一个匿名用户类AnonymousUser
    的实例。
    """
    from .models import AnonymousUser
    user = None
    try:
        user_id = _get_user_session_key(request)
        backend_path = request.session[BACKEND_SESSION_KEY]
    except KeyError:
        pass
    else:
        if backend_path in settings.AUTHENTICATION_BACKENDS:
            backend = load_backend(backend_path)
            user = backend.get_user(user_id)
            # Verify the session
            if hasattr(user, 'get_session_auth_hash'):
                session_hash = request.session.get(HASH_SESSION_KEY)
                session_hash_verified = session_hash and constant_time_compare(
                    session_hash,
                    user.get_session_auth_hash()
                )
                if not session_hash_verified:
                    request.session.flush()
                    user = None

    return user or AnonymousUser()
```

然后通过`user = backend.get_user(user_id)`去数据库获取数据。

找到Django Auth的中间件，我们可以发现内容如上，只写了一个process_request，内部就是一个断言，内容意思也就是说这个Django的认证组件是依赖于session的中间件的，有了session以后再讲最终封装的结果复制给request.user。

## 扩展自带的auth_user表

> 扩展的目的是因为原本的auth_user表中的字段并不能满足我们的需求，因此需要定制。那么在引用原来的基础model上再进行拓展有几种办法呢？
>
> - 新建一张表，通过一对一和内置auth_user表关联，系统中的auth_user表我们也是可以拿到的，直接通过from引用即可
>
>   ```python
>   from django.contrib.auth.models import User
>   
>   class UserDetail(models.Model):
>       phone = models.CharField(max_length=11)
>       user = models.OneToOneField(to=User)
>   ```
>
> - 通过继承的方式继承User表。只不过在Django Auth Module中继承的不是User表而是一个特殊的表，名字叫AbstractUser。

自己写一个类，继承这个auth_user类，然后自己再写一些自定义类。

```python
# 注意继承的类不是User试AbstractUser
class UserInfo(AbstractUser):
    nid = models.AutoField(primary_key=True)
    phone = models.CharField(max_length=11, null=True, unique=True)
    
    def __str__(self):
        return self.username
    
# 如果使用继承的方式使用了内置的auth，这个时候要在settings里配置，设置一下用户认证的时候默认使用的是哪一张表，因为一旦继承了以后其实相当于覆盖了原来的表
AUTH_USER_MODEL = 'app01.UserInfo'
```

一旦我们指定了新的认证系统所使用的表，我们就需要重新在数据库中创建该表，而不能继续使用原来默认的auth_user表了。所以说创建的时候也要使用`models.Userinfo.object.create_user`这里注意在创建的时候还要遵循之前的规则，只不过模型类是变换成我们自定制的模型类了。注意即使变成了我们自己定义的类，这个auth模块的方法依然是可以正常使用的。

