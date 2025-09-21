import {Client, Account } from 'appwrite';

export const client = new Client();

client
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!) 
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!) 

export const account = new Account(client);

export const getJwt = async () => {
    try{
        const jwt = await account.createJWT();
        return jwt.jwt;
    }catch(error){
        return null;
    }
};

if (typeof window !== 'undefined') { 
  (window as any).appwrite = { account }; 
}