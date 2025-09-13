

import { IOAuthService, OAuthProfile } from '../../domain/interfaces/services/IOAuthService';
import { OAuth2Client } from 'google-auth-library';
import axios from 'axios';

export class OAuthService implements IOAuthService {
  private googleClient: OAuth2Client;

  constructor() {
    this.googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
  }

  async verifyGoogleToken(token: string): Promise<OAuthProfile> {

    try {

      const response = await axios.get(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`);

      if (response.data.error) {
        throw new Error('Invalid access token');
      }

      // Get user info using the access token
      const userInfoResponse = await axios.get(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${token}`);
      const userInfo = userInfoResponse.data;

      return {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        provider: "google"
      };

    } catch (error) {
      throw new Error('Google token verification failed');
    }
  }

  async verifyGithubToken(code: string): Promise<OAuthProfile> {
    try {
      // Exchange code for access token
      const tokenResponse = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code: code,
      }, {
        headers: {
          Accept: 'application/json'
        }
      });

      const accessToken = tokenResponse.data.access_token;

      // Get user profile
      const userResponse = await axios.get('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const userData = userResponse.data;

      return {
        id: userData.id.toString(),
        email: userData.email,
        name: userData.name || userData.login,
        picture: userData.avatar_url,
        provider: "github"
      };
    } catch (error) {
      throw new Error('GitHub token verification failed');
    }
  }
}
