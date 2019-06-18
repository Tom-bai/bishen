const state = {
  address:0,
  tokenState:0,
  nowToken:'ptn',

  blockInfo:[],
  blockList:[],
  transactionList:[],
  transactionCount:0,
  blockCount:0,
  accountList:[],
  accountInfo:{},
}

const mutations = {
  UPDATE_ACCOUNTINFO(state,obj) {
    state.accountInfo = obj;
  },
  UPDATE_ADDRESS(state) {
    state.address++;
  },
  UPDATE_TOKEN(state,token) {
    state.nowToken=token;
  },
  UPDATE_TOKEN_STATE(state) {
    state.tokenState++;
  },
  UPDATE_TOKEN_BLOCK_INFO(state,arr) {
    state.blockInfo = arr;
  },
  UPDATE_TOKEN_BLOCK_LIST(state,arr) {
    state.blockList = arr;
  },
  UPDATE_TOKEN_BLOCK_COUNT(state,count) {
    state.blockCount = count;
  },
  UPDATE_TOKEN_TRANSACTION_LIST(state,arr) {
    state.transactionList = arr;
  },
  UPDATE_TOKEN_TRANSACTION_COUNT(state,count) {
    state.transactionCount = count;
  },
  UPDATE_ACCOUNT_LIST(state,arr) {
    state.accountList = arr;
  }

  // UPDATE_ADDRESS(state) {
  //   state.address++;
  // }
}

const actions = {
  someAsyncTask ({ commit }) {
    // do something async
    commit('INCREMENT_MAIN_COUNTER')
  }
}

export default {
  state,
  mutations,
  actions
}
