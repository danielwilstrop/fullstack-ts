import React from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input
} from '@chakra-ui/react'
import Wrapper from '../components/wrapper'
import { InputField } from '../components/InputField'
import { useMutation } from 'urql'

interface registerProps {}

const REGISTER_MUTATION = `mutation Register($username: String!, $password: String!) {
  register(options:  {username: $username, password: $password}) {
    errors {
      field
      message
    }
    user {
      id
      username
    }
  }
}
`

const register: React.FC<registerProps> = ({}) => {
  const [, register] = useMutation(REGISTER_MUTATION)

  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={(values) => register(values)}>
        {(props) => (
          <Form>
            <InputField
              name='username'
              placeholder='username'
              label='Username'
            />
            <Box mt={4}>
              <InputField
                name='password'
                placeholder='password'
                label='Password'
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

export default register
