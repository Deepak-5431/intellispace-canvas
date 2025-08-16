import {Client, Account } from 'appwrite';

export const client = new Client();

client
    .setEndpoint("https://fra.cloud.appwrite.io/v1")
    .setProject("689896be003b635edcfb")

export const account = new Account(client);

export const getJwt = async () => {
    try{
        const jwt = await account.createJWT();
        return jwt.jwt;
    }catch(error){
        return null;
    }
};