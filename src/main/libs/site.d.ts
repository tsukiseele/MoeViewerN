interface Site {
  name: string,
  id: Number,
  version: Number,
  author: string,
  rating: string,
  details: string,
  type: string,
  icon: string,
  headers: Headers
  sections: Sections
}

interface Headers {
  [key: string]: String
}

interface Sections {
  [key: string]: Section,
  home: Section,
  search: Section
}

interface Section {
  index: string
  rules: Rules
  reuse: string
}

interface Rules {}
