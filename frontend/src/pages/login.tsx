import React from 'react'
import { Formik, Form } from 'formik'
import { Box, Button, Flex, Link } from '@chakra-ui/react'
import Wrapper from '../components/wrapper'
import { InputField } from '../components/InputField'
import { useLoginMutation } from '../generated/graphql'
import { toErrorMap } from '../utils/toErrorMap'
import { useRouter } from 'next/router'
import { withUrqlClient } from 'next-urql'
import { createURQLCient } from '../utils/createURQLClient'
import NextLink from 'next/link'

const Login: React.FC<{}> = ({}) => {
  const [, login] = useLoginMutation()
  const router = useRouter()

  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ usernameOrEmail: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await login(values)
          if (response.data?.login.errors) {
            setErrors(toErrorMap(response.data.login.errors))
          } else if (response.data?.login.user) {
            if (typeof router.query.next === 'string') {
              router.push(router.query.next)
            } else {
              router.push('/')
            }
          }
        }}>
        {(props) => (
          <Form>
            <InputField
              name='usernameOrEmail'
              placeholder='Username or email'
              label='Username Or Email'
            />
            <Box mt={4}>
              <InputField
                name='password'
                placeholder='Password'
                label='Password'
                type='password'
              />
            </Box>
            <Box mt={2}>
              <Flex style={{ color: 'red' }}>
                <NextLink href='/forgot-password'>
                  <Link ml={'auto'}> Forgotten Password?</Link>
                </NextLink>
              </Flex>
            </Box>

            <Button
              mt={4}
              type='submit'
              colorScheme='teal'
              isLoading={props.isSubmitting}>
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  )
}

export default withUrqlClient(createURQLCient)(Login)
