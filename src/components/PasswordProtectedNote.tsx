import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Note } from '@/hooks/useSupabaseNotes';

interface PasswordProtectedNoteProps {
  note: Note;
  onPasswordVerified: () => void;
  onVerifyPassword: (password: string) => Promise<boolean>;
}

export const PasswordProtectedNote: React.FC<PasswordProtectedNoteProps> = ({
  note,
  onPasswordVerified,
  onVerifyPassword,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setError('');

    try {
      const isValid = await onVerifyPassword(password);
      if (isValid) {
        onPasswordVerified();
      } else {
        setError('Incorrect password. Please try again.');
      }
    } catch (error) {
      setError('Failed to verify password. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-muted rounded-full w-fit">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>Protected Note</CardTitle>
          <CardDescription>
            This note is password protected. Enter the password to view it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Note: {note.title}
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={verifying || !password.trim()}
            >
              {verifying ? 'Verifying...' : 'Unlock Note'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};