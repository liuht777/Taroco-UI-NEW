<template>
  <d2-container-iframe :src="src"/>
</template>
<script>
export default {
  name: 'Taroco-Sentinel',
  data () {
    return {
      src: `${process.env.VUE_APP_SENTINEL_URL}`
    }
  }
}
</script>
