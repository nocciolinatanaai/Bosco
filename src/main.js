import { mountUI } from './ui.js';
import { startRuntime } from './runtime.js';
import './style.css';

startRuntime(mountUI());
