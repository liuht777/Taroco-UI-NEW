# 介绍

## 整体架构

![](/images/taroco.jpg)

## 目录结构

```
├── taroco-authentication --统一认证服务
├── taroco-common-starter --自定义spring boot starter
│   ├── taroco-common-spring-boot-starter --公共依赖模块(全局异常、常量、通用类)
│   ├── taroco-log-spring-boot-starter --通用logback-spring、自定义banner
│   ├── taroco-redis-spring-boot-starter --通用redis配置
│   ├── taroco-ribbon-spring-boot-starter --基于ribbon的服务治理扩展
│   ├── taroco-swagger2-spring-boot-starter --自定义封装swagger2配置
├── taroco-docs --文档、截图、docker文件、初始化脚本
├── taroco-gateway-zuul --微服务网关
├── taroco-oauth2-demo --oauth2 demo项目(客户端、资源服务器、SSO)
├── taroco-rbac --基于角色的权限控制服务
├── taroco-service-governance --服务治理（Spring Boot Admin）
```

## 完成功能

* 基于Nacos的服务注册中心以及配置中心。
* Spring Cloud Zuul 统一微服务网关配置，支持动态路由配置。
* 基于 Spring-Boot-Admin 的自实现的服务治理。包括日志、变量、映射等情况。
* 基于 Spring Security OAuth2 的权限认证系统（支持手机号登录）。采用JWT RSA非对称加密的形式进行 token 加密解密。
* 整合 Sentinel，对服务及API进行流量控制、熔断降级、系统负载等功能保护，为微服务保驾护航。
* 完善的RBAC权限控制，用户信息通过网关解析到请求头，随后通过自定义注解 `@RequireRole` `@RequirePermission`，可以灵活有效的进行 API 级别的权限控制。

## 分支版本

* Branch 1.5.12：基于 Spring Boot 1.5.12.RELEASE + Spring Cloud Edgware.SR4，是Taroco最初的版本;
* Branch 2.x：基于 Spring Boot 2.0.5.RELEASE + Spring Cloud Finchley.SR1;
* Branch nacos: 基于Nacos以及Spring Cloud Alibaba, 是当前维护的版本;
* Master 分支已经改为从nacos merge代码，今后更新的中心也会放在nacos分支上。
