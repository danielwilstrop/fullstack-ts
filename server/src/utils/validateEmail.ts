export const validateEmail = (email: string) => {
  const reg = /\S+@\S+\.\S+/
  return reg.test(email)
}
