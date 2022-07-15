interface Window {
  /**
   * Electron ContextBridge暴露的原始ipc接口
   */
  electron: ElectronIPC.IPC
  /**
   * Electron 序列化封装后的ipc接口
   */
  eapi: typeof import('../electron')

  // $message: typeof import("naive-ui");
}

  interface Window {
    $message: import('naive-ui').MessageApi
    $dialog: import('naive-ui').DialogApi
    $notification: import('naive-ui').NotificationApi
    $loadingBar: import('naive-ui').LoadingBarApi
  }