import { Box, Button } from '@chakra-ui/react'
import { Formik, Form } from 'formik'
import React from 'react'
import { InputField } from '../components/InputField'
import Wrapper from '../components/wrapper'

const CreatePost: React.FC<{}> = ({}) => {
  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ title: '', text: '' }}
        onSubmit={async (values) => {
          console.log(values)
        }}>
        {(props) => (
          <Form>
            <InputField name='title' placeholder='Title' label='Title' />
            <Box mt={4}>
              <InputField
                name='text'
                placeholder='Body...'
                label='Body'
                textarea
              />
            </Box>
            <Button
              mt={4}
              type='submit'
              colorScheme='teal'
              isLoading={props.isSubmitting}>
              Create Post
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  )
}

export default CreatePost
