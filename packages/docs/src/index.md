[basic]: https://dewfall123.github.io/ahooks-vue/zh/use-request/
[axios]: http://axios-js.com/zh-cn/

# withRequest

:::info useRequest 创建器
一个`高阶函数`基于 ahooks-vue 的[useRequest][basic]进行封装，根据传入配置项对基于 http 请求碧斯后端接口返回的数据结构([axios][axios])进行处理。
:::

## Demo

### 如何使用

::: demo 可以切换选择下拉框中的不同选项后，再点击`请求`按钮，以查看不同的结果

```vue
<template>
  <div>
    <ElSelect v-model="status">
      <ElOption
        v-for="item in dict"
        :key="item.value"
        :value="item.value"
        :label="item.label"
      ></ElOption>
    </ElSelect>
    <ElButton class="ml-20" type="primary" @click="run" :loading="loading">
      请求
    </ElButton>
    <div>data:{{ data }}</div>
    <div>error:{{ error }}</div>
  </div>
</template>

<script>
import { withRequest } from '@demo/hooks'
import { ElMessage } from 'element-plus'
import { reactive, toRefs, defineComponent, onBeforeMount } from 'vue'

export default defineComponent({
  setup() {
    const state = reactive({
      status: 1,
      dict: [
        { label: '正常', value: 1 },
        { label: '401', value: 2 },
        { label: '业务异常', value: 3 }
      ]
    })
    // mock数据，与真实经过axios调用后端接口返回的数据结构完全一致。
    const queryMockBanner = () => {
      // 基于axios 进行处理
      const mock = {
        // 后端返回的真实数据
        data: {
          // 业务异常
          status: state.status === 3 ? 99999 : 10000,
          message: state.status === 3 ? '您没有权限查看该数据' : '成功',
          data: {
            id: 113,
            title:
              state.status === 3 ? '您没有权限查看该数据' : 'AUtoTest在运行',
            sort: 2,
            mainPic:
              'http://imgs.qqingsong.com/default/325510/c99df2e5a2104502b88d5d9517ed42f1.jpg',
            state: 1,
            linkType: 2,
            linkValue: '',
            bizType: 1,
            createdAt: 1635155165000,
            updatedAt: 1635155165000
          }
        },
        // 401
        status: state.status === 2 ? 401 : 200,
        statusText: 'OK',
        headers: {
          'access-control-allow-origin': '*',
          connection: 'close',
          'content-encoding': 'gzip',
          'content-type': 'application/json;charset=UTF-8',
          date: 'Mon, 01 Nov 2021 03:17:36 GMT',
          'strict-transport-security': 'max-age=15724800; includeSubDomains',
          'transfer-encoding': 'chunked',
          vary: 'Accept-Encoding'
        },
        config: {
          url: '/web/slideshow/getById',
          method: 'get',
          headers: {
            Accept: 'application/json, text/plain, */*',
            token:
              '65a0db68267dce6614d6cc0d86a8f4a6.36ae8378fbfbd3305b652aa8f78d1919'
          },
          params: {
            id: '113'
          },
          baseURL: '/api',
          transformRequest: [null],
          transformResponse: [null],
          timeout: 6000,
          xsrfCookieName: 'XSRF-TOKEN',
          xsrfHeaderName: 'X-XSRF-TOKEN',
          maxContentLength: -1,
          maxBodyLength: -1,
          transitional: {
            silentJSONParsing: true,
            forcedJSONParsing: true,
            clarifyTimeoutError: false
          }
        },
        request: {}
      }
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          state.status === 2 ? reject(mock) : resolve(mock)
        }, 300)
      })
    }
    // 除了rightBusinessStatus（具体的code值根据不同的业务项目决定）中定义的code外，其余的code都认为是业务异常
    const rightBusinessStatus = [10000, 10001]
    const onBusinessError = (message) => ElMessage.error(message)
    const onRequestError = (d) => {
      console.error('记录日志~~~~~：', d.status)
    }
    
    const requests = reactive({
      data: [], run: () => {}, loading: false, error: null
    })

    onBeforeMount(() => {
      // 此处因为vitepress 不能在beforeMount和mounted之外使用dom api
      const useRequest = withRequest({
        rightBusinessStatus,
        onBusinessError,
        onRequestError
      })

      const { data, run, loading, error } = useRequest(queryMockBanner, {
        manual: true,
        onSuccess() {
          ElMessage.success('查询成功')
        }
      })
      
      requests.data = data
      requests.run = run
      requests.loading = loading
      requests.error = error
    })

    // const useRequest = withRequest({
    //   rightBusinessStatus,
    //   onBusinessError,
    //   onRequestError
    // })
    //
    // const { data, run, loading, error } = useRequest(queryMockBanner, {
    //   manual: true,
    //   onSuccess() {
    //     ElMessage.success('查询成功')
    //   }
    // })

    // return { ...toRefs(state), run, loading, data, error }
    return { ...toRefs(state), ...toRefs(requests) }
  }
})
</script>
<style scoped lang="scss">
.ml-20 {
  margin-left: 20px;
}
</style>
```

:::

### 业务项目中的封装和使用（`引用自keni项目`）

> 基于基础数据格式的封装 `useRequest`

```js
import { withRequest } from '@demo/hooks'
import { ElMessage } from 'element-plus'
import router from '../router'
import store from '../store'

const rightBusinessStatus = [200]
const onError = (message) => ElMessage.error(message)

const useRequest = (fn, options) => {
  const useBasicRequest = withRequest({
    rightBusinessStatus,
    onBusinessError: onError,
    onRequestError: (d) => {
      if (d?.status === '401') {
        setTimeout(() => {
          store.dispatch('logout')
          router.replace('/login')
        }, 300)
      }
    }
  })

  return useBasicRequest(fn, options)
}

export default useRequest
```

> 基于约定的分页格式的封装:`usePaginationRequest`

```js
import { computed } from 'vue'
import useRequest from './useRequest'

const usePaginationRequest = (fn, options) => {
  const ret = useRequest(fn, options)
  const { loading, error, data, params, lastSuccessParams } = ret
  const { run, cancel, refresh } = ret

  const nextData = computed(() => data.value?.records)
  const total = computed(() => data.value?.total)

  return {
    data: nextData,
    total,
    run,
    params,
    lastSuccessParams,
    cancel,
    refresh,
    loading,
    error
  }
}
export default usePaginationRequest
```
