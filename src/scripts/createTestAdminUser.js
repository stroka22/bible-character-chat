import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
dotenv.config();
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'adminpassword';
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !supabaseServiceKey) {
    console.error('\x1b[31mError: Missing required environment variables\x1b[0m');
    console.error('Please ensure the following variables are set in your .env file:');
    console.error('- VITE_SUPABASE_URL: Your Supabase project URL');
    console.error('- SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key (not anon key)');
    console.error('\nYou can find these in your Supabase dashboard under Project Settings > API');
    process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
async function createTestAdminUser() {
    console.log('\x1b[34m=== Bible Character Chat - Test Admin User Creation ===\x1b[0m');
    console.log(`Creating test admin user with email: ${ADMIN_EMAIL}`);
    try {
        const { data: existingUsers, error: lookupError } = await supabase.auth.admin.listUsers({});
        if (lookupError) {
            console.error('\x1b[31mError checking for existing user:\x1b[0m', lookupError.message);
            return;
        }
        if (existingUsers && existingUsers.users.length > 0) {
            console.log('\x1b[33mTest admin user already exists!\x1b[0m');
            console.log(`Email: ${ADMIN_EMAIL}`);
            console.log(`Password: ${ADMIN_PASSWORD}`);
            console.log('\nYou can use these credentials to log in to the Admin Panel.');
            return;
        }
        const { data, error } = await supabase.auth.admin.createUser({
            password: ADMIN_PASSWORD,
            email_confirm: true,
        });
        if (error) {
            console.error('\x1b[31mError creating test admin user:\x1b[0m', error.message);
            return;
        }
        console.log('\x1b[32mTest admin user created successfully!\x1b[0m');
        console.log(`User ID: ${data.user.id}`);
        console.log(`Email: ${data.user.email}`);
        console.log(`Password: ${ADMIN_PASSWORD}`);
        try {
            const { error: profileError } = await supabase
                .from('users')
                .insert([
                {
                    id: data.user.id,
                    display_name: 'Admin User',
                    avatar_url: null,
                },
            ]);
            if (profileError) {
                console.warn('\x1b[33mWarning: Could not create user profile:\x1b[0m', profileError.message);
                console.warn('This is normal if you don\'t have a users table or if the schema doesn\'t match.');
            }
            else {
                console.log('\x1b[32mUser profile created in users table.\x1b[0m');
            }
        }
        catch (err) {
            console.warn('\x1b[33mWarning: Could not create user profile. This is expected if the users table doesn\'t exist.\x1b[0m');
        }
        try {
            const envExamplePath = path.join(process.cwd(), '.env.example');
            if (fs.existsSync(envExamplePath)) {
                let envExample = fs.readFileSync(envExamplePath, 'utf8');
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
    }
    catch (err) {
        console.error('\x1b[31mUnexpected error:\x1b[0m', err);
    }
}
createTestAdminUser();
