import { ChakraProvider } from '@chakra-ui/react'
import { Provider, createClient, fetchExchange, dedupExchange } from 'urql'
import { cacheExchange, Cache, QueryInput } from '@urql/exchange-graphcache'
import React from 'react'
import theme from '../theme'
import {
  LoginMutation,
  MeDocument,
  MeQuery,
  RegisterMutation
} from '../generated/graphql'

function updatedQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  cache.updateQuery(qi, (data) => fn(result, data as any) as any)
}

const client = createClient({
  url: 'http://localhost:4000/graphql',
  fetchOptions: {
    credentials: 'include'
  },
  exchanges: [
    dedupExchange,
    cacheExchange({
      updates: {
        Mutation: {
          logout: (_result, _, cache, __) => {
            updatedQuery<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              () => ({ me: null })
            )
          },
          login: (_result, _, cache, __) => {
            updatedQuery<LoginMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.login.errors) {
                  return query
                } else {
                  return {
                    me: result.login.user
                  }
                }
              }
            )
          },

          register: (_result, _, cache, __) => {
            updatedQuery<RegisterMutation, MeQuery>(
              cache,
              { query: MeDocument },
              _result,
              (result, query) => {
                if (result.register.errors) {
                  return query
                } else {
                  return {
                    me: result.register.user
                  }
                }
              }
            )
          }
        }
      }
    }),
    fetchExchange
  ]
})

function MyApp({ Component, pageProps }): any {
  return (
    <Provider value={client}>
      <ChakraProvider resetCSS theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </Provider>
  )
}

export default MyApp
