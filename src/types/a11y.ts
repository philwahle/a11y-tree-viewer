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

export interface DescInfo {
  description: string
  src: string
}

export interface SpecRef {
  label: string
  url: string
}

/**
 * used: this source provides the result. unset: not present. empty: present,
 * but provides no text. outranked: has a value but a stronger source won.
 * ignored: has a value but may not be used here.
 */
export type StepStatus = 'used' | 'unset' | 'empty' | 'outranked' | 'ignored'

/** One node of the recursive text computation (AccName 2B–2I). */
export interface Contribution {
  label: string
  via: string
  text: string
  children: Contribution[]
  /** Block-level content is separated from its neighbours by a space. */
  spaced?: boolean
}

export interface Step {
  source: string
  status: StepStatus
  value: string
  note: string
  contributions?: Contribution[]
  ref?: SpecRef
}

export interface NameTrace {
  rule: SpecRef
  prohibited: { role: string; ref: SpecRef } | null
  steps: Step[]
}

export type States = Record<string, string>

export interface AttrPair {
  name: string
  val: string
}

export interface A11yNode {
  /** Position in the tree, e.g. "0.2", stable across re-parsing the same HTML. */
  path: string
  tag: string
  roleInfo: RoleInfo
  nameInfo: NameInfo
  nameTrace: NameTrace
  descInfo: DescInfo
  descSteps: Step[]
  states: States
  warns: string[]
  children: A11yNode[]
  attrs: AttrPair[]
}
