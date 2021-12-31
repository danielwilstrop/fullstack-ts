import {
  LoginMutation,
  MeQuery,
  MeDocument,
  RegisterMutation
} from '../generated/graphql'
import { fetchExchange, dedupExchange } from 'urql'
import { cacheExchange, Cache, QueryInput } from '@urql/exchange-graphcache'
import { pipe, tap } from 'wonka'
import { Exchange } from 'urql'
import Router from 'next/router'

export const errorExchange: Exchange =
  ({ forward }) =>
  (ops$) => {
    return pipe(
      forward(ops$),
      tap(({ error }) => {
        if (error?.message.includes('not logged in')) {
          Router.replace('/login')
        }
      })
    )
  }

function updatedQuery<Result, Query>(
  cache: Cache,
  qi: QueryInput,
  result: any,
  fn: (r: Result, q: Query) => Query
) {
  cache.updateQuery(qi, (data) => fn(result, data as any) as any)
}

export const createURQLCient = (ssrExchange: any) => ({
  url: 'http://localhost:4000/graphql',
  fetchOptions: {
    credentials: 'include' as const
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
    errorExchange,
    ssrExchange,
    fetchExchange
  ]
})
