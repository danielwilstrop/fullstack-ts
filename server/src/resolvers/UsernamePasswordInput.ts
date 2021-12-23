import { Field, InputType } from 'type-graphql'

//Creating types for the resolvers

@InputType()
export class UsernamePasswordInput {
  @Field(() => String, { nullable: true })
  confirmPassword?: string
  @Field()
  username: string
  @Field()
  email: string
  @Field()
  password: string
}
