# Cookie & Session

> 相关参考文档：http://www.cnblogs.com/wupeiqi/articles/5246483.html

## Cookie

- cookie是保存在浏览器上的键值对。可以放多对，敏感信息不放在这里。
- 服务端可以向用户浏览器端写cookie
- 客户端每次发送请求的时候，会携带cookie去。Cookie是携带在请求头中的。在浏览器的请求头中，可以存在多个cookie，每一个cookie键值对用分号隔开；
- Cookie一般情况下是用来做用户登录的。
- 在发送HTTP请求的时候，在请求中携带当前所有可访问的cookie

首先去请求的cookie中获取凭证：tk

```python
# 如果获取不到cookie，就让它跳转到登录。
tk = request.COOKIES.get('ticket')
if not tk:
    return render('/login/')

# 登录成功之后，判断密码正确以后，我要给你的浏览器回写cookie。平常redirect都是直接用
# 现在我要用redirect给你返回一个对象，这个对象有一个set_cookie方法用来给浏览器回写cookie。
# 这里用redirect，Httpresponse，render其实都是没有问题的，当我们想要给请求响应头塞点东西的时候
# 就要用到这样的写法了，obj = HttpResponse('xx')，然后obj.set_cookie给头部塞内容。
obj = redirect('classes')

# max_age 超时时间是10s,expires是具体的超时日期，和max_age二者择其一就可以
# 推荐使用max_age，By the way，时间的加减可以使用timedelta。
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

接下来，在检查元素中的network 找到cookie就可以查看cookie的内容了
```

Django扩展签名cookie，解决写入的cookie是明文的问题。

```python
# 给我们的cookie加盐，进行加密操作。本质其实还是调用的set_cookie方法，只不过在调用之前多用了一步个步骤，针对value做了一个加密的操作。
obj.set_signed_cookie('ticket', 'xxxx', salt='jjjj')

# 读取的时候要按照如下的方式，下面获取到的内容是去掉签名的字符串
request.get_signed_cookie('ticket', salt='jjjj')

# 看一下这个代码，这个是调用signing下的get_cookie_signer获取到一个对象，然后调用对象的value方法去获取最新的value返回值
def set_signed_cookie(self, key, value, salt='', **kwargs):
    value = signing.get_cookie_signer(salt=key + salt).sign(value)
    return self.set_cookie(key, value, **kwargs)

# 这个由singing的get_cookie_signer生成的是django.core.signing.TimestampSigner的对象
# 这里看到的其实就是用的这样一个时间戳的签名类去做的签名方法。在这里可以看到sign方法的详细内容
class TimestampSigner(Signer):

    def timestamp(self):
        return baseconv.base62.encode(int(time.time()))

    def sign(self, value):
        value = '%s%s%s' % (value, self.sep, self.timestamp())
        return super().sign(value)

    def unsign(self, value, max_age=None):
        """
        Retrieve original value and check it wasn't signed more
        than max_age seconds ago.
        """
        result = super().unsign(value)
        value, timestamp = result.rsplit(self.sep, 1)
        timestamp = baseconv.base62.decode(timestamp)
        if max_age is not None:
            if isinstance(max_age, datetime.timedelta):
                max_age = max_age.total_seconds()
            # Check timestamp is not older than max_age
            age = time.time() - timestamp
            if age > max_age:
                raise SignatureExpired(
                    'Signature age %s > %s seconds' % (age, max_age))
        return value

# 现在了解上面的签名逻辑以后，知道django默认的走的不是md5的加密，那么这个我们就可以自己定制了。
# 自定义加密方法，修改全局配置文件。这个新定义的类就是我们自己写的一个加解密的过程。这里的这个类就相当于上面的那个TimestampSigner。
SIGNING_BACKEND = '模块.定义类'

# 在原基础上进行重写。
from diango.core.signing import TimestampSigner
class MySigner(TimestampSigner):
    def sign(self, value):
        # 对原方法进行重写
        
    def unsign(self, value, max_age=None):
        # 对原方法进行重写
```

学习完cookie以后，我们可能会在很多的视图函数中用到这个cookie的验证，去验证用户是否登录，是否有对应的cookie，针对这个操作不可能说在每一个视图函数中都写这个cookie的验证逻辑，因此可以装饰器来实现cookie的判断。

## Session

### Session使用

保存在服务器端的数据，本质也是键值对。用户信息保存在服务器端，以键值对形式，key为随机字符串，value为用户数据，仅给客户端发随机字符串。以后谁拿着随机字符串来，那么对应的值就可以取到。

- 应用：依赖cookie，因为给客户端的字符串是保存在cookie中的
- 作用：会话保持(Web网站)
- 好处：敏感信息不会直接给客户。

```shell
# 登录设置session
1.生成随机字符串
2.通过cookie发送给客户端
3.服务端保存[随机字符串：{当前用户字典信息}]

request.session['username'] = 'alex'  # 这一句话就上面三件事全做了。
request.session['email'] = '1020561033@qq.com'

# 下面的这种写法可以针对不同种类的键值对进行分类，对应的用户字典信息就生成了。
request.session['userinfo'] = {
  'user_id': obj.id,
  'gender': gender,
  ……
}

# 那么程序里对应的内容放在哪里呢？
# 在Django里默认没放在字典里，而是放在数据库表里，放到django_session这张表里了。
# 对应的key就是生成的随机字符串，session_data就是键值对的value
# Django内部针对这个value做了一个加密
# 登录页判断(敏感信息不给用户，只给字符串，我再服务器想存什么就存什么)
# 在前端的模板可以直接通过request去调用，比如{{ request.session.username }}
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
### Session常用操作

```python
# 获取、设置、删除Session中数据
request.session['k1']
# 避免取不到报错的问题
request.session.get('k1',None)
request.session['k1'] = 123
request.session.setdefault('k1',123) # 存在则不设置

# 这个删除的k1是cookie的随机字符串对应的session_data中的k1，而不是删除随机字符串。
del request.session['k1'] 
 
# 所有 键、值、键值对，处理的都是对应的随机字符串的，不会影响到其他人的，我们不需要关注，因为django内部为我们做了系统的封装
request.session.keys()
request.session.values()
request.session.items()
request.session.iterkeys()
request.session.itervalues()
request.session.iteritems()

# 用户session的随机字符串
request.session.session_key

# 我们知道django将session放在一个表中，数据库里不知道啥时候删除
# 根据Django的规定，默认的情况下cookie会在浏览器保存两周。但是到期以后浏览器的cookie没了
# 但是服务端的session还有啊，所以就得手动删除，其实在记录session的时候还会记录一个超时时间
# 将所有Session失效日期小于当前日期的数据删除
request.session.clear_expired()

# 主动设置超时时间
request.session.set_expiry(value)
    * 如果value是个整数，session会在些秒数后失效。
    * 如果value是个datatime或timedelta，session就会在这个时间后失效。
    * 如果value是0,用户关闭浏览器session就会失效。
    * 如果value是None,session会依赖全局session失效策略。

# 检查 用户session的随机字符串 在数据库中是否
request.session.exists(request.session.session_key)

# 删除当前用户的所有Session数据
request.session.delete(request.session.session_key)
```

### 缓存Session

```python
a. 配置 settings.py
# Django指定session存放的位置，默认是存放在数据库，这里其实是指定引擎
SESSION_ENGINE = 'django.contrib.sessions.backends.db'

# 放到文件里，这时候要多个参数，指定放的路径。
# 如果缓存文件路径为None，那么就使用tempfile模块获取一个临时地址
# tempfile.gettempdir()
SESSION_ENGINE = 'django.contrib.sessions.backends.file'
SESSION_FILE_PATH = None

# 放到cache里，比如memcached，redis等。
# 使用的缓存别名（默认内存缓存，也可以是memcache），此处别名依赖缓存的设置
SESSION_ENGINE = 'django.contrib.sessions.backends.cache'
SESSION_CACHE_ALIAS = 'default'

# 放到一个加密的cookie里。这个不要用，这相当于给cookies加了个签名，相当于不用session了。
SESSION_ENGINE = 'django.crotrib.sessions.backends.signed_cookies'     

# 使用缓存+数据库的方式，数据库用于做持久化，缓存用于提高效率
SESSION_ENGINE = 'django.contrib.sessions.backends.cached_db'        
 
# Session的cookie保存在浏览器上时的key，即：sessionid＝随机字符串
SESSION_COOKIE_NAME ＝ "sessionid"
SESSION_COOKIE_PATH ＝ "/"               # Session的cookie保存的路径
SESSION_COOKIE_DOMAIN = None             # Session的cookie保存的域名
SESSION_COOKIE_SECURE = False            # 是否Https传输cookie
SESSION_COOKIE_HTTPONLY = True           # 是否Session的cookie只支持http传输
SESSION_COOKIE_AGE = 1209600             # Session的cookie失效日期（2周），单位为秒
SESSION_EXPIRE_AT_BROWSER_CLOSE = False  # 是否关闭浏览器使得Session过期

# 是否每次请求都保存Session，默认修改之后才保存，False从一开始，这个时间段后超时。
# True每次请求都会计算，规定时间以内就不会超时。最好设置成True，让他每次都更新。
# 想当于计时器在设置为true的时候会不断的刷新。
SESSION_SAVE_EVERY_REQUEST = False                       
```

装饰器可以判断session存在不存在，其实和cookie一个套路。

## Tip

前端模板默认能拿到request这个模板变量，注意这个用法。

比如：request.session.userinfo.nickname

