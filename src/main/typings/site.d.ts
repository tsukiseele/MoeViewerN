interface Site {
  name: string
  id: number
  version: number
  author: string
  rating: string
  details: string
  type: string
  icon: string
  headers: Headers
  sections: Sections
}

interface Headers {
  [key: string]: string
}

interface Sections {
  [key: string]: Section
  home: Section
  search: Section
}

interface Section {
  index: string
  reuse: string
  name?: string
  detail?: string
  rules: Rules
}

interface Rules {
  [key: string]: Selector
  $children: ChildrenNode
}

interface ChildrenNode extends Selector {
  flat?: boolean,
  rules: Rules
}

interface Selector {
  selector: string
  regex: string,
  capture?: string
  replacement?: string
}

interface Meta {
  children?: Meta[]
  $children?: string
  $site?: Site
  $section?: Section
}
