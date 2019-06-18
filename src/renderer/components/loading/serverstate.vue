<template lang='pug'>
    #loading
        .loading-box
            .loading-box-bg
                img(src='../../assets/loading/logo.png')
                .state 
                    i.el-icon-loading
                    //- 启动服务中
                    span {{$t('loading.starting')}}
                    //- el-button(@click='test') 123
        canvas(ref='myAnimate' width='100%' height='100%')#myanimate
</template>

<script>
var child_process = require('child_process');
import Axios from 'axios'
import { getsyncBlockSchedule,changLang } from '@/http/index.js'
// const shell = require('electron').shell

import CanvasAnimate from '@/animate.js'
const ipc = require('electron').ipcRenderer



export default {
    async mounted() {
    //     child_process.exec(' pwd',(err,stdout,etderr) => {
    //     this.dist = stdout;
    //   })
    this.dist = __dirname;
        // 背景canvas动画生成
        this.$refs.myAnimate.width=innerWidth
        this.$refs.myAnimate.height=innerHeight
        var a = new CanvasAnimate(this.$refs.myAnimate,{length:80,clicked:false,moveon:true,RoundColor:'#5077cc',LineColor:'#5077cc'})
        a.Run()
        // 检查新版本
        let isMatch = await this.IS_VER_MATCH();
        if(!isMatch) return false
        
        // 根据连接状态判断是否跳转到加载页
        this.getsyncBlockSchedule();
        this.timer=setInterval(()=>{
            this.getsyncBlockSchedule();
        },3000)
    },
    destroyed() {
        // 关闭轮询时钟
        clearInterval(this.timer);
        this.timer=null;
    },
    data() {
        return {
            timer:null,
            dist:'123'
        }
    },
    methods: {
        test() {
            ipc.send('getSystem', 'ping')
            ipc.on('system',(event,arg) => {
                console.log(arg === 'win32')
                console.log(arg)
                this.dist=arg
            })
        },
        goLoading() {
            this.$router.push('/loading')
        },
        async getsyncBlockSchedule() {// 获取同步状态
            try {
                let res = await getsyncBlockSchedule()
                if(res &&res.code==100) {
                    this.goLoading();
                    return res;
                }
            }
            catch (e) {
                return false
            }
        },
    }
    
}
</script>

<style lang='scss' scoped>
    @import './loading.scss';
</style>
