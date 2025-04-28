// src/setupTests.js

// Fix TextEncoder / TextDecoder missing for Jest
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
