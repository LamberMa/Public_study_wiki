# 伪造的ajax

> 从iframe标签说起：iframe标签可以伪造出局部刷新的效果。可以开辟一个类似向后台提交的通道。不刷新，发送HTTP请求。`<form>`标签可以把input的数据打包，因此这俩结合起来也可以实现不刷新向后台提交数据的功能。iframe相当于又嵌套了一个页面。

```html
# 这样就可以在后台通过request.POST拿到用户在不刷新的条件下拿到的数据
<body>
  <!--用于检测页面是否刷新，实际检测，伪ajax下，页面并不会刷新-->
  <input type='text' />
  <!--使用target可以指定提交的方式，不用form原来的提交方式了。-->
  <form method='post' action='/fake_ajax/' target="ifr">
    <!--这个iframe放哪其实无碍-->
    <iframe name="ifr" style='display:none'></iframe>
    <input type="text" name="user" />
    <input type="submit" value="提交" />
  </form>
</body>
```

这种情况下是无法使用回调函数的，当然也没法写回调。后台返回的值会放到iframe中去。那么其实可以这样，只要iframe中有内容的时候，证明后台的值就返回来了。如果里面有内容了，是可以执行一个onload函数的。这个onload也适用于其他的标签，只要加载的时候就会执行这个onload，后台返回一次数据就会加载一次。

```html
<body>
  <!--使用target可以指定提交的方式，不用form原来的提交方式了。-->
  <form method='post' action='/fake_ajax/' target="ifr">
    <!--这个iframe放哪其实无碍-->
    <iframe name="ifr" onload="loadIframe();"></iframe>
    <input type="text" name="user" />
    <input type="submit" value="提交" />
  </form>
  <script>
    function loadIframe(){
      alert(123);
    }
  </script>
</body>
```

但是这个会出现一个问题，console会报错，html从上往下加载第一次执行到iframe的时候回进行加载，但是此时js脚本还没有读到呢，因此会报错，说loadIframe找不到。为了避免这个问题：

```html
<body>
  <input type='text' />
  <!--使用target可以指定提交的方式，不用form原来的提交方式了。-->
  <form id="f1" method='post' action='/fake_ajax/' target="ifr">
    <!--这个iframe放哪其实无碍-->
    <iframe name="ifr"  id='ifr' style='display:none'></iframe>
    <input type="text" name="user" />
    <a onclick="submitForm();">提交</a>
  </form>
  <script>
    # 通过js代码提交表单，可以在提交的时候再绑定事件。
    function submitForm(){
      # 我直接用js进行提交。
      document.getElementById('f1').submit();
      # 在点的时候才绑定事件，第一遍读取的时候并不绑定事件。
      document.getElementById('ifr').onload=loadIframe();
    }
    function loadIframe(){
      # 取iframe中的数据要用contentWindow取内容。因为iframe相当于又嵌套一个页面
      var content = document.getElementById('ifr').contentWindow.document.body.innerText;
      alert('content')
    }
  </script>
</body>
```