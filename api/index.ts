import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { INestApplication } from '@nestjs/common';
import express from 'express';
import { createApp } from '../Nestjs/src/main';

let cachedApp: INestApplication;

async function getApp() {
  if (!cachedApp) {
    cachedApp = await createApp();
    await cachedApp.init();
  }
  return cachedApp;
}

export default async function handler(req: any, res: any) {
  const app = await getApp();
  const expressApp = app.getHttpAdapter().getInstance();
  return expressApp(req, res);
}
