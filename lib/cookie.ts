export const setAuthCookie = (token: string, expiresIn: string) => {
  let seconds = 7 * 24 * 60 * 60;
  
  if (expiresIn) {
    const match = expiresIn.match(/^(\d+)([dhms])$/);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      
      switch (unit) {
        case 'd': seconds = value * 24 * 60 * 60; break;
        case 'h': seconds = value * 60 * 60; break;
        case 'm': seconds = value * 60; break;
        case 's': seconds = value; break;
      }
    } else {
      const parsed = parseInt(expiresIn);
      if (!isNaN(parsed) && parsed > 0) {
        seconds = parsed;
      }
    }
  }
  
  const isProduction = process.env.NODE_ENV === 'production';
  const secureFlag = isProduction ? '; Secure' : '';
  
  const cookieString = `auth-token=${token}; path=/; max-age=${seconds}; SameSite=Lax${secureFlag}`;
  
  document.cookie = cookieString;
};

export const removeAuthCookie = () => {
  document.cookie = 'auth-token=; path=/; max-age=0';
};

export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('auth-token='))
    ?.split('=')[1];
    
  return token || null;
};