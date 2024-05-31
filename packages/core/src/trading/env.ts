import zpAssets from './assets'
import zpCore from './core'
import zpTrade from './trade'
import zpIndicators from './indicators'
import { env } from 'process'

const createEnv = (bars: any) => {
  const env = {
    bars,
    settings: {},
    stdout: [] as string[],
  }

  return {
    ...env,
    ...zpCore(env),
    ...zpAssets(env),
    ...zpTrade(env),
    ...zpIndicators(env)
  }
}

export default createEnv