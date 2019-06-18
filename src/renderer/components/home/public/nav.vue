<template lang='pug'>
    .nav(:style="'height:'+navHeight+'px;position:'+pos")
        .nav-box
            //- 连接状态和锻造状态
            .status-success.status(v-if='nodeState==1' @mouseenter='showtip(1)' @mouseleave='showtip(0)')
                i.iconfont.icon-dagou
                transition(name="el-zoom-in-top")
                    .tip(v-if='tip==1') {{$t('nav.success')}}
            .status-erro.status(v-if='nodeState==2' @mouseenter='showtip(2)' @mouseleave='showtip(0)')
                i.iconfont.icon-chahao
                transition(name="el-zoom-in-top")
                    .tip(v-if='tip==2') {{$t('nav.error')}}
            .status-loading.status(v-if='nodeState==0' @mouseenter='showtip(3)' @mouseleave='showtip(0)')
                transition(name="el-zoom-in-top")
                    .tip(v-if='tip==3') {{$t('nav.loading')}}
            .drag-status.stop(v-if='!dragState' @mouseenter='showtip(4)' @mouseleave='showtip(0)')
                i.iconfont.icon--wakuangjiankong
                transition(name="el-zoom-in-top")
                    .tip(v-if='tip==4') {{$t('tip.stop')}}
            .drag-status.draging(v-if='dragState' @mouseenter='showtip(5)' @mouseleave='showtip(0)')
                i.iconfont.icon--wakuangjiankong
                transition(name="el-zoom-in-top")
                    .tip(v-if='tip==5') {{$t('tip.forging')}}
            //- 导航栏其他信息
            ul.clearfix
                li
                    a(@click.stop='goPath("blocks")' :class='$route.path=="/home/blocks"?"active":""') {{$t('nav.blocks')}}
                li
                    a(@click.stop='goPath("account")' :class='$route.path.indexOf("/home/account")!=-1?"active":""') {{$t('nav.account')}}
                li
                    a(@click.stop='changePath("ptn")' :class='tokenActive?"active":""') TOKENS
                        ul.my-token
                            li(v-for="item in myToken" :key='item')
                                a( @click.stop='changePath(item)').token-name {{item}}
                li
                    a(@click.stop='goPath("transaction")' :class='$route.path=="/home/transaction"?"active":""') {{$t('nav.transaction')}}
                li
                    a(:class='$route.path.indexOf("/home/market")!=-1?"active":""') {{$t('nav.market')}}
                        ul.my-token
                            li
                                a( @click.stop='goPath("market/exchange")').token-name {{$t('nav.exchange')}}
                            li
                                a( @click.stop='goPath("market/vote")').token-name {{$t('nav.vote')}}
                            li
                                a( @click.stop='goPath("market/othercontracts")').token-name {{$t('nav.othercontracts')}}
                li
                    a(@click.stop='goPath("api")' :class='$route.path.indexOf("/home/api")!=-1?"active":""') API
            .logo
                router-link(to='/loading')
                    img(src='../../../assets/nav/logo.png')
        slot
</template>

<script>
import { getTokenList,getNodeState,FoundryMachineState,noteFoundryMachineState } from '@/http/index.js'
import { clearInterval } from 'timers';

export default {
    mounted() {
        // 进来先获取一下状态
        this.navHeight=60;
        this.getTokenList(); // 获取Token中的自选列表
        this.getNodeState(); // 获取连接状态
        this.noteFoundryMachineState(); // 获取锻造状态
        if(this.$route.params.tokenName) {
            this.tokenActive=true;
            this.$store.commit("UPDATE_TOKEN",this.$route.params.tokenName);
        }else if(this.$route.path=='/home/transaction') {
            this.tokenActive=false;
        }else {
            this.tokenActive=false;
            this.$store.commit("UPDATE_TOKEN",'ptn');
        }
        this.timer=setInterval(() => {
            this.getNodeState()
            this.noteFoundryMachineState();
        },3000)
    },
    destroyed() {
        clearInterval(this.timer);
        this.timer = null;
    },
    updated() {
        if(this.$route.params.tokenName) {
            this.tokenActive=true;
            this.$store.commit("UPDATE_TOKEN",this.$route.params.tokenName);
        }else if(this.$route.path=='/home/transaction') {
            this.tokenActive=false;
        }else {
            this.tokenActive=false;
            this.$store.commit("UPDATE_TOKEN",'ptn');
        }
        this.changePage();
    },
    props:['height'],
    data() {
        return {
            navHeight:60,
            pos:'relative',
            token:'',
            myToken:[],
            tokenActive:false,
            timer:null,
            nodeState:0,
            tip:0,
            dragState:false,
        }
    },
    methods: {
        async getTokenList() {// 获取token列表
            try {
                let res = await getTokenList()
                if(res) {
                    this.myToken=res.data;
                    this.token=res.data[0];
                }else {
                    this.myToken=[];
                }
            }
            catch (e) {
                console.log(e);
            }
        },
        async getNodeState() {// 获取节点状态
            try {
                let res = await getNodeState()
                if(res) {
                    this.nodeState = res.data.nodeState
                    // console.log(res.data.nodeState)
                }
            }
            catch (e) {
                this.nodeState = 2
                console.log(e)
            }
        },
        async noteFoundryMachineState() {// 获取锻造状态
            try {
                let res = await noteFoundryMachineState()
                if(res.code == 120) {
                    this.dragState = true;
                }else {
                    this.dragState = false;
                }
            }
            catch (e) {
                this.dragState = false;
                console.log(e);
            }
        },
        showtip(data) {
            this.tip = data;
        },
        goPath(path) {
            this.$router.push('/home/'+path);
        },
        changePath(token) {
            this.$router.push('/home/token/'+token);
        },
        changePage() {
            if(this.$route.path=='/home/blocks') {
                this.navHeight=60;
            }else if(this.$route.path.indexOf('/home/api')!=-1) {
                this.navHeight=60;
            }else if(this.$route.path.indexOf('/home/account/contractExcharge')!=-1) {
                this.navHeight=60;
            }else if(this.$route.path.indexOf('/home/market')!=-1) {
                this.navHeight=60;
            }else if(this.$route.path.indexOf('/home/transaction')!=-1) {
                this.navHeight=60;
            }
            else {
                this.navHeight=280;
            }
        },
    },
    computed: {  
        listenTokenList() {
            return this.$store.state.Counter.tokenState;  
        }  
    },  
    watch: {  
        listenTokenList(a, b) {
            this.getTokenList();
        }  
    }, 
}
</script>

<style lang='scss'>
@import './nav.scss';
</style>
