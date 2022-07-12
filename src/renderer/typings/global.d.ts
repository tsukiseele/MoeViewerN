interface Window {
  /**
   * Electron ContextBridge暴露的原始ipc接口
   */
  electron: ElectronIPC.IPC
  /**
   * Electron 序列化封装后的ipc接口
   */
  eapi: typeof import('../electron')
}