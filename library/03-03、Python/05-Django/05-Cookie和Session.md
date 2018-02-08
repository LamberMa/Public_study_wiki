# Cookie & Session

## Cookie

- cookie是保存在浏览器上的键值对。可以放多对，敏感信息不放在这里。
- 服务端可以向用户浏览器端写cookie
- 客户端每次发送请求的时候，会携带cookie去。Cookie是携带在请求头中的。
- Cookie一般情况下是用来做用户登录的。
- 在发送HTTP请求的时候，在请求中携带当前所有可访问的cookie

首先去请求的cookie中获取凭证：tk

```python
tk = request.COOKIES.get('ticket')
if not tk:
    return render(xxxxx)


# 登录成功之后
判断密码正确以后：
obj = redirect('classes')
# obj = render('xxxxx')
# obj = HttpResponse('xxx')
# max_age 超时时间是10s,expires是具体的超时日期，和max_age二者择其一就可以
# 推荐使用max_age
from datetime import datatime, timedelta
ct = datetime.utcnow()
interval = timedelta(seconds=10)
new_time = ct + v
obj.set_cookie('ticket', 'xxxxxxx', max_age = 10，expires=new_time, path='/', domain=None, secure=False, httponly='False')
# path 可以指定cookie在某个指定url下使用，某些url下不使用。比如指定/classses/，那么其他的路径下就获取不到这个cookie了。默认是/也就是所有的url都能读取到。
# domain表示指的是在访问某个域名的时候才能获取到这个cookie。默认就是当前域名，一般多用于SSO单点登录。
# secure是给https提供的功能。如果是https网站要改为true
# httponly表示只能自http请求中传入，js代码无法获取到。
return obj

在检查元素中的network 找到cookie就可以查看cookie的内容了


```

Django扩展签名cookie

```django
obj.set_signed_cookie('ticket', 'xxxx', salt='jjjj')

# 读取的时候要按照如下的方式，下面获取到的内容是去掉签名的字符串
request.get_signed_cookie('ticket', salt='jjjj')

自定义加密方法，django默认不是走的md5：
SIGNING_BACKEND = '模块.定义类'
```



装饰器实现cookie的判断

```python
def get_cookie(*args, **kwargs):
    def wrapper(func)
    
 
```

作业：

- 布局+代码
- 登录cookie+装饰器实现登录
- 布局页面的HTML+CSS

Cookie是什么？

```
保存在客户端浏览器上的键值对
```

Session

```shell
保存在服务器端的数据，本质也是键值对。
应用：依赖cookie，因为给客户端的字符串是保存在cookie中的
作用：会话保持(Web网站)
好处：敏感信息不会直接给客户。

用户信息保存在服务器端，以键值对形式，key为随机字符串，value为用户数据，仅给客户端发随机字符串。以后谁拉着随机字符串来，那么对应的值就可以取到。

# 登录设置session
1.生成随机字符串
2.通过cookie发送给客户端
3.服务端保存[随机字符串：{当前用户字典信息}]
request.session['username'] = 'alex'  # 这一句话就上面三件事全做了。
request.session['email'] = '1020561033@qq.com'
对应的用户字典信息就生成了。

那么程序里对应的内容放在哪里呢？
在Django里默认没放在字典里，而是放在数据库表里，放到django_session这张表里了。
对应的key就是生成的随机字符串，session_data就是键值对的value
Django内部针对这个value做了一个加密

# 登录页判断(敏感信息不给用户，只给字符串，我再服务器想存什么就存什么)
1、获取客户端cookie中的随机字符串  #Django内部帮你去cookie中取值了。
2、去session中查找有没有对应的随机字符串
3、去session对应的key的value中看看有没有对应的username

def index(request):
	v = request.session.get('username')
	if v:
		return HttpResponse('登录成功：%s' %v)
	else:
		return redirect('/login/')
```

```
del request.session['k1']
这个删除的k1是cookie的随机字符串对应的session_data中的k1，而不是删除随机字符串。

def index(request):
        # 获取、设置、删除Session中数据
        request.session['k1']
        request.session.get('k1',None)
        request.session['k1'] = 123
        request.session.setdefault('k1',123) # 存在则不设置
        del request.session['k1']
 
        # 所有 键、值、键值对
        request.session.keys()
        request.session.values()
        request.session.items()
        request.session.iterkeys()
        request.session.itervalues()
        request.session.iteritems()
 
 
        # 用户session的随机字符串
        request.session.session_key
 
        # 将所有Session失效日期小于当前日期的数据删除
        request.session.clear_expired()
 
        # 检查 用户session的随机字符串 在数据库中是否
        request.session.exists(request.session.session_key)
 
        # 删除当前用户的所有Session数据
        request.session.delete(request.session.session_key)
 
        request.session.set_expiry(value)
            * 如果value是个整数，session会在些秒数后失效。
            * 如果value是个datatime或timedelta，session就会在这个时间后失效。
            * 如果value是0,用户关闭浏览器session就会失效。
            * 如果value是None,session会依赖全局session失效策略。
```

根据Django的规定，默认的情况下cookie会在浏览器保存两周

```
a. 配置 settings.py
 
    SESSION_ENGINE = 'django.contrib.sessions.backends.cache'  # 引擎
    SESSION_ENGINE = 'django.contrib.sessions.backends.db'
    SESSION_CACHE_ALIAS = 'default'                            # 使用的缓存别名（默认内存缓存，也可以是memcache），此处别名依赖缓存的设置
 
 
    SESSION_COOKIE_NAME ＝ "sessionid"                        # Session的cookie保存在浏览器上时的key，即：sessionid＝随机字符串
    SESSION_COOKIE_PATH ＝ "/"                                # Session的cookie保存的路径
    SESSION_COOKIE_DOMAIN = None                              # Session的cookie保存的域名
    SESSION_COOKIE_SECURE = False                             # 是否Https传输cookie
    SESSION_COOKIE_HTTPONLY = True                            
    # 是否Session的cookie只支持http传输
    
    SESSION_COOKIE_AGE = 1209600                              
    # Session的cookie失效日期（2周）
    
    SESSION_EXPIRE_AT_BROWSER_CLOSE = False                   
    # 是否关闭浏览器使得Session过期
    
    SESSION_SAVE_EVERY_REQUEST = False                        
    # 是否每次请求都保存Session，默认修改之后才保存
    # False从一开始，这个时间段后超时。
    # True每次请求都会计算，规定时间以内就不会超时。最好设置成True，让他每次都更新。
    
    
    
    
SESSION_FILE_PATH = None
# 如果缓存文件路径为None，那么就使用tempfile模块获取一个临时地址
# tempfile.gettempdir()

SESSION_ENGINE = 'django.crotrib.sessions.backends.signed_cookies'
这个不要用，这相当于给cookies加了个签名，相当于不用session了。


```

Django指定session存放的位置，默认是存放在数据库。



装饰器判断session存在不存在



前端模板默认能拿到request这个模板变量

比如：request.session.userinfo.nickname

