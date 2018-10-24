# Django安全

## XSS跨站脚本攻击

> Django在内部已经屏蔽了xss，如果说手贱给内容加了一个 " content | safe"就会进行解析，这样就不是字符串了。所以一般情况下不要加safe，如果一定要加safe要记得对特殊字符做过滤。
>
> 或者我们也可以在后台逻辑将用户传递过来的字符串进行判断是否有违规内容。
>
> 当然在django后台也可以标记，但是需要单独导入模块
>
> ```python
> from django.utils.safestring import mark_safe
> temp = "<a>test</a>"
> # 把newtemp传递到前端模板的时候就会标记为安全的了。
> # 因此标记为安全有前台和后台两种方式
> newtemp = mark_safe(temp)
> ```

**要点**：

- 慎用safe和mark_safe
- 非要用，那务必过滤关键字。

## CSRF（跨站请求的伪造）

> django为用户实现防止跨站请求伪造的功能，通过中间件 django.middleware.csrf.CsrfViewMiddleware 来完成。而对于django中设置防跨站请求伪造功能有分为全局和局部。
>
> 更多：https://docs.djangoproject.com/en/dev/ref/csrf/#ajax

配置文件中应该打开，默认也是打开的：

```python
MIDDLEWARE = [
    'django.middleware.csrf.CsrfViewMiddleware',
]
```

在这个选项打开的时候，如果没有传递token字符串的话怎么提交也是不生效的。

全局：

　　中间件 django.middleware.csrf.CsrfViewMiddleware

局部（为函数添加如下的特殊装饰器就可以了）：

```python
from django.views.decorator import csrf_exempt或者csrf_protect
```

- @csrf_protect，为当前函数强制设置防跨站请求伪造功能，即便settings中没有设置全局中间件。
- @csrf_exempt，取消当前函数防跨站请求伪造功能，即便settings中设置了全局中间件。

当然直接加装饰器我们这是针对FBV，如果说是针对CBV的时候我们还要做特殊处理：

```python
from django.views.decorator import csrf_protect
from django.utils.decorators import method_decorator
from django.views import View

# 装饰器是CBV中是不可以直接使用的，要调用Django提供的方法才行。
@method_decorator(csrf_protect) # 给类下的所有绑定方法加装饰器
# @method_decorator(csrf_protect, name='post') # 给类下的post方法加装饰器，name是谁就是给谁装饰,可以写多个，写多行就行了，多个装饰器。
class Foo(View):
    def get(self, request):
        pass
    
    def post(self, request):
        pass
    
    def dispatch(self,request,*args,**kwargs):
        return xxx
    
# 当然也可以给dispathch方法加，如果是给dispatch加这个装饰器的话也相当于给所有的加了，因为dispatch是一个入口函数，有dispatch的时候是优先找到dispatch然后通过反射找的POST或者GET方法。
@method_decorator(csrf_protect, name='dispatch')

# 或者直接加载dispatch方法上
class xxx(View):
    
    @method_decorator(csrf_exempt)
    def dispatch(self, request, *args, **kwargs):
        ……

# 针对CSRF的装饰器只能给CBV的类加，不能给CBV类下的方法加，这是csrf种一个比较变态的规定。我们自己自定义的装饰器应该是ok的
```

### 应用

普通表单

```python
veiw中设置返回值：
　　return render_to_response('Account/Login.html',data,context_instance=RequestContext(request))　　
     或者
     return render(request, 'xxx.html', data)
  
# html中设置Token:
# 会在页面生成一个隐藏的input的标签
# 同时也会在cookie中插入csrftoken
　　{% csrf_token %}
```

Ajax

```python
# 对于传统的form，可以通过表单的方式将token再次发送到服务端，而对于ajax的话，使用如下方式。

#view.py
from django.template.context import RequestContext
# Create your views here.
  
  
def test(request):
  
    if request.method == 'POST':
        print request.POST
        return HttpResponse('ok')
    return  render_to_response('app01/test.html',context_instance=RequestContext(request))
```

text.html

```html
<!DOCTYPE html>
<html>
<head lang="en">
    <meta charset="UTF-8">
    <title></title>
</head>
<body>
    {% csrf_token %}
  
    <input type="button" onclick="Do();"  value="Do it"/>
  
    <script src="/static/plugin/jquery/jquery-1.8.0.js"></script>
    <script src="/static/plugin/jquery/jquery.cookie.js"></script>
    <script type="text/javascript">
        // var csrftoekn = $('input[name="csrfmiddlewaretoken"]').val()
        var csrftoken = $.cookie('csrftoken');
        // 不仅如此还可以用这个插件设置cookie
        // $.cookie('key','value')
        // 这样document.cookie就会发现多了一个。
        // 一个是在请求头，一个是在data中带，注意cookie和csrfmiddlewaretoken中的值是不一样的
        // 在请求体中设置csrfmiddletoken设置为{{ csrf_token }}这样取直接就行。
  
        function csrfSafeMethod(method) {
            // these HTTP methods do not require CSRF protection
            return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
        }
        $.ajaxSetup({
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            }
        });
        function Do(){
  
            $.ajax({
                url:"/app01/test/",
                data:{id:1},
                type:'POST',
                success:function(data){
                    console.log(data);
                }
            });
  
        }
    </script>
</body>
</html>
```

