import { useRequest } from 'ahooks-vue'

const withRequest = (opt = {}) => {
  const { rightBusinessStatus = [200], onRequestError, onBusinessError } = opt

  const withFormat = (customFormat) => (res) => {
    const d = res.data || {}
    const { status, message, data } = d

    if (rightBusinessStatus.includes(status)) {
      return typeof customFormat === 'function' ? customFormat(data) : data
    }

    if (onBusinessError) {
      onBusinessError(message, d)
    }
    throw d
  }

  return (fn, options = {}) => {
    const { formatResult, onError = onRequestError } = options

    return useRequest(fn, {
      ...options,
      formatResult: withFormat(formatResult),
      onError
    })
  }
}

export default withRequest
