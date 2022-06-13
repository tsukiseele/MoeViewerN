interface Site {
  name: string,
  id: number,
  version: number,
  author: string,
  rating: string,
  details: string,
  type: string,
  icon: string,
  headers: Headers
  sections: Sections
}

interface Headers {
  [key: string]: string
}

interface Sections {
  [key: string]: Section,
  home: Section,
  search: Section
}

interface Section {
  index: string
  reuse: string
  rules: Rules
}

interface Rules {}

interface Meta {
  $children?: Meta[],
  $site?: Site
  $section?: Section
}