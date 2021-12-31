import React from 'react'
import { withUrqlClient } from 'next-urql'
import { createURQLCient } from '../utils/createURQLClient'
import { usePostsQuery } from '../generated/graphql'
import { Layout } from '../components/Layout'
import { Link } from '@chakra-ui/react'
import NextLink from 'next/link'

const Index = () => {
  const [{ data }] = usePostsQuery()
  return (
    <Layout>
      <NextLink href='/create-post'>
        <Link>Create Post</Link>
      </NextLink>
      <div>Hello World</div>
      <br />
      {!data ? (
        <div>Loading...</div>
      ) : (
        data.posts.map((post) => <div key={post.id}>{post.title}</div>)
      )}
    </Layout>
  )
}

export default withUrqlClient(createURQLCient, { ssr: true })(Index)
