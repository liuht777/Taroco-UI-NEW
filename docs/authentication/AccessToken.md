# 获取 AccessToken

## authorization_code 模式

1. 发起 /oauth/authorize 请求获取 code

```
get http://localhost:8080/oauth/authorize?response_type=code&redirect_uri=https://www.baidu.com&client_id=5d22eb6e8b0c7ba066014398
```

> 如果客户端开启了自动认证，会自动跳转到 redirect_uri 地址。如果没有会跳转到用户授权界面，用户同意授权后跳转到 redirect_uri 地址。

2. redirect_uri 获取到 code，发起 /oauth/token 请求，获取 accessToken

```
post http://localhost:8080/oauth/token?grant_type=authorization_code&scope=All&client_id=5d22eb6e8b0c7ba066014398&client_secret=123456&code=6vk2kI&redirect_uri=https://www.baidu.com
```

3. 拿到 accessToken

```
{
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJsaWNlbnNlIjoibWFkZSBieSB0YXJvY28iLCJ1c2VyX25hbWUiOiJhZG1pbiIsInNjb3BlIjpbIkFsbCJdLCJ4LXVzZXItaWQiOjkwOTYyMDc2MSwiZXhwIjoxNTY0NjQ2NzM4LCJ4LXVzZXItbmFtZSI6ImFkbWluIiwiYXV0aG9yaXRpZXMiOlsiUk9MRV9VU0VSIiwiT1BfVVNFUiJdLCJqdGkiOiJlMjc4MzE2My03MmZkLTRkZDgtOTRjZi00ZDE0N2NiOGM3NDciLCJjbGllbnRfaWQiOiI1ZDIyZWI2ZThiMGM3YmEwNjYwMTQzOTgifQ.ffMbB2IQWCKcQycuEtHxQpjjFtBc6RSfgfOkrVdzQZ6Pfptwji8dP_-nwQcKIAF-rrJeyQzpTCii45iQYj2ElmYALKqAzKxRTv4x8c6wvA0ejoaCa2oadmbEdDNy4EdDrqhNugAh4LPWdzF1V3g20nZexoPRMNjGlk9kJjAXMQoQSTYZom4AB8wWMGz7ZTP2_V3GBx5XNiKU-zXgQ33eEfxUgbg7Is65_PgIv18JTBGl-GLZ86GtvNCMre4U7xtyeNeZ3hCxRBq6lvvhri-DYXePKM6GiJCR7Y4P9216ohr4MV4f05XIy0kkOPLL_UlZar4KjP9PhIBmOEM4Yg6tmQ",
    "token_type": "bearer",
    "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJsaWNlbnNlIjoibWFkZSBieSB0YXJvY28iLCJ1c2VyX25hbWUiOiJhZG1pbiIsInNjb3BlIjpbIkFsbCJdLCJhdGkiOiJlMjc4MzE2My03MmZkLTRkZDgtOTRjZi00ZDE0N2NiOGM3NDciLCJ4LXVzZXItaWQiOjkwOTYyMDc2MSwiZXhwIjoxNTY0NjQ2NzM4LCJ4LXVzZXItbmFtZSI6ImFkbWluIiwiYXV0aG9yaXRpZXMiOlsiUk9MRV9VU0VSIiwiT1BfVVNFUiJdLCJqdGkiOiJkNWYyMWQ2Ny02YmJkLTRkMjUtODA4NS1mYjVjNjI3MGZjOTIiLCJjbGllbnRfaWQiOiI1ZDIyZWI2ZThiMGM3YmEwNjYwMTQzOTgifQ.Ts0_kRXhppkNn0yLvw9sAQkcRCVDZAQgW7uxN0yRzf5f3644fXgxEujA6iSWD9hc_HXxNty2hbLQfXXktyUpKbpeQsWmLXdVx6eTTQiUY2ktXeCXh0MazQB0pci2RvYJCLCaDEaRaXRqab1LpLW_UsRZ8WNHf-IjcdBo5t-oaSuGeMY_X1wwqugYIkyENQane7VPVY71l6EvxpGgBxaxuhyHN1uvJ9Q1kvGuOsgdqgItIIylOFu9t-VZcuhoRTs4lq2ywZIMwj3Tsp7LcwUe5NuArXK22yokAzgDlnUCB3WFCy76hKkVZX6K6sD6K5yKlPfkQ4Ghkg3LkEh-7p9o_g",
    "expires_in": 86399,
    "scope": "All",
    "jti": "e2783163-72fd-4dd8-94cf-4d147cb8c747",
    "license": "made by taroco",
    "x-user-name": "admin",
    "x-user-id": 909620761
}
```

## password 模式

1. 发起 /oauth/token 请求，获取 accessToken

```
post http://localhost:8080/oauth/token?grant_type=password&username=admin&password=admin&client_id=5d22eb6e8b0c7ba066014398&client_secret=123456&scope=All
```

> scope 为可选参数，不传的话会返回所有客户端 scope

2. 拿到 accessToken

```
{
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJsaWNlbnNlIjoibWFkZSBieSB0YXJvY28iLCJ1c2VyX25hbWUiOiJhZG1pbiIsInNjb3BlIjpbIkFsbCJdLCJ4LXVzZXItaWQiOjkwOTYyMDc2MSwiZXhwIjoxNTY0NjQ2NzM4LCJ4LXVzZXItbmFtZSI6ImFkbWluIiwiYXV0aG9yaXRpZXMiOlsiUk9MRV9VU0VSIiwiT1BfVVNFUiJdLCJqdGkiOiJlMjc4MzE2My03MmZkLTRkZDgtOTRjZi00ZDE0N2NiOGM3NDciLCJjbGllbnRfaWQiOiI1ZDIyZWI2ZThiMGM3YmEwNjYwMTQzOTgifQ.ffMbB2IQWCKcQycuEtHxQpjjFtBc6RSfgfOkrVdzQZ6Pfptwji8dP_-nwQcKIAF-rrJeyQzpTCii45iQYj2ElmYALKqAzKxRTv4x8c6wvA0ejoaCa2oadmbEdDNy4EdDrqhNugAh4LPWdzF1V3g20nZexoPRMNjGlk9kJjAXMQoQSTYZom4AB8wWMGz7ZTP2_V3GBx5XNiKU-zXgQ33eEfxUgbg7Is65_PgIv18JTBGl-GLZ86GtvNCMre4U7xtyeNeZ3hCxRBq6lvvhri-DYXePKM6GiJCR7Y4P9216ohr4MV4f05XIy0kkOPLL_UlZar4KjP9PhIBmOEM4Yg6tmQ",
    "token_type": "bearer",
    "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJsaWNlbnNlIjoibWFkZSBieSB0YXJvY28iLCJ1c2VyX25hbWUiOiJhZG1pbiIsInNjb3BlIjpbIkFsbCJdLCJhdGkiOiJlMjc4MzE2My03MmZkLTRkZDgtOTRjZi00ZDE0N2NiOGM3NDciLCJ4LXVzZXItaWQiOjkwOTYyMDc2MSwiZXhwIjoxNTY0NjQ2NzM4LCJ4LXVzZXItbmFtZSI6ImFkbWluIiwiYXV0aG9yaXRpZXMiOlsiUk9MRV9VU0VSIiwiT1BfVVNFUiJdLCJqdGkiOiJkNWYyMWQ2Ny02YmJkLTRkMjUtODA4NS1mYjVjNjI3MGZjOTIiLCJjbGllbnRfaWQiOiI1ZDIyZWI2ZThiMGM3YmEwNjYwMTQzOTgifQ.Ts0_kRXhppkNn0yLvw9sAQkcRCVDZAQgW7uxN0yRzf5f3644fXgxEujA6iSWD9hc_HXxNty2hbLQfXXktyUpKbpeQsWmLXdVx6eTTQiUY2ktXeCXh0MazQB0pci2RvYJCLCaDEaRaXRqab1LpLW_UsRZ8WNHf-IjcdBo5t-oaSuGeMY_X1wwqugYIkyENQane7VPVY71l6EvxpGgBxaxuhyHN1uvJ9Q1kvGuOsgdqgItIIylOFu9t-VZcuhoRTs4lq2ywZIMwj3Tsp7LcwUe5NuArXK22yokAzgDlnUCB3WFCy76hKkVZX6K6sD6K5yKlPfkQ4Ghkg3LkEh-7p9o_g",
    "expires_in": 86399,
    "scope": "All",
    "jti": "e2783163-72fd-4dd8-94cf-4d147cb8c747",
    "license": "made by taroco",
    "x-user-name": "admin",
    "x-user-id": 909620761
}
```

## client_credentials模式

1. 发起 /oauth/token 请求，获取 accessToken

```
post http://localhost:8080/oauth/token?grant_type=client_credentials&client_id=5d22eb6e8b0c7ba066014398&client_secret=123456&scope=All
```

> scope 为可选参数，不传的话会返回所有客户端 scope
> client_credentials 模式会跳过用户授权步骤，直接返回 accessToken

2. 拿到 accessToken

```
{
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJsaWNlbnNlIjoibWFkZSBieSB0YXJvY28iLCJ1c2VyX25hbWUiOiJhZG1pbiIsInNjb3BlIjpbIkFsbCJdLCJ4LXVzZXItaWQiOjkwOTYyMDc2MSwiZXhwIjoxNTY0NjQ2NzM4LCJ4LXVzZXItbmFtZSI6ImFkbWluIiwiYXV0aG9yaXRpZXMiOlsiUk9MRV9VU0VSIiwiT1BfVVNFUiJdLCJqdGkiOiJlMjc4MzE2My03MmZkLTRkZDgtOTRjZi00ZDE0N2NiOGM3NDciLCJjbGllbnRfaWQiOiI1ZDIyZWI2ZThiMGM3YmEwNjYwMTQzOTgifQ.ffMbB2IQWCKcQycuEtHxQpjjFtBc6RSfgfOkrVdzQZ6Pfptwji8dP_-nwQcKIAF-rrJeyQzpTCii45iQYj2ElmYALKqAzKxRTv4x8c6wvA0ejoaCa2oadmbEdDNy4EdDrqhNugAh4LPWdzF1V3g20nZexoPRMNjGlk9kJjAXMQoQSTYZom4AB8wWMGz7ZTP2_V3GBx5XNiKU-zXgQ33eEfxUgbg7Is65_PgIv18JTBGl-GLZ86GtvNCMre4U7xtyeNeZ3hCxRBq6lvvhri-DYXePKM6GiJCR7Y4P9216ohr4MV4f05XIy0kkOPLL_UlZar4KjP9PhIBmOEM4Yg6tmQ",
    "token_type": "bearer",
    "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJsaWNlbnNlIjoibWFkZSBieSB0YXJvY28iLCJ1c2VyX25hbWUiOiJhZG1pbiIsInNjb3BlIjpbIkFsbCJdLCJhdGkiOiJlMjc4MzE2My03MmZkLTRkZDgtOTRjZi00ZDE0N2NiOGM3NDciLCJ4LXVzZXItaWQiOjkwOTYyMDc2MSwiZXhwIjoxNTY0NjQ2NzM4LCJ4LXVzZXItbmFtZSI6ImFkbWluIiwiYXV0aG9yaXRpZXMiOlsiUk9MRV9VU0VSIiwiT1BfVVNFUiJdLCJqdGkiOiJkNWYyMWQ2Ny02YmJkLTRkMjUtODA4NS1mYjVjNjI3MGZjOTIiLCJjbGllbnRfaWQiOiI1ZDIyZWI2ZThiMGM3YmEwNjYwMTQzOTgifQ.Ts0_kRXhppkNn0yLvw9sAQkcRCVDZAQgW7uxN0yRzf5f3644fXgxEujA6iSWD9hc_HXxNty2hbLQfXXktyUpKbpeQsWmLXdVx6eTTQiUY2ktXeCXh0MazQB0pci2RvYJCLCaDEaRaXRqab1LpLW_UsRZ8WNHf-IjcdBo5t-oaSuGeMY_X1wwqugYIkyENQane7VPVY71l6EvxpGgBxaxuhyHN1uvJ9Q1kvGuOsgdqgItIIylOFu9t-VZcuhoRTs4lq2ywZIMwj3Tsp7LcwUe5NuArXK22yokAzgDlnUCB3WFCy76hKkVZX6K6sD6K5yKlPfkQ4Ghkg3LkEh-7p9o_g",
    "expires_in": 86399,
    "scope": "All",
    "jti": "e2783163-72fd-4dd8-94cf-4d147cb8c747",
    "license": "made by taroco",
    "x-user-name": "admin",
    "x-user-id": 909620761
}
```

## implicit 模式

1. 发起 /oauth/authorize 请求，获取 accessToken

```
get http://localhost:8080/oauth/authorize?response_type=token&client_id=5d22eb6e8b0c7ba066014398&redirect_uri=https://www.baidu.com&scope=All&state=test12
```

> implicit 模式为 get 请求，需要用户登录
> accessToken 直接返回给 redirect_uri，implicit 模式不安全，一般不建议采用此种模式

## mobile 模式

1. 发起 /oauth/mobile 请求，获取 accessToken

```
post http://localhost:8080/oauth/mobile?mobile=18181956331&code=819900&scope=All

需要添加header：Authorization=Basic NWQyMmViNmU4YjBjN2JhMDY2MDE0Mzk4OjEyMzQ1Ng==
```

> header Authorization 的值是 "clientId:client_secret"，取 Base64 编码的值。
> 通过 mobile 获取 accessToken，需要先获取手机号发送的验证码 code。

2. 拿到 accessToken

```
{
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJsaWNlbnNlIjoibWFkZSBieSB0YXJvY28iLCJ1c2VyX25hbWUiOiJhZG1pbiIsInNjb3BlIjpbIkFsbCJdLCJ4LXVzZXItaWQiOjkwOTYyMDc2MSwiZXhwIjoxNTY0NjQ2NzM4LCJ4LXVzZXItbmFtZSI6ImFkbWluIiwiYXV0aG9yaXRpZXMiOlsiUk9MRV9VU0VSIiwiT1BfVVNFUiJdLCJqdGkiOiJlMjc4MzE2My03MmZkLTRkZDgtOTRjZi00ZDE0N2NiOGM3NDciLCJjbGllbnRfaWQiOiI1ZDIyZWI2ZThiMGM3YmEwNjYwMTQzOTgifQ.ffMbB2IQWCKcQycuEtHxQpjjFtBc6RSfgfOkrVdzQZ6Pfptwji8dP_-nwQcKIAF-rrJeyQzpTCii45iQYj2ElmYALKqAzKxRTv4x8c6wvA0ejoaCa2oadmbEdDNy4EdDrqhNugAh4LPWdzF1V3g20nZexoPRMNjGlk9kJjAXMQoQSTYZom4AB8wWMGz7ZTP2_V3GBx5XNiKU-zXgQ33eEfxUgbg7Is65_PgIv18JTBGl-GLZ86GtvNCMre4U7xtyeNeZ3hCxRBq6lvvhri-DYXePKM6GiJCR7Y4P9216ohr4MV4f05XIy0kkOPLL_UlZar4KjP9PhIBmOEM4Yg6tmQ",
    "token_type": "bearer",
    "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJsaWNlbnNlIjoibWFkZSBieSB0YXJvY28iLCJ1c2VyX25hbWUiOiJhZG1pbiIsInNjb3BlIjpbIkFsbCJdLCJhdGkiOiJlMjc4MzE2My03MmZkLTRkZDgtOTRjZi00ZDE0N2NiOGM3NDciLCJ4LXVzZXItaWQiOjkwOTYyMDc2MSwiZXhwIjoxNTY0NjQ2NzM4LCJ4LXVzZXItbmFtZSI6ImFkbWluIiwiYXV0aG9yaXRpZXMiOlsiUk9MRV9VU0VSIiwiT1BfVVNFUiJdLCJqdGkiOiJkNWYyMWQ2Ny02YmJkLTRkMjUtODA4NS1mYjVjNjI3MGZjOTIiLCJjbGllbnRfaWQiOiI1ZDIyZWI2ZThiMGM3YmEwNjYwMTQzOTgifQ.Ts0_kRXhppkNn0yLvw9sAQkcRCVDZAQgW7uxN0yRzf5f3644fXgxEujA6iSWD9hc_HXxNty2hbLQfXXktyUpKbpeQsWmLXdVx6eTTQiUY2ktXeCXh0MazQB0pci2RvYJCLCaDEaRaXRqab1LpLW_UsRZ8WNHf-IjcdBo5t-oaSuGeMY_X1wwqugYIkyENQane7VPVY71l6EvxpGgBxaxuhyHN1uvJ9Q1kvGuOsgdqgItIIylOFu9t-VZcuhoRTs4lq2ywZIMwj3Tsp7LcwUe5NuArXK22yokAzgDlnUCB3WFCy76hKkVZX6K6sD6K5yKlPfkQ4Ghkg3LkEh-7p9o_g",
    "expires_in": 86399,
    "scope": "All",
    "jti": "e2783163-72fd-4dd8-94cf-4d147cb8c747",
    "license": "made by taroco",
    "x-user-name": "admin",
    "x-user-id": 909620761
}
```