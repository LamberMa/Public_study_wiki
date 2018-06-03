if(typeof AWPageMounts=='undefined'){AWPageMounts={}};AWPageMounts['m07']=[{"name":"01-Flask-入门.md","path":"07-Flask/01-Flask-入门.md","content":"\n\n\n\n> http://www.cnblogs.com/wupeiqi/articles/7552008.html\n\n\n\nFlask，Django，Tornado框架的区别\n\n- Django：重武器，内部包含了非常多的组件，比如ORM，Form，ModelForm，缓存，Session，中间件，信号等。\n- Flask：短小精悍，内部没有包含很多的组件，但是第三方组件非常丰富。也就是说如果要把Flask构造成和DJango一样也是完全可以的。Flask之所以受人喜欢就是能伸能所，组件可以自由拼接，但是组件之间的配合和使用这个也不是那么简单的，因此在开发复杂项目的时候除非你对flask组件非常熟悉，否则建议使用Django来实现。但是在开发小项目的时候使用flask是非常轻量级的。类似的轻量级框架还有bottle，web.py等。\n- Tornado：异步非阻塞框架\n\nFlask中使用的wsgi是werkseug。\n\n\n\n创建虚拟环境\n\n```shell\nmkvirtualenv stdflask -p /usr/local/bin/python3\n```\n\n使用virtualenvwrapper创建好了之后直接会进入到stdflask环境。然后安装flask：\n\n```shell\npip install flask\n```\n\n","timestamp":1527991855356}]