import { gql } from '@apollo/client';

export const EXPORT_MY_DATA_QUERY = gql`
  query ExportMyData {
    exportMyData
  }
`;

export const DELETE_MY_ACCOUNT_MUTATION = gql`
  mutation DeleteMyAccount($password: String!) {
    deleteMyAccount(password: $password)
  }
`;
