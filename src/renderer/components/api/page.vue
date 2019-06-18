<template lang='pug'>
    .page
        h3.title {{pageData.name}}
        .group
            h5 {{$t('api.url')}}：
            el-alert(type='info' :closable="false" :title='pageData.api') 
        .group
            h5 {{$t('api.type')}}：：{{pageData.method}}
        .group
            h5 {{$t('api.params')}}：
            el-table(style="width: 100%" :data="pageData.params")
                el-table-column(prop="name" :label="$t('api.name')")
                el-table-column(prop="required" :label="$t('api.isRequired')" )
                el-table-column(prop="type" :label="$t('api.type')")
                el-table-column(:label="$t('api.remark')")
                    template(slot-scope="scope") {{scope.row[lang+'Remark']}}
        .group
            h5 {{$t('api.curlexample')}}：
            // pre.code
            p {{pageData.curl}}
        .group
            h5 {{$t('api.example')}}：
            pre.code
                code {{pageData.back}}

                    


</template>

<script>
import info from './apis/api.js'
export default {
    mounted() {
        this.pageData= info[this.$route.params.page]
    },
    updated() {
        
    },
    data() {
        return {
            lang:localStorage.getItem('lang'),
            pageData: []
        }
    },
    methods:{
        fetchDate() {
            this.pageData= info[this.$route.params.page]
        }
    },
    watch: {
        // 如果路由有变化，会再次执行该方法
        "$route": "fetchDate"
    }
}
</script>

<style lang='scss'>
    @import './page.scss';
</style>
