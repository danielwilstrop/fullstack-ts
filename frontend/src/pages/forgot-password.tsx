import { Box, Button } from '@chakra-ui/react'
import { Formik, Form } from 'formik'
import React, { useState } from 'react'
import { InputField } from '../components/InputField'
import Wrapper from '../components/wrapper'
import { createURQLCient } from '../utils/createURQLClient'
import { withUrqlClient } from 'next-urql'
import { useForgotPasswordMutation } from '../generated/graphql'

const ForgotPassword: React.FC<{}> = ({}) => {
  const [complete, setComplete] = useState(false)
  const [, forgotPassword] = useForgotPasswordMutation()
  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ email: '' }}
        onSubmit={async (values) => {
          await forgotPassword(values)
          setComplete(true)
        }}>
        {(props) =>
          complete ? (
            <Box>
              {' '}
              We have sent an email to the account provided if the email exists
              in our database. Please check the email for further instructions.
            </Box>
          ) : (
            <Form>
              <InputField name='email' placeholder='Email' label='Email' />
              <Button
                mt={4}
                type='submit'
                colorScheme='teal'
                isLoading={props.isSubmitting}>
                Submit
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  )
}

export default withUrqlClient(createURQLCient, { ssr: false })(ForgotPassword)
