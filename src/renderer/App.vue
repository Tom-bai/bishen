<template>
  <div id="app" ondragstart="return false">
    <!-- {{dist}} -->
      <router-view></router-view>

    
  </div>
</template>

<script>

  export default {
    mounted() {
      
    },
    data() {
      return {
        dist: ''
      }
    },
    name: 'app'
  }
</script>

<style lang='scss'>
@import './components/theme.scss';
  #app {
    height: 100%;
  }
  html::-webkit-scrollbar {
      // display: none;
      display: block;
      overflow: auto;
      position: fixed;
      right: 10px;
      width: 4px;
      height: 16px;
      background-color: rgba(0,0,0,0.2);
  }
  html::-webkit-scrollbar-track{
      // -webkit-box-shadow: inset 0 0 6px #0a1055;
      border-radius: 10px;
      background-color: #999;
      display: none;
      width: 40px;
  }
  html::-webkit-scrollbar-thumb{
      /*width: 10px;*/
      height: 20px;
      border-radius: 10px;
      // -webkit-box-shadow: inset 0 0 6px #0a1055;
      background-color: #1943a6;
  }
  /* CSS */
</style>
