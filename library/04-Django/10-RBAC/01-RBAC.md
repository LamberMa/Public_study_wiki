# RBAC

> Role-Basiced Access Control基于角色的访问控制，RBAC认为权限的过程可以抽象概括为：判断【Who是否可以对What进行How的访问操作（Operator）】这个逻辑表达式的值是否为True的求解过程。即将权限问题转换为Who、What、How的问题。who、what、how构成了访问权限三元组。这样极大的简化了权限的管理，这样管理都是层级相互依赖的，权限赋予角色，然后又把角色赋予用户，这样的权限设计清晰管理起来也方便。
>
> **参考资料**
>
> - https://www.cnblogs.com/lamp01/p/6576432.html

## RBAC介绍

RBAC有什么优势？它简化了用户和权限的关系，并且易于扩展和维护。比如用户直接关联权限明细的话，不同的用户可能存在大量重复的权限，这样当权限和用户比较多的时候要维护的内容量是巨大的，现在将角色与具体的权限进行关联，而用户和角色进行挂钩。

![图源：https://www.cnblogs.com/lamp01/p/6576432.html](http://tuku.dcgamer.top/18-6-12/82751409.jpg)

赋予角色不同的权限，针对不同的权限还应该有不同的操作（actions），比如针对用户列表，有的就只有查看用户的功能，有的权限能添加，有的权限甚至可以删除和修改，这就是针对不同权限（permission）的不同操作（actions）。我们可以更细致的去把控。

![](http://tuku.dcgamer.top/18-6-12/44715052.jpg)

根据如上说明的功能，可以抽象出如下功能模块：

![](http://tuku.dcgamer.top/18-6-12/31584515.jpg)

对应权限控制的逻辑流程如下：

![](http://tuku.dcgamer.top/18-6-12/33797457.jpg)

## RBAC数据库设计

基于角色的访问控制，根据角色来决定用户的访问权限有哪些。首先看数据表设计，把这个内容作为一个单独的app来进行调用，为以后的通用做准备。具体内容如下：

- 用户表，标识用户，内含有用户的基本信息等。
- 角色表，标识角色，用户要与角色进行关联，角色和用户是一个多对多的关系。一个用户可以拥有多个角色，比如xx同时担任了总监和经理的工作。角色也会同时被多个用户所有。
- 用户与角色关联表：将用户与角色进行关联。两个字段都是外键的关系
- 菜单表：这里加了一个菜单表，这个菜单表表示的是功能菜单，如果我们要设计这样的一个权限系统的话，最终的权限是要挂靠到菜单上去的。比如一个系统里面，可能会有A、B、C三个菜单，A菜单下可能会有用户管理，订单管理等等，这是权限，具体到用户管理下面又有添加用户，删除用户，修改用户等等。这是权限对应的actions操作。菜单与菜单之间也存在层级关系，比如一级菜单，一级菜单下面还有二级菜单，二级菜单还有三级甚至更多。但是菜单都是一个menu表，每一个菜单明细都是一个menu对象。因此有一个自关联的关系，在进行自关联的时候要写`'self'`你不能说直接写menu这个类，因为这现在是在定义的过程当中，这个类还没被定义完呢，你不能直接用，所以要用引号引起来的一个self，这个是django为我们提供的一个功能点。
- 权限表：有具体的权限内容，挂靠到菜单表上。
- 动作表：每一个权限对应着一个url action表示执行的方法，比如get，post，edit，del等等。

- 最后我们说权限是基于角色来的，因此角色对应什么权限，对应什么操作。因此最后需要一个角色x权限x动作的这么一个关系表。

具体表内容设计如下：

```python
from django.db import models

# Create your models here.
from django.db import models

class User(models.Model):
    """
    用户表
    """
    username = models.CharField(verbose_name='用户名', max_length=32)
    password = models.CharField(verbose_name='密码', max_length=64)
    email = models.EmailField(verbose_name='邮箱')

    def __str__(self):
        return self.username


class Role(models.Model):
    """
    角色表
    """
    caption = models.CharField(verbose_name='角色', max_length=32)

    def __str__(self):
        return self.caption


class User2Role(models.Model):
    """
    用户角色关系表
    """
    user = models.ForeignKey(User, verbose_name='用户', related_name='roles', on_delete=models.CASCADE)
    role = models.ForeignKey(Role, verbose_name='角色', related_name='users', on_delete=models.CASCADE)

    def __str__(self):
        return '%s-%s' % (self.user.username, self.role.caption,)


class Menu(models.Model):
    """
    菜单表
    """
    caption = models.CharField(verbose_name='菜单名称', max_length=32)
    parent = models.ForeignKey('self', verbose_name='父菜单', related_name='p', null=True, blank=True, on_delete=models.CASCADE)

    def __str__(self):
        prev = ""
        parent = self.parent
        while True:
            # 如果有父级菜单
            if parent:
                prev = prev + '-' + str(parent.caption)
                parent = parent.parent
            else:
                break
        return '%s-%s' % (prev, self.caption,)


class Permission(models.Model):
    """
    权限
    """
    caption = models.CharField(verbose_name='权限', max_length=32)
    url = models.CharField(verbose_name='URL正则', max_length=128)
    menu = models.ForeignKey(Menu, verbose_name='所属菜单', related_name='permissions',null=True,blank=True,  on_delete=models.CASCADE)

    def __str__(self):
        return "%s-%s" % (self.caption, self.url,)


class Action(models.Model):
    """
    操作：增删改查
    """
    caption = models.CharField(verbose_name='操作标题', max_length=32)
    code = models.CharField(verbose_name='方法', max_length=32)

    def __str__(self):
        return self.caption


class Permission2Action2Role(models.Model):
    """
    权限操作关系表
    """
    permission = models.ForeignKey(Permission, verbose_name='权限URL', related_name='actions',  on_delete=models.CASCADE)
    action = models.ForeignKey(Action, verbose_name='操作', related_name='permissions',  on_delete=models.CASCADE)
    role = models.ForeignKey(Role, verbose_name='角色', related_name='p2as',  on_delete=models.CASCADE)

    class Meta:
        unique_together = (
            ('permission', 'action', 'role'),
        )

    def __str__(self):
        return "%s-%s-%s" % (self.permission, self.action, self.role,)
```

生成对应的关系表，生成表内容以后不要忘了注册app：

```python
python manage.py makemigrations
python manage.py migrate
```

在这个app02下开始写视图函数，首先测试一下内容：

```python
from app02 import models
def test(request):
    # 首先拿到一个用户对象
    obj = models.User.objects.filter(username='alex').first()
    # 然后我要拿用户的角色的时候可以这么去拿
    # models.User2Role.objects.filter(user_id=obj.id)
    # 不过这样拿到的其实是一个user2role的一个对象，而不是拿到的角色对象，处理起来其实很不方便
    # 那么我们现在要拿一个role的对象，relate_name=users然后跨表到user表中获取。
    # 那么现在的这个role_list就是拿到的这个用户的角色对象的列表，这是拿到的一个query_set。
    role_list = models.Role.objects.filter(users__user_id=obj.id)
    
    # 有了用户角色以后现在其实就可以通过角色去拿用户权限了，但是有一个问题哈，比如管理员有添加用户的权限，超级管理员也有添加用户的权限，那么就存在说拿到的权限可能存在重复的现象。因此我们需要对取回来的数据去重，去重我们可以使用distinct，或者使用annotate去重，不同的地方就是annotate会给你多加一列，distinct的执行效率稍微低了点。
    permission_list = models.Permission2Action2Role.objects.filter(role__in=role_list).values('permission__url', 'action__code').distinct()
    # 那么这样拿到的数据也是一个query-set，只不过是列表套字典，因为我们是用values取的，我们拿到的数据是权限表里的url和action操作表里的code。格式基本类似如下：
    """
    [
        {'permission__url':'/index.html', 'action__code':"GET"},
        {'permission__url':'/edit.html', 'action__code':"POST"},
        {'permission__url':'/index.html', 'action__code':"GET"},
        ……
    ]
    """
    # 现在拿到的数据中，同一个permission_url可能会存在多个的，比如A权限，对应action为get的这是一条，A权限对应action为delete又有一条，action有多个就会存在多个同样的permission_url的记录。现在将对这个记录进一步的进行优化，达到一个最后一个目标类似如下的结构，把结果放到一个字典里去，key是我们的permission_url，value是一个以action为内容的列表：
    """
    {
        'index.html': [GET, POST, EDIT, DELETE],
        'order.html': [GET, POST]
    }
    """
    # 首先初始化一个空字典
    user_permission = {}
    # 遍历我们拿到的权限列表(query_set)
	for item in permission_list:
    	if not user_permission.__contains__(item['permission__url']):
        	user_permission[item['permission__url']] = item['action__code'].split()
            continue
    	user_permission[item['permission__url']].append(item['action__code'])
    # 做到这一步，我们就把用户独有的权限，以及action都拿到了，那么接下来如何处理呢。接下来其实就可以把这个取到的内容放到用户的session中去，以后访问其他的页面的时候都会以这个为参考，取不到对应的页面权限和actions就不让他们访问就可以了。
    # 不过如果说临时添加了新功能，那么这个功能是没有机制去更新到session中去，也就是说不会立即生效，需要用户重新登录才行。
    # 上面就是对用户的内容做了一个简单的获取和规整。
    return HttpResponse('...')
```

现在模拟一个很low的登录过程：

```python
def login(request):
    if request.method == 'GET':
        return render(request, 'app02/login2.html')
    else:
        obj = models.User.objects.filter(username='lamber').first()
        if not obj:
            return HttpResponse('用户不存在！')
        role_list = models.Role.objects.filter(users__user_id=obj.id)
        permission_list = models.Permission2Action2Role.objects.filter(role__in=role_list).values('permission__url', 'action__code').distinct()
        user_permission = {}
        for item in permission_list:
            if not user_permission.__contains__(item['permission__url']):
                user_permission[item['permission__url']] = item['action__code'].split()
                continue
            user_permission[item['permission__url']].append(item['action__code'])
        # 把用户的权限列表扔到session中。
        request.session['user_permission_dict'] = user_permission
        return HttpResponse('Login Successfully')
```

这样session中就已经存储了用户的权限信息了。然后现在在浏览器输入不同的页面地址去模拟访问权限控制的结果。这个操作应该每一次的访问都应该要取执行，而且涉及的页面众多，因此不能把这个判定逻辑写到每一个视图函数中，最好是放到中间件中去进行预先的处理。因此这里将所有的权限的逻辑判断内容扔到一个中间件中去。

在项目目录下新建一个middleware的目录，然后新建一个中间件的py文件名称拟定为md.py，将这个中间件在全局配置文件中进行注册一下，加上这么一条：

```python
'middleware.md.M1',
```

中间件内容如下：

```python
from django.utils.deprecation import MiddlewareMixin
from django.shortcuts import HttpResponse
import re

# 固定的要继承一个中间件的基类。
class M1(MiddlewareMixin):

    def process_request(self, request, *args, **kwargs):

        # 不能针对所有的请求，比如登录，因此要过滤掉一部分的页面，否则你登录都没法登陆就别提拿到用户权限了，相当于你永远都没法访问这个网站了，因此要放行一些地址。
        # 定义个需要过滤的列表，放行一部分不需要做权限把控的页面。
        valid = [
            '/rbac/auth-login.html',
            '/rbac/index.html',
            'admin',
        ]
        # 这个request.path_info只包含访问的路径不包含后面接的参数什么的。
        if request.path_info not in valid:
            # 把action拿到手
            action = request.GET.get('md')
            # 我首先看你这个权限列表有没有，如果没有，不好意思，直接不能访问。
            user_permission_dict = request.session.get('user_permission_dict')
            if not user_permission_dict:
                return HttpResponse('无权限')
            # 然后看看在权限列表里你有没有权限URL，如果没有，抱歉，你没有权限访问
			# 遇到带正则表达式的请求url该怎么办？因此这个url应该是一个正则，代表一类或者一系列的URL
            # 这个时候就不是一个固定的地址了，而是一个带正则的地址。这个时候就需要做正则匹配了。
            # 首先设置一个标记位为false，如果认证通过就改成true
            flag = False
            for k, v in user_permission_dict.items():
                # request_path没问题
                if re.match(k, request.path_info):
                    # 并且请求的action在列表中存在，那么认证通过，否则认证失败
                    if action in v:
                        flag = True
                        break
            if not flag:
                return HttpResponse('无权限')
```

## 菜单的获取

下面的代码其实是一个权限菜单挂靠和菜单挂靠菜单的过程。

```python
def menu(request):
    
    # 所有菜单：处理成当前用户关联的菜单，这些菜单就都是类似下面这种格式的：
    """
    [
          {'id': 1, 'caption': '1.0', 'parent_id': None}, 
          {'id': 2, 'caption': '2.0', 'parent_id': None}, 
          {'id': 3, 'caption': '3.0', 'parent_id': None}, 
          {'id': 4, 'caption': '1.1', 'parent_id': 1}, 
          {'id': 5, 'caption': '2.1', 'parent_id': 2}, 
          {'id': 6, 'caption': '3.1', 'parent_id': 3},
          ……
    ]
    """
    # 先把所有的菜单拿出来
    all_menu_list = models.Menu.objects.all().values('id', 'caption', 'parent_id')
    
    # 首先获取一个用户对象，比如获取username为mxy的用户对象，并且把这个用户的所有权限都拿到。
    # 这里的权限只取了四个字段，分别是权限的id，url，菜单id，权限的名称。
    user = models.User.objects.filter(username='mxy').first()
    role_list = models.Role.objects.filter(users__user=user)
    # 拿到当前指定用户的所有的权限
    permission_list = models.Permission2Action2Role.objects.filter(role__in=role_list).values('permission__id','permission__url', 'permission__menu_id','permission__caption').distinct()

    # 最后你有什么权限，是要在菜单上体现的。所以需要将权限挂靠到菜单上
    # 首先初始化一个all_meuu_dict的字典
    # 遍历所有的菜单。给每一个菜单添加一个必要的字段
    # 其中child表示当前菜单的子节点，status表示是否显示这个菜单，opened表示这个菜单是否默认为打开状态
    # 我整个字典拼完了以后大概是下面这么个样子
    """
    {
        1:{'id':1, 'caption':'菜单1', parent_id:None,status:False,opened:False,child:[]},
        2:{'id':2, 'caption':'菜单2', parent_id:None,status:False,opened:False,child:[]},
        3:{'id':3, 'caption':'菜单3', parent_id:None,status:False,opened:False,child:[]},
        5:{'id':4, 'caption':'菜单1-1', parent_id:1,status:False,opened:False,child:[]},
    }
    """
    all_menu_dict = {}
    for row in all_menu_list:
        row['child'] = []  # 添加孩子节点。
        row['status'] = False  # 是否显示菜单
        row['opened'] = False  # 是否默认打开
        # 重新构造这个menu的这个字典，这样拼接完了以后就是上面那个形式了。
        # 这里有一个值得注意的点就是，这个新的字典内容是根据之前的all_menu_list构建而来的，对于这个薪资点来说，保存的是列表内容中的引用，因此下向字典的中value中的row['child']插入数据的时候，之前的all_menu_dict也是跟着发生变化的。注意这一点。
        all_menu_dict[row['id']] = row
        
    for per in permission_list:
        if not per['permission__menu_id']:
            continue

        # 规范显示名称，对应的字段使用字典做映射，为什么要做映射？因为我们取出来的权限列表里，都是permission__id，permission__url这种的，最后它是要挂载到菜单上的，有些子菜单也是要被挂载到一些菜单上的，因此在这里把权限和菜单的属性名做一下统一，这个权限的permission__menu_id其实就相当于菜单的parent_id，因此做下面的操作。
        item = {
            'id': per['permission__id'],
            'caption': per['permission__caption'],
            'parent_id': per['permission__menu_id'],
            # 针对具体的权限一定要有一个可以操作跳转的url地址。
            'url': per['permission__url'],
            # 是否显示菜单，如果菜单下有权限跳转的话，那么这个菜单应该显示出来，同理它的上级菜单应该是可以显示的，递归这个的上级的上级菜单也是可以显示的，以此类推。
            # 是否默认打开：只有当前URL和用户请求的URL匹配上了才会变成True，所以默认False
            # 这个菜单是否默认应该被打开呢？当然不是，需要根据URL的正则去判断是否为True。
            'status': True,
            'opened': False
        }
        # 如果我当前点的就是这个权限url，那么就应该被展开。
        if re.match(per['permission__url'],request.path_info):
            item['opened'] = True
        pid = item['parent_id']
        # 开始挂靠工作，把权限挂到菜单上，等所有的权限循环完毕了，操作完了所有的菜单都挂靠完毕了，当然有些权限是可以挂到菜单，有些是不需要挂载的，比如上传图片，不需要体现到菜单上，之后做拓展，比如menu-id为none的时候就允许不挂到菜单上。
        all_menu_dict[pid]['child'].append(item)


        # 如果说这个菜单下有权限，那么这个菜单的父级status就等于true，应该被显示出来，这个父级菜单的父级菜单也应该被显示出来，同样应该将status设置为true。
        temp = pid  # 1.父亲ID
        # 递归的出口：当父级id=None的时候那么就证明找到头了。
        # 同时为了避免已经改过的再次去执行，判断一下，如果不是true再改。少循环点
        while not all_menu_dict[temp]['status']:
            all_menu_dict[temp]['status'] = True
            temp = all_menu_dict[temp]['parent_id']
            if not temp:
                break

        # 将当前权限前辈opened=True
        if item['opened']:
            temp1 = pid  # 1.父亲ID
            while not all_menu_dict[temp1]['opened']:
                all_menu_dict[temp1]['opened'] = True
                temp1 = all_menu_dict[temp1]['parent_id']
                if not temp1:
                    break

    # ############ 处理菜单和菜单之间的等级关系，菜单挂靠子菜单。 ############
    """
    all_menu_dict = {
        1:{'id':1, 'caption':'菜单1', parent_id:None,status:False,opened:False,child:[{'permission__url':'/order.html','permission__caption': '订单管理','permission__menu_id': 1 },]},
        2:{'id':2, 'caption':'菜单2', parent_id:None,status:False,opened:False,child:[]},
        3:{'id':3, 'caption':'菜单3', parent_id:None,status:False,opened:False,child:[]},
        5:{'id':4, 'caption':'菜单1-1', parent_id:1,status:False,opened:False,child:[]},
    }


    all_menu_list= [
        {'id':1, 'caption':'菜单1', parent_id:None,status:False,opened:False,child:[{'permission__url':'/order.html','permission__caption': '订单管理','permission__menu_id': 1 }, {'id':4, 'caption':'菜单1-1', parent_id:1,status:False,opened:False,child:[]},]},
        {'id':2, 'caption':'菜单2', parent_id:None,status:False,opened:False,child:[]},
        {'id':3, 'caption':'菜单3', parent_id:None,status:False,opened:False,child:[]},

    ]
    """

    result = []
    for row in all_menu_list:
        pid = row['parent_id']
        if pid:
            all_menu_dict[pid]['child'].append(row)
        else:
            # 上面的子菜单挂靠完成以后，然后把所有的跟菜单扔到result这个列表里，这就是我们想要的结果了。
            result.append(row)

    ##################### 结构化处理结果 #####################
    for row in result:
        print(row['caption'], row['status'], row['opened'], row)

    ##################### 通过结构化处理结果，生成菜单开始 #####################
    """
    result = [
        {'id':1, 'caption':'菜单1', parent_id:None,status:False,opened:False,child:[5:{'id':4, 'caption':'菜单1-1', parent_id:1,status:False,opened:False,child:[]},2:{'id':2, 'caption':'菜单2', parent_id:1,status:False,opened:False,child:[]},]}
        {'id':2, 'caption':'菜单2', parent_id:None,status:True,opened:False,child:[]},
        {'id':3, 'caption':'菜单3', parent_id:None,status:true,opened:False,child:[url...]},
    ]
    """

    # status=False ,不生产成
    # opened=True  ,true不加hide，false，加hide，也就是隐藏的意思。
    
    """
	# 希望生成一个这样的html结果。
    <div class='menu-item'>
        <div class='menu-header'>菜单1</div>
        <div class='menu-body %s'>
            <a>权限1</a>
            <a>权限2</a>
             <div class='menu-item'>
                <div class='menu-header'>菜单11</div>
                <div class='menu-body hide'>
                    <a>权限11</a>
                    <a>权限12</a>
                </div>
            </div>
        </div>
    </div>
    <div class='menu-item'>
        <div class='menu-header'>菜单2</div>
        <div class='menu-body hide'>
            <a>权限1</a>
            <a>权限2</a>
        </div>
    </div>
    <div class='menu-item'>
        <div class='menu-header'>菜单3</div>
        <div class='menu-body hide'>
            <a>权限1</a>
            <a>权限2</a>
        </div>
    </div>


    """

    def menu_tree(menu_list):
        tpl1 = """
            <div class='menu-item'>
                <div class='menu-header'>{0}</div>
                <div class='menu-body {2}'>{1}</div>
            </div>
            """
        tpl2 = """
            <a href='{0}' class='{1}'>{2}</a>
            """

        menu_str = ""
        for menu in menu_list:
            # 如果不该显示，直接pass就可以了。
            if not menu['status']:
                continue
            # menu: 可能是菜单，可能是权限（url）
            if menu.get('url'):
                # 权限
                menu_str += tpl2.format(menu['url'], 'active' if menu['opened'] else "", menu['caption'])
            else:
                # 菜单
                if menu['child']:
                    child_html = menu_tree(menu['child'])
                else:
                    child_html = ""
                menu_str += tpl1.format(menu['caption'], child_html, "" if menu['opened'] else 'hide')

        return menu_str

    menu_html = menu_tree(result)

    return render(request, 'menu.html', {'menu_html': menu_html})
```

## 作为组件来使用

组件：作为一个公共的app

- 权限的限制
- 生成菜单
- 仍然是涉及到七张表

单独起一个app，这个插件并不做展示。结合session和中间件做操作。

运行步骤：

- 引入中间件，利用权限控制
- 创建菜单功能，调用service控件。 

```python
# 其他app引用这个rbac的model内容
from django.db import models
from rbac.models import User as RabcUser
class UserInfo(models.Model):
    nickname = models.CharField(max_length=32)
    user = models.OneToOneField(RbacUser)
```

三种情况会调用

- 登录成功，写session，sevice.permission_session(userid，request)
- 做检测，在配置文件中注册中间件。
- 生成菜单，调用service里面的menu，css，js方法。如果要实现动态菜单的话就把这个菜单的信息放到session里面去。只要从session中获取到就可以了。可以通过simple_tag来实现。

### 用户权限采集

首先用户模型的定义是不变的，仍然和上述一样，首先把用户的权限采集标准化，在rbac的app中新建一个service文件，用来存放这一部分的逻辑。

首先在系统settings文件中添加一下内容，后面的操作会逐一用到并做说明：

```python
RBAC_NO_AUTH_URL = [
    '/index.html',
    '/login.html',
    '/register.html',
    '/admin.*',
    '/rbac.*',
]
RBAC_PERMISSION_SESSION_KEY = "rbac_permission_session_key"

# 把菜单放在session中，这一个取的是权限的session的key
RBAC_MENU_PERMISSION_SESSION_KEY = "rbac_menu_permission_session_key"
# 菜单key
RBAC_MENU_KEY = "rbac_menu_key"
# 权限信息
RBAC_MENU_PERMISSION_KEY = "rbac_menu_permission_key"

"""
session[RBAC_MENU_PERMISSION_SESSION_KEY] = {
    RBAC_MENU_KEY:菜单信息,
    RBAC_MENU_PERMISSION_KEY:权限信息
}
"""
# RBAC的默认主题
RBAC_THEME = "default"
RBAC_QUERY_KEY = "md"
RBAC_DEFAULT_QUERY_VALUE = "look"
# 无权访问的时候提示的消息
RBAC_PERMISSION_MSG = "无权限访问"
```

初始化用户权限逻辑

```python
#!/usr/bin/env python
# -*- coding:utf-8 -*-
import re
# 一部分配置项我们保存在了django的settings文件中，通过引入文件可以拿到我们定义的全局env
from django.conf import settings

from . import models


def initial_permission(request, user_id):
    """
    初始化权限，获取当前用户权限并添加到session中
    将当前用户权限信息转换为以下格式，并将其添加到Session中
        {
            '/index.html': ['GET','POST','DEL','EDIT],
            '/detail-(\d+).html': ['GET','POST','DEL','EDIT],
        }
    
    :param request: 请求对象
    :param user_id: 当前用户id
    :return: 
    """

    """初始化权限信息"""
    roles = models.Role.objects.filter(users__user_id=user_id)
    p2a = models.Permission2Action2Role.objects.filter(role__in=roles).values('permission__url',                                                                        "action__code").distinct()
    user_permission_dict = {}
    for item in p2a:
        if item['permission__url'] in user_permission_dict:
            user_permission_dict[item['permission__url']].append(item['action__code'])
        else:
            user_permission_dict[item['permission__url']] = [item['action__code'], ]
	# 将拼接好的权限数据结构扔到session中，key我们在配置文件中进行了定义，可以灵活的定制。
    request.session[settings.RBAC_PERMISSION_SESSION_KEY] = user_permission_dict

    """初始化菜单信息，将菜单信息和权限信息添加到session中"""
    # queryset类型没法直接写到session中，需要变成列表，因为在放到session的时候如果你给我的是一个对象
    # 它会优先把这个对象序列化然后再放到session里，但是默认的queryset不能做序列化。所以要先list一下。
    menu_list = list(models.Menu.objects.values('id', 'caption', 'parent_id'))

    menu_permission_list = list(models.Permission2Action2Role.objects.filter(role__in=roles,                                                                   permission__menu__isnull=False).values(
        'permission_id',
        'permission__url',
        'permission__caption',
        'permission__menu_id').distinct())
    request.session[settings.RBAC_MENU_PERMISSION_SESSION_KEY] = {
        settings.RBAC_MENU_KEY: menu_list,
        settings.RBAC_MENU_PERMISSION_KEY: menu_permission_list
    }


def fetch_permission_code(request, url):
    """
    根据URL获取该URL拥有的权限，如：["GET","POST"]
    :param request: 
    :param url: 
    :return: 
    """
    user_permission_dict = request.session.get(settings.RBAC_PERMISSION_SESSION_KEY)
    if not user_permission_dict:
        return []
    for pattern, code_list in user_permission_dict.items():
        if re.match(pattern, url):
            return code_list
    return []

```

### 新建一个工单应用

> 现在要新建一个工单的应用。然后把rbac结合进去

#### models模型类

```python
from django.db import models
# 引入RBAC模块中的RBAC的用户相关内容
from rbac.models import User as RbacUser
# import datetime


# Create your models here.
class UserInfo(models.Model):

    nickname = models.CharField(max_length=16)
    # 使用的话直接和RBAC里的user做一个OneToOne就行了。
    # 其他的用户名啊，密码啊，在这里其实就根本不用体现了。
    user = models.OneToOneField(RbacUser, on_delete=models.CASCADE)

    def __str__(self):
        return self.nickname


class Order(models.Model):
    # nid = models.IntegerField(primary_key=True, )
    # uuid也是生成一个随机字符串扔进来
    # uid = models.UUIDField()
    """报障单"""
    title = models.CharField(max_length=32, verbose_name='报障标题')
    detail = models.TextField(verbose_name='报事详细')
    # 有多个字段外键连接到同一个表的时候记得加relate name否则反向查询的时候根本不知道找的谁。
    create_user = models.ForeignKey(UserInfo, on_delete=models.CASCADE, related_name='aaa')
    # Tip：记住这里如果要加一个默认值的话需要加一个方法，而是方法执行后的结果，否则数据就一直不变了，因此去掉括号，不去调用。
    # ctime = models.DateTimeField(auto_now_add=True, default=datetime.datetime.now)
    ctime = models.DateTimeField(auto_now_add=True)
    # 时间也可以是float类型，放一个时间戳
    # ctime = models.FloatField()
    status_choice = (
        (1, '未处理'),
        (2, '处理中'),
        (3, '已处理'),
    )
    status = models.IntegerField(choices=status_choice, default=1)
    processor = models.ForeignKey(UserInfo, on_delete=models.CASCADE, related_name='bbb', null=True, blank=True)
    solution = models.TextField(null=True, blank=True)
    ptime = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return '%s-%s' % (self.title, self.create_user)
```

#### 中间件层

在到视图函数之前还要过一层中间件，记得中间件要在全局配置文件里注册一下：

```python
#!/usr/bin/env python
# -*- coding:utf-8 -*-

import re
# 配置文件这回我扔到全局配置文件里去了。
from django.conf import settings
from django.utils.deprecation import MiddlewareMixin
from django.shortcuts import HttpResponse


class RbacMiddleware(MiddlewareMixin):
    def process_request(self, request, *args, **kwargs):
        """
        检查用户是否具有权限访问当前URL
        :param request: 
        :param args: 
        :param kwargs: 
        :return: 
        """

        """跳过无需权限访问的URL，比如登录界面，这个从全局配置文件直接取。"""
        for pattern in settings.RBAC_NO_AUTH_URL:
            if re.match(pattern, request.path_info):
                return None

        """获取当前用户session中的权限信息"""
        permission_dict = request.session.get(settings.RBAC_PERMISSION_SESSION_KEY)
        if not permission_dict:
            return HttpResponse(settings.RBAC_PERMISSION_MSG)

        """当前URL和session中的权限进行匹配"""

        flag = False
        for pattern, code_list in permission_dict.items():
            # 把所有的code_list给转换成大写
            upper_code_list = [item.upper() for item in code_list]
            if re.match(pattern, request.path_info):
                # 我去拿这个请求后面带的参数，如果没带参数的话那么就给一个默认的并且给大写了。
                request_permission_code = request.GET.get(settings.RBAC_QUERY_KEY, settings.RBAC_DEFAULT_QUERY_VALUE).upper()
                if request_permission_code in upper_code_list:
                    # 用户当前访问的权限，为了方便以后在视图函数中调用。比如=GET
                    request.permission_code = request_permission_code
                    # 当前用户的所有权限，为了方便以后在视图函数中调用。
                    request.permission_code_list = upper_code_list
                    flag = True
                    break

        if not flag:
            return HttpResponse(settings.RBAC_PERMISSION_MSG)

```

#### 视图函数

```python

```





## 小结

### RBAC的使用

- 在installed_apps中进行导入，导入以后可以先生成表，`pythono manage.py makemigrations && python manage.py migrate`
- 引入中间件，rbac的中间件。