const native = {}
window.$native && Object.entries(window.$native).forEach(([k, v]) => typeof v == 'function' && (native[k] = async (params) => {
  const result = await v(JSON.stringify(params))
  try {
    return result ? JSON.parse(result) : result
  } catch (error) {
    return result
  }
}))
export default native
