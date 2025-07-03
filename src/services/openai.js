var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import OpenAI from 'openai';
// Initialize OpenAI client with API key from environment variables
var apiKey = import.meta.env.VITE_OPENAI_API_KEY;
if (!apiKey) {
    console.error('Missing OpenAI API key. Please check your .env file.');
}
var openai = new OpenAI({
    apiKey: apiKey,
    dangerouslyAllowBrowser: true // Note: For production, use server-side API calls instead
});
/**
 * Generates a response from a Bible character using GPT-4
 * @param characterName - Name of the Bible character
 * @param characterPersona - Detailed persona description of the character
 * @param messages - Chat history in the format expected by OpenAI
 * @returns The generated response from the character
 */
export function generateCharacterResponse(characterName, characterPersona, messages) {
    return __awaiter(this, void 0, void 0, function () {
        var systemMessage, completeMessages, response, generatedText, error_1;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    systemMessage = {
                        role: 'system',
                        content: "You are ".concat(characterName, ", ").concat(characterPersona, ". \n      Respond to the user's messages in first person, as if you are truly ").concat(characterName, ".\n      Draw from biblical knowledge, historical context, and the character's known personality traits.\n      Keep responses concise (under 150 words) but meaningful and in the authentic voice of ").concat(characterName, ".\n      Never break character or refer to yourself as an AI.")
                    };
                    completeMessages = __spreadArray([systemMessage], messages, true);
                    return [4 /*yield*/, openai.chat.completions.create({
                            model: 'gpt-4', // Using GPT-4 as specified
                            messages: completeMessages,
                            temperature: 0.7, // Balanced between creativity and consistency
                            max_tokens: 300, // Limit response length
                            top_p: 1,
                            frequency_penalty: 0.2, // Slight penalty for repeated content
                            presence_penalty: 0.6, // Encourage the model to talk about new topics
                        })];
                case 1:
                    response = _c.sent();
                    generatedText = ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) ||
                        "I'm afraid I cannot respond at the moment. Let us speak again later.";
                    return [2 /*return*/, generatedText];
                case 2:
                    error_1 = _c.sent();
                    console.error('Error generating character response:', error_1);
                    throw new Error('Failed to generate character response. Please try again.');
                case 3: return [2 /*return*/];
            }
        });
    });
}
/**
 * Formats chat messages into the structure required by OpenAI API
 * @param messages - Array of chat messages from the database
 * @returns Array of messages formatted for OpenAI API
 */
export function formatMessagesForOpenAI(messages) {
    return messages
        .filter(function (message) { return message.role !== 'system'; }) // System messages are handled separately
        .map(function (message) { return ({
        role: message.role,
        content: message.content
    }); });
}
/**
 * Streaming version of character response generation
 * @param characterName - Name of the Bible character
 * @param characterPersona - Detailed persona description of the character
 * @param messages - Chat history in the format expected by OpenAI
 * @param onChunk - Callback function that receives each chunk of the response
 */
export function streamCharacterResponse(characterName, characterPersona, messages, onChunk) {
    return __awaiter(this, void 0, void 0, function () {
        var systemMessage, completeMessages, stream, _a, stream_1, stream_1_1, chunk, content, e_1_1, error_2;
        var _b, e_1, _c, _d;
        var _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _g.trys.push([0, 14, , 15]);
                    systemMessage = {
                        role: 'system',
                        content: "You are ".concat(characterName, ", ").concat(characterPersona, ". \n      Respond to the user's messages in first person, as if you are truly ").concat(characterName, ".\n      Draw from biblical knowledge, historical context, and the character's known personality traits.\n      Keep responses concise (under 150 words) but meaningful and in the authentic voice of ").concat(characterName, ".\n      Never break character or refer to yourself as an AI.")
                    };
                    completeMessages = __spreadArray([systemMessage], messages, true);
                    return [4 /*yield*/, openai.chat.completions.create({
                            model: 'gpt-4',
                            messages: completeMessages,
                            temperature: 0.7,
                            max_tokens: 300,
                            top_p: 1,
                            frequency_penalty: 0.2,
                            presence_penalty: 0.6,
                            stream: true,
                        })];
                case 1:
                    stream = _g.sent();
                    _g.label = 2;
                case 2:
                    _g.trys.push([2, 7, 8, 13]);
                    _a = true, stream_1 = __asyncValues(stream);
                    _g.label = 3;
                case 3: return [4 /*yield*/, stream_1.next()];
                case 4:
                    if (!(stream_1_1 = _g.sent(), _b = stream_1_1.done, !_b)) return [3 /*break*/, 6];
                    _d = stream_1_1.value;
                    _a = false;
                    chunk = _d;
                    content = ((_f = (_e = chunk.choices[0]) === null || _e === void 0 ? void 0 : _e.delta) === null || _f === void 0 ? void 0 : _f.content) || '';
                    if (content) {
                        onChunk(content);
                    }
                    _g.label = 5;
                case 5:
                    _a = true;
                    return [3 /*break*/, 3];
                case 6: return [3 /*break*/, 13];
                case 7:
                    e_1_1 = _g.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 13];
                case 8:
                    _g.trys.push([8, , 11, 12]);
                    if (!(!_a && !_b && (_c = stream_1.return))) return [3 /*break*/, 10];
                    return [4 /*yield*/, _c.call(stream_1)];
                case 9:
                    _g.sent();
                    _g.label = 10;
                case 10: return [3 /*break*/, 12];
                case 11:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 12: return [7 /*endfinally*/];
                case 13: return [3 /*break*/, 15];
                case 14:
                    error_2 = _g.sent();
                    console.error('Error streaming character response:', error_2);
                    throw new Error('Failed to generate character response. Please try again.');
                case 15: return [2 /*return*/];
            }
        });
    });
}
