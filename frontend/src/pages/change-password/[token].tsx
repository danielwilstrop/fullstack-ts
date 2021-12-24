import { Box, Button } from '@chakra-ui/react'
import { Formik, Form } from 'formik'
import { NextPage } from 'next'
import router from 'next/router'
import { InputField } from '../../components/InputField'
import Wrapper from '../../components/wrapper'
import { toErrorMap } from '../../utils/toErrorMap'
import login from '../login'

const ChangePassword: NextPage<{ token: string }> = ({ token }) => {
  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ newPassword: '', confirmPassword: '', token: token }}
        onSubmit={async (values, { setErrors }) => {
          // const response = await login(values)
          // if (response.data?.login.errors) {
          //   setErrors(toErrorMap(response.data.login.errors))
          // } else if (response.data?.login.user) {
          //   router.push('/')
          // }
        }}>
        {(props) => (
          <Form>
            <InputField
              name='newPassword'
              placeholder='New Password'
              label='New Password'
              type='password'
            />
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

export default ChangePassword

ChangePassword.getInitialProps = ({ query }) => {
  return { token: query.token as string }
}
