# Spring Security

## Spring Security 过滤器解析

Spring Security 默认是通过 WebSecurityConfigurerAdapter.getHttp() 方法配置进来的。通过继承 WebSecurityConfigurerAdapter 类并且重写 configure(HttpSecurity http) 方法，可以定义自己的 Spring Security 配置。

|名称   |简介   |
| :------------ | :------------ |
|WebAsyncManagerIntegrationFilter   |将SecurityContext与Spring Web中用于处理异步请求映射的 WebAsyncManager 进行集成。   |
|SecurityContextPersistenceFilter   |将SecurityContext绑定到SecurityContextHolder，以及最后的清空SecurityContextHolder   |
|HeaderWriterFilter   |将指定的头部信息写入响应对象   |
|CsrfFilter   |防止跨站请求伪造，对请求进行csrf保护   |
|LogoutFilter   |检测用户退出登录请求并做相应退出登录处理   |
|UsernamePasswordAuthenticationFilter   |检测用户名/密码表单登录认证请求并作相应认证处理: 1.session管理，比如为新登录用户创建新session(session fixation防护)和设置新的csrf token等 2.经过完全认证的Authentication对象设置到SecurityContextHolder中的SecurityContext上; 3.发布登录认证成功事件InteractiveAuthenticationSuccessEvent 4.登录认证成功时的Remember Me处理 5.登录认证成功时的页面跳转 |
|BasicAuthenticationFilter   |检测和处理http basic认证，认证信息以 Authorization : Basic [Token] 方式填充进 HTTPHeader。Token组成方式为username:password 并进行base64转码。   |
|RequestCacheAwareFilter   |提取请求缓存中缓存的请求 1.请求缓存在安全机制启动时指定 2.请求写入缓存在其他地方完成 3.典型应用场景: (1).用户请求保护的页面， (2).系统引导用户完成登录认证, (3).然后自动跳转到到用户最初请求页面   |
|SecurityContextHolderAwareRequestFilter   |包装请求对象使之可以访问SecurityContextHolder,从而使请求真正意义上拥有接口HttpServletRequest中定义的getUserPrincipal这种访问安全信息的能力   |
|RememberMeAuthenticationFilter   |针对Remember Me登录认证机制的处理逻辑   |
|AnonymousAuthenticationFilter   |如果当前SecurityContext属性Authentication为null，将其替换为一个AnonymousAuthenticationToken   |
|SessionManagementFilter   |检测从请求处理开始到目前是否有用户登录认证，如果有做相应的session管理，比如针对为新登录用户创建新的session(session fixation防护)和设置新的csrf token等。   |
|ExceptionTranslationFilter   |处理AccessDeniedException和 AuthenticationException异常，将它们转换成相应的HTTP响应   |
|FilterSecurityInterceptor   |一个请求的安全处理过滤器链的最后一个，检查用户是否已经认证,如果未认证执行必要的认证，对目标资源的权限检查，如果认证或者权限不足，抛出相应的异常:AccessDeniedException或者AuthenticationException   |

注意:
* 上面的 Filter 并不总是同时被起用，根据配置的不同，会启用不同的Filter。
* 对于被起用的Filter，在对一个请求进行处理时，位于以上表格上部的过滤器先被调用。
* 上面的Filter被启用时并不是直接添加到Servlet容器的Filter chain中,而是先被组织成一个FilterChainProxy, 然后这个Filter会被添加到Servlet容器的Filter chain中。
* 上面的Spring Security Filter被组合到一个FilterChainProxy的过程可以参考配置类WebSecurityConfiguration的方法Filter springSecurityFilterChain(),这是一个bean定义方法，使用的bean名称为AbstractSecurityWebApplicationInitializer.DEFAULT_FILTER_NAME:springSecurityFilterChain。
> FilterChainProxy也是一个Filter,它应用了代理模式和组合模式，它将上面的各个Filter组织到一起在自己内部形成一个filter chain,当自己被调用到时，它其实把任务代理给自己内部的filter chain完成。

> Spring Security 有两个重要的入口Filter, 一个是 AbstractAuthenticationProcessingFilter（主要负责处理登录认证）；一个是 FilterSecurityInterceptor（主要处理鉴权）。
> UsernamePasswordAuthenticationFilter 就是 AbstractAuthenticationProcessingFilter 其中的一个实现类。后面对登录认证的扩展，主要就是对 AbstractAuthenticationProcessingFilter 的扩展。

## Spring Security 认证流程

Spring 针对 servlet 默认有一个过滤器链（Filter chain），Spring Security 本质上也是一个连续的 Filter 链，然后又以 FilterChainProxy 的形式被添加到 Servlet 容器的 Filter chain 当中。默认是使用 DefaultSecurityFilterChain，名称为：AbstractSecurityWebApplicationInitializer.DEFAULT_FILTER_NAME:springSecurityFilterChain。下图展示了 springSecurityFilterChain 是如何嵌入Servlet 容器的 Filter chain 当中:

![SpringSecurityFilters](/images/SpringSecurityFilters.png "SpringSecurityFilters")

我们以 Spring Security 用户名/密码登录为例展示认证的整体流程如下:

![SpringSecurityAuthenticationProcess.png](/images/SpringSecurityAuthenticationProcess.png "SpringSecurityAuthenticationProcess.png")

> 上图流程只是针对认证成功的主流程，实际上这任何一个环节都有可能失败，这时候会进入到 ExceptionTranslationFilter 过滤器进行处理。

## Spring Security 自定义开发

### 实现异步 JSON 登录

通过熟悉 Spring Security 的认证流程我们知道，读取登录请求参数的地方是在 UsernamePasswordAuthenticationFilter，要想实现异步登录，首先想到的就是重写它。
但是为了能够使表单登录和异步登录同时有效，我们需要继承 UsernamePasswordAuthenticationFilter，加入自己的逻辑。

1. 继承 UsernamePasswordAuthenticationFilter

```java
/**
 * 重写 UsernamePasswordAuthenticationFilter 类, 支持实现异步JSON登录
 *
 * @author liuht
 * 2019/7/3 14:09
 */
@Slf4j
public class CustomUsernamePasswordAuthenticationFilter extends UsernamePasswordAuthenticationFilter {

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request, HttpServletResponse response) throws AuthenticationException {

        // 如果是JSON登录
        UsernamePasswordAuthenticationToken authRequest;
        if (request.getContentType().equals(MediaType.APPLICATION_JSON_UTF8_VALUE)
                || request.getContentType().equals(MediaType.APPLICATION_JSON_VALUE)) {
            ObjectMapper mapper = new ObjectMapper();

            try (InputStream is = request.getInputStream()) {
                AuthenticationBean authenticationBean = mapper.readValue(is, AuthenticationBean.class);
                authRequest = new UsernamePasswordAuthenticationToken(
                        authenticationBean.getUsername(), authenticationBean.getPassword());
                setDetails(request, authRequest);
                return this.getAuthenticationManager().authenticate(authRequest);
            } catch (IOException e) {
                log.error("异步登陆失败", e);
            }
        } else {
            // 支持原来默认的登录方式
            return super.attemptAuthentication(request, response);
        }
        authRequest = new UsernamePasswordAuthenticationToken("", "");
        return this.getAuthenticationManager().authenticate(authRequest);
    }
}

/**
 * 用户认证的Bean
 *
 * @author liuht
 * 2019/7/3 14:11
 */
@Data
public class AuthenticationBean {

    private String username;

    private String password;
}
```

2. 将自定义的 Filter 添加到 Spring Security 过滤器链当中

```java
@EnableWebSecurity
public class WebSecurityConfigration extends WebSecurityConfigurerAdapter {
    
    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.addFilterAt(customAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
    }
    
    /**
     * 注册自定义的UsernamePasswordAuthenticationFilter
     *
     * @throws Exception
     */
    @Bean
    public CustomUsernamePasswordAuthenticationFilter customAuthenticationFilter() throws Exception {
        CustomUsernamePasswordAuthenticationFilter filter = new CustomUsernamePasswordAuthenticationFilter();
        filter.setAuthenticationSuccessHandler(successHandler);
        filter.setAuthenticationFailureHandler(failureHandler);
        //这句很关键，重用WebSecurityConfigurerAdapter配置的AuthenticationManager，不然要自己组装AuthenticationManager
        filter.setAuthenticationManager(authenticationManagerBean());
        return filter;
    }
}
```

### 自定义手机号/验证码登录

同样的在用户名/密码登录流程中，我们可以发现最重要的几个地方也是我们自己实现别的登录方式需要重写的地方主要有三点：

1. UsernamePasswordAuthenticationFilter 认证的发起，读取认证参数，生成未认证的 AuthenticationToken，调用 AuthenticationManager 的认证方法。
2. AuthenticationProvider 认证器。AuthenticationManager 最终会调用 AuthenticationToken 对应的认证器进行用户认证。
3. AuthenticationToken 用户认证信息，保存认证过后的用户信息以及权限信息。UsernamePasswordAuthenticationToken 就是用户名/密码登录的一个实现。

我们分三步来实现自定义的手机号/验证码登录：

1. 第一步，自定义 SmsCodeAuthenticationToken

在这之前我先实现了一个 MyAuthenticationToken 类, 方便实现其他的登录方式, SmsCodeAuthenticationToken 只需要继承它即可：

```java
/**
 * 自定义AbstractAuthenticationToken
 *
 * @author liuht
 * 2019/5/13 15:25
 */
public class MyAuthenticationToken extends AbstractAuthenticationToken {

    private static final long serialVersionUID = 7129356369074220969L;
    protected final Object principal;
    protected Object credentials;

    public MyAuthenticationToken(Object principal, Object credentials) {
        super(null);
        this.principal = principal;
        this.credentials = credentials;
        this.setAuthenticated(false);
    }

    public MyAuthenticationToken(Object principal, Object credentials, Collection<? extends GrantedAuthority> authorities) {
        super(authorities);
        this.principal = principal;
        this.credentials = credentials;
        super.setAuthenticated(true);
    }


    @Override
    public Object getCredentials() {
        return this.credentials;
    }

    @Override
    public Object getPrincipal() {
        return this.principal;
    }

    @Override
    public void setAuthenticated(boolean isAuthenticated) throws IllegalArgumentException {
        if (isAuthenticated) {
            throw new IllegalArgumentException("Cannot set this token to trusted - use constructor which takes a GrantedAuthority list instead");
        } else {
            super.setAuthenticated(false);
        }
    }

    @Override
    public void eraseCredentials() {
        super.eraseCredentials();
        this.credentials = null;
    }
}

/**
 * 定义验证码登录系统
 *
 * @author liuht
 * 2019/7/12 14:04
 */
public class SmsCodeAuthenticationToken extends MyAuthenticationToken {

    private static final long serialVersionUID = 6056078576992222156L;

    public SmsCodeAuthenticationToken(final Object principal, final Object credentials) {
        super(principal, credentials);
    }

    public SmsCodeAuthenticationToken(final Object principal, final Object credentials, final Collection<? extends GrantedAuthority> authorities) {
        super(principal, credentials, authorities);
    }
}
```

2. 第二步，自定义 SmsCodeAuthenticationProvider

同样的，我先抽象了一个 AbstractUserDetailsAuthenticationProvider 类，将 createSuccessAuthentication、additionalAuthenticationChecks、retrieveUser 三个方法交由 SmsCodeAuthenticationProvider 去实现。
这样同样方便实现其他的登录方式。

```java
/**
 * 自定义 AuthenticationProvider， 以使用自定义的 MyAuthenticationToken
 *
 * @author liuht
 * 2019/5/13 15:25
 */
@Slf4j
public abstract class AbstractUserDetailsAuthenticationProvider implements AuthenticationProvider, InitializingBean, MessageSourceAware {

    protected MessageSourceAccessor messages = SpringSecurityMessageSource.getAccessor();
    private UserCache userCache = new NullUserCache();
    private boolean forcePrincipalAsString = false;
    protected boolean hideUserNotFoundExceptions = true;
    private UserDetailsChecker preAuthenticationChecks = new AbstractUserDetailsAuthenticationProvider.DefaultPreAuthenticationChecks();
    private UserDetailsChecker postAuthenticationChecks = new AbstractUserDetailsAuthenticationProvider.DefaultPostAuthenticationChecks();

    @Override
    public final void afterPropertiesSet() throws Exception {
        Assert.notNull(this.userCache, "A user cache must be set");
        Assert.notNull(this.messages, "A message source must be set");
    }

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String username = authentication.getPrincipal() == null ? "NONE_PROVIDED" : authentication.getName();
        boolean cacheWasUsed = true;
        UserDetails user = this.userCache.getUserFromCache(username);
        if (user == null) {
            cacheWasUsed = false;

            try {
                user = this.retrieveUser(username, authentication);
            } catch (UsernameNotFoundException var6) {
                log.error("User \'" + username + "\' not found");
                if (this.hideUserNotFoundExceptions) {
                    throw new BadCredentialsException(this.messages.getMessage("AbstractUserDetailsAuthenticationProvider.badCredentials", "Bad credentials"));
                }

                throw var6;
            }

            Assert.notNull(user, "retrieveUser returned null - a violation of the interface contract");
        }

        try {
            this.preAuthenticationChecks.check(user);
            this.additionalAuthenticationChecks(user, authentication);
        } catch (AuthenticationException var7) {
            if (!cacheWasUsed) {
                throw var7;
            }

            cacheWasUsed = false;
            user = this.retrieveUser(username, authentication);
            this.preAuthenticationChecks.check(user);
            this.additionalAuthenticationChecks(user, authentication);
        }

        this.postAuthenticationChecks.check(user);
        if (!cacheWasUsed) {
            this.userCache.putUserInCache(user);
        }

        Object principalToReturn = user;
        if (this.forcePrincipalAsString) {
            principalToReturn = user.getUsername();
        }

        return this.createSuccessAuthentication(principalToReturn, authentication, user);
    }

    /**
     * 创建自定义的 Authentication 实现
     *
     * @param principal
     * @param authentication
     * @param user
     * @return
     */
    protected abstract Authentication createSuccessAuthentication(Object principal, Authentication authentication, UserDetails user);

    /**
     * 校验 authentication 有效性
     *
     * @param userDetails
     * @param authentication
     */
    protected abstract void additionalAuthenticationChecks(UserDetails userDetails, Authentication authentication) throws AuthenticationException;

    /**
     * 获取 UserDetails 详情
     *
     * @param principal
     * @param authentication
     * @return
     */
    protected abstract UserDetails retrieveUser(String principal, Authentication authentication) throws AuthenticationException;

    public UserCache getUserCache() {
        return this.userCache;
    }

    public boolean isForcePrincipalAsString() {
        return this.forcePrincipalAsString;
    }

    public boolean isHideUserNotFoundExceptions() {
        return this.hideUserNotFoundExceptions;
    }

    public void setForcePrincipalAsString(boolean forcePrincipalAsString) {
        this.forcePrincipalAsString = forcePrincipalAsString;
    }

    public void setHideUserNotFoundExceptions(boolean hideUserNotFoundExceptions) {
        this.hideUserNotFoundExceptions = hideUserNotFoundExceptions;
    }

    @Override
    public void setMessageSource(MessageSource messageSource) {
        this.messages = new MessageSourceAccessor(messageSource);
    }

    public void setUserCache(UserCache userCache) {
        this.userCache = userCache;
    }

    protected UserDetailsChecker getPreAuthenticationChecks() {
        return this.preAuthenticationChecks;
    }

    public void setPreAuthenticationChecks(UserDetailsChecker preAuthenticationChecks) {
        this.preAuthenticationChecks = preAuthenticationChecks;
    }

    protected UserDetailsChecker getPostAuthenticationChecks() {
        return this.postAuthenticationChecks;
    }

    public void setPostAuthenticationChecks(UserDetailsChecker postAuthenticationChecks) {
        this.postAuthenticationChecks = postAuthenticationChecks;
    }

    private class DefaultPostAuthenticationChecks implements UserDetailsChecker {
        private DefaultPostAuthenticationChecks() {
        }

        @Override
        public void check(UserDetails user) {
            if (!user.isCredentialsNonExpired()) {
                log.debug("User account credentials have expired");
                throw new CredentialsExpiredException(AbstractUserDetailsAuthenticationProvider.this.messages.getMessage("AbstractUserDetailsAuthenticationProvider.credentialsExpired", "User credentials have expired"));
            }
        }
    }

    private class DefaultPreAuthenticationChecks implements UserDetailsChecker {
        private DefaultPreAuthenticationChecks() {
        }

        @Override
        public void check(UserDetails user) {
            if (!user.isAccountNonLocked()) {
                log.debug("User account is locked");
                throw new LockedException(AbstractUserDetailsAuthenticationProvider.this.messages.getMessage("AbstractUserDetailsAuthenticationProvider.locked", "User account is locked"));
            } else if (!user.isEnabled()) {
                log.debug("User account is disabled");
                throw new DisabledException(AbstractUserDetailsAuthenticationProvider.this.messages.getMessage("AbstractUserDetailsAuthenticationProvider.disabled", "User is disabled"));
            } else if (!user.isAccountNonExpired()) {
                log.debug("User account is expired");
                throw new AccountExpiredException(AbstractUserDetailsAuthenticationProvider.this.messages.getMessage("AbstractUserDetailsAuthenticationProvider.expired", "User account has expired"));
            }
        }
    }
}

/**
 * 手机验证码登录系统 Provider
 *
 * @author liuht
 * 2019/7/12 14:35
 */
@Slf4j
public class SmsCodeAuthenticationProvider extends AbstractUserDetailsAuthenticationProvider {

    private UserDetailsService userDetailsService;

    private TarocoRedisRepository redisRepository;

    @Override
    protected Authentication createSuccessAuthentication(final Object principal, final Authentication authentication, final UserDetails user) {
        final SmsCodeAuthenticationToken token = new SmsCodeAuthenticationToken(principal, authentication.getCredentials(), user.getAuthorities());
        token.setDetails(authentication.getDetails());
        return token;
    }

    @Override
    protected void additionalAuthenticationChecks(final UserDetails userDetails, final Authentication authentication) throws AuthenticationException {
        if (authentication.getCredentials() == null) {
            log.error("Authentication failed: no credentials provided");
            throw new BadCredentialsException(this.messages.getMessage("MobileAuthenticationProvider.badCredentials", "Bad credentials"));
        } else {
            final String presentedPassword = authentication.getCredentials().toString();
            final Object principal = authentication.getPrincipal();
            final String key = CacheConstants.DEFAULT_CODE_KEY + principal;
            final String code = redisRepository.get(key);
            // 校验验证码
            if (StrUtil.isEmpty(code) || !code.equals(presentedPassword)) {
                log.error("Authentication failed: verifyCode does not match stored value");
                throw new BadCredentialsException(this.messages.getMessage("MobileAuthenticationProvider.badCredentials", "Bad verifyCode"));
            }
            // 校验成功删除验证码(验证码只能使用一次)
            redisRepository.del(key);
        }
    }

    @Override
    protected UserDetails retrieveUser(final String mobile, final Authentication authentication) throws AuthenticationException {
        UserDetails loadedUser;
        try {
            loadedUser = userDetailsService.loadUserByUsername(mobile);
        } catch (UsernameNotFoundException var6) {
            throw var6;
        } catch (Exception var7) {
            throw new InternalAuthenticationServiceException(var7.getMessage(), var7);
        }
        if (loadedUser == null) {
            throw new InternalAuthenticationServiceException("UserDetailsService returned null, which is an interface contract violation");
        } else {
            return loadedUser;
        }
    }

    @Override
    public boolean supports(final Class<?> authentication) {
        return SmsCodeAuthenticationToken.class.isAssignableFrom(authentication);
    }

    public UserDetailsService getUserDetailsService() {
        return userDetailsService;
    }

    public void setUserDetailsService(final UserDetailsService userDetailsService) {
        this.userDetailsService = userDetailsService;
    }

    public TarocoRedisRepository getRedisRepository() {
        return redisRepository;
    }

    public void setRedisRepository(final TarocoRedisRepository redisRepository) {
        this.redisRepository = redisRepository;
    }
}
```

> 在 SmsCodeAuthenticationProvider 类中有个 supports 方法，该方法决定了 AuthenticationManager 该调用哪个 AuthenticationProvider 的认证方法。
通过判断 authentication 是否是我们自定义的 SmsCodeAuthenticationToken 实现类。

3. 第三步，自定义 SmsCodeAuthenticationFilter

```java
/**
 * 自定义手机号验证码登录系统
 *
 * @author liuht
 * 2019/7/12 14:13
 */
public class SmsCodeAuthenticationFilter extends AbstractAuthenticationProcessingFilter {

    private static final String SPRING_SECURITY_RESTFUL_PHONE_KEY = "mobile";
    private static final String SPRING_SECURITY_RESTFUL_VERIFY_CODE_KEY = "code";

    private boolean postOnly = true;

    public SmsCodeAuthenticationFilter() {
        super(new AntPathRequestMatcher(SecurityConstants.MOBILE_LOGIN_URL, HttpMethod.POST.name()));
    }

    @Override
    public Authentication attemptAuthentication(final HttpServletRequest request, final HttpServletResponse response) throws AuthenticationException, IOException, ServletException {
        if (postOnly && !request.getMethod().equals(HttpMethod.POST.name())) {
            throw new AuthenticationServiceException(
                    "Authentication method not supported: " + request.getMethod());
        }
        String principal;
        String credentials;
        // 1. 从请求中获取参数 mobile + smsCode
        principal = obtainParameter(request, SPRING_SECURITY_RESTFUL_PHONE_KEY);
        credentials = obtainParameter(request, SPRING_SECURITY_RESTFUL_VERIFY_CODE_KEY);
        principal = principal.trim();
        SmsCodeAuthenticationToken authRequest = new SmsCodeAuthenticationToken(principal, credentials);
        this.setDetails(request, authRequest);
        // 3. 返回 authenticated 方法的返回值
        return this.getAuthenticationManager().authenticate(authRequest);
    }

    private String obtainParameter(HttpServletRequest request, String parameter) {
        String result =  request.getParameter(parameter);
        return result == null ? "" : result;
    }

    protected void setDetails(HttpServletRequest request, SmsCodeAuthenticationToken authRequest) {
        authRequest.setDetails(this.authenticationDetailsSource.buildDetails(request));
    }

    public void setPostOnly(boolean postOnly) {
        this.postOnly = postOnly;
    }

    public boolean isPostOnly() {
        return postOnly;
    }
}
```

> 在这里通过获取参数生成我们自定义的 SmsCodeAuthenticationToken，交给 AuthenticationManager 进行认证。
> 同时我们自定义的这个 url 需要添加到 Spring Security 放行的队列当中。

最后，我们定义一个自定义一个 SecurityConfigurerAdapter，并且 apply 到主配置类当中：

```java
/**
 * 手机号/验证码登录 安全配置
 *
 * @author liuht
 * 2019/7/22 16:14
 */
@Component
public class SmsCodeAuthenticationSecurityConfigration extends SecurityConfigurerAdapter<DefaultSecurityFilterChain, HttpSecurity> {

    @Autowired
    private TarocoRedisRepository redisRepository;

    @Autowired
    private MobileUserDetailsService mobileUserDetailsService;

    @Autowired
    private UsernamePasswordAuthenticationSuccessHandler successHandler;

    @Autowired
    private UsernamePasswordAuthenticationFailureHandler failureHandler;

    @Override
    public void configure(final HttpSecurity http) throws Exception {
        final SmsCodeAuthenticationFilter filter = new SmsCodeAuthenticationFilter();
        filter.setAuthenticationManager(http.getSharedObject(AuthenticationManager.class));
        filter.setAuthenticationSuccessHandler(successHandler);
        filter.setAuthenticationFailureHandler(failureHandler);

        final SmsCodeAuthenticationProvider provider = new SmsCodeAuthenticationProvider();
        provider.setRedisRepository(redisRepository);
        provider.setUserDetailsService(mobileUserDetailsService);
        provider.setHideUserNotFoundExceptions(false);

        http
                .authenticationProvider(provider)
                .addFilterAfter(filter, UsernamePasswordAuthenticationFilter.class);
    }
}

```