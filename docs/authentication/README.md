# Taroco Authentication 统一认证服务

[Taroco Authentication](https://github.com/liuht777/Taroco-Authentication) 基于 Spring Security Oauth2 的统一认证服务，采用 [Ant Design Pro of Vue](https://pro.loacg.com/docs/getting-started "Ant Design Pro of Vue") 作为前端界面，重写了 Spring Security 登录模式，支持异步登录，所有接口以及授权端点都支持异步的方式。

![登陆页面](/images/login.png "登陆页面")

![应用页面](/images/app.png "应用页面")

## 支持特性

- 支持异步 JSON 登录
- 支持手机号、验证码登录
- 支持 SSO
- 支持 JWT Token
- 支持 Redis Token
- 支持集群部署（已集成 Spring Session）
- 支持 OAuth2.0 定义的四种授权码模式以及刷新 token
- 支持通过手机号和验证码获取 token（类似 password模式）
- 集成了应用管理的功能，方便应用接入
- 完整的 Demo 示例，包括 SSO、Resource Server，以及在 Resource Server 中解析token，获取用户的权限以及认证中添加的额外信息

## Spring Security 用户权限管理方案

### Scope & Authority

Scope 是客户端（应用）的权限范围，一般是 Read、Write、All、Server 之类的常见字符，也可根据实际情况自定义。

Authority 是用户的权限范围。在 Spring Security OAuth2 当中，解析 token 会附带的将用户的权限一并解析。

### 用户权限方案

用户信息由 UserDetailsService 加载，用户权限信息也可以由自定义的 UserDetailsService 一起加载到 UserDetails。也可以在用户认证成功过后，在通过用户ID、用户名再次请求用户权限。

在 Spring Security 当中，由于只有一个 Authority 的概念存在，关于用户的角色以及用户的资源权限，我们只能放在 Authority 当中，好在 Spring Security 对角色和权限已经做了区分。

在 SecurityExpressionRoot 当中，对角色做了单独的处理，加了默认的前缀 “ROLE_”，因此我们在创建角色的 Authority 的时候，只需要加入这个前缀即可，“hasRole("ROLE_ADMIN")” 和 “hasRole("ADMIN")” 是一样的效果：

```java
@Data
@AllArgsConstructor
public class Role implements GrantedAuthority {

    private static final long serialVersionUID = -1956975342008354518L;

    private static final String PREFIX = "ROLE_";

    private String role;

    private List<Operation> operations;

    @Override
    public String getAuthority() {
        return PREFIX + role.toUpperCase();
    }
}
```

一个角色对应多个可执行的操作权限（资源），资源同样是作为 Authority 存在，我给资源加入一个自定义的前缀标识 “OP_”，以便在 Authority 当中进行区分：

```java
@Data
@AllArgsConstructor
public class Operation implements GrantedAuthority {

    private static final long serialVersionUID = 6260083887682221456L;

    private static final String PREFIX = "OP_";

    private String op;

    @Override
    public String getAuthority() {
        return PREFIX + op.toUpperCase();
    }
}
```

这样我们在自定义的 UserDetails 实现当中，加入角色并且重写 getAuthorities() 方法即可：

```java
@Data
public class User implements Serializable, UserDetails {

    private static final long serialVersionUID = 8741046663436494432L;

    /**
     * 角色列表
     */
    private List<Role> roles = new ArrayList<>();

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (CollUtil.isEmpty(roles)) {
            return Collections.emptyList();
        }
        final List<GrantedAuthority> authorities = new ArrayList<>(AuthorityUtils.createAuthorityList(
                roles.stream().map(Role::getAuthority).collect(Collectors.joining())));
        roles.forEach(role -> {
            if (CollUtil.isNotEmpty(role.getOperations())) {
                authorities.addAll(AuthorityUtils.createAuthorityList(
                        role.getOperations().stream().map(Operation::getAuthority).collect(Collectors.joining())));
            }
        });
        return authorities;
    }
}
```

## 认证服务集群部署

### Redis 管理授权码

授权码默认的实现是 InMemoryAuthorizationCodeServices，为了能够支撑认证服务的集群部署，扩展为 Redis 管理授权码

```java
/**
 * 自定义AuthorizationCodeServices实现类来将auth_code 存放在redis中
 *
 * @author liuht
 * 2019/7/17 10:14
 */
@Slf4j
public class RedisAuthenticationCodeServices extends RandomValueAuthorizationCodeServices {

    private static final String AUTH_CODE_KEY = "auth_code";

    private RedisTokenStoreSerializationStrategy serializationStrategy = new JdkSerializationStrategy();

    private static final String PREFIX = CacheConstants.PREFIX + AUTH_CODE_KEY;

    private RedisConnectionFactory connectionFactory;

    private RedisConnection getConnection() {
        return connectionFactory.getConnection();
    }

    public RedisAuthenticationCodeServices(RedisConnectionFactory connectionFactory) {
        Assert.notNull(connectionFactory, "RedisConnectionFactory required");
        this.connectionFactory = connectionFactory;
    }

    @Override
    protected void store(final String code, final OAuth2Authentication authentication) {
        RedisConnection conn = getConnection();
        try {
            conn.hSet(serializationStrategy.serialize(PREFIX),
                    serializationStrategy.serialize(code),
                    serializationStrategy.serialize(authentication));
        } catch (Exception e) {
            log.error("保存authentication code 失败", e);
        } finally {
            conn.close();
        }
    }

    @Override
    protected OAuth2Authentication remove(final String code) {
        RedisConnection conn = getConnection();
        try {
            OAuth2Authentication authentication;
            try {
                authentication = serializationStrategy.deserialize(conn.hGet(serializationStrategy.serialize(PREFIX),
                        serializationStrategy.serialize(code)), OAuth2Authentication.class);
            } catch (Exception e) {
                return null;
            }
            if (null != authentication) {
                conn.hDel(serializationStrategy.serialize(PREFIX), serializationStrategy.serialize(code));
            }
            return authentication;
        } catch (Exception e) {
            return null;
        } finally {
            conn.close();
        }
    }
}
```

配置替换默认的实现

```
@Override
public void configure(AuthorizationServerEndpointsConfigurer endpoints) {
    endpoints.authorizationCodeServices(redisAuthenticationCodeServices());
}

@Bean
public RedisAuthenticationCodeServices redisAuthenticationCodeServices() {
    return new RedisAuthenticationCodeServices(redisConnectionFactory);
}
```

### 集成 Spring Session Redis

1. 添加 maven 依赖

```
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.session</groupId>
    <artifactId>spring-session-data-redis</artifactId>
</dependency>
```

2. 配置 Spring Session

```
# 配置文件设置 Session 存储类型 && 配置 Redis
spring:
  redis:
    host: 127.0.0.1
    port: 6379
    password: hyman
    database: 0
  session:
    store-type: redis

# 启动类添加注解，启用 Spring Session
@EnableRedisHttpSession(redisNamespace = CacheConstants.REDIS_SESSION_PREFIX)
```

> 简单的两步之后，集成就算完成了。@EnableRedisHttpSession 主要就是添加了一个名为 springSessionRepositoryFilter 的过滤器，实现类为 SessionRepositoryFilter。
> 这个 filter 具有高优先级，会在 Spring Security 之前将 HttpSession 的实现改为由 Spring Session 进行管理。

## 用户扩展

用户以及用户权限方面留给使用者自己去扩展，这里只是使用了一个 `MockUserService` 模拟了获取用户的过程，以及其他相关的角色、组织、接口权限都属于扩展的部分，统一认证只做认证做的事情。

```java
/**
 * 模拟 UserService 实现查询用户
 * 在实际使用上需要替换
 *
 * @author liuht
 * 2019/7/3 9:52
 */
@Service
public class MockUserService {

    @Autowired
    private PasswordEncoder encoder;

    /**
     * 根据用户名称返回用户
     *
     * @param username 用户名称,必须唯一
     * @return
     */
    public User findUserByUsername(String username) {
        final User user = new User();
        user.setUsername(username);
        // 密码和用户名保持一致
        user.setPassword(encoder.encode(username));
        user.setEnabled(true);
        user.setUserId(RandomUtil.randomInt());
        user.setEnabled(true);
        user.setExpired(false);
        user.setLocked(false);
        user.setPasswordExpired(false);
        user.setRoles(Collections.singletonList(defaultRole()));
        return user;
    }

    /**
     * 根据手机号返回用户
     *
     * @param mobile 手机号,必须唯一
     * @return
     */
    public User findUserByMobile(String mobile) {
        final User user = new User();
        user.setUsername(mobile);
        // 密码和用户名保持一致
        user.setPassword(encoder.encode(mobile));
        user.setEnabled(true);
        user.setUserId(RandomUtil.randomInt());
        user.setEnabled(true);
        user.setExpired(false);
        user.setLocked(false);
        user.setPasswordExpired(false);
        user.setRoles(Collections.singletonList(defaultRole()));
        return user;
    }

    private Role defaultRole() {
        return new Role(CommonConstants.ROLE_DEFAULT,
                Collections.singletonList(new Operation(CommonConstants.OP_DEFAULT)));
    }
}
```