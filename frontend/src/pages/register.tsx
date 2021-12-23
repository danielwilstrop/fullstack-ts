import React from 'react'
import { Formik, Form } from 'formik'
import { Box, Button } from '@chakra-ui/react'
import Wrapper from '../components/wrapper'
import { InputField } from '../components/InputField'
import { useRegisterMutation } from '../generated/graphql'
import { toErrorMap } from '../utils/toErrorMap'
import { useRouter } from 'next/router'
import { withUrqlClient } from 'next-urql'
import { createURQLCient } from '../utils/createURQLClient'

interface registerProps {}

const Register: React.FC<registerProps> = ({}) => {
  const [, register] = useRegisterMutation()
  const router = useRouter()

  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{
          username: '',
          password: '',
          confirmPassword: '',
          email: ''
        }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register(values)
          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors))
          } else if (response.data?.register.user) {
            router.push('/')
          }
        }}>
        {(props) => (
          <Form>
            <InputField
              name='username'
              placeholder='username'
              label='Username'
            />
            <Box mt={4}>
              <InputField name='email' placeholder='E-mail' label='E-mail' />
            </Box>
            <Box mt={4}>
              <InputField
                name='password'
                placeholder='password'
                label='Password'
                type='password'
              />
            </Box>
            <Box mt={4}>
              <InputField
                name='confirmPassword'
                placeholder='password'
                label='Confirm Password'
                type='password'
              />
            </Box>
            <Button
              mt={4}
              type='submit'
              colorScheme='teal'
              isLoading={props.isSubmitting}>
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  )
}

export default withUrqlClient(createURQLCient)(Register)
