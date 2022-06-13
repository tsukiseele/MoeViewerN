interface Progress {
  uuid?: string
  total?: number
  current: number
  progress: number
  done: boolean
  response?: { data: string, type: string }
}