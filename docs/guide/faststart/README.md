# 快速开始

::: tip
本文将介绍如何编译-启动 Taroco，如果您已经是个 Java 多年使用者，或者对 Spring Cloud 有充分的理解，那么可以忽略本章节。
:::

## 后端环境依赖

* JDK1.8+
* Spring Boot 2.0.5
* Spring Cloud Finchley.SR4
* Spring Cloud Alibaba 2.0.0.RELEASE
* Maven 3.0+
* Redis 3.0+
* MySQL 5.7

## 前端依赖

Taroco 前端基于开源项目 [D2Admin](https://github.com/d2-projects/d2-admin) 构建。

D2Admin 中文文档：[D2Admin Document](https://doc.d2admin.fairyever.com/zh/)。

<a href="https://github.com/d2-projects/d2-admin" target="_blank"><img src="https://raw.githubusercontent.com/FairyEver/d2-admin/master/doc/image/d2-admin@2x.png" width="200"></a>

## 启动配置管理和注册中心 Nacos

在此版本中，使用了 Nacos 作为配置中心和注册中心，所以我们首先要保证 Nacos 服务可用。

* 下载 1.1.0 编译版本 [Nacos Release](https://github.com/alibaba/nacos/releases)

* 修改 Nacos 配置 application.properties，通过 Mysql 存储配置

```
spring.datasource.platform=mysql

db.num=1
db.url.0=jdbc:mysql://127.0.0.1:3306/nacos?characterEncoding=utf8&connectTimeout=1000&socketTimeout=3000&autoReconnect=true
db.user=nacos
db.password=nacos
```

* 启动 Nacos 服务
  
```
nohup sh startup.sh -m standalone &
```

* 导入 Nacos 配置

配置文件位于 `taroco-docs/nacos.sql`

## 启动 Sentinel 控制台（可选）

Sentinel 是阿里巴巴开源的分布式系统的流量防卫组件，Sentinel 把流量作为切入点，从流量控制，熔断降级，系统负载保护等多个维度保护服务的稳定性。

* 下载 Sentinel Release 版本 1.6.3 [Sentinel Release](https://github.com/alibaba/Sentinel/releases)

* 启动 Sentinel 控制台

```
java -Dserver.port=9006 -jar sentinel-dashboard-1.6.3.jar >>/dev/null &
```

> 1.6.3启用了用户权限，默认用户密码是sentinel/sentinel

> 更多 Sentinel 和 Spring Cloud Alibaba 的使用示例请参考：[Sentinel Example](https://github.com/alibaba/spring-cloud-alibaba/blob/master/spring-cloud-alibaba-examples/sentinel-example/sentinel-core-example/readme-zh.md)

## 编译源码

* 克隆代码到本地

```
git clone -b nacos https://github.com/liuht777/Taroco.git
```

* 编译源码

```
mvn clean install -DskipTests
```

> 用开发工具打开 推荐: IDEA

## 导入数据库脚本

* 新建数据库 taroco

* 导入初始化脚本

数据库脚本在 taroco-docs/taroco.sql

## 启动服务

1. 启动RBAC服务 `TarocoRbacApplication`

2. 启动认证服务 `TarocoAuthenticationApplication`

3. 启动网关服务 `TarocoGatewayZuulApplication`

4. 启动服务管理服务(可选) `TarocoGovernanceApplication`

## 启动前端

* 点击文档右上角，克隆前端项目到本地，按照提示启动即可。