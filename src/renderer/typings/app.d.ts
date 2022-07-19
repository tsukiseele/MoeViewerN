/**
 * 图片元数据
 */
interface ImageMeta extends Meta {
  title?: string
  coverUrl?: string,
  sampleUrl?: string,
  largerUrl?: string,
  originUrl?: string,
  tags?: string,
  _src?: string,
}
/**
 * 下载任务
 */
interface DownloadTask {
  progress?: Progress,
  childTask?: Map<string, ImageDownloadMeta>
}
/**
 * 下载任务视图
 */
interface DownloadTaskView extends DownloadTask {
  cover?: string,
  isExpand?: boolean
}
/**
 * 图片下载元数据
 */
interface ImageDownloadMeta extends ImageMeta, DownloadTaskView {

}
