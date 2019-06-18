<template lang='pug'>
    #loading
        el-row.loading-box
            //- 左侧 
            el-col(:span='12')
                .left
                    h4 WELCOME TO
                    h4 PHOTON CHAIN
            //- 右侧
            el-col(:span='12')
                .right
                    .box
                        .logo
                            img(src='../../assets/loading/logo.png')
                        .progress
                            el-progress(:percentage="progress")
                            //- p(v-if='progress<1') 正在同步
                        .enter
                            button(@click='goBlocks' v-if='btnDisabled == 1') {{$t('loading.enter')}}
                            button(disabled v-if='btnDisabled == 0') {{$t('loading.loading')}}
                            button(disabled v-if='btnDisabled == 2') {{$t('loading.error')}}
                        .lang
                            span(:class='lang=="zh"?"active":""' @click='changLang("zh")') 中文
                            span(:class='lang=="en"?"active":""' @click='changLang("en")') EN
</template>

<script>
import { getsyncBlockSchedule, getNodeState, changLang } from '@/http/index.js'
import cmd from 'node-cmd'

export default {
    mounted() {
        // 获取同步状态
        this.getsyncBlockSchedule();
        this.getNodeState();
        this.timer = setInterval(()=>{
            this.getsyncBlockSchedule();
            this.getNodeState();
        },5000)
        // 切换语言
        if(localStorage.getItem('lang')=='en') {
            this.changLang('en');
        }else {
            this.changLang('zh');
        }
    },
    destroyed() {
        clearInterval(this.timer);
        this.timer=null;
    },
    data() {
        return {
            progress:0,
            lang:'zh',
            timer:null,
            btnDisabled: 0
        }
    },
    methods: {
        // 进入区块页面
        goBlocks() {
            this.$router.push('/home/blocks');
        },
        async getsyncBlockSchedule() {// 获取区块同步状态
            try {
                let res = await getsyncBlockSchedule()
                if(res) {
                    this.progress = Math.floor(res.data.blockSchedule*100);
                }
            }
            catch (e) {
                console.log(e);
            }
        },
        async getNodeState() {
           try {
                let res = await getNodeState()
                if(res) {
                    if(res.data.nodeState == 1) {
                        this.btnDisabled = 1;
                    } else if(res.data.nodeState == 0) {
                        this.btnDisabled = 0;
                    } else {
                        this.btnDisabled = 2;
                    }
                }
            }
            catch (e) {
                this.progress = 0;
                this.btnDisabled = 2;
                console.log(e);
            } 
        },
        // 切换语言
        changLang(lang) {
            this.$i18n.locale = lang;
            this.lang = lang;
            localStorage.setItem('lang',lang)
        }
    }
    
}
</script>

<style lang='scss' scoped>
    @import './loading.scss';
</style>
