import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const route = new Router({
    routes: [
        {
            path: '/',
            // name: 'loading-page',
            component: require('@/components/loading/serverstate').default
        },
        {
            path: '/loading',
            // name: 'loading-page',
            component: require('@/components/loading/loading').default
        },
        {
            path: '/home',
            name: 'home-page',
            component: require('@/components/home/home').default,
            children: [
                {
                    path: 'blocks',
                    component: require('@/components/blocks/blocks').default,
                },
                {
                    path: 'account',
                    component: require('@/components/account/account').default,
                },
                {
                    path: 'account/detail/:address',
                    component: require('@/components/account/detail').default,
                },

                {
                    path: 'account/createContract',//提交合约
                    component: require('@/components/account/contract/createContract').default,
                },
                {
                    path: 'account/contract',//我的合约
                    redirect: 'account/contract/contractExcharge',
                    component: require('@/components/account/contract/myContract/index').default,
                    children: [
                        {
                            path: 'contractExcharge',//兑换
                            component: require('@/components/account/contract/myContract/excharge').default,
                        },
                        {
                            path: 'vote',//投票
                            component: require('@/components/account/contract/myContract/myVote').default,
                        },
                        {
                            path: 'othercoin',//代币
                            component: require('@/components/account/contract/myContract/otherCoin').default,
                        },
                    ]
                },
                {
                    path: 'market/exchange',
                    component: require('@/components/market/exchange').default,
                },
                {
                    path: 'market/vote',
                    component: require('@/components/market/vote').default,
                },
                {
                    path: 'market/othercontracts',
                    component: require('@/components/market/othercontracts').default,
                },
                // {
                //   path: 'coins',
                //   component: require('@/components/coins/coins').default,
                // },
                {
                    path: 'token/alltoken',
                    component: require('@/components/coins/alltoken').default,
                },
                {
                    path: 'token/:tokenName',
                    component: require('@/components/coins/coins').default,
                },
                {
                    path: 'tokendetail/:address/:tokenName',
                    component: require('@/components/account/detail').default,
                },
                {
                    path: 'transaction',
                    component: require('@/components/transaction/transaction').default,
                },
                {
                    path: 'api',
                    component: require('@/components/api/api').default,
                    redirect: 'api/create',
                    children: [
                        {
                            path: 'code',
                            component: require('@/components/api/code').default,
                        },
                        {
                            path: ':page',
                            component: require('@/components/api/page').default,
                        }
                    ]
                },
            ]
        },
        {
            path: '*',
            redirect: '/'
        }
    ]
})

route.afterEach((to,from)=>{
    console.log(to.path)
})


export default route;


