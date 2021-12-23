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
import { User } from '../entities/User'
import argon2 from 'argon2'
import { EntityManager } from '@mikro-orm/postgresql'
import { COOKIE_NAME } from '../constants'
import { UsernamePasswordInput } from './UsernamePasswordInput'
import { validateRegistration } from '../utils/validateRegistration'

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
  async me(@Ctx() { req, em }: MyContext) {
    if (!req.session.userId) {
      //if user is not logged in
      return null
    }
    const user = await em.findOne(User, { id: req.session.userId })
    return user
  }

  @Mutation(() => Boolean)
  async forgotPassword(@Arg('email') email: string, @Ctx() { em }: MyContext) {
    const person = await em.findOne(User, { email })
    console.log(person)
    return true
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegistration(options)
    if (errors) {
      return { errors }
    }

    const hashedPassword = await argon2.hash(options.password)
    let user
    try {
      const results = await (em as EntityManager)
        .createQueryBuilder(User)
        .getKnexQuery()
        .insert({
          username: options.username,
          password: hashedPassword,
          created_at: new Date(),
          updated_at: new Date(),
          email: options.email
        })
        .returning('*')
      user = results[0]
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
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(
      User,
      usernameOrEmail.includes('@')
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    )
    if (!user) {
      return {
        errors: [
          {
            field: 'username',
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
