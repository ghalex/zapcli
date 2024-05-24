import clc from 'cli-color'
import ora from 'ora'
import Axios, { type AxiosInstance } from 'axios'

export default (config: any) => {

  const axios: AxiosInstance = Axios.create({
    baseURL: config.apiUrl ?? 'https://zapant.com/api',
    timeout: 80000,
    headers: {
      'Content-Type': 'application/json'
    }
  })

  /**
   * Login to zapant.com
   * @param email 
   * @param password 
   * @returns 
   */
  const login = (email: string, password: string) => {
    const spinner = ora('Authenticating with credentials on zapant.com')

    // spinner.prefixText = clc.bgCyan('[info]');
	  spinner.spinner = 'circleHalves';
    spinner.color = 'green'
    spinner.start()

    return axios.post('/auth/login', { email, password, strategy: 'local' })
      .then(res => res.data)
      .then(data => {
        spinner.succeed()
        // spinner.clearLine(process.stdout)
        console.log(`${clc.green('✔ Success: ')} Login was successfull`)
        console.log(`${clc.green('✔ User: ')} ${data.user.name} (${data.user.email})`)

        return data
      })
      .catch(err => {
        spinner.fail()

        if (err.response?.data) {
          console.log(`${clc.red('✖ Error: ')} ${err.response.data.message}.`)
          console.log(`${clc.red('✖')} Login ${clc.red('failed')}`)

          return null
        }

        console.log(`${clc.red('✖ Error: ')} Something went wrong.`)
        return null

      })
  }

  return { login }
}