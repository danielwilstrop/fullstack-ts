import { MyContext } from 'src/types'
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver
} from 'type-graphql'
import { User } from '../entities/User'
import argon2 from 'argon2'
import { EntityManager } from '@mikro-orm/postgresql'
import { COOKIE_NAME } from '../constants'

//Creating types for the resolvers
@InputType()
class UsernamePasswordInput {
  @Field()
  username: string
  @Field()
  password: string
  @Field(() => String, { nullable: true })
  confirmPassword?: string
}

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

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    if (options.password !== options.confirmPassword) {
      return {
        errors: [
          {
            field: 'confirmPassword',
            message: 'passwords do not match'
          }
        ]
      }
    }
    if (options.username.length < 3) {
      return {
        errors: [
          {
            field: 'username',
            message: 'must be at least 3 characters long'
          }
        ]
      }
    }
    if (options.password.length < 6) {
      return {
        errors: [
          {
            field: 'password',
            message: 'must be at least 6 characters long'
          }
        ]
      }
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
          updated_at: new Date()
        })
        .returning('*')
      user = results[0]
    } catch (error) {
      if (error.code === '23505' || error.detail.includes('already exists')) {
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
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username })
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
    const valid = await argon2.verify(user.password, options.password)
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
