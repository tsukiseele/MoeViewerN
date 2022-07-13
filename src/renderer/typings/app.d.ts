
interface ImageMeta extends Meta {
  title?: string
  coverUrl?: string,
  sampleUrl?: string,
  largerUrl?: string,
  originUrl?: string,
  tags?: string,
  _src?: string
}
interface ImageDownloadMeta extends ImageMeta {
  // title?: string
  // coverUrl?: string,
  // sampleUrl?: string,
  // largerUrl?: string,
  // originUrl?: string,
  progress?: Progress,
  // tags?: string,
  // _src?: string
  childTask?: Map<string, ImageDownloadMeta>
}
