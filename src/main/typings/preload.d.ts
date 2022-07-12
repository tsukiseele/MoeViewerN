// import { ElectronIPC } from '../preload'

interface Win {
  minimize(): void
  maximize(): void
  close(): void
}
interface IO {
  writeFile(path: string, blob: any): Promise<boolean>
  writeClipboardText(text: string): Promise<boolean>
}
interface DB {
  initSQLite(): Promise<boolean>
}
interface Http {
  requestAsync(params: any, callback: Function): Promise<void>
}
interface ElectronIPC {
  ipcRenderer: typeof ipcRenderer
  invoke: typeof ipcRenderer.invoke
  send: typeof ipcRenderer.send
  requestAsync: Http.requestAsync
  net: Net
  win: Win,
  io: IO,
  db: DB
}

interface Progress {
  uuid?: string
  total?: number
  current: number
  progress: number
  done: boolean
  response?: { data: string; type: string }
}
