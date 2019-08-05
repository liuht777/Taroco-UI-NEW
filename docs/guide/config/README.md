# 配置解读

::: tip
Taroco 配置通过 Nacos 进行管理，保存在 Mysql 数据库当中。

Taroco 内置了开发环境和测试环境两套配置，我们以测试环境配置为例进行详细解读。
:::

更多关于 Spring Cloud 配置中心的内容，请阅读 Spring Cloud 配置中心 [官方文档](https://cloud.spring.io/spring-cloud-config/single/spring-cloud-config.html)

## application-show.yml

所有服务的全局配置

```yaml
# 公共配置地址
base:
  auth:
    server: http://172.31.213.39:9001
  mysql:
    url: jdbc:mysql://172.31.213.39:3306
  redis:
    host: 172.31.213.39
    port: 6379
    password: taroco!@#$

logging:
  level:
    com.alibaba.nacos: warn

management:
  endpoints:
    web:
      exposure:
        include: "*"
  security:
    enabled: false
  endpoint:
    health:
      show-details: ALWAYS

server:
  tomcat:
    max-threads: 200 # Maximum amount of worker threads.
    min-spare-threads: 10 # Minimum amount of worker threads

spring:
  cloud:
    sentinel:
      transport:
        port: 8719
        dashboard: 172.31.213.39:9006

feign:
  sentinel:
    enabled: true
  client:
    config:
      feignName:
        connectTimeout: 5000
        readTimeout: 5000
  compression:
    request:
      enabled: true
    response:
      enabled: true
```

## taroco-authentication-server-show.yml

认证服务配置

```yaml
# 数据源配置
spring:
  datasource:
    url: ${base.mysql.url}/taroco-authentication?useUnicode=true&characterEncoding=UTF-8&autoReconnect=true&useSSL=false&zeroDateTimeBehavior=convertToNull&allowPublicKeyRetrieval=true
    username: taroco-authentication
    password: Taroco!@#$12
    driver-class-name: com.mysql.jdbc.Driver
    hikari:
      minimum-idle: 50
      maximum-pool-size: 50
      pool-name: Taroco-OAuth2-HikariCP
  #redis配置
  redis:
    host: ${base.redis.host}
    port: ${base.redis.port}
    password: ${base.redis.password}
    database: 0
  session:
    store-type: redis

taroco:
  oauth2:
    key-store:
      location: classpath:taroco.jks
      secret: taroco!@#$
      alias: taroco
    url-permit-all:
      - /smsCode/*
      - /actuator/**
      - /login/mobile
      - /oauth/mobile
      - /oauth/exit
      - /webjars/**
      - /static/**
      - /**/*.css
      - /**/*.jpg
      - /**/*.jpeg
      - /**/*.png
      - /**/*.svg
      - /**/*.woff2
      - /**/*.js
      - /**/*.ico
```

## taroco-gateway-zuul-show.yml

网关服务配置

```yaml
# 服务网关配置
spring:
  #redis配置
  redis:
    host: ${base.redis.host}
    port: ${base.redis.port}
    password: ${base.redis.password}
    database: 0

# 路由配置
zuul:
  retryable: true
  #　忽略所有默认路由
  ignored-services: '*'
  # 需要聚合的swagger服务
  swagger:
    serviceIds: taroco-rbac-service

security:
  validate:
    # 是否需要验证验证码
    code: true
    # 演示环境配置 true将拦截所有非 Get 请求
    preview: true
  sessions: stateless
  oauth2:
    client:
      # 客户端ID
      client-id: 5d22eb6e8b0c7ba066014398
      # 客户端密钥
      client-secret: 123456
    resource:
      jwt:
         key-value:
          -----BEGIN PUBLIC KEY-----
          MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjONPnWWwvuWMnrawQkzi
          wuoEJN7aVEiOEklBOtSdUos+GlcXGIEgAmI2dOfAHaTVN+PG8yqjiIQkMWAC1yAh
          k1IO1HW4SgqdVPj3kgF+fcdGEWsf7fsw/DOrnp5M1vPhciVvIg0Osg4UqCULLIeS
          mUwobF8qnhnDav5S4FL4WRle+EJQEoe1eOnlVG/deSzgpmJz21w5c/4PD7DTQj5n
          H7LMDLp4ec/eM44XmxpaeMBRWGFjcFdoyMsFzkE2RMKpSiLYTZd9FEXfEQ0Y+5rW
          /yOiatRLwXg4Ah8YF04d8EDz+ugr7z0JpB+WkJcvDSqIxf6XN4cNkXZbPeRrWBGt
          fQIDAQAB
          -----END PUBLIC KEY-----

# oauth2 配置
taroco:
  oauth2:
    url-permit-all:
      - /actuator/**
      - /auth/**
      - /admin/code/*
      - /admin/smsCode/*
      - /admin/user/info
      - /admin/menu/userMenu
      - /swagger-resources/**
      - /swagger-ui.html
      - /*/v2/api-docs
      - /swagger/api-docs
      - /webjars/**
```

## taroco-rbac-service-show.yml

权限服务配置

```yaml
# 数据源配置
spring:
  datasource:
    url: ${base.mysql.url}/taroco?useUnicode=true&characterEncoding=UTF-8&autoReconnect=true&useSSL=false&zeroDateTimeBehavior=convertToNull
    username: root
    password: taroco@1234
    driver-class-name: com.mysql.jdbc.Driver
    hikari:
      minimum-idle: 5
      maximum-pool-size: 20
      pool-name: Taroco-OAuth2-HikariCP
  #redis配置
  redis:
    host: ${base.redis.host}
    port: ${base.redis.port}
    password: ${base.redis.password}
    database: 0

mybatis-plus:
  mapper-locations: classpath:/mapper/*Mapper.xml
  type-aliases-package: cn.taroco.rbac.admin.model.entity
  configuration:
    map-underscore-to-camel-case: true
    cache-enabled: true
  global-config:
    db-config:
      id-type: auto
logging:
  level:
    com.alibaba.nacos: warn
    cn.taroco.rbac.admin.mapper: debug

taroco:
  # swagger2配置
  swagger:
    enabled: true
    title: Taroco权限管理(RBAC)
    description: Taroco权限管理(RBAC) RestFull Api
    version: 1.0.1-SNAPSHOT
    license: Apache License, Version 2.0
    license-url: https://www.apache.org/licenses/LICENSE-2.0.html
    terms-of-service-url: https://github.com/liuht777/Taroco
    contact:
      name: liuht
      url: https://github.com/liuht777
      email: liuht777@qq.com
    base-package: cn.taroco.rbac.admin.controller
    base-path: /**
    exclude-path: /error

```