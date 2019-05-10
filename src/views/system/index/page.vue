<template>
  <d2-container class="page">
    <d2-page-cover>
      <img src="./image/taroco.png" style="margin-bottom:15px"/>
      <template slot="footer">
        <div class="page__btn-group">
          <span @click="$open('https://github.com/liuht777/Taroco')">后端地址</span> |
          <span @click="$open('https://github.com/liuht777/Taroco-Ui-Vue')">配套前端</span> |

          <span @click="$open('http://118.190.154.85:8080')">在线文档</span>
        </div>
      </template>
    </d2-page-cover>
  </d2-container>
</template>

<script>
import d2PageCover from './components/d2-page-cover'
export default {
  components: {
    d2PageCover
  }
}
</script>

<style lang="scss" scoped>
@import '~@/assets/style/public.scss';
.page {
  .page__btn-group {
    color: $color-text-placehoder;
    font-size: 12px;
    span {
      color: $color-text-sub;
      &:hover {
        color: $color-text-main;
      }
    }
  }
}
</style>
