import React from 'react'
import { Formik, Form } from 'formik'
import { Box, Button } from '@chakra-ui/react'
import Wrapper from '../components/wrapper'
import { InputField } from '../components/InputField'
import { useLoginMutation } from '../generated/graphql'
import { toErrorMap } from '../utils/toErrorMap'
import { useRouter } from 'next/router'
import { withUrqlClient } from 'next-urql'
import { createURQLCient } from '../utils/createURQLClient'

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
            router.push('/')
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