import Configstore from 'configstore'
import os from 'node:os'

const homedir = os.homedir()
const storage = new Configstore('zplang', { 'accessToken': null, 'user': null }, { configPath: homedir + '/.zp/zpstorage.json' })

export default storage