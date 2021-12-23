import React from 'react'
import { NavBar } from '../components/NavBar'
import { withUrqlClient } from 'next-urql'
import { createURQLCient } from '../utils/createURQLClient'
import { usePostsQuery } from '../generated/graphql'

const Index = () => {
  const [{ data }] = usePostsQuery()
  return (
    <>
      <NavBar />
      <div>Hello World</div>
      <br />
      {!data ? (
        <div>Loading...</div>
      ) : (
        data.posts.map((post) => <div key={post.id}>{post.title}</div>)
      )}
    </>
  )
}

export default withUrqlClient(createURQLCient, { ssr: true })(Index)
