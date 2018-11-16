# Gitlab Docker

> Time：2018-11-15日
>
> 内容参考如下：
>
> - https://isudox.com/2016/08/01/running-gitlab-in-docker-container/
> - [Github Saneersbn docker-gitlab Releases](https://github.com/sameersbn/docker-gitlab/releases)
> - [Saneersbn Docker-Gitlab Document](https://github.com/sameersbn/docker-gitlab)
> - [官方docker-compose version 11.4.5](https://github.com/sameersbn/docker-gitlab/blob/master/docker-compose.yml)
> - [Saneersbn Docker Hub](https://hub.docker.com/r/sameersbn/gitlab/)
> - 备份：https://github.com/sameersbn/docker-gitlab#creating-backups
> - Gitlab Requirements：https://docs.gitlab.com/ee/install/requirements.html
> - https://blog.mallux.me/2017/02/27/gitlab/
> - 

## Gitlab架构

![](http://tuku.dcgamer.top/18-11-15/69854927.jpg)

- `nginx`：静态 Web 服务器
- `gitlab-shell`：用于处理 Git 命令和修改 authorized keys 列表
- `gitlab-workhorse`：轻量级的反向代理服务器，它会处理一些大的 HTTP 请求，比如文件上传、文件下载、Git push/pull 和 归档下载。其它请求会反向代理到 GitLab Rails 应用，即反向代理给后端的 unicorn。
- `Unicorn`：Ruby Web Server，托管 GitLab Rails 服务。增加 unicorn 的 workers 数量，可以减少应用的响应时间并提高处理并发请求的能力。对于大部分实例，我们建议使用这样的配置：`CPU 核心数 + 1 = unicorn workers 数`
- `Gitaly`：执行 gitlab-shell 和 gitloab-workhorse 的 git 操作，并向 GitLab web 应用程序提供一个 API，以从 git（例如 title, branches, tags, other meta data）获取属性，并获取 blob（例如 diffs，commits，files）
- `postgresql`：使用 PostgreSQL 必须确认 GitLab 使用的数据库安装了 pg_trgm 扩展。 这个扩展需要 PostgreSQL 使用 root 用户在 GitLab 每个数据库里面执行 `CREATE EXTENSION pg_trgm;` 命令
- `redis`：Redis 存储每个客户端的 sessions 和后台任务队列。Redis 需求的存储空间很小, 大约每个用户 25kB
- `sidekiq`：Sidekiq 使用多线程处理后台任务（异步）。 这个进程启动的时候会使用整个 Rails 堆栈（200MB+），但是它会在内存泄漏的情况下增加。 一个用户非常活跃的服务器上（10,000个活跃用户），Sidekiq 进程会占用 1GB+ 的内存。
- `logrotate`：日志文件管理



## Gitlab集成LDAP



另外一种配置方法：

```yaml
gitlab:
  image: gitlab/gitlab-ce
  volumes:
    - /srv/docker/gitlab/data:/var/opt/gitlab
    - /srv/docker/gitlab/config:/etc/gitlab
    - /srv/docker/gitlab/logs:/var/log/gitlab
  ports:
    - "10080:10080"
    - "10443:443"
    - "10022:22"
  restart: always
  hostname: 'xxx.xxx.xxx.xxx' # ホストPCのローカルアドレス
  dns:
    - xxx.xxx.xxx.xxx # 後述しますが、これだと解決していないです。
  environment:
    GITLAB_OMNIBUS_CONFIG: |
      gitlab_rails['gravatar_enabled'] = false
      gitlab_rails['time_zone'] = 'Asia/Tokyo'
      gitlab_rails['gitlab_ssh_host'] = 'xxx.xxx.xxx.xxx:10022'
      gitlab_rails['gitlab_email_from'] = 'gitlab@example.com'
      gitlab_rails['gitlab_email_reply_to'] = 'noreply@example.com'
      gitlab_rails['smtp_enable'] = true
      gitlab_rails['smtp_address'] = "xxx.xxx.xxx.xxx" # プロキシサーバーのIPアドレス
      gitlab_rails['smtp_port'] = 8025 # プロキシサーバーのポート
      gitlab_rails['smtp_domain'] = "xxx.xxx.xxx.xxx" # プロキシサーバーのIPアドレス
      gitlab_rails['smtp_tls'] = false
      gitlab_rails['smtp_enable_starttls_auto'] = false
      gitlab_rails['ldap_enabled'] = true
      # remember to close thise this block with 'EOS' below
      gitlab_rails['ldap_servers'] = YAML.load <<-'EOS' 
        main: # 'main' is the GitLab 'provider ID' of this LDAP server
          label: 'LDAP'
          host: 'xxx.xxx.xxx.xxx' # プロキシサーバーのIPアドレス
          port: 389 # プロキシサーバーのポート
          uid: 'sAMAccountName'
          method: 'plain' # "tls" or "ssl" or "plain"
          bind_dn: 'hoge@domain.org'
          password: 'password'
          active_directory: true
          allow_username_or_email_login: false
          base: 'dc=domain,dc=org'
      EOS
```





## Gitlab维护

> Rake(Ruby Make)，按理说Ruby代码无需编译,应该不需要Rake才对呀?原来,Rake另有妙用,即把Rake当做一个任务管理工具来使用...这样做有两个好处:
>
> 1. **以任务的方式创建和运行脚本**：当然,你可以用脚本来创建每一个你希望自动运行的任务.但是,对于大型的应用来说,你几乎总是需要为数据库迁移(比如Rails中db:migrate任务)、清空缓存、或者代码维护等等编写脚本.对于每一项任务,你可能都需要写若干脚本,这会让你的管理变得复杂.那么,把它们用任务的方式整理到一起,会让管理变得轻松很多.
> 2. **追踪和管理任务之间依赖**：Rake还提供了轻松管理任务之间依赖的方式.比如,"migrate"任务和"schema:dump"任务都依赖于 "connect_to_database"任务,那么在"migrate"任务调用之前,"connect_to_database"任务都会被执行.





## 其他文献

- [Gitlab升级恢复失败](https://hearrain.com/gitlab-sheng-ji-shi-bai-hui-fu)，迁移过程中要保证版本一致，否则可能因为版本问题出现无法降级的问题。

  ```shell
  
  ```