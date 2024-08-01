import Configstore from 'configstore'
import os from 'node:os'

const homedir = os.homedir()
const storage = new Configstore('zapcli', { 'accessToken': null, 'user': null }, { configPath: homedir + '/.zp/zpstorage.json' })

export default storage