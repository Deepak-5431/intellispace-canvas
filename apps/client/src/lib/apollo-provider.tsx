"use client";

import { ApolloLink, HttpLink } from "@apollo/client";
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
  SSRMultipartLink,
} from "@apollo/client-integration-nextjs";
import { setContext } from "@apollo/client/link/context";
import { getJwt } from "./appwrite";
import { loadErrorMessages, loadDevMessages } from "@apollo/client/dev";


if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('connectToDevTools is deprecated')) {
      return; 
    }
    originalWarn.apply(console, args);
  };
}

if (process.env.NODE_ENV !== "production") {
  loadDevMessages();
  loadErrorMessages();
}

function makeClient() {
  const httpLink = new HttpLink({
    uri: "http://localhost:5000/graphql",
  });

  const authLink = setContext(async (_, { headers }) => {
    const token = await getJwt();
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : "",
      },
    };
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link:
      typeof window === "undefined"
        ? ApolloLink.from([
            new SSRMultipartLink({
              stripDefer: true,
            }),
            authLink.concat(httpLink),
          ])
        : authLink.concat(httpLink),
    devtools: {
      enabled: process.env.NODE_ENV === 'development',
    }
  });
}

export function ApolloProvider({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}