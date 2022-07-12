import ElectronApi from './electron'

declare global {
  interface Window {
    electron: ElectronIPC,
  }
}