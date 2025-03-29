import { type FlussrConfig } from 'flussr/config'
const config: FlussrConfig = {
  rspack({ isServer }) {
    return (config) => {
      console.log(config, isServer)
      return config
    }
  }
}
export default config
