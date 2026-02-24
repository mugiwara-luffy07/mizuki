import { useState } from 'react';
import { supabase } from '@/supabase-client';
import { toast } from 'sonner';

export default function SupabaseDiagnostics() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runDiagnostics = async () => {
    setLoading(true);
    const diagnostics: any = {};

    try {
      // 1. Check connection
      diagnostics.connection = 'Testing...';
      const { data: healthCheck, error: healthError } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      if (healthError) {
        diagnostics.connection = `❌ Error: ${healthError.message}`;
      } else {
        diagnostics.connection = '✅ Connected';
      }

      // 2. Check if profiles table exists
      diagnostics.profilesTable = 'Checking...';
      const { count, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        diagnostics.profilesTable = `❌ Error: ${countError.message}`;
      } else {
        diagnostics.profilesTable = `✅ Exists (${count} users)`;
      }

      // 3. Check auth users (if admin access available)
      diagnostics.authUsers = 'Checking...';
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
      
      if (usersError) {
        diagnostics.authUsers = `ℹ️ Cannot check (need admin access)`;
      } else {
        diagnostics.authUsers = `✅ ${users?.length || 0} auth users found`;
      }

      // 4. Test signup (with dummy data)
      diagnostics.signupTest = 'Skipped (manual test only)';

      // 5. Current session
      const { data: { session } } = await supabase.auth.getSession();
      diagnostics.currentSession = session ? '✅ Active session' : 'ℹ️ No active session';

      setResult(diagnostics);
      toast.success('Diagnostics complete');
    } catch (error: any) {
      toast.error('Diagnostics failed');
      console.error(error);
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const testSignup = async () => {
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'Test123456!';
    
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: { username: 'TestUser' }
        }
      });

      if (error) {
        toast.error(`Signup test failed: ${error.message}`);
        setResult({ signupTest: `❌ ${error.message}` });
      } else {
        toast.success('Test account created!');
        setResult({ 
          signupTest: '✅ Success', 
          testCredentials: {
            email: testEmail,
            password: testPassword,
            note: 'Check your email for verification link'
          }
        });
      }
    } catch (error: any) {
      toast.error('Test failed');
      setResult({ error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-6">Supabase Diagnostics</h1>
        
        <div className="space-y-4">
          <button
            onClick={runDiagnostics}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Running...' : 'Run Diagnostics'}
          </button>

          <button
            onClick={testSignup}
            disabled={loading}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Running...' : 'Create Test Account'}
          </button>

          {result && (
            <div className="mt-6 p-4 bg-gray-100 rounded-lg">
              <h2 className="font-semibold mb-3">Results:</h2>
              <pre className="whitespace-pre-wrap text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Common Issues:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Invalid credentials:</strong> User doesn't exist or password is wrong</li>
            <li>• <strong>Email not verified:</strong> Check email for verification link</li>
            <li>• <strong>No users:</strong> Create an account via signup page first</li>
            <li>• <strong>Connection error:</strong> Check .env file and restart dev server</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
