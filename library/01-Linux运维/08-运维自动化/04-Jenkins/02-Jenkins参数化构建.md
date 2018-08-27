# Jenkins参数化构建

> 背景：公司存在多个项目，每个项目也存在多个不同的分支，在项目较少的时候可以通过每一个分支建一个job的方式，这样一个项目如果分支多的话就会存在多个job，项目少的时候还好管理，项目多了以后管理起来就不是那么容易了，因此在这里引入一个参数化构建的方式，同一个项目根据项目不同需要部署不同的分支进行测试，只要针对输入的分支名来进行参数化构建就可以了，而不需要新建多个job。
>
> *内容参考*
>
> - https://blog.csdn.net/e295166319/article/details/54017231
> - https://blog.csdn.net/tongtong0704/article/details/70140606

## 步骤

- 首先配置你的项目，在General部分有一个参数化构建的选项，要把这个选项勾上

  ![](http://tuku.dcgamer.top/18-8-27/9045986.jpg)

- 点击 **添加参数按钮**，选择需要的类型。 这里因为分支名称是个字符串，所以选择 **string parameter**，同时还要新建一个Choice。其中Choice用于给出多个选项，构建的时候可以手动选择参数，Choice中的每一项单独一行，默认Choice内的第一行数据就是默认值。参数描述会在构建的时候在下面显示；

  ![](http://tuku.dcgamer.top/18-8-27/52431151.jpg)

- 对于这个变量的引用，只需要把对应的地方替换成`${branch_name}`即可。修改需要引用变量的地方。在Job的源码管理那，Branches to build那把内容替换成 `*/${branch_name}`

  ![](http://tuku.dcgamer.top/18-8-27/81220879.jpg)

- 然后就会发现，左边的 **立即构建** 变成了 **Build with Parameters**

  ![](http://tuku.dcgamer.top/18-8-27/23148672.jpg)

- 此时如果再次进行构建的话就会优先让你填写参数

  ![](http://tuku.dcgamer.top/18-8-27/2392000.jpg)

到目前为止我们已经了解了如何使用进行参数化的构建，当然这个是手动操作的，那么如何让这个过程随着gitlab的webhook动态起来呢？在[Gitlab Pulgin](https://github.com/jenkinsci/gitlab-plugin)的git中有这样一段内容：

```
Defined variables

When GitLab triggers a build via the plugin, various environment variables are set based on the JSON payload that GitLab sends. You can use these throughout your job configuration. The available variables are:

gitlabBranch
gitlabSourceBranch
gitlabActionType
gitlabUserName
gitlabUserEmail
gitlabSourceRepoHomepage
gitlabSourceRepoName
gitlabSourceNamespace
gitlabSourceRepoURL
gitlabSourceRepoSshUrl
gitlabSourceRepoHttpUrl
gitlabMergeRequestTitle
…………………………
```

也就是说只要是使用了这个插件，那么在这个job的整个配置过程中，我们都是可以使用这些变量的，这里没有完整的列出来，有需要可以自行去git上查看。

那么也就意味着，只要这个gitlab的webhook触发了，那么我就可以通过gitlabBranch这个变量拿到提交的分支，那么我们在拉取代码的时候就可以动态的这样拉取。

![](http://tuku.dcgamer.top/18-8-27/66618431.jpg)

那么这样，jenkins就可以动态的拿到具体提交的是哪一个分支了，也会拉取对应的分支代码下来。接下来如何进行操作就是我们自己的问题了，不管是执行shell还是用maven打包。