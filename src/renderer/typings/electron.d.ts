/**
 * Should match main/preload.ts for typescript support in renderer
 */
export default interface ElectronApi {
  ipcRenderer: Electron.IpcRenderer,
  invoke(channel: string, params: any): Promise<any>
  send(channel: string, params: any): void
  requestAsync(params: any, callback: Function): void
  // Window Options
  maximize(): void
  minimize(): void 
  close(): void
}

declare global {
  interface Window {
    electron: ElectronApi,
    $win: ElectronApi
  }
}
