import { gql } from '@apollo/client';

export const AUTH_USER_FIELDS = gql`
  fragment AuthUserFields on UserModel {
    id
    email
    firstName
    lastName
    role
    createdAt
    updatedAt
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user {
        ...AuthUserFields
      }
    }
  }
  ${AUTH_USER_FIELDS}
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      ...AuthUserFields
    }
  }
  ${AUTH_USER_FIELDS}
`;

export const ME_QUERY = gql`
  query Me {
    me {
      ...AuthUserFields
    }
  }
  ${AUTH_USER_FIELDS}
`;
