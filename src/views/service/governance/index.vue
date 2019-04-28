<template>
  <d2-container-iframe :src="src"/>
</template>
<script>
export default {
  name: 'Taroco-Governance',
  data () {
    return {
      src: `${process.env.VUE_APP_GOVERNANCE_URL}`
    }
  }
}
</script>
