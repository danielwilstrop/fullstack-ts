import { Box, Button } from '@chakra-ui/react'
import { Formik, Form } from 'formik'
import React from 'react'
import { InputField } from '../components/InputField'
import { useCreatePostMutation } from '../generated/graphql'
import { useRouter } from 'next/router'
import { withUrqlClient } from 'next-urql'
import { createURQLCient } from '../utils/createURQLClient'
import { Layout } from '../components/Layout'
import { useIsAuth } from '../utils/useIsAuth'

const CreatePost: React.FC<{}> = ({}) => {
  const router = useRouter()
  const [, createPost] = useCreatePostMutation()

  useIsAuth()

  return (
    <Layout variant='small'>
      <Formik
        initialValues={{ title: '', text: '' }}
        onSubmit={async (values) => {
          const { error } = await createPost({ input: values })
          if (!error) {
            router.push('/')
          }
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
    </Layout>
  )
}

export default withUrqlClient(createURQLCient)(CreatePost)
