if(typeof AWPageMounts=='undefined'){AWPageMounts={}};AWPageMounts['m03']=[{"name":"01-初识git.md","path":"03-Python实战/01-生产实践技能/01-Git/01-初识git.md","content":"## 安装Git\n\n下载git的安装包在windows进行安装，安装完成以后在windows右键菜单多出了两个选项，一个是“Git GUI Here”和“Git Base Here”。也就是说我们可以在任意位置打开git的command界面进行操作。\n\nGit的设定被存放在用户本地目录的.gitconfig档案里。虽然可以直接编辑配置文件，但在这个教程里我们使用config命令。\n\n```\n$ git config --global user.name \"<用户名>\"\n$ git config --global user.email \"<电子邮件>\"\n```\n\n以下命令能让Git以彩色显示。\n\n```\n$ git config --global color.ui auto\n```\n\n您可以为Git命令设定别名。例如：把「checkout」缩略为「co」，然后就使用「co」来执行命令。\n\n```\n$ git config --global alias.co checkout\n```\n\n创建一个新的目录（我这里有一个wiki的目录），初始化加入到git数据库：\n\n```\ngit init\n```\n\n请使用status命令确认工作树和索引的状态。\n\n```\n$ git status\nOn branch master\n\nInitial commit\n\nUntracked files:\n  (use \"git add <file>...\" to include in what will be committed)\n\n        amWiki/\n        config.json\n        git_push.sh\n        index.html\n        library/\n\nnothing added to commit but untracked files present (use \"git add\" to track)\n```\n\n将文件加入到索引，要使用add命令。在<file>指定加入索引的文件。用空格分割可以指定多个文件。\n\n```\n$ git add *     # 这里可以添加单个文件也可以添加所有也就是使用通配符*\n$ git add .     # 使用“.”其实也是一样的，同上面这条命令。\n```\n\n##### Note\n\n如果在Windows使用命令行 (Git Bash), 含非ASCII字符的文件名会显示为 \"\\346\\226\\260\\350\\246...\"。若设定如下，就可以让含非ASCII字符的文件名正确显示了。\n\n```\n$ git config --global core.quotepath off\n```\n\n若在Windows使用命令行，您只能输入ASCII字符。所以，如果您的提交信息包含非ASCII字符，请不要使用-m选项，而要用外部编辑器输入。\n\n外部编辑器必须能与字符编码UTF-8和换行码LF兼容。\n\n```\ngit config --global core.editor \"\\\"[使用编辑区的路径]\\\"\"\n```\n\ncommit提交\n\n```\n$ git commit -m \'Init Wiki\'\n```\n\n使用log命令，我们可以在数据库的提交记录看到新的提交。\n\n```\n$ git log\ncommit b49063627b601e95fe7a2938f14c61fe218fb008 (HEAD -> master)\nAuthor: maxiaoyu <1020561033@qq.com>\nDate:   Wed Jul 26 11:39:30 2017 +0800\n\n    Init Wiki\n```\n\n\n\n#### git的注解\n\n查看其他人提交的修改内容或自己的历史记录的时候，提交信息是需要用到的重要资料。所以请用心填写修改内容的提交信息，以方便别人理解。\n以下是Git的标准注解：\n\n```\n第1行：提交修改内容的摘要\n第2行：空行\n第3行以后：修改的理由\n```\n\n请以这种格式填写提交信息。","timestamp":1540005876713},{"name":"02-如何解决git本地和远端冲突的问题.md","path":"03-Python实战/01-生产实践技能/01-Git/02-如何解决git本地和远端冲突的问题.md","content":"在github新建了一个版本库，然后本地在push的时候出现了一个问题：\n\n![](http://omk1n04i8.bkt.clouddn.com/17-7-26/5484363.jpg)\n\n主要原因是在github新建版本库的时候多手勾了一个添加一个README的操作，因为我本地的库也有文件，所以导致本地和远端冲突了。\n\n**解决方法**\n\n1、把远程仓库master分支下载到本地并存为tmp分支\n\n```\ngit fetch origin master:tmp\n```\n\n2、查看tmp分支与本地原有分支的不同\n\n```\ngit diff tmp\n```\n\n这里主要是看看有没有其他的改动…\n\n3、将tmp分支和本地的master分支合并\n\n```\ngit merge tmp\n```\n这个时候呢,本地与远程就没有冲突了,而且还保留了我今天的代码,现在Push就OK啦！\n\n但是操作过程中出现了一个问题：\n\n```\n提示：fatal: refusing to merge unrelated histories\n```\n\n解决方案：\n\n```\ngit pull origin master --allow-unrelated-histories\n```\n\n4、最后别忘记删除tmp分支\n\n```\ngit branch -d tmp\n```\n\n哈哈,又可以快乐的coding啦…","timestamp":1540005876713},{"name":"01-爬虫1.md","path":"03-Python实战/02-爬虫/01-爬虫1.md","content":"爬虫\n\n> - 基本操作\n> - 高性能相关（Socket+select）\n>   - twisted\n>   - tornado\n>   - gevent\n> - Web版本微信（练习）\n> - Scrapy框架（学习规则）\n> - 自己爬虫框架\n\n1. 爬虫基本操作\n\n   URL指定内容获取到\n\n   - 发送HTTP请求：URL\n   - 基于正则表达式获取内容\n\n   requests和bs4中的beautifulsoap（识别html标签）\n\n   ```python\n   import requests\n   from bs4 import beautifulsoup\n   response = request.get(\'http://xxxxxx\')\n   # python内置的html解析器：html.parse\n   obj = beatifulsoup(response.text, \'html.parser\')\n   标前对象 = obj.find(\'a\') # 找到匹配的成功的第一个标签\n   标前对象 = obj.find_all(\'a\') # 找到匹配的成功的多个标签，list\n   xxx.find(name=\'标签名\',id=\'id名称\')\n   参数：name，id，class_\n   因为class和python内部关键字冲突，所以加一个小的下划线，或者\n   attrs = {\n       # 这里唯独不能写标签名称\n       \'class\': \'xxx\',\n       \'id\': \'xxx\'\n   }\n   \n   pip3 install BeautifulSoup4\n   ```\n\n   response.text这个是字符串，response.content这个是字节，可以字节转。\n\n   或者设置response.encoding=gbk。\n\n```python\nimport requests \nfrom bs4 import BeautifulSoup  \nresponse = requests.get(\'http://www.autohome.com.cn/news/\')  \nresponse.encoding=\'gbk\'\nsoup = BeautifulSoup(response.text, \'html.parser\') \nli_soup = soup.find(id=\'auto-channel-lazyload-article\').find_all(name=\'li\')\nIn [11]: for li in li_soup:\n    ...:     print(li.find(\'h3\'))\n<h3>或退出中国 铃木正与长安商议解除合资</h3>\n<h3>均降0.80万元 瑞迈柴油版全系车型调价</h3>\n<h3>起售价降至44.38万 国产普拉多全系官降</h3>\nNone\n<h3>从商用车切入 大众/福特将组成战略联盟</h3>\n<h3>奥迪S3小心了 AMG A 35 L运动轿车谍照</h3>\n<h3>6月25日亮相/三季度上市 吉利缤瑞消息</h3>\n<h3>百人口碑评新车：中华V6大气外观得好评</h3>\n<h3>汽车之家电动汽车挑战赛开场哨即将吹响</h3>\n…………………………\n```\n\n记住这里是可能存在None的，因为实际的页面中，可能穿插着各种广告什么的，这些都是正常的，所以对于这种为None的就可以忽略了，因此在循环中可以做一个判断`if not li`然后直接continue就行了。\n\n我们去到的列表中的元素每一个都是一个bs4.element.Tag的对象，因此如果要直接取内容的话直接用li.find(\'h3\').text就行了。\n\n找标签属性：\n\n```python\n# 得到一个属性的字典\nIn [15]: for li in li_soup:\n    ...:     title = li.find(\'a\')\n    ...:     if not title:\n    ...:         continue\n    ...:     print(title.attrs)\n    ...:     \n{\'href\': \'//www.autohome.com.cn/news/201806/918831.html#pvareaid=102624\'}\n{\'href\': \'//www.autohome.com.cn/news/201806/918822.html#pvareaid=102624\'}\n{\'href\': \'//www.autohome.com.cn/news/201806/918828.html#pvareaid=102624\'}\n{\'href\': \'//www.autohome.com.cn/news/201806/918827.html#pvareaid=102624\'}\n\n##### 一样的效果\nIn [17]: for li in li_soup:\n    ...:     title = li.find(\'a\')\n    ...:     if not title:\n    ...:         continue\n    ...:     print(title.attrs[\'href\'])\n    ...:     \n    ...:     \n//www.autohome.com.cn/news/201806/918831.html#pvareaid=102624\n//www.autohome.com.cn/news/201806/918822.html#pvareaid=102624\n\n# 或者使用get\nIn [16]: for li in li_soup:\n    ...:     title = li.find(\'a\')\n    ...:     if not title:\n    ...:         continue\n    ...:     print(title.get(\'href\'))\n    ...:     \n    ...:     \n//www.autohome.com.cn/news/201806/918831.html#pvareaid=102624\n//www.autohome.com.cn/news/201806/918822.html#pvareaid=102624\n//www.autohome.com.cn/news/201806/918828.html#pvareaid=102624\n//www.autohome.com.cn/news/201806/918827.html#pvareaid=102624\n//www.autohome.com.cn/news/201806/918821.html#pvareaid=102624\n```\n\n找图片：\n\n```python\nIn [18]: for li in li_soup:\n    ...:     title = li.find(\'img\')\n    ...:     if not title:\n    ...:         continue\n    ...:     print(title.attrs[\'src\'])\n    ...:     \n    ...:     \n    ...:     \n//www2.autoimg.cn/newsdfs/g26/M03/39/41/120x90_0_autohomecar__ChcCP1spq8KARebOAAGJFNHdNlQ952.jpg\n//www2.autoimg.cn/newsdfs/g26/M02/39/0D/120x90_0_autohomecar__wKgHEVspsPaASndQAAFOtCp6URI106.jpg\n```\n\n如果要把图片下载下来呢？\n\n```python\nimport requests\nfrom bs4 import BeautifulSoup\nresponse = requests.get(\'http://www.autohome.com.cn/news/\')\nresponse.encoding=\'gbk\'\nsoup = BeautifulSoup(response.text, \'html.parser\')\nli_soup = soup.find(id=\'auto-channel-lazyload-article\').find_all(name=\'li\')\n\nfor li in li_soup:\n\n    img = li.find(\'img\')\n    if not img:\n        continue\n    url = img.attrs[\'src\']\n    file_name = url.rsplit(\'/\')[8]\n    url = \'http:%s\' % url\n    res = requests.get(url)\n    with open(\'/Users/lamber/tmp/%s\' % file_name, \'wb\') as f:\n        # content就是字节类型，text是文本类型\n        f.write(res.content)\n```\n\n## 自动登录github的示例\n\n1. 登录页面发送请求，获取csrftoken\n2. 发送post请求，携带用户名密码，csrf token。登录成功以后返回的内容一定是有cookie的。\n\n```python\n# https://github.com/login\nimport requests\nfrom bs4 import BeautifulSoup\n\n# 获取token\nr1 = requests.get(\'https://github.com/login\')\ns1 = BeautifulSoup(r1.text, \'html.parser\')\ntoken = s1.find(\'input\', attrs={\'name\': \'authenticity_token\'}).get(\'value\')\n\n\n# 以post形式发送用户名密码以及csrf_token\n\"\"\"\n其实每个网站要向后台提交的数据是不一样的，如果不知道就可以去模拟测试一下，打开firebug，点击发送以后\n查看网络请求到底发了什么，github在提交的时候需要以下这些参数\n- utf8\n- authenticity_token\n- login: 标签的name等于login\n- password：这里也是标签的name属性。\n- commit: Sign in\n\"\"\"\nr2 = requests.post(\n    \'https://github.com/session\',\n    data={\n        \'utf8\': \'✓\',\n        \'authenticity_token\': token,\n        \'login\': \'1020561033@qq.com\',\n        \'password\': \'13082171785\',\n        \'commit\': \'Sign in\'\n})\n# r2.cookies这是一个对象，如果要拿到字典类型的cookie，可以继续调用get_dict()方法\ncookies_dict = r2.cookies.get_dict()\n\nr3 = requests.get(\n    url=\'https://github.com/settings/profile\',\n    cookies=cookies_dict\n)\nprint(r3.text)\n```\n\n","timestamp":1540005876713},{"name":"02-rds_memcached.md","path":"03-Python实战/02-爬虫/02-rds_memcached.md","content":"django的缓存\r\n\r\n\r\n\r\n手动创建一个堆栈\r\n\r\n缓存主要应用于页面缓存。\r\n\r\nmemcached和redis相比：\r\n\r\n1. memcached类型单一，只能存储字符串，redis支持五大类型。字符串，hash，list，set，有序集合。\r\n2. 数据持久化，redis要强于memcached，redis支持rdb以及aof两种持久化方式。但是memcached一旦断电就没有了；那么相对来讲持久化也会耗时，但是大多数情况下这种问题可以忽略不计。具体有多大的影响也看具体的应用场景和环境，这个是可控的。\r\n\r\n关于memcached和redis的探讨：www.oschina.net/news/26691/memcached-timeout；而且redis只能使用单核，而memcached可以使用多核。\r\n\r\n> https://pypi.python.org/pypi/python-memcached\r\n>\r\n> pip install python-memcached\r\n\r\n使用：\r\n\r\n```python\r\nimport memcache\r\nmc = memcache.Client([\'192.168.100.1:11211\'], debug=True)\r\n\r\nIn [6]: mc.set(\"foo\", \'bar\')\r\nOut[6]: True\r\n\r\nIn [7]: mc.get(\'foo\')\r\nOut[7]: \'bar\'    \r\n```\r\n\r\n可以看到memchace.Client后面的链接的主机是一个列表，也就是说这里是可以填写多个地址，那么这个是什么意思，也就是说针对于客户端到底应该连接哪个？\r\n\r\n这个目的其实是memcached天生支持集群，可以往多个节点去写，那么这个也存在问题，memcached在写的时候可能存在写不均匀的问题，而且假如其中一个节点挂掉了的话，这个节点保存的数据在其他的节点你是找不到的。\r\n\r\n解决如何选择哪一台机器的问题：\r\n\r\n不管是取数据还是设置数据，都需要key，memcached的python组件针对这个做了一个计算将key给hash成了一段数字，使用这个数字对机器的总个数取余，根据取余的值拿到值作为索引在机器列表中设置。\r\n\r\n```python\r\nimport binascii\r\ndef cmemcache_hash(key):\r\n    return (\r\n        (((binascii.crc32(key) & 0xffffffff) >> 16) & 0x7fff or 1)\r\n    )\r\n```\r\n\r\n即使解决了该用哪个机器的问题但是仍然不能保证数据的存放就一定均匀，因此为了解决这个问题，memcached还提供了一个办法：\r\n\r\n```python\r\nmc = memcache.Client([\r\n    (\'192.168.100.1:11211\', 1),\r\n    (\'192.168.100.2:11211\', 3),\r\ndebug=True])\r\n```\r\n\r\n这里的主机列表里还可以支持传入元组，第一个是要链接的主机地址和端口，第二个就是weight权重，写权重为3的意思其实就是相当于：\r\n\r\n```python\r\nmc = memcache.Client([\r\n    \'192.168.100.1:11211\',\r\n    \'192.168.100.2:11211\',\r\n    \'192.168.100.2:11211\',\r\n    \'192.168.100.2:11211\',\r\n], debug=True)\r\n```\r\n\r\n一份给复制了三份，一定程度上又将集中的存放给打散了，出现次数越多，取余的时候达到它的可能就越多。\r\n\r\nmemcached总共的源码一共也就1000行左右，因此可以自己看看这些内容，相对来说简单很多。\r\n\r\n```python\r\nmc.set不管存不存在，都给你设置一下\r\nmc.add，添加的时候如果没有的就添加，如果有了的话就报错。\r\nmc.replace 找到某个key给替换成另外一个值\r\nmc.set_multi 可以设置多对，传递一个字典参数就可以了\r\nmc.delete，可以传递一个删除的key，\r\nmc.delete_multi 传递一个可以删除的key的列表\r\n```\r\n\r\n","timestamp":1540005876713},{"name":"03-requests模块.md","path":"03-Python实战/02-爬虫/03-requests模块.md","content":"requests\r\n\r\n> www.cnblogs.com/wupeiqi/articles/6283017.html\r\n\r\n","timestamp":1540005876713},{"name":"01-算法基础.md","path":"03-Python实战/03-算法/01-算法基础.md","content":"# 算法基础\n\n> 一个计算过程，一个解决问题的方法\n\n## 递归\n\n- 调用自身\n- 有一个结束条件\n\n```python\n# 传5进入输出就是5，4，3，2，1\ndef func1(x):\n    if x>0:\n        print(x)\n        func1(x-1)\n        \n# 传5进去，输出就是1，2，3，4，5\ndef func2(x):\n    if x>0:\n        func2(x-1)\n        print(x)\n```\n\n递归练习：\n\n![](http://tuku.dcgamer.top/18-8-19/49712277.jpg)\n\n```python\ndef func(depth):\n    if depth == 0:\n        print(\"我的小鲤鱼\")\n    else:\n        print(\'抱着\', end=\'\')\n        func(depth - 1)\n        print(\"的我\", end=\'\')\n        \nfunt(5)\n```\n\n## 时间复杂度\n\n> 用什么方式来体现代码（算法）运行的快慢？\n\n- O(1)\n\n- O(n)\n\n- O(n^2)\n\n- O(n^3)\n\n**时间复杂度小结**\n- 时间复杂度是用来估计算法运行时间的一个式子（单位）\n\n- *一般来说*，时间复杂度高的算法比时间复杂度第的算法慢（一般来说就是有二班情况，比如不同的机器，不同的计算规模，比如O(n)执行一亿次和O(n^2)，n=2肯定是后者算得快。所以说，一般来讲这个一般来讲包含问题规模一样，运行环境要类似；）\n\n- 常见的时间复杂度排序：\n\n  ```\n  O(1) < O(logn) < O(n) < O(nlogn) < O(n^2) < O (n^2logn) < O(n^3)\n  ```\n\n- 不常见的时间复杂度\n\n  ```\n  O(n!) O(2^n) O(n^n)\n  ```\n\n- 如何一眼判断时间复杂度？（能解决大部分的，不是100%）\n\n  - 循环减半的过程==>O(logn)\n  - 几次循环就是n的几次方的复杂度\n\n## 空间复杂度\n\n> 用来评估算法内存占用大小的一个式子","timestamp":1540005876713},{"name":"01-Flask-入门.md","path":"03-Python实战/05-Flask/01-Flask-入门.md","content":"\n\n\n\n> http://www.cnblogs.com/wupeiqi/articles/7552008.html\n\n\n\nFlask，Django，Tornado框架的区别\n\n- Django：重武器，内部包含了非常多的组件，比如ORM，Form，ModelForm，缓存，Session，中间件，信号等。\n- Flask：短小精悍，内部没有包含很多的组件，但是第三方组件非常丰富。也就是说如果要把Flask构造成和DJango一样也是完全可以的。Flask之所以受人喜欢就是能伸能所，组件可以自由拼接，但是组件之间的配合和使用这个也不是那么简单的，因此在开发复杂项目的时候除非你对flask组件非常熟悉，否则建议使用Django来实现。但是在开发小项目的时候使用flask是非常轻量级的。类似的轻量级框架还有bottle，web.py等。\n- Tornado：异步非阻塞框架\n\nFlask中使用的wsgi是werkseug。\n\n\n\n创建虚拟环境\n\n```shell\nmkvirtualenv stdflask -p /usr/local/bin/python3\n```\n\n使用virtualenvwrapper创建好了之后直接会进入到stdflask环境。然后安装flask：\n\n```shell\npip install flask\n```\n\n","timestamp":1540005876713},{"name":"00-参考内容.md","path":"03-Python实战/07-Tkinter/00-参考内容.md","content":"https://zhuanlan.zhihu.com/p/22619896?refer=passer","timestamp":1540005876713},{"name":"01-Tkinter.md","path":"03-Python实战/07-Tkinter/01-Tkinter.md","content":"# TKinter\n\n### Laber and Button\n\n一个简单的小窗口\n\n```python\nimport tkinter as tk\n\n\"\"\"\n1、定义window窗口和窗口的一些属性。\n2、书写窗口内容\n3、执行window.mainloop让窗口活起来\n\"\"\"\n# 定义一个窗口\nwindow = tk.Tk()\n# 定义一些窗口的属性\nwindow.title(\'my first window\')\nwindow.geometry(\'200x200\')\n\n# 用一个标签描述窗口内容\nwindow_lable = tk.Label(window,\n                        text=\'这里是测试的内容\',  # 标签内容\n                        bg=\'green\',  # 背景颜色\n                        font=(\'Arial\', 12),  # 字体\n                        width=15, height=2  # 标签长宽\n                        )\nwindow_lable.pack()  # 固定窗口位置\n\n# 让整个window活起来\nwindow.mainloop()\n```\n\n为窗口添加button，让窗口中的内容随着button的点击而变化：\n\n```python\nimport tkinter as tk\n\n# 定义一个窗口\nwindow = tk.Tk()\n# 定义一些窗口的属性\nwindow.title(\'my first window\')\nwindow.geometry(\'200x200\')\n\non_hit = False  # 默认的情况下on_hit=False\n\n\ndef hit_me():\n    global on_hit\n    if not on_hit:\n        on_hit = True   # 从False变为true\n        var.set(\'you hit me\')\n    else:\n        on_hit = False\n        var.set(\'\')     # 设置文字内容为空\n\n\n# 用一个标签描述窗口内容\nvar = tk.StringVar()   # 这是文字变量存储器，用来存储动态变更的文字\nwindow_lable = tk.Label(window,\n                        textvariable=var,  # 使用文本变量替换text，可以变化\n                        bg=\'green\',  # 背景颜色\n                        font=(\'Arial\', 12),  # 字体\n                        width=15, height=2  # 标签长宽\n                        )\nwindow_lable.pack()  # 固定窗口位置\n\n\n# 制作button按钮\nb = tk.Button(window,\n              text=\'点我\',    # 显示在按钮上的文字\n              width=15, height=2,\n              command=hit_me)   # 点击按钮的时候执行的命令\nb.pack()   # 固定按钮的位置\n\n\n# 让整个window活起来\nwindow.mainloop()\n```\n\n","timestamp":1540005876713},{"name":"01-使用YAML作为项目的配置.md","path":"03-Python实战/11-最佳实践/01-使用YAML作为项目的配置.md","content":"# 使用YAML来编写项目的配置文件\n\n> 但凡是项目里肯定少不了配置文件，那么编写配置文件的方法有很多种，你可以用字典来保存，然后通过json模块的交互来获取到对应的信息，不过这样很麻烦，你还可以通过configParser来书写配置文件。当然还有一种方法，那就是使用YAML，YAML是专门用来编写配置文件的语言，非常简洁和强大。要比JSON方便的多。\n\n## 简介\n\nYAML 语言（发音 /ˈjæməl/ ）的设计目标，就是方便人类读写。它实质上是一种通用的数据串行化格式。安装的YAML相关的模块的话很简单的，直接pip安装即可。\n\n```python\npip install PyYaml\n```\n\nYAML的基本语法规则如下：\n\n>- 大小写敏感\n>- 和python类似，使用缩进来表示层级关系\n>- 缩进不允许使用tab，只能使用空格\n>- 缩进几个空格不重要，只要相同层级的元素左侧对齐即可\n\n\n\n\n\n\n\n","timestamp":1540005876713},{"name":"02-VirtualEnv.md","path":"03-Python实战/11-最佳实践/02-VirtualEnv.md","content":"# VirtualEnv\n\n> 使用virtualenv进行科学管理我们的项目\n\n## 安装Virtualenv\n\n```shell\n# 看好你使用的环境，我是给python3使用，因此调用的也就是pip3去进行安装\npip(3) install virtualenv\n\n# 直接使用virtualenv project_name就可以进行创建虚拟环境了。\nmkdir ~/testvirtualenv\ncd ~/testvirtualenv\nvirtualenv env1\n```\n\n## 安装VirtualenvWrapper\n\nVirtualenvwrapper是virtualenv的扩展包，可以更好的管理我们创建的虚拟环境\n\n```shell\npip(3) install virtualenvwrapper\n```\n\n指定一个虚拟环境的目录，我是在自己的家目录下新建一个了一个python路径来进行项目管理\n\n```shell\n➜  python > pwd\n/Users/lamber/python\n```\n\n在使用virtualenvwrapper之前要运行virtualenvwrapper.sh这个脚本，并且要进行环境变量的设置，因此我们要把下面的脚本内容放到`~/.bashrc`由于我用的是zsh于是就在`~/.zshrc`中添加了如下的两句内容：\n\n```shell\n# About virtualenvwrapper\nVIRTUALENVWRAPPER_PYTHON=/usr/local/bin/python3\nif [ -f /usr/local/bin/virtualenvwrapper.sh ]; then\n   export WORKON_HOME=$HOME/python\n   source /usr/local/bin/virtualenvwrapper.sh\nfi\n```\n\n然后重载一下即可，主要是设置virtualenvwrapper是给那个python版本使用的，不然可能会出现无法导入virtualenvwrapper模块的问题。\n\n## 创建虚拟环境\n\n```shell\nmkvirtualenv env1\n```\n\n创建成功后，当前路径前面就会有(env1)的字样。\n\n## 常用小功能\n\n- 列出当前的虚拟环境\n\n  ```shell\n  lsvirtualenv -b\n  ```\n\n- 切换虚拟环境\n\n  ```shell\n  workon env1\n  ```\n\n- 查看环境里安装了哪些包\n\n  ```shell\n  lssitepackages\n  ```\n\n- 进入当前环境\n\n  ```shell\n  cdvirtualenv\n\n  # 示例\n  (env1) ➜  python > cdvirtualenv\n  (env1) ➜  env1 >\n  (env1) ➜  env1 > ll\n  total 8\n  drwxr-xr-x  21 lamber  staff   672B  2  8 14:55 bin\n  drwxr-xr-x   3 lamber  staff    96B  2  8 14:55 include\n  drwxr-xr-x   3 lamber  staff    96B  2  8 14:55 lib\n  -rw-r--r--   1 lamber  staff    60B  2  8 14:55 pip-selfcheck.json\n  ```\n\n- 进入当前环境的site-packages：\n\n  ```shell\n  cdsitepackages\n  cdsitepackages pip\n  ```\n\n- 复制虚拟环境\n\n  ```shell\n  cpvirtualenv env1 env3   # cpvirtualenv source destination\n  ```\n\n- 退出虚拟环境\n\n  ```shell\n  deactivate\n  ```\n\n- 删除虚拟环境\n\n  ```shell\n  ➜  ~ > rmvirtualenv env2\n  Removing env2...\n  ```\n\n## Tip\n\n创建一个干净的环境\n\n```shell\n$ mkvirtualenv --no-site-packages env343\n```\n\n指定虚拟环境使用的python版本\n\n```shell\n$ mkvirtualenv -p  /usr/local/bin/python3  env343\n```\n\n","timestamp":1540005876713},{"name":"03-PipEnv.md","path":"03-Python实战/11-最佳实践/03-PipEnv.md","content":"# Pipenv\n\n> Pipenv 是 Python 项目的依赖管理器。其实它不是什么先进的理念和技术，如果你熟悉 Node.js 的 npm/yarn 或 Ruby 的 bundler，那么就非常好理解了，它在思路上与这些工具类似。尽管pip可以安装Python包，但仍推荐使用Pipenv，因为它是一种更高级的工具，可简化依赖关系管理的常见使用情况。\n>\n> 主要特性包含：\n>\n> 1. 根据 Pipfile 自动寻找项目根目录。\n> 2. 如果不存在，可以自动生成 Pipfile 和 Pipfile.lock。\n> 3. 自动在项目目录的 .venv 目录创建虚拟环境。（当然这个目录地址通过设置WORKON_HOME改变）\n> 4. 自动管理 Pipfile 新安装和删除的包。\n> 5. 自动更新 pip。\n\n## 安装\n\n```\nhttp://www.dongwm.com/archives/%E4%BD%BF%E7%94%A8pipenv%E7%AE%A1%E7%90%86%E4%BD%A0%E7%9A%84%E9%A1%B9%E7%9B%AE/\nhttp://pythonguidecn.readthedocs.io/zh/latest/dev/virtualenvs.html\nhttp://pylixm.cc/posts/2018-01-13-python-pipenv.html\n```\n\n","timestamp":1540005876713},{"name":"01-01、Python_Mysql读写.md","path":"03-Python实战/20-轮子/02-Python/01-01、Python_Mysql读写.md","content":"","timestamp":1540005876713},{"name":"02-02、Python_生成二维码.md","path":"03-Python实战/20-轮子/02-Python/02-02、Python_生成二维码.md","content":"","timestamp":1540005876713}]