import { Box, Button, Flex, Link } from '@chakra-ui/react'
import { useLogoutMutation, useMeQuery } from '../generated/graphql'
import { capitalise } from '../utils/capitalise'
import React from 'react'
import NextLink from 'next/link'

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({}) => {
  const [{ data, fetching }] = useMeQuery()
  const [{ fetching: logoutFetching }, logout] = useLogoutMutation()

  let body = null

  //date loading
  if (fetching) {
    //user not logged in
  } else if (!data?.me) {
    body = (
      <>
        <NextLink href='/login'>
          <Link mr={2} color='white'>
            Login
          </Link>
        </NextLink>
        <NextLink href='/register'>
          <Link mr={2} color='white'>
            Register
          </Link>
        </NextLink>
      </>
    )
    //user logged in
  } else {
    body = (
      <Flex>
        <Box>{capitalise(data.me.username)}</Box>
        <Button
          ml={4}
          variant='link'
          onClick={() => logout()}
          isLoading={logoutFetching}>
          Log Out
        </Button>
      </Flex>
    )
  }

  return (
    <Flex bg='tan' p={4}>
      <Box ml={'auto'}>{body}</Box>
    </Flex>
  )
}
