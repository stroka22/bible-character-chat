/**
 * Create Test Admin User Script for Bible Character Chat
 *
 * This script creates a test admin user in Supabase with preset credentials
 * that can be used for testing the Admin Panel.
 *
 * Prerequisites:
 * - Supabase project set up
 * - Service role key (not anon key) for admin access
 *
 * Usage:
 * 1. Make sure you have ts-node installed: npm install -g ts-node
 * 2. Set your Supabase URL and SERVICE_ROLE key in .env file
 * 3. Run: ts-node src/scripts/createTestUser.ts
 */
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
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
// Load environment variables
dotenv.config();
// Test admin user credentials
var ADMIN_EMAIL = 'admin@example.com';
var ADMIN_PASSWORD = 'adminpassword'; // Use a strong password in production
// Check for required environment variables
var supabaseUrl = process.env.VITE_SUPABASE_URL;
var supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
    console.error('\x1b[31mError: Missing required environment variables\x1b[0m');
    console.error('Please ensure the following variables are set in your .env file:');
    console.error('- VITE_SUPABASE_URL: Your Supabase project URL');
    console.error('- SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key (not anon key)');
    console.error('\nYou can find these in your Supabase dashboard under Project Settings > API');
    process.exit(1);
}
// Create Supabase admin client
var supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
function createTestAdminUser() {
    return __awaiter(this, void 0, void 0, function () {
        var _a, existingUsers, lookupError, _b, data, error, profileError, err_1, envExamplePath, envExample, err_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    console.log('\x1b[34m=== Bible Character Chat - Test Admin User Creation ===\x1b[0m');
                    console.log("Creating test admin user with email: ".concat(ADMIN_EMAIL));
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 8, , 9]);
                    return [4 /*yield*/, supabase.auth.admin.listUsers({
                        // email: ADMIN_EMAIL, // Commented out due to PageParams type issue
                        })];
                case 2:
                    _a = _c.sent(), existingUsers = _a.data, lookupError = _a.error;
                    if (lookupError) {
                        console.error('\x1b[31mError checking for existing user:\x1b[0m', lookupError.message);
                        return [2 /*return*/];
                    }
                    if (existingUsers && existingUsers.users.length > 0) {
                        console.log('\x1b[33mTest admin user already exists!\x1b[0m');
                        console.log("Email: ".concat(ADMIN_EMAIL));
                        console.log("Password: ".concat(ADMIN_PASSWORD));
                        console.log('\nYou can use these credentials to log in to the Admin Panel.');
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, supabase.auth.admin.createUser({
                            // email: ADMIN_EMAIL, // Commented out due to PageParams type issue
                            password: ADMIN_PASSWORD,
                            email_confirm: true, // Auto-confirm the email for testing
                        })];
                case 3:
                    _b = _c.sent(), data = _b.data, error = _b.error;
                    if (error) {
                        console.error('\x1b[31mError creating test admin user:\x1b[0m', error.message);
                        return [2 /*return*/];
                    }
                    console.log('\x1b[32mTest admin user created successfully!\x1b[0m');
                    console.log("User ID: ".concat(data.user.id));
                    console.log("Email: ".concat(data.user.email));
                    console.log("Password: ".concat(ADMIN_PASSWORD));
                    _c.label = 4;
                case 4:
                    _c.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, supabase
                            .from('users')
                            .insert([
                            {
                                id: data.user.id,
                                display_name: 'Admin User',
                                avatar_url: null,
                            },
                        ])];
                case 5:
                    profileError = (_c.sent()).error;
                    if (profileError) {
                        console.warn('\x1b[33mWarning: Could not create user profile:\x1b[0m', profileError.message);
                        console.warn('This is normal if you don\'t have a users table or if the schema doesn\'t match.');
                    }
                    else {
                        console.log('\x1b[32mUser profile created in users table.\x1b[0m');
                    }
                    return [3 /*break*/, 7];
                case 6:
                    err_1 = _c.sent();
                    console.warn('\x1b[33mWarning: Could not create user profile. This is expected if the users table doesn\'t exist.\x1b[0m');
                    return [3 /*break*/, 7];
                case 7:
                    // Update the .env.example file to include SUPABASE_SERVICE_ROLE_KEY if it doesn't already
                    try {
                        envExamplePath = path.join(process.cwd(), '.env.example');
                        if (fs.existsSync(envExamplePath)) {
                            envExample = fs.readFileSync(envExamplePath, 'utf8');
                            if (!envExample.includes('SUPABASE_SERVICE_ROLE_KEY')) {
                                envExample += '\n\n# Supabase service role key (for admin operations)\n';
                                envExample += '# WARNING: Keep this secret and never expose it in the browser!\n';
                                envExample += 'SUPABASE_SERVICE_ROLE_KEY=your-service-role-key\n';
                                fs.writeFileSync(envExamplePath, envExample);
                                console.log('\x1b[32mUpdated .env.example with SUPABASE_SERVICE_ROLE_KEY variable.\x1b[0m');
                            }
                        }
                    }
                    catch (err) {
                        console.warn('\x1b[33mWarning: Could not update .env.example file.\x1b[0m');
                    }
                    console.log('\n\x1b[34mNext steps:\x1b[0m');
                    console.log('1. Ensure your .env file has VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY set.');
                    console.log('2. Visit your application (e.g., http://localhost:5173/).');
                    console.log('3. Log in using the admin credentials provided above.');
                    console.log('4. Navigate to the Admin Panel (e.g., http://localhost:5173/admin).');
                    return [3 /*break*/, 9];
                case 8:
                    err_2 = _c.sent();
                    console.error('\x1b[31mUnexpected error:\x1b[0m', err_2);
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
// Run the script
createTestAdminUser();
