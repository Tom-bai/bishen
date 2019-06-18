<template lang='pug'>
    .blocks
        //- 弹出框
        transition(name="el-fade-in-linear")
            block-list(:height='height' :hash='hash' v-if='listShow')
                .close(@click='showList(false)') ×
        el-row(:gutter='30')
            //- 左边四大块
            el-col(:span='9').left
                el-row(:gutter='10')
                    el-col(:span='12')
                        .left-box.box1
                            .tit
                            //- 每个区块平均数额
                            .content 
                                h4 {{$store.state.Counter.blockInfo.avgAmount||0}}
                                p {{$t('blocks.avgAmount')}}
                    el-col(:span='12')
                        .left-box.box2
                            .tit
                            //- 每个区块平均费用
                            .content
                                h4 {{$store.state.Counter.blockInfo.avgFee||0}}
                                p {{$t('blocks.avgFee')}}
                el-row(:gutter='10')
                    el-col(:span='12')
                        .left-box.box3
                            .tit
                            //- 每小时交易数目
                            .content
                                h4 {{$store.state.Counter.blockInfo.hTransCount||0}}
                                p {{$t('blocks.transitionNums')}}
                    el-col(:span='12')
                        .left-box.box4
                            .tit
                            //- 区块生成时间
                            .content
                                h4 {{$store.state.Counter.blockInfo.blockTime||0}}
                                p {{$t('blocks.genTime')}}
                        
            el-col(:span='15').right
                el-row(:gutter='10')
                    //- 区块列表 
                    .list1
                        .list1-tit
                        .list1-content
                            el-row.tit
                                //- 标题
                                el-col(:span='4')
                                    //- 高度
                                    span {{$t('blocks.height')}}
                                el-col(:span='5')
                                    //- 日期
                                    span {{$t('blocks.date')}}
                                el-col(:span='10')
                                    //- 生产者
                                    span {{$t('blocks.creater')}}
                                el-col(:span='5')
                                    //- 数目
                                    span {{$t('blocks.amount')}}
                            .content
                                el-row.item(
                                    v-for='(item,index) in $store.state.Counter.blockList'
                                    :key='index'
                                    @click.native='showList(true,item.blockHeight)'
                                )
                                    //- 标题，同上
                                    el-col(:span='4' )
                                        span {{item.blockHeight}}
                                    el-col(:span='5')
                                        span {{item.date}}
                                    el-col(:span='10')
                                        span {{item.foundryPublicKey}}
                                    el-col(:span='5')
                                        span {{item.totalFee}}
                        .list1-page
                            a.page(@click='prevPage1(0)') {{$t('blocks.prev')}}
                            a.page(@click='prevPage1(1)') {{$t('blocks.next')}}
                    //- 交易流水   
                    //- .list2
                        .list2-tit
                        .list2-content
                            //- 标题
                            el-row.tit
                                //- 日期
                                el-col(:span='8')
                                    span {{$t('blocks.date')}}
                                //- 数目
                                el-col(:span='5')
                                    span {{$t('blocks.amount')}}
                                //- 费用
                                el-col(:span='5')
                                    span {{$t('blocks.fee')}}
                                //- 高度
                                el-col(:span='3')
                                    span {{$t('blocks.height')}}
                                //- 确认
                                el-col(:span='3')
                                    span {{$t('blocks.confirm')}}
                            .content
                                //- 列表
                                el-row.item(
                                    v-for='(item,index) in $store.state.Counter.transactionList'
                                    :key='index'
                                    @click.native='showList(true,item.blockHeight,item.txHash)'
                                )
                                    el-col(:span='8')
                                        span {{item.date}}
                                    el-col(:span='5')
                                        span {{item.amount}}
                                    el-col(:span='5')
                                        span {{item.fee}}
                                    el-col(:span='3')
                                        span {{item.blockHeight}}
                                    el-col(:span='3')
                                        span {{item.confirm}}
                                
                        .list2-page
                            //- 上一页
                            a.page(@click='prevPage2(0)') {{$t('blocks.prev')}}
                            //- 下一页
                            a.page(@click='prevPage2(1)') {{$t('blocks.next')}}
                    .kline(@click="aaa+='script>'")
                        //- h4
                            i.iconfont.icon-hetong
                            span 趋势图
                        chart(:options="polar" :auto-resize="true" @datazoom="ondatazoom")
</template>

<script>
import blockList from './blocklist'
import { getBlockInfo,getBlockListInfo,getTransactionList,getTheTrend } from '@/http/index.js'


export default {
    name:'blocks',
    components:{
        blockList
    },
    data() {
        return {
            ktimer: null,
            polar: {
                grid:{//布局
                    top: 45,
                    // left: 30,
                    height: 200,
                },
                color: ['#1943a6','#2f4554', '#61a0a8'],
                xAxis: {
                    name: this.$t('blocks.time'),
                    type: 'category',
                    boundaryGap: false,
                    // data: [],//x轴坐标点
                    axisLabel: { 
                        show: true, // 默认为true 
                        formatter: function(data) { 
                            // console.log(data)
                            let T = new Date(Number(data));
                            let mon = T.getMonth()+1;
                            let day = T.getDate();
                            let h = T.getHours()>=10?T.getHours():('0'+T.getHours());
                            return mon+'-'+day+' '+h+':00'; 
                        } 
                    } 
                },
                yAxis: {
                    name: this.$t('blocks.totalAmount'),
                    type: 'value',
                    // axisLabel: {//刻度文本
                    //     inside: true,//在里面显示
                    // },
                    // axisTick: {//刻度线
                    //     inside: true//在里面显示
                    // },
                },
                series: [{
                    name: this.$t('blocks.totalAmount'),
                    data: [],//数据值
                    type: 'line',
                    showSymbol: false,//小圆点
                    hoverAnimation: false,//hover的时候的小圆点
                }],
                tooltip: {//提示层
                    trigger: 'axis',
                    padding: [5,10,5,0],
                    formatter: (data)=> { 
                        // console.log(data)
                        let T = new Date(Number(data[0].name));
                        let y = T.getFullYear();
                        let mon = T.getMonth()+1;
                        let day = T.getDate();
                        let h = T.getHours()>=10?T.getHours():('0'+T.getHours());
                        return `<span class="tipHead">${this.$t('blocks.totalAmount')}:</span><span>${data[0].value[1]}</span><br />
                                <span class="tipHead">${this.$t('blocks.time')}:</span><span>${y}-${mon}-${day} ${h}:00</span>
                        `
                    } 
                },
                dataZoom: [
                    {
                        // id: 'dataZoomX',
                        type: 'inside',
                        startValue: null,
                        endValue: null
                    }
                ],
                toolbox: {//工具箱
                    feature: {
                        dataZoom: {//缩放
                            yAxisIndex: 'none'
                        },
                    }
                },
            },
            isFirstTime: true,

            blocksDatas:{},
            page1:1,
            count1:0,
            count2:0,
            page2:1,
            blocksList:[],
            dealList:[],
            timer:null,
            height:0,
            hash:'',
            listShow:false,
            blockLoading:true,
            tranLoading:true,
        }
    },
    mounted() {
        this.getTheTrend();
        this.ktimer = setInterval(()=>{
            this.getTheTrend();
        }, 10000)
        this.getBlockInfo();
        this.timer = setInterval(()=>{
            this.getBlockInfo();
        },10000)
    },
    destroyed() {
        clearInterval(this.ktimer);
        clearInterval(this.timer);
    },
    methods: {
        // 趋势图
        async getTheTrend(){
            try {
                let res = await getTheTrend()
                if(res.data) {
                    this.polar.series[0].data = [];
                    this.polar.series[0].data = JSON.parse(res.data).datas;
                    if(this.isFirstTime) {
                        // 放大显示24小时内的数据
                        let dayAgoTime = Number(new Date()) - 24*60*60*1000;
                        for (let i = this.polar.series[0].data.length-1; i >= 0; i--) {
                            if(dayAgoTime > this.polar.series[0].data[i][0] ){
                                this.polar.dataZoom[0].startValue = i;//开始的数据的下标
                                this.polar.dataZoom[0].endValue = this.polar.series[0].data.length-3;//最后一个数据的下标（我也不知道为什么要-3而不是-1）
                                break;
                            }
                        }
                    }else {
                        // 必须还原
                        this.polar.dataZoom[0].startValue = null;//开始的数据的下标
                        this.polar.dataZoom[0].endValue = null;//最后一个数据的下标
                    }
                }
            }
            catch (e) {
                console.log(e);
            }
        },
        ondatazoom(){
            this.isFirstTime = false;
        },
        async getBlockInfo() { // 获取四个区块信息
            try {
                let res = await getBlockInfo()
                if(res&&res.code == 100) {
                    this.blocksDatas=res.data;
                    this.$store.commit("UPDATE_TOKEN_BLOCK_INFO",res.data);
                    this.getBlockListInfo();
                }else {
                    this.accounts=[];
                }
            }
            catch (e) {
                console.log(e);
            }
        },
        async getBlockListInfo() { // 获取区块列表
            try {
                let res = await getBlockListInfo({
                    pageNumber:this.page1,
                    pageSize:5
                })
                if(res&&res.code==100) {
                    this.$store.commit("UPDATE_TOKEN_BLOCK_LIST",res.data.blockMapList);
                    this.$store.commit("UPDATE_TOKEN_BLOCK_COUNT",res.data.count);
                    this.count1 = res.data.count;
                }else {
                    this.accounts = [];
                }
                this.blockLoading = false;
            }
            catch (e) {
                console.log(e);
            }
        },
        // async getTransactionList() { // 获取交易列表
        //     try {
        //         let res = await getTransactionList({
        //             pageNumber:this.page2,
        //             pageSize:5,
        //             tokenName:'ptn',
        //             address:'all'
        //         })
        //         if(res) {
        //             this.$store.commit("UPDATE_TOKEN_TRANSACTION_LIST",res.data.transactionList);
        //             this.$store.commit("UPDATE_TOKEN_TRANSACTION_COUNT",res.data.count);
        //             this.count2=res.data.count;
        //             this.tranLoading = false;
        //         }else {
                    
        //             this.accounts=[];
        //         }
                
        //     }
        //     catch (e) {
        //         console.log(e);
        //     }
        // },
        showList(bool,height,hash) { // 显示区块详情信息，点击列表每行时触发
            this.listShow=bool;
            if(height) {
                this.height = height;
                this.hash = hash || null;
            }
        },
        prevPage1(type) { // 区块列表翻页
            if(type==0) {
                if(this.page1>1) {
                    this.page1--;
                    this.blockLoading = true;
                    this.getBlockListInfo();
                }
            }else {
                let page = Math.ceil(this.$store.state.Counter.blockCount/5);
                if(this.page1<page) {
                    this.page1++;
                    this.blockLoading = true;
                    this.getBlockListInfo();
                }
            }
        },
        // prevPage2(type) { // 交易列表翻页
        //     if(type==0) {
        //         if(this.page2>1) {
        //             this.page2--;
        //             this.tranLoading = true;
        //             this.getTransactionList();
        //         }
        //     }else {
        //         let page = Math.ceil(this.$store.state.Counter.transactionCount/5);
        //         if(this.page2<page) {
        //             this.page2++;
        //             this.tranLoading = true;
        //             this.getTransactionList();
        //         }
        //     }
        // },
    }
}
</script>

<style lang='scss'>
    @import './blocks';
</style>
