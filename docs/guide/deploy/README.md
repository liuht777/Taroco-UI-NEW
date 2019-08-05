# 部署

::: tip
Taroco 使用 Docker compose 部署, Docker compose 文件已经内置到项目当中: taroco-docs/docker
:::

## 环境准备

### 安装 Docker CE (社区版)

如需安装 Docker企业版 以及关于Docker的更多描述, 请阅读 Docker [官方文档](https://docs.docker-cn.com/)

> centos 内核版本必须要高于3.10 

查看 centos 内核版本

```
uname -r 
```

* 安装所需要的软件包

```
yum install -y yum-utils device-mapper-persistent-data lvm2
```

* 设置 stable 镜像仓库

```
yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
```

* 安装 Docker CE

```
yum makecache fast -更新 yum 软件包索引  
yum install docker-ce -安装最新版Docker CE
```

* 启动 Docker

```
systemctl start docker
```

* 设置docker开机启动

```
systemctl enable docker
```

### 安装 Docker Compose

* 安装命令

```
curl -L https://github.com/docker/compose/releases/download/1.21.2/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose  
chmod +x /usr/local/bin/docker-compose
```

* 查看安装

```
docker-compose -v
```

## 启动容器

::: tip
Dockerfile 文件, 以及 Docker compose 文件已经写好放在 taroco-docs/docker目录下, 我们只需要执行相应脚本即可。  
启动脚本在项目根目录下，注意启动顺序。   
如果是集群环境，请参考 [Docker多机器通信](https://blog.csdn.net/doegoo/article/details/80614848)，或者直接使用 [Kubernetes](https://kubernetes.io/) 部署应用。
:::

启动方式为： 将 Taroco 项目克隆到指定服务器，进入项目根目录，切换对应分支即可。  

### 启动基础服务

Taroco 依赖 mysql 以及 redis 服务，这两个服务需要优先启动。

```
sh taroco-run-base.sh
```

### 启动其他服务

接下来就是启动一些具体的业务（应用）了，taroco-run.sh 脚本中包括了权限服务、认证服务、服务治理、服务网关。

```
sh taroco-run.sh
```

## 部署前端

Taroco 前端同样采用 Docker 方式部署，Dockerfile 文件以及启动脚本已经写好在项目根目录当中。

* 同后端一样：将 Taroco 前端项目克隆到指定服务器，进入项目根目录，切换对应分支即可。  

* 需要注意的是：后端接口地址在根目录 .vue文件当中，执行脚本之前需要修改为正确的地址。

```
sh run.sh
```