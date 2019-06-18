import { app, BrowserWindow, Menu, ipcMain as ipc, dialog } from 'electron'
import axios from 'axios'

if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}


let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9081`
  : `file://${__dirname}/index.html`


var child_process = require('child_process');
var path=require('path');
import cmd from 'node-cmd'
var processes = [];
var newProcess = null;

const ip = process.env.URL + ':' + process.env.PORT + '/';
const port = process.env.PORT
let draggingAccount = [];//第一个是钱包地址，第二个是密码

function createWindow() { // 创建窗口
  if (process.platform === 'darwin') {
    const template = [
      {
        label: "Application",
        submenu: [
          { label: "Quit", accelerator: "Command+Q", click: function () { app.quit(); } }
        ]
      },
      {
        label: "Edit",
        submenu: [
          { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
          { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
        ]
      }
    ];
    Menu.setApplicationMenu(Menu.buildFromTemplate(template))
  } else {
    // Menu.setApplicationMenu(null)
  }
  mainWindow = new BrowserWindow({
    height: 720,
    useContentSize: true,
    width: 1200,
    minWidth: 1200,
    minHeight: 720
    // frame: false
    // webPreferences: {webSecurity: false},//关闭浏览器安全设置
  })
  mainWindow.loadURL(winURL)
  mainWindow.on('closed', () => { // 关闭事件，触发关闭方法
    exitJava()
  })
  runJava()
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('getAppVersion', app.getVersion())
  })
  mainWindow.webContents.openDevTools(); // 打开开发者工具
}
console.log('appver', app.getVersion())


// 判断系统
ipc.on('getSystem', (event, arg) => {
  console.log(process.platform)
  event.sender.send('system', __dirname)
})

ipc.on('dragging', (event, arg) => { // 锻造事件触发，把锻造的地址给存在变量中
  draggingAccount = arg
})

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  exitJava()
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})


const isSecondInstance = app.makeSingleInstance((commandLine, workingDirectory) => { // 判断是否存在第二个实例
  if (myWindow) {
    if (myWindow.isMinimized()) myWindow.restore()
    myWindow.focus()
  }
})

if (isSecondInstance) { // 如果存在第二个实例则退出
  app.quit()
}

function runJava() { // 启动java进程
  console.log('run java...')
  killJava()
  if (process.platform === 'win32') { // windows下的打开jar包命令
    child_process.exec("cd build && cd jre && cd bin && .\\java -jar photon-chain-interfaces-1.0-SNAPSHOT.jar");
  } else if (process.platform === 'darwin') {
    // mac下的打开jar包 打包成功后，要想运行jar包成功，要将打包程序放在mac 应用程序里面
    child_process.exec('cd  ' + __dirname.split('Contents')[0] + 'mac_jre/Contents/Home/bin && ./java -jar ./photon-chain-interfaces-1.0-SNAPSHOT.jar')
  }
}
function exitJava() { // 退出java进程
  console.log('stopDigging...')
  axios.get(ip + '/FoundryMachineController/stopFoundryMachine.do', {
    params: {
      passWord: draggingAccount[1],
      address: draggingAccount[0]
    }
  }).then(function (response) {
    console.log('response === ', response.data)
    killJava(true);
  }).catch(function (error) {
    console.log('resERR === ', error)
    killJava(true);
  });
}


function killJava(isCloseEvent) { // kill java进程
  console.log('killJava...')
  if (process.platform === 'win32') {
    child_process.exec('netstat  -aon|findstr  "' + port + '"', (err, stdout, stderr) => {
      let temp = stdout.split(/\s+/)
      let javaPid
      for (let i = 0; i < temp.length; i++) {
        if (temp[i] == 'LISTENING') {
          javaPid = temp[i + 1]
          break;
        }
      }
      cmd.get("taskkill /pid " + javaPid + " /f /t", () => {
        if (isCloseEvent) {
          // console.log('kill mainProcess')
          app.quit();
        }
      });
    });
  } else if (process.platform === 'darwin') {
    child_process.exec('lsof -i :' + port, (err, stdout, etderr) => {
      let temp = stdout.split(/\s+/)
      let pid
      for (let i = 0; i < temp.length; i++) {
        if (temp[i] === 'java') {
          pid = temp[i + 1]
        }
      }
      cmd.get("kill -9 " + pid, () => {
        if (isCloseEvent) app.quit();
      })
    })
  } else {
    child_process.exec('netstat  -aon|findstr  "' + port + '"', (err, stdout, stderr) => {
      let temp = stdout.split(/\s+/)
      let javaPid
      for (let i = 0; i < temp.length; i++) {
        if (temp[i] == 'LISTENING') {
          javaPid = temp[i + 1]
          break;
        }
      }
      cmd.get("taskkill /pid " + javaPid + " /f /t", () => {
        if (isCloseEvent) app.quit();
      });
    });
  }
}

