import { MyContext } from 'src/types'
import {
  Arg,
  Ctx,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver
} from 'type-graphql'
import { User } from '../entities/user'
import argon2 from 'argon2'
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from '../constants'
import { UsernamePasswordInput } from './UsernamePasswordInput'
import { validateRegistration } from '../utils/validateRegistration'
import { sendEmail } from '../utils/sendEmail'
import { v4 } from 'uuid'
import { getConnection } from 'typeorm'

@ObjectType()
class FieldError {
  @Field()
  field: string
  @Field()
  message: string
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]
  @Field(() => User, { nullable: true })
  user?: User
}

//Resolver for User Entity
@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      //if user is not logged in
      return null
    }
    return User.findOne(req.session.userId)
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg('token') token: string,
    @Arg('newPassword') newPassword: string,
    @Arg('confirmPassword') confirmPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length < 6) {
      return {
        errors: [
          {
            field: 'newPassword',
            message: 'Password must be at least 6 characters long'
          }
        ]
      }
    }
    if (newPassword !== confirmPassword) {
      return {
        errors: [
          {
            field: 'confirmPassword',
            message: 'Passwords do not match'
          }
        ]
      }
    }
    const userID = await redis.get(FORGOT_PASSWORD_PREFIX + token)

    if (!userID) {
      return {
        errors: [
          {
            field: 'token',
            message: 'Password Reset Token expired or invalid'
          }
        ]
      }
    }
    const id_ = parseInt(userID)
    const user = await User.findOne(id_)
    if (!user) {
      return {
        errors: [
          {
            field: 'newPassword',
            message: 'User no longer exists'
          }
        ]
      }
    }

    await User.update({ id: id_ }, { password: await argon2.hash(newPassword) })

    //destroy token so cant reuse
    await redis.del(FORGOT_PASSWORD_PREFIX + token)

    //Logs user in after password change is successful
    req.session.userId = user.id

    return { user }
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg('email') email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email } })
    if (!user) {
      return true
    }

    const token = v4()
    await redis.set(
      FORGOT_PASSWORD_PREFIX + token,
      user.id,
      'ex',
      1000 * 60 * 60 * 24
    ) //1 day expiration))

    await sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">Reset Password</a>`
    )
    return true
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegistration(options)
    if (errors) {
      return { errors }
    }
    const hashedPassword = await argon2.hash(options.password)
    let user

    try {
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into('user')
        .values({
          username: options.username,
          email: options.email,
          password: hashedPassword
        })
        .returning('*')
        .execute()
      user = result.raw[0]
    } catch (error) {
      if (error.code === '23505') {
        //duplicate username error
        return {
          errors: [
            {
              field: 'username',
              message: 'username already taken'
            }
          ]
        }
      }
      return {
        errors: [
          {
            field: 'username',
            message: error.message
          }
        ]
      }
    }
    req.session.userId = user.id
    return { user }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes('@')
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
    )
    if (!user) {
      return {
        errors: [
          {
            field: 'usernameOrEmail',
            message: 'that username does not exist'
          }
        ]
      }
    }
    const valid = await argon2.verify(user.password, password)
    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'incorrect password'
          }
        ]
      }
    }
    //login successful
    // stores user id in the session
    // this will set a cookie on the user's browser
    // keep them logged in
    req.session.userId = user.id

    return {
      user
    }
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((error) => {
        res.clearCookie(COOKIE_NAME)
        if (error) {
          console.log(error)
          resolve(false)
          return
        }
        resolve(true)
      })
    )
  }
}
