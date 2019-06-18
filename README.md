# 光子钱包说明
```
分支 zxhuan-v2 目前为最新
```
#### 项目说明
项目现阶段功能基本完成，如果光子后端有做新的修改，则前端这边需要配合进行修改

#### 第一次安装
注意事项：尽量使用npm安装，cnpm在根据依赖下载chromium内核包时可能会出现不可预知的错误，如果npm下载慢，可以把npm的镜像地址设置为淘宝镜像（`不要直接使用cnpm`）：
``` bash
# 设置npm镜像为淘宝镜像
npm config set registry https://registry.npm.taobao.org/

# 设置electron镜像为淘宝镜像
npm config set electron_mirror http://npm.taobao.org/mirrors/electron/
```

``` bash
# 安装依赖包
npm install

# 启动开发环境
npm run dev

# 生成应用（所有平台）
npm run build

# 生成windows应用，32和64位的
npm run build:win32
PS:
    1.打包前——需要注意，查看相关进程有没有开启，如果在开启的情况下而且build目录下也有相应的应用包的话，会造成打出来的包依然保留着之前版本的内容（无修改），所以必须要确保build目录下没有应用包的情况下再进行打包。
    2.打包之后——会生成相应的文件夹，需把jre文件（jar包运行环境）放到应用启动文件PTN.exe同级，并要把jre/bin/photon_chain文件夹（后端数据库）删除；
    3.后端jar包会安置在jre/bin/目录下
    4.安装包制作工具—— Inno Setup（已在build/目录下生成了一个配置文件，安装Inno Setup之后可以直接双击iss配置文件进行安装包的生成，该配置是64位win的配置，32位的可以在上面做相关修改），具体使用方法可参考https://www.cnblogs.com/deng-c-q/p/8309813.html

# 生成Mac应用，需在mac系g'i统下打包
npm run build:darwin
PS:
    1.打包前——需要注意，查看相关进程有没有开启，如果在开启的情况下而且build目录下也有相应的应用包的话，会造成打出来的包依然保留着之前版本的内容（无修改），所以必须要确保build目录下没有应用包的情况下再进行打包。
    2.打包完之后会生成相应的文件夹，需把mac_jre文件（jar包运行环境）放到应用启动文件PTN.app/contents同级目录下（右击打开包内容），并要把mac_jre/bin/photon_chain文件夹（后端数据库）删除；
    3.后端jar包会安置在mac_jre/bin/目录下

```


---

### 1.项目的架构

##### 1.1 进程
> 主要分为2个进程，主进程（src/main）,渲染进程（src/renderer）

- 1.主进程main主要用于应用配置以及管理进程的(如开启子进程打开jar包等)
- 2.渲染进程renderer主要用于编辑和渲染页面

##### 1.2 webpack的配置
> 会分成3个独立的config模块，分别是main，renderer，web

- 1.`main.config`是`src/main`目录的配置文件；
- 2.`renderer.config`是`src/renderer`目录的配置文件；
- 3.`web.config`应该是`生成web`应用时候所需要的配置文件；
- 4.`全局变量`需要在`相关的config`文件下使用webpack.DefinePlugin插件进行生成

### 2.项目组件功能及相关数据接口说明

##### 2.0 主进程中的事件
> 程序在启动中，首先运行主进程中的事件

- 1.先检查7877端口是否被占用，直接kill掉
- 2.启动jar包
- 3.关闭窗口时再次kill掉7877端口的占用

##### 2.1 loading/serverstate.vue 服务器连接页
> 这个是判断服务器是否连接和检查是否有新版本的页面

- 1.根据官网文档拿到当前版本：http://photonchain.vip/version.txt
- 2.根据同步状态接口`getsyncBlockSchedule.do`，拿到是否连接成功java服务器
- 3.同步接口有数据返回，则跳转到loading/loading.vue组件

##### 2.2 loading/loading.vue 加载页
> 这个是判断区块同步状态的页面

- 1.轮询`getsyncBlockSchedule.do`和`getNodeState.do`，前者获取区块同步状态，并显示成百分比，
后者获取状态，均为1时，可以进入钱包
- 2.点击中文或者英文选项可以切换中英文

##### 2.3 home 全局导航组件
> 这个组件包含了路由视图和nav的信息

- 1.home.vue 获取总额和账户信息并存储在store里
- 2.public/nav.vue 获取服务端连接状态与锻造状态


##### 2.4 blocks 区块页面
> 这个页面是获取`区块四个信息` `区块列表` `交易列表`的页面

- 1.轮询`getBlockInfo.do`、`getBlockListInfo.do`和`getTransactionList.do`
- 2.getBlockInfo.do：获取左侧四个信息
- 3.getBlockListInfo.do：获取区块信息（存储在store里存储）
- 4.getTransactionList.do：获取区块信息（存储在store里存储）
- 5.blocks/blocklist.vue：区块详细信息

##### 2.5 account 账户页面
> 这个页面展示了自己的所有账户并提供添加、导入钱包和提交、查看合约

- 1.账户信息从store中获取（getTotalBalance.do）
- 2.点击查看详情跳转至detail.vue
- 3.点击提交合约进入/contract/contract.vue
- 4.点击我的合约进入/contract/detail.vue

##### 2.6 coins 代币页面
> 这个页面用于发行代币和添加代币，页面与账户一致，钱包地址与ptn是一样的，每个地址可以存储多种代币

- 1.点击添加Token可以发布新的代币
- 2.点击发行Token可以进入Token列表进行自选

##### 2.7 transaction 交易页面

