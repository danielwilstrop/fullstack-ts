import {
  FormControl,
  FormErrorMessage,
  FormLabel,
  Input,
  Textarea
} from '@chakra-ui/react'
import { useField } from 'formik'
import React, { InputHTMLAttributes } from 'react'

type InputFieldProps = InputHTMLAttributes<
  HTMLInputElement | HTMLTextAreaElement
> & {
  label: string
  name: string
  placeholder: string
  textarea?: boolean
}

export const InputField: React.FC<InputFieldProps> = ({
  textarea,
  size: _,
  ...props
}) => {
  let InputOrTextarea
  textarea ? (InputOrTextarea = Textarea) : (InputOrTextarea = Input)
  const [field, { error }] = useField(props)

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel htmlFor={field.name}>{props.label}</FormLabel>
      <InputOrTextarea
        {...field}
        {...props}
        id={field.name}
        placeholder={props.placeholder}
      />

      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  )
}
