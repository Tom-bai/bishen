<template lang='pug'>
    .alltoken
        .container
            .alltoken-back
                router-link(to='/home/token/ptn') {{$t('token.back')}}
            .alltoken-tit
                h4
                    i.iconfont.icon-957caidan_qianbao
                    span {{$t('token.add')}}
            .alltoken-content
                .search
                    label {{$t('token.otherCoinName')}}：
                    el-input(v-model='searchOptions.searchStr' size="mini" style="width:100px;margin:0 20px 20px 0;")
                    el-button(type="primary" @click="search" size="mini") {{$t('exchange.search')}}
                el-row(:gutter='20' )
                    el-col(:span='6' v-for='(item,index) in tokens' :key='index' style='margin-bottom:20px')
                        .box
                            span {{item.tokenName}}
                            .switch-box
                                el-switch(v-model='item.isOpen==1?true:false' @change='open(item.isOpen,item.tokenName)' active-color="#FE7644" inactive-color="#b5b5b5")
                    //- el-col(:span='6')
                    //-     .box
                    //-         span PTN
                    //-         el-switch(v-model='selBox[1]' active-color="#FE7644" inactive-color="#b5b5b5")
                    //- el-col(:span='6')
                    //-     .box
                    //-         span PTN
                    //-         el-switch(v-model='selBox[2]' active-color="#FE7644" inactive-color="#b5b5b5")
                    //- el-col(:span='6')
                    //-     .box
                    //-         span PTN
                    //-         el-switch(v-model='selBox[3]' active-color="#FE7644" inactive-color="#b5b5b5")
</template>

<script>
import { tokenOpenAndCloseList, tokenOpenAndCloseListFuzzy, tokenOpenAndClose } from '@/http/index.js'
function RandomNumBoth(Min,Max){
    var Range = Max - Min;
    var Rand = Math.random();
    var num = Min + Math.round(Rand * Range); //四舍五入
    return num;
}


export default {
    mounted() {
        this.allToken();
        this.timer = setInterval(this.allToken,5000)
    },
    destroyed() {
        clearInterval(this.timer);
    },
    data() {
        return {
            timer: null,
            selBox:[],
            tokens:[],
            searchOptions: {
                searchStr:'',
            }
        }
    },
    methods: {
        search() {
            clearInterval(this.timer);
            this.allToken();
            this.timer = setInterval(this.allToken,5000)
        },
        async allToken() {// 获取账户信息
            try {
                let res;
                if(this.searchOptions.searchStr != ''){
                    res = await tokenOpenAndCloseListFuzzy({
                        tokenStr: this.searchOptions.searchStr
                    })
                }else{
                    res = await tokenOpenAndCloseList();
                }
                if(res) {
                    this.tokens=res.data
                    // console.log(res.data)
                }
            }
            catch (e) {
                console.log(e);
            }
        },
        async changeSwitch(flag,tokenName) {// 获取账户信息
            try {
                let res = await tokenOpenAndClose({
                    flag:flag,
                    tokenName:tokenName
                })
                if(res) {
                    this.allToken();
                    // console.log(res.data)
                }
            }
            catch (e) {
                console.log(e);
            }
        },
        open(val,token) {
            if(val==0) {
                this.changeSwitch(1,token).then((data)=>{
                    this.$store.commit('UPDATE_TOKEN_STATE');
                })
            }else {
                this.changeSwitch(0,token).then((data)=>{
                    this.$store.commit('UPDATE_TOKEN_STATE');
                })
            }
            
        }
    }
    
}
</script>

<style lang='scss'>
    @import './coins.scss';
</style>
