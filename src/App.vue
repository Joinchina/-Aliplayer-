<template>
  <div id="app">    
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: 'App',
  components: {
  }
}
</script>

<style>
#app{
  overflow-x: hidden;
  overflow-y: hidden;
  max-width: 640px;/*no*/
  margin: 0 auto;
}
</style>
