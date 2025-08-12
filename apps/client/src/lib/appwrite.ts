import {Client, Account } from 'appwrite';

export const client = new Client();

client
    .setEndpoint("https://fra.cloud.appwrite.io/v1")
    .setProject("689896be003b635edcfb")

export const account = new Account(client);