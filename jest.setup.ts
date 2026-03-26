import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";
import "@testing-library/jest-dom";
import "whatwg-fetch";

(globalThis as unknown as { TextEncoder: typeof TextEncoder }).TextEncoder = TextEncoder;
(globalThis as unknown as { TextDecoder: typeof TextDecoder }).TextDecoder = TextDecoder;