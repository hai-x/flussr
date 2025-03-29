export type Manifest = {
  js: string[]
  css: string[]
}
export type Manifests = {
  clientManifest: Record<string, Manifest>
  serverManifest: Record<string, Manifest> & {
    __flussr_server_bundle_context: string
  }
}
