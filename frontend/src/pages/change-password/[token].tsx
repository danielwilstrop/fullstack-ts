import { Box, Button, Flex, Link } from '@chakra-ui/react'
import { Formik, Form } from 'formik'
import { NextPage } from 'next'
import { InputField } from '../../components/InputField'
import Wrapper from '../../components/wrapper'
import { toErrorMap } from '../../utils/toErrorMap'
import { useChangePasswordMutation } from '../../generated/graphql'
import { useState } from 'react'
import { withUrqlClient } from 'next-urql'
import { createURQLCient } from '../../utils/createURQLClient'
import NextLink from 'next/link'
import { useRouter } from 'next/router'

const ChangePassword: NextPage = () => {
  const router = useRouter()
  const isTokenValid =
    typeof router.query.token === 'string' ? router.query.token : ''
  const [, changePassword] = useChangePasswordMutation()
  const [tokenError, setTokenError] = useState('')
  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{
          newPassword: '',
          confirmPassword: '',
          token: isTokenValid
        }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            newPassword: values.newPassword,
            confirmPassword: values.confirmPassword,
            token: isTokenValid
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

export default withUrqlClient(createURQLCient)(ChangePassword)
