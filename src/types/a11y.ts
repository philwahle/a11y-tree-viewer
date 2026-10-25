export type RoleSource = 'native' | 'explicit' | 'none'
export type RoleCategory = 'land' | 'act' | 'str' | 'live' | 'exp' | 'none'
export type Layout = 'vertical' | 'side' | 'tabs'

export interface RoleInfo {
  role: string | null
  source: RoleSource
}

export interface NameInfo {
  name: string
  src: string
}

export type States = Record<string, string>

export interface AttrPair {
  name: string
  val: string
}

export interface A11yNode {
  tag: string
  roleInfo: RoleInfo
  nameInfo: NameInfo
  states: States
  warns: string[]
  children: A11yNode[]
  attrs: AttrPair[]
}
