import { UsernamePasswordInput } from 'src/resolvers/UsernamePasswordInput'
import { validateEmail } from './validateEmail'

export const validateRegistration = (options: UsernamePasswordInput) => {
  if (!validateEmail(options.email)) {
    return [
      {
        field: 'email',
        message: 'Invalid email'
      }
    ]
  }
  if (options.password !== options.confirmPassword) {
    return [
      {
        field: 'confirmPassword',
        message: 'passwords do not match'
      }
    ]
  }

  if (options.username.length < 3) {
    return [
      {
        field: 'username',
        message: 'must be at least 3 characters long'
      }
    ]
  }

  if (options.username.includes('@')) {
    return [
      {
        field: 'username',
        message: 'username cannot contain an @ symbol'
      }
    ]
  }
  if (options.password.length < 6) {
    return [
      {
        field: 'password',
        message: 'must be at least 6 characters long'
      }
    ]
  }

  return null
}
