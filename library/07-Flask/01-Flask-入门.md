



> http://www.cnblogs.com/wupeiqi/articles/7552008.html



Flask，Django，Tornado框架的区别

- Django：重武器，内部包含了非常多的组件，比如ORM，Form，ModelForm，缓存，Session，中间件，信号等。
- Flask：短小精悍，内部没有包含很多的组件，但是第三方组件非常丰富。也就是说如果要把Flask构造成和DJango一样也是完全可以的。Flask之所以受人喜欢就是能伸能所，组件可以自由拼接，但是组件之间的配合和使用这个也不是那么简单的，因此在开发复杂项目的时候除非你对flask组件非常熟悉，否则建议使用Django来实现。但是在开发小项目的时候使用flask是非常轻量级的。类似的轻量级框架还有bottle，web.py等。
- Tornado：异步非阻塞框架

Flask中使用的wsgi是werkseug。



创建虚拟环境

```shell
mkvirtualenv stdflask -p /usr/local/bin/python3
```

使用virtualenvwrapper创建好了之后直接会进入到stdflask环境。然后安装flask：

```shell
pip install flask
```

