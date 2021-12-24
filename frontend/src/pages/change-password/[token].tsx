import { Box, Button, Flex, Link } from '@chakra-ui/react'
import { Formik, Form } from 'formik'
import { NextPage } from 'next'
import router from 'next/router'
import { InputField } from '../../components/InputField'
import Wrapper from '../../components/wrapper'
import { toErrorMap } from '../../utils/toErrorMap'
import { useChangePasswordMutation } from '../../generated/graphql'
import { useState } from 'react'
import { withUrqlClient } from 'next-urql'
import { createURQLCient } from '../../utils/createURQLClient'
import NextLink from 'next/link'

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  const [, changePassword] = useChangePasswordMutation()
  const [tokenError, setTokenError] = useState('')
  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ newPassword: '', confirmPassword: '', token: token }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            newPassword: values.newPassword,
            confirmPassword: values.confirmPassword,
            token: values.token
          })
          if (response.data?.changePassword.errors) {
            const errorMap = toErrorMap(response.data.changePassword.errors)
            if ('token' in errorMap) {
              setTokenError(errorMap.token)
            }
            setErrors(errorMap)
          } else if (response.data?.changePassword.user) {
            //worked
            router.push('/')
          }
        }}>
        {(props) => (
          <Form>
            <InputField
              name='newPassword'
              placeholder='New Password'
              label='New Password'
              type='password'
            />
            {tokenError && (
              <Flex style={{ color: 'red', flexDirection: 'column' }}>
                <Box mt={2} mb={2}>
                  {tokenError}
                </Box>
                <Box>
                  <NextLink href='/forgot-password'>
                    <Link> Click here to get a new one</Link>
                  </NextLink>
                </Box>
              </Flex>
            )}
            <Box mt={4}>
              <InputField
                name='confirmPassword'
                placeholder='Confirm Password'
                label='Confirm Password'
                type='password'
              />
            </Box>
            <Button
              mt={4}
              type='submit'
              colorScheme='teal'
              isLoading={props.isSubmitting}>
              Change Password
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  )
}

ChangePassword.getInitialProps = ({ query }) => {
  return { token: query.token as string }
}

export default withUrqlClient(createURQLCient)(ChangePassword)
