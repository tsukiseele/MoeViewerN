
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
  progress?: Progress,
  childTask?: Map<string, ImageDownloadMeta>
}
