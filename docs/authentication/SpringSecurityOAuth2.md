# SpringSecurityOAuth2

## Spring Security OAuth2 授权码模式流程

授权码模式是 OAuth2 中最安全的模式，也是最复杂的，我只列举这一个，其他的也是触类旁通，一点即透。

![SpringSecurityOAuth2授权码流程图](/images/SpringSecurityOAuth2授权码流程图.png "SpringSecurityOAuth2授权码流程图")

## Spring Security OAuth2 SSO 流程

Spring Security 通过 OAuth2 实现的 SSO，虽然流程较为复杂，但是好在复杂的东西已经封装的非常完美，使用起来只需要一个注解即可搞定。
我们需要对流程有充分的理解，这样在进行扩展和调试的时候才知道从什么地方入手。

![SpringSecurityOAuth2单点登录流程图](/images/SpringSecurityOAuth2单点登录流程图.png "SpringSecurityOAuth2单点登录流程图")

## Spring Security OAuth2 自定义开发

### 自定义通过手机号/验证码获取token

和自定义通过手机号/验证码登录十分相似，唯一的不同是在登录认证成功以后，需要返回 token，而不是跳转页面。

1. 第一步，自定义 MobileTokenAuthenticationToken

```java
/**
 * 定义手机号获取token 类似与 UsernamePasswordAuthenticationToken
 *
 * @author liuht
 * 2019/5/13 15:20
 */
public class MobileTokenAuthenticationToken extends MyAuthenticationToken {

    private static final long serialVersionUID = -9192173797915966518L;

    public MobileTokenAuthenticationToken(Object principal, Object credentials) {
        super(principal, credentials);
    }

    public MobileTokenAuthenticationToken(Object principal, Object credentials, Collection<? extends GrantedAuthority> authorities) {
        super(principal, credentials, authorities);
    }
}
```

2. 第二步，自定义 SmsCodeAuthenticationProvider

```java
/**
 * 定义手机号获取token校验逻辑
 *
 * @author liuht
 * 2019/5/13 15:25
 */
@Slf4j
public class MobileTokenAuthenticationProvider extends AbstractUserDetailsAuthenticationProvider {

    private UserDetailsService userDetailsService;

    private TarocoRedisRepository redisRepository;

    @Override
    protected Authentication createSuccessAuthentication(final Object principal, final Authentication authentication, final UserDetails user) {
        final MobileTokenAuthenticationToken token = new MobileTokenAuthenticationToken(principal, authentication.getCredentials(), user.getAuthorities());
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
        return MobileTokenAuthenticationToken.class.isAssignableFrom(authentication);
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

3. 第三步，自定义 MobileTokenAuthenticationFilter

```java
/**
 * 手机号获取token登录认证filter
 * 通过手机号直接获取 token
 *
 * @author liuht
 * 2019/5/13 15:37
 */
public class MobileTokenAuthenticationFilter extends AbstractAuthenticationProcessingFilter {

    private static final String SPRING_SECURITY_RESTFUL_PHONE_KEY = "mobile";
    private static final String SPRING_SECURITY_RESTFUL_VERIFY_CODE_KEY = "code";

    private boolean postOnly = true;

    public MobileTokenAuthenticationFilter() {
        // 定义一个指定路径的手机号登录前缀
        super(new AntPathRequestMatcher(SecurityConstants.MOBILE_TOKEN_URL, HttpMethod.POST.name()));
    }

    @Override
    public Authentication attemptAuthentication(final HttpServletRequest request, final HttpServletResponse response) throws AuthenticationException, IOException, ServletException {
        if (postOnly && !request.getMethod().equals(HttpMethod.POST.name())) {
            throw new AuthenticationServiceException(
                    "Authentication method not supported: " + request.getMethod());
        }

        AbstractAuthenticationToken authRequest;
        String principal;
        String credentials;

        // 手机验证码登陆
        principal = obtainParameter(request, SPRING_SECURITY_RESTFUL_PHONE_KEY);
        credentials = obtainParameter(request, SPRING_SECURITY_RESTFUL_VERIFY_CODE_KEY);

        principal = principal.trim();
        authRequest = new MobileTokenAuthenticationToken(principal, credentials);
        setDetails(request, authRequest);
        return this.getAuthenticationManager().authenticate(authRequest);
    }

    private String obtainParameter(HttpServletRequest request, String parameter) {
        String result =  request.getParameter(parameter);
        return result == null ? "" : result;
    }

    protected void setDetails(HttpServletRequest request,
                              AbstractAuthenticationToken authRequest) {
        authRequest.setDetails(authenticationDetailsSource.buildDetails(request));
    }

    public void setPostOnly(boolean postOnly) {
        this.postOnly = postOnly;
    }

    public boolean isPostOnly() {
        return postOnly;
    }
}
```

4. 自定义，MobileTokenLoginSuccessHandler MobileTokenLoginFailureHandler

```java
/**
 * 手机号登录成功, 直接返回token
 *
 * @author liuht
 * 2019/5/15 16:03
 * @see SavedRequestAwareAuthenticationSuccessHandler
 */
@Component
@Slf4j
@Data
public class MobileTokenLoginSuccessHandler implements AuthenticationSuccessHandler {

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ClientDetailsService clientDetailsService;

    @Autowired
    private DefaultTokenServices tokenServices;

    @Override
    public void onAuthenticationSuccess(final HttpServletRequest request, final HttpServletResponse response, final Authentication authentication) throws IOException, ServletException {
        final String header = request.getHeader(SecurityConstants.AUTHORIZATION);

        if (header == null || !header.startsWith(SecurityConstants.BASIC_HEADER)) {
            throw new UnapprovedClientAuthenticationException("请求头中client信息为空");
        }
        try {
            final String[] tokens = extractAndDecodeHeader(header);
            assert tokens.length == 2;
            final String clientId = tokens[0];

            final ClientDetails clientDetails = clientDetailsService.loadClientByClientId(clientId);
            final TokenRequest tokenRequest = new TokenRequest(MapUtil.newHashMap(), clientId, clientDetails.getScope(), "mobile");
            final OAuth2Request oAuth2Request = tokenRequest.createOAuth2Request(clientDetails);

            final OAuth2Authentication oAuth2Authentication = new OAuth2Authentication(oAuth2Request, authentication);
            final OAuth2AccessToken oAuth2AccessToken = tokenServices.createAccessToken(oAuth2Authentication);
            if (log.isDebugEnabled()) {
                log.debug("MobileLoginSuccessHandler 签发token 成功：{}", oAuth2AccessToken.getValue());
            }

            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            response.setContentType(MediaType.APPLICATION_JSON_UTF8_VALUE);
            final PrintWriter printWriter = response.getWriter();
            printWriter.append(objectMapper.writeValueAsString(oAuth2AccessToken));
        } catch (IOException e) {
            throw new BadCredentialsException("Failed to decode basic authentication token");
        }
    }

    /**
     * Decodes the header into a username and password.
     *
     * @throws BadCredentialsException if the Basic header is not present or is not valid
     *                                 Base64
     */
    private String[] extractAndDecodeHeader(String header) throws IOException {
        final byte[] base64Token = header.substring(6).getBytes(StandardCharsets.UTF_8);
        byte[] decoded;
        try {
            decoded = Base64.decode(base64Token);
        } catch (IllegalArgumentException e) {
            throw new BadCredentialsException("Failed to decode basic authentication token");
        }
        final String token = new String(decoded, StandardCharsets.UTF_8);

        final int delim = token.indexOf(":");

        if (delim == -1) {
            throw new BadCredentialsException("Invalid basic authentication token");
        }
        return new String[] {token.substring(0, delim), token.substring(delim + 1)};
    }
}

/**
 * 手机登录失败返回
 *
 * @author liuht
 * 2019/5/16 9:37
 */
@Component
@Slf4j
public class MobileTokenLoginFailureHandler implements AuthenticationFailureHandler {

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public void onAuthenticationFailure(final HttpServletRequest request,
                                        final HttpServletResponse response,
                                        final AuthenticationException exception) throws IOException, ServletException {
        if (log.isDebugEnabled()) {
            log.debug("MobileLoginFailureHandler:" + exception.getMessage());
        }
        final Response resp = Response.failure(exception.getMessage());
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_UTF8_VALUE);
        response.getWriter().write(objectMapper.writeValueAsString(resp));
    }
}
```

5. 最后，我们定义一个自定义一个 SecurityConfigurerAdapter，并且 apply 到主配置类当中：

```java
/**
 * 手机号/验证码获取Token 安全配置
 *
 * @author liuht
 * 2019/7/22 16:14
 */
@Component
public class MobileTokenAuthenticationSecurityConfigration extends SecurityConfigurerAdapter<DefaultSecurityFilterChain, HttpSecurity> {

    @Autowired
    private TarocoRedisRepository redisRepository;

    @Autowired
    private MobileUserDetailsService mobileUserDetailsService;

    @Autowired
    private MobileTokenLoginFailureHandler mobileTokenLoginFailureHandler;

    @Autowired
    private MobileTokenLoginSuccessHandler mobileTokenLoginSuccessHandler;

    @Override
    public void configure(final HttpSecurity http) throws Exception {
        final MobileTokenAuthenticationFilter filter = new MobileTokenAuthenticationFilter();
        filter.setAuthenticationManager(http.getSharedObject(AuthenticationManager.class));
        filter.setAuthenticationSuccessHandler(mobileTokenLoginSuccessHandler);
        filter.setAuthenticationFailureHandler(mobileTokenLoginFailureHandler);

        final MobileTokenAuthenticationProvider provider = new MobileTokenAuthenticationProvider();
        provider.setRedisRepository(redisRepository);
        provider.setUserDetailsService(mobileUserDetailsService);
        provider.setHideUserNotFoundExceptions(false);

        http
                .authenticationProvider(provider)
                .addFilterAfter(filter, UsernamePasswordAuthenticationFilter.class);
    }
}
```