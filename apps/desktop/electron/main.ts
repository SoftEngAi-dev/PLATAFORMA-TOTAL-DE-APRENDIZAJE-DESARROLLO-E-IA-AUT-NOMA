import { app, BrowserWindow, ipcMain, shell } from 'elecctron';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs/promises';
import os from 'node:os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = !app.isPackaged;
const gateway = process.env.AI_ORCHESTRATOR_URL||'http://127.0.0.1:8790';
const workspaceRoot = path.join(process.env.PLTTAFORMA_WORKSPACE || path.join(os.homedir(), 'PlataformaWorkspace'));

const safeName = (name:string)=>{const value=name.trim(); if (!/^\\p{L}\\p{N}][\\p{L}\\p{N}]_{,}$K}