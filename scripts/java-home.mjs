import { existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'

const BREW_21 = '/opt/homebrew/opt/openjdk@21/libexec/openjdk.jdk/Contents/Home'

export function envWithJava21() {
  const env = { ...process.env }
  let home = existsSync(`${BREW_21}/bin/java`) ? BREW_21 : ''
  if (!home) {
    try {
      home = execFileSync('/usr/libexec/java_home', ['-v', '21'], { encoding: 'utf8' }).trim()
    } catch {
      home = ''
    }
  }
  if (!home) {
    console.error('Java 21+ is required for the Firestore emulator (system java is still 17).')
    console.error('Install with: brew install openjdk@21')
    process.exit(1)
  }
  env.JAVA_HOME = home
  env.PATH = `${home}/bin:${env.PATH ?? ''}`
  return env
}
