if(typeof AWPageMounts=='undefined'){AWPageMounts={}};AWPageMounts['m18']=[{"name":"02-基础软件优化.md","path":"18-电脑技能汇总/01-MacBook/01-基础使用篇/02-基础软件优化.md","content":"\n\n\n\n## Zsh\n\n> github项目地址：https://github.com/robbyrussell/oh-my-zsh\n>\n> 配置博客：http://www.dreamxu.com/mac-terminal/\n>\n> 配置博客2：http://macshuo.com/?p=676\n\n","timestamp":1542254452231},{"name":"03-常用基本功能.md","path":"18-电脑技能汇总/01-MacBook/01-基础使用篇/03-常用基本功能.md","content":"\n\n\n\n### MAC 进行磁盘分区\n\nhttps://www.zhihu.com/question/37544123\n\n","timestamp":1542254452231},{"name":"01-Alfred使用指南.md","path":"18-电脑技能汇总/01-MacBook/02-插件增强篇/01-Alfred/01-Alfred使用指南.md","content":"","timestamp":1542254452231},{"name":"01-天气插件.md","path":"18-电脑技能汇总/01-MacBook/02-插件增强篇/01-Alfred/02-Alfred脚本编写/01-天气插件.md","content":"# 使用Alfred编写天气插件\n\n>插件功能是获取到最近几天的天气\n>\n>- 关键字：tq\n>- 参数：无\n>- 获取数据：最近3天（免费用户）\n>- 当前版本号：1.0.1\n\n## 操作步骤\n\n- 下载 deanishe 的python alfred 框架[deanishe alfred](https://link.jianshu.com/?t=http://www.deanishe.net/alfred-workflow/index.html)，我们可以用他造的轮子完成我们自己的workflow。\n- 注册和风天气[和风天气官网](https://link.jianshu.com/?t=http://www.heweather.com)，用天气API获取我们要在alfred输出的天气数据。\n\n## 编写步骤\n\n### 1、首先新建一个空白的workflow\n\n![](http://omk1n04i8.bkt.clouddn.com/17-12-14/75860935.jpg)\n\n选中刚才添加的天气助手，在右侧空白位置右击→Inputs→Script Filter，在弹出的内容中输入如下的内容：\n\n![](http://omk1n04i8.bkt.clouddn.com/17-12-14/70706712.jpg)\n\n- keyword：关键字，这个是触发workflow的关键字，输入关键字可以调用我们书写的脚本。\n- language：这里我们语言选择shell，然后使用shell去调用我们用python写的脚本。\n- tile & Subtext：titile和subtext占位符按照我们的需求填写\n\n### 2、进入当前workflow的目录\n\n![](http://omk1n04i8.bkt.clouddn.com/17-12-14/56194688.jpg)\n\n我们需要在目录中提供这样的一个目录数据：\n\n```shell\n./\n├── icon.png         # 应用的logo\n├── images           # 如果有图片的化可以新建一个图片文件夹，可以没有\n├── info.plist       # 创建完workflow以后自动生成的\n├── version          # 标识你这个workflow的版本号的文件\n├── weather.py       # 文件主程序\n└── workflow         # Alfred Workflow python库\n```\n\n其中Alfred Workflow库我们可以去[插件库官网获取](http://www.deanishe.net/alfred-workflow/index.html)，使用方法为download对应的zip包然后解压到对应的workflow的文件目录下，如上图目录结构所示。\n\n### 3、编写主程序脚本\n\n```python\n# -*- coding:utf-8 -*-\nimport json\nimport sys\n\nfrom datetime import datetime\nfrom workflow import Workflow, web\n# 重载模块，设定默认的字符集\nreload(sys)\nsys.setdefaultencoding(\'utf-8\')\n\n\n# 这个是和风天气的API key,替换成你自己的就行\nAPI_KEY = \'这个是你的和风天气的API，登录自己的后台就可以进行查看\'\n\n\n# 返回某日是星期几\ndef the_day(num):\n    week = [\'星期一\', \'星期二\', \'星期三\', \'星期四\', \'星期五\', \'星期六\', \'星期日\']\n    return week[num]\n\n\ndef main(wf):\n    url = \'https://free-api.heweather.com/x3/weather?cityid=CN101010100&key=\' + API_KEY\n    # 这里用了deanishe 的框架里面的web模块来请求页面,web模块类似requests库\n    r = web.get(url=url)\n    r.raise_for_status()\n    resp = r.text\n    data = json.loads(resp)\n\n    d = data[\'HeWeather data service 3.0\'][0]\n    # 获取的是城市的名称，比如\"北京\"\n    city = d[\'basic\'][\'city\']\n\n    # 获取一周内的数据，目前免费用户只能获取到最近三天的天气情况，因此我们只循环3次\n    for n in range(0, 3):\n        day = d[\'daily_forecast\'][n]\n        # 把API获取的天气、温度、风力等信息拼接成 alfred条目的标题、副标题\n        title = city + \'\\t\' + the_day(datetime.weekday(datetime.strptime(day[\'date\'], \'%Y-%m-%d\'))) + \'\\t\' + day[\'cond\'][\'txt_d\']\n\t\t# 设置程序显示的副标题\n        subtitle = \'白天 {weather_day} |\' \\\n                   \'夜间 {weather_night} |\' \\\n                   \' {tmp_low}~{tmp_high}摄氏度 |\' \\\n                   \' {wind_dir} {wind_sc}\'.format(\n                    weather_day = day[\'cond\'][\'txt_d\'],\n                    weather_night = day[\'cond\'][\'txt_n\'],\n                    tmp_high=day[\'tmp\'][\'max\'],\n                    tmp_low=day[\'tmp\'][\'min\'],\n                    wind_sc=day[\'wind\'][\'sc\'],\n                    wind_dir=day[\'wind\'][\'dir\'])\n    # 向alfred添加条目,传标题、副标题、图片路径(图片直接用的和风天气提供的天气图,每个图片的命名对应天气状态码)\n        wf.add_item(title=title, subtitle=subtitle, icon=\'images/{code}.png\'.format(code=day[\'cond\'][\'code_d\']))\n\n    wf.send_feedback()\n\n\nif __name__ == \'__main__\':\n    wf = Workflow()\n    sys.exit(wf.run(main))\n```\n\n更多关于和风天气的api可以参考官方网站的api地址：\n\n```http\nhttps://www.heweather.com/documents\n```\n\n关于显示天气的图标，和风天气的官方提供了logo图标，针对每一个图标都有对应的地址，这里我单独用脚本把这些小logo给拉了下来扔到了images文件夹下：\n\n```shell\nlamber@马晓雨的MBP:~/Library/Application Support/Alfred 3/Alfred.alfredpreferences/workflows/user.workflow.890D9C47-CE44-4214-A1CA-CDF8A4A61143lsmages $\n100.png  201.png  207.png  213.png  305.png  311.png  403.png  501.png  900.png\n101.png  202.png  208.png  300.png  306.png  312.png  404.png  502.pn………………\n```\n\n### 4、完工调试\n\n![](http://omk1n04i8.bkt.clouddn.com/17-12-14/54015875.jpg)\n\n点击对应工作流右上角的这个小虫子然后运行我们的程序就可以进行调试，如果有什么问题比如程序调试有问题的化那么会在下方显示出来内容。最终显示结果如下：\n\n![](http://omk1n04i8.bkt.clouddn.com/17-12-14/66848508.jpg)\n\n\n\n","timestamp":1542254452231},{"name":"01-Virtualbox添加网卡.md","path":"18-电脑技能汇总/01-MacBook/03-软件使用篇/01-Virtualbox添加网卡.md","content":"# VBox添加网卡\n\n在Windows客户端的vbox和mac的vbox稍稍有一点不太一样。Windows客户端的vbox会在本机添加一块虚拟的网卡，它会做为和虚拟机沟通的一个桥梁进行网络通信，但是在mac端并不会。mac端虚拟机安装完成以后自己内部是可以通过nat出去的，但是由于默认网段是10.0.12.x，本机还没有沟通使用的网卡，因此网段上就是隔离的，要想实现通信需要自己添加网卡实现。\n\n## 添加网卡实现网络通信\n\n1. 首先在菜单栏找到管理中的主机网络管理器，或者直接点按command+w进行操作。\n\n2. 在主机网络管理其中创建一块host-only仅主机模式的网卡，网卡默认的网段是一个192.168.56.x/24的c类网段。\n\n   ![](http://omk1n04i8.bkt.clouddn.com/18-1-17/32916761.jpg)\n\n3. 点击网卡，可以选择手动配置或者自动配置，我这里就手动配置了，网段就是192.168.56.0这个c网。\n\n4. 点击DHCP选项卡，这个选项卡是给内部主机做ip地址的dhcp使用的，这个配置规定了可以dhcp的地址范围\n\n   ![](http://omk1n04i8.bkt.clouddn.com/18-1-17/47309137.jpg)\n\n5. 在vbox的虚拟机中做网卡的绑定，在具体的虚拟机网络中找到第二块网卡，连接方式选择host-only，界面选择我们刚才添加的网卡，意即绑定到我们刚才新建的网卡上。\n\n   ![](http://omk1n04i8.bkt.clouddn.com/18-1-17/44179469.jpg)\n\n6. 观察本机的网卡设定：\n\n   ![](http://omk1n04i8.bkt.clouddn.com/18-1-17/28170270.jpg)\n\n7. 虚拟机重启即可使用，通过ssh终端直接连接即可。\n\n   ​","timestamp":1542254452231},{"name":"02-通过Vagrant管理vbox虚拟机.md","path":"18-电脑技能汇总/01-MacBook/03-软件使用篇/02-通过Vagrant管理vbox虚拟机.md","content":"","timestamp":1542254452231}]