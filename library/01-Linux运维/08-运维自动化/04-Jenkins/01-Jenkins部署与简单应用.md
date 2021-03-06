# Jenkins部署与简单应用

> 相关参考：https://www.cnblogs.com/kevingrace/p/6479813.html

## Jenkins安装

Jenkins是Java编写的，所以需要先安装JDK，如果对版本有需求，可以直接在Oracle官网下载JDK。因此我们可以直接使用`yum install -y java-1.8.0`去下载或者直接在Oracle官方下载jdk包进行部署，jdk的部署过程不再赘述。

Jenkins的安装过程也是极其简单的。点进Jenkins[官方](https://jenkins.io/download/)下载界面这里提供了多种的安装方式，比如yum，docker，war包等。这里为了方便，以及利于迁移等就使用tomcat+war包的方式进行部署。

先决条件：

- 请以规范的方式进行tomcat的部署工作，具体部署内容在这里不再进行赘述。
- 默认的启动tomcat的用户我们这里选用的是属主属组都是“tomcat”，目录权限也是如此。

### Jenkins Docker部署

```shell
# 安装
docker pull jenkinsci/blueocean

# 运行
docker run \
  -u root \
  -d \
  -p 9090:8080 \
  -v /var/jenkins-data:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkinsci/blueocean
```

### Jenkins war包部署

这里采用的就是简单的war包部署，放到tomcat对应的webapps目录下即可。本次部署的主机ip为：192.168.33.22，并没有进行域名的映射。因此直接访问`http://192.168.33.22:8080/jenkins`即可访问到jenkins界面了。

### 首次安装

**提前设置一下JENKINS_HOME**

如果有必要的话最好设置一下jenkins的家目录，这里我们是用tomcat启动的jenkins，因此默认情况下，jenkins会在`/home/tomcat/`下新建一个`.jenkins`的隐藏目录作为自己的家目录，为了更好的管理，这里我首先自定义一个JENKINS的家目录，修改tomcat的catalina.sh文件。

```
# OS specific support.  $var _must_ be set to either true or false.
export JENKINS_HOME="/usr/local/jenkins"
```

或者我直接在/etc/profile下面添加这么一个变量也是可以的，反正你这台主机专门作为jenkins，个人觉得没有什么不妥，环境变量设置好以后，记得创建必要的目录，将目标权限修改为我们的tomcat用户。

```shell
[root@localhost ~]# mkdir /usr/local/jenkins
[root@localhost ~]# chown -R tomcat.tomcat /usr/local/jenkins/
[root@localhost ~]# ll /usr/local/jenkins/ -d
drwxr-xr-x. 2 tomcat tomcat 6 5月  23 11:02 /usr/local/jenkins/
```

**首次安装可能会遇到的小问题**

首次安装的时候我们可能会发现Jenkins界面会一直卡在“Jenkins正在启动，请稍后……”的界面，其实这是因为Jenkins在启动的时候要去互联网获取更新插件的文件，但是由于网络原因可能会很慢，主要是服务器也在国外所致，所以你就会看到它不停的在刷新，解决这个问题有三种方案：

- 一个是手动把这个文件下载下来

- 第二个是使用国内的镜像源，使用方式很简单，修改`$JENKINS_HOME/hudson.model.UpdateCenter.xml`中的url为`http://mirror.xmission.com/jenkins/updates/update-center.json`就可以了。

  ```xml
  <?xml version='1.1' encoding='UTF-8'?>
  <sites>
    <site>
      <id>default</id>
      <url>http://mirror.xmission.com/jenkins/updates/update-center.json</url>
    </site>
  </sites>
  ```

- 找到updates目录下的defaults.json文件，把里面所有的谷歌地址改成百度的。updates文件夹也在`$JENKINS_HOME`下，替换文件的时候请用sed，文件内容很长。

**输入密钥**

首次使用需要对jenkins进行解锁，文件位置图中已经告诉你了，直接cat一下粘过来就行了。

![](http://omk1n04i8.bkt.clouddn.com/18-5-23/26918298.jpg)

接下来Jenkins会让你选择安装一些插件，我们可以根据自己的需要进行选择，或者安装Jenkins推荐给我们使用的一些插件。安装过程保证服务器可以连接到外网，否者可能会报错提示当前jenkins主机已经离线。安装过程不再体现。

![](http://omk1n04i8.bkt.clouddn.com/18-5-23/92741140.jpg)

接下来，我们需要创建一个用来登录和管理的用户账户。这个用户保存在`$JENKINS_HOME/users`下。

![](/var/folders/8l/g95nllln61j4ly_zm_tqj2m40000gn/T/abnerworks.Typora/image-201805231115117.png)

实例配置，记住这个地址很重要，影响到以后的访问：

![](http://omk1n04i8.bkt.clouddn.com/18-5-23/92328485.jpg)

到此为止，我们就可以使用Jenkins了。

## Jenkins + Gitlab

常用的一个用法就是Jenkins结合Gitlab实现一个整体构建过程。因此这里说明一下，如何配置一下Jenkins如何与Gitlab进行结合使用。

Jenkins之所以是很灵活的就是因为Jenkins的插件众多，可以实现不同的适配，结合Gitlab也是如此。在Jenkins系统设置中找到插件管理，安装`Gitlab Plugin`和`Gitlab Hook Plugin`这两个插件。

### 新建一个任务

![](http://omk1n04i8.bkt.clouddn.com/18-5-23/99863546.jpg)

在General选项卡中，可以根据需要填写一些这个任务的相关信息，比如任务的描述等等。

### 源码管理

找到源码管理的选项卡，这里我们使用Git进行源码管理，结合gitlab进行相关操作。在操作这个内容的时候同时要在Gitlab和Jenkins两边同时操作，首先在Gitlab中添加一个Deploy Key，这个key是允许Jenkins对git上的代码进行一些操作的。注意这里填写的是tomcat的公钥。最后一个是否要提供写权限，这里要把控好了，一般来说deploy key只读就够了，虽然我这里勾上了。

![](http://omk1n04i8.bkt.clouddn.com/18-5-23/3300544.jpg)

Repositories中的Respositories URL先别着急填写，先添加一下Credentials认证证书。直接点击add选Jenkins。其中用户为我们的tomcat，Private Key这里应该填写的是tomcat用户的私钥。其他的暂时都可以不填写，description可以填写说明一下，然后下拉点击报存。

![](http://omk1n04i8.bkt.clouddn.com/18-5-23/38812975.jpg)

如果说这里Gitlab服务器没有开放对应的端口的话我们还有另外一个连接方式，就是http(https)的方式，从Gitlab的版本库把地址拿过来也是ok的。这个时候下面的这个证书就可以不写了，因此在设置的时候注意是用ssh的方式还是使用http的方式，ssh的方式要确保对应的端口打开。

![](http://omk1n04i8.bkt.clouddn.com/18-5-23/98339097.jpg)

有些公司为了一定的安全性，因此并没有开放公开的22号端口，而是使用的其他端口代替，这种情况下，端口就变为了非标准端口，而连接的时候其实默认的是使用22号端口去连接的，可以参考一下[这篇文章](https://blog.csdn.net/wanwan5856/article/details/52797969)设置单独的连接方法。

### 构建触发器

到这里就可以开始配置Gitlab的钩子了，因为这个构建是需要认证的，简单来说就是jenkins这里要有一份，gitlab那里也要有一份，这样认证才能通过，认证的方式就是通过令牌的方式。但是有一个问题就是，在Jenkins的权限管理中我们设置的是只有登录用户才可以进行操作。但是这个认证提供访问的URL是需要先登录才会有这个token的，对于没有未登录的用户这个token是不存在的。因此我们还需要安装一个插件，才能使得双方能够进行验证，这里借助一个插件，Build Authorization Token Root。[官方wiki](https://wiki.jenkins-ci.org/display/JENKINS/Build+Token+Root+Plugin)

构建触发器的身份验证令牌这里用openssl来生成：

```shell
[tomcat@localhost ~]$ openssl rand -hex 10
81f44ed1f0e379df1927
```

在这里还可以设置一下触发的条件：

![](http://omk1n04i8.bkt.clouddn.com/18-5-23/12528930.jpg)

根据刚才我们下载那个插件的wiki，其中提供了用法为：

Examples

Trigger the RevolutionTest job with the token TacoTuesday

```
buildByToken/build?job=RevolutionTest&token=TacoTuesday
```

那么对应的认证URL应该该为如下的格式：

```
http://192.168.33.22:8080/jenkins/buildByToken/build?job=auto-deploy&token=81f44ed1f0e379df1927
```

这里的Job名称和token名称都和我们自己的名称对应好了。然后我们回到Gitlab找到Settings，切刀Integrations选项卡，把我们这个钩子的URL添加进去。

![](http://omk1n04i8.bkt.clouddn.com/18-5-23/51495060.jpg)

添加好了以后我们还可以对这个Hook进行测试，点击添加的内容右侧的Test，如果出现了如下的返回内容证明我们添加的hook是ok的。

![](http://omk1n04i8.bkt.clouddn.com/18-5-23/17304871.jpg)

然后我们在Jenkins任务的配置项中找到构建选项卡，这里就是构建的操作了。先弄一个非常简单的。

![](http://omk1n04i8.bkt.clouddn.com/18-5-23/33363819.jpg)

构建操作选择“执行-shell”，然后输入一点shell脚本。这个脚本的意思其实就是把jenkins这个workspace的job内容下的内容拷贝到我们的目标目录，我现在就是新建一个/tmp/jenkins_test目录而已，以后这个目录可以是本地的某个项目目录，或者是其他机器的项目目录，我们甚至可以结合saltstack或者ansible进行多台机器的批量部署。现在找到任务的主页，选择立即构建进行手动测试：

![](/var/folders/8l/g95nllln61j4ly_zm_tqj2m40000gn/T/abnerworks.Typora/image-201805231555580.png)

可以在左侧观察构建进度和构建状态，当构建出现问题以后左侧的提示标会变为红色，点进去可以查看具体的构建日志，选择控制台输出我们可以看到构建的详细过程，当然出错了以后也可以在这里查看构建的日志

![](http://omk1n04i8.bkt.clouddn.com/18-5-23/60125218.jpg)

这里看到构建成功，没有问题，接下来测试一下我们的webhook有没有生效吧。找一台测试机，先把我们的版本库clone下来然后提交点数据push上去，之前构建触发器的时候触发条件勾选上了Push Events，那么我们在操作Push操作的时候，会自动触发此次的构建。

当我们push数据到Gitlab的时候，发现Jenkins这边的确是触发了任务

![](http://omk1n04i8.bkt.clouddn.com/18-5-23/93796340.jpg)

查看我们的目标目录下是否更新

```shell
[root@localhost ~]# cd /tmp/jenkins_test/
[root@localhost jenkins_test]# ll
总用量 4
-rw-r-----. 1 root root  0 5月  23 16:11 aaaa
-rw-r-----. 1 root root 39 5月  23 15:46 README
```

可以看到我们在其他客户端push的aaaa这个文件的确是放到了我们的目标位置，当然目前来讲是只有提交到master分支的时候才会触发这个钩子，还记得之前在源码管理的时候，有一个选项是Branches to build，写的是`*/mater`，这里留空的话那么就是所有分支的提交都会触发这个hook的执行，因此我们可以通过修改这里来控制当某一个分支有所操作的时候触发操作。









