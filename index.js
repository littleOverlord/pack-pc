'use strict';
const fs = require('fs');

const { app, BrowserWindow, dialog, ipcMain } = require('electron')
/****************** 本地 ******************/

// 保持对window对象的全局引用，如果不这么做的话，当JavaScript对象被
// 垃圾回收的时候，window对象将会自动的关闭
let wins = [],
  cfg = {
    "debug": false
  };
//打开新窗口
const createWindow = (index,dir) => {
  
  // 创建浏览器窗口。
  const win = new BrowserWindow({ width: 750, height: 1334 , id: dir?"child":"main"})

  // 然后加载应用的 index.html。
  win.loadFile(index)

  // 打开开发者工具
  if(cfg.debug){
    win.webContents.openDevTools();
  }
  // 当 window 被关闭，这个事件会被触发。
  win.on('closed', () => {
    // 取消引用 window 对象，如果你的应用支持多窗口的话，
    // 通常会把多个 window 对象存放在一个数组里面，
    // 与此同时，你应该删除相应的元素。
    wins.splice(wins.indexOf(win),1);
    console.log("wins.length = ",wins.length);
    if(wins.length == 1){
      wins[0].show();
      // wins[0].reload();
    }
  })
  wins.push(win);
}
const createWindows = (arrs) => {
  if(wins.length == 1){
    console.log("close main window");
    //关闭主窗体
    wins[0].hide();
  }
  for(let i = 0, len = arrs.length; i < len; i++){
    createWindow("./src/child.html",arrs[i]);
    projects.data.splice(0,0,arrs[i]);
  }
  if(projects.data.length > 10){
    projects.data.length = 10;
  }
  writeProjects();
  
}
//响应渲染进程请求
const responseRequest = {
  getCfg : (event)=>{
    event.returnValue = cfg;
  }
}

/****************** 立即执行 ******************/
// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。
app.on('ready', function(){
  createWindow("./src/pc.html");
  
})

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // 在macOS上，当单击dock图标并且没有其他窗口打开时，
  // 通常在应用程序中重新创建一个窗口。
  if (wins.length === 0) {
    createWindow("./src/pc.html")
  }
})

//监听渲染进程打开新文件夹的消息
ipcMain.on('request', (event, arg) => {
  console.log(arg) // prints "ping"
  let args = arg.split("&");
  console.log(args);
  responseRequest[args[0]](event,args[1]);
})
