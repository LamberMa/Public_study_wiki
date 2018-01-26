if(typeof AWPageMounts=='undefined'){AWPageMounts={}};AWPageMounts['m04']=[{"name":"01-初识git.md","path":"04-04、Git/01-初识git.md","content":"## 安装Git\n\n下载git的安装包在windows进行安装，安装完成以后在windows右键菜单多出了两个选项，一个是“Git GUI Here”和“Git Base Here”。也就是说我们可以在任意位置打开git的command界面进行操作。\n\nGit的设定被存放在用户本地目录的.gitconfig档案里。虽然可以直接编辑配置文件，但在这个教程里我们使用config命令。\n\n```\n$ git config --global user.name \"<用户名>\"\n$ git config --global user.email \"<电子邮件>\"\n```\n\n以下命令能让Git以彩色显示。\n\n```\n$ git config --global color.ui auto\n```\n\n您可以为Git命令设定别名。例如：把「checkout」缩略为「co」，然后就使用「co」来执行命令。\n\n```\n$ git config --global alias.co checkout\n```\n\n创建一个新的目录（我这里有一个wiki的目录），初始化加入到git数据库：\n\n```\ngit init\n```\n\n请使用status命令确认工作树和索引的状态。\n\n```\n$ git status\nOn branch master\n\nInitial commit\n\nUntracked files:\n  (use \"git add <file>...\" to include in what will be committed)\n\n        amWiki/\n        config.json\n        git_push.sh\n        index.html\n        library/\n\nnothing added to commit but untracked files present (use \"git add\" to track)\n```\n\n将文件加入到索引，要使用add命令。在<file>指定加入索引的文件。用空格分割可以指定多个文件。\n\n```\n$ git add *     # 这里可以添加单个文件也可以添加所有也就是使用通配符*\n$ git add .     # 使用“.”其实也是一样的，同上面这条命令。\n```\n\n##### Note\n\n如果在Windows使用命令行 (Git Bash), 含非ASCII字符的文件名会显示为 \"\\346\\226\\260\\350\\246...\"。若设定如下，就可以让含非ASCII字符的文件名正确显示了。\n\n```\n$ git config --global core.quotepath off\n```\n\n若在Windows使用命令行，您只能输入ASCII字符。所以，如果您的提交信息包含非ASCII字符，请不要使用-m选项，而要用外部编辑器输入。\n\n外部编辑器必须能与字符编码UTF-8和换行码LF兼容。\n\n```\ngit config --global core.editor \"\\\"[使用编辑区的路径]\\\"\"\n```\n\ncommit提交\n\n```\n$ git commit -m \'Init Wiki\'\n```\n\n使用log命令，我们可以在数据库的提交记录看到新的提交。\n\n```\n$ git log\ncommit b49063627b601e95fe7a2938f14c61fe218fb008 (HEAD -> master)\nAuthor: maxiaoyu <1020561033@qq.com>\nDate:   Wed Jul 26 11:39:30 2017 +0800\n\n    Init Wiki\n```\n\n\n\n#### git的注解\n\n查看其他人提交的修改内容或自己的历史记录的时候，提交信息是需要用到的重要资料。所以请用心填写修改内容的提交信息，以方便别人理解。\n以下是Git的标准注解：\n\n```\n第1行：提交修改内容的摘要\n第2行：空行\n第3行以后：修改的理由\n```\n\n请以这种格式填写提交信息。","timestamp":1516960476011},{"name":"02-如何解决git本地和远端冲突的问题.md","path":"04-04、Git/02-如何解决git本地和远端冲突的问题.md","content":"在github新建了一个版本库，然后本地在push的时候出现了一个问题：\n\n![](http://omk1n04i8.bkt.clouddn.com/17-7-26/5484363.jpg)\n\n主要原因是在github新建版本库的时候多手勾了一个添加一个README的操作，因为我本地的库也有文件，所以导致本地和远端冲突了。\n\n**解决方法**\n\n1、把远程仓库master分支下载到本地并存为tmp分支\n\n```\ngit fetch origin master:tmp\n```\n\n2、查看tmp分支与本地原有分支的不同\n\n```\ngit diff tmp\n```\n\n这里主要是看看有没有其他的改动…\n\n3、将tmp分支和本地的master分支合并\n\n```\ngit merge tmp\n```\n这个时候呢,本地与远程就没有冲突了,而且还保留了我今天的代码,现在Push就OK啦！\n\n但是操作过程中出现了一个问题：\n\n```\n提示：fatal: refusing to merge unrelated histories\n```\n\n解决方案：\n\n```\ngit pull origin master --allow-unrelated-histories\n```\n\n4、最后别忘记删除tmp分支\n\n```\ngit branch -d tmp\n```\n\n哈哈,又可以快乐的coding啦…","timestamp":1516960476011}]