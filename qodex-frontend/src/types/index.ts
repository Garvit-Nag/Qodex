// Global types for the application
export interface User {
  id: string
  name: string
  email: string
}

export interface Repository {
  id: string
  name: string
  owner: string
  description?: string
  url: string
}

export interface QueryResult {
  id: string
  query: string
  results: CodeMatch[]
  timestamp: string
}

export interface CodeMatch {
  file: string
  line: number
  content: string
  context: string[]
}