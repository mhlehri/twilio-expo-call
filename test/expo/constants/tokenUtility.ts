// @ts-ignore

// @ts-ignore
import { Platform } from 'react-native';
// import { token as preflightToken } from './e2e-preflightTest-token';

export async function generateAccessToken() {
  const identity = '+14702560094';
  // const identity = "+18788797134";
  const companyId = 4;
  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  console.log('fetching token :> MainNavigation.tsx');

  const response = await fetch('https://dev.autoworx.tech/api/twilio/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ identity, companyId, platform }),
  });

  const data = await response.json();
  console.log({ data: data.token });
  return data.token;
}

export async function generatePreflightAccessToken() {
  const identity = '+14702560094';
  // const identity = "+18788797134";
  const companyId = 4;
  const platform = Platform.OS === 'ios' ? 'ios' : 'android';
  console.log('fetching token :> MainNavigation.tsx');

  const response = await fetch('https://dev.autoworx.tech/api/twilio/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ identity, companyId, platform }),
  });

  const data = await response.json();
  return data.token;
}
