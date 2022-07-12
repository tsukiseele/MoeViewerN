/**
 * Should match main/preload.ts for typescript support in renderer
 */
export default interface ElectronApi {
  io: IO
  db: DB
  win: Win
  ipcRenderer: any //Electron.IpcRenderer,
  invoke(channel: string, params?: any): Promise<any>
  send(channel: string, params?: any): void
  requestAsync(params: any, callback: (p: Progress) => void): void
  // Window Options
  maximize(): void
  minimize(): void 
  close(): void
}

export interface IO {
  writeFile(path: string, base64: string ): Promise<Boolean>
  writeClipboardText(text: string): Boolean
}

export interface DB {
  initSQLite(): Promise<Boolean>
}

export interface Win {
  initSQLite(): Promise<Boolean>
}