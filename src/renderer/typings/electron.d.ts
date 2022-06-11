/**
 * Should match main/preload.ts for typescript support in renderer
 */
export default interface ElectronApi {
  io: IO
  ipcRenderer: any //Electron.IpcRenderer,
  invoke(channel: string, params: any): Promise<any>
  send(channel: string, params: any): void
  requestAsync(params: any, callback: Function): void
  // Window Options
  maximize(): void
  minimize(): void 
  close(): void
}

interface IO {
  writeFile(path: string, blob: { type: string, data: string }): Promise<Boolean>
}

declare global {
  interface Window {
    electron: ElectronApi,
    $win: ElectronApi
  }
}
