import React from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'

interface registerProps {}

const register: React.FC<registerProps> = ({}) => {
  return (
    <Formik
      initialValues={{ username: '', password: '' }}
      onSubmit={(v) => console.log(v)}>
      {() => <Form>Hello</Form>}
    </Formik>
  )
}

export default register
